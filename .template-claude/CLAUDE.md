---
keywords: [.template-claude, claude]
related: []
---
# ユーザー共通指示 (ECC Method 準拠 / 配布テンプレ)

このファイルは ECC Method を SSOT とする `~/.claude/CLAUDE.md` のテンプレ。`.template-agents/ecc-orchestrator.md` (subagent 定義) と対になる「主 Claude 向けユーザーグローバル設定」のテンプレートで、Method を採用する場合に併せて採用する。

採用時は `<ECC_METHOD_ROOT>` を Method パッケージの実パスに置換してから `~/.claude/CLAUDE.md` に配置する。配置例:

- `~/.claude/methods/ecc-method/` (orchestrator テンプレと同じ前提)
- `<repo>/ecc-method/` (vendoring サブディレクトリ)
- 任意の絶対パス (派生先で固定する場合)

採用は任意。Method を採用しない場合は本テンプレを使わなくてよい。Method を採用するなら、本テンプレも採用することで agent 規律が `~/.claude/CLAUDE.md` 経由でも有効になる (orchestrator subagent が呼び出される前の素セッションで効く)。

**設計原則 (重要)**: Claude Code の subagent はユーザー入力を直接受け取れない。最初の発話を受け取るのは **主 Claude (メインループ)** であり、subagent は主 Claude が `Agent` ツールで呼び出したときのみ起動する。したがって「セッション開始 / 継続 / 終了」のプロトコルは **本ファイル (主 Claude 向け規律)** に置く。`.template-agents/ecc-orchestrator.md` 側には「主 Claude から呼ばれた後に何をするか」のみを書く (二重定義禁止 / コンテキスト経済 Rule 4)。

---

# ユーザー共通指示 (ECC Method 準拠)

このファイルは ECC Method (`<ECC_METHOD_ROOT>/`) を SSOT とする運用指示。重複定義は置かず、Method の該当章を参照する (ゼロ重複原則 / コンテキスト経済 Rule 4)。

## 0. 起動プロトコル (最初のユーザー入力を受けたとき、主 Claude が無条件実行)

**前提**: Claude Code はターン駆動。VSCode でフォルダを開いただけでは何も発火しない。**ユーザーが任意の最初の発話** (`開始` / `.` / 具体タスク など内容問わず) を送った時点で本プロトコルが起動する。判定・実行はすべて主 Claude が行う (subagent ではない)。

最初のユーザー入力を受けた 1 ターン目に、追加確認なしで以下を順に実行:

1. `<cwd>/.session-state/` ディレクトリの存在を確認 (Bash `ls .session-state/` または Read 試行)。
2. **不存在 (新規案件初回 = 初回モード)**:
   - 雛形をコピー: `mkdir -p .session-state && cp <ECC_METHOD_ROOT>/45_runbook/_session-state-template/*.md .session-state/`
   - SDD ヒアリングを **主 Claude が直接実行** する (5 質問以下、1 度に 1 質問):
     北極星 → ターゲット → 成功条件 → スコープ外 → 既存資産
   - ユーザーが 1 ターン目で具体タスク文を投げてきた場合は、発話から GOAL を抽出 → 不足項目のみ最小 1 問で確認 → 着手する。
   - 回答から `GOAL.md` / `PENDING.md` / `current_session.md` を生成。
   - 5 行サマリで提示し、中断指示なければ P0 タスクへ着手。
   - 詳細は `<ECC_METHOD_ROOT>/45_runbook/runbooks/RB-009-first-run-sdd-bootstrap.md`。
3. **存在 (継続モード)**:
   - `<cwd>/.session-state/GOAL.md` を Read (北極星確認)。
   - `<cwd>/.session-state/PENDING.md` を Read (P0 確認)。
   - `<cwd>/.session-state/current_session.md` を Read。
     - status: `pending_start` → 雛形通り着手。
     - status: `in_progress` → §再開ポイントから続行。
     - status: `completed` → PENDING の P0 で current_session を新規作成。
   - `<ECC_METHOD_ROOT>/45_runbook/INDEX.md` を Read (Runbook 索引)。
   - 最初の応答 (5 行以内) に以下を含める:
     - 北極星: <GOAL §北極星 1 文>
     - 今回のタスク: <current_session §ターゲットタスク>
     - スコープ外: <代表 1 件>
     - 想定所要: <30 分〜2 時間 等>
   - 同一ターン内で続けて P0 タスクに着手 (ASK ではない、明示中断のみ受け付け)。
4. SDD ヒアリングや複数専門家への並列委任など、**多段の判断プランニング**が必要なときに限り、`Agent` ツールで `ecc-orchestrator` subagent を呼び出して **委任プラン** を返してもらう (subagent はユーザー入力を直接受けられないため、ヒアリングそのものは主 Claude が回す)。

注意: `.session-state/` は **案件固有データ** のため案件リポ配下に置く。Method パッケージ (`<ECC_METHOD_ROOT>/`) には汎用雛形 (`_session-state-template/`) のみ存在する。案件をまたいで GOAL を取り違えるバグを防ぐ。

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
| Knowledge Vault (案件 `Knowledge/` ↔ 中央 `~/Documents/Knowledge/` ↔ Runbook 昇格) | `<ECC_METHOD_ROOT>/12_knowledge-vault/`, `<ECC_METHOD_ROOT>/45_runbook/runbooks/RB-011-knowledge-promotion-flow.md` |

Method パッケージにアクセスできない / 別案件で適用しない場合のみ、`~/.claude/rules/` 配下の縮約スタブを暫定 SSOT として参照する。スタブと Method が衝突した場合は Method を優先する。

## 3. 検索プロトコル (Method `45_runbook/04_search-protocol.md` 抜粋)

タスクを受けたら次の順で解決する。途中でヒットしたらそこで停止。Step 0〜2 合計 30 秒程度のタイムボックス。

```
0. CodeGraph を引く      → <ECC_METHOD_ROOT>/_index/concept-graph.json
                           (file_index / nodes / edges を keyword 走査 → 候補 md の先頭のみ Read、
                            related で 1-hop 拡張)
1. Runbook 索引を引く    → <ECC_METHOD_ROOT>/45_runbook/INDEX.md + _index/by-*.md
                           (ヒット = ユーザー確認なしで実行)
2. 本文 grep (fallback) → <ECC_METHOD_ROOT>/45_runbook/runbooks/ (Step 0/1 で当たらない場合のみ)
3. Expert Registry を引く → <ECC_METHOD_ROOT>/40_delegation/01_expert-registry.md
4. Pattern (P-001..006)   → 並列性 / 対抗性が要るかを判定
5. 委任契約 (Delegation Contract) を交わして dispatch
6. 完了時に Capture Trigger を評価 → 該当すれば以下に振り分ける:
   - 横断手続きの再利用候補 → Runbook 化 (`45_runbook/`) + CodeGraph 再生成
     (`<ECC_METHOD_ROOT>/80_commands/generate-concept-graph.mjs`)
   - 横断知見 / 用語 / 関係 → Knowledge note 化 (`Knowledge/notes/`、後段で中央 Vault 昇格 = RB-011)
```

CodeGraph (`_index/concept-graph.json`) は全文 grep より遥かに低コストで `related` / `edges` による関連トピック自動拡張が効くため Step 0 を最優先する。古い場合はドキュメント追加・改名後に再生成する (詳細は `<ECC_METHOD_ROOT>/45_runbook/04_search-protocol.md` §Step 0)。

委任ファースト原則: 「自分 (主 Claude) で全部やる」は最終手段。判定詳細は `<ECC_METHOD_ROOT>/05_principles/05_delegation-first.md`。

## 4. 並列起動と subagent 利用方針

- 独立タスクは同一メッセージ内で複数 `Agent` ツール呼び出しを並べる。順次起動禁止。条件は `<ECC_METHOD_ROOT>/05_principles/05_delegation-first.md` §6。
- `ecc-orchestrator` subagent は **ユーザー入力を直接受けられない**。多段委任プランニング・Discovery 並列化計画・Runbook 化候補の評価など「主 Claude が直接やるとコンテキストを食いつぶすメタ作業」を投げる先として使う。
- Subagent は単発実行・isolated context・main へは text の summary のみ返却。多ターン対話 / TodoWrite 同期 / `.session-state/` の Write は **主 Claude の責務** (subagent からは原則 Write しない)。

## 5. 作業中規律 (RB-007)

- TodoWrite と `current_session.md` §TODO を同期する (主 Claude が実施)。
- 主要 step ごとに `current_session.md` §進捗ログ に追記する。
- スコープ外で発見した問題は `current_session.md` §不確実性 に記録、即着手しない。
- 各ターン頭で「今のタスクは GOAL §<番号> サブゴールに対応するか」をセルフ確認する。
- **Knowledge 即時記録**: 作業中に **非自明な知見 / 横断で再利用しうる事実・用語・関係 / 試行錯誤の結論** を得たら、忘却前にその場で `<cwd>/Knowledge/notes/<topic-kebab>.md` (frontmatter `status: draft`、再利用候補なら `promotion_candidate: true`) に書く。手順系は `Knowledge/procedures/<verb-target>.md`、案件 run の決定・観察・失敗ログは `Knowledge/episodes/YYYY-MM-DD-<slug>.md`。ディレクトリ役割は `<ECC_METHOD_ROOT>/12_knowledge-vault/03_directory-structure.md`、判定基準は `<ECC_METHOD_ROOT>/12_knowledge-vault/06_knowledge-types.md`。中央 Vault (`~/Documents/Knowledge/`) への昇格は RB-011 (クローズ時または明示指示時)。

## 6. 中断時規律 (RB-007)

context 限界 / 30 分以上 stuck / ユーザー中断時:

1. `current_session.md` §進捗ログ + §再開ポイント を更新。
2. status を `in_progress` に保つ。
3. `<cwd>/.session-state/` を git commit + push。

## 7. クローズ規律 (4 要素 / RB-006 §[6])

セッション終了時、ユーザー指示なしに以下を主 Claude が無条件実行する:

- **Step [0] CLOSURE GATE**: `git status` の untracked / unstaged を 1 件ずつ判定。本タスク関連は即修正 (`.gitignore` 追加 / commit / 削除)、独立は 1 行で根拠明記して残置。「スコープ外」「次回」「後で」を完了宣言に書きそうになったら停止して再判定。
- **Step [0.5] KNOWLEDGE CAPTURE GATE**: 当セッションで得た非自明な知見・横断で再利用しうる事実 / 用語 / 関係 / 試行錯誤の結論を `<cwd>/Knowledge/notes/<topic-kebab>.md` に記録する (frontmatter `status: draft` または `verified`、再利用候補なら `promotion_candidate: true`)。手順は `Knowledge/procedures/`、run の決定・観察・失敗ログは `Knowledge/episodes/YYYY-MM-DD-<slug>.md` を更新。判定基準は `<ECC_METHOD_ROOT>/12_knowledge-vault/06_knowledge-types.md`、ディレクトリ規約は `<ECC_METHOD_ROOT>/12_knowledge-vault/03_directory-structure.md`。中央 Vault (`~/Documents/Knowledge/`) への昇格 4 条件 (再利用性 / 完成度 / 粒度 / PII 機密) を即時満たす note は RB-011 を起動し、満たさない場合は案件側に残置 (中央汚染より残置を優先)。「特に得た知見はない」は **No Scope Dodging** の禁忌、最低 1 行は episode に書く。
- **Step [1]** `current_session.md` §完了条件 のチェックボックス全件確認。
- **Step [2]** 完了したらタスクを `PENDING.md` → `COMPLETED.md` に移送 (commit hash 付与)。
- **Step [3]** `HISTORY.md` に当該セッション記録を追記。
- **Step [4]** `current_session.md` を次セッション用に書き換え (status: `pending_start`、次の P0 を ターゲットタスク に)。
- **Step [5]** `<cwd>/.session-state/` を git commit + push。
- **Step [6]** 最終応答に **末尾固定で 4 要素を書式どおり** 含める。逃げ・省略・言い換え不可。

```
完了: <COMPLETED に移した宿題>
次回継続: <PENDING の P0 宿題>
次回起動時、何でもよいので 1 メッセージ送ってください (例: `再開`)。.session-state/ を Read して自動継続します

# ⚠️ このセッションはクローズ
```

- §1, §2 は **具体内容を埋める** (項目名だけにしない)。
- §3 は **定型文をそのまま貼る** (「可」「否」で答えない)。
- §4 は `#` 見出しで分離する (視覚マーキング必須)。
- SSOT は `<ECC_METHOD_ROOT>/45_runbook/runbooks/RB-006-session-handover-protocol.md` §[6]。

## 8. 行動規律 (Method SSOT)

規律本文は Method を SSOT とし、ここでは索引のみ持つ。

| 規律 | 内容 (要約) | Method 出典 |
|---|---|---|
| No Scope Dodging | 違和感 / untracked を観測したら「スコープ外」で逃げず agent 主導で潰す | `05_principles/05_delegation-first.md` §8, `45_runbook/runbooks/RB-006-session-handover-protocol.md` §Step [0] |
| No Over Delegation | 原則から導出可能な判断は agent 主導。`AskUserQuestion` で逃げない | `05_principles/05_delegation-first.md` §7, `50_permissions/05_escalation-policy.md` §9, `45_runbook/runbooks/RB-003-autonomous-decision-framework.md` |
| No Push Handoff | `git push` 等の実行判断をユーザーへ委譲しない。事前承認スコープ内なら自走で実行する | `50_permissions/05_escalation-policy.md` §9, `25_writing-style/06_user-care/03_blocker-removal.md` §4 |
| No Internal Status Leak | 内部権限ステータス (ASK / ALLOW / 保留 / permission denial) をユーザーに露出しない。ASK で弾かれても「保留」通知を出さず agent 側で代替 / 再試行する | `50_permissions/01_consent-economy.md` §5 反パターン |
| No Turn-Model Hallucination | Claude Code はターン駆動。「フォルダを開いた瞬間に質問が出る」と説明しない。最初のユーザー入力で 1 ターン目が走る前提で書く | `01_overview/`, `45_runbook/runbooks/RB-009-first-run-sdd-bootstrap.md` |
| Knowledge Capture First | セッション中の非自明な知見は忘却前に `Knowledge/notes\|procedures\|episodes/` へ即時記録。クローズ §Step [0.5] で「特に得た知見はない」で逃げない。中央汚染より案件側残置を優先 | `12_knowledge-vault/03_directory-structure.md`, `12_knowledge-vault/06_knowledge-types.md`, `12_knowledge-vault/07_promotion-flow.md`, `45_runbook/runbooks/RB-011-knowledge-promotion-flow.md` |

ユーザーへ出す文章は **人間可読な進捗・結果メッセージのみ** に限定する。ハーネスの内部都合 (権限状態 / 内部 ID / 内部キュー) は露出しない。

## 9. 出典・不確実性

主張には L1 出典 (公式 docs / 公開リポ / 仕様書) を付帯し `retrieved_at` を明記する。L1 が無い場合は「未検証」と明示するか主張を弱める。詳細は `<ECC_METHOD_ROOT>/25_writing-style/03_citation-style.md` / `<ECC_METHOD_ROOT>/25_writing-style/04_uncertainty-language.md`。

## 10. ユーザー判断に上げる範囲

ユーザー判断に上げるのは **方針分岐 / 不可逆 / 北極星に直結する** 判断のみ。作業遂行レベル (push するか / フォーマット選択 / リトライ可否) は agent 側で決める。詳細は `<ECC_METHOD_ROOT>/50_permissions/01_consent-economy.md` §3。
