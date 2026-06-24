---
keywords: [ecc-usage, feature, map]
related: []
---
# 03 — Feature Map (Hub / Skills / Agents / MCP / Memory)

ECC 6 要素を機能カテゴリで整理し、本パッケージの章 / Pattern と紐付ける。

## 1. 全体図

```
┌────────────────────────────── ECC ──────────────────────────────┐
│                                                                 │
│  [Hub]  Orchestration / Slash / Workflows                       │
│   │                                                             │
│   ├── [Agents]      sub-agent カタログ (planner / reviewer 他)  │
│   ├── [Skills]      ナレッジパック (deep-research / taste 他)    │
│   ├── [MCP]         外部リソース (docs / DB / browser)           │
│   ├── [Hooks]       PreToolUse / PostToolUse / Stop              │
│   └── [Memory]      横断記憶 / 設定 / 権限                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 2. Hub (Orchestration)

| 機能 | 用途 | 本パッケージでの参照 |
|---|---|---|
| Multi-Plan / Council | 複数視点の planner を並列 | Pattern P-001, P-003 |
| Workflow | 直列 / 並列のワークフロー定義 | METHOD.md §4 |
| GAN-Harness | 生成 ↔ 評価の対抗ループ | Pattern P-003 |
| dmux / fleet | 多数並列の作業分配 | 04_routing-recipes.md (一括修正) |
| Token-budget-advisor | トークン予算の見える化 | 06_cost-and-context.md |

## 3. Agents

| カテゴリ | 代表 | 章 |
|---|---|---|
| planner | planner / planner-multi | 40_delegation/01_expert-registry.md |
| architect | architect | 40_delegation/01_expert-registry.md |
| reviewer | code-reviewer / lang-reviewer / agent-evaluator | 40_delegation/01_expert-registry.md |
| builder-fixer | lang-build-resolver | 40_delegation/01_expert-registry.md |
| explorer-research | Explore / docs-lookup | 10_discovery/, 75_self-evolution/ |
| tester-tdd | tdd-guide / tdd-workflow | 35_tdd-phase/ |
| taste | taste / brand-voice | Pattern P-005 |
| security | security-reviewer | 60_quality-gates/, Pattern P-003 |

## 4. Skills

| 種別 | 代表 | 用途 |
|---|---|---|
| 学習系 | deep-research / codebase-onboarding | 未知ドメイン / 未知リポ |
| 設計系 | api-design / hexagonal-architecture | 構造化設計 |
| 実装系 | tdd-workflow / refactor-clean | 実装の型 |
| 観点系 | taste / frontend-design-direction | センスの型 |
| 運用系 | deployment-patterns / docker-patterns | デプロイ手順 |
| 品質系 | code-review / security-review | 品質ゲート |

skill は slash 起動 or 自動トリガで Agent が読む。skill 自体は Agent ではない。

## 5. MCP (Model Context Protocol)

| 種別 | 代表 |
|---|---|
| ドキュメント | context7 / docs-lookup |
| 検索 | exa / 他 web 検索 |
| ブラウザ | playwright |
| メディア | videodb / fal-ai-media |

MCP サーバの導入は `15_environment/` で扱う (本章はマップに留める)。

## 6. Hooks

| フェーズ | 例 |
|---|---|
| PreToolUse | コマンド実行前の検査 / パラメタ修正 |
| PostToolUse | 実行後の自動整形 / 成果物検査 |
| Stop | セッション終了時の最終検証 |

hooks は副作用の **再現性確保** に使う。手動チェックを hook に下ろすことで Quality Gate を自動化する。

## 7. Memory / Settings

| 種別 | 用途 |
|---|---|
| project memory | プロジェクト固有のルール / 用語 |
| user memory | 個人共通の運用方針 |
| settings | 権限プリセット / モデル割り当て / hooks 設定 |

`50_permissions/` の consent economy は settings に依存する。

## 8. 機能対応マトリクス

| Need | Hub | Agent | Skill | MCP | Hooks | Memory |
|---|---|---|---|---|---|---|
| 並列調査 | Council | Explore × N | deep-research | docs / exa | - | - |
| 重要決定の対抗評価 | GAN-Harness | planner / agent-evaluator | - | - | - | - |
| 一括修正 | dmux / fleet | builder-fixer | - | - | - | - |
| 未知リポ理解 | Workflow | Explore + onboarding | codebase-onboarding | docs-lookup | - | project memory |
| センス | - | taste / brand-voice | taste / frontend-design-direction | - | - | - |
| コスト最適化 | token-budget-advisor | Haiku 寄せ | - | - | PostToolUse | settings (model) |
| TDD | Workflow | tdd-guide | tdd-workflow | - | PreToolUse (test 強制) | - |
| 規約遵守 | - | doc-updater | - | - | Stop (禁止語 grep) | settings |

## 9. 2026 H1 新機能カタログ (Anthropic / OpenAI)

`retrieved_at: 2026-06-23` で各 URL を確認した結果。`未検証` は本パッケージで動作未確認のもの。

### 9.1 Anthropic Claude Code

```yaml
- id: cc-skills
  category: skills
  description: SKILL.md を on-demand 注入する拡張パック。slash 起動 / Claude 自動起動の双方が可能。
  source: https://code.claude.com/docs/en/skills
  retrieved_at: 2026-06-23
  best_for: [反復手順の再利用, CLAUDE.md 肥大化の回避, sub-agent への dynamic context]
  not_for: [毎回必要な短い事実]
  routing_keywords: [skill, slash, on-demand]

- id: cc-hooks
  category: hooks
  description: ライフサイクル各点 (PreToolUse / PostToolUse / Stop / SessionStart 他) で自動実行されるシェル / HTTP / prompt フック。
  source: https://code.claude.com/docs/en/hooks
  retrieved_at: 2026-06-23
  best_for: [危険コマンドのブロック, 自動 lint, セッション開始時の context 注入]
  not_for: [LLM 推論を毎回伴うチェック (コスト過多)]
  routing_keywords: [hook, PreToolUse, PostToolUse, Stop]

- id: cc-memory-tool
  category: memory
  description: /memories ディレクトリへの client-side ファイル CRUD ツール。会話横断の just-in-time context retrieval を実現。
  source: https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool
  retrieved_at: 2026-06-23
  best_for: [長期 episodic 記憶, 過去案件参照, multi-session 開発の進捗ログ]
  not_for: [機密情報の保存 (path traversal 対策必須)]
  routing_keywords: [memory, episodic, /memories]

- id: cc-extended-thinking
  category: reasoning
  description: budget_tokens で内部推論トークン量を制御する thinking モード。display=summarized で要約表示。
  source: https://platform.claude.com/docs/en/build-with-claude/extended-thinking
  retrieved_at: 2026-06-23
  best_for: [数学 / アルゴリズム設計, 多段論理, ツール使用の事前計画]
  not_for: [短文 Q&A (オーバーヘッド)]
  routing_keywords: [thinking, budget_tokens, adaptive]

- id: cc-computer-use
  category: tool-use
  description: スクリーンショット + マウス / キーボード操作で desktop / browser を駆動するベータツール。
  source: https://platform.claude.com/docs/en/agents-and-tools/computer-use
  retrieved_at: 2026-06-23
  best_for: [GUI のみのレガシ操作, ブラウザ E2E 自動化]
  not_for: [API / CLI で代替できる操作]
  routing_keywords: [computer-use, GUI, screenshot]

- id: cc-routines
  category: orchestration
  description: 保存した prompt + repo + connector を schedule / API / GitHub event でクラウド実行する research preview。
  source: https://code.claude.com/docs/en/routines
  retrieved_at: 2026-06-23
  best_for: [夜間バッチ, アラート起点トリアージ, PR review 自動化]
  not_for: [対話的な探索作業]
  routing_keywords: [routine, schedule, background, /schedule]

- id: cc-agent-view
  category: orchestration
  description: claude agents コマンドで多数の background session を一画面で監視 / dispatch する UI。
  source: https://code.claude.com/docs/en/agent-view
  retrieved_at: 2026-06-23
  best_for: [並列セッション監視, 長時間タスク放置]
  not_for: [single-session の小タスク]
  routing_keywords: [agent-view, background, dispatch]

- id: cc-agent-sdk
  category: sdk
  description: Claude Code の tool ループ / context 管理を Python / TypeScript ライブラリ化。
  source: https://code.claude.com/docs/en/agent-sdk
  retrieved_at: 2026-06-23
  best_for: [CI/CD パイプ組込, カスタムアプリ, 本番自動化]
  not_for: [対話的開発 (CLI の方が速い)]
  routing_keywords: [agent-sdk, library, python, typescript]

- id: cc-plan-mode
  category: planning
  description: read-only の計画フェーズで実装前にレビューを得るモード (VS Code 拡張等で言及)。専用ドキュメントは未検証。
  source: https://code.claude.com/docs/en/ (Plan review 言及)
  retrieved_at: 2026-06-23
  best_for: [計画 / 実装の分離, レビュー前 stage]
  not_for: [短小 fix]
  routing_keywords: [plan, plan-mode, read-only]
  status: 未検証 (専用ページ未発見)
```

### 9.2 OpenAI Agents SDK

```yaml
- id: oa-handoffs
  category: orchestration
  description: あるエージェントが別の専門エージェントへ会話履歴ごと制御を移譲する委譲機構 (transfer_to_<name> ツール)。
  source: https://openai.github.io/openai-agents-python/handoffs/
  retrieved_at: 2026-06-23
  best_for: [専門領域別の振分 (請求 / 払戻 / FAQ), 完全な制御移譲]
  not_for: [親に戻る必要がある一時委任 (Manager / as-tool が適)]
  routing_keywords: [handoff, transfer, delegate]

- id: oa-sessions
  category: memory
  description: SDK 内蔵の会話履歴メモリ。複数 run 間で input / response / tool 呼出を自動保持。
  source: https://openai.github.io/openai-agents-python/sessions/
  retrieved_at: 2026-06-23
  best_for: [マルチターン chat, agent 横断の文脈保持]
  not_for: [conversation_id 等のサーバ側管理と併用 (排他)]
  routing_keywords: [session, conversation, history]

- id: oa-guardrails
  category: safety
  description: 入力 / 出力 / ツール呼出の前後検査。tripwire 発動で例外を上げて run を停止。
  source: https://openai.github.io/openai-agents-python/guardrails/
  retrieved_at: 2026-06-23
  best_for: [低コストモデルでの事前ふるい分け, PII 検査, jailbreak 防御]
  not_for: [複雑な業務ロジック判定 (ツール側で実装)]
  routing_keywords: [guardrail, tripwire, input-check]

- id: oa-tracing
  category: observability
  description: LLM 呼出 / ツール呼出 / handoff / guardrail を span 階層で記録。Traces dashboard で可視化。
  source: https://openai.github.io/openai-agents-python/tracing/
  retrieved_at: 2026-06-23
  best_for: [本番デバッグ, 多段 workflow の可視化, regression 解析]
  not_for: [機密入出力をクラウド送信できない環境 (無効化前提)]
  routing_keywords: [trace, span, dashboard]

- id: oa-voice
  category: io
  description: STT → エージェント → TTS の 3 段で音声入出力を扱う Voice agents。
  source: https://openai.github.io/openai-agents-python/voice/quickstart/
  retrieved_at: 2026-06-23
  best_for: [口頭 handoff, ハンズフリー操作]
  not_for: [長文の構造化出力]
  routing_keywords: [voice, stt, tts, realtime]
  status: 未検証 (gpt-realtime-2 の正式モデル名は本パッケージで未確定)

- id: oa-sandbox-agents
  category: execution
  description: Sandbox agents (隔離実行) として一般化された公式ページは本検証では発見できず。Managed Agents 経由のサンドボックスは Agent SDK の比較表で言及あり。
  source: https://code.claude.com/docs/en/agent-sdk (Managed Agents 比較表)
  retrieved_at: 2026-06-23
  best_for: [Anthropic Managed Agents の sandbox session]
  not_for: [-]
  routing_keywords: [sandbox, managed, isolation]
  status: 未検証 (OpenAI 側の "Sandbox agents" 専用ドキュメントは未発見)
```

## 10. 機能の選び方

`04_routing-recipes.md` で Need → 機能の選定レシピを 10 件以上提示する。本章は **マップ**、04 章は **ルーティング**、二段構成にしてある。

## 11. 失敗例 (避ける)

- すべて Agent で解こうとする (Skill / MCP / Hooks の方が低コストの場面が多い)
- Skill を 1 件しか引かない (skill は組み合わせ前提)
- Memory を全プロジェクトで使い回す (project / user の境界を保つ)
- Routines を対話的探索に使う (research preview, 1h 最小間隔)
- Computer Use を API/CLI 代替手段がある場面に流用する (壊れやすく高コスト)

## 出典

- Anthropic Claude Code 公式 docs (https://code.claude.com/docs/en/, retrieved 2026-06-23)
- Anthropic Claude Code Sub-agents docs (https://code.claude.com/docs/en/sub-agents, retrieved 2026-06-23)
- Anthropic Claude Code Skills (https://code.claude.com/docs/en/skills, retrieved 2026-06-23)
- Anthropic Claude Code Hooks (https://code.claude.com/docs/en/hooks, retrieved 2026-06-23)
- Anthropic Claude Code Routines (https://code.claude.com/docs/en/routines, retrieved 2026-06-23)
- Anthropic Claude Code Agent View (https://code.claude.com/docs/en/agent-view, retrieved 2026-06-23)
- Anthropic Claude Code Agent SDK (https://code.claude.com/docs/en/agent-sdk, retrieved 2026-06-23)
- Anthropic Memory tool (https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool, retrieved 2026-06-23)
- Anthropic Extended Thinking (https://platform.claude.com/docs/en/build-with-claude/extended-thinking, retrieved 2026-06-23)
- Anthropic Computer Use (https://platform.claude.com/docs/en/agents-and-tools/computer-use, retrieved 2026-06-23)
- OpenAI Agents SDK Handoffs (https://openai.github.io/openai-agents-python/handoffs/, retrieved 2026-06-23)
- OpenAI Agents SDK Sessions (https://openai.github.io/openai-agents-python/sessions/, retrieved 2026-06-23)
- OpenAI Agents SDK Guardrails (https://openai.github.io/openai-agents-python/guardrails/, retrieved 2026-06-23)
- OpenAI Agents SDK Tracing (https://openai.github.io/openai-agents-python/tracing/, retrieved 2026-06-23)
- OpenAI Agents SDK Voice (https://openai.github.io/openai-agents-python/voice/quickstart/, retrieved 2026-06-23)
- 本パッケージ 40_delegation/01_expert-registry.md (retrieved 2026-06-23)
- 本パッケージ METHOD.md §5 委任モデル (retrieved 2026-06-23)

## 不確実性

- ECC の 6 要素分類は本パッケージ独自で、ECC 公式の分類とは粒度が異なる。仕様改訂は四半期 radar で追跡する。
- skill / agent の境界は ECC バージョンで揺れる。本章はマップ目的に留め、詳細は導入先 README で補足する。
- Plan mode の専用ドキュメントは本検証時点で公式 URL が見つからず `status: 未検証`。VS Code 拡張等で言及はある。
- OpenAI Agents SDK の Voice モデル (gpt-realtime / gpt-realtime-2) は公式 quickstart で具体名が確認できず、`status: 未検証`。
- Sandbox agents は OpenAI 側の専用ドキュメントが見つからず、Anthropic Managed Agents の sandbox session 概念のみ確認。本章では `status: 未検証` のまま列挙し、四半期 radar で再検証する。
