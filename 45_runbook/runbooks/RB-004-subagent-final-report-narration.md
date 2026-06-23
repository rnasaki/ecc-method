---
id: RB-004-subagent-final-report-narration
title: subagent の final report 強化と heartbeat ログ - 親 context を汚さず観測性を確保
category: tooling
tags: [subagent, observability, final-report, heartbeat, context-economy, isolation]
created: 2026-06-24
updated: 2026-06-24
last-verified: 2026-06-24
status: active
trigger: subagent (Agent ツール) 起動時、parent context を汚染せずに「何を考え、どこで詰まり、どう抜けたか」を観測可能にしたい / Codex 風の中間出力が無いことへの代替策が必要
expert-routing: [orchestrator]
related: [RB-001-agent-registry-hot-reload, RB-003-autonomous-decision-framework]
source: 本パッケージ実機運用 (2026-06-24, ユーザー指摘「subagent の振る舞いが見えない」+ 第 5 原則「コンテキスト最小」検証)
---

# subagent の final report 強化と heartbeat ログ

## TL;DR (30 秒で読める結論)

Claude Code subagent の中間出力欠落問題には、**parent 側の監視ループ**ではなく **subagent 側の自己報告強化** で対処する。理由: parent が監視すると subagent isolation が壊れ、第 5 原則「コンテキスト最小」と BP-008 に反する。代わりに (D) final report に「思考過程 / 詰まり / 不採用案」を必須化、(E) heartbeat ファイルへの narration 任意出力 で対応。リアルタイム生中継は諦める。

## 前提

- Claude Code Agent ツール (subagent_type 指定で起動)
- subagent isolation: parent context は subagent の作業ログを直接受け取らない (Anthropic Engineering BP-008)
- ユーザーは観測責任を負わない (RB-003 自律判断フレームワーク)

## 棄却した代替案 (反対意見併記、第 7 原則)

| 案 | 棄却理由 |
|---|---|
| parent が TaskOutput 30 秒監視ループ | 監視データが parent context に流入 → 第 5 原則違反、BP-008 (subagent isolation) 破壊 |
| ユーザーが `tail -f narration` で観測 | ユーザー負荷増、CLI スキル依存、自律エージェントの責任放棄 (RB-003 違反) |
| subagent 内 kill-switch / can_user_abort | 長時間自律実行を阻害、ユーザー判断戻し |
| 何もしない (現状維持) | NG ケース検知が完了時のみ = ユーザー不安を放置 |

## 採用案 (D + E)

### D. final report 強化 (必須)

subagent プロンプト末尾に追加する:

```
== final report (必須) ==

タスク完了時、以下のセクションを最終出力に含めること:

## 結果
<本来のタスク成果物>

## 思考の軌跡
- 主要な判断 3〜5 点 (どの選択肢を採り、何を捨てたか)
- 各判断の根拠 (本リポ原則 / 出典 / 既存章への参照)

## 詰まった点
- 30 秒以上 progress が止まった箇所 (該当があれば、なければ「なし」)
- 同じ tool / ファイルを 5 回以上参照した箇所
- 試行錯誤を要した箇所と、最終的にどう抜けたか

## 不採用案
- 検討したが採らなかった案 1〜3 件
- 棄却理由 (本リポ原則 / 出典 / コスト)

## 自己評価 (簡易)
- 順守できた原則: <列挙>
- 守れなかった点 (もしあれば): <列挙、隠さず>
- 不確実性 (未検証 / 推測のもの): <列挙>
```

これにより、parent は完了時に **subagent の思考過程を 1 度だけ取り込む** (リアルタイム監視なし、isolation 維持)。

### E. heartbeat ログ (任意)

長時間タスクや実証実験用途のみ:

```
== heartbeat (任意、長時間タスクのみ) ==

主要 step 完了ごとに、以下を ./_tmp/agent-<task-id>.heartbeat に追記する:
<ISO8601 timestamp> | <phase> | <action 1 行>

- parent / user は通常読まない (read on demand)
- 監査ログ的位置付け、後から「この subagent は何を考えたか」検索用
- 中断トリガにはしない (kill-switch なし)
- ファイルが無くてもタスクは成立する
```

heartbeat の取り扱い:
- parent: 通常は読まない。final report に異常があれば事後参照
- user: 通常は読まない。問題発生時のみ自発的に確認
- これにより parent context は汚染されない

## 実装: Orchestrator system prompt への追記

`~/.claude/agents/ecc-orchestrator.md` の subagent 起動セクションに、起動するすべての subagent prompt に **D を必須付帯、E を 5 分超想定タスクで付帯** する規律を埋める (本 Runbook 採用後の次更新で反映)。

## 検証 (成功条件)

- [ ] subagent の最終出力に「思考の軌跡 / 詰まった点 / 不採用案 / 自己評価」セクションが揃っている
- [ ] parent context に subagent の作業ログが直接流入していない (final report 1 回のみ)
- [ ] ユーザーが tail / TaskOutput を能動的に呼ばずに完了通知だけ受け取れる
- [ ] heartbeat ファイルが該当タスクで生成されている (任意、長時間タスク時)
- [ ] 累積 token が監視ループ案 (棄却案 A) と比較して有意に少ない (実測必要)

## 失敗時のリカバリ

| 症状 | 原因 | 対処 |
|---|---|---|
| final report に思考軌跡が無い | プロンプト末尾の追加忘れ | 必須セクションを再投入 |
| heartbeat が空 | 任意なので可。問題なし | 何もしない |
| subagent が長時間 stuck | 中断トリガなし設計上の妥協 | 完了後の振り返りで原因特定 → 次回プロンプト改善 |
| parent context が膨らむ | final report が長すぎ | report の各セクションに行数上限を付帯 (例: 思考軌跡 ≤ 10 行) |

## コンテキスト消費の比較 (棄却案 A vs 採用案 D+E)

| 項目 | 監視ループ案 (棄却) | final report 強化案 (採用) |
|---|---|---|
| parent への流入 | tool call ごと (連続) | 完了時 1 回のみ |
| 1 タスクあたり token | 数 k 〜 数十 k | 数百 〜 数 k |
| 並列 5 subagent | × 5 で爆発 | × 5 でも線形 |
| isolation 維持 | × | ✓ |
| リアルタイム観測 | ✓ | × (完了後のみ) |

リアルタイム性を妥協する代わりに、**コンテキスト経済と isolation を守る**。トレードオフ受容。

## 関連

- 第 5 原則「コンテキスト最小」(METHOD.md §3)
- BP-008 「Delegate file-heavy investigation to subagents and consume only their summary」(05_principles/_data/best_practices.json)
- BP-027 「Have the agent show evidence rather than asserting success」(同)
- [RB-001-agent-registry-hot-reload.md](./RB-001-agent-registry-hot-reload.md)
- [RB-003-autonomous-decision-framework.md](./RB-003-autonomous-decision-framework.md) (ユーザー判断戻し回避)
- 出典: ユーザー指摘「subagent の振る舞いが見えない」(2026-06-24 対話)

## 変更履歴

| 日付 | 変更 | 理由 |
|---|---|---|
| 2026-06-24 | 初版 | Codex 比で Claude Code subagent の中間出力欠落、ただし parent 監視ループは context 爆発を招くため、final report 強化 + heartbeat 任意の組み合わせで対処 |
