---
id: RB-009-first-run-sdd-bootstrap
title: 初回起動の SDD ヒアリングフロー - .session-state/ は SDD/TDD の中間成果物として生成される
category: bootstrap
tags: [first-run, sdd-bootstrap, session-state, no-prior-handover, generation]
created: 2026-06-24
updated: 2026-06-24
last-verified: 2026-06-24
status: active
trigger: 配布利用者が初めて agent を起動する / `.session-state/` が存在しない / 新規プロジェクトで GOAL がまだない
expert-routing: [orchestrator, planner]
related: [RB-006-session-handover-protocol, RB-007-1-session-1-task-and-session-state, RB-008-branch-strategy-and-semver]
source: ユーザー指摘 (2026-06-24, "初回はSDD/TDDを実施して中間アウトプットとして引継ぎ資料ができる")
---

# 初回起動の SDD ヒアリングフロー

## TL;DR (30 秒で読める結論)

`.session-state/` は **引き継ぎ資料ではなく SDD/TDD プロセスの中間成果物**。
配布利用者の初回起動には引き継ぐべき過去がないため、agent は **対話で SDD を始める**:
ユーザーに「このプロジェクトで何を達成したいか」を 1 質問 → 応答から GOAL.md を生成 →
PRD ヒアリング → requirements/design/tasks へ展開 → 結果として `.session-state/` が **生成される**。

## 概念再定義 (RB-006 / RB-007 を上書き)

### `.session-state/` の役割

| 旧 (誤り) | 新 (正しい) |
|---|---|
| 「ハンドオーバー = 引き継ぎ資料」 | 「セッション状態 = SDD/TDD プロセスの中間成果物」 |
| 初回も Read 対象 | 初回は **生成対象** |
| 利用者が事前に書く | agent が対話を経て生成 |

### 初回 vs 継続の区別

| 状況 | 動作 |
|---|---|
| `.session-state/` 不存在 (新規プロジェクト) | 本 Runbook の SDD ヒアリングフロー |
| `.session-state/` 存在 (継続セッション) | RB-006 通り (Read → 継続) |

## 初回フロー (擬似コード)

```
on_session_start():
    if not exists(cwd / ".session-state"):
        # 新規プロジェクト
        copy_template(
            from = "~/.claude/methods/ecc-method/45_runbook/_session-state-template/",
            to = cwd / ".session-state/",
        )

        ask_user_one_question("このプロジェクトで何を達成したいですか? (北極星 1 文)")
        north_star = user_response()

        # 北極星から GOAL.md を生成
        generate_goal_md(north_star)

        # 北極星を分解して PRD / requirements ヒアリング
        for question in [
            "ターゲットユーザーは誰ですか?",
            "成功条件 (測定可能なもの) は?",
            "スコープ外 (今回やらないこと) は?",
            "既存資産はありますか? (リポ / 既存 SDD ドキュメント等)",
        ]:
            ask_user_one_question(question)
            collect_response()

        # ヒアリング結果を 30_sdd-phase の手順で展開
        generate_pending_md(from_hearings)
        generate_current_session_md(first_task = pending.p0)

        # ユーザーに生成内容を 5 行で提示
        show_summary([
            "北極星: " + goal.north_star,
            "今回のタスク: " + current_session.target,
            "スコープ外: " + current_session.out_of_scope[0],
            "想定所要: 30 分〜2 時間",
            "変更要望なければ着手します",
        ])

        # 中断指示なければ着手
        if not user_aborts():
            proceed_with_task()

    else:
        # 継続セッション (RB-006 通り)
        read_goal_md()
        read_pending_md()
        read_current_session_md()
        ...
```

## ヒアリング項目 (最小限)

初回ヒアリングで agent が問う質問は **5 つ以下** に絞る (利用者の認知負荷最小化):

1. **北極星** (1 文): 「何を達成したいですか?」
2. **ターゲット**: 「誰のために作りますか?」
3. **成功条件**: 「完了したと言えるのは何が起きた時ですか?」(測定可能)
4. **スコープ外**: 「今回やらないことは?」(任意、未指定なら agent が推測)
5. **既存資産**: 「参照すべき既存資料は?」(任意、無ければスキップ)

各質問は **1 度に 1 つだけ** (詰め込み禁止)。
回答が曖昧な場合は agent が「具体例 3 つ」を提示して補助する (ヒアリング支援)。

## ヒアリング後の自動生成

ヒアリング結果から agent が以下を生成:

| ファイル | 生成元 |
|---|---|
| `GOAL.md` | 質問 1 (北極星) + 質問 3 (成功条件) + 質問 4 (スコープ外) |
| `PENDING.md` | 質問 1-2 を 30_sdd-phase の手順で機能 ID 採番 (HW-A / HW-B / ...) |
| `current_session.md` | PENDING の P0 から 1 つ選定、status: pending_start |
| `COMPLETED.md` / `HISTORY.md` | 空の雛形 |

## 既存 RB との関係 (差分)

### RB-006 (セッション引き継ぎプロトコル)

- 「起動時必須」の §1 を本 Runbook で上書き
- §2 以降 (Read GOAL/PENDING/current_session) は継続セッション用として残る
- 「ハンドオーバー」用語は段階的に廃止予定 (HW-D で対応)

### RB-007 (1 セッション 1 タスク)

- そのまま有効。本 Runbook の生成フローも 1 セッション 1 タスク原則に従う
- 初回セッションは「SDD ヒアリング + 1 タスク着手」が範囲

### RB-008 (Branch / semver)

- 本 Runbook と独立。配布規律として並列で機能

## 適用条件と例外

### 適用される場合

- 配布版 (main) を初めて clone した利用者
- 新規案件で `.session-state/` が無い状態
- `.session-state/` が破損 / 削除された状態 (リカバリ起点)

### 例外 (本 Runbook を適用しない場合)

- `.session-state/` が既に存在 → RB-006 通り (継続)
- ユーザーが明示的に「ヒアリング不要、直接タスク投入」と指示 → ヒアリングをスキップして雛形のみ生成
- 本 Runbook 自体の整備セッション (= ecc-method develop branch での作業) → develop branch では `.session-state/` を予め持っているため自動的に RB-006 ルートに進む

## 検証 (成功条件)

- [ ] 配布版 main を clone した利用者の作業ディレクトリで agent 起動 → ヒアリング開始
- [ ] ヒアリング 5 質問以下で完結
- [ ] ヒアリング後、`.session-state/` 5 ファイルすべてが生成される
- [ ] 生成された GOAL.md にユーザー回答が反映されている
- [ ] 5 行サマリでユーザーに提示される
- [ ] 中断指示なしで次のタスクに進める

## 失敗時のリカバリ

| 症状 | 原因 | 対処 |
|---|---|---|
| ヒアリングが 6 質問以上に膨らむ | 質問設計の失敗 | 質問数を 5 以下に絞り込み、補助質問は agent 内部で処理 |
| GOAL.md 生成が曖昧 | ユーザー応答が抽象的 | agent が「具体例 3 つ」を提示して再質問 |
| ユーザーが質問に答えられない | 案件が初期段階すぎる | 「最小の北極星 (例: 何のために誰の問題を解くか) でいい」と緩和 |
| 雛形コピー失敗 | パーミッション or パス問題 | エラーメッセージをユーザーに提示、手動対処を案内 |
| ユーザーが「ヒアリング不要」と言う | 急いでいる / 既に方針が決まっている | 雛形のみ作成し、ユーザー記入待ちモードに切り替え (旧フロー fallback) |

## アンチパターン

| アンチパターン | 害 |
|---|---|
| ユーザーに記入を求めて停止 | 何書けばいいか分からず利用者が離脱 |
| ヒアリング 10 質問以上 | 認知負荷増、初回でうんざり |
| 質問なしで雛形生成のみ | GOAL が空のまま走り出す = Session 1 終盤の逸脱を再発 |
| ヒアリング結果を破棄 | 利用者の労力が無駄になる、信頼低下 |

## 関連

- RB-006 (継続セッション用の Read プロトコル)
- RB-007 (1 セッション 1 タスク規律、本 Runbook と整合)
- RB-008 (配布規律、main = 配布版 / develop = 開発版)
- 30_sdd-phase/01_prd-flow.md (ヒアリングから PRD 生成への展開)
- 出典:
  - ユーザー指摘 (2026-06-24, "初回は SDD/TDD で中間アウトプットとして引継ぎ資料ができる")
  - Anthropic Claude Code Best Practices (https://code.claude.com/docs/en/best-practices, retrieved 2026-06-24)

## 変更履歴

| 日付 | 変更 | 理由 |
|---|---|---|
| 2026-06-24 | 初版 | `.session-state/` の概念再定義 + 初回 SDD ヒアリングフロー |
