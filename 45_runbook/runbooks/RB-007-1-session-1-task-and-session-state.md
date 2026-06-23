---
id: RB-007-1-session-1-task-and-session-state
title: 1 セッション 1 タスク原則 + セッション状態の永続化 (GOAL / current_session / 進捗ログ)
category: bootstrap
tags: [session-discipline, focus, single-task, state-persistence, scope-control, no-drift]
created: 2026-06-24
updated: 2026-06-24
last-verified: 2026-06-24
status: active
trigger: セッション中に複数タスクを並列で進めようとして詰め込みすぎ / 本筋から逸れた局所最適化に時間を使う / セッションが落ちて作業が消失 / ゴールから逸脱したのに気付かない / 「今何やってる?」を agent が即答できない
expert-routing: [orchestrator]
related: [RB-006-session-handover-protocol, RB-003-autonomous-decision-framework, ../01_overview/05_user-as-hands.md]
source: 本パッケージ実機運用 (2026-06-24, Session 1 で agent が Method 自己整備に逸脱しゴールを見失った事実)
---

# 1 セッション 1 タスク原則 + セッション状態の永続化

## TL;DR (30 秒で読める結論)

セッション中の逸脱・タスク漏れ・ゴール忘却を防ぐため、**1 セッション 1 タスク** を原則化し、3 階層の永続化 (GOAL / PENDING / current_session) を導入する。agent はセッション開始時に GOAL を Read してゴール確認、current_session に「今のタスク」を 1 つだけ書き、それ以外を **明示的にスコープ外宣言**。中断時は進捗を current_session に記録、終了時は完了状態を確定して PENDING/COMPLETED を更新する。

## なぜこの規律が必要か (Session 1 で起きた逸脱)

| 観点 | Session 1 の実態 |
|---|---|
| 本来ゴール | MVP を要求仕様通りに稼働させる (= サブゴール 3) |
| 実際の作業 | サブゴール 1 (Method 作成) で止まり、Method 自己整備に 5〜6 ターン費やした |
| 原因 | ゴール永続化なし、タスク粒度規律なし、逸脱検知なし |
| 結果 | セッション終盤までユーザーがゴール再確認するまで気付かなかった |

これは agent の自律判断の限界というより、**規律の欠落**。Method 自体に組み込んで再発防止する。

## 3 階層の永続化

| 階層 | ファイル | 単位 | 更新頻度 |
|---|---|---|---|
| 1. ゴール (北極星) | `45_runbook/_handover/GOAL.md` | 案件単位 (数か月) | めったに変更しない |
| 2. タスクリスト | `45_runbook/_handover/PENDING.md` | 中粒度 (1 セッション = 1 タスク) | 週次 / セッションごと |
| 3. 現タスク+TODO | `45_runbook/_handover/current_session.md` | 1 ターン〜数ターン | セッション中常時 |

各階層の役割:
- GOAL: 「何のために」を忘れない (逸脱検知の基準)
- PENDING: 「何が残っているか」を覚えない (agent が記憶を肩代わり)
- current_session: 「今何をしているか」を集中する (詰め込み防止)

## 1 セッション 1 タスクの規律

### 推奨単位

| 観点 | 推奨 |
|---|---|
| タスク数 | 1 セッション = 1 タスク (PENDING の 1 行に対応) |
| 例外 | タスクが小さい (< 30 分) なら 2〜3 並列可、ただし current_session に明示 |
| タスク所要時間目安 | 30 分〜2 時間 |
| 超過時 | タスクをサブタスクに分割し PENDING に追記、現セッションは最初のサブタスクで終わる |

### スコープ外の明示

current_session.md に「**このセッションで触らないもの**」セクションを必須化。これにより:
- agent 自身の自律判断ブレーキ (新たな問題を見つけても今は触らない)
- ユーザー視点の透明性 (何が起きないか分かる)

## 起動時プロトコル (Orchestrator agent)

セッション開始直後、無条件実行:

```
[1] ~/.claude/methods/ecc-method/45_runbook/_handover/GOAL.md を Read (北極星確認)
[2] ~/.claude/methods/ecc-method/45_runbook/_handover/PENDING.md を Read (中粒度タスク)
[3] ~/.claude/methods/ecc-method/45_runbook/_handover/current_session.md を Read
    - status が pending_start: 雛形 = 前回終了時に作られた次セッション計画。そのまま着手
    - status が in_progress: 前回中断 = 「再開ポイント」から続行
    - status が completed: 古い = PENDING の P0 から新規タスク選定、current_session を新規作成
[4] ~/.claude/methods/ecc-method/45_runbook/INDEX.md を Read (Runbook 索引)
[5] ユーザーへの最初の応答に以下を含める (5 行以内):
    - 北極星: <GOAL.md §北極星 1 文>
    - 今回のタスク: <current_session.md §ターゲットタスク 1 行>
    - スコープ外: <current_session.md §スコープ外 から代表 1 件>
    - 想定所要: <30 分〜2 時間 等>
    - 「変更要望なければ着手します」(明示中断のみ受け付け、ASK ではない)
[6] 30 秒待ち or ユーザー応答待ち → 中断指示なければ着手
```

## 作業中プロトコル

```
- TodoWrite (セッション内 TODO) と current_session.md §TODO を同期
- 主要 step 完了ごとに current_session.md §進捗ログ に追記
- 「スコープ外で発見した問題」は current_session.md §不確実性 に記録、即着手しない
- 30 分以上 stuck なら current_session.md §再開ポイント に状況記録、ユーザーに 1 行報告
```

## 中断時プロトコル (context 限界 / セッション落ち / ユーザー中断)

```
[1] current_session.md §進捗ログ に「どこまで完了」「次の一手」を追記
[2] current_session.md §再開ポイント に次セッションが読むべき情報を 5 行以内で記録
[3] status を in_progress に保つ (completed にしない)
[4] _handover/ を git commit + push (RB-006 終了時必須と同じ)
```

## 終了時プロトコル (タスク完了)

```
[1] current_session.md §完了条件 のチェックボックスを全件確認
[2] 完了したらタスクを PENDING.md → COMPLETED.md に移送 (commit hash 付き)
[3] HISTORY.md に Session 記録を追記
[4] current_session.md を次セッション用に書き換え:
    - 次の P0 タスクを ターゲットタスク に設定
    - status を pending_start に変更
    - 進捗ログ・再開ポイントをクリア
[5] _handover/ を git commit + push
[6] ユーザー応答に「完了: <タスク>」「次回継続: <次の P0>」を含める
```

## ASK と ACT の境界 (本 Runbook 内)

| 行動 | 区分 |
|---|---|
| GOAL.md の Read / 内容確認 | ACT (毎回必須) |
| 現タスク選定・優先順位 | ACT (PENDING の P0 を選ぶ、自律判断) |
| ゴール変更 | **ASK** (北極星を変えるのは案件方針の変更) |
| スコープ外宣言の更新 | ACT |
| タスク分割 (規模超過時) | ACT |
| 着手前の 30 秒待ち | ACT (ASK ではない、デフォルト続行) |

## 検証 (成功条件)

- [ ] セッション開始時、agent が GOAL → PENDING → current_session の順で Read している
- [ ] 最初のユーザー応答に「北極星 / タスク / スコープ外」が 5 行以内で含まれる
- [ ] current_session.md にスコープ外宣言が必ずある
- [ ] 1 セッションで完了したタスク数 ≤ 3 (例外時のみ複数)
- [ ] セッション終了時に PENDING/COMPLETED/HISTORY/current_session が更新されている
- [ ] 次セッション起動時に「再開ポイント」から続行できる

## 失敗時のリカバリ

| 症状 | 原因 | 対処 |
|---|---|---|
| current_session が古い (前回終了時に書き換え忘れ) | 終了時プロトコル違反 | agent が起動時に検知し、PENDING の P0 から再選定 |
| タスク詰め込みすぎ | 1-session-1-task 違反 | ユーザー指示でも分割を agent から提案 (ACT) |
| ゴール逸脱 (Method 自己整備等) | GOAL.md の §スコープ外 確認漏れ | 各ターン頭で「今のタスクは GOAL §<番号> サブゴールに対応するか」をセルフ確認 |
| セッション落ちで進捗消失 | 中断時プロトコル未実行 | 進捗を都度 current_session に書く規律徹底、tool call 5 回ごとに同期 |
| 「今何やってる?」を agent が即答できない | current_session.md 未維持 | TodoWrite と current_session の同期義務化 |

## アンチパターン

| アンチパターン | 害 |
|---|---|
| GOAL.md なしで作業開始 | 逸脱検知不能 |
| current_session に「全タスクをやる」と書く | 1 セッション 1 タスク違反、詰め込み |
| スコープ外宣言を空欄にする | 局所最適化に逃げ込む余地が残る |
| TodoWrite だけで current_session.md を維持しない | セッション落ちで全滅 |
| 完了条件を曖昧に書く | 終わらない / 終わったか分からない |

## 関連

- RB-006 (セッション引き継ぎプロトコル、本 Runbook と対)
- RB-003 (自律判断、ゴール参照は L0 出典)
- 01_overview/05_user-as-hands.md (ユーザー認知負荷ゼロ化、本 Runbook の前提)
- METHOD.md §3 (8 原則、特に第 3 ゼロ重複・第 5 コンテキスト最小)
- 出典: ユーザー指摘 (2026-06-24 対話) - Session 1 で本筋から外れタスク漏れの懸念

## 変更履歴

| 日付 | 変更 | 理由 |
|---|---|---|
| 2026-06-24 | 初版 | Session 1 で agent が Method 自己整備に逸脱した事実を踏まえ、3 階層永続化と 1-session-1-task を規律化 |
