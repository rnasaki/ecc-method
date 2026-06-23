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
| D | Defect (不具合修正) | 既知のバグを修正する場合 |

### 2.2 選択ルール

- 利用者から見える追加 → F
- 既存の F を変更 → E (元の F<NN> ID は維持し、新しく E<NN> を発行)
- 利用者影響なし → R
- バグ票起因 → D (バグ票番号と紐付け)
- 1 つの変更が複数種別にまたがる場合は、利用者影響が大きい方を採用する。

## 3. NN 連番ルール

- 種別ごとに独立した連番を持つ (F01, F02 ... と E01, E02 ... は別系列)。
- 欠番は再利用しない。削除された機能の番号は永久欠番とする。
- 99 を超える場合は別ファイル/別フェーズに分割する (採番枯渇は仕様分割のシグナル)。

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
| テストファイル名 | `test_F03_pdf_text_extract_*.py` のように接頭辞化 |

## 7. アンチパターン

- 同じ機能に対し PRD と design で異なる slug が使われる (リネーム時に同期されていない)。
- ID が日本語を含む (ファイル名・grep の障害)。
- 連番をスキップして 03, 05, 08 のように飛ばす (欠番管理ができなくなる)。
- E と R を区別せずすべて F に寄せる (リファクタの粒度が見えなくなる)。

## 8. 採番の例

```yaml
# PRD.md フロントマター抜粋
feature_ids:
  - F01-csv-import
  - F02-vendor-list-view
  - F03-pdf-text-extract
  - E01-csv-import-encoding-fallback   # F01 の改善
  - R01-vendor-repository-split         # 構造改善
  - D01-pdf-extract-blank-page-crash    # バグ修正
```

## 出典

- L1: spec-kit (specification-as-code) — https://github.com/github/spec-kit (retrieved_at: 2026-06-23)

## 不確実性

- 種別を 4 つ (F/E/R/D) に絞ったが、組織によっては Security (S) / Operations (O) を別建てにすることもある。本書では「拡張する場合も 1 文字プレフィックスで揃える」原則のみ規定し、追加種別は規定しない。
- NN を 2 桁としたが、長期メンテで 100 を超える場合は 3 桁化が現実的。判断はプロジェクト裁量。
