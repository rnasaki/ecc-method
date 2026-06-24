---
keywords: [environment, capabilities, matrix]
related: [10_discovery/04_constraint-mapping.md]
---
# 15-01 — Capabilities Matrix (何ができるか / 何が要るか)

ECC を活用するうえで、環境にあるべき機能と、それぞれが満たす条件を一覧化する。Discovery ([10_discovery/04_constraint-mapping.md](../10_discovery/04_constraint-mapping.md)) と組み合わせて環境ギャップを抽出する。

## カテゴリ

| カテゴリ | 説明 |
|---|---|
| core-cli | git / shell / 言語ランタイム等の必須 CLI |
| platform-cli | クラウド / コンテナ / k8s 等のプラットフォーム CLI |
| browser-automation | E2E / GUI 検証 (Playwright 等) |
| mcp-servers | Context7 / Exa / Playwright 等の MCP |
| credential-store | secret 配置 (env / keychain / vault) |
| network | proxy / CA bundle |
| permission-preset | settings.local.json の許可レベル |

## マトリクス

```yaml
capabilities:
  - id: cap-git
    category: core-cli
    required: true
    detect: git --version
    install_hint:
      windows: winget install Git.Git
      macos: brew install git
      linux: apt-get install git
    fallback: なし (必須)

  - id: cap-gh
    category: core-cli
    required: true
    detect: gh --version
    install_hint:
      windows: winget install GitHub.cli
      macos: brew install gh
      linux: apt-get install gh
    fallback: git + REST 直接 (限定機能)

  - id: cap-uv
    category: core-cli
    required: when(language == python)
    detect: uv --version
    install_hint:
      all: curl -LsSf https://astral.sh/uv/install.sh | sh
    fallback: pip + venv

  - id: cap-pnpm
    category: core-cli
    required: when(language == typescript)
    detect: pnpm --version
    install_hint:
      all: corepack enable && corepack prepare pnpm@latest --activate
    fallback: npm

  - id: cap-docker
    category: platform-cli
    required: when(containerization needed)
    detect: docker info
    install_hint:
      windows: Docker Desktop or rancher-desktop
      macos: Docker Desktop or rancher-desktop or colima
      linux: docker engine + compose plugin
    fallback: podman (互換性は限定)

  - id: cap-kubectl
    category: platform-cli
    required: when(deploy_target includes k8s)
    detect: kubectl version --client
    install_hint:
      all: 公式 https://kubernetes.io/docs/tasks/tools/
    fallback: なし (k8s 操作必須)

  - id: cap-playwright
    category: browser-automation
    required: when(e2e needed)
    detect: npx playwright --version
    install_hint:
      all: npm i -D @playwright/test && npx playwright install
    fallback: cypress | selenium (機能制限)

  - id: cap-context7-mcp
    category: mcp-servers
    required: when(docs lookup needed)
    detect: claude mcp list | grep context7
    install_hint:
      all: claude mcp add context7 ...
    fallback: WebFetch (経路 B)

  - id: cap-ca-bundle
    category: network
    required: when(corporate network)
    detect: env を確認 (NODE_EXTRA_CA_CERTS / SSL_CERT_FILE 等)
    install_hint:
      all: 組織配布の CA bundle を {{home}}/.certs/ に配置し env 設定
    fallback: なし (TLS エラーで停止)

  - id: cap-proxy
    category: network
    required: when(corporate network)
    detect: HTTP_PROXY / HTTPS_PROXY 環境変数
    install_hint:
      all: shell プロファイルで export
    fallback: 直結試行 → 失敗時に proxy 必須警告
```

## ギャップ判定

```
1. Discovery: constraint_report.yaml と stack_proposal.yaml を読む
2. capabilities[] を順に評価:
   - required を when 式で評価
   - detect コマンドを実行
   - exit_code != 0 → ギャップ
3. ギャップ一覧を _tmp/env_gaps.yaml に保存
4. 各ギャップに対応する install_hint を提示
5. ユーザー承認後、自動インストール可能なものは実行 (50_permissions/ 参照)
```

## カテゴリ別の責務

- core-cli: 不在で停止 → ユーザーに即通知
- platform-cli: 不在で警告 → 該当タスク発生時に再要求
- browser-automation: 不在で警告 → e2e タスク時のみ要求
- mcp-servers: 不在で fallback 経路を併用
- network: 不在で停止 (TLS / 名前解決失敗の連鎖を避ける)

## 出力先

`{{repo_root}}/_tmp/env_gaps.yaml`

```yaml
env_gaps:
  retrieved_at: 2026-06-23
  missing: [<cap-id>]
  outdated: [{ id: <cap-id>, current_version, required_version }]
  blocked_by_policy: [<cap-id>]
```

## 出典

- Anthropic Claude Code docs (https://code.claude.com/docs/en, retrieved 2026-06-23)
- Astral uv (https://docs.astral.sh/uv/, retrieved 2026-06-23)
- Microsoft winget (https://learn.microsoft.com/windows/package-manager/winget/, retrieved 2026-06-23)
- Homebrew (https://brew.sh/, retrieved 2026-06-23)

## 不確実性

- detect コマンドは環境差で偽陰性がありうる (PATH 未通など)。1 回の失敗で missing 確定せず、2 回試行を推奨。
- platform-cli の "required when" 判定は stack_proposal の解釈に依存する。曖昧時は warn 止まり。
- 自動インストールは sandbox / 権限ポリシーで弾かれる。50_permissions/ の preset を参照。
