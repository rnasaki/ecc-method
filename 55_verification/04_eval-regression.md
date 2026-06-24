---
keywords: [verification, eval, regression]
related: []
---
# 04 Eval / Regression Detection — agent 出力の時系列劣化を検知する

retrieved_at: 2026-06-23

本章は、agent の出力品質が時間とともに劣化していないかを継続的に監視する仕組み (continuous eval) を独立章として確立する。 spec-code drift については `02_drift-detection.md` で扱っているが、agent 出力 drift はこれまで未対応であり、本章でカバーする。

---

## 1. なぜ継続 eval が必要か

agent は以下の理由で、**同じプロンプト・同じモデル指定でも挙動が変わる**:

- モデル世代の更新 (provider 側のサイレント差し替え、ルーティング変更)
- skill / agent 定義ファイルの編集 (ロール記述・rubric の改修)
- tool 群の差し替え (MCP サーバ更新、tool 説明文の変更)
- 上流データソース (検索 index、社内 KB) の構造変化

これらは単発テストでは見えにくく、**「気づいたら品質が落ちていた」** という劣化を生む。継続 eval はこの劣化を **定量的・時系列で** 早期検知する仕組みである。

---

## 2. eval の単位

| 単位 | 対象 | 主な目的 |
|---|---|---|
| Unit eval | 1 task / 1 expected output に対する rubric 採点 | プロンプト・skill 単体の品質確認 |
| Integration eval | 複数 agent ハンドオフ後の最終出力 | orchestrator 経路 (BP-021) の整合確認 |
| E2E eval | 実 workflow 全体の完走率と最終成果物 | デモ・本番経路の健全性 |
| Regression eval | 過去 baseline 結果との差分 | 劣化検知 (本章の主目的) |

すべての eval は **再現可能な dataset** と **固定 rubric** を持ち、結果はバージョン付きで保存する。

---

## 3. リーダー側の仕組み (Anthropic / OpenAI)

### 3.1 Anthropic Console Evaluation tool (公式)

公式ドキュメントで以下を確認 (retrieved_at: 2026-06-23):

- prompt editor 上に **Evaluate タブ** があり、`{{variable}}` 構文で test set を作れる
- test case の **手動追加 / 自動生成 / CSV import** に対応
- **side-by-side comparison**, **5-point quality grading**, **prompt versioning** をサポート
- prompt を更新したら test suite を再実行して影響を確認できる

→ ECC では「prompt 単体回帰」のリファレンス UX として参照する。

### 3.2 OpenAI Agents SDK tracing (公式)

公式ドキュメントで以下を確認 (retrieved_at: 2026-06-23):

- agent 実行時の **LLM 生成・tool call・handoff・guardrail** を自動キャプチャ
- `add_trace_processor()` / `set_trace_processors()` で送出先を差し替え可能
- 25+ の third-party 観測基盤 (W&B, Langfuse, LangSmith, Datadog 等) と統合できる

→ ECC では「実行 trace を蓄積し、後から eval にかける」ための参考実装。

### 3.3 LLM judge と人間 spot-check の併用 (BP-026)

- rubric を構造化 (例: 5 軸 = accuracy / completeness / clarity / actionability / conciseness) し LLM judge で採点
- judge 自体が drift する前提で、**毎週 N% を人間 spot-check** し judge の bias を補正
- judge と人間の不一致率が閾値超なら judge prompt を再校正

---

## 4. ECC 実装

### 4.1 既存仕組みとの違い

| 仕組み | 役割 | 周期 |
|---|---|---|
| `60_quality-gates/06_red-team-loop.md` | 1 ショットの adversarial verify (gate 通過時) | リクエスト毎 |
| `55_verification/02_drift-detection.md` | spec ↔ code の整合性 | コミット毎 |
| **本章 (eval-regression)** | agent 出力の時系列品質モニタリング | 日次 + PR 毎 |
| `75_self-evolution/06_health-metrics.md` | 運用 KPI 集約 | 週次 |

red-team は「今この瞬間の出力を叩く」、eval-regression は「品質が落ちていないか時系列で見る」。両者は補完関係。

### 4.2 CI 組込み

- PR を起点に **fast eval (Unit + Integration の縮小版)** を実行
- 主要 rubric 軸の score が baseline から `> 5%` 低下したら **block**
- `main` への merge 後、夜間に **full eval (Regression を含む)** を実行
- 結果を `75_self-evolution/06_health-metrics.md` のメトリクス群に流し込み、週次レポートに合流

### 4.3 baseline の固定とロールアウト

- baseline は **タグ付き snapshot** として凍結 (例: `eval-baseline-v3`)
- baseline 更新は PR レビュー必須 (閾値を下げてやり過ごす運用を防ぐ)
- 新モデル導入時は **shadow eval** を 1 週間以上回し、回帰がないことを確認

---

## 5. データセット維持

- eval dataset は バージョン管理対象 (`evals/datasets/<name>/v<N>/`)
- 出典・生成日時・収集者ロール・ライセンス区分を **manifest** に明記
- 実本番ログから sampling して dataset を拡充 (coverage 向上)
- **PII redact 必須**: 取り込み前に氏名・連絡先・社内 ID をマスク (BP-007 と整合)
- 個人名・組織名・絶対パスは dataset にも残さない
- dataset 自体に **ゴールデン解** を持つ場合、定期的に妥当性レビューを行い陳腐化を防ぐ

---

## 6. アンチパターン

| アンチパターン | 起こること | 対策 |
|---|---|---|
| eval を一回作って放置 | dataset が陳腐化、現実の入力分布と乖離 | quarterly で sampling 拡充 |
| LLM judge のみ・人間 spot-check 不在 | judge 自体の drift を検知できない | 毎週 N% 抜き取り人間レビュー |
| 回帰検知時に閾値を下げてやり過ごす | 静かに品質が下がり続ける | 閾値変更は PR レビュー必須・履歴を残す |
| baseline をこまめに上書き | 「いつから悪化したか」が消える | tagged snapshot として凍結 |
| 全 eval を本番経路と同じ依存に | 上流障害で eval も巻き添え | mock + 実依存の二系統で運行 |
| 採点 rubric が曖昧 | judge の score が安定しない | 軸ごとに 0–4 の anchor 例を文書化 |

---

## 7. メトリクス

eval 実行ごとに以下を記録し、時系列ダッシュボードに流す:

- **通過率**: rubric 全軸が閾値以上だった test case の割合
- **平均スコア**: rubric 軸別の平均 (5 軸独立に追跡)
- **rubric 軸別 score 推移**: accuracy / completeness / clarity / actionability / conciseness の trend
- **p95 latency**: 1 test case 完走までの所要時間
- **cost**: token 使用量 × 単価 (input / output 内訳)
- **judge–human agreement rate**: spot-check 時の一致率 (judge bias 監視用)
- **dataset coverage**: 想定入力カテゴリのうち eval が触っている割合

これらを `75_self-evolution/06_health-metrics.md` に集約し、週次レビューで「悪化軸が無いか」を確認する。

---

## 出典

- L1: Anthropic 公式 — Claude Console Evaluation tool ドキュメント (retrieved_at: 2026-06-23)
  - https://docs.claude.com/en/docs/test-and-evaluate/eval-tool
  - 内容: Evaluate タブ、test case 生成・CSV import、side-by-side、5-point grading、prompt versioning
- L1: OpenAI 公式 — Agents SDK tracing ドキュメント (retrieved_at: 2026-06-23)
  - https://openai.github.io/openai-agents-python/tracing/
  - 内容: LLM 生成・tool call・handoff・guardrail の自動 trace、processor 差し替え、third-party 観測基盤統合
- L1: Anthropic 公式 (旧パス、リダイレクト後 404 を確認) — `https://docs.claude.com/en/docs/build-with-claude/evaluations` は現在 `platform.claude.com` 系へ転送され 404 を返す。Console UI ベースの正規ドキュメントは上記 `eval-tool` ページ。**「Evals API」という名称の単体プログラム API は本日の確認では正式な公式ページに到達できず、未検証**。
- L2: ECC 内部参照 — `60_quality-gates/06_red-team-loop.md`, `55_verification/02_drift-detection.md`, `75_self-evolution/06_health-metrics.md`
- L3: 慣行 — rubric ベース LLM judge + 人間 spot-check 併用は BP-026 として ECC 内で運用

---

## 不確実性

- **「Anthropic Evals API」という名称のプログラム API**: 本日 (2026-06-23) の WebFetch では Console 上の Evaluation tool ドキュメントのみ確認でき、独立した REST/SDK としての「Evals API」は **未検証**。プログラム経由で叩く場合は SDK 直接呼出 + 自前 runner で代替可能。
- **OpenAI 側の評価機能**: tracing はドキュメント確認済みだが、「Evals」という独立 SaaS 機能の API 仕様までは本章では確認していない。CI 組込みする場合は別途公式リファレンスで再検証すること (retrieved_at を更新)。
- **閾値設計 (regression block の `> 5%` 低下)**: 業界横断のベンチマークではなく ECC 初期値。半期ごとに見直し前提。
- **judge–human agreement の許容下限**: 文献値の幅が大きく、ECC では暫定で 0.7 (Cohen's kappa 換算) を初期値としているが、実運用データで再校正する。
- **dataset の sampling 比率**: 本番ログからの取り込み割合は PII redact 工程の負荷とトレードオフ。本章では具体値を固定しない。
- 本章は「仕組みの章」であり、具体的な runner 実装 (CLI / CI スクリプト) は別ファイルで管理する想定。
