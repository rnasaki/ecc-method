---
keywords: [knowledge-vault, obsidian, viewer]
related: []
---
# 12-01 — Obsidian は推奨ビューワ (必須ではない)

ecc-method は Markdown SSOT として動作し、**Obsidian なしでも完全に機能する**。本ディレクトリは Obsidian で開いた時にナレッジ蓄積体験が最良になるよう vault 設定と運用規約を提供するが、利用は任意。

## 1. 位置付け

- **正本**: リポジトリ内の `.md` ファイル群 (Git で版管理)。
- **Obsidian の役割**: Markdown を構造化ビューで閲覧・編集する viewer。Graph view / Backlinks / Quick switcher 等のナビゲーションを提供する。
- **非役割**: Obsidian の独自機能 (Canvas, Bases 等) に依存する設計はしない。Obsidian を外しても情報が欠落しない範囲で使う。

## 2. なぜ Obsidian か (他ツールとの位置取り)

| ツール | 強み | ECC 適合度 | 評価 |
|---|---|---|---|
| **Obsidian** | local-first, plain Markdown, `[[wikilink]]`, Graph view, Git 親和 | ★★★ | 個人 / 小チームの second brain。ECC の SSOT 思想と一致 |
| Notion | DB ビュー, 共同編集, 権限管理 | ★ | 全社ナレッジ正本向き。ECC の `.md` SSOT とは設計が合わない |
| Confluence | 階層 Wiki, 統制, 監査 | ★ | 大企業の正式ドキュメント基盤。ECC とは粒度が合わない |
| GitBook | 公開ドキュメント生成 | ★ | 公開用 wrapper として併用可。ナレッジ蓄積側ではない |
| VS Code Markdown | エディタ統合, 軽量 | ★★ | Obsidian なしの最小構成。Graph / Backlinks は得られない |

→ ECC の運用シナリオ (個人開発者 / 小チームの SDD-TDD ループ + ナレッジ蓄積) では Obsidian が最適、ただし「ECC が Obsidian に依存する」設計は避ける。

## 3. standard tool 評価

### 3.1 一般企業 (非 Tech)

- **standard 化**: ❌ ほぼ不可。
- **理由**: SSO/SCIM・監査ログ・DLP・全社調達ライセンスが Notion / Confluence / SharePoint に劣る。

### 3.2 Tech 企業 (チーム共有ナレッジ)

- **standard 化**: △ 限定的。
- **理由**: チーム正本は Notion / GitBook / Linear Docs が優勢。Obsidian は共同編集が弱い (Sync は同期、共同編集ではない)。

### 3.3 Tech 企業 (個人開発者の second brain)

- **standard 化**: ✅ 既に広く普及。
- **理由**: Markdown + Git + plugin エコシステムが engineer 個人 PKM と親和。

### 3.4 ecc-method の SSOT 管理

- **standard 化**: ✅ 推奨。
- **理由**: 既存の `[[name]]` wikilink (memory layer)、`.md` SSOT、ローカル運用思想と一致。Obsidian は「viewer として推奨」止まり、依存ではない。

## 4. 関連

- vault 導入手順は [[02_vault-setup]] を参照。
- ディレクトリ規約は [[03_directory-structure]] を参照。
- wikilink 規約は [[04_wikilink-conventions]] を参照。
- agent memory 階層との関係は [[10_agent-memory-hierarchy]] (`15_environment/`) を参照。
