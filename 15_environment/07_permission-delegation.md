# 15-07 — Permission Delegation (settings.local.json プリセット)

承認最小化 (METHOD §8) の実装として、`settings.local.json` で agent に **事前許可** を与える 3 段階プリセットを定義する。

## 前提

- ECC の権限制御は `.claude/settings.json` (project) と `~/.claude/settings.json` (user) と `.claude/settings.local.json` (project local, gitignore) の階層で構成される。
- `allow` / `deny` / `ask` の 3 種別をツール・パターンごとに記述できる。
- 本章はプロジェクト local 用の 3 段階 (Restricted / Standard / Trusted) を提供する。escalation は [50_permissions/](../50_permissions/) に詳細。

## 共通方針

- secret 類は **常に deny** (cat .env*, etc.)
- 不可逆操作 (force-push to main, prod deploy, DB drop) は **常に ask**
- 可逆操作 (編集・テスト実行・ブランチ作成) は **段階に応じて allow**

## 段階 1: Restricted (新規プロジェクト / 評価中)

最小権限。ほぼ全ての書き換え系で確認を求める。

```json
{
  "permissions": {
    "allow": [
      "Read",
      "Grep",
      "Glob",
      "Bash(git status:*)",
      "Bash(git diff:*)",
      "Bash(git log:*)",
      "Bash(ls:*)",
      "Bash(rg:*)",
      "Bash(cat:*)",
      "Bash(jq:*)"
    ],
    "deny": [
      "Bash(cat .env*)",
      "Bash(cat *.pem)",
      "Bash(cat *secret*)",
      "Bash(rm -rf:*)",
      "Bash(git push:*)",
      "Bash(git reset --hard:*)"
    ]
  }
}
```

## 段階 2: Standard (通常開発)

ローカルでの編集 / テスト / ブランチ操作は自走、共有資源には ask。

```json
{
  "permissions": {
    "allow": [
      "Read",
      "Write",
      "Edit",
      "Grep",
      "Glob",
      "Bash(git status:*)",
      "Bash(git diff:*)",
      "Bash(git log:*)",
      "Bash(git add:*)",
      "Bash(git commit:*)",
      "Bash(git checkout -b:*)",
      "Bash(git switch:*)",
      "Bash(git stash:*)",
      "Bash(npm test:*)",
      "Bash(pnpm test:*)",
      "Bash(pytest:*)",
      "Bash(uv run:*)",
      "Bash(go test:*)",
      "Bash(cargo test:*)",
      "Bash(make:*)",
      "Bash(just:*)",
      "Bash(rg:*)",
      "Bash(jq:*)",
      "Bash(curl https://*)"
    ],
    "deny": [
      "Bash(cat .env*)",
      "Bash(cat *.pem)",
      "Bash(rm -rf /:*)",
      "Bash(git push --force:*)",
      "Bash(git push -f:*)",
      "Bash(git push origin main:*)",
      "Bash(git reset --hard:*)",
      "Bash(npm publish:*)",
      "Bash(pnpm publish:*)",
      "Bash(cargo publish:*)"
    ],
    "ask": [
      "Bash(git push:*)",
      "Bash(gh pr create:*)",
      "Bash(gh pr merge:*)"
    ]
  }
}
```

## 段階 3: Trusted (信頼済みパイプライン)

orch-pipeline 等の gated ワークフロー内で使う想定。push / PR 作成も自走、prod 系は ask 維持。

```json
{
  "permissions": {
    "allow": [
      "Read",
      "Write",
      "Edit",
      "Grep",
      "Glob",
      "Bash(git :*)",
      "Bash(gh :*)",
      "Bash(npm :*)",
      "Bash(pnpm :*)",
      "Bash(uv :*)",
      "Bash(pytest:*)",
      "Bash(go :*)",
      "Bash(cargo :*)",
      "Bash(docker build:*)",
      "Bash(docker compose up:*)",
      "Bash(make:*)",
      "Bash(just:*)"
    ],
    "deny": [
      "Bash(cat .env*)",
      "Bash(cat *.pem)",
      "Bash(rm -rf /:*)",
      "Bash(git push --force origin main:*)",
      "Bash(git push -f origin main:*)",
      "Bash(git reset --hard origin/main:*)",
      "Bash(npm publish:*)",
      "Bash(cargo publish:*)",
      "Bash(kubectl delete:*)",
      "Bash(terraform destroy:*)"
    ],
    "ask": [
      "Bash(gh pr merge --admin:*)",
      "Bash(docker push:*)",
      "Bash(kubectl apply:* prod*)",
      "Bash(terraform apply:* prod*)",
      "Bash(flyctl deploy:*)",
      "Bash(vercel --prod:*)"
    ]
  }
}
```

## 適用と切替

```
1. {{repo_root}}/.claude/settings.local.json を作成
2. 段階 1 で開始
3. 同意エコノミー逸脱 (毎回同じ確認) が 3 回続いたら段階 2 へ昇格
4. orch-pipeline 連携 / CI / 安定運用に入ったら段階 3 へ
5. 不可逆事故が起きたら 1 段下げ + Runbook 化
```

## escalation policy

- ask に出会ったら STOP し、ユーザーに以下を提示:
  1. 何をしようとしているか
  2. 不可逆性の有無
  3. 失敗した場合の影響範囲
  4. 代替案 (より安全な手段)
- ユーザー承認後のみ実行
- 実行後は Runbook 化し、次回以降は ask → allow に降格を検討

## .gitignore

```
.claude/settings.local.json
```

local プリセットはコミットしない。チームで共有する場合は `.claude/settings.json` に共通部分のみ抽出する。

## 出典

- Anthropic Claude Code Settings docs (https://code.claude.com/docs/en/settings, retrieved 2026-06-23)
- Anthropic Claude Code Permissions docs (https://code.claude.com/docs/en/permissions, retrieved 2026-06-23)

## 不確実性

- `permissions` のスキーマは ECC version で拡張される可能性。新フィールド (例: `MCP` 専用) は追従が必要。
- パターンマッチング (Bash の glob) は誤一致しうる。重要 deny は複数パターンで冗長化する。
- 段階 3 の安定性は CI / hook / Runbook の整備に依存する。テスト不在で Trusted に上げない。
