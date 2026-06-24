---
last_updated: 2026-06-24
session_count: 8
schema: RB-006
branch: develop
---

# PENDING - 未完了宿題 (ecc-method 開発)

このファイルは **ecc-method パッケージ自身の開発・整備用**。`develop` branch でのみ追跡される。
配布版 (`main` branch) には含めない。

---

## 宿題: HW-D - Method v1.0 リリース整理

- **状態**: completed (Session 3、2026-06-24)
- **完了詳細**: COMPLETED.md 参照
- **後続タスク**: v1.0.0 tag 切りは `99_distribution/03_v1.0.0-release-checklist.md` の checklist が全て満たされたタイミングで実施 (HW-F 完了が前提)。

---

## 宿題: HW-F - SDD/TDD 章の汎用化精査

- **状態**: in_progress (Session 5 で 2/11 章完了)
- **優先度**: P1 (本来の北極星に最も直結)
- **着手条件**: なし
- **完了基準**:
  - 30_sdd-phase / 35_tdd-phase の各章を読み返し
  - 「案件依存」「実機未検証」「出典なし」の箇所を洗い出し
  - 案件依存箇所は examples/ に隔離
  - 実機未検証は検証題材で運用 → フィードバックを章に反映
  - 出典なし主張は L1 出典付与 or 削除
  - 各章末尾の「不確実性」セクションを更新
- **担当 expert role**: planner / architect / agent-evaluator / refactor-cleaner
- **メモ**: 本来のゴール「SDD/TDD 汎用化」の主作業。
- **進捗** (1 セッション 1 章規律):
  - ✅ Session 4: `30_sdd-phase/01_prd-flow.md` (Gate 1 参照先誤り修正、specs/ 配置を推奨化、不確実性 5 項目に拡充)
  - ✅ Session 5: `30_sdd-phase/02_feature-id-rules.md` (プレフィックス D→B でトレーサビリティ章 D<NN>-A との grep 衝突回避、出典区分明示、不確実性 5 項目に拡充)
  - ⏳ 残: 30_sdd-phase/03-06 (4 章) + 35_tdd-phase/01-05 (5 章) = 9 章

---

## 宿題: HW-B - RB-005 検証 (Hooks 経由のリアルタイム subagent 観測)

- **状態**: completed (Session 7、2026-06-24)
- **完了詳細**: COMPLETED.md 参照

---

## 宿題: HW-J - 配布テンプレに Knowledge Vault 駆動規律を実装

- **状態**: completed (Session 8、2026-06-24)
- **完了詳細**: COMPLETED.md 参照

---

## 宿題: HW-K - Session 7 残骸 commit 化 (RB-005 配布物 + CodeGraph 同期)

- **状態**: not_started
- **優先度**: P1 (整合漏れ、未 commit が config 不整合源)
- **着手条件**: なし
- **背景**:
  - Session 7 終了時 (`current_session.md` status: completed) にも関わらず
    [.template-claude/commands/](.template-claude/commands/) [.template-claude/hooks/](.template-claude/hooks/) [.template-claude/settings.json](.template-claude/settings.json) が untracked のまま
  - [40_delegation/04_orchestrator-system-prompt.md](40_delegation/04_orchestrator-system-prompt.md) [45_runbook/INDEX.md](45_runbook/INDEX.md) [45_runbook/_index/](45_runbook/_index/) [45_runbook/runbooks/RB-004-subagent-final-report-narration.md](45_runbook/runbooks/RB-004-subagent-final-report-narration.md) [45_runbook/runbooks/RB-005-subagent-realtime-streaming-via-hooks.md](45_runbook/runbooks/RB-005-subagent-realtime-streaming-via-hooks.md) [99_distribution/03_v1.0.0-release-checklist.md](99_distribution/03_v1.0.0-release-checklist.md) [_index/concept-graph.json](_index/concept-graph.json) [CHANGELOG.md](CHANGELOG.md) が Session 7 編集分のまま unstaged
  - Session 8 ではユーザー要請 (Knowledge Vault 配布) のみに集中し、Session 7 残骸は **CLOSURE GATE で 1 行残置判定** (本セッションのスコープと混ぜ込みを避けるため別 commit が安全 / RB-006 §[0])
- **完了基準**:
  - Session 7 当初の意図 (HW-B 完了 + 配布テンプレ CodeGraph 同期) を 1 commit で確定
  - CHANGELOG の Session 7 行が反映済であることを確認
  - 整合確認 (主に RB-005 deprecated 連動: RB-004 の上部注記 + INDEX / by-category / by-tag / by-trigger の status 同期)
- **担当 expert role**: 主 Claude / 必要に応じて code-reviewer

---

## 宿題: HW-C - Phase 4-7 段階導入 (インデックス frontmatter / Concept Graph)

- **状態**: not_started
- **優先度**: P3 (余力があれば)
- **着手条件**: HW-D 完了後
- **完了基準**:
  - Phase 4: 全 md に keywords frontmatter
  - Phase 5: _index/concept-graph.json
  - Phase 6: 45_runbook/_index/ 二段化
  - Phase 7: Orchestrator prompt の検索プロトコル更新

---

## 宿題: HW-H - セッションクローズ時の視覚マーキング規律 (RB-010 候補)

- **状態**: not_started
- **優先度**: P3 (運用 UX 改善、緊急度低)
- **着手条件**: HW-D / HW-F の主要進捗後
- **背景**:
  - クローズ済みセッションを後から見返すとき、タイトルだけでは閉じたか判別できない
  - Claude Code には agent からタイトル書き換える公式 API が無い (2026-06-24 時点、未検証)
  - 実機調査結果 (Session 1 2026-06-24):
    - `~/.claude/projects/<repo>/<sessionId>.jsonl` に summary / title キー無し
    - `~/.claude/sessions/*.json` は実行プロセス追跡用、タイトル管理外
    - VS Code 拡張のタイトルは `~/AppData/Roaming/Code/User/globalStorage/state.vscdb` (SQLite) に保存されている可能性大
    - SQLite 直接書き換えは VS Code 起動中ロック + 整合性破壊リスクで事実上不可
  - 当面の運用: タイトル変更は **UI 上で手動** (右クリック → リネーム or 鉛筆アイコン)
- **完了基準**:
  - Anthropic 公式 API でタイトル書き換えが可能か再検証
  - 可能 → agent が自動付与する規律を RB-010 に
  - 不可能 → ユーザー手動付与を依頼する規律を RB-010 に (RB-003 自律判断との折衷案)
  - RB-006 終了時プロトコルに統合
- **担当 expert role**: orchestrator / docs-lookup
- **メモ**: ユーザー提案 (2026-06-24, "[クローズ] 元のタイトル に出来る?")。即時実装ではなく規律化候補。

---

## 索引

| ID | 状態 | 優先度 | タイトル |
|---|---|---|---|
| HW-D | completed | P1 | Method v1.0 リリース整理 (Session 3 完了、COMPLETED.md 参照) |
| HW-I | completed | P1 | self-dogfooding junction 統合 (Session 6 完了、COMPLETED.md 参照) |
| HW-B | completed | P2 | RB-005 検証 + RB-004 deprecated + Orchestrator hook 統合 (Session 7 完了、COMPLETED.md 参照) |
| HW-J | completed | P2 | 配布テンプレに Knowledge Vault 駆動規律を実装 (Session 8 完了、COMPLETED.md 参照) |
| HW-K | not_started | P1 | Session 7 残骸 commit 化 (RB-005 配布物 + CodeGraph 同期、未 commit のまま) |
| HW-F | in_progress | P1 | SDD/TDD 章の汎用化精査 (2/11 章完了、Session 4: 01_prd-flow / Session 5: 02_feature-id-rules) |
| HW-C | not_started | P3 | Phase 4-7 段階導入 |
| HW-H | not_started | P3 | セッションクローズ時の視覚マーキング (RB-010 候補) |

## 次セッション着手フロー (agent 自動実行)

1. 本ファイルを Read (RB-006 起動時必須)
2. INDEX.md を Read
3. current_session.md / HISTORY.md を Read (Session 8 終了時点: HW-D / HW-I / HW-B / HW-J 完了、HW-K 残置、HW-F 2/11 章完了)
4. ユーザーには「前回までに HW-J 完了 (配布テンプレ Knowledge Vault 駆動規律)。次は HW-K (Session 7 残骸 commit 化) を最優先、続いて HW-F (推奨: 30_sdd-phase/03_requirements-template または 35_tdd-phase/01_red-green-refactor)」を 1 行で通知

## 注意 (本リポ MVP との関係)

本リポ MVP (`C:/Users/tie209174/Documents/GitHub/企業情報収集/`) の `.session-state/` には別の HW-A (MVP 稼働) が登録されている。これは **検証題材としての作業**であり、本パッケージ (ecc-method) の主目的ではない。両者を混同しないこと。
