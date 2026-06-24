---
keywords: [frontier, horizon, scanning]
related: []
---
# 01. Horizon Scanning — frontier 追跡法

> 「業界標準は陳腐化、進化スパンは月次〜半年より短い」前提
>
> retrieved_at: 2026-06-23 / 対象: AI agent 業界 frontier (model / SDK / benchmark / safety)

AI agent 業界では、半年前の best-practice が四半期で旧式化し、月次で新しい SDK・model 世代・ベンチマークが入れ替わる。本章は、ecc-method パッケージにおける「何を、どの周期で、どの一次出典から watch するか」の設計を定義する。年次レビュー前提の従来手法は陳腐化候補として扱う。

---

## 1. 現状 (陳腐化候補)

| 手法 | 陳腐化見込み | 確度 | 理由 |
|------|--------------|------|------|
| 年次ベンダ比較レポート | 2026 H2 | 高 | model 世代が 3〜6 ヶ月で交代するため、年次刊行時点で 2 世代遅れ |
| 静的 best-practice 文書 (年 1 回更新) | 2026 H2 | 高 | tool-use / agent harness の API 仕様が四半期単位で破壊的変更 |
| 単一ベンチマーク (例: MMLU 単独) スコア比較 | 2026 H1 中 | 高 | agentic 評価軸 (long-horizon / tool-use / 安全性) を捉えない |
| 月次 newsletter のみによる watch | 2026 H2 | 中 | 個別発表の遅延情報になりがち、一次出典補完が必要 |
| 「四半期に 1 度の prompt 見直し」運用 | 2026 H2 | 中 | model 更新で prompt 効果が変わる頻度がそれより短い |
| 内部 wiki に固定する固有名詞リスト | 2026 H2 | 低 | model id・SDK 名は頻繁に rename される (例: 過去にも renaming 多発) |

陳腐化への耐性を上げる方針: **一次出典の ID/URL を保存し、固有名詞ではなく「役割 (orchestrator / coding / research)」で参照する**。固有名は本パッケージ全体で抽象化済み。

---

## 2. 先端 (2025-2026 H1)

### 2.1 公式発表 (model / SDK)

| 出典 | 日付 | タイトル | 種別 |
|------|------|----------|------|
| anthropic.com/news/claude-opus-4-8 | 2026-05-28 | Introducing Claude Opus 4.8 | coding / agent / 長時間 run の一貫性向上 |
| anthropic.com/news/claude-fable-5-mythos-5 | 2026-06-09 | Claude Fable 5 / Mythos 5 リリース | 新世代 model 群 |
| anthropic.com/news/fable-mythos-access | 2026-06-12 | 米国輸出規制による Fable 5 / Mythos 5 アクセス停止声明 | 政策・地政学リスク |
| anthropic.com/news/claude-corps | 2026-06-11 | Claude Corps フェローシップ発表 | エコシステム展開 |

retrieved_at: 2026-06-23 / 全件 anthropic.com/news より取得。

OpenAI (openai.com/blog) は **HTTP 403 Forbidden** で取得失敗 — 未検証。代替ルート (RSS / 公式 X 投稿 / 二次情報) を別途 watch 対象に組む必要がある (本章 §5 参照)。

### 2.2 コミュニティ・OSS (HuggingFace blog)

| 出典 | 日付 | タイトル | 種別 |
|------|------|----------|------|
| huggingface.co/blog/is-it-agentic-enough | 2026-06-18 | Is it agentic enough? Benchmarking open models on your own tooling | agentic ベンチ手法 |
| huggingface.co/blog/zai-org/glm-52-blog | 2026-06-17 | GLM-5.2: Built for Long-Horizon Tasks | long-horizon model |
| huggingface.co/blog/agentic-resource-discovery-launch | 2026-06-17 | Agentic Resource Discovery | agent が探索する設計 |
| huggingface.co/blog/openenv-agentic-rl | 2026-06-08 | OSS community backing OpenEnv for Agentic RL | agent RL 環境 OSS |
| huggingface.co/blog/CohereLabs/introducing-north-mini-code | 2026-06 (約 2 週前) | North Mini Code: Cohere first dev model | 開発者向け small model |
| huggingface.co/blog/danf/intel-xpu-kernels-skill | 2026-06 (約 6 日前) | Intel XPU Kernel Skill: LLM-driven Triton kernel optimization | LLM による kernel 最適化 |

retrieved_at: 2026-06-23。

### 2.3 arXiv 2026 H1 主要論文

| arXiv ID | タイトル | テーマ |
|----------|----------|--------|
| arXiv:2606.00376 | The Deterministic Horizon: When Extended Reasoning Fails and Tool Delegation Becomes Necessary | reasoning 限界と tool 委譲 |
| arXiv:2606.00642 | Hidden Thoughts Are Not Secret: Reasoning Trace Exposure in LLMs | reasoning trace の情報漏洩 |
| arXiv:2606.00005 | Emergent Collaborative Deliberation in Multi-Model AI Systems | 多 model 協調 |
| arXiv:2606.00003 | Deliberative Curation: A Protocol for Multi-Agent Knowledge Bases | multi-agent KB |
| arXiv:2606.00708 | MOSAIC: モジュラーエージェント構成 | agent 構成法 |
| arXiv:2606.00756 | CoMIC: クラウドエッジ長期 agent | long-horizon edge |
| arXiv:2606.00270 | Robust Shielding for Safe Reinforcement Learning | safety |

retrieved_at: 2026-06-23 / 出典: arxiv.org/list/cs.AI/2026-06。

### 2.4 取得失敗・未検証

- **openai.com/blog**: HTTP 403。代替として platform.openai.com/docs/changelog や OpenAI 公式 X / developer forum を二次 watch に追加すべき。**未検証**。
- **latent.space**: トップページからは記事一覧抽出不可 (購読導線のみ)。/about や個別 episode URL に直接アクセスする運用が必要。**未検証**。
- arxiv の月次リストは ID 連番のみ確認 — 各論文の内容詳細は **未検証** (本章では title レベルで採録)。

---

## 3. 基礎研究 (歴史文脈)

frontier の主出典としては扱わない。文脈把握用に最小限のみ列挙:

- ReAct (Yao et al., 2023, arXiv:2210.03629) — tool-use と reasoning 交互実行の原型。現在の agent harness の祖型。
- Reflexion (Shinn et al., 2023) — self-reflection ループの初出。
- Toolformer (Schick et al., 2023) — model 自身による tool 呼び出し学習。
- ベンチマーク系: SWE-bench (2024), GAIA (2024) — 現行 agentic 評価の前提。

これらは「なぜ今の設計に至ったか」の説明用途に限定し、frontier 比較表には含めない。

---

## 4. 未来

| 観測対象 | 統合先章 | 反映方法 |
|----------|----------|----------|
| model 世代交代 (Opus 4.x → 5 系, Fable / Mythos) | 01_overview / 30_workflow | 「役割 → model」マッピングを四半期で再評価 |
| 長時間 run の一貫性向上 (Opus 4.8 系) | 30_workflow | orchestrator の長 horizon 化、checkpoint 設計 |
| agentic ベンチ手法 (HF "Is it agentic enough?", OpenEnv) | 80_advanced (評価章) | 自社 tool 上での agentic ベンチを取り入れる |
| reasoning trace の漏洩リスク (arXiv:2606.00642) | 80_advanced (安全性) | log 設計と PII 取り扱い再点検 |
| 政策・輸出規制 (Fable/Mythos アクセス停止) | 90_ops (運用 / 調達) | model 調達の単一供給依存リスクを文書化 |
| Agentic RL 環境 (OpenEnv) | 80_advanced | 自律ループ評価の OSS 化検討 |

---

## 5. 今すぐできる準備

1. **一次出典 watch リストを `85_frontier/` 配下に source-list.md として固定** — anthropic.com/news, openai.com/blog (RSS 経由), huggingface.co/blog, arxiv.org/list/cs.AI/YYYY-MM の 4 系統を最低限。各エントリに retrieved_at を必ず付ける。
2. **月次 horizon scan ジョブを設定** — 月初に上記 4 系統を巡回し、本章 §2 の表を差分更新。OpenAI が WebFetch 403 を返すケースの fallback (gh / MCP fetch / 公式 changelog ページ直 URL) を skill 側に登録しておく。

---

## 出典

| URL / arXiv ID | retrieved_at | 年 |
|----------------|--------------|---|
| https://www.anthropic.com/news/claude-opus-4-8 | 2026-06-23 | 2026 |
| https://www.anthropic.com/news/claude-fable-5-mythos-5 | 2026-06-23 | 2026 |
| https://www.anthropic.com/news/fable-mythos-access | 2026-06-23 | 2026 |
| https://www.anthropic.com/news/claude-corps | 2026-06-23 | 2026 |
| https://huggingface.co/blog/is-it-agentic-enough | 2026-06-23 | 2026 |
| https://huggingface.co/blog/zai-org/glm-52-blog | 2026-06-23 | 2026 |
| https://huggingface.co/blog/agentic-resource-discovery-launch | 2026-06-23 | 2026 |
| https://huggingface.co/blog/openenv-agentic-rl | 2026-06-23 | 2026 |
| https://huggingface.co/blog/CohereLabs/introducing-north-mini-code | 2026-06-23 | 2026 |
| https://huggingface.co/blog/danf/intel-xpu-kernels-skill | 2026-06-23 | 2026 |
| arXiv:2606.00376 | 2026-06-23 | 2026 |
| arXiv:2606.00642 | 2026-06-23 | 2026 |
| arXiv:2606.00005 | 2026-06-23 | 2026 |
| arXiv:2606.00003 | 2026-06-23 | 2026 |
| arXiv:2606.00708 | 2026-06-23 | 2026 |
| arXiv:2606.00756 | 2026-06-23 | 2026 |
| arXiv:2606.00270 | 2026-06-23 | 2026 |
| arXiv:2210.03629 (ReAct) | 2026-06-23 | 2023 |
| Reflexion (Shinn et al.) | 2026-06-23 | 2023 |
| Toolformer (Schick et al.) | 2026-06-23 | 2023 |
| SWE-bench / GAIA | 2026-06-23 | 2024 |

集計: 2025-2026 出典 17 件 / 2023-2024 出典 4 件 (= 2025-2026 比率 約 81%、基準 60% を満たす)。

---

## 不確実性

- **openai.com/blog は HTTP 403 で取得不可**。本章の OpenAI 関連は空欄であり、別ルート (RSS / changelog / developer forum / 二次媒体) で別途補完が必要。
- **latent.space はトップページから episode 一覧抽出不可**。購読/個別 URL 運用で再試行すべき。
- arXiv 論文は title / ID レベルで採録。本文・実験結果は **未検証**。引用時は abstract を別途確認する前提。
- HuggingFace blog の一部記事は「N 日前」表示のみ取得され、絶対日付は推定 (2026-06-XX レンジ)。確定日付は記事ページ側で再確認する必要がある。
- 「陳腐化見込み時期」は観測時点の仮説であり、業界変動に応じて月次で再評価する前提。
