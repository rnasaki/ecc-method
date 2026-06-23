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
# 案件導入時に runbooks/ 配下を生成し、本リストに追記する。
# 自動更新: 新 Runbook 作成時に scripts/index-update.sh または手動で追記。
```

## カテゴリ別ビュー

| category | 件数 |
|---|---|
| bootstrap | 1 |
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
