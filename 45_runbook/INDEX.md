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
    title: 段階導入予定 - インデックス frontmatter / Concept Graph / 検索プロトコル更新
    category: bootstrap
    tags: [phased-rollout, index, concept-graph, keywords, search-protocol, deferred]
    trigger: ecc-method の探索コスト削減のため Phase 4-7 を段階導入する計画。Phase 1-3 完了後の次ステップ確認時に参照。
    path: ./runbooks/RB-002-phased-rollout-plan-index-graph.md
    last_verified: 2026-06-24
    status: active
  - id: RB-003-autonomous-decision-framework
    title: 自律判断フレームワーク - ユーザー判断委譲を避け、本リポの原則に判断根拠を求める
    category: review
    tags: [autonomy, decision, sycophancy-prevention, agent-behavior, agi-direction]
    trigger: ユーザーから判断を求められたとき / 「あなたの推奨は?」と問われたとき / ASK と ACT で迷ったとき
    path: ./runbooks/RB-003-autonomous-decision-framework.md
    last_verified: 2026-06-24
    status: active
  - id: RB-004-subagent-final-report-narration
    title: subagent の final report 強化と heartbeat ログ - 親 context を汚さず観測性を確保 (妥協案、リアルタイム諦め)
    category: tooling
    tags: [subagent, observability, final-report, heartbeat, context-economy, isolation, compromise]
    trigger: subagent 起動時、parent context を汚染せず「何を考え、どこで詰まり、どう抜けたか」を観測したい (リアルタイム性は諦める)
    path: ./runbooks/RB-004-subagent-final-report-narration.md
    last_verified: 2026-06-24
    status: active
    note: RB-005 が active 化したら deprecated 化予定
  - id: RB-005-subagent-realtime-streaming-via-hooks
    title: subagent のリアルタイム中間出力 - Claude Code Hooks 経由のストリーミング観測 (draft、要検証)
    category: tooling
    tags: [subagent, observability, hooks, streaming, realtime, codex-parity, deferred-verification]
    trigger: subagent のリアルタイム中間出力をユーザー負荷ゼロで実現したい / RB-004 の妥協を本質解決したい / Codex 風の日本語ストリーミング観測を Claude Code で再現したい
    path: ./runbooks/RB-005-subagent-realtime-streaming-via-hooks.md
    last_verified: 未検証
    status: draft
    note: 次セッションで Hooks 仕様確認 + 実証 → active 化、その後 RB-004 を deprecated 化
  - id: RB-006-session-handover-protocol
    title: セッション引き継ぎプロトコル - 開始時 PENDING 自動読込 / 終了時 PENDING 自動更新
    category: bootstrap
    tags: [session-handover, persistence, continuity, agent-autonomy, no-user-cognitive-load]
    trigger: セッションを跨いで未完了タスクを引き継ぐ / 前セッションの残課題を覚えていない / ユーザーに「覚えておいてください」と要求したくなった
    path: ./runbooks/RB-006-session-handover-protocol.md
    last_verified: 2026-06-24
    status: active
    note: agent が PENDING.md を自動 Read/Write することでユーザー認知負荷ゼロ化
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
# 案件導入時に runbooks/ 配下を生成し、本リストに追記する。
# 自動更新: 新 Runbook 作成時に scripts/index-update.sh または手動で追記。
```

## カテゴリ別ビュー

| category | 件数 |
|---|---|
| bootstrap | 5 |
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
