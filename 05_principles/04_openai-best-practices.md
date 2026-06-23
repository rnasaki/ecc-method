# 04 — OpenAI Agents SDK / Codex CLI ベストプラクティス参照集

OpenAI Agents SDK と Codex CLI のドキュメントから、本パッケージで採用しているベストプラクティスを参照集としてまとめる。

ID は `./05_principles/_data/best_practices.json` の BP-NNN に対応する (retrieved_at: 2026-06-23)。

## 1. Agents SDK の中核概念

### Agent

LLM + instructions + tools + handoff 設定を持つ単位。

- **出典**: https://openai.github.io/openai-agents-python/ (retrieved_at: 2026-06-23)

### Handoff

別 Agent への明示的な制御移譲。Agent 間で会話状態と context を引き渡す。

- **出典**: https://openai.github.io/openai-agents-python/handoffs/ (retrieved_at: 2026-06-23)

### Tool

Agent が呼び出せる外部関数 / API。Function Calling と同形。

- **出典**: https://openai.github.io/openai-agents-python/tools/ (retrieved_at: 2026-06-23)

### Tracing

Agent 実行のログ・可視化。debug と eval に必須。

- **出典**: https://openai.github.io/openai-agents-python/tracing/ (retrieved_at: 2026-06-23)

## 2. 採用しているベストプラクティス

### BP-005: 専門 Agent + handoff で構成 (monolith 禁止)

各 Agent を狭い能力に集中させ、handoff で繋ぐ。再利用性とモジュール性が上がる。

- **アンチパターン**: 1 Agent が plan / code / review を全部担当しボトルネック化。
- **出典**: https://openai.github.io/openai-agents-python/ (retrieved_at: 2026-06-23)
- **本パッケージ**: [40_delegation/01_expert-registry.md](../40_delegation/01_expert-registry.md), [40_delegation/06_handoff-patterns.md](../40_delegation/06_handoff-patterns.md)

## 3. Codex CLI 関連

OpenAI Codex CLI は ECC と並走可能なエージェント CLI。本パッケージでは選択肢として記述する。

- **出典**: https://platform.openai.com/docs/codex (retrieved_at: 2026-06-23, ページ存在は要再検証)
- **位置付け**: 本パッケージは ECC を主、Codex CLI を補助委任先として扱う ([07_multi-llm-routing.md](./07_multi-llm-routing.md))。

### Codex を使う場面 (本パッケージの整理)

| 状況 | 採用判断 |
|---|---|
| Sonnet 系で十分なコード生成 | ECC を主、Codex は不要 |
| 大量の boilerplate / 単純 refactor | Codex に逃がしてコスト削減 |
| Opus 推論が必要な orchestration | ECC で実施、Codex は worker 候補 |

## 4. ハンドオフ設計の指針

### 4.1 出力形式の固定

handoff 先 Agent には次の 4 点を必ず渡す (BP-004 と整合):

```yaml
handoff_payload:
  objective: <この handoff で達成すべき goal>
  expected_output_format: <markdown / json / yaml etc.>
  scope_boundary: <やってよい範囲 / NG 範囲>
  tool_guidance: <どの tool を使うべきか>
```

### 4.2 名前空間の分離

handoff 先 Agent の context には:

- 親 Agent の system prompt は **継承しない** (独立 context window)
- 必要事実は `additionalContext` 風に渡す (BP-028)

### 4.3 完了条件の明示

handoff の戻り値が「成功 / 失敗 / 不明」のいずれを示すかを Agent 側で決定可能にする (BP-027 の証拠提示)。

## 5. Tool 設計のベストプラクティス

### 5.1 Tool 名は動詞句

- `search_codebase`, `run_tests`, `read_file` のように動作主体で名づける
- 名前で意図が分かれば prompt の冗長記述が減る

### 5.2 Tool の input schema は最小限

- 必須引数のみを必須扱い
- enum / regex で制約をかけ、自由文を許容しない

### 5.3 Tool の戻り値は構造化

- 自由文より JSON / YAML の方が後段 Agent で扱いやすい
- エラーは別フィールドに分離

## 6. Tracing と eval

### 6.1 Tracing の最低要件

| 項目 | 用途 |
|---|---|
| run_id | 実行の一意識別 |
| agent_id | どの Agent で起きたか |
| tool_calls | 呼び出した tool 名 + 引数 + 戻り値 |
| handoffs | どの Agent に handoff したか |
| token_usage | input / output の token 数 |
| duration | wall-clock 時間 |

### 6.2 Eval ハーネス

- rubric base (5 軸: accuracy / completeness / clarity / actionability / conciseness)
- 出典: BP-026 と整合
- 本パッケージ: [60_quality-gates/03_eval-rubric.md](../60_quality-gates/) (パスは導入先で運用)

## 7. ECC と Agents SDK の橋渡し

| 概念 | ECC 側 | Agents SDK 側 |
|---|---|---|
| Agent | Sub-agent (frontmatter で `model` 指定) | Agent (Python class) |
| Tool | Tool API + MCP | Tool decorator / function |
| Handoff | Pattern (P-NNN) で表現 | Handoff オブジェクト |
| Context | Slash command / CLAUDE.md / Skills | Run context / additionalContext |
| Eval | agent-evaluator | Tracing + custom rubric |

## 8. ハイブリッド運用の典型パターン

### 8.1 ECC を Orchestrator にし、Agents SDK 側は worker

```text
[ECC Orchestrator (Opus)]
     ├── handoff → [Agents SDK worker A] (代替モデル)
     └── handoff → [Agents SDK worker B] (代替モデル)
```

ECC が rubric judge と最終 synthesis を担当し、worker は一次タスクをこなす。

### 8.2 ECC と Agents SDK で生成 / 反論を分離

```text
generator: Agents SDK Agent (異なる LLM 系)
judge:     ECC agent-evaluator (Sonnet)
refuter:   ECC planner ("refute を試みよ")
```

異なる系統の LLM を採用することで、判定の独立性をさらに高める。詳細: [60_quality-gates/06_red-team-loop.md](../60_quality-gates/06_red-team-loop.md)

## 9. アンチパターン

| アンチパターン | 起きること |
|---|---|
| ECC と Agents SDK で同じ context を二重保持 | tracing の整合が取れない / 矛盾発生 |
| handoff 時に system prompt を継承させる | 独立 context window の利点を消す |
| 主モデルを全 worker で使う | コスト爆発 (BP-002, BP-018 違反) |
| 出力形式を自然文だけにする | 後段 parse 不能 / chain が壊れる |

## 出典

- OpenAI Agents SDK: https://openai.github.io/openai-agents-python/ (retrieved_at: 2026-06-23)
- OpenAI Agents SDK Handoffs: https://openai.github.io/openai-agents-python/handoffs/ (retrieved_at: 2026-06-23)
- OpenAI Agents SDK Tools: https://openai.github.io/openai-agents-python/tools/ (retrieved_at: 2026-06-23)
- OpenAI Agents SDK Tracing: https://openai.github.io/openai-agents-python/tracing/ (retrieved_at: 2026-06-23)
- OpenAI Codex (CLI 概念): https://platform.openai.com/docs/codex (retrieved_at: 2026-06-23, 要再検証)
- best_practices.json: BP-004, BP-005, BP-027, BP-028 (`./05_principles/_data/best_practices.json`)

## 不確実性

- Codex CLI の機能仕様は時期によって変動が激しい。本ファイルの記述は概念整理にとどめ、具体的な機能名や CLI option は導入時に再確認すること (未検証)。
- 「ECC と Agents SDK のハイブリッド運用」は本パッケージの整理であり、両者公式が共同で推奨しているわけではない (本パッケージ独自整理)。
