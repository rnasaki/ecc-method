---
keywords: [principles, multi, llm, routing]
related: [60_quality-gates/06_red-team-loop.md, 40_delegation/02_routing-rubric.md, 05_principles/05_delegation-first.md, 05_principles/06_context-economy.md]
---
# 07 — Multi-LLM Routing (Opus / Sonnet / Haiku / 外部 LLM)

複数モデル間でタスクをルーティングする原則。重要度・推論深度・コストの 3 軸で選定する。

## 1. 原則の宣言

```
最重要 (PRD / architecture / security / 最終ジャッジ) には Opus 系。
中 (実装 / レビュー / build-fix) には Sonnet 系または同等の外部 LLM。
軽 (grep / 要約 / docs lookup) には Haiku 系または相当の最安モデル。
```

理由は BP-002 / BP-018: 全タスクに最高性能モデルを当てるとコスト爆発、軽タスクに高性能を当てても利得が薄い。

## 2. モデル選定マトリクス

### 2.1 ECC 系 (Anthropic Claude)

| モデル系統 | 想定用途 | cost_tier | 並列性 | 出典 |
|---|---|---|---|---|
| Opus 系 | orchestration / PRD / architecture / 最終 synthesis | premium | sequential 寄り | BP-018 |
| Sonnet 系 | 実装 / コードレビュー / TDD ガイド / 多くの語彙系生成 | high | 並列可 | BP-018 |
| Haiku 系 | grep / 要約 / docs lookup / 軽 worker | low | 高並列 | BP-002 |

### 2.2 外部 LLM (補助委任先)

| 系統 | 想定用途 | 採用判断 |
|---|---|---|
| 別 vendor 系 | 異種 LLM での反論担当 (red-team) | 重要決定の対抗評価 |
| Codex CLI 等 | 大量 boilerplate | コスト削減目的 |
| Local LLM | センシティブデータ / オフライン | 機密 / ネット制限環境 |

異種 LLM は **判定の独立性** を高める手段として、生成 ≠ 判定 ≠ 反論 の構造に組み込む ([60_quality-gates/06_red-team-loop.md](../60_quality-gates/06_red-team-loop.md))。

## 3. 重要度 × 用途 マトリクス

```text
                  軽 worker      中 worker      最重要
Explore           Haiku          —              —
docs-lookup       Haiku          —              —
lang-reviewer     —              Sonnet         —
tdd-guide         —              Sonnet         —
build-resolver    —              Sonnet         —
planner           —              —              Opus
architect         —              Sonnet         Opus (重要時)
security-reviewer —              Sonnet         (Opus 昇格可)
agent-evaluator   —              Sonnet         Opus (最終ジャッジ時)
```

(BP-002 / BP-018 / Routing Rubric §「モデル選定の既定値」と整合)

## 4. ルーティング決定木

```text
Step 1: タスク重要度を判定
  最重要 / 中 / 軽 のいずれか

Step 2: タスク用途を判定
  research / plan / design / implement / review / test / taste / security

Step 3: マトリクスから既定モデルを引く
  例: 重要度 = 最重要, 用途 = plan → Opus

Step 4: 例外規則の確認
  - 命名 / UI / コピー → taste カテゴリ (Sonnet 既定)
  - red-team の refuter → 異種 LLM を選好
  - 機密データ → local LLM を選好

Step 5: parallel_safe で並列性決定
Step 6: cost_cap を契約に明記
```

詳細: [40_delegation/02_routing-rubric.md](../40_delegation/02_routing-rubric.md)

## 5. tool_choice / プロンプト誘導 (BP-019)

`tool_choice: auto` の状況で tool 呼び出し挙動を制御する手段:

| 手段 | 採用条件 |
|---|---|
| `tool_choice: auto` + プロンプト誘導 | 通常運用。「use the tools to investigate before responding」等の軽指示 |
| `tool_choice: required` | tool 呼び出しを必ず出させたい (確定動作が必要なとき) |
| `tool_choice: <specific>` | 特定 tool しか使わせたくない |

**アンチパターン**: 全分岐をハードコードした決定木。新しい query 形に適応できない (BP-019 違反)。

## 6. コスト管理の運用

### 6.1 cost_tier の表記

Registry エントリは `cost_tier: low | mid | high | premium` を持つ。委任時はこの tier と重要度のクロスで採用判断する。

### 6.2 token 上限の設定 (BP-009 派生)

```yaml
delegation:
  cost_cap:
    max_input_tokens: 8000
    max_output_tokens: 1500
    parallel_fanout: 3   # 並列起動の最大数
```

### 6.3 prompt cache の活用 (BP-010, BP-030)

長い system prompt / tool 定義は cache 化することで cost を ~10% に圧縮できる。

## 7. 異種 LLM 投入の典型シナリオ

### 7.1 重要決定の Red-Team

```yaml
generator: ECC planner (Opus)
judge:     ECC agent-evaluator (Sonnet)
refuter:   異種系統 LLM (refute を試みよ)
```

異なる LLM 系統を refuter に当てることで、同一 vendor バイアスを減らす。

### 7.2 大量 boilerplate

```yaml
orchestrator: ECC (Opus)
worker:       Codex 系 (大量コード生成)
verifier:     ECC code-reviewer (Sonnet)
```

worker をコスト最安に振り、verifier で品質ゲート。

### 7.3 機密 / オフライン

```yaml
worker:    local LLM
synthesis: ECC (機密を出さない範囲で)
```

機密データは local で処理し、要約 / メタ情報のみ ECC に渡す。

## 8. アンチパターン

| アンチパターン | 起きること | 対処 |
|---|---|---|
| 全タスクに Opus を割当 | コスト爆発 | BP-002, BP-018 で軽 = Haiku |
| 軽タスクに Opus / 重タスクに Haiku | コスト浪費 / 品質低下 | マトリクス再確認 |
| 異種 LLM を generator にも judge にもする | 独立性は保てるが coordinate 困難 | 役割を 1 つに固定 |
| ハードコード決定木で tool 呼出を縛る | 新 query に適応不能 | BP-019: 軽指示で誘導 |
| cost_cap 未設定で長文出力 | 主 context が膨張 | 委任時に必ず max_output_tokens |

## 9. ルーティング判定のサンプル (Routing Rubric 補足)

### Sample A: 「全テストを走らせて失敗を直して」

```text
Step 1: 重要度 = 中
Step 2: 用途 = test + builder-fixer
Step 3: 既定 → Sonnet (lang-build-resolver)
Step 4: 言語が未確定 → Explore (Haiku) を先行
出力: experts=[Explore (Haiku), <lang>-build-resolver (Sonnet)]
```

### Sample B: 「アーキテクチャを Opus と外部 LLM の双方でレビューして」

```text
Step 1: 重要度 = 最重要
Step 2: 用途 = architecture review
Step 3: 既定 → Opus
Step 4: 例外: red-team 指示 → 異種 LLM を refuter に追加
出力: generator=architect (Opus), judge=agent-evaluator (Sonnet), refuter=異種 LLM
```

## 10. 原則 / Habits との対応

| North Star / 原則 | 対応 |
|---|---|
| 委任ファースト原則 ([05](./05_delegation-first.md)) | 委任先選定の中核 |
| コンテキスト最小原則 ([06](./06_context-economy.md)) | 軽 = Haiku で context 節約 |
| 反対意見併記原則 | 異種 LLM での refuter |
| Habit 3 (First Things First) | 重要度 × 用途で premium モデル割当 |

## 11. 関連 Best Practices

| BP-ID | 関連性 |
|---|---|
| BP-002 | モデル別最安値 |
| BP-018 | orchestration vs worker のモデル分離 |
| BP-019 | tool_choice + プロンプト誘導 |
| BP-009 | マルチエージェント token 消費の予算化 |
| BP-010, BP-030 | prompt cache 活用 |

## 出典

- Anthropic Claude Code Sub-agents: https://code.claude.com/docs/en/sub-agents (retrieved_at: 2026-06-23)
- Anthropic Claude Code Best Practices: https://code.claude.com/docs/en/best-practices (retrieved_at: 2026-06-23)
- Anthropic tool-use overview: https://platform.claude.com/docs/en/docs/agents-and-tools/tool-use/overview (retrieved_at: 2026-06-23)
- Anthropic prompt-caching: https://platform.claude.com/docs/en/docs/build-with-claude/prompt-caching (retrieved_at: 2026-06-23)
- OpenAI Agents SDK: https://openai.github.io/openai-agents-python/ (retrieved_at: 2026-06-23)
- best_practices.json BP-002, BP-009, BP-010, BP-018, BP-019, BP-030 (`./05_principles/_data/best_practices.json`)

## 不確実性

- 各モデルの呼称 (Opus / Sonnet / Haiku) は世代で更新される。本ファイルは「系統」での運用記述にとどめ、特定 model id は導入時に再確認する (未検証)。
- 異種 LLM の選定は導入先のライセンス / コスト / セキュリティ要件次第。本ファイルは選定構造のみ提供。
- §3 のマトリクスは既定値。プロジェクト特性に応じてオーバーライド可。
