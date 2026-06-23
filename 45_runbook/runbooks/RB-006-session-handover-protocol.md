---
id: RB-006-session-handover-protocol
title: セッション状態プロトコル - .session-state/ の SSOT 管理 (初回=生成 / 継続=Read の二モード)
category: bootstrap
tags: [session-state, persistence, continuity, agent-autonomy, no-user-cognitive-load, two-mode]
created: 2026-06-24
updated: 2026-06-24
last-verified: 2026-06-24
status: active
trigger: セッションを跨いで状態を保持する必要があるとき / 前セッションの残課題を覚えていない / ユーザーに「覚えておいてください」と要求したくなった / `.session-state/` の役割と更新規律を確認したい
expert-routing: [orchestrator]
related: [RB-007-1-session-1-task-and-session-state, RB-009-first-run-sdd-bootstrap, RB-003-autonomous-decision-framework, ../01_overview/05_user-as-hands.md]
source: 本パッケージ実機運用 (2026-06-24, ユーザー指摘「私が正しい対処をしなければ宿題は永遠に失われる」/ HW-G 概念再定義「.session-state/ は SDD/TDD プロセスの中間成果物」)
---

# セッション状態プロトコル

## TL;DR (30 秒で読める結論)

`.session-state/` は **SDD/TDD プロセスの中間成果物** (引き継ぎ資料ではない)。
状態管理を **agent が完全自動化** する規律で、ユーザーに「次回プロンプトをコピペ」「宿題を覚えておく」を要求しない (RB-003 / 01_overview/05_user-as-hands.md 整合)。
本 Runbook は **二モード** を扱う:

- **初回モード** (`.session-state/` 不存在 → 生成): 詳細は **RB-009** に委譲。
- **継続モード** (`.session-state/` 存在 → Read/Write): 開始時に Read、終了時に Write。本 Runbook の主対象。

GOAL / current_session の規律は **RB-007** に分離。本 Runbook は PENDING / COMPLETED / HISTORY の SSOT 管理に集中する。

## 適用対象

- ecc-orchestrator agent (および本 Method を採用する任意の Orchestrator)
- 複数セッションをまたぐ作業全般

## 二モード判定

セッション開始時、agent は以下で初回 / 継続を判定する:

| 判定 | 動作 | 根拠 Runbook |
|---|---|---|
| `<cwd>/.session-state/` ディレクトリ不存在 | 初回モード = SDD ヒアリングで生成 | **RB-009** |
| `<cwd>/.session-state/` 存在 | 継続モード = 本 Runbook の Read/Write | RB-006 (本 Runbook) + RB-007 |

初回モードのフロー詳細 (ヒアリング 5 質問 / 自動生成 / 5 行サマリ提示) は RB-009 を参照。本 Runbook では再掲しない (ゼロ重複原則)。

## ファイル構造 (継続モード)

```
<cwd>/.session-state/
├── GOAL.md             # 北極星 (RB-007 が主管)
├── PENDING.md          # 未完了宿題の SSOT (本 Runbook が主管、開始時 Read / 終了時 Write)
├── COMPLETED.md        # 完了済宿題のアーカイブ (永続記録、本 Runbook が主管)
├── HISTORY.md          # 各セッションの状態ログ (本 Runbook が主管)
└── current_session.md  # 現セッションのフォーカス (RB-007 が主管)
```

## PENDING.md フォーマット

```yaml
---
last_updated: YYYY-MM-DD HH:MM
session_count: <累計セッション数>
schema: RB-006
branch: <branch 名>
---

## 宿題: <ID> - <タイトル>

- **状態**: not_started | in_progress | blocked | review_pending | done
- **優先度**: P0 (即着手) | P1 (次回) | P2 (余力)
- **着手条件**: <前提条件、なければ "なし">
- **完了基準**: <数値・観測可能な条件>
- **関連**: <Runbook ID / ファイルパス>
- **担当 expert role**: <Expert Registry のカテゴリ>
- **メモ**: <自由記述、次セッション agent への補足>

## 宿題: ...
```

## 開始時プロトコル (継続モード)

Orchestrator agent は起動直後 (= ユーザーから最初の依頼を受ける前) に以下を **無条件実行** する:

```
[0] <cwd>/.session-state/ ディレクトリの存在確認
    - 不存在 → 初回モード (RB-009 へ分岐、以下スキップ)
    - 存在 → 継続モード (以下続行)

[1] <cwd>/.session-state/GOAL.md を Read (北極星確認、RB-007)
[2] <cwd>/.session-state/PENDING.md を Read (本 Runbook 主管)
[3] <cwd>/.session-state/current_session.md を Read (RB-007 主管)
    - status: pending_start → 雛形通り着手
    - status: in_progress → §再開ポイントから続行
    - status: completed → PENDING の P0 で current_session 新規作成
[4] ~/.claude/methods/ecc-method/45_runbook/INDEX.md を Read (Runbook 索引)
[5] ユーザーへの最初の応答 (5 行以内、RB-007 と統一形式) に以下を含める:
    - 北極星: <GOAL §北極星 1 文>
    - 今回のタスク: <current_session §ターゲットタスク>
    - スコープ外: <代表 1 件>
    - 想定所要: <30 分〜2 時間 等>
    - 「変更要望なければ着手します」(明示中断のみ受け付け、ASK ではない)
[6] ユーザー指示が新規タスクなら: PENDING に追加 + 既存宿題と優先順位を再評価
[7] ユーザー指示が「再開」「続き」など継続意図なら: P0 から自動着手
```

ユーザーは「前回何やった?」を覚えていなくてよい。agent が `.session-state/` を読んで自動継続する。

## 終了時プロトコル (主要タスク完了時)

Orchestrator agent は主要タスクが完了したと判断した時点で以下を **無条件実行** する (ユーザーから「終了」の指示なしに):

```
[0] 取りこぼしチェック (CLOSURE GATE) ← クローズ宣言の前に必ず通す
    [0.1] git status で untracked / unstaged を列挙
    [0.2] 各エントリを「本タスクと関連するか」で 1 件ずつ判定:
          - 関連あり → 即修正 (.gitignore 追加 / commit / 削除等)。「次セッションで」と先送りしない
          - 関連なし → 1 行で「観測したが本タスクと独立、別 HW で扱う」と明記してから残置
    [0.3] リンク死活: 直前で動かしたファイル/ディレクトリへの参照が全て新パスへ更新されているか grep で再確認
    [0.4] 完了宣言テキスト中に「スコープ外」「次回」「後で」を書きそうになったら一旦停止し、
          [0.2] の判定をやり直す (取りこぼしの常習表現)
[1] 完了した宿題を PENDING.md から削除し COMPLETED.md に移送
    - completed_at, session_id, 成果物 commit hash を付与
[2] 新たに発生した宿題 (検証中・要 follow-up・棄却理由要記録) を PENDING に追加
[3] HISTORY.md に当該セッションの記録を追記
    - session_start, session_end, 着手宿題 ID, 完了宿題 ID, 新規追加宿題 ID
[4] current_session.md を次セッション用に書き換え (詳細は RB-007 終了時プロトコル)
[5] <cwd>/.session-state/ を git commit + push
[6] ユーザーへの最終応答に以下の 4 要素を **末尾固定** で含める:
    "完了: <COMPLETED に移した宿題>"
    "次回継続: <PENDING の P0 宿題>"
    "次回起動時、ユーザーは何もしなくて自動で再開します"
    "# ⚠️ このセッションはクローズ"  ← 視覚マーキング (見出し記号で分離、必須)
```

### Step [0] CLOSURE GATE の根拠

ユーザー指摘 (2026-06-24, ecc-method Session 3): クローズ宣言時に `.claude/` が untracked のまま残置 →
「原則に反しているよな。取りこぼすな。基本動作怠っているように見受けられる。改善が必要と判断 となるのが理想では?」

agent が「本セッションのスコープ外」と宣言して逃げるのは north-star (正確性 > 流暢さ)、
[60_quality-gates/03_anti-sycophancy.md](../../60_quality-gates/03_anti-sycophancy.md) (受動運転防止)、
RB-003 (L0 自律判断) のすべてに反する。**観測した違和感は agent 自身が「改善必要」とフラグを立てて自走で潰す**。

中断時 (タスク未完了で session を閉じる場合) のプロトコルは RB-007 §中断時プロトコルを参照。

## ユーザーが取るべき行動 (= ほぼゼロ)

### 通常時 (継続モード)

1. 新セッションを起動 (Claude Code セッション開始)
2. **何もしない、または単に「再開」と入力**
3. agent が `.session-state/` を Read して自動継続

### 初回利用時 (初回モード)

1. 配布版 (`main`) を clone した直後、案件リポで agent を起動
2. agent が SDD ヒアリング 5 質問を実施 (RB-009)
3. 回答内容から `.session-state/` 5 ファイルが自動生成される

### 不可逆操作時 (ASK 該当)

agent が「ASK 該当 (不可逆共有資源)」と判断した時のみ確認を求める。それ以外は確認なし。

### 新規タスク追加時

「<新タスク>」と平文で投げる。agent が PENDING に追加 + 優先順位を自律判断。

## Orchestrator system prompt への組み込み

`~/.claude/agents/ecc-orchestrator.md` に以下のセクションを追加 (本 Runbook 採用と同時に):

```
== 起動時必須 (RB-006 + RB-007 + RB-009) ==
セッション開始直後、ユーザー応答前に以下を無条件実行:
1. <cwd>/.session-state/ の存在確認
   - 不存在 → RB-009 (初回 SDD ヒアリングフロー) へ分岐
   - 存在   → 以下 (継続モード) へ
2. GOAL.md / PENDING.md / current_session.md を Read (順序固定)
3. ~/.claude/methods/ecc-method/45_runbook/INDEX.md を Read
4. 5 行サマリでユーザーに提示 (RB-007 §起動時プロトコル §[5] と同一)
5. 中断指示なければ P0 宿題から自動着手

== 終了時必須 (RB-006) ==
主要タスク完了時、ユーザー指示なしで以下を実行:
0. 取りこぼしチェック (CLOSURE GATE): git status の untracked / unstaged を 1 件ずつ判定し、
   本タスク関連は即修正、独立は 1 行で明記して残置。「スコープ外」「次回」で逃げない
1. PENDING.md を更新 (完了 → COMPLETED に移送、新規宿題を追加)
2. HISTORY.md に当該セッション記録を追記
3. current_session.md を次セッション用に書き換え (RB-007)
4. <cwd>/.session-state/ を git commit + push
5. ユーザーへの最終応答に「完了 / 次回継続 / 自動再開 / クローズマーキング」の 4 要素を末尾固定で含める
```

## 検証 (成功条件)

### 継続モード

- [ ] 新セッションで Orchestrator が起動した直後、`.session-state/` 配下が Read される
- [ ] ユーザーが「再開」とだけ入力して P0 宿題が自動着手される
- [ ] 主要タスク完了時、ユーザー指示なしに PENDING / COMPLETED / HISTORY が更新される
- [ ] git commit + push が自動実行される
- [ ] ユーザーへの最終応答末尾に 4 要素 (完了 / 次回継続 / 自動再開 / クローズマーキング) が固定で含まれる
- [ ] ユーザーへの ASK 数が 1 セッションで 3 回以下 (不可逆操作除く)
- [ ] CLOSURE GATE 通過: クローズ宣言時に git status が clean、または残置物がすべて 1 行根拠付きで明記されている

### 初回モード

- 検証条件は **RB-009** §検証 を参照 (本 Runbook では再掲しない)

## 失敗時のリカバリ

| 症状 | 原因 | 対処 |
|---|---|---|
| `.session-state/` が Read されない | agent prompt に起動時 hook 未設定 | system prompt の「起動時必須」を再確認 |
| 完了宿題が COMPLETED に移されない | 終了時 hook 未発火 | system prompt の「終了時必須」を再確認、または明示的に "終了" と指示 |
| PENDING の優先順位が頻繁に変わる | 着手条件が曖昧 | 各宿題の着手条件 / 完了基準を数値化して PENDING に再記述 |
| 宿題が永遠に in_progress のまま | blocked 化していない | review_pending → blocked → 棄却 or 再着手 のステータス遷移を明示 |
| `.session-state/` ディレクトリが空 | 雛形コピーは済んだが生成プロセス中断 | RB-009 の初回ヒアリングフローを再実行 (リカバリ起点として適用可) |
| 初回モードで停止する (旧 RB-006 の挙動) | 旧版 system prompt 残存 | `.template-agents/ecc-orchestrator.md` を最新化 (`mkdir -p .session-state` + RB-009 委譲) |

## 関連

- **RB-007** (1 セッション 1 タスク + GOAL / current_session の主管、本 Runbook と対)
- **RB-009** (初回モード = SDD ヒアリングフロー、本 Runbook の §二モード判定で分岐)
- ../01_overview/05_user-as-hands.md (本 Runbook と対、ユーザーロール定義)
- RB-003-autonomous-decision-framework.md (判断委譲禁止、本 Runbook と整合)
- RB-001-agent-registry-hot-reload.md (agent 設定変更後の反映タイミング)
- METHOD.md §3 (8 原則、特に第 3 ゼロ重複・第 4 承認最小化)
- 出典:
  - ユーザー指摘「私が正しい対処をしなければ宿題は永遠に失われる」(2026-06-24 対話)
  - ユーザー指摘「初回は SDD/TDD で中間アウトプットとして引継ぎ資料ができる」(2026-06-24, HW-G 概念再定義の起点)

## 変更履歴

| 日付 | 変更 | 理由 |
|---|---|---|
| 2026-06-24 | 初版 | セッション引き継ぎを agent 自動化、ユーザー認知負荷ゼロ化 |
| 2026-06-24 | HW-G 概念再定義に伴い「セッション状態プロトコル」へ書き直し | `.session-state/` は SDD/TDD プロセスの中間成果物であり初回は生成、継続は Read の二モード。初回モードを RB-009 に分離。GOAL / current_session の主管を RB-007 に分離 (ゼロ重複) |
| 2026-06-24 | §終了時プロトコル に Step [0] CLOSURE GATE を追加 | Session 3 で agent が `.claude/` の `.gitignore` 漏れを観測しながら「スコープ外」宣言でクローズ。ユーザー指摘「取りこぼすな。基本動作怠っているように見受けられる。改善が必要と判断 となるのが理想では?」を受け、untracked / 関連残渣の自走点検を Closure 必須ステップとして規律化 |
