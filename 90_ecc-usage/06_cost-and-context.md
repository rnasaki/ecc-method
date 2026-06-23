# 06 — Cost & Context (コスト・コンテキスト最適化)

ECC は並列・対抗・委任を前提とするため、token 消費が増えやすい。本章は BP-009 (multi-agent ≒ 15× token) と BP-010 (prompt cache breakpoint) を実用化する手順を示す。

## 1. 設計原則

| 原則 | 出典 BP | 内容 |
|---|---|---|
| 軽量タスクは軽量モデル | BP-002 | Haiku / Sonnet / Opus を使い分け |
| 並列はコストに比例 | BP-009 | 並列度 N ⇒ 概ね N 倍の token |
| 持続的 prefix を cache | BP-010 | identical block の最後で cache breakpoint |
| 出力上限を契約に明記 | BP-004 | sub-agent の出力肥大を抑える |
| 状態は外部化 | BP-009 | context に積まず外部 store / file へ |

## 2. モデル割り当て (再掲)

| 重要度 | 例 | 推奨 |
|---|---|---|
| 最重要 | PRD / architecture / security / 最終ジャッジ | Opus 系 |
| 中 | 実装 / レビュー / build-fix | Sonnet または GPT-5.5 系 |
| 軽 | grep / 要約 / ファイル探索 | Haiku 系 |

詳細: `40_delegation/02_routing-rubric.md`。

## 3. プロンプトキャッシュ活用

### 3.1 適用対象

- system prompt 全体
- 大規模 KB (Expert Registry / 出典台帳)
- 安定する skill 文書

### 3.2 breakpoint 設計

```
[stable]   system prompt
[stable]   Registry 抜粋
[stable]   skill 内容
[变化]   ユーザの今回の依頼          ← ここから先は cache されない
```

最後の identical block の末尾に cache breakpoint を置く。breakpoint より下流は変動可。

### 3.3 注意

- cache breakpoint は破壊性: 上流 1 byte 変えると無効化
- 大型 prefix を頻繁に書き換えると逆効果
- prefix の **整列保守** を `04_self-repair.md` の整合性タスクに含める

## 4. 並列度の設計

| 並列度 | 用途 | 留意 |
|---|---|---|
| 1 | TDD (P-002) | 直列維持 |
| 2〜4 | レビュー / 評価 | 集約コストに注意 |
| 5〜10 | Discovery / Multi-Plan | 結果重複に注意 (重複検知通す) |
| 10+ | dmux / fleet | per-task budget を必ず付与 |

並列度 N ⇒ token もおおむね N 倍 (BP-009)。並列の正味効果を都度計測する。

## 5. 出力上限の契約

委任契約 ([40_delegation/03_delegation-contract.md](../40_delegation/03_delegation-contract.md)) で必ず指定する:

```yaml
expected_output:
  format: <md | json | yaml>
  max_lines: 200
  must_include: [出典, 不確実性]
  must_exclude: [禁止語]
```

`max_lines` を超えると orchestrator が打ち切る運用にする。

## 6. context の外部化

- 中間状態は `_tmp/<finding-id>.json` などファイルに置く
- 大規模出力は path で受け渡す (本文に貼らない)
- memory には「ルール / 用語」のみ。finding は流さない

## 7. コスト見積テンプレ

新規 Pattern を追加する前に概算を立てる:

```yaml
pattern: P-XXX
calls_per_run:
  planner: 1
  agent_evaluator: 1
  Explore: 3
estimated_input_tokens: <N>
estimated_output_tokens: <N>
model_mix:
  opus: <%>
  sonnet: <%>
  haiku: <%>
projected_cost_usd_per_run: <N>
```

四半期 radar で実測値と突き合わせる。

## 8. token 削減の実務 Tips

| 手法 | 効果 |
|---|---|
| 引用は path 渡し | 大幅減 |
| 出力フォーマットを構造化 | 中 |
| skill / Registry を参照 (本文転記しない) | 中〜大 |
| 並列 Agent の Output 限度を厳格化 | 中 |
| Hub 側で結果集約を 1 回で済ます | 中 |
| Haiku 寄せ可能タスクを分離 | 中 |
| 失敗テンプレを蓄積し再生成を抑える | 小〜中 |

## 9. 健全性 KPI との連携

`75_self-evolution/06_health-metrics.md` に以下を追加することを推奨:

- 1 機能あたりの concurrent Agent 数中央値
- 1 機能あたりの input / output token 中央値
- prompt cache hit 率 (環境が許せば)

## 10. 失敗例 (避ける)

- `_tmp/` を肥大化させ context にロードする
- prompt cache breakpoint を頻繁に動かす
- Agent ごとの max_lines を未指定で起動する
- Memory に finding を流し込む

## 出典

- Anthropic Engineering: Built multi-agent research system (https://www.anthropic.com/engineering/built-multi-agent-research-system, retrieved 2026-06-23)
- Anthropic Claude Code Sub-agents docs (https://code.claude.com/docs/en/sub-agents, retrieved 2026-06-23)
- 本パッケージ ./05_principles/_data/best_practices.json (BP-002, BP-004, BP-009, BP-010, retrieved 2026-06-23)
- 本パッケージ 40_delegation/02_routing-rubric.md (retrieved 2026-06-23)

## 不確実性

- 並列度 N ⇒ token N 倍 は概算。実プロジェクトで測定して係数を再校正する。
- prompt cache の細かな課金体系は ECC バージョン依存。最新条件は四半期 radar で取得する。
