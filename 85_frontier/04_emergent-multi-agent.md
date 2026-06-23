# 04. Emergent Multi-Agent — 創発的 agent 編成

> 静的な orchestrator-worker から、query 解析に応じて subagent が動的に
> spawn / handoff / 並列展開される「創発的編成」へ。
> ecc-method のオーケストレーション層が次に吸収すべき潮流を整理する。
>
> retrieved_at: 2026-06-23

---

## 1. 現状 (陳腐化候補)

現行 ecc-method を含め、多くの実装は **静的 orchestrator-worker / 固定 DAG** で成立している。

- **静的 DAG**: ノード（plan / fetch / extract / verify / write）と辺が
  事前に決まっており、入力に応じてグラフ自体は変わらない
- **固定 worker pool**: worker 種別と本数が config で固定。
  query 複雑度に応じた動的スケールはしない
- **同期一段ファンアウト**: orchestrator → worker の 1 階層のみ。
  worker が更に subagent を spawn することは想定されていない
- **Pattern 増殖運用**: 既存 `40_delegation/` は P-001..P-006 を
  追加し続ける運用で、Pattern 数の線形増加に追われる

陳腐化見込み:

| 観点 | 時期 | 確度 |
| --- | --- | --- |
| 「DAG 完全静的」前提 | 2026 年内に主流から外れる | 高 |
| 「単一 orchestrator・単段 worker」前提 | 2026 H2〜2027 H1 に多段化 | 中 |
| 「Pattern 増殖で対応」運用 | 2027 末までに meta-agent 合成へ移行 | 中 |
| 「同期のみ」前提 | 2027 以降に async handoff が標準化 | 中 |

---

## 2. 先端 (2025-2026 H1)

### 2.1 Anthropic Multi-agent research system

- "How we built our multi-agent research system" (Anthropic Engineering, 2025-06-13)
  - URL: https://www.anthropic.com/engineering/built-multi-agent-research-system
  - retrieved_at: 2026-06-23
- 公式引用:
  - "a multi-agent architecture with an orchestrator-worker pattern,
    where a lead agent coordinates the process while delegating to
    specialized subagents that operate in parallel"
  - "the lead agent analyzes it, develops a strategy, and **spawns
    subagents to explore different aspects simultaneously**"
- 動的編成の特徴:
  - lead agent が query を解析して **必要数の subagent を都度 spawn**
  - plan を Memory に永続化、context window を超えて生存
  - 同期協調（async は将来課題と明記）
- 性能: Multi-agent (Opus 4 lead + Sonnet 4 subagents) が
  single-agent Opus 4 比 +90.2%（内部 research eval）。
  トークン消費は通常チャットの約 15 倍

### 2.2 Microsoft Agent Framework (AutoGen 後継)

- リポジトリ: https://github.com/microsoft/agent-framework
  (python-1.9.0 / 2026-06-18, retrieved_at: 2026-06-23)
- 開発元ブログ: https://devblogs.microsoft.com/foundry/
  (retrieved_at: 2026-06-23)
- 位置づけ: **Semantic Kernel と AutoGen の統合後継**。
  公式に両者からの migration ガイドあり
- 言語: .NET / Python マルチランタイム、production-grade
- オーケストレーションパターン（公式記載）:
  sequential / concurrent / **handoff** / **group collaboration**
- 関連発表 (Microsoft Build 2026, 2026-06-02 / 06-03):
  - "Build and run agents at scale with Microsoft Foundry at Build 2026"
    https://devblogs.microsoft.com/foundry/agent-service-build2026/
  - "Discovery to Execution: Scaling Agents with Toolboxes and Routines"
    https://devblogs.microsoft.com/foundry/toolbox-build-26/

### 2.3 OpenAI Swarm / Agents SDK 系

本ターンの WebFetch で公式発表を直接取得していない（**未検証**）。
観測されている方向性は handoff primitive と guardrail を最小 API として
標準化、軽量 routing。ecc-method としては Anthropic / Microsoft の
primitives と突合した上で取り込み判断するのが安全。

### 2.4 arXiv 2025-2026 H1 の主な動向

WebFetch リスト (https://arxiv.org/list/cs.MA/2025, retrieved_at: 2026-06-23)
から本章文脈で参照価値が高いもの:

- **arXiv:2501.07813** "Talk to Right Specialists" — 動的ルーティング
- **arXiv:2501.02174** "TACTIC" (AAMAS 2025) — agent 間通信事前学習
- **arXiv:2501.00165** "Dynamic Graph Communication for Decentralised
  MARL" — 通信トポロジ自体が動的に変化
- **arXiv:2501.16173** "Will Systems of LLM Agents Cooperate" — 創発協調
- **arXiv:2501.05207** "CoDe" (AAAI 2025) — 遅延耐性協調

注: 2026 H1 の arXiv は本ターンで網羅取得していない（**未検証**）。

---

## 3. 基礎研究 (歴史文脈)

- **AutoGen** (MS Research, 2023): 会話駆動 multi-agent。
  Microsoft Agent Framework に統合・吸収
- **CAMEL** (2023): role-playing agent 協調生成、inception prompting
- **MetaGPT** (2023): software company 模倣の role 分担、SOP 構造化
- **Generative Agents** (Park et al., 2023): memory + reflection で
  長期一貫性のある創発的振る舞い
- **GPTSwarm / ADAS** (2024, arXiv:2402.16823 / 2408.08435):
  agent ネットワーク自体を最適化対象とする先駆け

これらは **役割固定** または **学術ベンチ中心** の段階であり、
2025 以降の dynamic spawn / handoff の本番運用とは段階が異なる。

---

## 4. 未来

| 先端要素 | ecc-method の吸収先 | 改修見込み |
| --- | --- | --- |
| 動的 subagent spawn | `orchestrator` 章 / plan 段階 | plan 出力に subagent 種別と本数を含める |
| handoff primitive | HITL Gate と worker 間 transition | Gate 通過条件に handoff 宣言を追加 |
| group collaboration | fact_check / verify 章 | 同一証拠集合を複数 agent で並列検証 |
| Memory 永続 plan | plan ファイル / state store | context 制約下での plan 再開を仕様化 |
| async handoff | (将来) ジョブキュー導入時 | 当面は同期維持、設計だけ非同期前提に |
| Pattern 合成 | `40_delegation/` の Pattern 集 | Pattern を machine-readable 化 |

階層整理（提案）:

| 階層 | 内容 | 既存章 |
| --- | --- | --- |
| L0 | 単独 agent + tools | `30_sdd-phase` |
| L1 | 固定 Pattern (P-001..P-006) | `40_delegation` (現状) |
| L2 | 半動的編成（テンプレ + 実行時パラメタ） | 新設 |
| L3 | 創発的編成（編成自体を agent が生成） | 将来章 |

L3 投入時の gating: 編成変更前後でベンチ差分を取る / 深さ・並列数を
hard limit / 失敗時のロールバック手順 / 編成スナップショット保存。

---

## 5. 今すぐできる準備

1. **plan 出力スキーマに「実行グラフ」を追加**:
   `subagents: [{role, count, parallel}]` と
   `edges: [{from, to, message_type}]` を含める。
   Anthropic の orchestrator-worker primitive と Microsoft Agent
   Framework の handoff / group 概念を orchestration 章に
   「参照済み先端事例」として追記
2. **編成メトリクスの先取り計測**:
   agent 呼び出し回数 / agent 間 depend graph / 総トークン消費 /
   成功率・リトライ回数を記録。将来「編成最適化 agent」を入れたとき
   固定編成と動的編成を A/B 比較できる土台になる

---

## 創発編成の典型的な失敗モード

- **役割の重複爆発**: 同一性検出が必要
- **責任の所在不明**: 編成にオーナー agent を必ず置く
- **無限増殖**: 深さ・並列数に hard limit
- **デバッグ困難**: 編成スナップショットを毎回保存
- **トークンコスト爆発**: Anthropic 実例で約 15× → 課金・上限設計

---

## 出典

全て retrieved_at: 2026-06-23。

- Anthropic, "How we built our multi-agent research system", 2025-06-13 — https://www.anthropic.com/engineering/built-multi-agent-research-system
- Anthropic news index (2026 春の agentic 関連発表) — https://www.anthropic.com/news
- Microsoft, "Agent Service @ Build 2026", 2026-06-02 — https://devblogs.microsoft.com/foundry/agent-service-build2026/
- Microsoft, "Toolboxes and Routines", 2026-06-03 — https://devblogs.microsoft.com/foundry/toolbox-build-26/
- Microsoft, "What's new in Microsoft Foundry | Build Edition", 2026-06-02 — https://devblogs.microsoft.com/foundry/whats-new-in-microsoft-foundry-build-2026/
- Microsoft Agent Framework (GitHub, python-1.9.0 / 2026-06-18) — https://github.com/microsoft/agent-framework
- arXiv:2501.07813 "Talk to Right Specialists" (2025) — https://arxiv.org/abs/2501.07813
- arXiv:2501.02174 "TACTIC", AAMAS 2025 — https://arxiv.org/abs/2501.02174
- arXiv:2501.00165 "Dynamic Graph Communication for Decentralised MARL" (2025) — https://arxiv.org/abs/2501.00165
- arXiv:2501.16173 "Will Systems of LLM Agents Cooperate" (2025) — https://arxiv.org/abs/2501.16173
- arXiv:2501.05207 "CoDe", AAAI 2025 — https://arxiv.org/abs/2501.05207
- 歴史文脈: AutoGen / CAMEL / MetaGPT / Generative Agents / GPTSwarm (arXiv:2402.16823) / ADAS (arXiv:2408.08435)

2025-2026 出典比率: 11 / 12 件群 ≒ 92%（歴史文脈 1 群を除く）。

## 不確実性

- **OpenAI Swarm / Agents SDK** の最新挙動は本ターンの WebFetch で
  公式取得していない（**未検証**）
- arXiv 2026 H1 (2506.* 以降) の網羅は **未検証**。本章 arXiv は
  2025 年 1 月 (2501.*) 系で、2026 H1 最新性は別途精読で補完
- Anthropic news 個別プロダクト発表は agentic 向上の文脈で
  言及されているが、orchestration primitive の変更は明示されておらず
  本章の主張根拠には使っていない
- Microsoft Agent Framework の AutoGen / Semantic Kernel 統合は
  公式 migration ガイドの存在が根拠。両者の deprecation 時期は
  本ターンで未確認（**未検証**）
- §1 の陳腐化見込み時期と §4 の L0..L3 階層は観測トレンドからの
  提案であり、業界標準のフレームワークではない（**未検証**）
- agent debate / 創発協調系の精度向上は条件依存が大きく、
  常に効くわけではない（arXiv:2501.16173 等の制約条件参照）
