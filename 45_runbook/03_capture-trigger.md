---
keywords: [runbook, capture, trigger]
related: []
---
# 03 — Capture Trigger

「いつ Runbook 化すべきか」の検知ルール。Orchestrator はタスク完了時に必ずこの判定を回す。Runbook 化を逃すと、同じ手順を毎回ユーザーに尋ねる「ゼロ重複違反」が発生する。

## 4 つの主トリガ

| ID | トリガ | しきい値 |
|---|---|---|
| T-1 | 同手順 ≥ 2 回 | 1 セッション内 / 同一 orchestrator 内で 2 回観測 |
| T-2 | 15 分超ハマり | 1 つの問題に 15 分以上の試行錯誤 |
| T-3 | 新ツール初回 | 未登録ツール / MCP / CLI を初めて使った |
| T-4 | セッション横断パターン | 過去複数セッションで類似手順が再現 |

いずれか 1 つでも該当すれば Runbook 化候補。複数該当なら優先度高。

## T-1: 同手順 ≥ 2 回

### 検知方法
- 同一 orchestrator が同じツール / 同じファイル / 同じ手順 sequence を 2 回以上実行
- ユーザーが同じ修正指示を 2 回以上出した
- 同じエラーメッセージに 2 回以上遭遇

### 判定の留意点
- 「似ている」だけでは不足。手順 sequence (≥ 3 ステップ) が再現していること
- 1 回目は「観察」、2 回目に「捕捉」する (1 回目で書くのは早すぎる)

### 例
- pytest が同じ ImportError で 2 回失敗 → Runbook 化
- gh push が 401 で 2 回失敗 → Runbook 化
- ユーザーが「Windows GitBash では `Scripts/activate`」を 2 回訂正した → Runbook 化

## T-2: 15 分超ハマり

### 検知方法
- 同一問題に対する試行錯誤の wall-clock が 15 分超
- 試行回数が 5 回以上で進展なし
- 同じツール呼び出しがエラーで連続 3 回失敗

### 判定の留意点
- 解決に至らず諦めた場合も Runbook 化対象 (失敗パターンとして残す)
- ハマりの「原因」が判明していなくても、観察事実として残す価値あり
- category は `pitfall` または `debug`

### 例
- proxy 環境で curl が 30 分間 SSL エラー連発 → 解決 / 未解決どちらでも Runbook 化
- TypeScript の型推論が想定と異なり 1 時間調査 → Runbook 化

## T-3: 新ツール初回

### 検知方法
- Registry / INDEX に登録されていないツール / MCP / CLI を起動
- 新規 sub-agent を初めて呼び出した
- 新規言語の lang-build-resolver を初めて使った

### 判定の留意点
- 「使えた」だけで終わらず、設定 / 認証 / 前提環境 を残す
- ツール導入手順 (`tooling` カテゴリ) と利用手順は別 Runbook に分けると再利用しやすい
- 初回は冗長でも OK。次回以降の更新で削れる

### 例
- 新 MCP server を `~/.claude/settings.json` に追加 → `tooling` Runbook 化
- 初めて `mcp__playwright` を使った → 利用パターン Runbook 化

## T-4: セッション横断パターン

### 検知方法
- 過去セッション (memory / 別 orchestrator の記録) で類似手順を観測
- ユーザーが「前にも同じこと聞いた」と言及
- 同じトピックの質問が複数日にまたがって発生

### 判定の留意点
- セッション横断はメモリ参照が必要 (memory ファイル / Runbook search)
- 検知した瞬間ではなく **ユーザー対応中** に Runbook 化を提案する (後回し禁止)
- 既存 Runbook が古い場合は更新 (新規作成と区別)

### 例
- 異なるリポで同じ proxy 設定の質問が来る → 共通 Runbook 化
- 「会社環境ではこの CA バンドルが必要」が複数案件で再現 → memory 既存なら Runbook へ昇格

## 判定木

```
タスク完了 → 以下を順にチェック:

1. 同手順 ≥ 2 回観測したか? (T-1)
   YES → Runbook 化候補へ

2. 15 分以上ハマったか? (T-2)
   YES → Runbook 化候補へ (解決有無問わず)

3. 新ツール / 新 expert を初使用したか? (T-3)
   YES → Runbook 化候補へ

4. 過去セッションに類似があるか? (T-4)
   YES → Runbook 化候補 / 既存更新

5. いずれも No → Runbook 化スキップ
```

## Runbook 化のスキップ条件

以下に該当する場合は Runbook 化しない:

- ユーザー固有の一回限りの依頼 (再利用性なし)
- 既存 Runbook で完全カバー済 (重複作成回避)
- セキュリティ / プライバシー上、手順を残せない情報を含む
- 試行錯誤の途中状態 (まだ「手順」になっていない)

スキップ判断もログに残す (なぜ書かなかったかを 1 行)。

## 候補から実 Runbook への昇格手順

1. `_tmp/runbook_candidates.md` に粗書き (TL;DR + 手順だけ)
2. `01_runbook-spec.md` のフォーマットに整形
3. `02_indexing-rules.md` の規約で id / category / tag / trigger を確定
4. INDEX.md に追記
5. ユーザー / orchestrator が次回同状況で参照可能に

## 検知の自動化案

Orchestrator が完了レポート段で以下を self-check:

```yaml
self_check:
  - same_procedure_repeated_in_session: <true | false>
  - struggle_minutes: <int>
  - new_tool_used: <true | false>
  - cross_session_pattern_hit: <true | false>
should_capture: <any of above true>
```

`should_capture: true` の場合、ユーザー応答末尾に「Runbook 化候補が発生しました」と明示する。

## アンチパターン

| アンチパターン | 症状 | 対処 |
|---|---|---|
| 1 回目で Runbook 化 | 一過性手順が散在 | 必ず 2 回目で捕捉 (T-1) |
| ハマりを「解決後」にしか書かない | 未解決パターンが残らず再ハマり | 未解決でも書く (T-2) |
| 新ツール初回を「使えた」で終わる | 次回も初回扱い | T-3 で必ず候補化 |
| セッション横断検知が memory 任せ | memory が無いと取りこぼし | INDEX 検索を毎タスク冒頭に |
| 候補のまま放置 | 結局 Runbook にならない | 同セッション内で必ず昇格判断 |

## 出典

- BP-007: Anthropic Claude Code best practices (https://code.claude.com/docs/en/best-practices, retrieved 2026-06-23)
- BP-016: Anthropic Claude Code skills docs (https://code.claude.com/docs/en/skills, retrieved 2026-06-23)
- BP-027: Claude Code best practices (https://code.claude.com/docs/en/best-practices, retrieved 2026-06-23) — evidence over assertion
- 内部 SSOT: `45_runbook/01_runbook-spec.md`, `45_runbook/02_indexing-rules.md`

## 不確実性

- 「15 分」「2 回」のしきい値は経験則。プロジェクト規模により調整可。短いタスク中心なら「10 分 / 2 回」、長尺なら「30 分 / 3 回」。
- T-4 のセッション横断検知は memory 機構の精度に依存する。memory 不足時は INDEX の trigger 文 grep で代替。
- 自動 self-check のロジックは本パッケージで実装提供しない。導入先 hook で実装する想定。
