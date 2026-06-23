---
title: "Reasoning Effort Control（推論深度の明示制御）"
status: stable
retrieved_at: 2026-06-23
---

# 08. Reasoning Effort Control

> Multi-LLM Routing がモデル間の粒度（Opus / Sonnet / Haiku, GPT-5.5 / mini）を切り替える原則であるのに対し、本原則は **同一モデル内** の推論深度とコストを制御する。両者は直交する独立軸であり、両方を組み合わせて初めて「適切なコストで適切な深さ」を達成できる。

## 1. なぜ effort 制御が必要か

モデル選択は粒度が粗い。同じモデルでも reasoning effort（思考バジェット）によって、

- 出力品質
- レイテンシ
- 1 リクエストあたりの課金トークン数

が大きく変わる。effort を制御しない場合、次の 2 つの失敗モードがどちらも発生する：

1. **過剰**: 上位モデルに full budget を割当て、grep / docs lookup / 単純整形のような trivial タスクで budget を浪費する
2. **過小**: shallow thinking で重要タスク（最終ジャッジ、PRD、architecture、security review）に挑み、品質ゲートを通過できない

ECC ではモデル選択（[../40_delegation/02_routing-rubric.md](../40_delegation/02_routing-rubric.md)）と effort 制御を **別ステップ** として扱う。

## 2. Anthropic Extended Thinking の制御点

[L1] 公式ドキュメントによると、Extended Thinking は `thinking.budget_tokens` パラメータで制御する。

- `budget_tokens` は `max_tokens` より小さく設定する必要がある
- 「Larger budgets can improve response quality ... although Claude may not use the entire budget allocated, especially at ranges above 32k」（公式原文）
- 上位モデルの一部では `effort` パラメータが採用され、`high` がデフォルトとなる surface もある（"the `effort` parameter defaults to `high` on all surfaces, including the Claude API and Claude Code"）

### 2.1 interleaved-thinking-2025-05-14 beta

beta header を有効化した場合のみ：

- `budget_tokens` は `max_tokens` を超過してよい
- 「the total budget across all thinking blocks within one assistant turn」として解釈される
- ツール呼び出しの間に思考ブロックを挿入できるため、agentic loop で品質が伸びる

### 2.2 Plan mode との関係

Plan mode は **計画段階のみ** Extended Thinking を厚く割り当て、実装段階では budget を絞る運用。本原則の階層化を harness 側で実現する代表的な実装。

## 3. OpenAI reasoning_effort

[L1] 公式ドキュメントによると、対応モデル（GPT-5 系列、推論モデル）では `reasoning_effort` を 4 段階で指定する：

| 値 | 公式定義（短縮） | ECC での主用途 |
|----|----------------|---------------|
| `none` | "Latency-critical tasks that do not benefit from any reasoning" | tool dispatch / 整形のみ |
| `low` | "Efficient reasoning ... tool-use, planning, search, multi-step decision making" | grep, docs lookup, ルーティング |
| `medium` | "Default configuration for most workloads ... quality and reliability matter" | 実装 / コードレビュー |
| `high` | "Hard reasoning, complex debugging, deep planning, high-value tasks" | 最終ジャッジ / アーキテクチャ |

「Lower effort favors speed and lower token usage, while at higher effort the model thinks more completely」（公式原文）。reasoning tokens は **output トークンとして課金** され、コンテキストウィンドウを占有する点に注意。

## 4. ECC 適用ルール

### 4.1 タスク重要度 × effort マトリクス

| タスク種別 | 重要度 | Anthropic | OpenAI | 根拠 |
|----------|-------|-----------|--------|------|
| 最終ジャッジ / 採否判定 | 最重要 | budget 大（モデル上限近く）または `effort: high` | `high` | 誤判定が下流全体を汚染 |
| PRD / architecture / 設計 | 最重要 | budget 大 / `high` | `high` | 後戻りコストが指数的 |
| security / 脆弱性レビュー | 最重要 | budget 大 / `high` | `high` | 見落としの非対称コスト |
| 実装 / リファクタ | 中 | budget 中（デフォルト〜中） | `medium` | 標準ワークロード |
| コードレビュー（一次） | 中 | budget 中 | `medium` | 二次レビューで補完可 |
| docs lookup / grep / 整形 | 軽 | thinking off / 最小 budget | `low` または `none` | 推論不要 |
| ツール dispatch のみ | 軽 | thinking off | `none` | レイテンシ優先 |

### 4.2 Routing Rubric への接続

[../40_delegation/02_routing-rubric.md](../40_delegation/02_routing-rubric.md) の Step 4 として **「effort の決定」** を必ず追加する：

1. Step 1〜3: モデル選択（粒度）
2. **Step 4 (本原則): effort / budget_tokens の決定（深度）**
3. Step 5: コスト見積もりとゲート

モデルだけ決めて effort を決めない委譲は禁止。

### 4.3 Delegation Contract への接続

[../40_delegation/03_delegation-contract.md](../40_delegation/03_delegation-contract.md) §5「制約」に effort を必須項目として加える：

```yaml
constraints:
  model: <provider>:<model_id>
  effort: low | medium | high   # OpenAI 系
  thinking_budget_tokens: <int> # Anthropic 系
  max_output_tokens: <int>
  timeout_s: <int>
```

呼び出し側はこの 4 つを **すべて明示** する。デフォルト依存は禁止（同一モデルでも surface により default が異なるため再現性を損なう）。

## 5. コスト管理との連動

### 5.1 見積式

1 リクエストの想定課金は次式で見積もる：

```
cost ≈ input_tokens × input_price
     + (visible_output_tokens + reasoning_tokens) × output_price
```

ここで `reasoning_tokens` は effort により大きく変動する（output 課金）。effort を上げる際は、output 単価 × 想定 reasoning_tokens の増分を **事前に** 試算してから決める。

### 5.2 budget enforcement

ジョブ単位 / セッション単位の上限は [../50_permissions/06_cost-budget-enforcement.md](../50_permissions/06_cost-budget-enforcement.md) で強制する。effort 設定は budget enforcement の入力であり、enforcement 側で：

- effort: high の連続発火回数を制限
- セッション累積 reasoning_tokens を計測
- 閾値超過で自動的に effort を 1 段階下げる（degrade rule）

を行う。

## 6. アンチパターン

| アンチパターン | なぜ駄目か | 正しい運用 |
|---------------|----------|-----------|
| すべての agent に最大 budget / `high` を割当て | コストが線形に膨張、レイテンシも悪化、品質はサチる | §4.1 マトリクスで段階化 |
| プロンプトに「深く考えて」と書くだけで API パラメータを使わない | 実際の budget は変わらず、効果は不安定。再現性ゼロ | `budget_tokens` / `reasoning_effort` を **API レベル** で指定 |
| effort をモデル選択と一緒に隠してハードコード | 監査不能。同一モデル別 effort の比較ができない | constraints として委譲契約に書き出す |
| reasoning_tokens を input トークン扱いで見積もる | output 単価で課金されるため、コスト試算が桁違いに過小 | output 単価で計上 |
| Extended Thinking 非対応モデルに budget_tokens を渡す | API エラー（公式に "400 error" と明記） | モデルの thinking 対応マトリクスを事前確認 |
| 重要タスクで effort を `low` のまま走らせて gate に落ちる | 再実行コストが effort 引上げ分を超える | 最初から重要度に応じた effort を選ぶ |

## 出典

- [L1] Anthropic, "Extended thinking", retrieved_at: 2026-06-23 — `https://docs.claude.com/en/docs/build-with-claude/extended-thinking`（`platform.claude.com/docs/en/build-with-claude/extended-thinking` にリダイレクト）
- [L1] Anthropic, "Models overview", retrieved_at: 2026-06-23 — `https://docs.claude.com/en/docs/about-claude/models`
- [L1] OpenAI, "Reasoning models guide", retrieved_at: 2026-06-23 — `https://platform.openai.com/docs/guides/reasoning`（`developers.openai.com/api/docs/guides/reasoning` にリダイレクト）

## 不確実性

- `budget_tokens` の数値的な default / min / max は公式ドキュメントに **明示記載がなく**、本原則ではレンジ感（「32k 超で逓減」「max_tokens 未満」）のみを記述した。具体値が必要な実装は Models API（`max_input_tokens` / `max_tokens` / `capabilities`）で動的取得すること
- OpenAI 側 effort 値の対応モデルは "Some models support only a subset of these values" とされ、モデル個別ページの確認が前提
- Adaptive thinking 採用モデル（Sonnet 4.6 等）では手動 `budget_tokens` 指定が deprecated 扱いとなっており、effort パラメータへ移行する surface が増えている。本原則は両者を併存前提で記述しているが、具体的な API 名称は半年単位で再確認する必要がある
- interleaved-thinking-2025-05-14 は beta header であり、GA 後に契約形が変わる可能性がある
