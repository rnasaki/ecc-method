---
keywords: [runbook]
related: [45_runbook/04_search-protocol.md, 45_runbook/05_maintenance.md, 45_runbook/02_indexing-rules.md]
---
# Runbook INDEX

機械可読 (YAML) で全 Runbook を索引化する。Orchestrator は検索プロトコル ([04_search-protocol.md](./04_search-protocol.md)) で最初にここを引く。

## 索引フォーマット

```yaml
runbooks:
  - id: RB-<NNN>-<slug>
    title: <表示タイトル>
    category: <category>
    tags: [<tag>]
    trigger: <検索ヒット用の自然文>
    path: ./runbooks/RB-<NNN>-<slug>.md
    last_verified: YYYY-MM-DD
    status: active | review-due | stale | deprecated
```

## 索引

```yaml
runbooks:
  - id: RB-001-agent-registry-hot-reload
    title: 新規 agent file は次セッションから有効 (Claude Code agent registry はホットリロード非対応)
    category: pitfall
    tags: [agent, registry, hot-reload, claude-code, session]
    trigger: 新しい agent file を作成したのに "Agent type '...' not found" が出る。または自作 agent が現セッションで呼べない。
    path: ./runbooks/RB-001-agent-registry-hot-reload.md
    last_verified: 2026-06-24
    status: active
  - id: RB-002-phased-rollout-plan-index-graph
    title: 段階導入完了 - インデックス frontmatter / Concept Graph / 検索プロトコル更新 (Phase 1-7 全完了)
    category: bootstrap
    tags: [phased-rollout, index, concept-graph, keywords, search-protocol, completed]
    trigger: ecc-method の探索コスト削減用の CodeGraph 導入経緯を確認したい / Phase 4-7 の実装内容を参照したい / 同等の段階導入を別パッケージに適用したい
    path: ./runbooks/RB-002-phased-rollout-plan-index-graph.md
    last_verified: 2026-06-24
    status: completed
  - id: RB-003-autonomous-decision-framework
    title: 自律判断フレームワーク - ユーザー判断委譲を避け、本リポの原則に判断根拠を求める
    category: review
    tags: [autonomy, decision, sycophancy-prevention, agent-behavior, agi-direction]
    trigger: ユーザーから判断を求められたとき / 「あなたの推奨は?」と問われたとき / ASK と ACT で迷ったとき
    path: ./runbooks/RB-003-autonomous-decision-framework.md
    last_verified: 2026-06-24
    status: active
  - id: RB-004-subagent-final-report-narration
    title: subagent の final report 強化と heartbeat ログ - 親 context を汚さず観測性を確保 (deprecated, RB-005 にロールアップ済み)
    category: tooling
    tags: [subagent, observability, final-report, heartbeat, context-economy, isolation, deprecated]
    trigger: subagent 起動時、parent context を汚染せず「何を考え、どこで詰まり、どう抜けたか」を観測したい (履歴参照用)
    path: ./runbooks/RB-004-subagent-final-report-narration.md
    last_verified: 2026-06-24
    status: deprecated
    deprecated_by: RB-005-subagent-realtime-streaming-via-hooks
    deprecated_at: 2026-06-24
    note: D 層 (final report 必須セクション) は RB-005 §採用案で (D) として継承。新規採用は RB-005 を参照
  - id: RB-005-subagent-realtime-streaming-via-hooks
    title: subagent のリアルタイム中間出力 - Claude Code Hooks 経由のストリーミング観測 (H 層)
    category: tooling
    tags: [subagent, observability, hooks, streaming, realtime, codex-parity]
    trigger: subagent のリアルタイム中間出力をユーザー負荷ゼロで実現したい / RB-004 の妥協を本質解決したい / Codex 風の日本語ストリーミング観測を Claude Code で再現したい
    path: ./runbooks/RB-005-subagent-realtime-streaming-via-hooks.md
    last_verified: 2026-06-24
    status: active
    note: 公式 docs (https://code.claude.com/docs/en/hooks, retrieved_at 2026-06-24) で H1/H2/H3 確認済み。実装は .template-claude/hooks/subagent-narrator.{sh,ps1} に同梱
  - id: RB-006-session-handover-protocol
    title: セッション状態プロトコル - .session-state/ の SSOT 管理 (初回=生成 / 継続=Read の二モード)
    category: bootstrap
    tags: [session-state, persistence, continuity, agent-autonomy, no-user-cognitive-load, two-mode]
    trigger: セッションを跨いで状態を保持する / 前セッションの残課題を覚えていない / ユーザーに「覚えておいてください」と要求したくなった / .session-state/ の役割と更新規律を確認したい
    path: ./runbooks/RB-006-session-handover-protocol.md
    last_verified: 2026-06-24
    status: active
    note: 二モード (初回=RB-009 へ分岐 / 継続=Read/Write) を分離。GOAL/current_session 主管は RB-007 に分離 (ゼロ重複)
  - id: RB-007-1-session-1-task-and-session-state
    title: 1 セッション 1 タスク原則 + セッション状態の永続化 (GOAL / current_session / 進捗ログ)
    category: bootstrap
    tags: [session-discipline, focus, single-task, state-persistence, scope-control, no-drift]
    trigger: セッションで複数タスク詰め込みすぎ / 本筋から逸脱 / セッション落ちで作業消失 / ゴール忘却 / 「今何やってる?」即答不能
    path: ./runbooks/RB-007-1-session-1-task-and-session-state.md
    last_verified: 2026-06-24
    status: active
    note: 3 階層 (GOAL / PENDING / current_session) の永続化で逸脱防止
  - id: RB-008-branch-strategy-and-semver
    title: Branch 戦略と semver - 配布物 (main) と開発資産 (develop) の分離 + 版管理
    category: bootstrap
    tags: [git, branch, gitflow, semver, release, distribution, separation]
    trigger: 配布物に開発資産が混入 / 利用者が「どの版を使えばいいか」分からない / リリース整理プロセスが欠落
    path: ./runbooks/RB-008-branch-strategy-and-semver.md
    last_verified: 2026-06-24
    status: active
    note: GitFlow 風の main / develop 分離 + semver tag、HW-D / HW-E と直結
  - id: RB-009-first-run-sdd-bootstrap
    title: 初回起動の SDD ヒアリングフロー - .session-state/ は SDD/TDD の中間成果物として生成される
    category: bootstrap
    tags: [first-run, sdd-bootstrap, session-state, no-prior-handover, generation]
    trigger: 配布利用者が初めて agent を起動 / .session-state/ が存在しない / 新規プロジェクトで GOAL がまだない
    path: ./runbooks/RB-009-first-run-sdd-bootstrap.md
    last_verified: 2026-06-24
    status: active
    note: HW-G で .handover→.session-state 概念再定義に伴い導入
  - id: RB-010-bash-auto-background-on-windows-pytest
    title: Windows + Git Bash 経由の長時間 pytest は 2 分 timeout で自動 background 化され出力が空のまま観測不能になる
    category: pitfall
    tags: [bash, background, timeout, pytest, windows, git-bash, observability, claude-code]
    trigger: Bash ツールで pytest 全体実行など 2 分超のコマンドを foreground 起動したが応答が返らない / 自動 background 化された / 出力ファイルがサイズ 0 / TaskOutput でも timeout
    path: ./runbooks/RB-010-bash-auto-background-on-windows-pytest.md
    last_verified: 2026-06-24
    status: active
    note: 回避策 = 対象スコープ限定 + --no-cov + foreground (timeout 内完了)。Session 2 段階 2 テストで実機検証
  - id: RB-011-knowledge-promotion-flow
    title: Knowledge 昇格フロー - 案件 Knowledge → 中央 Vault → 45_runbook の 2 段階昇格
    category: bootstrap
    tags: [knowledge, vault, obsidian, promotion, memory-hierarchy, hybrid]
    trigger: 案件で書いたナレッジを横断再利用したい / `~/Documents/Knowledge/` 中央 Vault に純化された note を昇格したい / `promotion_candidate: true` を検知 / 同じ procedure が 2 案件以上で使われた / 中央 Vault と案件 Knowledge の 2 層運用を整理したい
    path: ./runbooks/RB-011-knowledge-promotion-flow.md
    last_verified: 2026-06-24
    status: active
    note: 12_knowledge-vault/ の 2 層 Hybrid 設計に基づく手動昇格手順。agent が PII 除去・一般化を補助し、利用者が最終承認
# 案件導入時に runbooks/ 配下を生成し、本リストに追記する。
# 自動更新: 新 Runbook 作成時に scripts/index-update.sh または手動で追記。
```

## カテゴリ別ビュー

| category | 件数 |
|---|---|
| bootstrap | 6 |
| deploy | 0 |
| debug | 0 |
| infra | 0 |
| review | 1 |
| domain | 0 |
| pitfall | 1 |
| tooling | 2 |

## 鮮度ステータス

- `active`: last_verified が 90 日以内
- `review-due`: last_verified が 90〜180 日
- `stale`: last_verified が 180〜365 日 (要更新警告)
- `deprecated`: 365 日超または明示的廃止

詳細は [05_maintenance.md](./05_maintenance.md)。

## 索引更新ルール

- 新規 Runbook 作成 → 即追記
- 既存 Runbook の `last_verified` 更新 → 索引も同期
- `deprecated` 化 → 索引から削除しない (履歴保全)。`status: deprecated` に書き換え

詳細は [02_indexing-rules.md](./02_indexing-rules.md)。

## 検索方法

```bash
# tag で絞る
grep -A 1 "tags:.*<tag>" INDEX.md

# trigger で fuzzy 検索
grep -i "<keyword>" INDEX.md

# category で絞る
grep "category: <cat>" INDEX.md
```

詳細プロトコルは [04_search-protocol.md](./04_search-protocol.md)。
