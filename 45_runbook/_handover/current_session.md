---
schema: RB-007
session_id: 2 (次セッション、未開始)
created_at: 2026-06-24 (Session 1 終盤に雛形作成)
last_updated: 2026-06-24
status: pending_start
---

# Current Session - 現セッションのフォーカス

このファイルは **現セッションで集中する 1 タスク** を定義する。
セッション開始時に agent が新規作成 / 前回未完了なら更新する。

---

## ターゲットタスク (1 つ)

PENDING.md の **HW-A 段階 2 テスト** に着手する。
ただし HW-A は規模大きいため、初回セッションでは **HW-A の中の最小実装単位** に絞る。

### 推奨初回着手 (Session 2 での最小単位)

**HW-A.1 - `backend/app/llm/anthropic_client.py` の NotImplementedError 解消**

理由:
- 5 件の未実装箇所のうち、依存関係が他に波及しない (LLM client 単体)
- TDD で書ける (mock + integration test)
- 30_sdd-phase の req → design → tasks → TDD → verify を 1 機能で完走できる規模

(別案: tagging.py / input_validator.py / official_finder.py / rag.py のいずれかでも可。
agent が PENDING.md の既知未実装箇所と本リポの test 構造を見て自律判断する)

## 完了条件

- [ ] HW-A.1 のサブタスク完了基準を REQ 形式で `_tmp/session_2_req.md` に書き出し
- [ ] design (interface / 依存関係) を書き出し
- [ ] failing test を書く (Red)
- [ ] 最小実装でテストを通す (Green)
- [ ] リファクタ (Refactor)
- [ ] 該当モジュールの coverage ≥ 80%
- [ ] lang-reviewer (python-reviewer) で独立レビュー通過
- [ ] Quality Gate (60_quality-gates/07_gate-checklist.md) 通過
- [ ] 本リポへ commit (push は ASK 該当のためこのセッションでは保留可)

## このセッションで触らないもの (スコープ外宣言)

- HW-A.2〜HW-A.5 (他の未実装箇所): 次セッション以降
- HW-B (RB-005 検証): HW-A 完了後または並列セッション
- HW-C (Phase 4-7): 本案件のサブゴール 5 まで保留
- ecc-method パッケージへの追加機能 (本タスク中に発見した knowhow のみ Runbook 化)
- frontend / e2e ディレクトリ (UI は完成済との前提)

## TODO (作業手順、agent が更新)

1. (未開始) GOAL.md を Read してゴール確認
2. (未開始) PENDING.md / INDEX.md / RB-007 を Read
3. (未開始) HW-A 対象ファイルの現状調査 (Pattern P-004 Discovery)
4. (未開始) HW-A.1 の req → design → tasks 作成
5. (未開始) TDD ループ実行
6. (未開始) Quality Gate 通過確認
7. (未開始) 本リポ commit、PENDING/COMPLETED/HISTORY 更新

## 進捗ログ (中断・再開用)

(未開始)

## 再開ポイント (セッション中断時に agent が記録)

(セッション開始前のため未記入)

## このセッションの不確実性

- HW-A.1 は規模 30 分〜2 時間と推定。実測で大幅に超える場合は分割
- Anthropic Claude SDK の Python 実装方法は公式 docs を確認してから決定
- 既存 `backend/app/llm/factory.py` `stub.py` のインターフェースに合わせる必要あり (実装前に確認)

## 関連

- GOAL.md (本案件全体のゴール)
- PENDING.md (HW-A の詳細)
- ../runbooks/RB-007-1-session-1-task.md (本セッション運営の規律)
