---
schema: RB-007
session_id: 1 (ecc-method 開発、Session 1)
created_at: 2026-06-24
last_updated: 2026-06-24
status: pending_start
branch: develop
---

# Current Session - ecc-method 開発

## ターゲットタスク (1 つ)

**HW-G: 全体プロセス再設計** (`.handover/` の役割と初回フロー)

詳細は `PENDING.md` の HW-G セクション参照。

## 完了条件 (本セッションの最小範囲)

このタスクは規模が大きいため、初回セッションでは **設計案を確定するところまで** を目標とする:

- [ ] `.handover/` の概念を再定義 (引き継ぎ → SDD/TDD 中間成果物)
- [ ] 命名候補の選定 (`.handover/` → `.session-state/` 等、3 案出して 1 つ採用)
- [ ] 初回実行フロー設計 (ヒアリング → GOAL 生成 → SDD/TDD ループ)
- [ ] 2 回目以降の継続フローと整合確認
- [ ] 影響範囲リスト作成 (どのファイルを書き換えるか網羅)
- [ ] 設計案を RB として永続化 (新規 RB-009 候補)
- [ ] **実装は別セッション** (本セッションは設計確定まで)

## このセッションで触らないもの (スコープ外宣言)

- 実装そのもの (Orchestrator prompt 書き換え / RB-006/007 改訂 / 30_sdd-phase 整合 等は別セッション)
- HW-D (Method v1.0 リリース整理): HW-G 完了が前提
- HW-F (SDD/TDD 章汎用化精査): HW-G 完了が前提
- HW-B / HW-C: 並列・後続セッション

## TODO (作業手順、agent が更新)

1. (未開始) GOAL.md / PENDING.md / HISTORY.md / INDEX.md を Read
2. (未開始) 既存 .handover/ / RB-006 / RB-007 / 30_sdd-phase / 35_tdd-phase / Orchestrator prompt を Read して現状把握
3. (未開始) `.handover/` の役割再定義 (概念設計)
4. (未開始) 命名 3 案検討 → 1 案採用
5. (未開始) 初回フロー設計 (擬似コード or フローチャート)
6. (未開始) 影響範囲リスト作成
7. (未開始) 設計案を RB-009 として永続化
8. (未開始) develop branch に commit + push

## 進捗ログ (中断・再開用)

(Session 1 未開始)

## 再開ポイント (Session 1 開始時の agent 向け)

前セッションの本リポ (企業情報収集) Session 2 で発覚した概念矛盾:
- 「`.handover/` の初回読み込み」は引き継ぐべき過去がない新規利用者に意味をなさない
- 正しくは `.handover/` は SDD/TDD プロセスの **中間成果物**
- 配布利用者の初回実行は SDD ヒアリングから始まり、`.handover/` は **生成される**

本セッションでこの設計矛盾を解消する設計案を確定する (実装は別セッション)。

最初にやること (RB-006/RB-007 起動時必須):
1. GOAL.md を Read (北極星 = SDD/TDD 汎用化)
2. PENDING.md を Read (HW-G が P0)
3. 本ファイルを Read (status: pending_start なのでそのまま着手)
4. ユーザーに 5 行応答 (北極星 / 今回のタスク / スコープ外 / 想定所要 / 着手宣言)
5. 中断指示なければ §現状把握 から着手

## このセッションの不確実性

- 命名候補 (`.handover/` の代替) に正解はない。実装容易性とユーザー認知の両方で選定
- 初回フローの「ヒアリング」を agent が対話で行うのか雛形フォームに記入してもらうかは設計判断
- 既存 RB-006 / RB-007 の役割が再設計後にどう変わるかは現時点で未確定

## 関連

- GOAL.md (北極星 = SDD/TDD 汎用化)
- PENDING.md HW-G (本タスクの完了基準詳細)
- ../runbooks/RB-007-1-session-1-task-and-session-state.md (1 セッション 1 タスク規律)
