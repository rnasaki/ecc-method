# 03 — Anthropic 公式ベストプラクティス参照集

Anthropic 公式 docs および Engineering blog から導出されたベストプラクティスを、本パッケージで採用している項目に絞って参照集としてまとめる。

ID は `./05_principles/_data/best_practices.json` の BP-NNN に対応する (retrieved_at: 2026-06-23)。

## 1. サブエージェント設計

### BP-001: 独立 context window と scoped tools

各サブエージェントは独立した context window と専用 system prompt、scoped tool 権限を持つ。

- **根拠**: 主 context が探索ログ・ファイル読みで汚染されるのを防ぎ、最小権限を強制する。
- **適用先**: 検証・調査・並列タスク。
- **アンチパターン**: 1 つのエージェントに全 tool 出力を蓄積する monolithic 構成。
- **出典**: https://code.claude.com/docs/en/sub-agents (retrieved_at: 2026-06-23)
- **本パッケージ**: [40_delegation/01_expert-registry.md](../40_delegation/01_expert-registry.md)

### BP-002: モデルは「タスク難度に応じた最安値」で

サブエージェントの frontmatter の `model` で、Haiku 系 = 軽 / Sonnet 系 = 中 / Opus 系 = 最重要 のように選定する。

- **アンチパターン**: 全エージェントに最高性能モデルを当てる。
- **出典**: https://code.claude.com/docs/en/sub-agents (retrieved_at: 2026-06-23)
- **本パッケージ**: [07_multi-llm-routing.md](./07_multi-llm-routing.md), [40_delegation/02_routing-rubric.md](../40_delegation/02_routing-rubric.md)

### BP-003: 独立タスクは並列起動

独立した調査側面は同一メッセージ内で複数エージェントを spawn する。複雑問合せでは最大 90% の時間短縮が報告されている。

- **アンチパターン**: 依存が無いのに sequential 起動。
- **出典**: https://www.anthropic.com/engineering/built-multi-agent-research-system (retrieved_at: 2026-06-23)
- **本パッケージ**: [40_delegation/06_handoff-patterns.md](../40_delegation/06_handoff-patterns.md)

## 2. 委任設計 (Delegation First)

### BP-004: ハンドオフは明示契約

委任時は (1) 目的 (2) 期待出力形式 (3) tool ガイダンス (4) scope 境界 を明示する。

- **アンチパターン**: 「research X」のような open-ended 指示。
- **出典**: https://www.anthropic.com/engineering/built-multi-agent-research-system (retrieved_at: 2026-06-23)
- **本パッケージ**: [40_delegation/03_delegation-contract.md](../40_delegation/03_delegation-contract.md)

### BP-006: エージェント数とトークンバジェットを問題複雑度に比例させる

事実調べは ~1 エージェント・3-10 tool call、複雑研究は 10+ エージェント等、シグナルで scale する。

- **本パッケージ**: [40_delegation/02_routing-rubric.md](../40_delegation/02_routing-rubric.md)

## 3. コンテキスト経済

### BP-007: 主 context を希少資源として扱う

無関係タスク間で clear / compact し、性能劣化を避ける。

- **アンチパターン**: 「kitchen sink session」(無関係タスク累積)。
- **出典**: https://code.claude.com/docs/en/best-practices (retrieved_at: 2026-06-23)
- **本パッケージ**: [06_context-economy.md](./06_context-economy.md)

### BP-008: 大量ファイル探索はサブエージェントへ

サブエージェントが大量ファイルを読んで要約だけ返す。主 context は要約だけを消費する。

- **本パッケージ**: [10_discovery/](../10_discovery/), Pattern P-004

### BP-009: マルチエージェントは ~15 倍トークンを消費する

予算と外部メモリ運用が前提。

- **本パッケージ**: [40_delegation/05_orchestrator-prompt.md](../40_delegation/), Runbook system

### BP-010: prompt cache の breakpoint 配置

リクエスト間で不変なブロックの末尾に breakpoint を打つ。cache read は通常 input の ~10% コスト。

- **アンチパターン**: 動的内容 (timestamp / per-request input) を cacheable にして cache hit ゼロ。
- **出典**: https://platform.claude.com/docs/en/docs/build-with-claude/prompt-caching (retrieved_at: 2026-06-23)

### BP-030: prompt cache の事前ウォーミング

ユーザー直前に max_tokens=0 の no-op で cache を hot にする。

## 4. 権限・サンドボックス

### BP-011: 既知安全 tool の allowlist 優先

`--dangerously-skip-permissions` ではなく、特定 tool (lint / git commit など) を allowlist に追加する。

- **本パッケージ**: [50_permissions/02_pre-authorized-actions.md](../50_permissions/02_pre-authorized-actions.md)

### BP-012: OS レベル sandbox

無人実行・第三者 MCP・untrusted prompt 時はファイル / ネットワークを sandbox で境界化する。

- **本パッケージ**: [15_environment/](../15_environment/), [50_permissions/](../50_permissions/)

## 5. Hooks

### BP-013: PreToolUse で破壊操作を遮断

CLAUDE.md は advisory、Hook は deterministic。最早の遮断点が PreToolUse。

- **本パッケージ**: [15_environment/03_hooks-policy.md](../15_environment/), [50_permissions/](../50_permissions/)

### BP-014: 狭い matcher と if filter で blast radius 最小化

`*` matcher は重い hook を全 tool 呼び出しで走らせる事態を起こす。

### BP-015: Stop hook で完了を deterministic 検証

テスト / build / screenshot diff を Stop hook で再実行し、合格まで終了させない。

- **本パッケージ**: [55_verification/](../55_verification/), [60_quality-gates/](../60_quality-gates/)

## 6. CLAUDE.md / Skills の使い分け

### BP-016: 全セッション必要なものは CLAUDE.md、用途別は Skills

CLAUDE.md は毎回読込み、長文は埋もれる。Skills は呼ばれたときだけコスト。

- **出典**: https://code.claude.com/docs/en/skills (retrieved_at: 2026-06-23)
- **本パッケージ**: 本パッケージ自体が Skills 寄りの設計 ([45_runbook/](../45_runbook/))

### BP-017: CLAUDE.md は容赦なく剪定

各行に「削除したらモデルがミスする?」を問う。

## 7. SDD / TDD ループ

### BP-020: Spec-First (実行可能仕様)

仕様を実行可能成果物として扱い、コード前に固める。

- **出典**: https://github.com/github/spec-kit (retrieved_at: 2026-06-23)
- **本パッケージ**: [30_sdd-phase/](../30_sdd-phase/)

### BP-021: Red-Green-Refactor

失敗テスト → 通す → リファクタ。インタフェース設計を実装前に強制する。

- **出典**: https://martinfowler.com/bliki/TestDrivenDevelopment.html (retrieved_at: 2026-06-23)
- **本パッケージ**: [35_tdd-phase/](../35_tdd-phase/)

### BP-022: Explore → Plan → Implement → Commit を分離

Plan モードで read-only 計画。「とりあえず実装」を禁止。

- **本パッケージ**: [METHOD.md](../METHOD.md) §4

### BP-023: Trunk-Based

短命ブランチで mainline に頻繁統合。複数エージェント並行コミット時の前提。

- **出典**: https://trunkbaseddevelopment.com/ (retrieved_at: 2026-06-23)

## 8. Adversarial Verification

### BP-024: 別 subagent に diff と criteria だけ渡してレビュー

実装者が grade しない。

- **本パッケージ**: [60_quality-gates/06_red-team-loop.md](../60_quality-gates/06_red-team-loop.md)

### BP-025: reviewer は correctness と requirements にだけ絞る

「gap を探せ」と言うと reviewer は際限なく gap を作る。

### BP-026: rubric judge + human spot-check

rigid step check は valid alternative path を penalize する。

## 9. Anti-Sycophancy

### BP-027: 主張ではなく証拠を出させる

test 出力 / command + return / screenshot 等の artifact を要求。

### BP-028: additionalContext で事実を渡す

「YOU MUST」より「target is production」のような文脈の方が誤反応が少ない。

### BP-029: ヒューリスティックを「rule」ではなく「guidance」で

「広く始めて狭める」のような heuristic は guidance、rigid 決定木は不可。

## 10. 参照マップ (BP → 本パッケージ章)

| BP | 章 |
|---|---|
| BP-001..006 | [40_delegation/](../40_delegation/) |
| BP-007..010, BP-030 | [06_context-economy.md](./06_context-economy.md) |
| BP-011..012 | [50_permissions/](../50_permissions/) |
| BP-013..015 | [15_environment/](../15_environment/), [55_verification/](../55_verification/) |
| BP-016..017 | [45_runbook/](../45_runbook/), CLAUDE.md 運用 |
| BP-018..019 | [07_multi-llm-routing.md](./07_multi-llm-routing.md) |
| BP-020..023 | [METHOD.md](../METHOD.md), [30_sdd-phase/](../30_sdd-phase/), [35_tdd-phase/](../35_tdd-phase/) |
| BP-024..026 | [60_quality-gates/](../60_quality-gates/) |
| BP-027..029 | [60_quality-gates/](../60_quality-gates/), [02_north-star.md](./02_north-star.md) |

## 出典

- Anthropic Claude Code 公式 docs: https://code.claude.com/docs/en/best-practices (retrieved_at: 2026-06-23)
- Anthropic Claude Code Sub-agents: https://code.claude.com/docs/en/sub-agents (retrieved_at: 2026-06-23)
- Anthropic Claude Code Hooks: https://code.claude.com/docs/en/hooks (retrieved_at: 2026-06-23)
- Anthropic Claude Code Skills: https://code.claude.com/docs/en/skills (retrieved_at: 2026-06-23)
- Anthropic Engineering, Built multi-agent research system: https://www.anthropic.com/engineering/built-multi-agent-research-system (retrieved_at: 2026-06-23)
- Anthropic prompt-caching: https://platform.claude.com/docs/en/docs/build-with-claude/prompt-caching (retrieved_at: 2026-06-23)
- Anthropic tool-use overview: https://platform.claude.com/docs/en/docs/agents-and-tools/tool-use/overview (retrieved_at: 2026-06-23)
- best_practices.json (`./05_principles/_data/best_practices.json`)

## 不確実性

- BP の番号は `./05_principles/_data/best_practices.json` 1.0 schema に対応。schema 改訂時は本ファイルも追従が必要。
- 「最大 90% 短縮」のような数値は出典の引用であり、本パッケージで再計測したものではない (未検証 / 出典記載のまま)。
