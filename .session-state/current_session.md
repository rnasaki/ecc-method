---
schema: RB-007
session_id: 2 (ecc-method 開発、Session 2、未開始)
created_at: 2026-06-24
last_updated: 2026-06-24
status: pending_start
branch: develop
---

# Current Session - ecc-method 開発

## ターゲットタスク (1 つ)

**HW-G 残実装**: 概念再定義 (.handover → .session-state、初回 = SDD 起点) に合わせて
既存ドキュメントを整合する。

## 完了条件 (本セッションの最小範囲)

- [ ] RB-006 を「セッション引き継ぎプロトコル」→「セッション状態プロトコル」として書き直し
  - 初回 = 生成 / 継続 = Read の二モード明示
  - RB-009 への正しい参照
- [ ] RB-007 内の `.handover` 旧表現があれば整合確認
- [ ] README の Step 3 を再設計版に書き直し
  - 旧: 利用者が `.session-state/` を手動 cp + GOAL 記入
  - 新: agent 起動時にヒアリング → 自動生成
- [ ] .template-agents/ 配下の README 参照整合
- [ ] develop branch に commit + push
- [ ] PENDING.md の HW-G 状態を ✅ 完了 に更新、COMPLETED.md へ移送

## このセッションで触らないもの (スコープ外)

- HW-D (採番再定義): HW-G 完了後の別セッション
- HW-F (SDD/TDD 章汎用化精査): HW-G 完了後
- HW-C (Phase 4-7、CodeGraph): 後続
- HW-B (RB-005 Hooks 検証): 並列 / 後続

## TODO (作業手順、agent が更新)

1. (未開始) GOAL.md / PENDING.md / INDEX.md / RB-009 を Read
2. (未開始) RB-006 改訂版を執筆
3. (未開始) RB-007 整合確認 (.handover 残存チェック)
4. (未開始) README Step 3 書き直し
5. (未開始) .template-agents/ 配下整合
6. (未開始) commit + push
7. (未開始) HW-G を COMPLETED へ移送

## 進捗ログ (中断・再開用)

(Session 2 未開始)

## 再開ポイント (Session 2 開始時の agent 向け)

Session 1 (2026-06-24) で完了:
- HW-E: Branch / semver / RB-008 (✅ 完了)
- HW-G の主要実装:
  - .handover → .session-state リネーム
  - 全参照置換 (17 ファイル)
  - Orchestrator prompt 書き直し (新規 = SDD ヒアリング起点)
  - RB-009 (初回 SDD ブートストラップ) 永続化

Session 2 の出発点:
- branch: develop
- HW-G の残: 既存ドキュメントの概念整合 (RB-006/007 / README / .template-agents/)
- 着手前に必ず RB-009 を Read して新概念を把握

最初にやること (RB-006/RB-007/RB-009 起動時必須):
1. GOAL.md (北極星確認)
2. PENDING.md (HW-G が in_progress 部分完了)
3. 本ファイル (status: pending_start なのでそのまま着手)
4. ユーザーに 5 行応答
5. 中断指示なければ HW-G 残実装から着手

## このセッションの不確実性

- RB-006 改訂は既存 RB-007 / RB-009 との重複/役割分担の再整理が必要
- README Step 3 を「agent 起動だけ」に簡略化すると、利用者が初回で何が起きるか
  分かりにくい可能性 → 補助説明をどこに置くか要検討

## 関連

- GOAL.md (北極星 = SDD/TDD 汎用化)
- PENDING.md HW-G (本タスクの完了基準詳細)
- ../runbooks/RB-009-first-run-sdd-bootstrap.md (新概念の核)
- ../runbooks/RB-007-1-session-1-task-and-session-state.md
