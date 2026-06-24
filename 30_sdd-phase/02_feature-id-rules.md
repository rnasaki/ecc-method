---
keywords: [sdd-phase, feature, rules]
related: [55_verification/01_traceability.md, 55_verification/02_drift-detection.md]
---
# 30_sdd-phase / 02 Feature ID 採番規則

> 機能 ID は仕様 (PRD/requirements/design/tasks) とコード/テストを横串で紐付けるキー。
> 採番が揺らぐと AC カバレッジ表が破綻するため、命名規則を固定する。

## 1. 形式

```
<種別>NN-<kebab-slug>
```

- 種別: 1 文字のプロジェクト種別プレフィックス (下記 2.1)
- NN: 2 桁ゼロ埋め連番 (01-99)
- kebab-slug: ASCII 小文字とハイフンのみ、3〜40 文字、末尾ハイフン禁止

例: `F03-pdf-text-extract` / `E07-vendor-onboarding` / `R12-fraud-score`

## 2. 種別プレフィックス

### 2.1 種別の選択指針

| 種別 | 用途 | 選択基準 |
|------|------|----------|
| F | Feature (機能追加) | 利用者から見える新機能を追加する場合 |
| E | Enhancement (機能改善) | 既存機能の挙動・性能・体験を改善する場合 |
| R | Refactor (構造改善) | 利用者から見える挙動を変えずコード構造を変える場合 |
| B | Bug fix (不具合修正) | 既知のバグを修正する場合 (バグ票番号と紐付け) |

> 注: Bug fix のプレフィックスは `B` を採用する。トレーサビリティ章 ([../55_verification/01_traceability.md](../55_verification/01_traceability.md)) で Design 要素プレフィックス `D<NN>-A` を別概念として使うため、Feature ID 種別では `D` を避ける。

### 2.2 選択ルール

- 利用者から見える追加 → F
- 既存の F を変更 → E (元の F<NN> ID は維持し、新しく E<NN> を発行)
- 利用者影響なし → R
- バグ票起因 → B (バグ票番号と紐付け)
- 1 つの変更が複数種別にまたがる場合は、利用者影響が大きい方を採用する。

## 3. NN 連番ルール

- 種別ごとに独立した連番を持つ (F01, F02 ... と E01, E02 ... は別系列)。
- 欠番は再利用しない。削除された機能の番号は永久欠番とする。
- 99 を超える場合の対応はプロジェクト裁量。仕様分割 (別ファイル/別フェーズ) と 3 桁化 (FNNN) のいずれかを選ぶ。長期メンテで 100 超が想定される場合は最初から 3 桁で始めてよい。

## 4. kebab-slug ルール

| 規則 | 例 (OK) | 例 (NG) |
|------|---------|---------|
| 英小文字とハイフンのみ | `pdf-text-extract` | `PDF_TextExtract` |
| 3 文字以上 40 文字以下 | `vendor-onboarding` | `vo` (短すぎ) |
| 動詞 + 目的語、または名詞句 | `extract-invoice-total` | `do-it` |
| 略語は広く使われるもののみ | `csv-import` | `bgnr-flw` (独自略語) |
| 末尾ハイフン禁止 | `fraud-score` | `fraud-score-` |

## 5. 採番タイミング

| フェーズ | 操作 |
|----------|------|
| Discovery 終了時 | まだ採番しない (発散段階) |
| PRD ドラフト時 | 機能一覧に並び順で採番 |
| Requirements 着手時 | 採番固定 (以後は欠番化のみ) |
| 実装後 | 採番変更禁止 (リネームは別 ID 発行扱い) |

## 6. 横串トレーサビリティ

| 成果物 | 参照方法 |
|--------|----------|
| PRD.md | `## 機能一覧` 表に ID 列 |
| requirements.md | 各機能ブロックの見出しを `## F03-pdf-text-extract` |
| design.md | 「対応機能」欄に ID を列挙 |
| tasks.md | タスクごとに `feature_ids: [F03-...]` |
| Pull Request | タイトルまたは本文に ID を含める |
| テストファイル名 | `test_F03_pdf_text_extract_*.py` のように接頭辞化 (言語規約と衝突する場合は `tests/F03/...` のようにディレクトリ分離でも可) |

## 7. アンチパターン

- 同じ機能に対し PRD と design で異なる slug が使われる (リネーム時に同期されていない)。
- ID が日本語を含む (ファイル名・grep の障害)。
- 連番をスキップして 03, 05, 08 のように飛ばす (欠番管理ができなくなる)。
- E と R を区別せずすべて F に寄せる (リファクタの粒度が見えなくなる)。
- Feature ID 種別 `D` (Defect) を使い、トレーサビリティ章の Design 要素 `D<NN>-A` と grep で衝突させる (本書では `B` を採用してこれを回避)。

## 8. 採番の例

```yaml
# PRD.md フロントマター抜粋
feature_ids:
  - F01-csv-import
  - F02-vendor-list-view
  - F03-pdf-text-extract
  - E01-csv-import-encoding-fallback   # F01 の改善
  - R01-vendor-repository-split         # 構造改善
  - B01-pdf-extract-blank-page-crash    # バグ修正
```

## 出典

- L1: spec-kit (specification-as-code) — https://github.com/github/spec-kit (retrieved_at: 2026-06-23)
- §1 形式 / §2 種別プレフィックスの大枠は spec-kit の AC 採番慣習を踏襲。
- §3 種別ごと独立連番、§5 採番タイミング (Discovery では採番しない / Requirements 着手時に固定)、§6 横串トレーサビリティ表は本パッケージ独自規定 (spec-kit には拘束なし)。

## 不確実性

- 種別を 4 つ (F/E/R/B) に絞ったが、組織によっては Security (S) / Operations (O) を別建てにすることもある。本書では「拡張する場合も 1 文字プレフィックスで揃える」原則のみ規定し、追加種別は規定しない。
- NN を 2 桁としたが、長期メンテで 100 を超える場合は 3 桁化が現実的。判断はプロジェクト裁量。
- バグ修正プレフィックスは初版で `D` (Defect) としていたが、トレーサビリティ章 ([../55_verification/01_traceability.md](../55_verification/01_traceability.md)) で Design 要素を `D<NN>-A` 形式で表記しており grep 衝突する。本書では `B` (Bug fix) を採用してこれを回避。既存プロジェクトで `D` 系統の Defect ID を採用済の場合は、Design 要素を別形式 (例: `DES12-A`) に振り直すか、Defect 用に `B` へ移行するかをプロジェクト裁量で選ぶ。
- §6 のテストファイル名規約 `test_F03_pdf_text_extract_*.py` は Python の慣習に寄せた例で、Java/Go/TypeScript 等では言語固有の命名規約 (PascalCase, camelCase など) と衝突する。各言語で実機検証していないため、衝突時はディレクトリ分離 (`tests/F03/...`) を推奨する。
- §3 で「種別ごとに独立連番」を規定したが、組織によっては全種別通し連番 (F01, E02, R03... の混在系列) を採る運用もある。本書では独立連番を推奨するが、強制ではない。
- 各成果物 (PRD/requirements/design/tasks) における ID 表記の整合性 (リネーム時の同期) は実機での運用検証が未完了。Drift 検知の仕組みは [../55_verification/02_drift-detection.md](../55_verification/02_drift-detection.md) に依存する。
