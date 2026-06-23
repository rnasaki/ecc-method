---
last_updated: <YYYY-MM-DD>
schema: RB-006
---

# HISTORY - セッション引き継ぎログ (雛形)

このファイルは **案件固有** のため、案件リポの `.handover/HISTORY.md` にコピーして使用する。

各セッションの引き継ぎ記録。誰が何を引き継ぎ、何を残したかを永続化。

---

## 索引フォーマット

```yaml
- session_id: <連番>
  session_start: YYYY-MM-DD
  session_end: YYYY-MM-DD
  着手宿題: [<HW-X>]
  完了宿題: [<HW-X>]
  新規追加宿題: [<HW-X>]
  commit_hashes: [<hash>]
  本セッションでの主要学習: <自由記述>
```

---

## Session <N>

(案件で書き換える)
