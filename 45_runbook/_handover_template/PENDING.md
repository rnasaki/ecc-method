---
last_updated: <YYYY-MM-DD>
session_count: 0
schema: RB-006
---

# PENDING - 未完了宿題 (雛形)

このファイルは **案件固有** のため、案件リポの `.handover/PENDING.md` にコピーして使用する。

Orchestrator agent はセッション開始時に必ず Read し、終了時に必ず更新する。

詳細は [`~/.claude/methods/ecc-method/45_runbook/runbooks/RB-006-session-handover-protocol.md`](../runbooks/RB-006-session-handover-protocol.md) を参照。

---

## 宿題: HW-<X> - <タイトル>

- **状態**: not_started | in_progress | blocked | review_pending
- **優先度**: P0 (即着手) | P1 (次回) | P2 (余力)
- **着手条件**: <前提条件、なければ "なし">
- **完了基準**: <数値・観測可能な条件>
- **対象リポ**: <パス>
- **関連 Runbook**: <RB-NNN>
- **担当 expert role**: <Expert Registry のカテゴリ>
- **メモ**: <自由記述、引き継ぎ先 agent への補足>

---

## 索引

| ID | 状態 | 優先度 | タイトル |
|---|---|---|---|
| HW-? | not_started | P? | <案件で書き換える> |

## 次セッション着手フロー (agent 自動実行)

1. 本ファイルを Read (RB-006 起動時必須)
2. INDEX.md (`../INDEX.md`) を Read
3. P0 宿題から自律着手
4. ユーザーには「前回からの継続: <タスク>」を 1 行で通知
5. 完了したら本ファイル + COMPLETED.md + HISTORY.md を更新、commit + push
