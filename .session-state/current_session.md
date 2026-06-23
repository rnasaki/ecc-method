---
schema: RB-007
session_id: 5 (ecc-method 開発、Session 5、HW-F 続き)
created_at: 2026-06-24
last_updated: 2026-06-24
status: completed
branch: develop
---

# Current Session - ecc-method 開発

## ターゲットタスク (1 つ)

**HW-F**: SDD/TDD 章の汎用化精査 — Session 5 では `30_sdd-phase/02_feature-id-rules.md` を 1 章ぶん精査。

選択理由 (RB-003 L1 導出):
- 採番規則は実装後の変更コストが極めて高い (リネームは別 ID 発行扱い、§5)。後続章 (requirements/design/tasks) すべての前提となるため早期固定が望ましい。
- 1 セッション 1 章規律に収まる粒度。
- 前セッション (Session 4 = 01_prd-flow) の隣接章で文脈が連続。

## 完了条件 (本セッション)

- [x] 1 章選定 (`30_sdd-phase/02_feature-id-rules.md`)
- [x] 案件依存 / 実機未検証 / 出典なし箇所を洗い出し
- [x] 修正反映 (プレフィックス衝突回避、断定→裁量化、出典区分明示)
- [x] 不確実性セクションを拡充

## 本セッションの所見

### A. 案件依存箇所
- 0 件。本文に固有プロダクト名は含まれず。

### B. プレフィックス衝突 (重大、修正済)
- Feature ID 種別 `D` (Defect) と、トレーサビリティ章 `55_verification/01_traceability.md` の Design 要素 `D<NN>-A` が grep で衝突する。
  - 例: `D12-A` (Design 要素) と `D12-blank-page-crash` (Defect Feature ID) が混在すると `grep "D12"` で両方ヒット。
- 修正: Defect プレフィックスを `D` → `B` (Bug fix) へ変更。§2.1 表 / §2.2 選択ルール / §7 アンチパターン / §8 採番例を全更新。注記と不確実性で経緯を明示。

### C. 出典の妥当性 (修正済)
- §3 「種別ごと独立連番」、§5 「Discovery では採番しない / Requirements で固定」、§6 横串トレーサビリティ表は spec-kit 由来ではなく本パッケージ独自規定。
- 修正: 出典セクションに「§1/§2 大枠は spec-kit 踏襲、§3/§5/§6 は独自規定」を明記。

### D. 断定的記述の弱化 (修正済)
1. §3 「99 を超える場合は別ファイル/別フェーズに分割」断定 → 「分割 or 3 桁化はプロジェクト裁量」に弱化。
2. §6 テスト命名 `test_F03_pdf_text_extract_*.py` は Python 寄り → ディレクトリ分離 (`tests/F03/...`) を併記。

### E. 不確実性セクション拡充 (2 → 6 項目)
1. 種別拡張 (Security/Operations 等) はプロジェクト裁量
2. 桁数 (2→3 桁化) はプロジェクト裁量
3. **新規**: D→B 移行の経緯と既存プロジェクトの扱い
4. **新規**: テストファイル命名の言語別実機未検証
5. **新規**: 通し連番 vs 独立連番の選択
6. **新規**: 各成果物間の ID 整合性は drift-detection 章に依存 (実機運用未検証)

## このセッションで触らなかったもの (スコープ外)

- 30_sdd-phase/03-06 (4 章)、35_tdd-phase/01-05 (5 章) — 1 セッション 1 章規律により次セッション以降
- HW-B / HW-C / HW-H

### 関連ファイルの整合性チェック (実施済)

`02_feature-id-rules.md` の D → B 変更に伴い、他章で `D01-` 等の Defect Feature ID 表記を使用している箇所がないか grep 確認:

- `40_delegation/03_delegation-contract.md`: F03/T03 のみ使用、D 種別の Feature ID 例なし
- `25_writing-style/05_examples.md`: F12 のみ使用
- `55_verification/01_traceability.md`: `D12-A` は Design 要素 (本書改訂で衝突回避が成立)
- 他章: `D<NN>-<kebab-slug>` 形式の Defect Feature ID 表記は確認できず

⇒ 既存章への波及修正は不要と判断。

## TODO (進捗)

1. ✅ .session-state/ 全ファイル Read
2. ✅ 対象章を L1 導出で `30_sdd-phase/02_feature-id-rules.md` に決定
3. ✅ 章本体を Read + 横串 grep
4. ✅ プレフィックス衝突を修正 (D→B)
5. ✅ §3/§6 を裁量化、出典区分明示、不確実性 6 項目に拡充
6. ✅ HISTORY / PENDING / current_session 更新
7. ⏳ commit + push

## 次セッション (Session 6) の出発点

- branch: develop
- 残 P1: HW-F (9 章残)
- 開始時にユーザーへ「HW-F 続き (どの章)」「他」を 1 行で問う
- HW-F 続きの場合の推奨:
  - `30_sdd-phase/03_requirements-template.md` (PRD → requirements の流れを保つ)
  - または `35_tdd-phase/01_red-green-refactor.md` (TDD 章中核、SDD と独立精査可能)

## 関連

- GOAL.md (北極星 = SDD/TDD 汎用化 + v1.0 配布)
- PENDING.md (HW-F: 2/11 章完了)
- ../30_sdd-phase/02_feature-id-rules.md (本セッションで修正)
- ../55_verification/01_traceability.md (D<NN>-A Design 要素の正規参照先)
- ../45_runbook/runbooks/RB-003-autonomous-decision-framework.md (L1 導出で衝突回避を agent 主導)
- ../45_runbook/runbooks/RB-006-session-handover-protocol.md
- ../45_runbook/runbooks/RB-007-1-session-1-task-and-session-state.md

# ⚠️ このセッションはクローズ
