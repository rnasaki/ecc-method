---
keywords: [knowledge-vault, wikilink, conventions]
related: [12_knowledge-vault/03_directory-structure.md]
---
# 12-04 — Wikilink Conventions

`[[name]]` 形式のリンクで Knowledge 同士、および ecc-method 本体との接続を維持する。dead link / orphan note を抑止する規約。

## 1. リンク形式の選択

| 形式 | 用途 | 例 |
|---|---|---|
| `[[note-name]]` | Knowledge 内・vault 内の他ノート | `[[react-server-components]]` |
| `[[note-name\|表示名]]` | 別表示が必要な時のみ | `[[react-server-components\|RSC]]` |
| `[name](relative/path.md)` | ecc-method 本体間, README, 公開ドキュメント | `[03_directory-structure](./03_directory-structure.md)` |

**原則**:

- **Knowledge/ 配下** = wikilink (`[[name]]`)。Obsidian で開いた時のナビ最適化。
- **ecc-method 本体** = relative path link (`[text](path.md)`)。Obsidian なしでも GitHub 等で機能するため。

## 2. 命名規則

- kebab-case: `react-server-components.md` (× `ReactServerComponents.md`, × `react_server_components.md`)。
- 1 ノート 1 概念。複数概念を詰め込まない。
- 案件固有プレフィクスは付けない (vault は案件単位で分離されるため不要)。
- 日付プレフィクスは `episodes/` `daily/` のみ (`YYYY-MM-DD-`)。

## 3. dead link 抑止

`[[name]]` を書いた時点で対応ファイルが存在しない場合、Obsidian は薄い色でリンクを表示する。**意図的な前方参照** (これから書く予定) は許可、ただし `00_INDEX.md` の "未作成リスト" に記録する。

## 4. orphan note 抑止

どこからもリンクされないノートを Obsidian は orphan として表示する。orphan を残さないため:

- 新規ノート作成時に **必ず最低 1 箇所** からリンクを張る (`00_INDEX.md` か親概念ノートから)。
- 月次レビューで orphan 一覧を確認し、削除 or 接続。

## 5. ecc-method 本体側の wikilink との互換

ecc-method 本体は基本 `relative path` を使うが、**memory layer の `[[name]]` 参照** (`MEMORY.md` の `[[feedback_no_scope_dodging]]` 等) は wikilink。これは `~/.claude/projects/.../memory/` 配下で完結するため Obsidian なしでも問題ない。

Obsidian で memory ディレクトリを開く場合は、`memory/` を別 vault にするか sub-vault として扱う。本リポの vault には含めない。

## 6. リンク監査

`Knowledge/` 配下の dead link / orphan を検出するスクリプト (任意):

```bash
# orphan 検出 (Knowledge/ 配下で誰からも参照されない .md)
find Knowledge -name '*.md' | while read f; do
  name=$(basename "$f" .md)
  if ! grep -rq "\[\[$name" Knowledge --include='*.md' --exclude="$(basename "$f")"; then
    echo "ORPHAN: $f"
  fi
done
```

実行は `45_runbook/` の月次メンテに含める ([[05_maintenance]] in `45_runbook/`)。

## 7. 関連

- ディレクトリ規約 → [[03_directory-structure]]
- MOC 運用 → [[05_moc-pattern]]
