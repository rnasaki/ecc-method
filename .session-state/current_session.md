---
schema: RB-007
session_id: 3 (ecc-method 開発、Session 3、未開始)
created_at: 2026-06-24
last_updated: 2026-06-24
status: pending_start
branch: develop
---

# Current Session - ecc-method 開発

## ターゲットタスク (1 つ)

**HW-D または HW-F の選択 + 着手**: HW-G 完了により以下が並列着手可になった:
- **HW-D**: Method v1.0 リリース整理 (採番再定義 / リンク張替え / CHANGELOG / v1.0.0 tag)
- **HW-F**: SDD/TDD 章の汎用化精査 (30_sdd-phase / 35_tdd-phase の案件依存洗い出し)

両者とも P1。Session 3 開始時にユーザーへ 1 行で選択を委ねる (= L0 で導出不能、ユーザー方針判断)。

## 完了条件 (本セッションの最小範囲)

選択先により分岐:

### HW-D を選んだ場合

- [ ] 採番ポリシー方針確定 (整列 or 廃止 or ハイブリッド) → 1 セッションで決め切れない場合はサブタスク分割
- [ ] CHANGELOG.md 雛形作成
- [ ] v1.0.0 tag 切り条件の整理

### HW-F を選んだ場合

- [ ] 30_sdd-phase または 35_tdd-phase のいずれか 1 章を選定
- [ ] その章の「案件依存」「実機未検証」「出典なし」箇所を洗い出し
- [ ] 不確実性セクションを更新

## このセッションで触らないもの (スコープ外)

- 選ばなかった方の宿題 (次々セッション以降)
- HW-B (RB-005 検証): 残 budget があれば併走可
- HW-C (Phase 4-7): HW-D 完了後
- HW-H (RB-010 候補): HW-D / HW-F 主要進捗後

## TODO (作業手順、agent が更新)

1. (未開始) GOAL.md / PENDING.md / INDEX.md を Read
2. (未開始) ユーザーに HW-D / HW-F 選択を 1 行で問う (RB-003: L0 で導出不能のため委譲可)
3. (未開始) 選択に応じてサブタスクを分解
4. (未開始) 完了条件チェックボックスを潰す
5. (未開始) commit + push
6. (未開始) PENDING / COMPLETED / HISTORY / current_session を更新

## 進捗ログ (中断・再開用)

(Session 3 未開始)

## 再開ポイント (Session 3 開始時の agent 向け)

Session 1-2 (2026-06-24) で完了:
- HW-E: Branch / semver / RB-008 (✅ 完了 Session 1)
- HW-G: 全体プロセス再設計 + RB-006 改訂 + README 書き直し + 関連整合 (✅ 完了 Session 2)

Session 3 の出発点:
- branch: develop
- 直前 commit: `fbcd4152` (HW-G 完了)
- 残 P1 = HW-D / HW-F の 2 つ
- ユーザー方針判断 (L0 で導出不能) のため、開始時に選択肢提示

最初にやること:
1. GOAL.md (北極星確認: SDD/TDD 汎用化 + v1.0 配布)
2. PENDING.md (HW-D / HW-F のどちらが「北極星に最も近い」か再確認)
3. 本ファイル (status: pending_start なのでそのまま着手)
4. ユーザーに HW-D / HW-F 選択を 1 行で問う
5. 選択後にサブタスク分解 → 着手

## このセッションの不確実性

- HW-D の「採番方針」は単一セッションで結論が出ない可能性 → サブタスク分割を視野に
- HW-F は章数が多い (30_sdd-phase / 35_tdd-phase 配下複数) → 1 セッション = 1 章に絞る規律を堅守

## 関連

- GOAL.md (北極星 = SDD/TDD 汎用化 + v1.0 配布)
- PENDING.md (HW-D / HW-F が並列着手可状態)
- ../45_runbook/runbooks/RB-006-session-handover-protocol.md (Session 3 でも適用)
- ../45_runbook/runbooks/RB-007-1-session-1-task-and-session-state.md
- ../45_runbook/runbooks/RB-003-autonomous-decision-framework.md (L0 で導出不能な選択は委譲可)
