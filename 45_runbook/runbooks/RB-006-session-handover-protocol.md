---
id: RB-006-session-handover-protocol
title: セッション引き継ぎプロトコル - 開始時 PENDING 自動読込 / 終了時 PENDING 自動更新
category: bootstrap
tags: [session-handover, persistence, continuity, agent-autonomy, no-user-cognitive-load]
created: 2026-06-24
updated: 2026-06-24
last-verified: 2026-06-24
status: active
trigger: セッションを跨いで未完了タスクを引き継ぐ必要があるとき / 前セッションの残課題を覚えていない / ユーザーに「覚えておいてください」と要求したくなったとき
expert-routing: [orchestrator]
related: [RB-001-agent-registry-hot-reload, RB-003-autonomous-decision-framework, ../01_overview/05_user-as-hands.md]
source: 本パッケージ実機運用 (2026-06-24, ユーザー指摘「私が正しい対処をしなければ宿題は永遠に失われる、再現可能か」)
---

# セッション引き継ぎプロトコル

## TL;DR (30 秒で読める結論)

セッション間引き継ぎを **agent が完全自動化** する規律。ユーザーに「次回プロンプトをコピペ」「宿題を覚えておく」を要求しない (RB-003 / 01_overview/05_user-as-hands.md 整合)。仕組み: `<cwd>/.session-state/PENDING.md` を SSOT として、**開始時に Read、終了時に Write** を Orchestrator system prompt に必須化。

## 適用対象

- ecc-orchestrator agent (および本 Method を採用する任意の Orchestrator)
- 複数セッションをまたぐ作業全般

## ファイル構造

```
<cwd>/.session-state/
├── PENDING.md       # 未完了宿題の SSOT (開始時 Read / 終了時 Write)
├── COMPLETED.md     # 完了済宿題のアーカイブ (永続記録)
└── HISTORY.md       # 各セッションの引き継ぎログ (誰が何を引き継いだか)
```

## PENDING.md フォーマット

```yaml
---
last_updated: YYYY-MM-DD HH:MM
session_count: <累計セッション数>
---

## 宿題: <ID> - <タイトル>

- **状態**: not_started | in_progress | blocked | review_pending
- **優先度**: P0 (即着手) | P1 (次回) | P2 (余力)
- **着手条件**: <前提条件、なければ "なし">
- **完了基準**: <数値・観測可能な条件>
- **関連**: <Runbook ID / ファイルパス>
- **担当 expert role**: <Expert Registry のカテゴリ>
- **メモ**: <自由記述、引き継ぎ先 agent への補足>

## 宿題: ...
```

## 開始時プロトコル (起動 hook)

Orchestrator agent は起動直後 (= ユーザーから最初の依頼を受ける前) に以下を **無条件実行** する:

```
[1] <cwd>/.session-state/PENDING.md を Read
[2] ~/.claude/methods/ecc-method/45_runbook/INDEX.md を Read (Runbook 索引)
[3] ユーザーへの最初の応答に以下を含める:
    "前回からの継続: <PENDING の P0 宿題 1 行サマリ>"
    "自律判断で <宿題 ID> から着手します"
[4] ユーザー指示が新規タスクなら: PENDING に追加 + 既存宿題と優先順位を再評価
[5] ユーザー指示が「再開」「続き」など継続意図なら: P0 から自動着手
```

ユーザーは「前回何やった?」を覚えていなくてよい。agent が PENDING を読んで自動継続する。

## 終了時プロトコル (主要タスク完了時)

Orchestrator agent は主要タスクが完了したと判断した時点で以下を **無条件実行** する (ユーザーから「終了」の指示なしに):

```
[1] 完了した宿題を PENDING.md から削除し COMPLETED.md に移送
    - completed_at, session_id, 成果物 commit hash を付与
[2] 新たに発生した宿題 (検証中・要 follow-up・棄却理由要記録) を PENDING に追加
[3] HISTORY.md に当該セッションの記録を追記
    - session_start, session_end, 着手宿題 ID, 完了宿題 ID, 新規追加宿題 ID
[4] PENDING.md / COMPLETED.md / HISTORY.md を git commit + push
[5] ユーザーへの最終応答に以下を含める:
    "完了: <COMPLETED に移した宿題>"
    "次回継続: <PENDING の P0 宿題>"
    "次回起動時、ユーザーは何もしなくて自動で再開します"
```

## ユーザーが取るべき行動 (= ほぼゼロ)

### 通常時

1. 新セッションを起動 (Claude Code セッション開始)
2. **何もしない、または単に「再開」と入力**
3. agent が PENDING を読んで自動継続

### 不可逆操作時 (ASK 該当)

agent が「ASK 該当 (不可逆共有資源)」と判断した時のみ確認を求める。それ以外は確認なし。

### 新規タスク追加時

「<新タスク>」と平文で投げる。agent が PENDING に追加 + 優先順位を自律判断。

## Orchestrator system prompt への組み込み

`~/.claude/agents/ecc-orchestrator.md` に以下のセクションを追加 (本 Runbook 採用と同時に):

```
== 起動時必須 (RB-006) ==
セッション開始直後、ユーザー応答前に以下を実行:
1. <cwd>/.session-state/PENDING.md を Read
2. ~/.claude/methods/ecc-method/45_runbook/INDEX.md を Read
3. P0 宿題から自律着手 (ユーザー判断不要)

== 終了時必須 (RB-006) ==
主要タスク完了時、ユーザー指示なしで以下を実行:
1. PENDING.md を更新 (完了 → COMPLETED に移送、新規宿題を追加)
2. HISTORY.md に当該セッション記録を追記
3. <cwd>/.session-state/ を git commit + push
4. ユーザーへの最終応答に「次回継続: <P0 宿題>」を 1 行含める
```

## 検証 (成功条件)

- [ ] 新セッションで Orchestrator が起動した直後、PENDING.md が Read される
- [ ] ユーザーが「再開」とだけ入力して P0 宿題が自動着手される
- [ ] 主要タスク完了時、ユーザー指示なしに PENDING / COMPLETED / HISTORY が更新される
- [ ] git commit + push が自動実行される (agent file ホットリロード後)
- [ ] ユーザーへの ASK 数が 1 セッションで 3 回以下 (不可逆操作除く)

## 失敗時のリカバリ

| 症状 | 原因 | 対処 |
|---|---|---|
| PENDING.md が Read されない | agent prompt に起動時 hook 未設定 | system prompt の「起動時必須」を再確認 |
| 完了宿題が COMPLETED に移されない | 終了時 hook 未発火 | system prompt の「終了時必須」を再確認、または明示的に "終了" と指示 |
| PENDING の優先順位が頻繁に変わる | 着手条件が曖昧 | 各宿題の着手条件 / 完了基準を数値化して PENDING に再記述 |
| 宿題が永遠に in_progress のまま | blocked 化していない | review_pending → blocked → 棄却 or 再着手 のステータス遷移を明示 |
| <cwd>/.session-state/ ディレクトリが空 | 初期化忘れ | bootstrap.sh に `mkdir -p _handover && touch _handover/{PENDING,COMPLETED,HISTORY}.md` を追加 |

## 関連

- ../01_overview/05_user-as-hands.md (本 Runbook と対、ユーザーロール定義)
- RB-003-autonomous-decision-framework.md (判断委譲禁止、本 Runbook と整合)
- RB-001-agent-registry-hot-reload.md (agent 設定変更後の反映タイミング)
- METHOD.md §3 (8 原則、特に第 3 ゼロ重複・第 4 承認最小化)
- 出典: ユーザー指摘「私が正しい対処をしなければ宿題は永遠に失われる」(2026-06-24 対話)

## 変更履歴

| 日付 | 変更 | 理由 |
|---|---|---|
| 2026-06-24 | 初版 | セッション引き継ぎを agent 自動化、ユーザー認知負荷ゼロ化 |
