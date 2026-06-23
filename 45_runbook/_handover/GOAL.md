---
schema: RB-007
last_updated: 2026-06-24
project: company-research-mvp + ecc-method
---

# GOAL - 北極星

このファイルは案件全体のゴールを定義する。**毎セッション最初に Read** して方向性を確認する。
めったに変更しない (案件のスコープ自体が変わるとき以外は不変)。

---

## 北極星 (1 文)

ECC を活用した SDD-orchestrated / TDD-disciplined Method (ecc-method) を作り、
それを用いて本リポ MVP (`C:/Users/tie209174/Documents/GitHub/企業情報収集/`) を
要求仕様 (`./company-research-prompts/01_sdd_spec.md`) 通りに稼働させる。

## サブゴール

| 順序 | サブゴール | 完了状態 |
|---|---|---|
| 1 | ecc-method パッケージの初版作成 | ✅ 完了 (commit `6ac0ab8`〜`60e496a`、独立リポ `https://github.com/rnasaki/ecc-method`) |
| 2 | 段階 1 スモークテスト (Pattern P-004 動作確認) | ✅ 完了 (Session 1 で実機検証、RB-001 抽出) |
| 3 | **段階 2 - 本リポ MVP の要求仕様稼働** (←現在ここ) | ⏳ 未着手 |
| 4 | 受入基準の数値報告 + Quality Gate 通過率測定 | ⏳ 未着手 (サブゴール 3 完了時) |
| 5 | ecc-method の有効性評価と改善 (frontier 取り込み・Phase 4-7 等) | ⏳ サブゴール 4 後 |

## 制約

- **個人/組織情報を成果物に混入させない** (PATH POLICY、25_writing-style/)
- **ecc-method の自己整備で本来作業から逸脱しない** (Session 1 終盤の学習)
- **1 セッション 1 タスク原則** (RB-007)
- 本リポ commit は ACT、push は ASK 該当 (METHOD §8)

## 完了の定義 (案件全体)

- [ ] 本リポ MVP の主要機能 5 件の未実装箇所が実装され、test pass している
- [ ] 受入基準 (`04_acceptance_criteria.md`) の各項目について pass/fail が数値報告されている
- [ ] Quality Gate 通過率が記録されている
- [ ] ecc-method パッケージの実運用フィードバックが Runbook 化されている (案件中で得た知見)
- [ ] 案件外への配布可能な状態 (ecc-method 単体で他リポに導入可能)

## スコープ外 (今回やらないこと)

- 本リポ MVP の UI 大幅改修 (UI はほぼ完成済との前提)
- ecc-method の Phase 4-7 段階導入 (RB-002、本案件のサブゴール 5 まで保留)
- 商用デプロイ・運用 (本案件は技術検証目的)
- 完全な業界最先端追従 (frontier は四半期で別途、本案件では初版採用のみ)

## 関連

- METHOD.md §1 (Method の目的)
- 45_runbook/_handover/PENDING.md (中粒度タスクリスト)
- 45_runbook/_handover/current_session.md (現セッションのフォーカス)
- 45_runbook/runbooks/RB-007-* (1-session-1-task 規律)
