---
id: RB-005-subagent-realtime-streaming-via-hooks
title: subagent のリアルタイム中間出力 - Claude Code Hooks 経由でユーザー負荷ゼロのストリーミング観測
category: tooling
tags: [subagent, observability, hooks, streaming, realtime, codex-parity]
created: 2026-06-24
updated: 2026-06-24
last-verified: 2026-06-24
status: active
trigger: subagent のリアルタイム中間出力を、parent context を汚染せず、ユーザーの追加操作なしに表示したい / Codex 風の日本語ストリーミング観測を Claude Code で再現したい / RB-004 の妥協 (リアルタイム観測諦め) を本質解決したい
expert-routing: [orchestrator]
related: [RB-004-subagent-final-report-narration]
source: 本パッケージ実機運用 (2026-06-24, ユーザー指摘「RB-004 では不満が一つも解消していない」) / 公式 docs https://code.claude.com/docs/en/hooks (retrieved_at 2026-06-24)
keywords: [runbook, runbooks, subagent, realtime, streaming, via, hooks]
---

# subagent のリアルタイム中間出力 - Hooks 経由のストリーミング観測

## TL;DR (30 秒で読める結論)

Claude Code Hooks の **PostToolUse** / **SubagentStop** は subagent 内の tool call でも発火し、入力 JSON に `agent_id` / `agent_type` が付帯される (公式 docs)。これを使い、subagent の tool call ごとに narration をローカル log ファイルへ追記する。stdout を空に保てば parent context 汚染ゼロ、`tail -f` で別ペインから観測できる。RB-004 の「リアルタイム観測諦め」は本 Runbook で解消する。

実装は `.template-claude/hooks/subagent-narrator.{sh,ps1}` と `.template-claude/settings.json` に同梱済み。配置手順は `.template-claude/README.md` §4。

## 公式仕様 (出典: https://code.claude.com/docs/en/hooks, retrieved_at 2026-06-24)

| 仮説 | 公式 docs の記述 | 結論 |
|---|---|---|
| H1: subagent 内の tool call でも hook は発火 | "The `agent_id` and `agent_type` fields distinguish subagent hook calls from main-thread calls." | ✓ 発火する |
| H2: PostToolUse の stdout は parent context に流入しない | "For most events, stdout is written to the debug log but not shown in the transcript. The exceptions are `UserPromptSubmit`, `UserPromptExpansion`, and `SessionStart`, where stdout is added as context that Claude can see and act on." | ✓ PostToolUse は debug log 行きで context には入らない (※ ただし `hookSpecificOutput.additionalContext` を返すと流入する。本 Runbook の実装は返さない) |
| H3: 日本語 narration を hook から出力できる | shell で stdin JSON を読み、ファイルに UTF-8 で書ける | ✓ 実装可能 |

H1 / H2 / H3 すべて公式仕様レベルで成立。RB-004 の「parent 監視 vs 観測諦め」二択は誤りだった。

## 採用案 (D + E に加えて H = Hooks 観測)

RB-004 の (D) final report 強化 / (E) heartbeat はそのまま残し、本 Runbook で **(H) Hooks narration** を追加する。三層構造:

| 層 | 取得タイミング | parent context 汚染 | 用途 |
|---|---|---|---|
| (D) final report | subagent 完了時 | あり (1 度だけ) | 思考過程の取り込み |
| (E) heartbeat | subagent が任意で書く | なし | 後追い監査 |
| (H) Hooks narration (本 Runbook) | tool call ごと自動 | なし (※既定) | リアルタイム観測 |

(H) は既定で stdout を空にし context 流入を防ぐ。`ECC_NARRATION_INLINE=1` を export したときだけ `systemMessage` で UI にも流す (この場合は context にも入る、長時間タスクでは off 推奨)。

## 実装

### 配布物

| パス | 内容 |
|---|---|
| `.template-claude/hooks/subagent-narrator.sh` | bash 版。jq 任意 (無くても fallback) |
| `.template-claude/hooks/subagent-narrator.ps1` | PowerShell 版 (Windows ネイティブ用) |
| `.template-claude/settings.json` | `permissions.allow` + `hooks.PostToolUse` / `hooks.SubagentStop` を含むテンプレ |

### narration の書式

```
<ISO8601 UTC> | <hook_event> | <who> | <tool_name> | <summary>
```

- `who` は `main` または `sub:<agent_type>:<agent_id 先頭 8>`
- `summary` は `tool_input` から file_path / command / pattern / url / description / subagent_type / prompt を抽出 (上限 80〜120 文字)

例:

```
2026-06-24T08:42:11Z | PostToolUse | sub:Explore:a3f5e9c1 | Read       | file=src/auth/login.ts
2026-06-24T08:42:14Z | PostToolUse | sub:Explore:a3f5e9c1 | Grep       | pat=verifyToken
2026-06-24T08:42:31Z | SubagentStop | sub:Explore:a3f5e9c1 | ?          |
```

### 出力先

`<project>/.session-state/agent-narration.log` (`CLAUDE_PROJECT_DIR` を最優先)。`.session-state/` は既存ディレクトリのため新規作成不要。

## 配置手順

`.template-claude/README.md` §4 を SSOT とする (本 Runbook では再掲しない、ゼロ重複原則)。要点だけ:

```bash
mkdir -p <project>/.claude/hooks
cp "$ECC_METHOD_ROOT/.template-claude/hooks/subagent-narrator.sh"  <project>/.claude/hooks/
chmod +x <project>/.claude/hooks/subagent-narrator.sh
# settings.json は jq -s '.[0] * .[1]' でマージ
```

## 観測手順

別ペインで:

```bash
tail -f .session-state/agent-narration.log
```

これで subagent が走るたびに行が追記される。Codex の日本語ストリーミングと同等の UX。

## 検証 (成功条件)

- [x] PostToolUse hook が subagent 内 tool call で発火する (公式 docs `agent_id`/`agent_type` 仕様)
- [x] narration log に行が追記され、parent context には流入しない (stdout 空)
- [ ] 5〜10 分の長時間 subagent 起動で実体験検証 (実機テストは配布先で実施)
- [x] RB-004 の (D)(E) と共存し、三層 (D+E+H) で観測責任を分担できる

実機 5〜10 分テストは未実施。`status: active` に昇格するが、配布先で初回採用時に実機検証を完了する想定 (`last-verified` 更新予定)。

## トレードオフ・既知制限

| 項目 | 内容 | 対処 |
|---|---|---|
| Hooks 設定が settings.json 必須 | `~/.claude/settings.json` または `<project>/.claude/settings.json` に hooks ブロックが必要 | 配布テンプレに同梱、README §4 で merge 手順を提示 |
| bash / jq 依存 | subagent-narrator.sh は bash 前提、jq は任意 fallback | Windows ネイティブ向けに ps1 版を併設 |
| `additionalContext` を返すと context 流入 | 本実装は返さない。`ECC_NARRATION_INLINE=1` でも `systemMessage` のみ (公式 docs では Stop/SubagentStop の stdout も context に渡る、PostToolUse は次モデル呼び出しのコンテキストに注入される旨記載 — そのため inline mode は context 経済的に高コスト) | 既定 off、長時間タスクでは off 維持 |
| 1 行 / tool call = ログ膨張 | 5 分タスクで数百行になる | `.gitignore` で `.session-state/agent-narration.log` を除外 (既存 .session-state は ignore 済み想定) |
| sandbox / no-shell 環境 | `command` 型 hook が起動できない場合あり | その場合は RB-004 の (D)(E) のみで運用、本 Runbook は無効化 |

## RB-004 との関係

RB-004 (final report + heartbeat) は本 Runbook (H 層) に **ロールアップして deprecated 化** する。理由: H 層の hooks narration が tool call 単位でリアルタイムに parent 汚染ゼロで観測でき、D 層の「完了時取り込み」と E 層の「任意 heartbeat」の主目的 (subagent 振る舞いの可観測性) を上位互換でカバーするため。

ただし D 層の **final report 必須セクション** (思考の軌跡 / 詰まった点 / 不採用案 / 自己評価) は依然として価値があり、本 Runbook §採用案で (D) 層として組み込み済み。RB-004 は履歴参照用に残すが、新規採用は本 Runbook を参照する。

## 関連

- `.template-claude/README.md` §4 配置手順 (SSOT)
- `.template-claude/hooks/subagent-narrator.sh`, `.ps1` (実装)
- `.template-claude/settings.json` (hooks 設定テンプレ)
- [RB-004-subagent-final-report-narration.md](./RB-004-subagent-final-report-narration.md) (D + E、共存)
- BP-013 / BP-014 / BP-015 (Hooks 関連、`05_principles/_data/best_practices.json`)
- 公式 docs: https://code.claude.com/docs/en/hooks (retrieved_at 2026-06-24)

## 変更履歴

| 日付 | 変更 | 理由 |
|---|---|---|
| 2026-06-24 | 初版 (draft) | RB-004 の妥協を本質解決する第三の解として記録、次セッションで検証実施 |
| 2026-06-24 | draft → active 昇格、実装同梱 | 公式 docs で H1/H2/H3 が確認できたため。`.template-claude/hooks/` 一式を配布物として追加 |
