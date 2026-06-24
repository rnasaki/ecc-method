---
metadata:
  type: episodic
  status: verified
  promotion_candidate: true
  promoted_at: 2026-06-24
  promoted_to: ~/Documents/Knowledge/notes/dead-spec-without-trigger.md
keywords: [distribution, template, knowledge-vault, wiring-gap, capture-trigger]
related: [12_knowledge-vault/07_promotion-flow.md, 45_runbook/runbooks/RB-011-knowledge-promotion-flow.md]
session_id: 8
date: 2026-06-24
---
# 2026-06-24 — 配布テンプレに Knowledge Vault 駆動規律が無く Obsidian にノウハウが溜まらなかった

## 観測

ユーザー報告:「ノウハウが Obsidian に溜まらない / 配布版に実装されているか」。

調査結果:

| 領域 | 状態 |
|---|---|
| Method 本体 `12_knowledge-vault/` | 整備済 |
| Method 本体 RB-011 (中央 Vault 昇格) | 整備済 |
| `~/Documents/Knowledge/{notes,procedures,references}/` | dir 存在、中身 0 ファイル |
| 案件 `Knowledge/notes/` | dir 存在、中身 0 ファイル |
| `.template-claude/CLAUDE.md` の Knowledge / vault / RB-011 言及 | **0 件** |
| `.template-agents/ecc-orchestrator.md` の Knowledge 言及 | **0 件** |

## 根本原因

Method 本体に「**昇格フロー (案件 → 中央 → Runbook)**」は書いてあるが、配布テンプレに「**いつ案件 `Knowledge/notes/` を書き始めるか**」のトリガが無い。具体的に欠落していた駆動点:

- 起動プロトコルで `Knowledge/` を Read しない / 作成しない
- 作業中規律に「気づきを `Knowledge/notes/<slug>.md` に書く」タイミングが無い
- クローズ規律 Step [0]〜[6] に Knowledge capture / promotion candidate 検出が無い
- Capture Trigger の対象が Runbook 化候補だけで、Knowledge note 化候補を評価していない

結果、主 Claude には「ノウハウを書く瞬間」が定義されず、Vault は構築されるが永久に空のまま。

## 採用した修正

配布テンプレ 3 ファイル + 配布ディレクトリ実体に駆動点を 5 箇所挿入:

1. `.template-claude/CLAUDE.md` §2 SSOT 表に Knowledge Vault 行追加
2. §3 検索プロトコル Step 6 を 2 系統 (Runbook / Knowledge) に分岐
3. §5 作業中規律に **Knowledge 即時記録** 追加 (notes / procedures / episodes 書込先)
4. §7 クローズ規律に **Step [0.5] KNOWLEDGE CAPTURE GATE** 挿入 + 中央 Vault 4 条件で RB-011 起動
5. §8 行動規律表に **Knowledge Capture First** 追加 (No Scope Dodging 連動)
6. `.template-agents/ecc-orchestrator.md` 返却フォーマットに `## Knowledge 化候補` セクション追加 (type 分類 / 書込先 / 4 条件暫定判定)
7. `.template-claude/README.md` §テンプレ構成と冒頭索引に Knowledge 規律言及を反映

## 一般化可能な学習 (中央 Vault 昇格候補)

- 「**SSOT に規律があっても、駆動規律 (いつ実行するか) が配布テンプレに無いと永久に発火しない**」という汎用パターン。Method 本体の章整備と配布テンプレの起動プロトコルは別レイヤであり、後者を整えないと前者は dead spec になる。
- 駆動規律を仕込む 3 つの典型ポイント: (1) 起動プロトコル §0 / (2) 作業中規律 §5 / (3) クローズ規律 §7 Step [0.x]。クローズに Capture Gate を仕込まないと「気づきはあるが書かれない」が常態化する。
- Capture Trigger を Runbook 化候補だけにするとセマンティック知見 (notes / references) が漏れる。Trigger は **type 分類** とセットでないと振り分けられない。

## 出典

- ecc-method `12_knowledge-vault/07_promotion-flow.md` (中央 Vault 昇格 4 条件)
- ecc-method `45_runbook/runbooks/RB-011-knowledge-promotion-flow.md` (昇格手順)
- 本セッション編集差分 (commit 予定): `.template-claude/CLAUDE.md` `.template-agents/ecc-orchestrator.md` `.template-claude/README.md`

## 不確実性

- 修正後の駆動が実際にユーザー側で発火するかは次セッション以降の観測待ち (このリポは Method 本体の self-dogfooding 用なので、配布先環境とは別)。
- 中央 Vault 昇格 4 条件の判定主観性は RB-011 §不確実性で既知。本変更でも未解決。
