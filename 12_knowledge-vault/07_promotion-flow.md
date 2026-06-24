---
keywords: [knowledge-vault, promotion, flow]
related: []
---
# 12-07 — Promotion Flow (案件 Knowledge → 中央 Vault)

案件で書いた個別ノートを中央 Vault に **手動昇格** する手順。agent が補助するが、最終承認は利用者。

## 1. なぜ手動昇格か

- 自動同期 (symlink / cron) では PII 除去・案件固有名の一般化が漏れる。
- 中央 Vault は「他案件で再利用できる純化された知見」だけを正本にする。粒度判定は人間判断。
- 案件側にも昇格元を残すことで「中央のあの note は元々この案件から来た」が辿れる。

## 2. 昇格対象の判定基準

中央 Vault に昇格すべき note は以下を **全て** 満たす:

- [ ] **再利用性**: 他案件 / 他文脈でも有用。案件固有の業務ロジックは対象外。
- [ ] **完成度**: 草案 (`status: draft`) ではなく検証済 (`status: verified`)。
- [ ] **粒度**: 1 ノート 1 概念。長すぎる場合は分割してから昇格。
- [ ] **PII / 機密**: 含まない (含む場合は除去後に昇格)。

判定に迷ったら **昇格しない** が原則。「いつでも昇格できる」状態にしておく方が、誤って中央を汚染するより良い。

## 3. 昇格手順 (利用者操作)

### Step 1. 昇格候補を案件 Knowledge から抽出

```bash
cd <案件リポ>
grep -l 'metadata:.*type: reference\|metadata:.*type: user' Knowledge/notes/*.md
```

または案件作業中に「これは横断で使える」と気づいた時点で印を付ける:

```yaml
---
metadata:
  type: reference
  promotion_candidate: true
---
```

### Step 2. agent に PII 除去 + 一般化を依頼

```
Agent(subagent_type="general-purpose", prompt="
案件 Knowledge/notes/<topic>.md を中央 Vault 用に一般化して。
- 案件固有の固有名詞 (会社名・プロジェクト名・人名) を一般語に置換
- 絶対パス・URL の機密部を除去
- 案件固有の業務ロジックは削除し、汎用パターンのみ残す
- frontmatter の status を verified に
出力: ~/Documents/Knowledge/notes/<topic>.md にコピーする差分案
")
```

### Step 3. 利用者がレビュー → 承認

agent の差分案を確認し、必要なら手動修正。承認したら中央 Vault にコピー:

```bash
cp <案件リポ>/Knowledge/notes/<topic>.md ~/Documents/Knowledge/notes/<topic>.md
# 上記 agent 出力の修正を反映
```

### Step 4. 案件側にマーク

```yaml
---
metadata:
  type: reference
  promoted_at: 2026-06-24
  promoted_to: ~/Documents/Knowledge/notes/<topic>.md
---
```

これにより案件側を後で再編集した時に「中央にも反映するか」を agent が問える。

### Step 5. 中央側に出典マーク

```yaml
---
metadata:
  type: reference
  promoted_from: <案件名>/Knowledge/notes/<topic>.md
  promoted_at: 2026-06-24
---
```

## 4. 命名衝突の解消

中央 Vault に同名 note が既に存在する場合:

- **同一概念**: 中央側を更新（既存を base に案件側の追記分をマージ）。
- **別概念**: 案件側 note 名にプレフィクス追加 (`react-rsc-boundary.md` ではなく `<topic>-<aspect>.md`) してから昇格。

## 5. procedural の 2 段階昇格

procedure は段階を踏む:

1. **案件 `Knowledge/procedures/`** (草案・案件固有)
2. → 中央 `Knowledge/procedures/` (個人横断)
3. → ecc-method `45_runbook/runbooks/` (ECC 規律として承認)

3 への昇格は ecc-method 本体への PR 扱い ([[02_indexing-rules]] in `45_runbook/`)。

## 6. 逆向きは禁止

中央 Vault → 案件 Knowledge への自動コピーは **しない**。中央を案件で参照したい時は relative path link (`[react-server-components](~/Documents/Knowledge/notes/react-server-components.md)`) または Obsidian で中央 Vault を開いて閲覧。

理由: 案件リポを Git で共有すると、中央のスナップショットが案件チーム全員に分散コピーされ整合性が崩れる。

## 7. 関連

- vault setup → [[02_vault-setup]]
- ディレクトリ規約 → [[03_directory-structure]]
- agent memory 階層 → [[10_agent-memory-hierarchy]]
