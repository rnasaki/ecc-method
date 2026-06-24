---
keywords: [environment, corporate, network]
related: [10_discovery/04_constraint-mapping.md]
---
# 15-06 — Corporate Network (proxy / CA bundle)

企業ネットワーク配下で ECC を稼働させるために必要な、proxy と CA bundle の取り扱いを抽象化して定義する。固有の社内 URL / 組織名は記載しない。

## 前提

- 多くの企業 LAN では HTTPS 接続が proxy を経由し、TLS が組織発行の中間 CA で再署名される。
- そのため CLI / SDK は 2 つの設定を要する:
  1. proxy 経由の HTTP/HTTPS リクエスト
  2. 組織発行の CA bundle を信頼

両方が揃って初めて公的 SaaS / npm registry / pypi に到達できる。

## 1. proxy 設定

### shell 環境変数

```
HTTP_PROXY=http://<corp-proxy-host>:<port>
HTTPS_PROXY=http://<corp-proxy-host>:<port>
NO_PROXY=localhost,127.0.0.1,::1,.<internal-domain>
```

`<corp-proxy-host>` は組織から指示された値。本ドキュメントでは placeholder で表記する。

bash / zsh:

```
# {{home}}/.bashrc または {{home}}/.zshrc
export HTTP_PROXY=...
export HTTPS_PROXY=...
export NO_PROXY=localhost,127.0.0.1,::1
```

PowerShell:

```
# $PROFILE
$env:HTTP_PROXY = "..."
$env:HTTPS_PROXY = "..."
$env:NO_PROXY = "localhost,127.0.0.1,::1"
```

### CLI 別

| CLI | 設定 |
|---|---|
| git | `git config --global http.proxy $HTTPS_PROXY` |
| npm / pnpm | `npm config set proxy / https-proxy` |
| pip / uv | `pip config set global.proxy ...` / env で十分 |
| cargo | `~/.cargo/config.toml` の `[http] proxy = "..."` |
| docker (build) | `~/.docker/config.json` の httpProxy / httpsProxy |
| gh | env のみで OK |

## 2. CA bundle 設定

### bundle の入手

- 組織配布の `.crt` / `.pem` を入手 (チェーン全体)
- 推奨配置: `{{home}}/.certs/corp-ca.pem`
- 権限: 600 (chmod) / ACL (Windows)

### CLI 別の信頼登録

| ランタイム | 環境変数 / 設定 |
|---|---|
| Node.js | `NODE_EXTRA_CA_CERTS={{home}}/.certs/corp-ca.pem` |
| Python (requests) | `REQUESTS_CA_BUNDLE={{home}}/.certs/corp-ca.pem` |
| Python (httpx / openai sdk) | `SSL_CERT_FILE={{home}}/.certs/corp-ca.pem` |
| curl | `CURL_CA_BUNDLE={{home}}/.certs/corp-ca.pem` |
| git | `git config --global http.sslCAInfo {{home}}/.certs/corp-ca.pem` |
| Java | keystore に import (keytool -importcert) |
| Go | システム証明書ストアに追加 (OS 標準手順) |
| Rust (rustls) | OS ストア / `SSL_CERT_FILE` |

### OS 証明書ストア

可能であれば OS の信頼ストアに追加し、CLI 単位の env 設定を最小化する:

- Windows: certmgr.msc → Trusted Root → Import
- macOS: Keychain Access → System → Add → Always Trust
- Linux (Debian 系): `/usr/local/share/ca-certificates/` に置いて `update-ca-certificates`

## 3. 検証

```
1. curl -v https://github.com 2>&1 | grep "issuer\|subject"
   → 組織 CA で署名されていれば proxy + CA は OK
2. node -e "https.get('https://github.com', r => console.log(r.statusCode))"
   → 200 が返れば NODE_EXTRA_CA_CERTS が効いている
3. python -c "import urllib.request; print(urllib.request.urlopen('https://github.com').status)"
   → 200 が返れば SSL_CERT_FILE / REQUESTS_CA_BUNDLE が効いている
4. git ls-remote https://github.com/<owner>/<repo>
   → 認証情報なしで参照できるリポで疎通確認
```

## 4. 落とし穴

| 症状 | 原因 | 対処 |
|---|---|---|
| `unable to get local issuer certificate` | CA 未設定 | env 設定 + bundle 配置 |
| `tunneling socket could not be established` | proxy 未設定 | HTTPS_PROXY を設定 |
| `connect ECONNREFUSED` | NO_PROXY 不足で internal host へ proxy 経由 | NO_PROXY に internal を追加 |
| pip 401 / 403 | private mirror への認証不足 | mirror 設定を確認 ([10_discovery/04_constraint-mapping.md](../10_discovery/04_constraint-mapping.md)) |
| TLS 1.2 のみ許可 | CLI が TLS 1.3 強制 | CLI バージョンを下げる / TLS 設定を緩める |

## 5. プロジェクト .env への反映 (任意)

```
# .env.example
NODE_EXTRA_CA_CERTS={{home}}/.certs/corp-ca.pem
SSL_CERT_FILE={{home}}/.certs/corp-ca.pem
REQUESTS_CA_BUNDLE={{home}}/.certs/corp-ca.pem
HTTP_PROXY=
HTTPS_PROXY=
NO_PROXY=localhost,127.0.0.1,::1
```

direnv 利用なら `.envrc` から source する。実値は `.env.local` (gitignore)。

## 6. agent からの推奨ふるまい

- 「TLS エラー」「`unable to get local issuer certificate`」を観測したら **即 escalate**、自前リトライしない
- 設定変更は user scope に留め、リポ内に組織値を書かない
- proxy / CA bundle に関する Runbook を [45_runbook/](../45_runbook/) に登録し、再発時は INDEX 経由で再現

## 出典

- curl certificate stores (https://curl.se/docs/sslcerts.html, retrieved 2026-06-23)
- Node.js TLS docs (https://nodejs.org/api/tls.html, retrieved 2026-06-23)
- requests SSL docs (https://requests.readthedocs.io/en/latest/user/advanced/#ssl-cert-verification, retrieved 2026-06-23)
- npm config (https://docs.npmjs.com/cli/v10/using-npm/config, retrieved 2026-06-23)
- git http.sslCAInfo (https://git-scm.com/docs/git-config, retrieved 2026-06-23)

## 不確実性

- 組織ごとに CA bundle のチェーン構成が異なる。中間 CA まで含むかルートのみかで挙動が変わる。
- 一部の SDK は proxy CONNECT に非対応で、TLS-on-TLS が破綻する。代替は HTTP 1.1 / NO_PROXY 経由 + 内部 mirror。
- TLS インスペクションが入る環境では、API key を含むリクエストが平文で proxy に渡る点に注意。
