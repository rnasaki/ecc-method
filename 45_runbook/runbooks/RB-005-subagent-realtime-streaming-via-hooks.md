---
id: RB-005-subagent-realtime-streaming-via-hooks
title: subagent のリアルタイム中間出力 - Claude Code Hooks 経由でユーザー負荷ゼロのストリーミング観測
category: tooling
tags: [subagent, observability, hooks, streaming, realtime, codex-parity, deferred-verification]
created: 2026-06-24
updated: 2026-06-24
last-verified: 未検証
status: draft
trigger: subagent のリアルタイム中間出力を、parent context を汚染せず、ユーザーの追加操作なしに表示したい / Codex 風の日本語ストリーミング観測を Claude Code で再現したい / RB-004 の妥協 (リアルタイム観測諦め) を本質解決したい
expert-routing: [orchestrator]
related: [RB-004-subagent-final-report-narration]
source: 本パッケージ実機運用 (2026-06-24, ユーザー指摘「RB-004 では不満が一つも解消していない」)
---

# subagent のリアルタイム中間出力 - Hooks 経由のストリーミング観測

## TL;DR (30 秒で読める結論、未検証案)

RB-004 で「リアルタイム観測諦め」と妥協した点を本質解決するための **draft 案**。Claude Code の Hooks (PreToolUse / PostToolUse / Stop) を使い、subagent の tool call ごとに stdout へ narration を書き出すことで:

- parent context 汚染なし (hooks は context 外)
- ユーザー追加操作なし (Claude Code UI に自動表示される想定)
- リアルタイム性 (tool call 単位)
- Codex の日本語ストリーミングに近い体験

**ただし全面未検証**。次セッションで仕様確認 + 実証が必要。動作確認後に status を `active` に昇格、RB-004 を deprecated 化。

## 背景: RB-004 の限界

RB-004 (final report 強化 + heartbeat) は以下を解決していない:

| ユーザーの当初不満 | RB-004 の解決度 |
|---|---|
| subagent の振る舞いがリアルタイムで見えない | 未解決 |
| Codex の日本語中間出力が無く不安 | 未解決 |
| 長時間放置で完了タイミング不明 | 未解決 |
| 待ちに待った末の NG ケース | 部分的 (完了後の振り返りでは早すぎる) |

RB-004 で示した「parent 監視ループ vs 観測諦め」の二択は誤り。第三の解 = **out-of-band streaming via hooks** を検証すべき。

## 検証すべき仮説

### H1: Claude Code Hooks は subagent の tool call を捕捉できる

- Hooks は `~/.claude/settings.json` で `PreToolUse` / `PostToolUse` / `Stop` 等を定義可能
- subagent (Agent ツール経由) で起動された session でも hooks は発火するか?
- 仮説: 発火する (subagent は同一プロセスで session 化されるため)

### H2: Hook の出力は parent context を汚染しない

- Hook の stdout / stderr は parent agent の context window に取り込まれない
- Claude Code 自体の UI / ログには表示される
- 仮説: 標準的な hook 動作として該当 (要公式 docs 確認)

### H3: 日本語 narration を hook から出力できる

- PostToolUse hook で `<tool>` `<args 要約>` を日本語で stdout 出力
- 例: `[subagent:T-123] Read backend/app/main.py を完了 (143 行確認)`
- 仮説: shell スクリプトで実装可能

## 検証手順 (次セッションで実施)

```
[1] ~/.claude/skills/hookify-rules/ または公式 docs で Hooks 仕様確認
    - https://code.claude.com/docs/en/hooks (retrieved_at TBD)
[2] テスト用 hook 設定を ~/.claude/settings.local.json に追加
    - PostToolUse で echo "[hook-test] <tool_name>" を出力
[3] 既存 subagent (例: Explore) を起動
[4] Claude Code UI / ログに hook 出力が表示されるか確認
[5] subagent context への流入有無を ToolOutput で確認
[6] 動作したら本番 hook を作成:
    - subagent の tool call ごとに「[<task-id>] <action> @ <ファイル>」を日本語で出力
    - parent には流れない、ユーザーには表示される
[7] Orchestrator system prompt に hook 設定の自動投入を組み込む
[8] 5〜10 分の長時間 subagent 起動して実体験で検証
[9] RB-005 status を draft → active へ昇格
[10] RB-004 status を active → deprecated へ降格 (final report 機能は残しつつ、観測手段は RB-005 を主とする)
```

## 検証結果の記録欄 (次セッションで埋める)

```yaml
verified_at: TBD
hook_fires_for_subagent: TBD  # H1
context_pollution: TBD         # H2
ja_narration_works: TBD        # H3
ux_quality: TBD                # ユーザー体験評価
deprecation_of_rb004: TBD      # RB-004 を deprecated 化したか
```

## 想定リスク

| リスク | 影響 | 対処 |
|---|---|---|
| Hooks は subagent では発火しない | H1 否定、本案無効 | 別案 (Workflow tool 使用) を検討 |
| Hook 出力が parent context に流入 | H2 否定、第 5 原則違反 | 出力先を別 stream にリダイレクト |
| Claude Code UI が hook 出力を表示しない | UX 改善せず | ログファイル経由 (`tail -f` をユーザーに依頼) → これだと RB-004 と同水準 |
| hook 設定がプロジェクト固有 | 案件移植時に手間 | bootstrap.sh に hook 雛形配置を追加 |

## 関連

- [RB-004-subagent-final-report-narration.md](./RB-004-subagent-final-report-narration.md) (本案で本質解決を目指す対象)
- BP-013 / BP-014 / BP-015 (Hooks 関連、05_principles/_data/best_practices.json)
- 出典: ユーザー指摘 (2026-06-24 対話) - RB-004 では不満が解消していない事実

## 変更履歴

| 日付 | 変更 | 理由 |
|---|---|---|
| 2026-06-24 | 初版 (draft) | RB-004 の妥協を本質解決する第三の解として記録、次セッションで検証実施 |
