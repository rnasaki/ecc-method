---
keywords: [frontier, world, models, agents]
related: []
---
# 06 World Models for Agents — 実行前のシミュレーション / sleep-time compute

> 5 段構成: **現状 → 先端 (2025-2026 H1) → 基礎研究 → 未来 → 今すぐ準備**
> retrieved_at: 2026-06-23

---

## 1. 現状 (陳腐化候補)

agent は「実環境で試して失敗から学ぶ」前提で動いている。

- 計画は LLM が立てるが、実行前のシミュレーションは限定的
- 失敗は実環境で起きてからログ分析
- ロールバックや dry-run の実装はあるが、agent 自身の「内部シミュレーション」はほぼ無い
- 推論時間は「いま考える時間 (test-time)」のみで、「事前に考えておく時間 (sleep-time)」を使い分けない
- world model (環境のモデル) を持つ agent は商用導入は限定的

**陳腐化の見込み時期**

| 項目 | 陳腐化見込み | 確度 |
|---|---|---|
| 「実行前シミュレーション無し」前提 | 2027 H2 | 中 |
| 推論を test-time のみで完結 | 2027 H1 | 中〜高 (sleep-time compute 論文が増加) |
| 環境モデルを持たない agent | 2028 H1 | 中 (Genie 系の汎用化が進めば加速) |

陳腐化の駆動因は 3 つ。第一に sleep-time compute が定量化された (2025-04)。第二に reasoning model の test-time scaling が当たり前になった。第三に Genie 2 など汎用 world model 基盤が登場した。

---

## 2. 先端 (2025-2026 H1)

### 2.1 Sleep-time Compute (2025-04)

- arXiv:2504.13171 — "Sleep-time Compute: Beyond Inference Scaling at Test-time" (retrieved_at: 2026-06-23)
- 公開: 2025-04-17
- 概要: ユーザ要求が来る前のアイドル時間に、予測される質問へ事前計算する枠組み。test-time compute と相補的
- 結果: Stateful GSM-Symbolic / Stateful AIME で test-time compute -5x、accuracy +13-18%、複数質問の amortize でクエリ単価 -2.5x
- 「query predictability」が高い領域ほど効く
- 公開コード/データセット有り

ECC 視点: HITL Gate 待ちのアイドル時間や夜間バッチで、次に来るユーザ要求 Top-N に対する一次案を先に作っておけば、応答レイテンシを劇的に下げられる。

### 2.2 MiniMax-M1 — Lightning Attention で test-time compute を効率化 (2025-06)

- arXiv:2506.13585 — "MiniMax-M1: Scaling Test-Time Compute Efficiently with Lightning Attention" (retrieved_at: 2026-06-23)
- 公開: 2025-06-16
- 概要: 456B パラメータの open-weight MoE 推論モデル。lightning attention 機構により 1M token context を native サポート
- DeepSeek R1 の 8x context、512x H800 GPU で 3 週間、約 535k USD で訓練
- ECC 視点: long-horizon agent の「自己シミュレーションログを context に積む」路線が現実コストで回り始めた、ことを示す

### 2.3 Self Forcing — train-test gap を埋める autoregressive video diffusion (2025-06)

- arXiv:2506.08009 — "Self Forcing: Bridging the Train-Test Gap in Autoregressive Video Diffusion" (retrieved_at: 2026-06-23)
- 公開: 2025-06-09 (v1)
- 概要: 訓練時に「自己生成出力」に基づいてフレームを条件付け、exposure bias に対処。単一 GPU でサブ秒レイテンシのリアルタイム streaming video generation
- ECC への含意: world model の「自己ロールアウト」を低レイテンシで回す技術が来ており、agent の「内部シミュレーション → 即座に補正」が現実味を帯びる

### 2.4 ARTIST — RL で agentic reasoning + tool integration (2025-04)

- arXiv:2505.01441 — "Agentic Reasoning and Tool Integration for LLMs via Reinforcement Learning" (retrieved_at: 2026-06-23)
- 公開: 2025-04-28
- 概要: 動的多段推論 + 外部ツール統合を RL で学習。base 比 +22% absolute 改善、数学推論 / multi-turn function calling で先行手法を上回る
- ECC 視点: 「内部で plan を試行錯誤 → ツール呼び出し前に枝刈り」を RL で身につけた agent は、本章の「実行前シミュレーション」を内発的に行うようになる

### 2.5 Claude Opus 4.5 — long-horizon autonomous tasks (2025-11)

- 公式: https://www.anthropic.com/news/claude-opus-4-5 (retrieved_at: 2026-06-23)
- 公開: 2025-11-24
- 関連機能: effort control / context compaction / advanced tool use
- 「ambiguity を扱い、tradeoffs を hand-holding 無しで推論する」「long-horizon, autonomous task」「dead-end が減る」
- SWE-bench Verified で先行モデルを上回る、token は前世代より少ない
- ECC 視点: 「外部 scaffolding 無しで考え直す」性質が強化された reasoning model 上で、内部シミュレーションが scaffolding 不要になりつつある

### 2.6 Genie 2 — foundation world model (歴史的近隣 / 2024-12)

- 公式: https://deepmind.google/discover/blog/genie-2-a-large-scale-foundation-world-model/ (retrieved_at: 2026-06-23)
- 公開: 2024-12-04
- 概要: 単一画像から action-controllable な 3D 環境を無限生成。autoregressive latent diffusion
- 厳密には 2024 年だが、本章 frontier の参考フレームとして掲載 (2025 H2 以降の派生研究の前提として頻出)
- ECC 視点: 「embodied agent 用の training/eval 環境」を世界モデルが供給する未来が現実化しつつある

### 2.7 出典比率の自己点検

- 2025-2026 出典: Sleep-time Compute / MiniMax-M1 / Self Forcing / ARTIST / Claude Opus 4.5 → **5 件**
- 2024 以前の参考: Genie 2 (2024-12) → 1 件
- 2025-2026 比率: 5/6 = 83% (本セクション内)

---

## 3. 基礎研究 (歴史文脈)

frontier ではないが、概念の出処として短く。

- Tree of Thoughts (arXiv:2305.10601, 2023): 思考経路の木探索 = 内部分岐シミュレーション
- Reflexion (arXiv:2303.11366, 2023): 失敗→自然言語反省で次回試行を改善
- Dreamer V3 (arXiv:2301.04104, 2023): 学習した world model 上でロールアウトして RL
- OpenAI o1 (2024): test-time scaling の商用化、「考え直し」が外部 scaffolding 無しで起きる

これらは 2025 年の sleep-time compute / Self Forcing の前提として価値があるが、**frontier 主出典には使わない**。

---

## 4. 未来

| 統合先 | 何を入れるか |
|---|---|
| `35_tdd-phase/` | TDD の前段に「シミュレーション phase」を追加 |
| `60_quality-gates/` | シミュレーション結果を gate に組み込む / 楽観バイアス検出 gate |
| `45_runbook/` | sleep-time の活用 (アイドル時に次手順を先読み・index 化) |
| `40_delegation/` | 「シミュレーション専任 agent」を編成パターンに追加 |

提案する将来フロー (TDD の拡張):

1. Spec 抽出
2. **シミュレーション** (新): agent が plan を内部実行し、想定ログを生成
3. テスト作成 (RED)
4. 実装 (GREEN)
5. 実環境で実行 → シミュレーション結果との差分検証
6. リファクタ + 世界モデル校正

差分検証段が入ることで、(a) 環境モデル誤差の継続校正、(b) 大きく外れた plan の事前停止、が可能になる。

---

## 5. 今すぐできる準備

### 手 1: dry-run プロンプトを HITL Gate の前に挟む

完全な world model は無くても、LLM に「この plan を実行したら何が起きそうか」を語らせるだけで効果がある。

提案フロー:

1. agent が plan を出す
2. 別 agent に「この plan を仮想実行した場合のログを 30 行で書け」と指示
3. ログに含まれる失敗候補を列挙
4. 人間 / gate がそれを見て、本番実行を承認するか決める

これは sleep-time compute の安価な近似であり、即日導入できる。

### 手 2: アイドル時間に「次に来そうな質問」を事前計算

Sleep-time compute の業務適用パターン:

- 案件アイドル時間 (HITL 待ち、夜間バッチ) に「次に来そうな質問 Top-N」を agent が予測
- 各々に対する一次案を事前生成し、index 化 (memory tool の `/memories/_precomputed/` 相当に置く)
- 実際にユーザが来たときは index ヒットなら即応、ミスなら通常推論
- 事前生成と実応答のヒット率を継続メトリクス化

PoC で小さく始める前提。ヒット率が低い領域は適用しない。

### 手 3: 過去ログを「世界モデルの代用」に使う

完全な世界モデルは作れなくても、過去ログがあれば近似できる。

- 各 plan を実行する前に、類似 plan の過去ログを retrieval で引く
- 「過去の類似 plan で発生した失敗」を context に入れる
- 失敗多発 plan 類型は実行前に警告

これは Reflexion の組織版とも言える。05 章の memory 階層 (L3 org memory) と接続する。

---

## シミュレーション系の典型的な失敗モード

- **過信**: シミュレーションが楽観的で実環境で破綻 → 実環境差分を必ずフィードバックして world model を校正
- **コスト爆発**: 全 plan をシミュレートするとトークン費用が伸びる → 高リスク plan のみ対象に
- **モデル誤差の固定化**: 古いログで学んだ世界モデルが現環境とずれる → 校正サイクルを定例化
- **dry-run と本番の乖離**: 副作用付き API は dry-run しても挙動が違う → 副作用境界を明示
- **predictability 過信**: sleep-time compute は query 予測可能性が低い領域では効かない → ヒット率 KPI で監視

---

## 出典

- Sleep-time Compute: arXiv:2504.13171 (公開 2025-04-17, retrieved_at: 2026-06-23)
- MiniMax-M1: arXiv:2506.13585 (公開 2025-06-16, retrieved_at: 2026-06-23)
- Self Forcing: arXiv:2506.08009 (公開 2025-06-09, retrieved_at: 2026-06-23)
- ARTIST (Agentic Reasoning + Tool Integration via RL): arXiv:2505.01441 (公開 2025-04-28, retrieved_at: 2026-06-23)
- Claude Opus 4.5 公式発表: https://www.anthropic.com/news/claude-opus-4-5 (公開 2025-11-24, retrieved_at: 2026-06-23)
- Genie 2: https://deepmind.google/discover/blog/genie-2-a-large-scale-foundation-world-model/ (公開 2024-12-04, retrieved_at: 2026-06-23)
- (歴史文脈) Tree of Thoughts: arXiv:2305.10601 / Reflexion: arXiv:2303.11366 / Dreamer V3: arXiv:2301.04104 (いずれも retrieved_at: 2026-06-23)

## 不確実性

- sleep-time compute は研究段階で、商用ヒット率は未検証。query predictability の低い領域では効かない可能性が高い。
- world model 系の汎用 agent への適用は依然 RL / video 文脈が中心。テキスト agent (本パッケージの主対象) への移植性は未確定。
- 「dry-run プロンプトで十分な近似になる」かは plan の性質依存。副作用付き plan には不十分。
- TDD への「シミュレーション phase」追加は本章の提案。業界合意ではない (未検証)。
- MiniMax-M1 の 1M context は native サポートだが、agent 文脈での実効精度はモデル/領域で差がある (未検証)。
- Claude Opus 4.5 の「内部 reasoning でシミュレーションが起きる」は公式表現の解釈であり、内部実装は非公開 (未検証)。
- Genie 2 は 2024-12 公開のため厳密には frontier 主出典外。2025-2026 H1 の派生研究の参照点として最低限掲載。
