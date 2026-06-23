# 07 Post-LLM Architectures — LLM の次

> 5 段構成: **現状 → 先端 (2025-2026 H1) → 基礎研究 → 未来 → 今すぐ準備**
> retrieved_at: 2026-06-23

---

## 1. 現状 (陳腐化候補)

agent の基盤モデルは Transformer ベースの自己回帰 LLM がほぼ全て。

- self-attention の二次オーダーがコスト構造を決めている
- context 長は伸びているが、KV cache サイズと推論コストで頭打ち
- 長期記憶は外部 (vector store / Memory tool) に出して扱う前提
- リアルタイム / 連続入力系 (音声・センサ・edge) は別アーキで対応するのが定番
- 推論コストは「token 数 × モデルサイズ」で線形に膨らむ

**陳腐化の見込み時期**

| 項目 | 陳腐化見込み | 確度 |
|---|---|---|
| 「pure Transformer 一択」前提 | 2027 H2 | 中〜高 (Hybrid 系の商用化が顕著) |
| context 長 = 性能の代理指標 | 2027 H1 | 中 |
| 連続入力は別アーキ前提 | 2028 H1 | 中 (Liquid 系 edge 展開次第) |

陳腐化の駆動因は 3 つ。第一に Hybrid (Transformer + SSM / convolution) の商用 open-weight モデルが 2025 に揃った。第二に lightning attention 系の sub-quadratic attention が 100B 級で実証された。第三に Liquid AI が edge 向け Hybrid を四半期サイクルで出している。

---

## 2. 先端 (2025-2026 H1)

### 2.1 LFM2 — Liquid AI の Hybrid edge model (2025-07)

- 公式: https://www.liquid.ai/blog/liquid-foundation-models-v2-our-second-series-of-generative-ai-models (retrieved_at: 2026-06-23)
- 公開: 2025-07-10
- アーキ: 「10 double-gated short-range convolution blocks + 6 grouped query attention blocks」の Hybrid
- 350M / 700M / 1.2B parameters / Apache 2.0 ベースのライセンス (academic と <10M USD 売上は無料、それ以上は商用ライセンス)
- 性能: CPU で Qwen3 比 2x スループット、訓練速度は前世代比 3x、10T token で蒸留訓練
- ターゲット: smartphone / laptop / vehicle / robotics の「ms latency, on-device, data sovereignty」

### 2.2 LFM2.5 系 — 2026 H1 の四半期更新

- 公式 blog index: https://www.liquid.ai/blog (retrieved_at: 2026-06-23)
- LFM2.5-1.2B-Thinking (2026-01): 「on-device 推論 1GB 以下」の軽量推論モデル
- LFM2.5-350M (2026-03): 超小型モデルラインの拡張
- LFM2-24B-A2B (2026-03): tool calling 対応 agent、コンシューマ HW 対応
- LFM2.5-VL-450M (2026-04): edge 向け visual-language
- LFM2.5-8B-A1B (2026-05): on-device MoE
- LFM2.5 Retrievers (2026-06): 双方向検索 / 多言語

四半期サイクルで edge 向け Hybrid モデルが揃いつつある。ECC 視点では「agent の一部を edge で動かす」前提の運用設計が現実味を持つ。

### 2.3 MiniMax-M1 — open-weight Hybrid attention 推論モデル (2025-06)

- arXiv:2506.13585 — "MiniMax-M1: Scaling Test-Time Compute Efficiently with Lightning Attention" (retrieved_at: 2026-06-23)
- 公開: 2025-06-16
- アーキ: 456B params (459M activation/token) の MoE + lightning attention
- 1M token context を native サポート (DeepSeek R1 の 8x)
- 訓練: 512x H800 GPU で 3 週間、約 535k USD
- ECC 視点: pure Transformer の二次コストを回避した「open-weight reasoning model」が出た = 「Transformer 一択」前提が崩れる初の実証級

### 2.4 Samba — Mamba + SWA Hybrid for unlimited context (2025-02 最終版)

- arXiv:2406.07522 — "Samba: Simple Hybrid State Space Models for Efficient Unlimited Context Language Modeling" (retrieved_at: 2026-06-23)
- 公開: 2024-06-11 (v1) / 2025-02-28 (最終版)
- アーキ: Mamba (selective SSM) + Sliding Window Attention を層ごとに組み合わせる Hybrid
- 256K〜1M context、Transformer 比 約 3.7x スループット
- 厳密に 2025 年論文かは v1=2024 で境界線。最終版 (2025-02) を採用ソースとする

### 2.5 Self Forcing — autoregressive 系の train-test gap 解消 (2025-06)

- arXiv:2506.08009 (retrieved_at: 2026-06-23)
- 公開: 2025-06-09
- 概要: video diffusion 文脈だが、autoregressive 系一般の exposure bias 対処として汎用性あり
- 単一 GPU でサブ秒 streaming
- ECC 視点: 「アーキは Transformer でも訓練レシピで context efficiency を稼ぐ」路線も並行で進化していることを示す

### 2.6 Position paper — Asymptotic analysis with LLM primitives (2025-02)

- arXiv:2502.04358 — "Position: Scaling LLM Agents Requires Asymptotic Analysis with LLM Primitives" (retrieved_at: 2026-06-23)
- 公開: 2025-02-04 (v1) / 2025-05-29 (最終)
- 概要: agent system 設計を「LLM forward pass を計算プリミティブとした漸近解析」で評価すべきという提言
- ECC 視点: アーキ移行期に「単価が token か state-step か」を抽象化して扱う議論の理論的支柱

### 2.7 出典比率の自己点検

- 2025-2026 出典: LFM2 / LFM2.5 系 / MiniMax-M1 / Samba (最終版 2025-02) / Self Forcing / Position paper → **6 件**
- 2024 以前のみの出典: 0 件 (本セクション内)
- 2025-2026 比率: 100% (本セクション内)

---

## 3. 基礎研究 (歴史文脈)

frontier ではないが、概念の出処として短く。

- Mamba (arXiv:2312.00752, 2023): 入力依存の selective SSM、線形オーダー長系列
- Mamba-2 (arXiv:2405.21060, 2024): SSM と attention の双対性整理
- RWKV (arXiv:2305.13048, 2023): RNN 風で推論メモリ定数オーダー
- Jamba (arXiv:2403.19887, 2024): Transformer + Mamba + MoE Hybrid の先行例
- Liquid Time-constant Networks (arXiv:2006.04439, 2020): Liquid 系の理論的原点

これらは 2025 年の LFM2 / MiniMax-M1 / Samba の前提として価値があるが、**frontier 主出典としては使わない**。

---

## 4. 未来

ECC は agent の「方法論」中心なので、基盤モデルが変わっても方法論の多くは継続する。一方で前提が変わる箇所はある。

| 統合先 | 何を変えるか |
|---|---|
| `15_environment/` | 推論コスト見積もり方法 (token 単価 → state step / forward pass 単価へ。2.6 の漸近解析論文が支柱) |
| `40_delegation/` | edge agent (LFM2 系) と cloud agent (Opus / M1 系) の 2 層編成 Pattern |
| `60_quality-gates/` | レイテンシ gate (TTFT vs streaming) と context gate (1M context 時の RAG 不要域) |
| `65_pitfalls/` | アーキ移行時の挙動差 (例: SSM 系の長距離依存特性、attention 不在層の挙動) |

agent 方法論側で残るもの (アーキ非依存):

- TDD / SDD のサイクル
- HITL Gate
- 権限境界
- ふりかえり / 自己進化
- Memory 階層 (05 章)

これは「LLM の次」が来ても活かせる資産として認識しておく。

---

## 5. 今すぐできる準備

### 手 1: ベンチマーク層を「モデル抽象」越しにする

現状、多くの実装は OpenAI / Anthropic API を直接叩いている。これを 1 層抽象化しておくと:

- LFM2 / MiniMax / RWKV / Hybrid 系の API が出たとき差し替え容易
- 同じタスクを複数アーキで A/B 測定可能
- コスト構造 (token vs state step vs forward pass) の比較可能

抽象すべき点:

- 入出力 I/F
- 推論コスト記録 (token / time / state step / forward pass count)
- レイテンシ計測 (TTFT, p50, p99)
- context 表現 (token 数だけでなく「保持状態量」も)

### 手 2: 「アーキ依存の前提」を 1 箇所に集約

ECC ドキュメント中、Transformer / token を前提にしている記述を grep し、注釈を入れる。

例:
- 「context window が…」→ 「context 容量が…」と一般化
- 「token 課金」→ 「推論単価」と一般化
- 「KV cache」→ 「状態保持」と一般化

これにより、「LLM の次」が来てもドキュメント全面改訂を避けられる。

### 手 3: edge / cloud 2 層運用の検証 PoC

LFM2.5 系が四半期で出ている前提で、機密度高/レイテンシ要求高/連続入力は edge (LFM2 系)、推論深度要求/long-horizon は cloud (Opus 4.5 / MiniMax-M1) という 2 層編成を 1 案件で PoC。Memory tool (05 章) は両層から共通 backing store にアクセスする設計が望ましい。

---

## 「LLM の次」を判断する観測点

陳腐化判断は単なる予測ではなく、観測点を決めて待つ。

| 観測点 | 何が起きたら次が来たと判断するか | 2026-06 時点の状況 |
|---|---|---|
| 公式 API 提供 | Anthropic / OpenAI が SSM/Hybrid 系モデルを商用提供 | 未確認 |
| open-weight 1M context | sub-quadratic attention の open-weight 100B+ モデル | **MiniMax-M1 で達成 (2025-06)** |
| edge model 四半期更新 | edge 向け Hybrid が四半期リリース体制 | **LFM2.5 系で達成 (2026 Q1-Q2)** |
| ベンチマーク逆転 | 主要 reasoning bench で pure Transformer 非依存モデルが先行 | 部分的 (long-context 系では一部発生) |
| コスト逆転 | 同等品質で推論コストが 1/3 以下のアーキ商用化 | 未確認 |

これらを四半期 Horizon Scanning (01 章) でチェックリスト化する。**6 観測点中 2 つはすでに発火している**。

---

## 出典

- LFM2 公式 blog: https://www.liquid.ai/blog/liquid-foundation-models-v2-our-second-series-of-generative-ai-models (公開 2025-07-10, retrieved_at: 2026-06-23)
- LFM2.5 系 blog index: https://www.liquid.ai/blog (retrieved_at: 2026-06-23)
- MiniMax-M1: arXiv:2506.13585 (公開 2025-06-16, retrieved_at: 2026-06-23)
- Samba: arXiv:2406.07522 (最終版 2025-02-28, retrieved_at: 2026-06-23)
- Self Forcing: arXiv:2506.08009 (公開 2025-06-09, retrieved_at: 2026-06-23)
- Position paper (asymptotic analysis): arXiv:2502.04358 (最終 2025-05-29, retrieved_at: 2026-06-23)
- (歴史文脈) Mamba: arXiv:2312.00752 / Mamba-2: arXiv:2405.21060 / RWKV: arXiv:2305.13048 / Jamba: arXiv:2403.19887 / Liquid Time-constant Networks: arXiv:2006.04439 (いずれも retrieved_at: 2026-06-23)

## 不確実性

- 「pure Transformer 一択が 2027 H2 に陳腐化」は楽観寄り推定。商用移行コスト次第で更に時間がかかる。
- LFM2.5 系の四半期更新は本章で blog index から推定した日付が多く、個別 blog 記事の一次取得が一部できていない (LFM2.5-1.2B-Thinking など個別エントリは未検証)。
- MiniMax-M1 の 1M context native サポートは論文記述で、agent 文脈での実効精度は領域依存 (未検証)。
- Samba は v1=2024-06 で境界。最終版 (2025-02) を採用したが「frontier 純度」では弱め。
- Liquid 系の license は Apache 2.0 ベースだが商用 (>10M USD 売上) は別ライセンス。社内利用前に法務確認必須。
- 観測点 (公式 API / ベンチマーク逆転 / コスト逆転) のしきい値は本章の提案であり業界合意ではない。
- ECC 方法論の「アーキ非依存資産」リストは著者判断。一部 (例: TDD のサイクル) は基盤が大きく変われば見直し要。
- アーキ移行は段階的に進む可能性が高く、「ある日突然 LLM の次」とはならない。観測点は「徐々に効く指標」として運用する。
