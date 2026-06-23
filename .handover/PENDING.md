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

## 宿題: HW-G - 全体プロセス再設計 (`.handover/` の役割と初回フロー)

- **状態**: not_started
- **優先度**: P0 (本セッション 2026-06-24 で発覚した概念矛盾、最優先で解消)
- **着手条件**: なし。次セッションの最初の 1 タスクとして集中実施
- **背景 (本質的問題)**:
  - 現状の `.handover/` は「引き継ぎ資料 (前回の続き)」として設計されている
  - しかし配布した利用者の **初回実行** には引き継ぐべき過去が無い
  - 正しくは `.handover/` は **SDD/TDD プロセスを回した結果の中間成果物**:
    - 初回: agent が対話で SDD を始める → GOAL.md / PENDING.md / current_session.md が **生成される**
    - 2 回目以降: 生成済みファイルを Read して継続
  - 「ハンドオーバー (引き継ぎ)」という命名・概念設計が誤りだった
- **完了基準 (再設計の範囲)**:
  - `.handover/` の役割を「引き継ぎ」から「SDD/TDD 中間成果物 / セッション状態」に再定義
  - ファイル/ディレクトリ名の見直し (`.handover/` → `.session-state/` 等の候補検討、命名は最後に決定)
  - 初回実行フローの設計:
    - agent が対話で案件ヒアリング (何を作るか / ユーザー / 成功条件)
    - ヒアリング結果から GOAL.md を生成
    - PRD → requirements → design → tasks の SDD 過程で PENDING/current_session が生成される
  - 2 回目以降の継続フロー: 既存 SDD 成果物を Read して再開 (現状動作と整合)
  - Orchestrator system prompt の起動時必須プロトコル書き直し:
    - 「`.handover/` 不在 → 雛形コピー + ユーザー記入要求」(現状) を廃止
    - 「`.handover/` 不在 → SDD 開始 (ヒアリングから)」に変更
  - RB-006 / RB-007 を再設計に合わせて書き直し
  - 30_sdd-phase / 35_tdd-phase の章を再設計に合わせて整合
  - README の Step 3 (.handover 初期化) を再設計版に書き直し
  - 既存 HW-D / HW-F との関係整理:
    - HW-G 完了後に HW-D (採番再定義) / HW-F (SDD/TDD 章汎用化精査)
    - HW-G が前提
- **担当 expert role**: planner (Opus) / architect / doc-updater / orchestrator
- **影響範囲**: 大 (Orchestrator prompt + RB-006/007 + 30_sdd-phase/35_tdd-phase + README + .template-agents/)
- **メモ**: 本セッション (2026-06-24) でユーザーから「初回実行でハンドオーバ読み込ませるのはおかしい / 初回は SDD/TDD で中間アウトプットとして引継ぎ資料ができる」との指摘を受け概念矛盾が発覚。配布前に必ず解消すべき根本問題。HW-D / HW-F は HW-G 完了が前提。

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

## 索引

| ID | 状態 | 優先度 | タイトル |
|---|---|---|---|
| HW-G | not_started | P0 | **全体プロセス再設計 (`.handover/` の役割と初回フロー)** |
| HW-E | ✅ 完了 | - | Branch / semver / 配布規律 (RB-008) |
| HW-D | not_started | P1 | Method v1.0 リリース整理 (HW-G 完了後) |
| HW-F | not_started | P1 | SDD/TDD 章の汎用化精査 (HW-G 完了後) |
| HW-B | not_started | P2 | RB-005 検証 (Hooks リアルタイム subagent 観測) |
| HW-C | not_started | P3 | Phase 4-7 段階導入 |

## 次セッション着手フロー (agent 自動実行)

1. 本ファイルを Read (RB-006 起動時必須)
2. INDEX.md を Read
3. P0 宿題 (HW-E) から自律着手
4. ユーザーには「前回からの継続: HW-E Branch 規律から着手」を 1 行で通知

## 注意 (本リポ MVP との関係)

本リポ MVP (`C:/Users/tie209174/Documents/GitHub/企業情報収集/`) の `.handover/` には別の HW-A (MVP 稼働) が登録されている。これは **検証題材としての作業**であり、本パッケージ (ecc-method) の主目的ではない。両者を混同しないこと。
