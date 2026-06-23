# 02 — bootstrap.sh の使い方

新規リポを本パッケージの規約で立ち上げるための初期化スクリプト `bootstrap.sh` の操作手順。

## 1. 目的

- 本パッケージのディレクトリ骨格を作成
- プロファイル別の初期テンプレート (.gitignore / .env.example) を配置
- 冪等動作 (二回流しても破綻しない)
- 個人・組織情報を含めない (再配布可能)

## 2. 前提

- Bash が実行可能 (Linux / macOS / Git Bash on Windows)
- カレントディレクトリ = 新規リポのルート
- 既存ファイルは破壊しない (既存があれば skip)

## 3. 基本コマンド

```bash
bash ecc-method/80_commands/bootstrap.sh --profile=web
```

`--profile` の選択肢:

| 値 | 想定スタック | 主な追加ディレクトリ |
|---|---|---|
| `web` | Web アプリ (frontend + backend) | `app/`, `api/`, `tests/` |
| `cli` | CLI ツール / 開発支援ツール | `cmd/`, `internal/`, `tests/` |
| `data` | データパイプライン / 分析 | `pipelines/`, `notebooks/`, `data/` |
| `mobile` | iOS / Android / クロスプラットフォーム | `app/`, `platform/`, `tests/` |
| `research` | 研究プロトタイプ / 検証用 | `experiments/`, `notes/`, `data/` |

`--profile` を省略した場合は対話で選択させず、エラー終了する (再現性確保のため)。

## 4. 配置されるもの

すべてのプロファイル共通:

```
ecc-method/                     ... 本パッケージ (cp 済を前提)
.gitignore                      ... 雛形 (既存があれば skip)
.env.example                    ... 雛形 (既存があれば skip)
docs/                           ... PRD / requirements / design / tasks の置き場
.tmp/                           ... ephemeral 出力 (必ず .gitignore へ)
```

プロファイル別のサブディレクトリは `bootstrap.sh` が `case "${PROFILE}"` で分岐する。

## 5. 想定する追加オプション

| オプション | 目的 |
|---|---|
| `--profile=<NAME>` | 必須 |
| `--root=<PATH>` | 配置先のルート (既定: カレント) |
| `--health-check` | 健全性 KPI のスナップショットのみ生成 |
| `--dry-run` | 実際には作成せず、計画のみ表示 |

## 6. 冪等性の検証

冪等動作の確認方法:

```bash
bash ecc-method/80_commands/bootstrap.sh --profile=web --dry-run
bash ecc-method/80_commands/bootstrap.sh --profile=web
bash ecc-method/80_commands/bootstrap.sh --profile=web   # 2 回目
echo "exit=$?"
git status                                               # 差分が増えないこと
```

2 回目の実行で新規ファイルが増えなければ冪等。

## 7. PATH POLICY

- 絶対パスを使わない。すべて変数 (`${PROJECT_ROOT}` など) で表現する
- スクリプト先頭で `PROJECT_ROOT="$(pwd)"` を設定し、以降は相対参照のみ
- `~` (チルダ) は POSIX 環境差異があるため使用しない

## 8. 起動後の次手順

```
1. ecc-method/10_discovery/ を実行
2. ecc-method/30_sdd-phase/ で PRD → requirements → design → tasks
3. ecc-method/35_tdd-phase/ で TDD ループ
4. ecc-method/45_runbook/INDEX.md を案件用に更新
```

## 9. 失敗例 (避ける)

- `--profile` を付けずに対話で続行する (再現性が崩れる)
- 既存 `.gitignore` を上書きする (冪等性違反)
- ホームディレクトリを `${PROJECT_ROOT}` にして実行する (誤って大量作成)

## 10. テスト方針

新規環境で以下を毎回確認する:

- [ ] dry-run で計画が表示される
- [ ] 1 回目で 5 プロファイルすべてが正常終了する
- [ ] 2 回目で差分が増えない
- [ ] `git status` で意図しない変更が出ない
- [ ] PATH POLICY 違反 (絶対パス) を含まない

## 11. 関連

| 連携先 | 用途 |
|---|---|
| [bootstrap.sh](./bootstrap.sh) | 実体 |
| [01_slash-commands.md](./01_slash-commands.md) | スラッシュコマンドとの紐付け |
| [20_repo-bootstrap/](../20_repo-bootstrap/) | プロファイル別チェックリスト本文 |
| [15_environment/](../15_environment/) | CLI / MCP / 権限初期化 |

## 出典

- 本パッケージ README.md §使い方 (retrieved 2026-06-23)
- 本パッケージ 20_repo-bootstrap/ (planned, retrieved 2026-06-23)
- POSIX shell 互換性 (https://pubs.opengroup.org/onlinepubs/9699919799/, retrieved 2026-06-23)

## 不確実性

- Windows 環境では Git Bash を前提とする。POSIX 非互換シェル (cmd.exe / PowerShell) は対象外。
- プロファイル種別は 5 つに固定したが、案件側で増設する余地は残す。増設時は本パッケージへ正式取り込みを `03_knowledge-acquisition.md` 経由で行う。
