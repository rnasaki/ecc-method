---
keywords: [knowledge-vault, directory, structure]
related: []
---
# 12-03 — Directory Structure (中央 Vault と 案件 Knowledge の規約)

ECC のナレッジは 2 層構成 ([[02_vault-setup]] §1)。本ファイルは各層のディレクトリ規約を定める。

## 1. ディレクトリ全体像

```
~/Documents/Knowledge/                  ← 中央 Vault (横断ナレッジ正本)
├── 00_INDEX.md                         # 全体 MOC
├── notes/                              # semantic (PII 除去済)
├── references/                         # 外部参照
├── procedures/                         # 横断手順
└── _moc-*.md                           # 主題別 MOC

<案件リポルート>/                        ← 案件 Knowledge (案件固有)
├── Knowledge/
│   ├── 00_INDEX.md                     # 案件 MOC
│   ├── notes/                          # 案件固有ノート (草案・PII 含み得る)
│   ├── episodes/                       # run ログ・決定 (案件のみ)
│   ├── procedures/                     # 案件固有手順
│   └── daily/                          # daily note (任意)
└── (案件のソースコード)

~/.claude/methods/ecc-method/           ← 配布物 (vault としては開かない)
├── 12_knowledge-vault/                 # 本規約一式
│   └── _obsidian-template/.obsidian/   # vault 設定テンプレ
└── 70_templates/
    └── knowledge-vault-INDEX.template.md  # 00_INDEX.md の雛形
```

## 2. 中央 Vault のディレクトリ役割

### 2.1 `~/Documents/Knowledge/notes/` — Semantic (横断)

- **何を置くか**: 案件横断で再利用できる事実・用語・関係。
- **置かないもの**: 個人名・組織名・案件固有の固有名詞・絶対パス・資格情報 ([[10_agent-memory-hierarchy]] §5)。案件 Knowledge から昇格時に除去 ([[07_promotion-flow]])。
- **粒度**: 1 ノート 1 概念。1 ファイル **200 行・25KB 以内**。
- **命名**: `<topic-kebab-case>.md` (例: `react-server-components.md`)。

### 2.2 `~/Documents/Knowledge/references/` — 外部参照

- **何を置くか**: URL / PDF / 論文の要約と引用。原典への link 必須。
- **書式**: 出典は ecc-method `25_writing-style/03_citation-style.md` に従う。
- **命名**: `<source>-<topic>.md` (例: `anthropic-memory-tool.md`)。

### 2.3 `~/Documents/Knowledge/procedures/` — Procedural (横断)

- **何を置くか**: 案件横断で再利用できる手順・チェックリスト。
- **45_runbook との分離**: ecc-method 規律として正式承認された procedure は `45_runbook/runbooks/` (本体) へ昇格。中央 Vault の `procedures/` は個人横断レベル。
- **命名**: `<verb-target>.md` (例: `setup-supabase-local.md`)。

## 3. 案件 Knowledge のディレクトリ役割

### 3.1 `<案件リポ>/Knowledge/notes/` — Semantic (案件)

- **何を置くか**: 案件固有の事実・草案・PII を含み得る生情報。
- **昇格**: 一段落したら一般化して中央 `notes/` へコピー ([[07_promotion-flow]])。

### 3.2 `<案件リポ>/Knowledge/episodes/` — Episodic

- **何を置くか**: 過去 run の決定・観察・失敗ログ。
- **書込みトリガ**: run 終了時 (`75_self-evolution/` の review cadence と整合)。
- **TTL**: 既定 30 日。古いものは archive。
- **命名**: `YYYY-MM-DD-<short-slug>.md`。
- **昇格**: 案件 episode は **基本中央へ昇格しない**。横断知見が抽出できた場合のみ `notes/` 経由で中央へ。

### 3.3 `<案件リポ>/Knowledge/procedures/` — Procedural (案件)

- **何を置くか**: 案件固有の手順・草案。
- **昇格段階**:
  1. 案件 `procedures/` に草案
  2. 個人横断で再利用 → 中央 `procedures/` へ
  3. ECC 規律として承認 → ecc-method `45_runbook/runbooks/` へ ([[10_agent-memory-hierarchy]] §4.2)

### 3.4 `<案件リポ>/Knowledge/daily/` — Daily Note (任意)

- **何を置くか**: 日次の作業メモ。
- **位置付け**: episodic の入口。価値ある決定は `episodes/` に昇格。

## 4. ecc-method 本体との分離原則

- 中央 Vault / 案件 Knowledge から ecc-method 本体規約 (`~/.claude/methods/ecc-method/`) を **参照** するのは可 (relative path link または GitHub URL)。
- ecc-method 本体ドキュメントから利用者の Vault / Knowledge を参照することは **しない** (本体は配布物で利用者の vault path を知らないため)。
- 案件固有の規律改善は ecc-method `75_self-evolution/` の手順で本体側に取り込む。

## 5. memory hierarchy との対応

| 層 | 中央 Vault | 案件 Knowledge | ecc-method |
|---|---|---|---|
| Semantic | `notes/` (横断・PII 除去済) | `notes/` (案件・草案) | — |
| Semantic (出典付) | `references/` | — | — |
| Episodic | (基本置かない) | `episodes/` | — |
| Procedural (個人横断) | `procedures/` | `procedures/` (案件草案) | — |
| Procedural (ECC 正本) | — | — | `45_runbook/runbooks/` |

詳細は [[10_agent-memory-hierarchy]] を参照。

## 6. 関連

- vault setup → [[02_vault-setup]]
- 昇格フロー → [[07_promotion-flow]]
- wikilink 命名 → [[04_wikilink-conventions]]
- MOC 運用 → [[05_moc-pattern]]
- type 分類 → [[06_knowledge-types]]
