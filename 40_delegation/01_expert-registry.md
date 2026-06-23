# 01 — Expert Registry

専門家エージェント・スキル・MCP を Role 別にカタログ化した中核レジストリ。Orchestrator はタスクを受けたらまずここを引く。

## レイヤ構造

> 本章で「Layer 0 / 1 / 2」と書くものはすべて **Registry Layer** (専門家レジストリ階層) を指す。Memory layer / Escalation level / Detection tier とは別概念。

| レイヤ | 内容 | 例 |
|---|---|---|
| Registry Layer 0: ECC native | Claude Code 公式・公開エコの agents / skills / MCP | `planner`, `architect`, `code-reviewer`, `tdd-workflow` |
| Registry Layer 1: 編成パターン | Registry Layer 0 の組み合わせ・優先順・並列性のレシピ | "PRD 着手時は planner + architect を並列" |
| Registry Layer 2: 案件カスタム | プロジェクト固有の専門家 (人間レビュアー含む) | (案件導入時に追加) |

本リポは Registry Layer 0 と Registry Layer 1 を提供する。Registry Layer 2 は導入先で追記する。

## エントリスキーマ

```yaml
- id: <string>                    # 一意の識別子
  category: <role>                # planner | architect | reviewer | builder-fixer | explorer-research | tester-tdd | taste | security | orchestration-hub
  layer: ECC native | platform doc | user custom   # Registry Layer (0/1/2) のいずれか
  source_path_or_url: <string>
  description: <≤120 chars>
  model_hint: opus | sonnet | haiku | gpt-5.5 | null
  parallel_safe: true | false | null
  cost_tier: low | mid | high | premium
  best_for: [<keyword>]
  not_for: [<keyword>]
  routing_keywords: [<keyword>]
  last_verified: YYYY-MM-DD
```

`last_verified` は鮮度判定用。180 日経過で `stale` 警告 ([75_self-evolution/01_freshness-policy.md](../75_self-evolution/01_freshness-policy.md))。

## Registry Layer 0: ECC native (代表選抜)

### planner (重要度: 最重要)

```yaml
- id: planner
  category: planner
  layer: ECC native
  source_path_or_url: <ecc>/agents/planner
  description: 複雑機能の段階分解。SDD 起点の専門家
  model_hint: opus
  parallel_safe: false
  cost_tier: premium
  best_for: [feature planning, refactoring, architecture decision]
  not_for: [simple bug fix, single-file edit]
  routing_keywords: [plan, design, decompose, refactor, architecture]
  last_verified: 2026-06-23
```

### architect (重要度: 最重要)

```yaml
- id: architect
  category: architect
  layer: ECC native
  source_path_or_url: <ecc>/agents/architect
  description: システム設計・スケーラビリティ・技術選定
  model_hint: sonnet
  parallel_safe: true
  cost_tier: high
  best_for: [system design, scalability, tech selection]
  not_for: [implementation detail, code review]
  routing_keywords: [architect, system, scale, design]
  last_verified: 2026-06-23
```

### code-reviewer (重要度: 中)

```yaml
- id: code-reviewer
  category: reviewer
  layer: ECC native
  source_path_or_url: <ecc>/agents/code-reviewer
  description: 一般コード品質・セキュリティ・保守性のレビュー
  model_hint: sonnet
  parallel_safe: true
  cost_tier: mid
  best_for: [code quality, after writing code, before commit]
  not_for: [new design, spec drafting]
  routing_keywords: [review, lint, quality, after-write]
  last_verified: 2026-06-23
```

### security-reviewer (重要度: 最重要)

```yaml
- id: security-reviewer
  category: security
  layer: ECC native
  source_path_or_url: <ecc>/agents/security-reviewer
  description: OWASP / 認証 / シークレット / 入力検証のレビュー
  model_hint: sonnet
  parallel_safe: true
  cost_tier: high
  best_for: [auth, payments, user input, external API, secrets]
  not_for: [pure UI, documentation]
  routing_keywords: [security, auth, owasp, secret, vulnerability]
  last_verified: 2026-06-23
```

### tdd-guide (重要度: 中)

```yaml
- id: tdd-guide
  category: tester-tdd
  layer: ECC native
  source_path_or_url: <ecc>/agents/tdd-guide
  description: Red → Green → Refactor を強制し coverage 80%+ を要求
  model_hint: sonnet
  parallel_safe: false
  cost_tier: mid
  best_for: [new feature, bug fix, refactor]
  not_for: [research, planning]
  routing_keywords: [tdd, test-first, red-green-refactor]
  last_verified: 2026-06-23
```

### tdd-workflow (重要度: 中)

```yaml
- id: tdd-workflow
  category: tester-tdd
  layer: ECC native
  source_path_or_url: <ecc>/skills/tdd-workflow
  description: TDD ループの skill 版。RED→GREEN→REFACTOR を全工程で強制
  model_hint: null
  parallel_safe: true
  cost_tier: low
  best_for: [feature implementation, regression fix]
  not_for: [exploration, research]
  routing_keywords: [tdd, workflow, test-cycle]
  last_verified: 2026-06-23
```

### verification-loop (重要度: 中)

```yaml
- id: verification-loop
  category: tester-tdd
  layer: ECC native
  source_path_or_url: <ecc>/skills/verification-loop
  description: セッション横断で「言ったことが動くか」を検証する包括ループ
  model_hint: null
  parallel_safe: true
  cost_tier: low
  best_for: [task completion validation, drift detection]
  not_for: [planning]
  routing_keywords: [verify, validation, completion-check]
  last_verified: 2026-06-23
```

### orch-pipeline (重要度: 最重要)

```yaml
- id: orch-pipeline
  category: orchestration-hub
  layer: ECC native
  source_path_or_url: <ecc>/skills/orch-pipeline
  description: Research-Plan-TDD-Review-Commit を gated パイプラインで実行
  model_hint: null
  parallel_safe: false
  cost_tier: high
  best_for: [end-to-end feature delivery, multi-step orchestration]
  not_for: [trivial single-file edit]
  routing_keywords: [orchestrate, pipeline, end-to-end, gate]
  last_verified: 2026-06-23
```

### Explore (重要度: 軽)

```yaml
- id: Explore
  category: explorer-research
  layer: ECC native
  source_path_or_url: <ecc>/agents/Explore
  description: read-only 検索・ファイル把握。並列起動向き
  model_hint: haiku
  parallel_safe: true
  cost_tier: low
  best_for: [find files, grep symbols, locate definitions]
  not_for: [code review, design audit]
  routing_keywords: [find, locate, grep, search]
  last_verified: 2026-06-23
```

### docs-lookup (重要度: 軽)

```yaml
- id: docs-lookup
  category: explorer-research
  layer: ECC native
  source_path_or_url: <ecc>/agents/docs-lookup
  description: ライブラリ / API / 設定の公式ドキュメント参照
  model_hint: haiku
  parallel_safe: true
  cost_tier: low
  best_for: [library API, framework setup, config option]
  not_for: [implementation, design]
  routing_keywords: [docs, library, api, framework]
  last_verified: 2026-06-23
```

### codebase-onboarding (重要度: 中)

```yaml
- id: codebase-onboarding
  category: explorer-research
  layer: ECC native
  source_path_or_url: <ecc>/skills/codebase-onboarding
  description: 未知リポを構造から把握する skill
  model_hint: null
  parallel_safe: true
  cost_tier: low
  best_for: [new repo discovery, feature location]
  not_for: [implementation]
  routing_keywords: [onboard, unknown-repo, discovery]
  last_verified: 2026-06-23
```

### taste (重要度: 中)

```yaml
- id: taste
  category: taste
  layer: ECC native
  source_path_or_url: <ecc>/skills/taste
  description: 「機能ではなく感じ」を作る創造演出レイヤ。命名・UI・コピーの判断
  model_hint: sonnet
  parallel_safe: true
  cost_tier: high
  best_for: [naming, UI direction, copy, brand voice]
  not_for: [implementation, debug]
  routing_keywords: [taste, naming, ui, copy, design]
  last_verified: 2026-06-23
```

### frontend-design-direction (重要度: 中)

```yaml
- id: frontend-design-direction
  category: taste
  layer: ECC native
  source_path_or_url: <ecc>/skills/frontend-design-direction
  description: フロントエンドのデザイン方向性 (色 / レイアウト / モーション)
  model_hint: sonnet
  parallel_safe: true
  cost_tier: mid
  best_for: [UI design, visual hierarchy, design system]
  not_for: [backend, infra]
  routing_keywords: [frontend, design, ui, visual]
  last_verified: 2026-06-23
```

### make-interfaces-feel-better (重要度: 中)

```yaml
- id: make-interfaces-feel-better
  category: taste
  layer: ECC native
  source_path_or_url: <ecc>/skills/make-interfaces-feel-better
  description: UI の「感触」を磨く専門 skill
  model_hint: sonnet
  parallel_safe: true
  cost_tier: mid
  best_for: [UX polish, interaction feel]
  not_for: [logic, data]
  routing_keywords: [ui-feel, ux-polish, interaction]
  last_verified: 2026-06-23
```

### brand-voice (重要度: 中)

```yaml
- id: brand-voice
  category: taste
  layer: ECC native
  source_path_or_url: <ecc>/skills/brand-voice
  description: コピー・ボイスのブランディング判断
  model_hint: sonnet
  parallel_safe: true
  cost_tier: mid
  best_for: [copy, tone, brand]
  not_for: [implementation]
  routing_keywords: [brand, copy, voice, tone]
  last_verified: 2026-06-23
```

### deep-research (重要度: 中)

```yaml
- id: deep-research
  category: explorer-research
  layer: ECC native
  source_path_or_url: <ecc>/skills/deep-research
  description: 多モーダル sweep + deep-read + synthesize の包括調査
  model_hint: sonnet
  parallel_safe: true
  cost_tier: high
  best_for: [unknown domain, multi-source synthesis]
  not_for: [trivial lookup]
  routing_keywords: [research, deep-dive, synthesis]
  last_verified: 2026-06-23
```

### agent-evaluator (重要度: 最重要)

```yaml
- id: agent-evaluator
  category: reviewer
  layer: ECC native
  source_path_or_url: <ecc>/agents/agent-evaluator
  description: 5 軸 (accuracy / completeness / clarity / actionability / conciseness) で評価
  model_hint: sonnet
  parallel_safe: true
  cost_tier: high
  best_for: [final judge, quality scorecard]
  not_for: [generation, planning]
  routing_keywords: [evaluate, judge, score, final-review]
  last_verified: 2026-06-23
```

### Language Family Roster (代表選抜済)

各言語別の reviewer / build-resolver は以下の family として運用する。Routing 時に言語を検知して family 内から選定する。

```yaml
language_families:
  reviewer_family:
    - python-reviewer (sonnet, mid)
    - typescript-reviewer (sonnet, mid)
    - go-reviewer (sonnet, mid)
    - rust-reviewer (sonnet, mid)
    - java-reviewer (sonnet, mid)
    - kotlin-reviewer (sonnet, mid)
    - swift-reviewer (sonnet, mid)
    - csharp-reviewer (sonnet, mid)
    - php-reviewer (sonnet, mid)
    - cpp-reviewer (sonnet, mid)
    - flutter-reviewer (sonnet, mid)
    - react-reviewer (sonnet, mid)
    - vue-reviewer (sonnet, mid)
    - django-reviewer (sonnet, mid)
    - fastapi-reviewer (sonnet, mid)
  build_resolver_family:
    - react-build-resolver
    - dart-build-resolver
    - python (django-build-resolver)
    - go-build-resolver
    - rust-build-resolver
    - kotlin-build-resolver
    - java-build-resolver
    - swift-build-resolver
    - cpp-build-resolver
    - pytorch-build-resolver
    - django-build-resolver
```

### MCP (Registry Layer 0 / platform doc)

```yaml
mcp_servers:
  - id: mcp__playwright
    category: orchestration-hub
    description: ブラウザ操作・スクリーンショット・GUI 自動化
    routing_keywords: [browser, gui, e2e, screenshot]
  - id: mcp__context7
    category: explorer-research
    description: ライブラリ公式 docs 検索
    routing_keywords: [docs, library, api]
  - id: mcp__exa
    category: explorer-research
    description: web 検索特化
    routing_keywords: [web-search, find-online]
```

## Registry Layer 1: 編成パターン

### Pattern P-001: SDD 起点 (PRD 派生)

```yaml
- id: P-001-sdd-start
  trigger: 新機能の PRD 派生開始
  steps:
    - parallel:
        - planner (重要度: 最重要)
        - architect (補助)
    - synthesis: planner の出力に architect の構造提案を統合
    - cross_verify: agent-evaluator
  expected_output: requirements.md ドラフト
```

### Pattern P-002: TDD ループ

```yaml
- id: P-002-tdd-loop
  trigger: tasks.md の 1 タスク着手
  steps:
    - tdd-guide または tdd-workflow を起動
    - red: 失敗するテストを先に書く
    - green: 最小実装でテストを通す
    - refactor: 重複除去・命名整理
    - lang-reviewer (該当言語) によるレビュー
  expected_output: タスク完了 + tests/* + 実装
```

### Pattern P-003: 重要決定の Red-Team

```yaml
- id: P-003-red-team
  trigger: アーキ / セキュリティ / リリース判断
  steps:
    - generator: planner または architect
    - judge: agent-evaluator (Generator と別個体)
    - refuter: 別 planner を "refute を試みよ" で起動
    - synthesis: orchestrator が rationale で統合
  expected_output: 決定 + 反対意見 + 採用理由
```

### Pattern P-004: 未知リポ Discovery

```yaml
- id: P-004-discovery
  trigger: 新規リポ着手 / 引継ぎ
  steps:
    - parallel:
        - codebase-onboarding (skill)
        - Explore × 3 (異なる角度から並列 grep)
    - synthesis: structure / dependency / entry-point レポート生成
  expected_output: ./_tmp/discovery_report.json
```

### Pattern P-005: センス判断

```yaml
- id: P-005-taste-decision
  trigger: 命名 / UI / コピー / ブランド判断
  steps:
    - generator: taste または brand-voice (ドメイン別)
    - judge: 別 taste 系専門家 (self-review 禁止)
  expected_output: 候補 + 採用案 + 不採用理由
```

## 鮮度管理

各エントリの `last_verified` は四半期ごとに `75_self-evolution/05_industry-radar.md` の手順で更新する。180 日経過した entry は警告対象。

## 出典

- Anthropic Claude Code Sub-agents docs (https://code.claude.com/docs/en/sub-agents, retrieved 2026-06-23)
- Anthropic Engineering: Built multi-agent research system (https://www.anthropic.com/engineering/built-multi-agent-research-system, retrieved 2026-06-23)
- OpenAI Agents SDK (https://openai.github.io/openai-agents-python/, retrieved 2026-06-23)

## 不確実性

- 各エントリの id / source_path_or_url は ECC 公開エコシステムを抽象化して記述している。導入先環境で実体パスへの解決が必要。
- Layer 0 のカタログは 2026-06-23 時点の公開情報に基づく。新規追加・廃止は四半期ベンチで取り込む。
