# 15-02 — CLI Arsenal (必須 CLI 一覧)

ECC で頻出する CLI を分類して並べ、検出 / 導入 / 用途を一覧化する。20 件以上を網羅する。

## 表記

- detect: 在庫確認コマンド (exit 0 で在庫)
- install (代表): winget / brew / apt のいずれか。詳細は [01_capabilities-matrix.md](./01_capabilities-matrix.md)
- 用途: ECC でこの CLI が出番になる典型シーン

## バージョン管理 / VCS

| CLI | detect | install (代表) | 用途 |
|---|---|---|---|
| git | `git --version` | winget Git.Git | 全リポ操作の基盤 |
| gh | `gh --version` | winget GitHub.cli | PR / issue / release 操作 |
| glab | `glab --version` | brew install glab | GitLab 連携 |
| jj | `jj --version` | brew install jj | git 互換の柔軟な VCS (任意) |

## 言語ランタイム / パッケージ

| CLI | detect | install | 用途 |
|---|---|---|---|
| uv | `uv --version` | astral.sh installer | Python 環境 / lockfile |
| pnpm | `pnpm --version` | corepack | Node monorepo |
| node | `node --version` | volta / fnm / nvm | JS 実行 |
| bun | `bun --version` | curl bun installer | 高速 Node 代替 |
| go | `go version` | winget GoLang.Go | Go ビルド |
| cargo | `cargo --version` | rustup | Rust ビルド |
| rustup | `rustup --version` | rustup installer | Rust toolchain 管理 |
| dotnet | `dotnet --info` | 公式 installer | .NET ビルド |

## コンテナ / オーケストレータ

| CLI | detect | install | 用途 |
|---|---|---|---|
| docker | `docker info` | rancher-desktop / colima | コンテナビルド・実行 |
| docker compose | `docker compose version` | docker plugin | 多コンテナ起動 |
| kubectl | `kubectl version --client` | 公式 | k8s 操作 |
| helm | `helm version` | brew install helm | k8s パッケージ |
| kind | `kind --version` | brew install kind | ローカル k8s |

## クラウド CLI

| CLI | detect | install | 用途 |
|---|---|---|---|
| aws | `aws --version` | 公式 MSI / brew | AWS 操作 |
| az | `az --version` | winget Microsoft.AzureCLI | Azure 操作 |
| gcloud | `gcloud --version` | 公式 installer | GCP 操作 |
| cf | `cf --version` | brew install cf-cli@8 | Cloud Foundry / Heroku 互換 PaaS |
| flyctl | `flyctl version` | curl installer | Fly.io デプロイ |
| vercel | `vercel --version` | npm i -g vercel | Vercel デプロイ |

## データ / ファイル操作

| CLI | detect | install | 用途 |
|---|---|---|---|
| jq | `jq --version` | winget jqlang.jq | JSON 整形 |
| yq | `yq --version` | brew install yq | YAML 整形 |
| sqlite3 | `sqlite3 --version` | OS 同梱 / winget SQLite | 軽量 DB / 動作確認 |
| duckdb | `duckdb --version` | brew install duckdb | 列指向分析 |
| ripgrep (rg) | `rg --version` | winget BurntSushi.ripgrep | 高速 grep |
| fd | `fd --version` | brew install fd | 高速 find |
| fzf | `fzf --version` | brew install fzf | 対話絞り込み |
| bat | `bat --version` | brew install bat | 色付き cat |

## ネットワーク / セキュリティ

| CLI | detect | install | 用途 |
|---|---|---|---|
| curl | `curl --version` | OS 同梱 | HTTP 取得 |
| wget | `wget --version` | apt / brew | HTTP 取得 (代替) |
| openssl | `openssl version` | OS 同梱 | TLS / 鍵操作 |
| gitleaks | `gitleaks version` | brew install gitleaks | secret 検出 |
| trufflehog | `trufflehog --version` | brew install trufflehog | secret 検出 |
| age | `age --version` | brew install age | ファイル暗号化 |

## ビルド / 自動化

| CLI | detect | install | 用途 |
|---|---|---|---|
| make | `make --version` | OS 同梱 | 古典的タスク runner |
| just | `just --version` | brew install just | Makefile 代替 |
| task | `task --version` | brew install go-task | YAML タスク |
| pre-commit | `pre-commit --version` | uv tool install pre-commit | hook 管理 |
| direnv | `direnv --version` | brew install direnv | env 自動切替 |

## 観測 / プロファイル

| CLI | detect | install | 用途 |
|---|---|---|---|
| hyperfine | `hyperfine --version` | brew install hyperfine | ベンチ |
| pprof | (go tool pprof) | go 同梱 | Go プロファイル |
| flamegraph | `flamegraph --version` | cargo install flamegraph | フレームグラフ |

## 既定インストール順

```
1. git, gh, ripgrep, jq, curl  (全プロジェクト共通)
2. 言語固有 (uv | pnpm | go | cargo)
3. クラウド (deploy_target で 1 つだけ)
4. docker (containerization == true なら)
5. gitleaks (secret_scan === true なら)
6. ベンチ / プロファイラ (必要時のみ)
```

## 不在時の fallback 一覧

- gh 不在 → curl + REST API + token (限定機能)
- jq 不在 → python -c "import json,sys" でワンライナ
- ripgrep 不在 → grep -rn (低速)
- duckdb 不在 → sqlite3 で代替 (機能制限)

## 出典

- GitHub CLI docs (https://cli.github.com/manual/, retrieved 2026-06-23)
- Astral uv docs (https://docs.astral.sh/uv/, retrieved 2026-06-23)
- pnpm docs (https://pnpm.io/installation, retrieved 2026-06-23)
- Docker docs (https://docs.docker.com/, retrieved 2026-06-23)
- AWS / Azure / GCP CLI 公式 docs (各公式サイト, retrieved 2026-06-23)
- ripgrep README (https://github.com/BurntSushi/ripgrep, retrieved 2026-06-23)
- jq manual (https://jqlang.github.io/jq/manual/, retrieved 2026-06-23)

## 不確実性

- 各 CLI の install コマンドは OS 配布形態で変動する。winget / brew / apt 以外 (chocolatey / scoop / pacman 等) は環境別に補足が必要。
- 一部 CLI (vercel, glab) はサインイン手順を別途要する。Runbook 化推奨。
- バージョン要件は本章では明記しない。プロジェクト要件で必要時のみ pinning する。
