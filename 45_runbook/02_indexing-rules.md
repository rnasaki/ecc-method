# 02 — Indexing Rules

INDEX.md の自動更新規約・タグ規約・カテゴリ命名規約。Runbook を作っても索引に乗らなければ再利用されないため、索引の整合性が運用の生命線になる。

## INDEX 更新の原則

1. **新規作成と同時に追記**: Runbook 本体を書いた直後の同一コミットで INDEX に追記する
2. **削除しない**: `deprecated` 化しても entry は残す (履歴保全)
3. **last_verified を二重管理しない**: Runbook 本体の frontmatter と INDEX は同じ値を持つ。Runbook 側を一次ソースとし INDEX を派生扱いにする

## エントリスキーマ (再掲)

```yaml
runbooks:
  - id: RB-<NNN>-<slug>
    title: <表示タイトル>
    category: <category>
    tags: [<tag>]
    trigger: <検索ヒット用の自然文>
    path: ./runbooks/RB-<NNN>-<slug>.md
    last_verified: YYYY-MM-DD
    status: active | review-due | stale | deprecated
```

## ID 命名規約

```
RB-<3 桁連番>-<kebab-slug>
```

- 連番は予約制ではなく **追加順**
- slug は英数 + `-`、長さ 3〜40 文字、複数語可
- 大文字禁止、`_` 禁止 (kebab 統一)

良い例:
- `RB-001-python-venv-bootstrap`
- `RB-014-gh-auth-token-refresh`
- `RB-027-mcp-server-add`

悪い例:
- `RB-1-Python_Setup` (連番ゼロパディング無し / アンダースコア / 大文字)
- `RB-042-x` (slug が短すぎ意味不明)
- `RB-100-very-long-runbook-name-that-keeps-going` (40 字超)

## カテゴリ命名規約

`01_runbook-spec.md` で定義済の 8 カテゴリのみ使用する。新カテゴリを増やしたい場合は spec 側を先に更新する。

| category | 説明 | 命名例 (slug) |
|---|---|---|
| `bootstrap` | 環境 / リポ初期化 | `RB-NNN-python-venv-bootstrap` |
| `deploy` | デプロイ / リリース | `RB-NNN-cf-push` |
| `debug` | 失敗診断 | `RB-NNN-proxy-ssl-failure` |
| `infra` | インフラ操作 | `RB-NNN-db-migration` |
| `review` | レビュー / 承認 | `RB-NNN-pr-review-checklist` |
| `domain` | 業務固有 | `RB-NNN-invoice-format-conversion` |
| `pitfall` | ハマり脱出 | `RB-NNN-gh-token-expired` |
| `tooling` | ツール導入 | `RB-NNN-mcp-server-add` |

迷ったら以下決定木:
```
失敗から脱出する手順? → pitfall
特定ツールの設定?     → tooling
リポ・環境の初期化?  → bootstrap
本番に出す手順?       → deploy
障害調査の手順?      → debug
業務知識を要する?    → domain
それ以外で人間判断?  → review
DB / cluster 操作?    → infra
```

## タグ規約

タグは検索ヒット率を上げる二次キーワード。category と重複させない。

### 推奨タグ
- 言語: `python`, `typescript`, `go`, `rust`, ...
- フレームワーク: `fastapi`, `react`, `django`, ...
- ツール: `gh`, `git`, `docker`, `mcp`, `claude-code`, ...
- 環境: `windows`, `wsl`, `linux`, `macos`, `corporate-proxy`
- フェーズ: `setup`, `migration`, `rollback`
- 状況: `first-time`, `recurring`, `emergency`

### タグ命名ルール
- 小文字英数 + `-`
- 1〜3 単語
- 1 Runbook に 2〜5 個 (少なすぎ / 多すぎは検索性低下)

### タグ運用
- 既存 INDEX の tag を grep して、新規追加前に類似タグを確認
- 同義語の乱立を避ける (例: `auth` と `authentication` は片方に統一)
- 現存タグ表は `INDEX.md` 末尾に「タグ辞書」として併記する

## trigger 文の書き方

trigger は検索プロトコル (`04_search-protocol.md`) で fuzzy 一致用に使う自然文。

良い trigger:
> 「Python の venv を作って依存をインストールしたい」
> 「gh push が 401 で失敗する」
> 「proxy 環境で pip install の SSL 検証が落ちる」

悪い trigger:
> 「Python」 (短すぎ)
> 「Bootstrap procedure for development environment using virtual environment」 (フォーマル過ぎ・ヒット率低)
> 「ハマったらこれ」 (中身に触れていない)

ルール:
- 想定される **ユーザーの口語フレーズ** を 1 文
- 動詞を含める (「したい」「失敗する」「設定する」)
- 30〜80 字
- 1 Runbook 1 trigger (複数候補があれば本文の冒頭に列挙)

## 自動追記スクリプト (推奨形)

新規 Runbook 作成時に以下を実行する想定 (シェル例; 案件側で実装):

```bash
# 入力: Runbook ファイルパス
RB_FILE=./45_runbook/runbooks/RB-NNN-slug.md

# frontmatter から id / title / category / tags / trigger / last-verified を抽出
# INDEX.md の runbooks: 配下に YAML エントリを追記
# カテゴリ別ビュー (件数表) を再計算
```

スクリプトが無くても手動追記は可。手動の場合は本ファイルのスキーマに厳密に合わせる。

## 鮮度ステータスの自動再計算

INDEX 表示用の `status` は `last_verified` から導出する:

```
今日 - last_verified
  ≤ 90 日   → active
  ≤ 180 日  → review-due
  ≤ 365 日  → stale
  > 365 日  → deprecated (要明示確認)
```

明示的に `status: deprecated` を書いた entry はそのまま残す (再計算しない)。

詳細は `05_maintenance.md`。

## カテゴリ別ビューの更新

INDEX.md 末尾の「カテゴリ別ビュー」表は、エントリ追加 / 削除 / status 変更のたびに件数を再計算する。手動更新でも構わないが、漏れやすいので自動化を推奨。

## INDEX 整合性チェック

定期的に以下を確認 (`05_maintenance.md` で詳述):

- [ ] 全 Runbook ファイルが INDEX に登録されている (孤立 Runbook 検出)
- [ ] INDEX に登録された path が実在する (リンク切れ検出)
- [ ] frontmatter の last_verified と INDEX の値が一致
- [ ] 重複 ID がない
- [ ] 全 entry の trigger が空でない

## アンチパターン

| アンチパターン | 症状 | 対処 |
|---|---|---|
| Runbook を書いて INDEX に登録し忘れる | 検索でヒットせず再調査 | コミット時に自動チェック (hook) |
| 似たタグの乱立 (`auth` / `authentication`) | 検索分散 | タグ辞書で統一 |
| trigger を英語で書く | 日本語クエリでヒットしない | 想定ユーザーの言語で書く |
| ID 連番をスキップして再利用 | 履歴混乱 | 連番は厳密に追加順 |
| deprecated を削除する | 過去の手順を再生不能 | status 変更のみ |

## 出典

- 内部 SSOT: `45_runbook/01_runbook-spec.md`, `45_runbook/INDEX.md`
- BP-016: Anthropic Claude Code skills docs (https://code.claude.com/docs/en/skills, retrieved 2026-06-23)

## 不確実性

- 自動追記スクリプトの実装は本パッケージで提供しない (案件依存)。最低限「INDEX に書き忘れたコミットを reject する」hook が望ましい。
- カテゴリ 8 種は経験則。プロジェクト規模に応じて分割が必要になる場合は spec 側を更新する。
- タグ辞書の運用主体 (誰が同義語統一を判断するか) は導入先で決める。
