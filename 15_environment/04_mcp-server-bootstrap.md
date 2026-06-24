---
keywords: [environment, mcp, server, bootstrap]
related: [40_delegation/01_expert-registry.md, 10_discovery/05_knowledge-acquisition.md, 15_environment/03_browser-automation.md, 10_discovery/04_constraint-mapping.md]
---
# 15-04 — MCP Server Bootstrap (起動手順)

ECC で頻出する MCP サーバの導入手順を一覧化する。Layer 0 のレジストリ ([40_delegation/01_expert-registry.md](../40_delegation/01_expert-registry.md)) で参照されるサーバはここで導入確認を行う。

## 対象 MCP

| MCP | 用途 | 推奨 scope |
|---|---|---|
| context7 | ライブラリ公式 docs 検索 | user (全プロジェクト共通) |
| exa | web 検索 | user |
| playwright | ブラウザ操作 | user |
| videodb | 動画分析 | project (必要時のみ) |
| nutrient | PDF / OCR | project |

## 共通設定

```
スコープ:
  - user: {{home}}/.claude.json (全プロジェクト共通)
  - project: {{repo_root}}/.claude/settings.local.json (リポ固有)

確認コマンド:
  claude mcp list
  claude mcp get <name>

削除:
  claude mcp remove <name>
```

機微情報 (api key) は環境変数で渡し、`.claude.json` に直書きしない。

## context7

公式 docs lookup の中核。`docs-lookup` agent / 経路 A ([10_discovery/05_knowledge-acquisition.md](../10_discovery/05_knowledge-acquisition.md)) の依存。

```
インストール:
  claude mcp add context7 \
    -- npx -y @upstash/context7-mcp@latest

確認:
  claude mcp get context7
  → resolve-library-id / query-docs ツールが見えれば OK

利用 (agent 内):
  mcp__context7__resolve-library-id { query: "next.js" }
  mcp__context7__query-docs { library_id, query, version? }
```

## exa

web 検索特化。経路 D ([10_discovery/05_knowledge-acquisition.md](../10_discovery/05_knowledge-acquisition.md)) の最終手段。

```
事前: EXA_API_KEY を環境変数に設定 ({{home}}/.config/secrets 等)

インストール:
  claude mcp add exa \
    --env EXA_API_KEY=$EXA_API_KEY \
    -- npx -y @exa/mcp@latest

確認:
  claude mcp get exa
```

## playwright

GUI / E2E。詳細は [03_browser-automation.md](./03_browser-automation.md)。

```
インストール:
  claude mcp add playwright \
    -- npx -y @playwright/mcp@latest

ブラウザバイナリ:
  npx playwright install chromium
```

## videodb

動画 / 音声分析が必要な案件のみ。

```
事前: VIDEODB_API_KEY を環境変数に
インストール:
  claude mcp add videodb \
    --env VIDEODB_API_KEY=$VIDEODB_API_KEY \
    -- npx -y @videodb/mcp@latest
```

## nutrient

PDF / 文書 OCR が必要な案件のみ。

```
事前: NUTRIENT_API_KEY を環境変数に
インストール:
  claude mcp add nutrient \
    --env NUTRIENT_API_KEY=$NUTRIENT_API_KEY \
    -- npx -y @nutrient/mcp@latest
```

## 起動順 (推奨)

```
1. user scope で context7, exa, playwright を導入
2. 案件に応じて project scope で videodb / nutrient を追加
3. claude mcp list で health 確認
4. 各 MCP の最初の呼び出しを「smoke test」として軽い query で投げる
5. 失敗ログ → fallback 経路 ([10_discovery/05_knowledge-acquisition.md](../10_discovery/05_knowledge-acquisition.md)) に切替
```

## health check スクリプト

```yaml
mcp_health:
  context7:
    smoke: resolve-library-id("react")
    expected: hit
  exa:
    smoke: search("anthropic claude")
    expected: results > 0
  playwright:
    smoke: browser_navigate("about:blank")
    expected: ok
```

`{{repo_root}}/scripts/mcp_health.sh` 等で定期実行する。

## トラブルシュート

| 症状 | 対応 |
|---|---|
| `mcp list` に出ない | `claude mcp add` を再実行、scope を確認 |
| API key 無効 | env を再 export、shell 再起動 |
| TLS エラー | corporate CA bundle を確認 ([10_discovery/04_constraint-mapping.md](../10_discovery/04_constraint-mapping.md)) |
| timeout | proxy 経由 / npm registry mirror に切替 |
| 古い version | `--latest` 指定で再インストール |

## 出典

- Anthropic Claude Code MCP docs (https://code.claude.com/docs/en/mcp, retrieved 2026-06-23)
- Model Context Protocol spec (https://modelcontextprotocol.io/, retrieved 2026-06-23)
- Context7 (https://github.com/upstash/context7, retrieved 2026-06-23)
- Exa MCP (https://exa.ai/, retrieved 2026-06-23)
- Playwright MCP (https://github.com/microsoft/playwright-mcp, retrieved 2026-06-23)

## 不確実性

- 各 MCP の npm パッケージ名は配布元の都合で変わりうる。導入時に最新 README を確認すること。
- API key 必須の MCP (exa / videodb / nutrient) は無料枠 / 課金条件が変動する。
- `claude mcp add` のオプション (--env 等) は CLI の version で挙動が変わる可能性あり。
