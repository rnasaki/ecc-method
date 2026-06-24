---
schema: RB-007
session_id: <連番>
created_at: <YYYY-MM-DD>
last_updated: <YYYY-MM-DD>
status: pending_start | in_progress | completed
keywords: [runbook, _session-state-template, current, session]
related: []
---

# Current Session - 現セッションのフォーカス (雛形)

このファイルは **案件固有** のため、案件リポの `.session-state/current_session.md` にコピーして使用する。

セッション開始時に agent が新規作成 / 前回未完了なら更新する。

---

## ターゲットタスク (1 つ)

PENDING.md の P0 から **1 つだけ** 選定して書く。

例: `HW-A.1 - <具体的なサブタスク名>`

## 完了条件

- [ ] <チェックリスト 1>
- [ ] <チェックリスト 2>
- [ ] Quality Gate ([60_quality-gates/07_gate-checklist.md](~/.claude/methods/ecc-method/60_quality-gates/07_gate-checklist.md)) 通過

## このセッションで触らないもの (スコープ外宣言)

- <明示的にスコープ外と宣言する事項>
- <局所最適化への逃げ込みを防ぐため、agent が新たな問題を見つけても今は触らないものを列挙>

## TODO (作業手順、agent が更新)

1. (未開始) GOAL.md を Read してゴール確認
2. (未開始) PENDING.md / INDEX.md を Read
3. (未開始) <タスク固有の手順>

## 進捗ログ (中断・再開用)

(未開始)

## 再開ポイント (セッション中断時に agent が記録)

(セッション開始前のため未記入)

## このセッションの不確実性

- <未検証の前提>
- <推測に依存している箇所>

## 関連

- GOAL.md (本案件全体のゴール)
- PENDING.md
- ~/.claude/methods/ecc-method/45_runbook/runbooks/RB-007-1-session-1-task-and-session-state.md (本セッション運営の規律)
