# subagent-narrator.ps1
#
# Claude Code Hook (PostToolUse / SubagentStop) - subagent の tool call を narration ファイルに追記する。
# Windows PowerShell 用 (bash 不在環境)。bash 版 subagent-narrator.sh と等価。
#
# 入力: stdin に JSON (公式 docs https://code.claude.com/docs/en/hooks)
# 出力:
#   - ファイル: $env:CLAUDE_PROJECT_DIR\.session-state\agent-narration.log
#   - stdout: 環境変数 ECC_NARRATION_INLINE=1 のときのみ {"systemMessage": ...} を返す
#
# 使い方は ../README.md §Hooks を参照。

$ErrorActionPreference = 'SilentlyContinue'

$raw = [Console]::In.ReadToEnd()
if ([string]::IsNullOrWhiteSpace($raw)) { exit 0 }

try {
    $j = $raw | ConvertFrom-Json
} catch {
    exit 0
}

$agentId   = $j.agent_id
$agentType = if ($j.agent_type) { $j.agent_type } else { 'main' }
$toolName  = if ($j.tool_name)  { $j.tool_name }  else { '?' }
$hookEvent = if ($j.hook_event_name) { $j.hook_event_name } else { '?' }
$cwd       = $j.cwd

$ti = $j.tool_input
$parts = @()
if ($ti) {
    if ($ti.file_path)      { $parts += "file=$($ti.file_path)" }
    if ($ti.command)        { $parts += "cmd=$([string]$ti.command).Substring(0, [Math]::Min(120, [string]$ti.command).Length)" }
    if ($ti.pattern)        { $parts += "pat=$($ti.pattern)" }
    if ($ti.url)            { $parts += "url=$($ti.url)" }
    if ($ti.description)    { $parts += "desc=$($ti.description)" }
    if ($ti.subagent_type)  { $parts += "subagent_type=$($ti.subagent_type)" }
    if ($ti.prompt) {
        $p = [string]$ti.prompt
        $parts += "prompt=$($p.Substring(0, [Math]::Min(80, $p.Length)))"
    }
}
$summary = ($parts -join ' ')

$root = if ($env:CLAUDE_PROJECT_DIR) { $env:CLAUDE_PROJECT_DIR } elseif ($cwd) { $cwd } else { (Get-Location).Path }
$logDir = Join-Path $root '.session-state'
$logFile = Join-Path $logDir 'agent-narration.log'
if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir -Force | Out-Null }

$ts = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
$who = if ($agentId) { "sub:${agentType}:$($agentId.Substring(0, [Math]::Min(8, $agentId.Length)))" } else { 'main' }
$line = "$ts | $hookEvent | $who | $toolName | $summary"

Add-Content -Path $logFile -Value $line -Encoding UTF8

if ($env:ECC_NARRATION_INLINE -eq '1') {
    $payload = @{ systemMessage = $line; suppressOutput = $false } | ConvertTo-Json -Compress
    [Console]::Out.Write($payload)
}

exit 0
