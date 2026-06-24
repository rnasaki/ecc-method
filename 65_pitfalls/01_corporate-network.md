---
keywords: [pitfalls, corporate, network]
related: []
---
# 01 — 企業ネットワーク配下の SSL / Proxy / CA bundle ハマりどころ

社内ネットワーク経由で外部リポジトリ・パッケージレジストリ・LLM API を叩く際、ほぼ必ず一度は踏む落とし穴を抽象化したカタログ。組織固有の URL・証明書名は記載しない。各事象は「症状 → 原因 → 対処」の順で整理する。

## TL;DR

- `pip install` / `npm install` / `git clone` / `gh auth login` のいずれかが SSL エラーで止まったら、まず HTTPS Proxy 経由 + 自社 CA 中継の前提を疑う。
- 環境変数 `HTTP_PROXY` / `HTTPS_PROXY` / `NO_PROXY` と、各 CLI 個別の CA バンドル指定 (`REQUESTS_CA_BUNDLE` / `NODE_EXTRA_CA_CERTS` / `GIT_SSL_CAINFO` / `PIP_CERT`) を揃える。
- 一時的に `--trusted-host` や検証無効化で逃げるのは禁止。CA バンドルを正しく取り込む方が早く・恒久的。

## 想定する状況

- 開発端末は社内 LAN または VPN 配下にある。
- 外部通信は中継 Proxy を経由する (HTTP CONNECT または認証付き Forward Proxy)。
- 自社内で発行された Root / Intermediate CA が中継地点で TLS を再署名している (TLS 終端 + 再暗号化)。
- 端末 OS 標準の信頼ストアには上記 CA が登録済みでも、各言語ランタイムは独自バンドルを参照する。

## 代表的な症状

| 症状 | コマンド例 | 原因 |
|---|---|---|
| `SSL: CERTIFICATE_VERIFY_FAILED` | `pip install <pkg>` | Python が同梱の CA バンドルを参照、社内 CA が含まれない |
| `unable to get local issuer certificate` | `git clone https://...` | Git が `http.sslCAInfo` 未設定 |
| `self signed certificate in certificate chain` | `npm install` | Node が `NODE_EXTRA_CA_CERTS` 未設定 |
| `x509: certificate signed by unknown authority` | Go / Docker pull | OS 信頼ストア参照失敗 / コンテナ内に CA 未配置 |
| `Could not resolve host` | `gh auth login` | NO_PROXY 不足で Proxy バイパスすべき内部ホストが解決失敗 |
| 認証ループ | `git push` | Proxy が NTLM/Kerberos 必須で BASIC 認証ヘッダが弾かれる |

## 環境変数の最低セット

```bash
# Proxy (大文字・小文字両方を設定するとツール差異を吸収)
export HTTP_PROXY="http://<proxy-host>:<port>"
export HTTPS_PROXY="$HTTP_PROXY"
export http_proxy="$HTTP_PROXY"
export https_proxy="$HTTP_PROXY"

# Proxy バイパス (社内ホスト・localhost・社内 GitLab 等)
export NO_PROXY="localhost,127.0.0.1,.internal,.local"
export no_proxy="$NO_PROXY"

# CA バンドル (社内 CA を OS バンドルに追記したファイル)
export REQUESTS_CA_BUNDLE="$HOME/.certs/ca-bundle.pem"
export SSL_CERT_FILE="$REQUESTS_CA_BUNDLE"
export NODE_EXTRA_CA_CERTS="$REQUESTS_CA_BUNDLE"
export GIT_SSL_CAINFO="$REQUESTS_CA_BUNDLE"
export PIP_CERT="$REQUESTS_CA_BUNDLE"
```

CA バンドルの中身は「OS / 言語標準のバンドル」+「社内 Root / Intermediate CA」の連結 PEM。順序は問わない。

## 各ツールの個別設定

### git

```bash
git config --global http.sslCAInfo "$REQUESTS_CA_BUNDLE"
git config --global http.proxy "$HTTPS_PROXY"
# 社内 GitLab 等 Proxy バイパスしたい場合
git config --global http."https://<internal-host>".proxy ""
```

### pip

```ini
# ~/.pip/pip.conf  (or %APPDATA%\pip\pip.ini)
[global]
proxy = ${HTTPS_PROXY}
cert = ${REQUESTS_CA_BUNDLE}
```

### npm

```bash
npm config set proxy "$HTTPS_PROXY"
npm config set https-proxy "$HTTPS_PROXY"
npm config set cafile "$REQUESTS_CA_BUNDLE"
```

### conda / poetry / cargo / go

| ツール | 設定 |
|---|---|
| conda | `~/.condarc` の `ssl_verify: <ca-bundle>` |
| poetry | `poetry config certificates.<repo>.cert <ca-bundle>` |
| cargo | `CARGO_HTTP_CAINFO=<ca-bundle>` |
| go | `GOPROXY` + `SSL_CERT_FILE` |

## 検証手順

```bash
# Step 1: Proxy 到達確認
curl -v -o /dev/null https://example.com

# Step 2: CA バンドル妥当性
curl --cacert "$REQUESTS_CA_BUNDLE" -v https://example.com

# Step 3: 言語別 reach
python -c "import urllib.request; print(urllib.request.urlopen('https://pypi.org').status)"
node -e "require('https').get('https://registry.npmjs.org', r => console.log(r.statusCode))"
git ls-remote https://github.com/git/git.git | head -1
```

成功条件:

- [ ] `curl https://example.com` が 200 を返す
- [ ] Python / Node / Git のいずれも SSL エラーなしでリモート到達
- [ ] `gh auth status` が `Logged in to github.com` を返す

## アンチパターン (やってはいけない)

| アンチパターン | リスク | 代替 |
|---|---|---|
| `pip install --trusted-host pypi.org` を恒久化 | MITM 検出不能、依存パッケージ個別に必要 | CA バンドル正しく設定 |
| `git config http.sslVerify false` | 社外への通信も検証無効化、漏洩経路を見落とす | `http.sslCAInfo` で個別 CA |
| `NODE_TLS_REJECT_UNAUTHORIZED=0` | プロセス全体で TLS 検証 OFF | `NODE_EXTRA_CA_CERTS` で追加 |
| Proxy 認証情報を URL に直書き (`http://user:pass@proxy/`) | shell 履歴・ログに漏洩 | OS の Credential Manager / .netrc 600 |
| 自宅 PC の設定をそのまま社内端末にコピー | NO_PROXY に社内ホストが入っていない | 端末ごとに NO_PROXY を分離 |

## トラブルシュート判定樹

```
SSL エラー出た
├── curl --cacert <bundle> で通る?
│   ├── Yes → 言語ランタイムが別バンドル参照中。環境変数追加。
│   └── No  → CA バンドル不備。社内 CA 連結を確認。
└── ホスト解決失敗 (DNS) ?
    ├── Yes → NO_PROXY に内部ホストを追加 / VPN 接続確認。
    └── No  → Proxy 認証エラー (407)。NTLM/Kerberos 必要なら cntlm 等の前段。
```

## 出典

- IETF RFC 5280 "Internet X.509 Public Key Infrastructure" (https://www.rfc-editor.org/rfc/rfc5280, retrieved_at: 2026-06-23)
- Python `ssl` モジュール公式ドキュメント (https://docs.python.org/3/library/ssl.html, retrieved_at: 2026-06-23)
- Git `http.sslCAInfo` 設定 (https://git-scm.com/docs/git-config, retrieved_at: 2026-06-23)
- Node.js TLS / `NODE_EXTRA_CA_CERTS` 仕様 (https://nodejs.org/api/cli.html, retrieved_at: 2026-06-23)

## 不確実性

- 認証付き Proxy (NTLM / Kerberos) を必須とする環境では、cntlm / px などの前段プロキシが追加で必要になる場合がある。
- TLS 検査機器の挙動 (再署名のタイミング・対象 SNI フィルタ) は組織ごとに差がある。本ファイルは「再署名あり」を前提にしている。
- 一部 SaaS は IP 制限や mTLS を併用する。CA バンドルだけでは到達不能なケースは別 Runbook で扱う。
