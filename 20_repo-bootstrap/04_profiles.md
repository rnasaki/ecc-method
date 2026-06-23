# 20-04 — Bootstrap Profiles

新規リポを 5 種類のプロファイルに分類し、各々の標準スタック / ディレクトリ / 初期コマンド / 初期 Runbook を定める。

## プロファイル一覧

| profile | 想定 | primary lang | 主目的 |
|---|---|---|---|
| `web` | Web SaaS / 社内 web ツール | TypeScript or Python | 画面付きアプリ |
| `cli` | コマンドラインツール | Go or Rust | 単一バイナリ配布 |
| `data` | データパイプライン / ETL | Python | バッチ / 分析 |
| `mobile` | モバイルアプリ | Dart (flutter) | iOS/Android 同時 |
| `research` | 調査 / 実験 | Python (jupyter) | 再現可能な分析 |

判断基準は [10_discovery/03_stack-inference.md](../10_discovery/03_stack-inference.md) の `feature_kind` と整合させる。

## profile: web

### 標準スタック

| 項目 | 既定 |
|---|---|
| FW | next.js (app router) |
| 言語 | TypeScript |
| package manager | pnpm |
| DB | postgres (managed) |
| auth | next-auth or 3rd party (auth-providers) |
| hosting | vercel | cloud-run | fly |
| test | vitest + playwright |

### 追加ディレクトリ

```
src/
├── app/                # next.js app router
├── components/
├── lib/
├── server/             # Server Actions / API
└── types/
public/
tests/
└── e2e/                # playwright
```

### 初期コマンド (例)

```
pnpm dlx create-next-app@latest <name> --ts --eslint --app --src-dir --import-alias '@/*'
pnpm add zod
pnpm add -D vitest @vitest/coverage-v8 @playwright/test
pnpm exec playwright install
```

### 初期 Runbook 候補

- `rb-web-001`: ローカル DB を docker compose で立てる
- `rb-web-002`: vercel preview デプロイの作り方
- `rb-web-003`: e2e の attach パターン ([15_environment/03_browser-automation.md](../15_environment/03_browser-automation.md))

## profile: cli

### 標準スタック

| 項目 | 既定 |
|---|---|
| 言語 | Go (or Rust) |
| flag parser | spf13/cobra (Go) | clap (Rust) |
| log | slog (Go) | tracing (Rust) |
| 配布 | goreleaser (Go) | cargo-dist (Rust) |
| test | go test (table driven) | cargo test |

### 追加ディレクトリ

```
cmd/<name>/
└── main.go
internal/
├── cli/
└── core/
docs/
└── usage.md
.goreleaser.yaml
```

### 初期コマンド

```
mkdir -p cmd/<name> internal/{cli,core}
go mod init <module>
echo 'package main
func main() {}' > cmd/<name>/main.go
```

### 初期 Runbook 候補

- `rb-cli-001`: バージョン埋め込み (`-ldflags`)
- `rb-cli-002`: cross-compile マトリクス
- `rb-cli-003`: signed release (gpg / sigstore)

## profile: data

### 標準スタック

| 項目 | 既定 |
|---|---|
| 言語 | Python |
| runtime | uv |
| 主要 lib | pandas | polars, duckdb |
| orchestrator | prefect | dagster (規模で選定) |
| DB | postgres | duckdb (ローカル) |
| test | pytest |

### 追加ディレクトリ

```
src/<pkg>/
├── pipelines/
├── transforms/
├── io/
└── schemas/
notebooks/
data/
├── raw/                # gitignore
├── intermediate/       # gitignore
└── processed/          # 必要なら commit
```

### 初期コマンド

```
uv init
uv add pandas polars duckdb
uv add --dev pytest pytest-cov
mkdir -p notebooks data/{raw,intermediate,processed}
```

### 初期 Runbook 候補

- `rb-data-001`: 大容量 CSV → parquet の変換
- `rb-data-002`: スキーマ drift 検出
- `rb-data-003`: DAG 1 ジョブの再実行手順

## profile: mobile

### 標準スタック

| 項目 | 既定 |
|---|---|
| FW | flutter |
| 言語 | dart |
| 状態管理 | riverpod | provider | bloc (要件で選定) |
| backend | firebase | supabase |
| test | flutter_test + integration_test |

### 追加ディレクトリ

```
lib/
├── core/
├── features/<feature>/
│   ├── data/
│   ├── domain/
│   └── presentation/
└── shared/
test/
integration_test/
assets/
```

### 初期コマンド

```
flutter create <name> --org <reverse-domain>
cd <name>
flutter pub add riverpod
flutter pub add --dev integration_test
```

### 初期 Runbook 候補

- `rb-mobile-001`: iOS 実機ビルド設定
- `rb-mobile-002`: Android 署名鍵管理
- `rb-mobile-003`: flavor 切替

## profile: research

### 標準スタック

| 項目 | 既定 |
|---|---|
| 言語 | Python (jupyter) |
| runtime | uv |
| 計算 | numpy / pandas / scipy / pytorch (任意) |
| 可視化 | matplotlib / altair / plotly |
| DB | sqlite | duckdb |
| 再現 | nbqa + papermill |

### 追加ディレクトリ

```
notebooks/
├── 00_intro/
├── 10_explore/
├── 20_experiment/
└── 90_report/
src/<pkg>/                # 共通関数を notebook から import
figures/
data/                     # gitignore
```

### 初期コマンド

```
uv init --no-readme
uv add jupyter ipykernel pandas matplotlib
uv add --dev pytest nbqa papermill
mkdir -p notebooks/{00_intro,10_explore,20_experiment,90_report} figures data
```

### 初期 Runbook 候補

- `rb-research-001`: 計算結果の再現 (papermill 経由)
- `rb-research-002`: notebook → markdown レポート
- `rb-research-003`: 大容量 fixture の DVC 管理

## 補助プロファイル

### `+ai-native`

LLM が中核機能の場合に web/cli/data に重ねる。

- agents 構成: ECC native agents を活用 ([40_delegation/01_expert-registry.md](../40_delegation/01_expert-registry.md))
- vector store: pgvector (small) | qdrant (medium+)
- prompt 管理: `prompts/` ディレクトリ + version pinning
- evaluation: `evals/` で回帰テストを Runbook 化

### `+monorepo`

複数 app を 1 リポで運用する場合。

- ルートに `apps/`, `packages/`, `tools/`
- package manager: pnpm workspace | turbo | nx
- 各 app に本骨格 ([02_directory-skeleton.md](./02_directory-skeleton.md)) を埋める

## 出典

- next.js docs (https://nextjs.org/docs, retrieved 2026-06-23)
- Astral uv docs (https://docs.astral.sh/uv/, retrieved 2026-06-23)
- flutter docs (https://docs.flutter.dev/, retrieved 2026-06-23)
- goreleaser (https://goreleaser.com/, retrieved 2026-06-23)
- duckdb docs (https://duckdb.org/docs/, retrieved 2026-06-23)
- prefect / dagster docs (各公式, retrieved 2026-06-23)

## 不確実性

- 各プロファイルの「既定」は 2026-06-23 時点の慣習。生態系の変化で 6〜12 ヶ月で更新が要りうる。
- 補助プロファイルは web/cli/data 等と独立に重ね掛けする想定だが、組み合わせで衝突する設定 (lockfile 戦略等) は個別調整。
- 言語固有の慣習 (Go の internal/ 等) は version で揺れる。新規構築時は最新公式 docs を参照。
