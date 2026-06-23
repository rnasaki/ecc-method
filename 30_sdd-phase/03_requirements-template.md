# 30_sdd-phase / 03 Requirements テンプレート

> requirements.md は PRD で定義した各 Feature ID に対し、検証可能な受け入れ条件 (Acceptance Criteria, AC) を Given/When/Then で記述する文書。
> 詳細なテンプレート本体は `70_templates/` 配下に配置し、本書では「書き方の規約」のみ規定する。

## 1. 文書配置

- 配置先: `specs/<feature-set>/requirements.md`
- 1 ファイルに複数 Feature ID を含めて良いが、ファイル分割は 800 行を超える前に行う。
- フロントマター必須: `feature_ids:` 配列、`prd_ref:` で対応 PRD.md を相対参照。

## 2. ブロック構造

各 Feature ID ごとに以下 4 ブロックを順に書く。

```
## <FeatureID> <タイトル>

### 概要
1〜3 行で機能の目的を記述。PRD の引き写しではなく、要件視点で言い直す。

### ユーザストーリー
- As a <利用者>, I want <欲求>, so that <価値>.
- 必要なら複数行 (利用者ロール別)。

### 受け入れ条件 (Acceptance Criteria)
- AC-01 ... (Given/When/Then)
- AC-02 ...
...

### 非機能要件 (任意)
- 性能、可用性、セキュリティ等
```

## 3. AC-NN 採番規則

- フォーマット: `AC-NN`、NN は 2 桁ゼロ埋め (01〜99)
- 採番は Feature ID 内でローカルに閉じる (F03 の AC-01 と F04 の AC-01 は別物)
- 欠番再利用禁止 (削除した AC の番号は永久欠番)

## 4. Given/When/Then 規約

### 4.1 基本形

```
- AC-01:
  - Given: <前提状態>
  - When: <利用者またはシステムの操作>
  - Then: <観測可能な結果>
```

### 4.2 書き方ルール

| 観点 | ルール |
|------|--------|
| Given | システムの状態を客観事実で書く。「〜が登録されている」「〜が空である」 |
| When | 1 操作のみ。複数操作は AC を分ける |
| Then | 観測可能な結果のみ。「正しく動く」のような検証不能語は禁止 |
| 主語 | When の主語は「利用者」または「システム」のどちらかに統一 |
| 時制 | Given は現在完了、When は現在、Then は現在 |

### 4.3 拡張形 (And / But)

- 複数の前提や複数の検証点が必要な場合のみ使う。
- And/But を 4 行以上重ねる場合は AC 分割を検討する。

```
- AC-02:
  - Given: 利用者がログイン済みである
  - And: 取引先マスタに 100 件登録されている
  - When: 利用者が取引先一覧を開く
  - Then: 直近更新順で 20 件が表示される
  - And: ページネーションリンクが表示される
```

## 5. 検証可能性チェック

各 AC について以下 3 点が満たせない場合は書き直す。

- [ ] 自動テストで Given/When/Then をそのままコード化できるか
- [ ] Then の観測対象が「画面表示」「API レスポンス」「DB の状態」「ファイル内容」など客観的に確認可能か
- [ ] AC を満たすかどうかが二者択一 (合格/不合格) で判定できるか

## 6. 非機能要件の書き方

- 性能: 「P95 応答時間 < 500ms」のように数値+測定方法を明示
- 可用性: 「月間稼働率 99.5% 以上」のように観測単位を明示
- セキュリティ: OWASP Top 10 該当項目を引用するか、具体的な脅威モデルを書く

## 7. AC とテストのトレース

- テスト関数名に AC 番号を含める例: `test_F03_AC_01_extract_blank_page_returns_empty()`
- tasks.md の AC カバレッジ表 (`05_tasks-template.md`) で全 AC が少なくとも 1 テストと紐付くことを保証する。

## 8. アンチパターン

- 「正しく動作すること」「ユーザにとって使いやすいこと」のような検証不能語。
- When に 2 操作を詰め込む (「ログインしてフォーム送信したとき」)。
- Then に実装詳細を書く (「テーブルの updated_at が更新される」だけで利用者観測不能)。
- AC が PRD の機能説明をそのまま貼っただけ。

## 9. 関連リンク

- `01_prd-flow.md` — PRD と requirements の対応
- `04_design-template.md` — design.md がどう requirements を消費するか
- `05_tasks-template.md` — AC カバレッジ表の様式
- `70_templates/` — 実体テンプレートファイル群

## 出典

- L1: spec-kit (executable specifications) — https://github.com/github/spec-kit (retrieved_at: 2026-06-23)
- L1: BP-020 Spec-First / BP-021 Red-Green-Refactor — `./05_principles/_data/best_practices.json` (retrieved_at: 2026-06-23)

## 不確実性

- Given/When/Then 以外の記法 (例: Behavior-Driven Development の Scenario Outline 形式) を採用するチームもあるが、本書では Given/When/Then を標準とし、Outline 形式の採否は規定しない。
- 非機能要件のしきい値はプロジェクト個別。本書は「数値+測定方法を併記」原則のみ規定する。
