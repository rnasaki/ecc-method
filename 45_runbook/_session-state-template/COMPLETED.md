---
last_updated: <YYYY-MM-DD>
schema: RB-006
keywords: [runbook, _session-state-template, completed]
related: []
---

# COMPLETED - 完了済宿題アーカイブ (雛形)

このファイルは **案件固有** のため、案件リポの `.session-state/COMPLETED.md` にコピーして使用する。

完了した宿題の永続記録。検索性のため category / completed_at / commit_hash で索引化。

---

(初版時点では未完了。タスク完了時に PENDING からここに移送される)

---

## 索引フォーマット

```yaml
- id: HW-<X>
  title: <タイトル>
  category: <カテゴリ>
  completed_at: YYYY-MM-DD HH:MM
  session_id: <セッション識別子 or 累計番号>
  commit_hashes: [<関連 commit hash>]
  outcome_summary: <1-3 行で結果>
  related_runbooks: [<RB-NNN>]
```
