---
keywords: [knowledge-vault, moc, pattern]
related: []
---
# 12-05 — MOC (Map of Content) Pattern

**MOC** = Map of Content。Knowledge を主題別に束ねるエントリポイント。Folder ではなく **link の集合** で構造を作る。

## 1. なぜ MOC か

- フォルダは 1 ノート 1 場所しか持てない。複数の文脈に属するノートを表現できない。
- タグは羅列で粒度が粗い。
- MOC = 主題ごとの index ノート。1 ノートが複数 MOC から参照されてよい。

## 2. ECC での MOC 配置

- **Root MOC**: `Knowledge/00_INDEX.md`。全 MOC への入り口。
- **Topic MOC**: `Knowledge/notes/_moc-<topic>.md`。例: `_moc-frontend.md`, `_moc-llm-ops.md`。
- **接頭辞** `_moc-` で MOC ノートを通常ノートと区別。

## 3. MOC の最小フォーマット

```markdown
# MOC: <主題>

> このノートは <主題> に関する Knowledge の入り口。

## 中核概念
- [[concept-a]]
- [[concept-b]]

## 関連手順
- [[procedures/setup-foo]]

## 外部参照
- [[references/anthropic-memory-tool]]

## 関連 MOC
- [[_moc-llm-ops]]
```

## 4. 運用ルール

- 新規ノート作成時、該当 MOC に必ず追記する (orphan 抑止 / [[04_wikilink-conventions]] §4)。
- MOC が 50 link を超えたら **sub-MOC に分割** する (Obsidian の Outline panel が機能不全になる目安)。
- MOC 同士の相互参照は許可。循環は問題なし (Graph view で確認できる)。

## 5. Graph view との関係

`.obsidian/graph.json` (vault setup で配布) で以下の filter を既定にする:

- `Knowledge/` 配下のみ表示。
- MOC ノート (`_moc-*`) を **大きいサイズ**, 通常ノートを小サイズで描画。
- ecc-method 本体 (`30_sdd-phase/` 等) は別グループとして弱く描画。

→ 「Knowledge の主題地図」と「ecc-method 規律」が一目で分離できる。

## 6. ECC 本体側の INDEX との関係

ecc-method 本体には既に `45_runbook/INDEX.md` が存在する。これは **runbook の index** であり、本ファイルの MOC とは役割が異なる:

| index 種別 | 対象 | 場所 |
|---|---|---|
| 45_runbook/INDEX.md | 正式 runbook | ecc-method 本体 |
| Knowledge/00_INDEX.md | 案件ナレッジの MOC | `Knowledge/` |
| Knowledge/notes/_moc-*.md | 主題別 sub-MOC | `Knowledge/notes/` |

本体 index と Knowledge MOC は **片方向参照** (Knowledge → 本体 のみ) に揃える ([[03_directory-structure]] §3)。

## 7. 関連

- ディレクトリ規約 → [[03_directory-structure]]
- type 分類 → [[06_knowledge-types]]
