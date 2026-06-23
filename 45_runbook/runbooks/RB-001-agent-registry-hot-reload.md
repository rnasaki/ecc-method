---
id: RB-001-agent-registry-hot-reload
title: 新規 agent file は次セッションから有効 (Claude Code agent registry はホットリロード非対応)
category: pitfall
tags: [agent, registry, hot-reload, claude-code, session]
created: 2026-06-24
updated: 2026-06-24
last-verified: 2026-06-24
status: active
trigger: 新しい agent file を ~/.claude/agents/ 配下に作成したのに、現セッションで Agent ツールから "Agent type '...' not found" が出る。または ecc-orchestrator など自作 agent が呼べない。
expert-routing: [agent (general-purpose で代替可), Explore]
related: []
source: Claude Code agent invocation runtime behavior, 実機検証 (2026-06-24, ecc-method スモークテスト)
---

# 新規 agent file は次セッションから有効

## TL;DR (30 秒で読める結論)

Claude Code は **セッション起動時に agent registry を読み込む**。新規作成した `~/.claude/agents/<name>.md` は **次のセッションから有効**。現セッションで使うには、**既存 agent (`general-purpose` 等) に system prompt を Read させる形でシミュレート**するか、Claude Code を再起動する。

## 前提 (要権限・要環境)

- Claude Code (CLI / VS Code / Desktop / Web のいずれか)
- `~/.claude/agents/` ディレクトリへの書き込み権限
- 新規 agent file は frontmatter (`---`) 必須。`name` `description` `tools` `model` を含む

## 手順 (コピペ可能・冪等)

### パターン A: 次セッションを待つ (推奨)

```bash
# 1) agent file を作成
cat > ~/.claude/agents/<name>.md <<'EOF'
---
name: <name>
description: <用途>
tools: ["Read", "Write", "Edit", "Grep", "Glob", "Bash"]
model: opus
---

<本文 system prompt>
EOF

# 2) 現セッションは終了 (/exit や ctrl+c)

# 3) 新セッションを起動
claude  # または VS Code 拡張を再ロード

# 4) Agent ツールから呼ぶ
# 例: Agent(subagent_type="<name>", prompt="...")
```

### パターン B: 現セッションでシミュレート (急ぎの場合)

```
Agent(
  subagent_type="general-purpose",
  prompt="""
  あなたは <name> として動作してください。
  system prompt: ~/.claude/agents/<name>.md を Read で読み込み、
  その指示に従って以下のタスクを実行してください:

  <タスク>
  """
)
```

`general-purpose` agent は `*` 全ツール許可なので柔軟。ただし agent file 側の `tools` 制約は適用されない (制約付けたければ prompt で明示)。

## 検証 (成功条件)

- [ ] `ls ~/.claude/agents/<name>.md` でファイル存在確認
- [ ] frontmatter が `---` で囲まれているか確認 (`head -10 ~/.claude/agents/<name>.md`)
- [ ] 新セッション起動後、`Agent(subagent_type="<name>", prompt="ping")` が `not found` を返さない
- [ ] expected agent name のリストに `<name>` が含まれる (Agent ツールのエラーメッセージで `Available agents:` を見ると確認可)

## 失敗時のリカバリ

| 症状 | 原因 | 対処 |
|---|---|---|
| `Agent type '<name>' not found` | ホットリロード未対応 | パターン A (再起動) またはパターン B (general-purpose で代替) |
| frontmatter parse error | `---` の前後に空行・余計な文字 | `head -1` が `---` であることを確認 |
| `tools` 配列が無視される | YAML 形式不正 | `tools: ["Read", ...]` の JSON 配列形式で書く |
| 再起動しても認識されない | path 権限問題 | `chmod 644 ~/.claude/agents/<name>.md` |

## 関連

- [[RB-002-...]] (将来追加予定)
- 出典: Claude Code agent invocation 公式 docs (https://code.claude.com/docs/en/sub-agents, retrieved 2026-06-24)

## 変更履歴

| 日付 | 変更 | 理由 |
|---|---|---|
| 2026-06-24 | 初版 | ecc-orchestrator スモークテスト時に実機で踏み、汎用ハマりとして記録 |
