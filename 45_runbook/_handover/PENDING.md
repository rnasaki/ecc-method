---
last_updated: 2026-06-24
session_count: 1
schema: RB-006
---

# PENDING - 未完了宿題

このファイルは Orchestrator agent が **セッション開始時に必ず Read** し、**終了時に必ず更新** する宿題リストの SSOT。

詳細は [../runbooks/RB-006-session-handover-protocol.md](../runbooks/RB-006-session-handover-protocol.md) を参照。

---

## 宿題: HW-A - 段階 2 テスト (本リポ MVP の要求仕様稼働)

- **状態**: not_started
- **優先度**: P0
- **着手条件**: なし (即着手可)
- **完了基準**:
  - 受入基準 (`C:/Users/tie209174/Documents/GitHub/企業情報収集/company-research-prompts/04_acceptance_criteria.md`) の各項目について pass / fail を数値報告
  - Quality Gate 通過率を最終 final report に含める
  - 既知の未実装箇所 (下記) のうち 1 件以上を 30_sdd-phase で完走実装
- **対象リポ**: `C:/Users/tie209174/Documents/GitHub/企業情報収集/`
- **要求仕様**: `./company-research-prompts/01_sdd_spec.md`
- **既知の未実装箇所**:
  - `backend/app/llm/anthropic_client.py` (NotImplementedError)
  - `backend/app/services/input_validator.py` (stub)
  - `backend/app/collectors/official_finder.py` (検索 API 未実装)
  - `backend/app/composer/tagging.py` (LLM 呼び出し未統合 / TODO 多数)
  - `backend/app/api/routers/rag.py` (stub レスポンス)
- **関連 Runbook**: なし (本宿題で蓄積されていく)
- **担当 expert role**: planner / architect / tdd-guide / fastapi-reviewer / python-reviewer
- **メモ**: ecc-method の完成度評価が目的。1 機能を 30_sdd-phase で完走させるだけでも段階 2 として有効。受入基準全件 pass は P1 扱いでよい (まず 1 機能完走)。

---

## 宿題: HW-B - RB-005 検証 (Hooks 経由のリアルタイム subagent 観測)

- **状態**: not_started
- **優先度**: P1
- **着手条件**: HW-A の途中でも独立検証可能。並列実行推奨
- **完了基準**:
  - RB-005 §「検証手順 (次セッションで実施)」の [1]〜[10] を実行
  - RB-005 status を draft → active (動作した場合) または draft → deprecated (動作しなかった場合) へ確定
  - 動作した場合: RB-004 を deprecated 化、Orchestrator system prompt に hook 設定を組み込み
  - 動作しなかった場合: 棄却理由を RB-005 §「検証結果の記録欄」に明記
- **関連 Runbook**: RB-005 (本検証対象)、RB-004 (本検証で deprecated 化候補)
- **担当 expert role**: orchestrator / explorer-research
- **メモ**: ユーザー当初不満 (「subagent の振る舞いが見えない」「Codex 風中間出力が無く不安」「長時間放置で NG ケース多発」) の本質解決ルート。HW-A より先行して検証する選択肢もある (検証結果が HW-A の subagent 起動方針を変える可能性)。

---

## 宿題: HW-C - Phase 4-7 段階導入 (インデックス frontmatter / Concept Graph / 検索プロトコル更新)

- **状態**: not_started
- **優先度**: P2 (余力があれば)
- **着手条件**: HW-A / HW-B の進捗で残 token budget が十分にあるとき
- **完了基準**:
  - Phase 4: 全 md (130+) に `keywords:` frontmatter
  - Phase 5: `_index/concept-graph.json` 作成
  - Phase 6: `45_runbook/_index/` 二段化 (Runbook 件数 ≥ 10 が前提)
  - Phase 7: Orchestrator system prompt の検索プロトコル更新 (grep 廃止、index → graph → 個別ファイル)
- **関連 Runbook**: RB-002 (本宿題の計画書)
- **担当 expert role**: architect / refactor-cleaner / orchestrator
- **メモ**: 影響範囲大 (130+ ファイル)。HW-A / HW-B 完了前に着手すると context 枯渇リスク。

---

## 索引

| ID | 状態 | 優先度 | タイトル |
|---|---|---|---|
| HW-A | not_started | P0 | 段階 2 テスト (本リポ MVP の要求仕様稼働) |
| HW-B | not_started | P1 | RB-005 検証 (Hooks 経由のリアルタイム subagent 観測) |
| HW-C | not_started | P2 | Phase 4-7 段階導入 |

## 次セッション着手フロー (agent 自動実行)

1. 本ファイルを Read (RB-006 起動時必須)
2. INDEX.md (`../INDEX.md`) を Read
3. P0 宿題 (HW-A) から自律着手
4. ユーザーには「前回からの継続: HW-A 段階 2 テストから着手します」を 1 行で通知
5. 完了したら本ファイル + COMPLETED.md + HISTORY.md を更新、commit + push
