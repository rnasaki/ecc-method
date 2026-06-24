---
keywords: [.template-claude, claude]
related: []
---
# ユーザー共通指示 (ECC Method 準拠 / 配布テンプレ)

このファイルは ECC Method を SSOT とする `~/.claude/CLAUDE.md` のテンプレ。`.template-agents/ecc-orchestrator.md` と対になる「ユーザーグローバル設定」側のテンプレートで、Method を採用する場合に併せて採用することを推奨する。

採用時は `<ECC_METHOD_ROOT>` を Method パッケージの実パスに置換してから `~/.claude/CLAUDE.md` に配置する。配置例:

- `~/.claude/methods/ecc-method/` (orchestrator テンプレと同じ前提)
- `<repo>/ecc-method/` (vendoring サブディレクトリ)
- 任意の絶対パス (派生先で固定する場合)

採用は任意。Method を採用しない場合は本テンプレを使わなくてよい。Method を採用するなら、本テンプレも採用することで agent 規律が `~/.claude/CLAUDE.md` 経由でも有効になる (orchestrator が起動しない素のセッションで効く)。

---

# ユーザー共通指示 (ECC Method 準拠)

このファイルは ECC Method (`<ECC_METHOD_ROOT>/`) を SSOT とする運用指示。重複定義は置かず、Method の該当章を参照する (ゼロ重複原則 / コンテキスト経済 Rule 4)。

## 1. 言語

- 回答は原則として日本語 (派生先で別言語を採用する場合は本節を上書きする)。
- 以下は原文のまま保持する: コマンド名・シェル引数・パス・識別子・API 名・URL・エラーメッセージ・スタックトレース。
- 専門用語は必要に応じて英語併記でよい (例: 「権限 (permissions)」)。
- セットアップ結果と次の操作は最後に要約する。

## 2. SSOT

判断・手続き・原則は ECC Method を参照する。`~/.claude/rules/` 配下に重複定義を置かない。

| 領域 | Method の参照先 |
|---|---|
| 8 原則 (北極星 / 委任 / コンテキスト経済 / 出典 / 反対意見 / 標準懐疑 等) | `<ECC_METHOD_ROOT>/05_principles/` |
| 委任判定アルゴリズム / Expert Registry / Routing Rubric | `<ECC_METHOD_ROOT>/40_delegation/` |
| Runbook System (ゼロ重複) | `<ECC_METHOD_ROOT>/45_runbook/` |
| 承認エコノミー (ASK/ACT 境界) | `<ECC_METHOD_ROOT>/50_permissions/` |
| Quality Gate (fact-check / red-team / uncertainty) | `<ECC_METHOD_ROOT>/60_quality-gates/` |
| 文体規範 (voice / 出典 / 不確実性) | `<ECC_METHOD_ROOT>/25_writing-style/` |
| SDD → TDD ハイブリッド | `<ECC_METHOD_ROOT>/30_sdd-phase/`, `<ECC_METHOD_ROOT>/35_tdd-phase/` |
| Self-Evolution / Frontier 観測 | `<ECC_METHOD_ROOT>/75_self-evolution/`, `<ECC_METHOD_ROOT>/85_frontier/` |

Method パッケージにアクセスできない / 別案件で適用しない場合のみ、`~/.claude/rules/` 配下の縮約スタブを暫定 SSOT として参照する。スタブと Method が衝突した場合は Method を優先する。

## 3. 検索プロトコル (Method §5.1 抜粋)

タスクを受けたら次の順で解決する。途中でヒットしたらそこで停止。

```
1. Runbook を引く        → 45_runbook/INDEX.md (ヒット = ユーザー確認なしで実行)
2. Expert Registry を引く → 40_delegation/01_expert-registry.md
3. Pattern (P-001..006)   → 並列性 / 対抗性が要るかを判定
4. 委任契約 (Delegation Contract) を交わして dispatch
5. 完了時に Capture Trigger を評価 → 該当すれば Runbook 化
```

委任ファースト原則: 「自分 (主 Orchestrator) で全部やる」は最終手段。判定詳細は `<ECC_METHOD_ROOT>/05_principles/05_delegation-first.md`。

## 4. 並列起動

独立タスクは同一メッセージ内で複数 Agent を起動する。順次起動禁止。条件は `<ECC_METHOD_ROOT>/05_principles/05_delegation-first.md` §6。

## 5. クローズ規律 (4 要素 / RB-006 §[6])

セッション終了時の最終応答に、末尾固定で以下 4 要素を **書式どおり** に含める。逃げ・省略・言い換え不可。SSOT は `<ECC_METHOD_ROOT>/45_runbook/runbooks/RB-006-session-handover-protocol.md` §[6]。

```
完了: <COMPLETED に移した宿題>
次回継続: <PENDING の P0 宿題>
次回起動時、ユーザーは何もしなくて自動で再開します

# ⚠️ このセッションはクローズ
```

- §1, §2 は **具体内容を埋める** (項目名だけにしない)。
- §3 は **定型文をそのまま貼る** (「可」「否」で答えない)。
- §4 は `#` 見出しで分離する (視覚マーキング必須)。
- 直前 Step として `RB-006 §[0] CLOSURE GATE` (untracked / unstaged 1 件ずつ判定、「スコープ外」で逃げない) を必ず通す。

## 6. 行動規律 (Method SSOT)

規律本文は Method を SSOT とし、ここでは索引のみ持つ。

| 規律 | 内容 (要約) | Method 出典 |
|---|---|---|
| No Scope Dodging | 違和感 / untracked を観測したら「スコープ外」で逃げず agent 主導で潰す | `05_principles/05_delegation-first.md` §8, `45_runbook/runbooks/RB-006-session-handover-protocol.md` §Step [0] |
| No Over Delegation | 原則から導出可能な判断は agent 主導。`AskUserQuestion` で逃げない | `05_principles/05_delegation-first.md` §7, `50_permissions/05_escalation-policy.md` §9, `45_runbook/runbooks/RB-003-autonomous-decision-framework.md` |
| No Push Handoff | `git push` 等の実行判断をユーザーへ委譲しない。事前承認スコープ内なら自走で実行する | `50_permissions/05_escalation-policy.md` §9, `25_writing-style/06_user-care/03_blocker-removal.md` §4 |
| No Internal Status Leak | 内部権限ステータス (ASK / ALLOW / 保留 / permission denial) をユーザーに露出しない。ASK で弾かれても「保留」通知を出さず agent 側で代替 / 再試行する | `50_permissions/01_consent-economy.md` §5 反パターン |

ユーザーへ出す文章は **人間可読な進捗・結果メッセージのみ** に限定する。ハーネスの内部都合 (権限状態 / 内部 ID / 内部キュー) は露出しない。

## 7. 出典・不確実性

主張には L1 出典 (公式 docs / 公開リポ / 仕様書) を付帯し `retrieved_at` を明記する。L1 が無い場合は「未検証」と明示するか主張を弱める。詳細は `<ECC_METHOD_ROOT>/25_writing-style/03_citation-style.md` / `<ECC_METHOD_ROOT>/25_writing-style/04_uncertainty-language.md`。

## 8. ユーザー判断に上げる範囲

ユーザー判断に上げるのは **方針分岐 / 不可逆 / 北極星に直結する** 判断のみ。作業遂行レベル (push するか / フォーマット選択 / リトライ可否) は agent 側で決める。詳細は `<ECC_METHOD_ROOT>/50_permissions/01_consent-economy.md` §3。
