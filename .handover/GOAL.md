---
schema: RB-007
last_updated: 2026-06-24
project: ecc-method (汎用 Method 整備)
branch: develop
---

# GOAL - 北極星

このファイルは **ecc-method パッケージ自身の開発・整備用** 北極星。`develop` branch でのみ追跡される。
配布版 (`main` branch) には含めない (`.gitignore` 対象)。

---

## 北極星 (1 文)

**SDD と TDD を汎用化し、どの案件でも使える Method として ecc-method に整備し、配布可能な状態にする。**

## 何を「汎用化」と呼ぶか

- 案件依存 (固有プロダクト名・組織名・特定リポ構造) を含まない
- 実機で運用検証されている (思考実験ではなく、最低 1 案件で完走した)
- 出典付き (Anthropic / OpenAI 公式 + 学術一次情報)
- 別ユーザーが README + 3 ステップで導入できる
- v1.0 として版が切られている (semver、CHANGELOG あり)

## 「本リポ MVP」の位置づけ

`C:/Users/tie209174/Documents/GitHub/企業情報収集/` の MVP は **検証用題材の 1 つ**。
Method の有効性を測る道具であり、Method 整備の主目的ではない。

過去の Session 1-2 で「MVP 稼働」が主目的化していたのは方向性ミス。本 GOAL.md で訂正する。

## サブゴール

| 順序 | サブゴール | 完了状態 |
|---|---|---|
| 1 | ecc-method パッケージの初版作成 | ✅ 完了 (2026-06-23 初版、commit `6ac0ab8` 等) |
| 2 | 段階 1 スモークテスト (Pattern P-004 動作確認) | ✅ 完了 (Session 1) |
| 3 | **SDD/TDD 章の汎用化精査** (30_sdd-phase / 35_tdd-phase) | ⏳ 未着手 |
| 4 | 検証題材で運用フィードバック取得 (本リポ MVP 等を活用) | ⏳ 未着手 |
| 5 | フィードバックを Method に反映 (汎用化精度向上) | ⏳ 未着手 |
| 6 | v1.0 リリース整理 (採番再定義 / リンク張替え / CHANGELOG / RB-008 Release Discipline) | ⏳ 未着手 (HW-D) |
| 7 | 別ユーザーで再現性確認 (3 ステップ導入が成立するか) | ⏳ 未着手 |

## 完了の定義 (案件全体)

- [ ] 30_sdd-phase / 35_tdd-phase が「案件依存ゼロ」「出典付き」「実機検証済」状態
- [ ] 全 130+ ファイルから個人/組織情報・絶対パス・採番ノイズが排除されている
- [ ] CHANGELOG.md が整備されている
- [ ] main branch に v1.0.0 tag が付いている
- [ ] README の 3 ステップで別ユーザーが導入できる (再現性確認済)
- [ ] develop branch と main branch の役割分離が機能している

## 制約

- **配布物 (main branch) に開発進捗を混入させない** (`.handover/` は develop のみ)
- **Method の自己整備で本来作業から逸脱しない** (Session 1 で学習済)
- **1 セッション 1 タスク原則** (RB-007)
- **個人/組織情報禁止** (PATH POLICY、25_writing-style/)
- semver: v0.x = 試行錯誤期、v1.0+ = 公開・配布期

## スコープ外 (今回やらないこと)

- 商用サポート / SaaS 化
- 別 LLM プロバイダ実装の網羅 (Anthropic / OpenAI のみ初版でカバー)
- 全章の機械検証 (人手レビューと自動 grep の併用、完全自動化は v2 以降)

## 関連

- METHOD.md §1 (Method の目的)
- .handover/PENDING.md (中粒度タスクリスト)
- .handover/current_session.md (現セッションのフォーカス)
- 45_runbook/runbooks/RB-007 (1-session-1-task 規律)
- 45_runbook/runbooks/RB-008 (Branch / semver 規律、HW-E で作成予定)
