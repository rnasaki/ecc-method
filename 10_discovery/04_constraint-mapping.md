# 10-04 — Constraint Mapping (組織制約の自動検出)

組織ネットワーク・証明書・クラウドポリシーといった **「環境固有の見えない制約」** を、ユーザーに尋ねる前に検出する手順。

## 検出対象

```yaml
constraint_report:
  retrieved_at: 2026-06-23
  network:
    proxy_required: <bool>
    http_proxy: <url?>
    https_proxy: <url?>
    no_proxy: [<host>]
    ipv6: <enabled|disabled|unknown>
  tls:
    custom_ca_bundle: <path?>
    self_signed_chain: <bool>
    pinned_hosts: [<host>]
  cloud_policy:
    public_egress_allowed: <bool>
    allowed_regions: [<region>]
    forbidden_services: [<service>]
  package_registries:
    npm: <url>
    pypi: <url>
    cargo: <url>
    maven: <url>
    custom: [<url>]
  shell:
    platform: <windows|macos|linux>
    shell: <bash|zsh|powershell|fish>
    path_style: <posix|windows>
  auth:
    sso_provider: <azuread|okta|google|none>
    git_auth_method: <ssh|https-pat|oauth>
```

## 検出ヒューリスティクス

### Network

```
1. 環境変数を読む: HTTP_PROXY, HTTPS_PROXY, NO_PROXY
2. シェル設定を grep (PII 注意で値はマスク):
   - bash/zsh: ~/.bashrc / ~/.zshrc 相当を {{home}} 経由で参照
   - PowerShell: $PROFILE
3. curl https://www.google.com -m 5 で疎通確認 (失敗 → proxy_required=true)
4. npm config get proxy / pip config list / git config --get http.proxy
```

検出した URL は **そのまま記録しない**。`<scheme>://<masked-host>:<port>` に正規化する。

### TLS

```
1. NODE_EXTRA_CA_CERTS / SSL_CERT_FILE / REQUESTS_CA_BUNDLE 環境変数を確認
2. git config --get http.sslCAInfo
3. corporate-proxy-and-cert.md 風の事前知識があれば参照 (ECC native 知識ストア)
4. テスト疎通: curl -v https://github.com 2>&1 | grep "subject\|issuer"
```

### Cloud Policy

```
1. 既知 CLI が入っていれば account 情報を取得 (失敗を許容):
   - aws sts get-caller-identity
   - az account show
   - gcloud config list
2. 出力から allowed_regions / org policy を推定
3. egress 制限は curl https://1.1.1.1 -m 3 と egress test エンドポイントで判定
```

### Package Registries

```
1. npm config get registry
2. pip config get global.index-url
3. ~/.cargo/config.toml の [source.crates-io] を確認
4. ~/.m2/settings.xml の <mirrors>
5. private registry 検出時は host を記録 (token は記録しない)
```

### Shell / Platform

```
1. uname -a (POSIX) or $env:OS (PowerShell)
2. echo $SHELL or $env:ComSpec
3. path_style 判定: '/' or '\\'
```

## 制約 → 対応マッピング

| 検出 | 取るべき行動 | 章リンク |
|---|---|---|
| `proxy_required=true` | 全 CLI に proxy 設定を伝搬 | [15_environment/06_corporate-network.md](../15_environment/06_corporate-network.md) |
| `custom_ca_bundle` | NODE/PIP/REQUESTS 全て CA を指定 | [15_environment/06_corporate-network.md](../15_environment/06_corporate-network.md) |
| `public_egress_allowed=false` | 私設 mirror 経由のみ許可、Vercel 等の PaaS を除外 | [10_discovery/03_stack-inference.md](./03_stack-inference.md) 補正 |
| `forbidden_services` | stack_proposal から該当を除外 | 同上 |
| `shell=powershell` | コマンド例を pwsh に置換、`/dev/null` 等を回避 | runbook 化 |
| `git_auth_method=https-pat` | gh CLI の token 期限切れ手順を Runbook 化 | [45_runbook/](../45_runbook/) |

## 出力先

`{{repo_root}}/_tmp/constraint_report.yaml`

## Privacy Guard

検出結果は組織固有値を **マスクしてから保存** する:

- ホスト名: `<corp-proxy-1>` / `<corp-mirror-1>` 等の placeholder
- パス: `{{home}}` / `{{repo_root}}` 経由で表現
- 認証情報: 検出してもファイルに書かない
- IP: `xxx.xxx.xxx.xxx` 形式でマスク

`25_writing-style/02_banned-phrases.md` の固有名詞禁止と整合させる。

## 失敗時の挙動

- 検出失敗 → `unknown` を入れて先に進む。後続が必要としたタイミングで再取得。
- 検出と環境変数の整合が取れない → uncertainties に列挙し、ユーザーに 1 度だけ確認。
- secret らしき値を検出 → 即時破棄、ログにも書かない、ユーザーに通知。

## 出典

- IETF RFC 7230 (HTTP/1.1 messaging, https://www.rfc-editor.org/rfc/rfc7230, retrieved 2026-06-23)
- Mozilla curl certificate stores (https://curl.se/docs/sslcerts.html, retrieved 2026-06-23)
- npm proxy config (https://docs.npmjs.com/cli/v10/using-npm/config, retrieved 2026-06-23)
- pip config (https://pip.pypa.io/en/stable/cli/pip_config/, retrieved 2026-06-23)

## 不確実性

- 自動検出は環境変数・設定ファイルが正しく反映されている前提。CLI 起動時のみ proxy が当たる構成では誤判定しうる。
- マスク規則は v1.0。新たな機微情報パターンが見つかれば随時追加する。
- corporate CA bundle が複数ある場合、優先順位は要件次第。要員設計と合わせて確定する。
