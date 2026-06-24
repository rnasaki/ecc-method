---
keywords: [runbook, _index, by-trigger]
related: [../INDEX.md, ../04_search-protocol.md, ../../_index/concept-graph.json]
---

# Runbook By Trigger ビュー (自動生成)

> このファイルは `80_commands/generate-runbook-indexes.mjs` が `INDEX.md` から自動生成する。手で編集しない。

| ID | Trigger | Status |
|---|---|---|
| [`RB-001-agent-registry-hot-reload`](../runbooks/RB-001-agent-registry-hot-reload.md) | 新しい agent file を作成したのに "Agent type '...' not found" が出る。または自作 agent が現セッションで呼べない。 | active |
| [`RB-002-phased-rollout-plan-index-graph`](../runbooks/RB-002-phased-rollout-plan-index-graph.md) | ecc-method の探索コスト削減用の CodeGraph 導入経緯を確認したい / Phase 4-7 の実装内容を参照したい / 同等の段階導入を別パッケージに適用したい | completed |
| [`RB-003-autonomous-decision-framework`](../runbooks/RB-003-autonomous-decision-framework.md) | ユーザーから判断を求められたとき / 「あなたの推奨は?」と問われたとき / ASK と ACT で迷ったとき | active |
| [`RB-004-subagent-final-report-narration`](../runbooks/RB-004-subagent-final-report-narration.md) | subagent 起動時、parent context を汚染せず「何を考え、どこで詰まり、どう抜けたか」を観測したい (リアルタイム性は諦める) | active |
| [`RB-005-subagent-realtime-streaming-via-hooks`](../runbooks/RB-005-subagent-realtime-streaming-via-hooks.md) | subagent のリアルタイム中間出力をユーザー負荷ゼロで実現したい / RB-004 の妥協を本質解決したい / Codex 風の日本語ストリーミング観測を Claude Code で再現したい | draft |
| [`RB-006-session-handover-protocol`](../runbooks/RB-006-session-handover-protocol.md) | セッションを跨いで状態を保持する / 前セッションの残課題を覚えていない / ユーザーに「覚えておいてください」と要求したくなった / .session-state/ の役割と更新規律を確認したい | active |
| [`RB-007-1-session-1-task-and-session-state`](../runbooks/RB-007-1-session-1-task-and-session-state.md) | セッションで複数タスク詰め込みすぎ / 本筋から逸脱 / セッション落ちで作業消失 / ゴール忘却 / 「今何やってる?」即答不能 | active |
| [`RB-008-branch-strategy-and-semver`](../runbooks/RB-008-branch-strategy-and-semver.md) | 配布物に開発資産が混入 / 利用者が「どの版を使えばいいか」分からない / リリース整理プロセスが欠落 | active |
| [`RB-009-first-run-sdd-bootstrap`](../runbooks/RB-009-first-run-sdd-bootstrap.md) | 配布利用者が初めて agent を起動 / .session-state/ が存在しない / 新規プロジェクトで GOAL がまだない | active |
| [`RB-010-bash-auto-background-on-windows-pytest`](../runbooks/RB-010-bash-auto-background-on-windows-pytest.md) | Bash ツールで pytest 全体実行など 2 分超のコマンドを foreground 起動したが応答が返らない / 自動 background 化された / 出力ファイルがサイズ 0 / TaskOutput でも timeout | active |
| [`RB-011-knowledge-promotion-flow`](../runbooks/RB-011-knowledge-promotion-flow.md) | 案件で書いたナレッジを横断再利用したい / `~/Documents/Knowledge/` 中央 Vault に純化された note を昇格したい / `promotion_candidate: true` を検知 / 同じ procedure が 2 案件以上で使われた / 中央 Vault と案件 Knowledge の 2 層運用を整理したい | active |
