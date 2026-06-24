#!/usr/bin/env bash
# subagent-narrator.sh
#
# Claude Code Hook (PostToolUse / SubagentStop) - subagent の tool call を narration ファイルに追記する。
# RB-005 採用案。parent context への流入は stdout を空に保つことで防ぐ (`suppressOutput` 同等)。
#
# 入力: stdin に JSON (公式 docs https://code.claude.com/docs/en/hooks より)
#   .session_id, .transcript_path, .cwd, .hook_event_name, .tool_name, .tool_input
#   .agent_id, .agent_type (subagent 内のみ)
#
# 出力先:
#   - ファイル: ${CLAUDE_PROJECT_DIR}/.session-state/agent-narration.log (常時)
#   - stdout: 環境変数 ECC_NARRATION_INLINE=1 のときのみ JSON `{"systemMessage": ...}` を返す
#            (それ以外は完全に空、parent context 汚染ゼロ)
#
# 使い方は ../README.md §Hooks を参照。

set -euo pipefail

INPUT="$(cat || true)"
[ -z "$INPUT" ] && exit 0

have_jq() { command -v jq >/dev/null 2>&1; }

extract() {
  local key="$1" default="${2:-}"
  if have_jq; then
    printf '%s' "$INPUT" | jq -r "$key // empty" 2>/dev/null || printf '%s' "$default"
  else
    # jq 不在環境: 単純な grep フォールバック (best-effort, ネスト非対応)
    printf '%s' "$INPUT" | sed -n 's/.*"'"$(printf '%s' "$key" | sed 's/^\.//')"'"\s*:\s*"\([^"]*\)".*/\1/p' | head -1
  fi
}

agent_id=$(extract '.agent_id')
agent_type=$(extract '.agent_type' "main")
tool_name=$(extract '.tool_name' "?")
hook_event=$(extract '.hook_event_name' "?")
cwd=$(extract '.cwd')

summary=""
if have_jq; then
  summary=$(printf '%s' "$INPUT" | jq -r '
    .tool_input // {} |
    [
      (if .file_path then "file=\(.file_path)" else empty end),
      (if .command then "cmd=\((.command | tostring)[0:120])" else empty end),
      (if .pattern then "pat=\(.pattern)" else empty end),
      (if .url then "url=\(.url)" else empty end),
      (if .description then "desc=\(.description)" else empty end),
      (if .subagent_type then "subagent_type=\(.subagent_type)" else empty end),
      (if .prompt then "prompt=\((.prompt | tostring)[0:80])" else empty end)
    ] | join(" ")
  ' 2>/dev/null || true)
fi

log_dir="${CLAUDE_PROJECT_DIR:-${cwd:-$PWD}}/.session-state"
log_file="$log_dir/agent-narration.log"
mkdir -p "$log_dir" 2>/dev/null || true

ts=$(date -u +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || echo "?")

if [ -n "$agent_id" ]; then
  who="sub:${agent_type}:${agent_id:0:8}"
else
  who="main"
fi

line=$(printf '%s | %s | %s | %s | %s' "$ts" "$hook_event" "$who" "$tool_name" "$summary")
printf '%s\n' "$line" >> "$log_file" 2>/dev/null || true

# parent context 汚染ゼロが既定。
# ECC_NARRATION_INLINE=1 のときだけ UI に systemMessage を返す (= context にも流入する点に注意)。
if [ "${ECC_NARRATION_INLINE:-0}" = "1" ]; then
  esc=$(printf '%s' "$line" | sed 's/\\/\\\\/g; s/"/\\"/g')
  printf '{"systemMessage":"%s","suppressOutput":false}\n' "$esc"
fi

exit 0
