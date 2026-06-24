---
keywords: [templates, knowledge, vault, index.template]
related: []
---
<!--
TEMPLATE: Knowledge vault のエントリポイント MOC
配置先: 案件リポルート直下 → Knowledge/00_INDEX.md
ecc-method 規約 (12_knowledge-vault/) は ~/.claude/methods/ecc-method/ から参照する想定
-->
---
name: 00_INDEX
description: Knowledge vault のエントリポイント MOC
metadata:
  type: reference
---

# Knowledge — Map of Content

この案件リポで蓄積するナレッジの入り口。詳細運用は ecc-method の `12_knowledge-vault/` を参照 (`~/.claude/methods/ecc-method/12_knowledge-vault/` または GitHub: https://github.com/rnasaki/ecc-method/tree/main/12_knowledge-vault)。

## 構成

| ディレクトリ | 役割 | 規約 |
|---|---|---|
| [notes/](./notes/) | semantic (事実・概念) | ecc-method 12-03 §2.1 |
| [references/](./references/) | 外部参照 (URL/PDF/論文) | ecc-method 12-03 §2.2 |
| [episodes/](./episodes/) | episodic (run ログ・決定) | ecc-method 12-03 §2.3 |
| [procedures/](./procedures/) | procedural 草案 | ecc-method 12-03 §2.4 |
| [daily/](./daily/) | daily note (任意) | ecc-method 12-03 §2.5 |

## Topic MOC (随時追加)

主題が増えてきたら `notes/_moc-<topic>.md` を作成し、ここから link する。

- _(まだ作成されていません)_

## 未作成リスト (前方参照中)

`[[name]]` で参照しているがまだ実体のないノート。次に書くべき候補。

- _(なし)_

## 運用ルール抜粋

- 1 ノート 1 概念、kebab-case 命名 ([[04_wikilink-conventions]])
- frontmatter で `metadata.type` を明示 ([[06_knowledge-types]])
- orphan を残さない: 新規ノート作成時に最低 1 箇所からリンクを張る ([[04_wikilink-conventions]] §4)
- 個人情報・組織情報・資格情報は書かない ([[10_agent-memory-hierarchy]] §5)
