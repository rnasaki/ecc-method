---
keywords: [knowledge-vault, knowledge, types]
related: []
---
# 12-06 — Knowledge Types (auto-memory との対応)

Knowledge ノートの **type 分類**。Claude Code の auto memory と同じ 4 type を採用し、ノート frontmatter で明示する。

## 1. 4 type 分類

| type | 何を保持 | 配置先 |
|---|---|---|
| `user` | 利用者の役割・嗜好・知識 | `Knowledge/notes/` (個人セクション) |
| `feedback` | 「こうしてほしい / こうしないでほしい」指示 | `Knowledge/notes/_feedback/` |
| `project` | 案件の進行状態・決定・締切 | `Knowledge/episodes/` |
| `reference` | 外部参照・資料の所在 | `Knowledge/references/` |

> auto memory (`~/.claude/.../memory/`) と同じ分類だが、配置先は **本リポの `Knowledge/`**。auto memory はマシンローカル / 横断的、Knowledge は案件リポ単位 / Git 共有。役割が異なる ([[10_agent-memory-hierarchy]] §3.1)。

## 2. Frontmatter

各ノート冒頭に YAML frontmatter:

```markdown
---
name: react-server-components
description: RSC の境界とデータフローの整理
metadata:
  type: reference
  created: 2026-06-24
  reviewed: 2026-06-24
---

# React Server Components
...
```

- `name`: ファイル名と一致 (kebab-case)。
- `description`: 1 行サマリ (Obsidian Quick switcher で表示)。
- `metadata.type`: 上記 4 値のいずれか。
- `metadata.created` / `reviewed`: 鮮度管理 (`75_self-evolution/01_freshness-policy.md`)。

## 3. type 別の書込みトリガ

`~/.claude/CLAUDE.md` の auto memory 仕様と整合:

### user
- 利用者の役割・責任範囲・既知ドメインを学んだ時。
- 例: 「データサイエンティストとして観測性を調査中」。

### feedback
- 利用者が approach を修正した時 (corrections)。
- 利用者が非自明な judgment call を肯定した時 (validated decisions)。
- **why** と **how to apply** を必ず本文に書く。

### project
- 「誰が・何を・なぜ・いつまでに」を学んだ時。
- 相対日付は **絶対日付に変換** ("木曜" → "2026-06-25")。

### reference
- 外部資料 (Linear / Slack / Grafana / 論文 / docs) の所在を学んだ時。
- 用途と「どんな時に見るか」を併記。

## 4. type 別の保存しないもの

- code パターン・規約・ファイル構成 (コード読めば分かる)。
- git 履歴 (`git log` / `git blame` が正本)。
- debug の修正レシピ (修正は code に、context は commit message に)。
- 既に CLAUDE.md / ecc-method 本体に書かれているもの。
- 進行中の作業状態 (これは `.session-state/` の役割)。

## 5. 既存 ECC 規律との関係

- **`75_self-evolution/`** = type 横断の鮮度管理。`reviewed` が古いノートを抽出して再検証。
- **`45_runbook/`** = procedural type の正本。Knowledge 側の `procedures/` から昇格 ([[10_agent-memory-hierarchy]] §4.2)。
- **`.session-state/`** = ephemeral な作業状態。Knowledge には書かない。
- **`~/.claude/.../memory/MEMORY.md`** = マシン横断の auto memory。案件 Knowledge とは別レイヤ。

## 6. 関連

- agent memory 階層 → [[10_agent-memory-hierarchy]]
- ディレクトリ規約 → [[03_directory-structure]]
- 鮮度管理 → `75_self-evolution/01_freshness-policy.md`
