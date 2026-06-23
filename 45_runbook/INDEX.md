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
runbooks: []
# 案件導入時に runbooks/ 配下を生成し、本リストに追記する。
# 自動更新: 新 Runbook 作成時に scripts/index-update.sh または手動で追記。
```

## カテゴリ別ビュー (空の状態)

| category | 件数 |
|---|---|
| bootstrap | 0 |
| deploy | 0 |
| debug | 0 |
| infra | 0 |
| review | 0 |
| domain | 0 |
| pitfall | 0 |
| tooling | 0 |

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
