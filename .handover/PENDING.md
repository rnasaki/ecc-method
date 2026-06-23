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

## 宿題: HW-E - Branch / semver / 配布規律 (RB-008) を永続化

- **状態**: not_started
- **優先度**: P0 (本セッションで方針決定済、規律として永続化が必要)
- **着手条件**: なし
- **完了基準**:
  - RB-008 (Release Discipline) を `45_runbook/runbooks/` に作成
  - 内容: branch 戦略 (main / develop) / semver / `.gitignore` 規約 / リリース手順 / CHANGELOG
  - main の `.gitignore` に `.handover/` `_tmp/` 等を追加
  - develop は `.handover/` を追跡対象として保持
  - main に v0.1.0 tag を付与 (現状を初期版として固定)
  - README に branch / version 説明を追加 (利用者は main を clone するだけで配布版が取れる)
- **担当 expert role**: doc-updater / architect / orchestrator
- **メモ**: 本セッション (2026-06-24) でユーザーから「配布物に .handover が混入する、Git ベスプラに従って」の指摘を受け方針確定。GitFlow 風の branch 分離 + semver tag 採用。

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
| HW-E | not_started | P0 | Branch / semver / 配布規律 (RB-008) |
| HW-D | not_started | P1 | Method v1.0 リリース整理 |
| HW-F | not_started | P1 | SDD/TDD 章の汎用化精査 |
| HW-B | not_started | P2 | RB-005 検証 (Hooks リアルタイム subagent 観測) |
| HW-C | not_started | P3 | Phase 4-7 段階導入 |

## 次セッション着手フロー (agent 自動実行)

1. 本ファイルを Read (RB-006 起動時必須)
2. INDEX.md を Read
3. P0 宿題 (HW-E) から自律着手
4. ユーザーには「前回からの継続: HW-E Branch 規律から着手」を 1 行で通知

## 注意 (本リポ MVP との関係)

本リポ MVP (`C:/Users/tie209174/Documents/GitHub/企業情報収集/`) の `.handover/` には別の HW-A (MVP 稼働) が登録されている。これは **検証題材としての作業**であり、本パッケージ (ecc-method) の主目的ではない。両者を混同しないこと。
