---
keywords: [overview, glossary]
related: [40_delegation/04_orchestrator-system-prompt.md, 40_delegation/01_expert-registry.md, 40_delegation/02_routing-rubric.md, 40_delegation/03_delegation-contract.md, 45_runbook/01_runbook-spec.md]
---
# 04 — Glossary (用語集)

ecc-method を読むうえで前提となる用語を定義する。各用語は本パッケージ内での意味を優先し、外部一般定義と差がある場合は併記する。

## 1. ECC エコシステム関連

### ECC (Everything Claude Code)

Claude Code 上で agents / skills / MCP / hooks / commands / memory を統合運用するエコシステム。本パッケージの前提環境。

- 出典: Anthropic Claude Code 公式 docs (https://code.claude.com/docs/en/, retrieved_at: 2026-06-23)

### Agent

特定の目的に特化したサブエージェント。独立した context window、スコープされた tool 権限、専用 system prompt を持つ。

- 出典: https://code.claude.com/docs/en/sub-agents (retrieved_at: 2026-06-23)
- 関連 BP: BP-001 (isolated context), BP-002 (model routing)

### Skill

オンデマンドで読み込まれる手続きパッケージ。CLAUDE.md と異なり「呼ばれたときだけ」コストがかかる。

- 出典: https://code.claude.com/docs/en/skills (retrieved_at: 2026-06-23)
- 関連 BP: BP-016 (CLAUDE.md vs Skills)

### MCP (Model Context Protocol)

外部ツール / データソースとエージェントを接続するプロトコル。本パッケージでは playwright / context7 / exa などを扱う。

- 出典: https://modelcontextprotocol.io/ (retrieved_at: 2026-06-23)

### Hook

Tool 実行の前後で deterministic に走るフック (PreToolUse / PostToolUse / Stop)。CLAUDE.md は advisory、Hook は決定的。

- 出典: https://code.claude.com/docs/en/hooks (retrieved_at: 2026-06-23)
- 関連 BP: BP-013, BP-014, BP-015

### Slash Command

`/<name>` で起動するコマンド (例: `/orchestrate`, `/code-review`)。本パッケージ内では [80_commands/](../80_commands/) に登録する。

## 2. パッケージ独自概念

### Orchestrator

タスクを Expert Registry に基づき適切な専門家に委任・統合する役割。本パッケージの中核ループの呼び出し起点。

- 関連: [40_delegation/04_orchestrator-system-prompt.md](../40_delegation/04_orchestrator-system-prompt.md)

### Expert Registry

Agent / Skill / MCP を Role 別にカタログ化した一覧。Layer 0 (ECC native) / Layer 1 (編成パターン) / Layer 2 (案件カスタム) の 3 層。

- 関連: [40_delegation/01_expert-registry.md](../40_delegation/01_expert-registry.md)

### Routing Rubric

タスク → 専門家 → モデルのマッピング判定アルゴリズム。重要度・ドメイン・並列性で決定木が走る。

- 関連: [40_delegation/02_routing-rubric.md](../40_delegation/02_routing-rubric.md)

### Delegation Contract

委任時の入出力 / 期待形式 / scope 境界 / cost 上限 / 出典要件を明文化した契約。

- 関連: [40_delegation/03_delegation-contract.md](../40_delegation/03_delegation-contract.md)
- 関連 BP: BP-004 (explicit handoff)

### Runbook

再現可能・冪等な手続き書。1 手続き 1 ファイル。`45_runbook/INDEX.md` から検索する。

- 関連: [45_runbook/01_runbook-spec.md](../45_runbook/01_runbook-spec.md)

### Capture Trigger

新しい手続きが完了したとき「Runbook 化すべきか」を判定する基準。

- 関連: [45_runbook/03_capture-trigger.md](../45_runbook/03_capture-trigger.md)

### Quality Gate

成果物が「完了」扱いになる前に通過する半自動チェック (fact-check / 独立検証 / red-team / uncertainty disclosure / 禁止語 / 個人情報 / context budget)。

- 関連: [60_quality-gates/07_gate-checklist.md](../60_quality-gates/07_gate-checklist.md)

### Drift

仕様 (SDD) と実装 (Code) の乖離。検知時はコードより先にスペックを更新する。

- 関連: [55_verification/02_drift-detection.md](../55_verification/02_drift-detection.md)

### Self-Evolution

Method 自体の鮮度判定・自動更新ループ。`last_verified` 監視・四半期 industry radar・健全性 KPI を含む。

- 関連: [75_self-evolution/](../75_self-evolution/)

## 3. 開発手法関連

### SDD (Spec-Driven Development)

仕様を実行可能な成果物として扱い、PRD → requirements → design → tasks の順で固める手法。

- 出典: GitHub spec-kit https://github.com/github/spec-kit (retrieved_at: 2026-06-23)
- 関連 BP: BP-020

### TDD (Test-Driven Development)

Red → Green → Refactor を徹底する手法。テストを先に書く。

- 出典: Martin Fowler https://martinfowler.com/bliki/TestDrivenDevelopment.html (retrieved_at: 2026-06-23)
- 関連 BP: BP-021

### Trunk-Based Development

短命ブランチで mainline に頻繁に統合する手法。複数エージェントが並行コミットする際の前提。

- 出典: https://trunkbaseddevelopment.com/ (retrieved_at: 2026-06-23)
- 関連 BP: BP-023

### Red-Team Loop

生成 ≠ 判定 ≠ 反論 を別エージェントに分けて重要決定をストレステストする手順。

- 関連: [60_quality-gates/06_red-team-loop.md](../60_quality-gates/06_red-team-loop.md)
- 関連 BP: BP-024, BP-025

### Anti-Sycophancy

「できました」と言わせず、テスト出力 / コマンド出力 / スクリーンショット等の証拠を要求する慣行。

- 関連 BP: BP-027, BP-028, BP-029

## 4. 出典レベル

| レベル | 内容 | 採用可否 |
|---|---|---|
| L1 | 公式 docs / 公開リポ / 公式仕様書 | 必須 |
| L2 | 著者特定の一次情報 (公式 blog / 論文) | 補助的に許可 |
| L3 | モデル知識単独 | 禁止 |

- 関連: [25_writing-style/03_citation-style.md](../25_writing-style/03_citation-style.md)

## 5. モデル / コスト用語

### model_hint

Registry エントリの推奨モデル。`opus` / `sonnet` / `haiku` / 外部 LLM のいずれか。

### cost_tier

`low` / `mid` / `high` / `premium` の 4 段階。Routing で重要度と組み合わせて選定する。

- 関連 BP: BP-018

### Prompt Cache

Claude API の prompt caching 機能。安定したプレフィックスを cache 化することで通常入力 token の約 10% コストで利用可能。

- 出典: https://platform.claude.com/docs/en/docs/build-with-claude/prompt-caching (retrieved_at: 2026-06-23)
- 関連 BP: BP-010, BP-030

## 6. ファイル / ディレクトリ命名

| 規約 | 例 |
|---|---|
| 章ディレクトリ | `<NN>_<kebab-name>/` (例: `40_delegation/`) |
| ファイル | `<NN>_<kebab-name>.md` (例: `01_expert-registry.md`) |
| Runbook | `RB-<NNN>-<kebab-slug>.md` |
| Pattern | `P-<NNN>-<name>` |
| Best Practice | `BP-<NNN>` |
| 機能 ID | `F<NN>-<kebab>` |
| 受入基準 | `AC-<NN>` |

## 出典

- Anthropic Claude Code 公式 docs: https://code.claude.com/docs/en/ (retrieved_at: 2026-06-23)
- Anthropic Engineering, Built multi-agent research system: https://www.anthropic.com/engineering/built-multi-agent-research-system (retrieved_at: 2026-06-23)
- OpenAI Agents SDK: https://openai.github.io/openai-agents-python/ (retrieved_at: 2026-06-23)
- GitHub spec-kit: https://github.com/github/spec-kit (retrieved_at: 2026-06-23)
- Martin Fowler TDD: https://martinfowler.com/bliki/TestDrivenDevelopment.html (retrieved_at: 2026-06-23)
- Trunk-Based Development: https://trunkbaseddevelopment.com/ (retrieved_at: 2026-06-23)
- Model Context Protocol: https://modelcontextprotocol.io/ (retrieved_at: 2026-06-23)

## 不確実性

- 用語の定義は本パッケージ内優先。外部一般定義と差がある場合は本ファイル基準で運用する。
- ECC エコシステムは更新頻度が速いため、用語追加 / 改廃は四半期再検証が前提 (詳細: [75_self-evolution/01_freshness-policy.md](../75_self-evolution/01_freshness-policy.md))。
