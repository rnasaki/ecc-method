---
keywords: [permissions, settings, presets]
related: [50_permissions/03_blast-radius-rubric.md]
---
# 04 — Settings Presets (3 段階プリセット)

`.claude/settings.local.json` の 3 段階プリセット。プロジェクト性質と運用フェーズに応じて切り替える。

---

## 1. プリセット選定基準

| プリセット | 想定環境 | 既定動作 |
|---|---|---|
| conservative | 本番接続あり / 個人データあり / 規制業務 | 既定 deny、明示的 allow のみ |
| standard | 通常開発 / staging | 行列通り ([03_blast-radius-rubric.md](./03_blast-radius-rubric.md)) |
| aggressive | 隔離 sandbox / オフライン研究 / disposable VM | local read/write は ACT、外部のみ ASK |

---

## 2. conservative.json

```json
{
  "$schema": "https://code.claude.com/schemas/settings.json",
  "permissions": {
    "allow": [
      "Read",
      "Grep",
      "Glob",
      "Bash(git status)",
      "Bash(git diff *)",
      "Bash(git log *)",
      "Bash(npm run lint)",
      "Bash(npm run typecheck)",
      "mcp__context7__resolve-library-id",
      "mcp__context7__query-docs"
    ],
    "ask": [
      "Edit",
      "Write",
      "Bash(npm test)",
      "Bash(npm run build)",
      "Bash(git add *)",
      "Bash(git commit *)",
      "Bash(git checkout *)",
      "Bash(pytest *)",
      "WebFetch",
      "mcp__exa__*"
    ],
    "deny": [
      "Bash(git push *)",
      "Bash(rm *)",
      "Bash(npm install *)",
      "Bash(pip install *)",
      "Bash(curl *)",
      "Read(./.env*)",
      "Read(./.aws/**)",
      "Read(./.ssh/**)",
      "Edit(./.env*)",
      "Edit(./.claude/settings.json)",
      "mcp__playwright__*"
    ]
  },
  "env": {
    "BASH_DEFAULT_TIMEOUT_MS": "60000",
    "MAX_THINKING_TOKENS": "16000"
  }
}
```

設計思想: 編集も含めて ASK。read 系と read-only 検証系のみ ACT。secret アクセス・push・install は完全 deny。

---

## 3. standard.json

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
      "Bash(npm run typecheck)",
      "Bash(npm test)",
      "Bash(pytest *)",
      "Bash(git status)",
      "Bash(git diff *)",
      "Bash(git log *)",
      "Bash(git add *)",
      "Bash(git commit -m:*)",
      "Bash(git branch *)",
      "Bash(git checkout *)",
      "Bash(git switch *)",
      "Bash(git stash *)",
      "mcp__context7__*"
    ],
    "ask": [
      "Bash(git push origin :*)",
      "Bash(npm install *)",
      "Bash(pip install *)",
      "Bash(curl *)",
      "Bash(gh issue create *)",
      "Bash(gh pr create *)",
      "WebFetch",
      "mcp__exa__*",
      "mcp__playwright__browser_navigate",
      "mcp__playwright__browser_click"
    ],
    "deny": [
      "Bash(rm -rf *)",
      "Bash(git push --force *)",
      "Bash(git push * main)",
      "Bash(git push * master)",
      "Read(./.env*)",
      "Read(./.aws/**)",
      "Read(./.ssh/**)",
      "Edit(./.env*)",
      "Edit(./.claude/settings.json)"
    ]
  },
  "env": {
    "BASH_DEFAULT_TIMEOUT_MS": "120000",
    "MAX_THINKING_TOKENS": "16000"
  }
}
```

設計思想: ローカル編集 / build / test / git ローカル操作は ACT。push / install / 第三者送信は ASK。

---

## 4. aggressive.json

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
      "Bash(npm *)",
      "Bash(pnpm *)",
      "Bash(yarn *)",
      "Bash(pytest *)",
      "Bash(go *)",
      "Bash(cargo *)",
      "Bash(git *)",
      "Bash(gh issue list *)",
      "Bash(gh pr list *)",
      "Bash(curl *)",
      "WebFetch",
      "mcp__context7__*",
      "mcp__exa__*",
      "mcp__playwright__*"
    ],
    "ask": [
      "Bash(git push --force *)",
      "Bash(gh pr merge *)",
      "Bash(gh release create *)"
    ],
    "deny": [
      "Bash(rm -rf /)",
      "Bash(git push * main)",
      "Bash(git push * master)",
      "Read(./.env*)",
      "Read(./.aws/**)",
      "Read(./.ssh/**)"
    ]
  },
  "env": {
    "BASH_DEFAULT_TIMEOUT_MS": "300000",
    "MAX_THINKING_TOKENS": "31999"
  }
}
```

設計思想: 隔離環境前提でほぼ全アクションを ACT。main 直 push と secret 読み取りのみ deny。**未隔離環境では使用禁止。**

---

## 5. 切替手順

```bash
# プリセット適用 (例)
cp ecc-method/50_permissions/presets/standard.json .claude/settings.local.json

# 確認
claude --debug
```

注: 上記の `presets/` ディレクトリ自体は本パッケージには含めない。各章本文の JSON ブロックをコピーして使う、または案件導入時に生成する。

---

## 6. プリセット選定フロー

```
1. 本番資源 / 顧客データに触れるか?
   YES → conservative
   NO  → 2

2. 隔離環境 (devcontainer / VM / sandbox) か?
   YES → aggressive
   NO  → 3

3. 通常開発  → standard
```

---

## 7. 反パターン

| 反パターン | 害 |
|---|---|
| 本番接続環境で aggressive 適用 | 不可逆事故 |
| conservative のまま長時間運用 | ASK 過多で認知疲労、判断雑化 |
| プリセットを自作で混ぜすぎ | 一貫性喪失、レビュー困難 |
| `--dangerously-skip-permissions` | プリセットを無効化、deny も無視 |

---

## 出典

- BP-011 (permissions): allowlist over auto-accept, https://code.claude.com/docs/en/best-practices, retrieved_at: 2026-06-23
- BP-012 (permissions): OS-level sandboxing, https://code.claude.com/docs/en/best-practices, retrieved_at: 2026-06-23
- Claude Code settings reference, https://code.claude.com/docs/en/settings, retrieved_at: 2026-06-23

## 不確実性

- 上記 `permissions.allow` グロブ構文は CLI バージョンに依存する。導入時に `claude --debug` で挙動を確認すること。
- aggressive プリセットは隔離環境前提。devcontainer / VM / 一時 worktree 以外での利用は想定しない。
