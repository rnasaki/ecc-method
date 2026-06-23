---
schema: RB-007
last_updated: <YYYY-MM-DD>
project: <案件名>
---

# GOAL - 北極星 (雛形)

このファイルは **案件固有** のため、案件リポの `.session-state/GOAL.md` にコピーして使用する。
ecc-method パッケージ (汎用 Method) には案件データを置かない。

初期化手順 (案件リポ側で実行):
```bash
mkdir -p .handover
cp ~/.claude/methods/ecc-method/45_runbook/_session-state-template/*.md .session-state/
# その後、.session-state/GOAL.md を案件内容で書き換える
```

---

## 北極星 (1 文)

<案件で達成したいことを 1 文で>

## サブゴール

| 順序 | サブゴール | 完了状態 |
|---|---|---|
| 1 | <小目標 1> | ⏳ |
| 2 | <小目標 2> | ⏳ |

## 制約

- <期限>
- <スコープ外>
- <品質基準>

## 完了の定義 (案件全体)

- [ ] <数値・観測可能な条件 1>
- [ ] <数値・観測可能な条件 2>

## スコープ外 (今回やらないこと)

- <明示的にスコープ外と宣言する事項>

## 関連

- METHOD.md §1 (Method の目的)
- .session-state/PENDING.md (中粒度タスクリスト)
- .session-state/current_session.md (現セッションのフォーカス)
- ~/.claude/methods/ecc-method/45_runbook/runbooks/RB-007-1-session-1-task-and-session-state.md
