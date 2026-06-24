---
keywords: [sdd-phase, tasks, template]
related: []
---
# 30_sdd-phase / 05 Tasks テンプレート

> tasks.md は design.md を実装可能な順序付きタスクに分解した文書。
> 各タスクが AC を 1 つ以上カバーすることを「AC カバレッジ表」で保証する。

## 1. 文書配置

- 配置先: `specs/<feature-set>/tasks.md`
- フロントマター必須: `feature_ids:`、`design_ref:`、`requirements_ref:`

## 2. タスクの粒度

- 1 タスク = 1 PR (Pull Request) 相当。トランクベース開発 (BP-023) と整合する短命ブランチ単位。
- 目安: 半日〜1.5 日で完了し、テストを含めて 800 行以内の差分。
- 上限超過の場合は分割。下限を切る場合は隣接タスクと結合。

## 3. タスク記述の標準フィールド

```yaml
- id: T01
  title: <短い動詞句>
  feature_ids: [F03-pdf-text-extract]
  covers_ac: [AC-01, AC-02]
  depends_on: []
  est_hours: 4
  artifacts:
    - src/extractor/pdf.py
    - tests/test_F03_pdf_text_extract.py
  done_when:
    - 全テストが green
    - covers_ac 列の AC を充足する自動テストが追加されている
```

| フィールド | 必須 | 内容 |
|-----------|------|------|
| id | yes | T<NN> 連番 (TaskID) |
| title | yes | 動詞句で始める (「実装する」より具体的に) |
| feature_ids | yes | このタスクが寄与する Feature ID |
| covers_ac | yes | 充足する AC の一覧 (空配列禁止: 後述の例外を除く) |
| depends_on | no | 先行タスク ID。トポロジカル順序で配置 |
| est_hours | yes | 見積もり時間 (整数) |
| artifacts | yes | 追加/変更されるファイルパス |
| done_when | yes | 完了判定条件 (BP-027 の証拠提示原則) |

### 3.1 covers_ac が空でよい例外

- 環境構築タスク (T01: リポジトリ初期化など)
- リファクタタスク (R 系 ID と紐付ける)

これらは `covers_ac: []` を許容するが、`R<NN>` ID と関連付ける、または `notes:` に理由を書く。

## 4. 順序付けの規則

- `depends_on` を満たす前提でトポロジカル順に並べる。
- 並列実行可能なタスクは「フェーズ」でグルーピング (例: Phase 1 = 基盤、Phase 2 = 機能、Phase 3 = 統合)。
- 1 つのフェーズ内では実行順を問わない。

## 5. AC カバレッジ表 (必須)

tasks.md の末尾に以下の表を必ず置く。

| Feature ID | AC | 担当タスク | テストファイル |
|------------|----|-----------|---------------|
| F03-pdf-text-extract | AC-01 | T03 | tests/test_F03_pdf_text_extract.py::test_AC_01 |
| F03-pdf-text-extract | AC-02 | T03 | tests/test_F03_pdf_text_extract.py::test_AC_02 |
| F03-pdf-text-extract | AC-03 | T05 | tests/test_F03_pdf_text_extract.py::test_AC_03 |

### 5.1 検証ルール

- requirements.md に存在する全 AC が、表に 1 行以上含まれること。
- 1 つの AC が複数タスクにまたがる場合は複数行で表現する。
- 1 つも担当タスクがない AC があれば tasks.md は不完全とみなし、Gate 3 で差し戻す。

## 6. 完了判定 (Definition of Done)

各タスクの `done_when` には以下を最低限含める。

- [ ] 単体テストが green (`35_tdd-phase/03_coverage-policy.md` の 80% を満たす)
- [ ] covers_ac の AC に対応するテストが追加されている
- [ ] code-reviewer エージェントによるレビューを通過
- [ ] (該当する場合) security-reviewer によるレビューを通過

## 7. 進捗管理との連動

- タスク ID をブランチ名に含める: `feature/F03-T05-extract-blank-page`
- PR タイトル/本文に T<NN> を含める。
- CI ジョブ名にも反映するとログ追跡が容易。

## 8. アンチパターン

- AC カバレッジ表が無い、または更新されていない。
- 1 タスクが 1 週間級の規模 (PR が肥大化し review-feasible でなくなる)。
- depends_on を書かず暗黙の順序に依存。
- done_when が「実装する」のみで証拠 (テスト/ログ/スクショ) を要求していない。

## 9. 関連リンク

- `03_requirements-template.md` — AC の定義
- `04_design-template.md` — 設計からタスクへの落とし込み
- `06_review-gates.md` — Gate 3 のレビュー観点
- `35_tdd-phase/` — 実装フェーズの規約

## 出典

- L1: BP-023 Trunk-Based Development — https://trunkbaseddevelopment.com/ (retrieved_at: 2026-06-23)
- L1: BP-027 evidence-based completion — `./05_principles/_data/best_practices.json` (retrieved_at: 2026-06-23)
- L1: spec-kit (specification-as-code) — https://github.com/github/spec-kit (retrieved_at: 2026-06-23)

## 不確実性

- est_hours の精度は属人化しやすい。本書は「整数で記載」のみ規定し、見積もり手法 (Planning Poker 等) は規定しない。
- フェーズ分割の粒度はプロジェクト規模に依存するため、本書は「並列可能性で括る」原則のみ規定する。
