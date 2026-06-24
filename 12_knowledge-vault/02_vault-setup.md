---
keywords: [knowledge-vault, vault, setup]
related: []
---
# 12-02 — Vault Setup (中央 Vault + 案件 Knowledge の Hybrid)

ECC のナレッジ管理は **2 層 Hybrid** 構成。中央 Vault に横断ナレッジを集約し、案件 Knowledge には案件固有の作業メモを置く。Obsidian は 2 つの vault を別々に開く。

## 1. 全体構成

```
~/Documents/Knowledge/                  ← ★ 中央 Vault (案件横断・常に開く)
├── .obsidian/                          # vault 設定
├── 00_INDEX.md                         # 全体 MOC
├── notes/                              # 横断ナレッジ (PII 除去済み)
├── references/                         # 外部参照
├── procedures/                         # 横断手順
└── _moc-*.md                           # 主題別 MOC

<案件リポ>/                              ← ★ 案件 Knowledge (案件固有・案件作業時のみ開く)
├── .obsidian/                          # 案件単位の vault 設定
├── Knowledge/
│   ├── 00_INDEX.md                     # 案件 MOC
│   ├── notes/                          # 案件固有ノート
│   ├── episodes/                       # run ログ・決定 (PII 含み得る)
│   ├── procedures/                     # 案件固有手順
│   └── daily/
└── (案件のソースコード)

~/.claude/methods/ecc-method/           ← 配布物 (vault としては開かない)
├── 12_knowledge-vault/                 # 規約一式
│   └── _obsidian-template/.obsidian/   # vault 設定テンプレ
└── 70_templates/
    └── knowledge-vault-INDEX.template.md
```

## 2. 役割分担

| 層 | 場所 | 何を書くか | 公開範囲 |
|---|---|---|---|
| 中央 Vault | `~/Documents/Knowledge/` | 案件横断で再利用できる純化されたナレッジ | 個人 (PII 除去済) |
| 案件 Knowledge | `<案件リポ>/Knowledge/` | 案件固有の作業メモ・決定・PII 含み得る生情報 | 案件チーム (Git で共有) |
| ecc-method | `~/.claude/methods/ecc-method/` | 規約とテンプレ配布物 (本リポ) | 全利用者共通 |

## 3. データの流れ

```
案件 Knowledge/notes/<topic>.md  ←(初稿はここに書く)
        ↓
   [手動昇格 (agent 補助)]
   PII 除去 / 案件固有名を一般化
        ↓
中央 Vault notes/<topic>.md      ←(横断再利用)
```

詳細は [[07_promotion-flow]] を参照。

## 4. 中央 Vault の初期化

初回のみ。1 度だけ実行する。

### Step 1. ディレクトリ作成

```bash
mkdir -p ~/Documents/Knowledge/{notes,references,procedures}
```

### Step 2. vault 設定をコピー

```bash
cp -r ~/.claude/methods/ecc-method/12_knowledge-vault/_obsidian-template/.obsidian ~/Documents/Knowledge/
```

### Step 3. 00_INDEX.md を生成

```bash
cp ~/.claude/methods/ecc-method/70_templates/knowledge-vault-INDEX.template.md ~/Documents/Knowledge/00_INDEX.md
```

冒頭コメントを削除し、「中央 Vault」用に編集 (`Knowledge/episodes/` `daily/` の表は削除し、横断ナレッジ用の構成に修正)。

### Step 4. Obsidian で開く

Obsidian → 「保管庫としてフォルダを開く」→ `~/Documents/Knowledge/` を選択。**この vault を Obsidian の既定として常に開いておく**。

### Step 5. Git 管理 (任意)

```bash
cd ~/Documents/Knowledge
git init
echo ".obsidian/workspace*.json" >> .gitignore
echo ".obsidian/cache" >> .gitignore
git add . && git commit -m "init central knowledge vault"
```

複数マシンで共有したい場合は private repo を origin に設定。

## 5. 案件 Knowledge の初期化

新しい案件で ecc-method を導入する度に実行。

### Step 1. Knowledge ディレクトリ作成

```bash
cd <案件リポルート>
mkdir -p Knowledge/{notes,episodes,procedures,daily}
```

### Step 2. vault 設定をコピー (任意 — Obsidian で開きたい場合のみ)

```bash
cp -r ~/.claude/methods/ecc-method/12_knowledge-vault/_obsidian-template/.obsidian ./
```

### Step 3. 00_INDEX.md を生成

```bash
cp ~/.claude/methods/ecc-method/70_templates/knowledge-vault-INDEX.template.md Knowledge/00_INDEX.md
```

冒頭コメントを削除し、案件名で編集。

### Step 4. .gitignore 追記

```gitignore
.obsidian/workspace.json
.obsidian/workspace-mobile.json
.obsidian/cache
.obsidian/plugins/*/data.json
```

### Step 5. Obsidian で開く (任意)

案件作業中だけ案件リポを vault として別途開く。中央 Vault と切り替え運用。

> Obsidian の **Quick switcher** (`Ctrl+O`) は vault 内のみを検索する。横断検索したい時は中央 Vault を開く。

## 6. 運用フロー

1. 案件作業中: 案件 vault で `Knowledge/episodes/` `notes/` に書く (PII 含んでも可)
2. 一段落したら: 案件 `notes/` のうち他案件で使えそうなものを **手動昇格** ([[07_promotion-flow]])
3. 横断参照したい時: 中央 Vault を Obsidian で開いて検索・閲覧

## 7. ecc-method 本体の閲覧

ecc-method 自体の規約を Obsidian で読みたい場合は **3 つ目の vault** として `~/.claude/methods/ecc-method/` を開く (中央 Vault や案件 vault と混ぜない)。

## 8. トラブルシュート

| 症状 | 原因 | 対処 |
|---|---|---|
| `[[name]]` が補完されない | Wikilink が無効 | Settings → Files & Links → "Use [[Wikilinks]]" を ON |
| 中央と案件で同名ノート | 命名衝突 | 案件側に `<project>-<topic>.md` のように prefix を付けてから昇格 |
| Graph が真っ白 | filter が厳しすぎ | `graph.json` を一旦削除して再生成 |

## 9. 関連

- ディレクトリ規約 → [[03_directory-structure]]
- wikilink 命名規約 → [[04_wikilink-conventions]]
- MOC 運用 → [[05_moc-pattern]]
- 昇格フロー → [[07_promotion-flow]]
