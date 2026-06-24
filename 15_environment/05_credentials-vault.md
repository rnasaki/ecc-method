---
keywords: [environment, credentials, vault]
related: [10_discovery/01_repo-recon.md, 20_repo-bootstrap/03_gitignore-baseline.md]
---
# 15-05 — Credentials Vault (secret 配置方針)

API key / token / 鍵を **どこに置くか** を厳密に定める。Quality Gate ([60_quality-gates/](../60_quality-gates/)) の secret 検査で 0 件を維持するため。

## 原則

1. ソース管理に secret を一切置かない (gitignore 必須)。
2. 一次保管は OS 標準の secure store (macOS keychain / Windows Credential Manager / linux secret-service)。
3. 横断利用は外部 vault (1Password / Bitwarden / Vault by HashiCorp 等) に集約。
4. 開発時は `.env.local` 等の **gitignore 済みファイル** で渡す。`.env.example` のみコミット。
5. 検出されたら即 rotate。漏洩は不可逆。

## 配置レイヤ

```
Layer S0: code        ← 禁止
Layer S1: .env.local  ← ローカル開発用 (gitignore)
Layer S2: OS keystore ← CLI が認識する secret (gh, aws, az, gcloud)
Layer S3: 外部 vault  ← 横断 / 共有用
Layer S4: CI secret   ← github-actions secrets / gitlab variables
```

## レイヤ別の運用

### S1: .env.local

```
配置:
  {{repo_root}}/.env.local
gitignore:
  .env*
  !.env.example

雛形:
  {{repo_root}}/.env.example  ← コミット可
  全 key を空値で列挙、末尾に "# value: see vault" 等のコメント
```

雛形例:

```
# .env.example
DATABASE_URL=
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
NEXTAUTH_SECRET=
```

### S2: OS keystore

各 CLI の標準保管:

| CLI | 保管 |
|---|---|
| gh | OS keychain (gh auth login で自動) |
| aws | `~/.aws/credentials` (権限 600) |
| az | OS keychain |
| gcloud | `~/.config/gcloud/` |
| docker | OS keychain (credential helper 経由) |

これらは agent から読み出さない。CLI に委ねる。

### S3: 外部 vault

横断利用 / チーム共有時:

```
推奨:
  - 1Password CLI (op)
  - Bitwarden CLI (bw)
  - HashiCorp Vault (vault)

呼び出し例:
  export OPENAI_API_KEY=$(op read "op://Personal/openai/api_key")

shell プロファイルから direnv で env に流す ({{repo_root}}/.envrc):
  export OPENAI_API_KEY=$(op read "op://Personal/openai/api_key")
  → .envrc は gitignore 推奨
```

direnv 利用時は `direnv allow` を Runbook 化。

### S4: CI secret

```
github-actions:
  Settings → Secrets and variables → Actions
  workflow から ${{ secrets.NAME }} で参照

gitlab:
  Settings → CI/CD → Variables (Protected / Masked を有効)

注意:
  - print 禁止 (echo $SECRET をログに出さない)
  - artifact に書き出さない
  - PR からの fork ビルドには露出しない設定にする
```

## 検出と rotate

- gitleaks / trufflehog で commit 前 / push 前に走査 ([10_discovery/01_repo-recon.md](../10_discovery/01_repo-recon.md))
- 検出したら:
  1. STOP (METHOD §6 / security guideline)
  2. rotate 手順を実行 (発行元 console)
  3. git history から削除 (BFG / git-filter-repo)
  4. 漏洩経路を Runbook 化 ([45_runbook/](../45_runbook/))

## .gitignore baseline

[20_repo-bootstrap/03_gitignore-baseline.md](../20_repo-bootstrap/03_gitignore-baseline.md) で定める雛形に必ず以下を含める:

```
.env
.env.*
!.env.example
.envrc
.secrets/
*.pem
*.key
*.p12
.codex/
```

## agent への露出最小化

- agent に `.env*` を読み込ませない (システムプロンプトで明示禁止)
- agent の bash 実行で `cat .env` を防ぐ。settings.local.json の deny リストで明示
- secret を引数に渡さず、env 経由で渡す (履歴 / ログに残らない)

## 出典

- OWASP Cheat Sheet: Secrets Management (https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html, retrieved 2026-06-23)
- 1Password CLI docs (https://developer.1password.com/docs/cli/, retrieved 2026-06-23)
- HashiCorp Vault docs (https://developer.hashicorp.com/vault/docs, retrieved 2026-06-23)
- direnv (https://direnv.net/, retrieved 2026-06-23)
- gitleaks / trufflehog (上記章参照)

## 不確実性

- OS keystore の挙動 (権限 / unlock prompt) は OS / 設定で異なる。
- 外部 vault のコスト構造は将来変動する。チーム規模で選定要。
- direnv の `allow` プロセスは慣れないと事故が起きうる。Runbook 化必須。
