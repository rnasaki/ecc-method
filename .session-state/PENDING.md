---
last_updated: 2026-06-24
session_count: 0
schema: RB-006
branch: develop
---

# PENDING - 未完了宿題 (ecc-method 開発)

このファイルは **ecc-method パッケージ自身の開発・整備用**。`develop` branch でのみ追跡される。
配布版 (`main` branch) には含めない。

---

## 宿題: HW-G - 全体プロセス再設計 (`.session-state/` の役割と初回フロー)

- **状態**: ⚠️ 部分完了 (設計確定 + 主要実装、残: RB-006/007 改訂・README 書き直し・30_sdd-phase 整合)
- **優先度**: P0
- **本セッション (2026-06-24, ecc-method develop) で完了した内容**:
  - ✅ `.handover/` → `.session-state/` ディレクトリ rename
  - ✅ `_handover_template/` → `_session-state-template/` rename
  - ✅ 全 17 ファイルで `.handover` → `.session-state` 一括置換
  - ✅ Orchestrator system prompt の起動時必須プロトコル書き直し (新規プロジェクト初回 = SDD ヒアリング起点)
  - ✅ ~/.claude/agents/ecc-orchestrator.md 同期
  - ✅ RB-009 (初回起動の SDD ヒアリングフロー) を新規 Runbook として永続化
  - ✅ INDEX.md に RB-009 追記
- **次セッション以降の残作業 (HW-G 完了基準のうち未完)**:
  - RB-006 (旧「セッション引き継ぎプロトコル」) を「セッション状態プロトコル」として書き直し
  - RB-007 内の `.handover` 旧表現がもしあれば整合確認
  - 30_sdd-phase / 35_tdd-phase の章を初回ヒアリングフローと整合
  - README Step 3 を再設計版に書き直し (利用者は `.session-state/` を手動コピーしない、agent が自動生成)
  - .template-agents/ 内の README 参照も整合
- **担当 expert role**: doc-updater / architect / orchestrator
- **影響範囲**: 中 (RB-006/007 + README + 30_sdd-phase/35_tdd-phase 整合)
- **メモ**: 設計の核心は確定。残りは概念に合わせた既存ドキュメント整合作業。1 セッション 1 タスク原則で次セッション以降に分割実施。

---

## 宿題: HW-E - Branch / semver / 配布規律 (RB-008) を永続化

- **状態**: ✅ 完了 (本セッション 2026-06-24)
- **完了 commit**:
  - main: `31f42e0` (.gitignore) / `a9fae53` (README version note) / tag `v0.1.0`
  - develop: `96229db` (.handover 追加) / `4cd970e` (RB-008 永続化)
- **メモ**: COMPLETED.md に移送予定。次セッションで詳細を移送。

---

## 宿題: HW-D - Method v1.0 リリース整理

- **状態**: not_started
- **優先度**: P1 (HW-E 完了後)
- **着手条件**: HW-E (Branch 規律) 完了
- **完了基準**:
  - 採番の意味再定義 (現状: 試行錯誤で隙間に詰めた `27` `45` `85` 等が混在)
  - 章の論理順を確定し、ディレクトリ採番を整列 or 採番自体を廃止
  - 全リンク (md 内・agent prompt 内・テンプレ内) を一括張替え
  - CHANGELOG.md を整備し v1.0.0 として版を切る
  - LICENSE / README / 99_distribution/ を v1.0 確定形に更新
- **担当 expert role**: architect / refactor-cleaner / doc-updater
- **背景**: 採番が意味を持たない数字になっている、リリース整理プロセスが欠落 (Session 1 終盤の指摘)

---

## 宿題: HW-F - SDD/TDD 章の汎用化精査

- **状態**: not_started
- **優先度**: P1 (本来の北極星に最も直結)
- **着手条件**: なし (HW-E / HW-D と並列実施可)
- **完了基準**:
  - 30_sdd-phase / 35_tdd-phase の各章を読み返し
  - 「案件依存」「実機未検証」「出典なし」の箇所を洗い出し
  - 案件依存箇所は examples/ に隔離
  - 実機未検証は検証題材で運用 → フィードバックを章に反映
  - 出典なし主張は L1 出典付与 or 削除
  - 各章末尾の「不確実性」セクションを更新
- **担当 expert role**: planner / architect / agent-evaluator / refactor-cleaner
- **メモ**: 本来のゴール「SDD/TDD 汎用化」の主作業。HW-E (規律) と HW-D (整理) が先行、その後 HW-F が本番。

---

## 宿題: HW-B - RB-005 検証 (Hooks 経由のリアルタイム subagent 観測)

- **状態**: not_started
- **優先度**: P2
- **着手条件**: HW-E / HW-F の進捗で残 budget があるとき
- **完了基準**:
  - RB-005 §「検証手順」の [1]〜[10] を実行
  - RB-005 status を draft → active or deprecated へ確定
  - 動作した場合: RB-004 を deprecated 化、Orchestrator system prompt に hook 設定を組み込み
- **担当 expert role**: orchestrator / explorer-research

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
- **着手条件**: HW-G / HW-D / HW-F の主要進捗後
- **背景**:
  - クローズ済みセッションを後から見返すとき、タイトルだけでは閉じたか判別できない
  - Claude Code には agent からタイトル書き換える公式 API が無い (2026-06-24 時点、未検証)
  - 実機調査結果 (本セッション 2026-06-24):
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
| HW-G | ⚠️ 部分完了 | P0 | 全体プロセス再設計 (残: RB-006 改訂・README・30_sdd-phase 整合) |
| HW-E | ✅ 完了 | - | Branch / semver / 配布規律 (RB-008) |
| HW-D | not_started | P1 | Method v1.0 リリース整理 (HW-G 完了後) |
| HW-F | not_started | P1 | SDD/TDD 章の汎用化精査 (HW-G 完了後) |
| HW-B | not_started | P2 | RB-005 検証 (Hooks リアルタイム subagent 観測) |
| HW-C | not_started | P3 | Phase 4-7 段階導入 |
| HW-H | not_started | P3 | セッションクローズ時の視覚マーキング (RB-010 候補) |

## 次セッション着手フロー (agent 自動実行)

1. 本ファイルを Read (RB-006 起動時必須)
2. INDEX.md を Read
3. current_session.md を Read (HW-G 残実装が pending_start)
4. ユーザーには「前回からの継続: HW-G 残実装 (RB-006 改訂・README) から着手」を 1 行で通知

## 注意 (本リポ MVP との関係)

本リポ MVP (`C:/Users/tie209174/Documents/GitHub/企業情報収集/`) の `.session-state/` には別の HW-A (MVP 稼働) が登録されている。これは **検証題材としての作業**であり、本パッケージ (ecc-method) の主目的ではない。両者を混同しないこと。
