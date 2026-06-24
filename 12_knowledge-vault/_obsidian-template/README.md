---
keywords: [knowledge-vault, _obsidian-template]
related: [12_knowledge-vault/02_vault-setup.md]
---
# Obsidian 設定テンプレート

案件リポを Obsidian vault として開く際の推奨設定。**任意**。

## 導入

```bash
cp -r 12_knowledge-vault/_obsidian-template/.obsidian <案件リポルート>/
```

その後 Obsidian で「Open folder as vault」→ 案件リポルートを選択。

## 含まれるファイル

- `app.json` — Wikilinks ON, Source mode 既定, attachment 配置
- `appearance.json` — テーマ既定値
- `core-plugins.json` — Graph / Backlinks / Outgoing links / Tags / Templates のみ ON
- `graph.json` — `Knowledge/` 系と本体ドキュメントを色分けする graph filter

詳細は [12-02 Vault Setup](../02_vault-setup.md) を参照。

## カスタマイズ

各ファイルを直接編集してよい。チーム共有したい変更は Git commit、個人環境固有は `.gitignore` 側で除外 (workspace.json 等)。
