---
keywords: [runbook, _index, by-category]
related: [../INDEX.md, ../04_search-protocol.md, ../../_index/concept-graph.json]
---

# Runbook By Category ビュー (自動生成)

> このファイルは `80_commands/generate-runbook-indexes.mjs` が `INDEX.md` から自動生成する。手で編集しない。

## bootstrap (6)

- [`RB-002-phased-rollout-plan-index-graph`](../runbooks/RB-002-phased-rollout-plan-index-graph.md) — 段階導入完了 - インデックス frontmatter / Concept Graph / 検索プロトコル更新 (Phase 1-7 全完了)
- [`RB-006-session-handover-protocol`](../runbooks/RB-006-session-handover-protocol.md) — セッション状態プロトコル - .session-state/ の SSOT 管理 (初回=生成 / 継続=Read の二モード)
- [`RB-007-1-session-1-task-and-session-state`](../runbooks/RB-007-1-session-1-task-and-session-state.md) — 1 セッション 1 タスク原則 + セッション状態の永続化 (GOAL / current_session / 進捗ログ)
- [`RB-008-branch-strategy-and-semver`](../runbooks/RB-008-branch-strategy-and-semver.md) — Branch 戦略と semver - 配布物 (main) と開発資産 (develop) の分離 + 版管理
- [`RB-009-first-run-sdd-bootstrap`](../runbooks/RB-009-first-run-sdd-bootstrap.md) — 初回起動の SDD ヒアリングフロー - .session-state/ は SDD/TDD の中間成果物として生成される
- [`RB-011-knowledge-promotion-flow`](../runbooks/RB-011-knowledge-promotion-flow.md) — Knowledge 昇格フロー - 案件 Knowledge → 中央 Vault → 45_runbook の 2 段階昇格

## pitfall (2)

- [`RB-001-agent-registry-hot-reload`](../runbooks/RB-001-agent-registry-hot-reload.md) — 新規 agent file は次セッションから有効 (Claude Code agent registry はホットリロード非対応)
- [`RB-010-bash-auto-background-on-windows-pytest`](../runbooks/RB-010-bash-auto-background-on-windows-pytest.md) — Windows + Git Bash 経由の長時間 pytest は 2 分 timeout で自動 background 化され出力が空のまま観測不能になる

## review (1)

- [`RB-003-autonomous-decision-framework`](../runbooks/RB-003-autonomous-decision-framework.md) — 自律判断フレームワーク - ユーザー判断委譲を避け、本リポの原則に判断根拠を求める

## tooling (2)

- [`RB-004-subagent-final-report-narration`](../runbooks/RB-004-subagent-final-report-narration.md) — subagent の final report 強化と heartbeat ログ - 親 context を汚さず観測性を確保 (deprecated, RB-005 にロールアップ済み)
- [`RB-005-subagent-realtime-streaming-via-hooks`](../runbooks/RB-005-subagent-realtime-streaming-via-hooks.md) — subagent のリアルタイム中間出力 - Claude Code Hooks 経由のストリーミング観測 (H 層)
