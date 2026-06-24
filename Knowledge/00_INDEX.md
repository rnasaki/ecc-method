---
keywords: [knowledge, index, ecc-method-project]
related: [12_knowledge-vault/03_directory-structure.md, 12_knowledge-vault/07_promotion-flow.md]
---
---
name: 00_INDEX
description: ecc-method 案件 (本リポ自体) の Knowledge MOC
metadata:
  type: reference
  project: ecc-method
---

# ecc-method Project Knowledge — MOC

ecc-method **本体を開発する案件**としての Knowledge。ecc-method 規律自体の検証・改善・runbook 化のために蓄積する。

> 配布物 (`12_knowledge-vault/`) と区別: 配布物は他案件向け規約、こちら (`Knowledge/`) は ecc-method 開発者の作業ナレッジ。

## 構成

| ディレクトリ | 役割 |
|---|---|
| [notes/](./notes/) | ecc-method 設計に関する事実・整理 |
| [episodes/](./episodes/) | 設計決定・セッション ログ |
| [procedures/](./procedures/) | ecc-method 開発で使う案件固有手順 |
| [daily/](./daily/) | 日次作業メモ (任意) |

詳細規約は [12_knowledge-vault/03_directory-structure.md](../12_knowledge-vault/03_directory-structure.md) を参照。

## Topic MOC

- _(まだ作成されていません)_

## 中央 Vault への昇格

ecc-method 開発で得た横断ナレッジは `~/Documents/Knowledge/` へ昇格する。手順は [12-07 promotion-flow](../12_knowledge-vault/07_promotion-flow.md)。

ECC 規律として正式に取り込むべき procedure は `45_runbook/runbooks/` に直接 PR する (中央 Vault は経由しない)。

## 運用ルール抜粋

- 1 ノート 1 概念、kebab-case 命名
- frontmatter で `metadata.type` を明示
- 案件名 (ecc-method) を残してよい — 中央 Vault 昇格時に除去する
- 個人情報・資格情報は書かない
