---
keywords: [pitfalls, oauth, token, expiry]
related: []
---
# 03 — OAuth トークン期限切れの兆候と対処

GitHub CLI (`gh`) など OAuth トークンを保持する CLI は、無通知でトークンが失効しユーザに再認証を要求してくる。本ファイルは「気付き → 切り分け → 再認証」までの定型手順をまとめる。

## TL;DR

- `git push` / `gh pr create` で 401 / `Bad credentials` / `requires authentication` を見たら、まず `gh auth status` を実行。
- スコープ不足と期限切れは別事象。エラーメッセージで切り分ける。
- 自動エージェントから再認証ループに陥らないよう、トークン期限を環境変数 + メモに残す。

## 想定する CLI

- `gh` (GitHub CLI)
- `glab` (GitLab CLI)
- `az` (Azure CLI)
- `gcloud` (Google Cloud CLI)
- 任意の OAuth 2.0 / Device Flow を使う CLI

本ファイルは `gh` を主例にし、他 CLI は表でカバーする。

## 代表的な兆候

| 兆候 | 出力例 | 原因の可能性 |
|---|---|---|
| `Bad credentials` | `gh: Bad credentials (HTTP 401)` | トークン期限切れ / 取り消し |
| `Resource not accessible by personal access token` | API 呼び出し時 | スコープ不足 |
| `error: failed to authenticate` | `git push` (HTTPS) | credential helper のキャッシュが古い |
| `gh auth status` が空 / `not logged in` | 設定消失 | OS のキーチェーン更新 / プロファイル変更 |
| `device_code` 連続要求 | エージェント実行中 | refresh フロー失敗 |
| ブラウザで `unauthorized_client` | OAuth リダイレクト失敗 | アプリ承認の取り消し |

## 切り分け手順

```bash
# Step 1: 認証状態を確認
gh auth status

# Step 2: 実トークンの hash と scope を確認 (内容そのものは表示しない)
gh auth token | sha256sum
gh api user --include  # ヘッダ X-OAuth-Scopes でスコープ確認

# Step 3: 直近 API 呼び出しの結果
gh api rate_limit

# Step 4: 関連設定 (credential helper)
git config --global --get-all credential.helper
```

判定:

- `gh auth status` が "Logged in" でもスコープ不足 → 追加スコープで再ログイン
- `gh auth status` が空 → 完全再ログイン
- API rate limit が `0` → 期限切れではなく上限到達 (1 時間待機)

## 再認証フロー

### gh (GitHub CLI)

```bash
# 既存トークン破棄
gh auth logout --hostname github.com

# 必要スコープを明示して再ログイン
gh auth login \
  --hostname github.com \
  --git-protocol https \
  --scopes "repo,workflow,read:org,gist"

# 検証
gh auth status
gh api user --jq .login
```

### git credential cache を併用している場合

```bash
# キャッシュ破棄
git credential-cache exit
# manager (Windows) 系
git config --global --unset credential.helper
git config --global credential.helper manager
```

### 他 CLI の対応表

| CLI | 状態確認 | 再ログイン |
|---|---|---|
| `glab` | `glab auth status` | `glab auth login --hostname <host>` |
| `az` | `az account show` | `az login` (`--use-device-code` で device flow) |
| `gcloud` | `gcloud auth list` | `gcloud auth login` / `gcloud auth application-default login` |
| `aws` (SSO) | `aws sts get-caller-identity` | `aws sso login --profile <p>` |

## 期限切れを未然に防ぐ運用

1. **期限を記録する**: ログイン直後に `gh auth status` の出力からトークン作成日を控え、運用ノート (Runbook) に「N 日後 review-due」と記載。
2. **PAT vs OAuth App**: 個人アクセストークンは固定期限 (例: 90 日) で切れる。長期エージェント運用は OAuth App + refresh token のほうが向く。
3. **スコープは最小**: `repo` + 必要最低限。`admin:*` は付けない。
4. **エージェントが無限再ログインを叩かない**: 401 を捕捉したら 1 度だけ再認証を試み、失敗時はユーザにエスカレーション。

## エージェント (LLM) からの扱い

エージェントが gh / git を使う際の事故パターン:

| 事故 | 結果 | 防ぎ方 |
|---|---|---|
| `gh auth login` を勝手にバックグラウンド実行 | device flow 待ちでハング | login 操作はユーザに必ず確認 |
| トークンを diff / 出力に含めてしまう | リーク | `gh auth token` の出力をログに残さない |
| 401 を見て push を `--force` リトライ | 履歴破壊 | エラーは認証問題、push 戦略は不変 |
| 複数アカウントで同時ログイン | host 設定が壊れる | `gh auth switch` で明示切替 |

## 検証

```bash
gh auth status
# 期待: "Logged in to github.com as <user>" + "Token: gho_*** (active)"
gh api user --jq '.login'
# 期待: 自分のユーザ名
git push --dry-run origin HEAD
# 期待: "Everything up-to-date" or 通常の push 進捗
```

成功条件:

- [ ] `gh auth status` が active を返す
- [ ] スコープが必要分含まれている (`X-OAuth-Scopes` ヘッダ)
- [ ] `git push --dry-run` が認証エラーを返さない
- [ ] エージェントから 401 が出なくなる

## 失敗時のリカバリ

| 症状 | 対処 |
|---|---|
| ブラウザが Proxy 配下で OAuth コールバックに到達不能 | `gh auth login --web` の代わりに `--with-token` でトークン直貼り |
| device code が組織ポリシーで無効 | PAT を発行し `gh auth login --with-token <<<"$PAT"` |
| キーチェーン破損 (macOS) | キーチェーン項目を手動削除して再ログイン |
| Windows credential manager が壊れた | 「資格情報マネージャー」から `git:https://github.com` を削除 |

## 出典

- GitHub CLI Manual `gh auth` (https://cli.github.com/manual/gh_auth, retrieved_at: 2026-06-23)
- GitHub Docs "Token expiration and revocation" (https://docs.github.com/en/authentication, retrieved_at: 2026-06-23)
- IETF RFC 8628 OAuth 2.0 Device Authorization Grant (https://www.rfc-editor.org/rfc/rfc8628, retrieved_at: 2026-06-23)

## 不確実性

- 組織が SSO 強制している場合、トークンを SSO 認可しないと `Resource not accessible` が返る。これは期限切れではなくスコープ問題。
- refresh token を持つ OAuth App でも、サーバ側で revoke されると即座に失効する。CLI 側のキャッシュは無効化されない。
