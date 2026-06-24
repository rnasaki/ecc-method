---
keywords: [permissions, pre, authorized, actions]
related: [50_permissions/01_consent-economy.md, 50_permissions/04_settings-presets.md]
---
# 02 — Pre-Authorized Actions (事前承認リスト)

承認エコノミー ([01_consent-economy.md](./01_consent-economy.md)) の運用実体。category 別の事前承認リスト雛形と、`.claude/settings.local.json` の JSON 雛形を提供する。

---

## 1. category 一覧

| category | 範囲 | 既定 |
|---|---|---|
| edit | ローカルファイル編集 | ACT |
| read | ローカル read-only | ACT |
| cli-build | build / lint / format / type-check | ACT |
| cli-test | unit / integration test 実行 | ACT |
| cli-git-local | git status / log / diff / branch / commit (ローカル) | ACT |
| cli-git-remote | push / pull / fetch | ASK-ONCE |
| cli-net | curl / wget / npm install / pip install | ASK-ONCE |
| mcp-readonly | read 系 MCP (search / fetch / list) | ACT |
| mcp-write | write 系 MCP (create issue / send message) | ASK-EACH |
| destructive | rm -rf / drop / force-push / prod deploy | ASK-EACH (要二重確認) |

---

## 2. category 別 事前承認リスト

### edit (ACT)

```
- ファイル作成 / 上書き / 部分編集
- ただし以下は除外:
  - .env / *.key / *.pem / credentials.* (PII / secret)
  - .claude/settings.json (権限設定本体)
  - ルート外への path traversal
```

### read (ACT)

```
- Read / Grep / Glob 全般
- ただし以下は除外:
  - secret を含むディレクトリ (.aws/ / .ssh/ / .gnupg/)
```

### cli-build (ACT)

```
- npm run build | lint | format | typecheck
- pnpm / yarn / bun の同等コマンド
- mvn / gradle / sbt の build / verify
- cargo build / check / clippy
- go build / vet
- pytest --collect-only / ruff / black --check
```

### cli-test (ACT)

```
- npm test / pnpm test / bun test
- pytest / unittest
- go test
- cargo test
- jest / vitest
```

### cli-git-local (ACT)

```
- git status / diff / log / show / blame
- git branch / checkout / switch
- git add / commit (ローカルのみ)
- git stash
```

### cli-git-remote (ASK-ONCE)

```
- git push origin <feature-branch>  (main 以外への push は初回のみ ASK)
- git fetch / pull (ASK 不要に降格可)
- git push origin main / --force / --force-with-lease  (常に ASK-EACH)
```

### cli-net (ASK-ONCE)

```
- npm install <pkg>
- pip install <pkg>
- curl / wget (read-only な GET)
- gh issue list / gh pr list (gh の read 系)
```

### mcp-readonly (ACT)

```
- mcp__context7__*
- mcp__exa__search
- mcp__playwright__browser_snapshot / browser_console_messages (観察のみ)
```

### mcp-write (ASK-EACH)

```
- 任意の create / update / delete を伴う MCP ツール
- 第三者システムへの送信 (Slack / Jira / Email)
```

### destructive (ASK-EACH + 二重確認)

```
- rm -rf
- git push --force to main
- DROP TABLE / DELETE FROM (本番 DSN)
- 本番デプロイ (prod 環境変数下のデプロイコマンド)
```

---

## 3. settings.local.json 雛形

```json
{
  "$schema": "https://code.claude.com/schemas/settings.json",
  "permissions": {
    "allow": [
      "Read",
      "Grep",
      "Glob",
      "Edit",
      "Write",
      "Bash(npm run build)",
      "Bash(npm run lint)",
      "Bash(npm test)",
      "Bash(pytest *)",
      "Bash(git status)",
      "Bash(git diff *)",
      "Bash(git log *)",
      "Bash(git add *)",
      "Bash(git commit -m:*)",
      "Bash(git branch *)",
      "Bash(git checkout *)",
      "mcp__context7__*",
      "mcp__exa__search"
    ],
    "ask": [
      "Bash(git push *)",
      "Bash(npm install *)",
      "Bash(pip install *)",
      "Bash(curl *)",
      "WebFetch"
    ],
    "deny": [
      "Bash(rm -rf *)",
      "Bash(git push --force*)",
      "Bash(git push * main)",
      "Read(./.env*)",
      "Read(./.aws/**)",
      "Read(./.ssh/**)",
      "Edit(./.claude/settings.json)"
    ]
  },
  "env": {
    "BASH_DEFAULT_TIMEOUT_MS": "120000",
    "MAX_THINKING_TOKENS": "16000"
  }
}
```

---

## 4. 運用ルール

- リストはプロジェクトごとに `.claude/settings.local.json` で管理。グローバル設定 (`~/.claude/settings.json`) には汎用的な ACT のみを置く。
- `allow` パターンは **狭く書く**: `Bash(git commit *)` ではなく `Bash(git commit -m:*)` のように引数まで限定。
- `deny` は `allow` より優先。secret / 不可逆操作は必ず deny に明示する。
- 新パターン追加時は本ファイルにも追記し、レビューを通す。

---

## 5. プリセット切替

`conservative` / `standard` / `aggressive` の 3 段階プリセットは [04_settings-presets.md](./04_settings-presets.md)。プロジェクト性質に応じて切り替える。

---

## 出典

- BP-011 (permissions): allowlist over auto-accept, https://code.claude.com/docs/en/best-practices, retrieved_at: 2026-06-23
- BP-014 (hooks): narrow matchers, https://code.claude.com/docs/en/hooks, retrieved_at: 2026-06-23
- Claude Code settings reference, https://code.claude.com/docs/en/settings, retrieved_at: 2026-06-23

## 不確実性

- `permissions.allow` のグロブ構文 (`Bash(* arg)` 形式) は CLI バージョンで微差がある。実機で `claude --debug` を当てて挙動確認する。
- MCP ツール名は MCP サーバー側の更新で変わるため、四半期で再点検する。
