---
keywords: [delegation, self, bootstrap, loop]
related: []
---
# 05 — Self-Bootstrap Loop

新しい案件・新しいリポを引き取った瞬間に、Orchestrator が自動で走らせる起動ループ。Discovery → Method 適用 → 専門家編成 → 初動 Runbook 化までを 1 サイクルで閉じる。

## 目的

- 案件投入時に「何から手を付けるか」を人手で都度判断しない
- Discovery の成果を Registry / Runbook の更新に確実に流し込む
- Layer 2 (案件カスタム) のエントリを早期に立ち上げる

## 適用契機

| 契機 | 説明 |
|---|---|
| 新規リポ引き継ぎ | 過去履歴 / SSOT が未読の状態 |
| 既存リポへの大規模機能投入 | 触る範囲が新領域 |
| 環境差分の確定 | OS / 言語 / ネットワーク前提が変わった |
| 専門家不在検知 | Routing で該当 expert が見つからない |

## ループ構造

```
[T0] 起動シグナル
   └─> Step A: Discovery 並列起動 (Pattern P-004)
        └─> Step B: Discovery レポート synthesis
             └─> Step C: Registry / INDEX 差分検出
                  └─> Step D: Layer 2 エントリ草案 + Runbook 化判断
                       └─> Step E: 初動タスクの Routing 決定
                            └─> Step F: 完了レポート出力 → 通常運用へ遷移
```

## Step A: Discovery 並列起動

`40_delegation/01_expert-registry.md` の Pattern P-004 をそのまま採用する。

```yaml
parallel_calls:
  - codebase-onboarding (skill)
  - Explore: 構造とエントリポイントを grep
  - Explore: 設定ファイル / 環境変数 / 依存を grep
  - Explore: テスト / CI / Runbook 候補を grep
  - docs-lookup: 主要言語 / FW の公式 docs (必要時)
```

呼び出しは同一メッセージ内に並べる (BP-003)。

## Step B: Synthesis

Discovery の成果を以下スキーマで `_tmp/discovery_report.json` に書き出す:

```json
{
  "retrieved_at": "YYYY-MM-DD",
  "languages": ["python", "typescript"],
  "frameworks": ["fastapi", "react"],
  "entry_points": ["./backend/main.py", "./frontend/src/App.tsx"],
  "test_runners": ["pytest", "vitest"],
  "ci_config": ["./.github/workflows/ci.yml"],
  "secrets_locations": ["./.env (gitignore済)"],
  "missing_experts": ["fastapi-reviewer は Registry にあり、追加不要"],
  "open_questions": ["デプロイ先未確定"]
}
```

統合は `agent-evaluator` で 5 軸採点 (BP-026)。accuracy / completeness が閾値未満なら Step A に戻す。

## Step C: Registry / INDEX 差分検出

```
Step C-1: 既存 Registry (40_delegation/01_expert-registry.md) を引き、
          Discovery で出た言語 / FW に対応する expert があるか確認。
Step C-2: 既存 INDEX (45_runbook/INDEX.md) を引き、
          類似 trigger の Runbook が無いか確認。
Step C-3: ギャップを以下に分類:
          - GAP-A: Registry に expert なし → Layer 2 草案
          - GAP-B: Runbook なし → 03_capture-trigger.md で要否判定
          - GAP-C: あるが last_verified が stale → 更新キュー
```

## Step D: Layer 2 エントリ草案 + Runbook 化判断

GAP-A は `01_expert-registry.md` のエントリスキーマで草案を作成し、`_tmp/layer2_draft.yaml` に置く。

```yaml
- id: <案件特有 expert id>
  category: <role>
  layer: user custom
  source_path_or_url: <案件内パス>
  description: <≤120 chars>
  model_hint: <opus | sonnet | haiku>
  parallel_safe: <bool>
  cost_tier: <low | mid | high>
  best_for: [...]
  not_for: [...]
  routing_keywords: [...]
  last_verified: YYYY-MM-DD
```

ユーザー承認後に Registry へ追記する (Layer 2 セクション)。

GAP-B は `45_runbook/03_capture-trigger.md` の判定木に通し、Runbook 化する場合は `01_runbook-spec.md` のフォーマットで起草する。

## Step E: 初動タスクの Routing

Discovery で確定した languages / frameworks を入力に、`02_routing-rubric.md` の決定木を 1 周回す。出力例:

```json
{
  "first_actions": [
    {"task": "build 確認", "experts": ["python-build-resolver"], "reason": "main entrypoint 起動成否を最初に確認"},
    {"task": "test 走行", "experts": ["tdd-workflow"], "reason": "現状 coverage を baseline 化"},
    {"task": "依存監査", "experts": ["security-reviewer"], "reason": "新規依存に対する脆弱性確認"}
  ]
}
```

## Step F: 完了レポート

`_tmp/bootstrap_report.md` に以下を出力する:

```markdown
# Bootstrap Report — YYYY-MM-DD

## Discovery 要約
<Step B の synthesis を 200 字以内で要約>

## Registry 差分
- 追加候補: <id, ...>
- 更新候補: <id, ...>

## Runbook 差分
- 追加候補: <RB 草案 path>
- 更新候補: <RB id>

## 初動タスク
1. <task> (担当: <expert>)
2. ...

## 未解決の Open Question
- <question>
```

このレポートが Step F の AC。ユーザー承認後に通常運用 (`04_orchestrator-system-prompt.md` の常時ループ) に切り替わる。

## ループの終了条件

- `_tmp/discovery_report.json` の `open_questions` が空 (または ASK で確定)
- Layer 2 草案がユーザー承認済み
- 初動タスクの Routing が決定済み

未解決が残る場合は、解決手段を Runbook 化候補としてマークし、ループ自体は完了させる (永遠に Discovery を続けない)。

## 失敗パターン

| 症状 | 原因 | 対処 |
|---|---|---|
| Discovery が冗長で context 食い | Explore に範囲指定なし | 各 Explore に grep スコープを明示 |
| Layer 2 草案が乱立 | GAP-A の閾値が緩い | Routing 頻度 ≥ 2 のみ追加対象に絞る |
| 初動タスクの優先順が決まらない | Step E のスコアリング不在 | cost × impact 簡易マトリクスを併用 |
| 同じ Discovery を毎回走らせる | Bootstrap 結果が永続化されていない | `_tmp/` ではなく `45_runbook/runbooks/` に bootstrap 済 Runbook として残す |

## 出典

- BP-003: Anthropic Engineering "Built multi-agent research system" (https://www.anthropic.com/engineering/built-multi-agent-research-system, retrieved 2026-06-23)
- BP-005: OpenAI Agents SDK (https://openai.github.io/openai-agents-python/, retrieved 2026-06-23)
- BP-026: 同上 (https://www.anthropic.com/engineering/built-multi-agent-research-system, retrieved 2026-06-23)
- 内部 SSOT: `40_delegation/01_expert-registry.md` Pattern P-004

## 不確実性

- Discovery の並列数 (Explore × N) はリポ規模依存。小規模リポでは × 2 で足りる場合がある。
- Layer 2 草案の追加閾値「Routing 頻度 ≥ 2」は経験則。プロジェクト規模に応じ調整。
- Step E のスコアリング (cost × impact) は本パッケージで未定義。導入先で別途仕様化する。
