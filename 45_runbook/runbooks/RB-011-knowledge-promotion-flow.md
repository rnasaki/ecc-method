---
keywords: [runbook, knowledge, promotion, vault, obsidian]
related: [12_knowledge-vault/02_vault-setup.md, 12_knowledge-vault/07_promotion-flow.md, 12_knowledge-vault/03_directory-structure.md, 15_environment/10_agent-memory-hierarchy.md]
---
# RB-011 — Knowledge 昇格フロー (案件 → 中央 Vault → 45_runbook)

## トリガ

以下のいずれかに該当した時:

- 案件 `Knowledge/notes/` を編集 / 新規作成し、`promotion_candidate: true` または `status: verified` を付けた
- ユーザーから「このナレッジを中央に上げて」「他案件でも使えるよう一般化して」と指示された
- 完了処理 (RB-006 §Step [0] CLOSURE GATE) で案件 Knowledge に未昇格候補を検知した
- 案件 `Knowledge/procedures/` の手順を 2 案件以上で再利用した

## 前提

- 中央 Vault = `~/Documents/Knowledge/` ([12-02 Vault Setup](../../12_knowledge-vault/02_vault-setup.md))
- 案件 Knowledge = `<cwd>/Knowledge/`
- 配布規約 = ecc-method `12_knowledge-vault/`

## 判定基準 (4 条件すべて満たす)

- [ ] **再利用性**: 他案件 / 他文脈でも有用。案件固有業務ロジックは対象外。
- [ ] **完成度**: `status: verified` (草案 `draft` は対象外)。
- [ ] **粒度**: 1 ノート 1 概念。長すぎる場合は分割してから昇格。
- [ ] **PII / 機密**: 含まない (含む場合は除去後に昇格)。

判定に迷ったら **昇格しない**。中央汚染より残置の方が安い。

## 手順

### Step 1. 候補検出

```bash
cd <案件リポ>
grep -l 'promotion_candidate: true\|status: verified' Knowledge/notes/*.md Knowledge/procedures/*.md 2>/dev/null
```

### Step 2. agent に PII 除去 + 一般化を委任

```
Agent(subagent_type="general-purpose", prompt="
案件 Knowledge/notes/<topic>.md を中央 Vault 用に一般化してください。
- 案件固有の固有名詞 (会社名・プロジェクト名・人名) を一般語に置換
- 絶対パス・URL の機密部を除去
- 案件固有の業務ロジックは削除し、汎用パターンのみ残す
- frontmatter の status を verified に
- 出力: ~/Documents/Knowledge/notes/<topic>.md にコピーすべき差分案
- 800 token 以内
")
```

### Step 3. ユーザー承認 + コピー

差分案を確認し、必要なら手動修正。承認したら:

```bash
cp <案件リポ>/Knowledge/notes/<topic>.md ~/Documents/Knowledge/notes/<topic>.md
# Step 2 で得た一般化を反映
```

### Step 4. 案件側にマーク追記

案件 `Knowledge/notes/<topic>.md` の frontmatter に:

```yaml
---
metadata:
  type: reference
  promoted_at: <YYYY-MM-DD>
  promoted_to: ~/Documents/Knowledge/notes/<topic>.md
---
```

### Step 5. 中央側に出典マーク追記

`~/Documents/Knowledge/notes/<topic>.md` の frontmatter に:

```yaml
---
metadata:
  type: reference
  promoted_from: <案件名>/Knowledge/notes/<topic>.md
  promoted_at: <YYYY-MM-DD>
---
```

### Step 6. 中央 Vault commit

```bash
cd ~/Documents/Knowledge
git add notes/<topic>.md
git commit -m "promote: <topic> from <案件名>"
```

## procedure の 2 段階昇格

```
案件 Knowledge/procedures/<verb-target>.md         (草案・案件固有)
        ↓ 個人横断で再利用された時
~/Documents/Knowledge/procedures/<verb-target>.md  (個人横断)
        ↓ ECC 規律として承認された時
~/.claude/methods/ecc-method/45_runbook/runbooks/RB-XXX-<slug>.md  (ECC 正本)
```

3 段目への昇格は ecc-method 本体への PR 扱い。INDEX.md 追記必須 ([02_indexing-rules.md](../02_indexing-rules.md))。

## 命名衝突

中央 Vault に同名 note が既存:

- **同一概念**: 中央側を更新（既存を base に案件側追記をマージ）。
- **別概念**: 案件側 note 名にプレフィクス追加 (`<topic>-<aspect>.md`) してから昇格。

## 逆向き禁止

中央 Vault → 案件 Knowledge への自動コピーはしない。中央を案件で参照したい時は relative path link または Obsidian で中央 Vault を別途開く。

理由: 案件リポを Git 共有すると、中央スナップショットが案件チーム全員に分散コピーされ整合性が崩れる。

## 失敗モードと回避

| 失敗 | 原因 | 回避 |
|---|---|---|
| 中央が案件固有名で汚染 | Step 2 を省略 | 必ず agent 経由で一般化、人手レビュー |
| 同じ概念が複数 note に分散 | 命名規約違反 | 1 ノート 1 概念、kebab-case 厳守 |
| 案件側を後で更新したのに中央が古いまま | 双方向同期がない (意図的) | 案件側 frontmatter `promoted_to` を見て手動再昇格 |
| 中央が肥大化 (50 note 超) | 昇格基準が緩い | 4 条件チェック厳守、迷ったら案件残置 |

## 出典

- ecc-method [12-07 Promotion Flow](../../12_knowledge-vault/07_promotion-flow.md)
- ecc-method [15-10 Agent Memory Hierarchy §4](../../15_environment/10_agent-memory-hierarchy.md) — 階層間遷移ルール
- Anthropic memory tool best practices, retrieved_at: 2026-06-23. https://docs.claude.com/en/docs/agents-and-tools/tool-use/memory-tool

## 不確実性

- 4 条件チェックの「再利用性」判定は本質的に主観。判定 agent を別個体に分離すべきだが現状未実装。
- 案件横断で再利用された回数のトラッキング機構なし (procedure の 2 段階昇格判定が手動)。
- 命名衝突解消は手動。Obsidian の rename refactor で wikilink は追従するが、relative path link は手動修正必要。
