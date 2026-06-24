---
keywords: [changelog]
related: []
---
# Changelog

すべての注目すべき変更を記録する。

- 形式: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) (retrieved 2026-06-24)
- 版番号: [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html) (retrieved 2026-06-24)
- v0.x = 試行錯誤期 (API 不安定)、v1.0+ = 公開・配布期 (詳細: `45_runbook/runbooks/RB-008-branch-strategy-and-semver.md`)

## [Unreleased]

### Added
- (v1.0.0 で確定予定の機能・整備)
- `.template-claude/` 配布テンプレを新設。`~/.claude/CLAUDE.md` 用テンプレ + 採用手順 README。Method 採用と一体で採用推奨 (orchestrator 未起動の素セッションでも Method 規律が効くようにする)。`<ECC_METHOD_ROOT>` プレースホルダで絶対パスを排除し PATH POLICY 適合。`99_distribution/03_v1.0.0-release-checklist.md` §1.4 に整合チェック 3 項目を追加。
- `.template-claude/README.md` §2 の採用手順を 2 ステップ化 (CLAUDE.md 配置 + 初回 allowlist 追記)。Method 採用直後に頻発する Permission ポップアップ (skill 棚卸し / orchestrator 起動準備の read-only 調査) を、CLAUDE.md 配置と同じタイミングで `~/.claude/settings.json` の `permissions.allow` に登録するスクリプトと、jq 不在環境用フォールバック JSON を併記。配布先ユーザーの初回セットアップ体験が承認エコノミー §6 反パターン (毎回承認) に陥らないようにする。
- `.template-claude/hooks/subagent-narrator.{sh,ps1}` と `.template-claude/settings.json` の `hooks` ブロックを新設。Claude Code Hooks (PostToolUse / SubagentStop) を使い、subagent の tool call ごとに `<project>/.session-state/agent-narration.log` に narration を追記する。stdout を空に保つ実装で parent context 汚染ゼロ、`tail -f` で別ペインから観測できる (RB-005 採用案)。Windows ネイティブ向けに ps1 版併設。RB-004 の「リアルタイム観測諦め」妥協を本質解決し、Codex 風の日本語ストリーミング観測を Claude Code で再現する。
- `.template-claude/commands/ecc-orchestrator.md` を新設。`/ecc-orchestrator [タスク本文]` slash コマンドで `Agent(subagent_type=ecc-orchestrator)` を明示起動するショートカット (引数省略時は直近会話文脈を委任対象として渡す)。`.template-claude/README.md` §2 に `~/.claude/commands/` への展開ループを追加し、§同梱 slash コマンド節を新設。役割分担表に `commands/` 行を追加して subagent 定義 (`~/.claude/agents/`) との責務境界 (ユーザー対話 / `.session-state/` Write / 最終応答は主 Claude 側) を明示。
- `45_runbook/runbooks/RB-005-subagent-realtime-streaming-via-hooks.md` を draft → active に昇格。公式 docs (https://code.claude.com/docs/en/hooks, retrieved_at 2026-06-24) で H1 (subagent 内 hook 発火) / H2 (PostToolUse stdout は context 非流入) / H3 (日本語 narration 出力可) を確認、実装一式を本パッケージに同梱。`.template-claude/README.md` §4 に配置手順を追加 (任意)。
- `40_delegation/04_orchestrator-system-prompt.md` 即投入版に `== subagent 観測性 (RB-005) ==` セクションを追加。配布物パス・配置先・`stdout` 既定空・`ECC_NARRATION_INLINE` フラグの運用を規定し、Orchestrator 採用環境で hook 設定が確実に組み込まれるようにする (HW-B, Session 7, 2026-06-24)。
- 配布テンプレに **Knowledge Vault 駆動規律** を新規実装 (HW-J, Session 8, 2026-06-24)。`.template-claude/CLAUDE.md` §2 SSOT 表に Knowledge Vault 行 / §3 検索プロトコル Step 6 を Runbook と Knowledge note の 2 系統に分岐 / §5 作業中規律に Knowledge 即時記録 / §7 クローズ規律に **Step [0.5] KNOWLEDGE CAPTURE GATE** / §8 行動規律表に **Knowledge Capture First** を挿入。`.template-agents/ecc-orchestrator.md` の返却フォーマットに `## Knowledge 化候補` セクション (type 分類 + 中央 Vault 4 条件暫定判定) を追加。Method 本体に `12_knowledge-vault/` と RB-011 が整備済だったが配布テンプレに駆動 trigger が無く、案件 `Knowledge/` も中央 `~/Documents/Knowledge/` も空のままだった dead spec 状態を解消。

### Changed
- `.template-claude/CLAUDE.md` §3 検索プロトコル / `.template-claude/README.md` §テンプレ構成 / `.template-agents/ecc-orchestrator.md` §検索プロトコル を Method 本体 `45_runbook/04_search-protocol.md` と同期し、Step 0 に CodeGraph (`_index/concept-graph.json`) を主体化。前セッションで本体側だけ CodeGraph 主体化されていた配布テンプレ整合漏れを解消 (Session 7, 2026-06-24)。
- 章採番ポリシー: 5 刻みを単一規律として確定。`27_user-care/` を `25_writing-style/06_user-care/` 配下にサブディレクトリ化し、トップレベル採番を 5 刻み厳守に揃えた (HW-D, Session 3, 2026-06-24)。
- 関連リンク 18 箇所を新パスに張替え (`27_user-care/*` → `25_writing-style/06_user-care/*`)。
- `01_overview/03_how-to-read.md` の章一覧から独立行 27 を削除し、25 行に「ユーザーケアは 06_user-care/ 配下」と注記。
- `25_writing-style/01_voice.md` の二人称許容範囲を `06_user-care/` 表記に更新。
- `METHOD.md` §9 から user-care 詳細手順への参照パスを更新。
- `.template-agents/ecc-orchestrator.md` および `40_delegation/04_orchestrator-system-prompt.md` の感情検知シグナル参照パスを更新。

### Deprecated
- `45_runbook/runbooks/RB-004-subagent-final-report-narration.md` を `status: active` → `status: deprecated` に変更し (`deprecated_by: RB-005`)、上部に RB-005 への移行注記を追加。RB-004 の (D) final report + (E) heartbeat 層は RB-005 にロールアップ済み。新規採用は RB-005 を参照すること (HW-B, Session 7, 2026-06-24)。

### Removed
- トップレベル `27_user-care/` ディレクトリ (内容は `25_writing-style/06_user-care/` に移設)。

### Fixed
- `.gitignore` に `.claude/` (Claude Code セッションキャッシュ) を追加。個人環境固有のためリポジトリ追跡対象外とする。
- セッションクローズ規律を強化: `RB-006` §終了時プロトコルに **Step [0] CLOSURE GATE** を追加 (untracked / 関連残渣の自走点検、「スコープ外」での先送り禁止)。`60_quality-gates/07_gate-checklist.md` を 8 → 9 項目に拡張 (closure residue)。`.template-agents/ecc-orchestrator.md` および `40_delegation/04_orchestrator-system-prompt.md` の終了時必須に同期反映。
- `RB-003` §変更履歴に Session 3 の委譲しすぎ違反事例を追記 (再発防止記録)。

### Fixed
### Security

## [v0.1.0] - 2026-06-24

### Added
- 初版リリース。
- 8 原則 (`05_principles/`)、North Star、7 Habits マッピング、Anthropic / OpenAI 公式 BP マッピング。
- Expert Registry / Routing Rubric / Delegation Contract / Orchestrator System Prompt (`40_delegation/`)。
- Runbook System (`45_runbook/`、INDEX + capture/search/maintenance プロトコル)。
- Quality Gate (`60_quality-gates/`、fact-check / 不確実性開示 / Red Team Loop)。
- 文体規範 (`25_writing-style/`、voice / avoidance-patterns / citation-style / uncertainty-language / examples)。
- Frontier 章 (`85_frontier/`)、ECC Usage 章 (`90_ecc-usage/`)、Distribution 章 (`99_distribution/`)。
- README.md、LICENSE (MIT)、METHOD.md SSOT。
- Branch 戦略 (main = 配布版、develop = 開発版) と semver 規律 (`45_runbook/runbooks/RB-008`)。
- セッション状態プロトコル (`45_runbook/runbooks/RB-006`、`.session-state/` 配下のスキーマ)。
- 1-session-1-task 規律 (`45_runbook/runbooks/RB-007`)。
- 自律判断フレームワーク (`45_runbook/runbooks/RB-003`、L0/L1/L2 階層)。
- 初回 SDD ブートストラップ (`45_runbook/runbooks/RB-009`)。

### Notes
- v0.1.0 は試行錯誤期。`30_sdd-phase/` `35_tdd-phase/` の汎用化精査 (HW-F) は未完。
- 別ユーザーでの 3 ステップ導入再現性確認は未実施。

## 出典

- [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/) (retrieved 2026-06-24)
- [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html) (retrieved 2026-06-24)
- 本パッケージ `45_runbook/runbooks/RB-008-branch-strategy-and-semver.md`

## 不確実性

- (前提) v1.0.0 のリリース日は HW-D / HW-F 完了後に確定する。
- (未検証) 別ユーザーでの 3 ステップ導入は v1.0.0 リリース判定基準の 1 つだが、本 changelog 作成時点では未実施。
