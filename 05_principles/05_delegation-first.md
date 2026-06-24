---
keywords: [principles, delegation, first]
related: [40_delegation/02_routing-rubric.md, 40_delegation/03_delegation-contract.md, 40_delegation/01_expert-registry.md]
---
# 05 — Delegation First (委任ファースト)

委任ファースト原則。「単独 LLM に詰め込まず、専門家エージェントに投げる」を実装レベルで定義する。

## 1. 原則の宣言

```
タスクを受けたら、まず "誰に" 投げるかを決める。
"自分 (主 Orchestrator) で全部やる" は最終手段。
```

## 2. なぜ委任ファーストか

### 2.1 単一エージェントの限界

| 限界 | 帰結 |
|---|---|
| context window 容量 | 巨大ファイル / 長セッションで earlier instruction が忘却される |
| 推論深度の偏り | 1 つの推論路で reasoning が単線化 |
| 並列性の欠如 | 独立タスクを直列に走らせて時間浪費 |
| 出典検証の単独化 | 自分の出力を自分で検証 (sycophancy) |

### 2.2 委任で得られる利得

| 利得 | 根拠 BP |
|---|---|
| 主 context の温存 | BP-007, BP-008 |
| モデル別最安値選定 | BP-002, BP-018 |
| 並列短縮 (最大 ~90%) | BP-003 |
| 独立検証 (生成 ≠ 判定) | BP-024 |
| handoff によるモジュール化 | BP-005 |

## 3. 委任判定アルゴリズム

```text
Step 1: タスクが Runbook に存在するか
  YES → そのまま実行 (45_runbook/INDEX.md)
  NO  → Step 2

Step 2: Expert Registry にカテゴリ一致があるか
  YES → 該当 expert に委任
  NO  → Step 3

Step 3: 該当 Pattern (P-001..P-006) があるか
  YES → Pattern を適用
  NO  → Step 4

Step 4: 主 Orchestrator が直接処理 (最終手段)
  → 完了後、Runbook 化または Registry エントリ追加を検討
```

詳細アルゴリズム: [40_delegation/02_routing-rubric.md](../40_delegation/02_routing-rubric.md)

## 4. 委任契約 (Delegation Contract)

委任は 4 点を必ず明示する (BP-004):

```yaml
delegation:
  objective: <達成すべき goal を 1 行で>
  expected_output:
    format: markdown | json | yaml | text
    fields: [<field1>, <field2>]
    max_size: <token 上限>
  scope_boundary:
    do: [<やってよいこと>]
    do_not: [<触ってはいけないこと>]
  tool_guidance:
    preferred: [<tool ID>]
    forbidden: [<tool ID>]
  cost_cap: <token 予算>
  citation_requirement: L1 必須 / L2 補助 / L3 禁止
```

詳細: [40_delegation/03_delegation-contract.md](../40_delegation/03_delegation-contract.md)

## 5. 委任先カテゴリの全体像

| Category | 担当 | 代表 expert |
|---|---|---|
| planner | 計画分解・段階化 | planner |
| architect | 構造設計 | architect |
| reviewer | コード品質 | code-reviewer, lang-reviewer |
| security | セキュリティ | security-reviewer |
| tester-tdd | TDD ループ | tdd-guide, tdd-workflow |
| builder-fixer | 実装・build 修復 | lang-build-resolver |
| explorer-research | 探索・調査 | Explore, deep-research, codebase-onboarding |
| taste | 命名・UI・コピー | taste, frontend-design-direction, brand-voice |
| orchestration-hub | 全体オケ | orch-pipeline |

詳細: [40_delegation/01_expert-registry.md](../40_delegation/01_expert-registry.md)

## 6. 並列起動のルール

### 6.1 同時起動の条件

- 各タスクの入力に依存関係がない
- 各 expert の `parallel_safe: true`
- 主 Orchestrator は同一メッセージ内で複数 Agent 呼び出しをまとめる

### 6.2 並列起動の禁止条件

| 状況 | 禁止理由 |
|---|---|
| タスク B の入力にタスク A の出力が必要 | 依存違反 |
| 共有 mutable 状態 (DB / FS) を同じパスで触る | 競合 |
| `parallel_safe: false` の expert を含む | Registry 違反 |
| 後続 synthesis 用に順序が決まっている | 依存違反 |

### 6.3 並列起動コードの例

```text
# 良い例 (1 メッセージで 3 並列起動)
Agent(subagent_type="Explore", prompt="<grep target A>")
Agent(subagent_type="Explore", prompt="<grep target B>")
Agent(subagent_type="docs-lookup", prompt="<library X docs>")

# 悪い例 (sequential)
Agent(subagent_type="Explore", prompt="A") → 結果待ち
Agent(subagent_type="Explore", prompt="B") → 結果待ち
Agent(subagent_type="docs-lookup", prompt="X") → 結果待ち
```

## 7. 自己処理してよい例外

委任ファーストでも、以下は主 Orchestrator が直接処理してよい:

| 状況 | 理由 |
|---|---|
| 1 ファイル ≤ 50 行の単純編集 | 委任オーバーヘッドの方が大きい |
| Runbook を grep するだけ | 委任不要 |
| 既知 fact の言い換え | 出典付きで主が応答 |
| ユーザーへの確認質問 1 行 | 委任は迂回路 |

判定の境界: タスクが「explore / plan / implement / commit」の Plan モード ([22] BP-022) を要するなら委任。要しないなら主処理可。

## 8. アンチパターン

| アンチパターン | 起きること | 対処 |
|---|---|---|
| 「自分でやれば早い」と単独遂行 | 主 context が肥大して後段で性能崩壊 | Registry を必ず引く |
| 委任先に open-ended な指示 | 出力形式が揃わず synthesis 不能 | BP-004 の 4 点必須 |
| 全タスクに Opus を配置 | コスト爆発 | BP-002, BP-018 で軽 = Haiku |
| 同じ expert に判定も生成も任せる | self-review が機能しない | 別個体に分離 (BP-024) |
| 並列性が成立するのに sequential | 時間浪費 (BP-003 違反) | 同一メッセージで複数 spawn |

## 9. 原則 / 7 Habits との対応

| North Star / 原則 | 関連 |
|---|---|
| 委任ファースト原則 (本原則) | 中核 |
| センス委譲原則 | taste カテゴリへの委任で実装 |
| ゼロ重複原則 | Runbook 引きを委任前段に挿入 |
| Habit 6 (Synergize) | 並列・対抗評価で 1 + 1 > 2 |

## 10. 関連 Best Practices

| BP-ID | 関連性 |
|---|---|
| BP-001 | 独立 context window |
| BP-002 / BP-018 | モデル別最安値 |
| BP-003 | 並列起動 |
| BP-004 | 明示契約 |
| BP-005 | handoff |
| BP-006 | 複雑度に応じた scale |
| BP-008 | ファイル探索の委任 |
| BP-024 | 独立 reviewer |

## 出典

- Anthropic Engineering, Built multi-agent research system: https://www.anthropic.com/engineering/built-multi-agent-research-system (retrieved_at: 2026-06-23)
- Anthropic Claude Code Sub-agents: https://code.claude.com/docs/en/sub-agents (retrieved_at: 2026-06-23)
- Anthropic Claude Code Best Practices: https://code.claude.com/docs/en/best-practices (retrieved_at: 2026-06-23)
- OpenAI Agents SDK: https://openai.github.io/openai-agents-python/ (retrieved_at: 2026-06-23)
- best_practices.json BP-001..006, BP-008, BP-018, BP-024 (`./05_principles/_data/best_practices.json`)

## 不確実性

- §6.3 のコード例は擬似コード。実環境では Agent tool API のシグネチャに合わせる。
- §7 「自己処理してよい例外」の境界 (50 行) は経験則であり、ドメインによって調整余地あり (未検証)。
