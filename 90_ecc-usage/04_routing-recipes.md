---
keywords: [ecc-usage, routing, recipes]
related: [40_delegation/02_routing-rubric.md, 15_environment/10_agent-memory-hierarchy.md, 40_delegation/09_a2a-and-handoff-standards.md]
---
# 04 — Routing Recipes (Need → ECC 機能の選定)

「やりたいこと」から ECC 機能・Pattern を選ぶレシピ集。10 件以上を収録する。本パッケージの routing rubric ([40_delegation/02_routing-rubric.md](../40_delegation/02_routing-rubric.md)) を Need 起点で逆引きしたもの。

## レシピ一覧

| # | Need | 採用機能 | Pattern |
|---|---|---|---|
| R-01 | 並列に複数視点で考える | Hub: Multi-Plan / Council | P-001 / P-003 |
| R-02 | 設計 → 実装 → 検証 を一貫運用 | Hub: Workflow + tdd-workflow | P-001 + P-002 |
| R-03 | 100 件の同種コードを一気に修正 | Hub: dmux / fleet + builder-fixer | (P-002 の並列展開) |
| R-04 | 最終ジャッジを公平に下す | Hub: GAN-Harness + agent-evaluator | P-003 |
| R-05 | 未知領域を最短で学習 | Skill: deep-research / codebase-onboarding | P-004 |
| R-06 | センス判断 (命名 / コピー / UI) | Skill: taste / frontend-design-direction | P-005 |
| R-07 | コスト抑制 | Hub: token-budget-advisor + Haiku 寄せ | (BP-009 + BP-010) |
| R-08 | 規約遵守 (禁止語 / 出典) を自動化 | Hooks (Stop) + grep | (Quality Gate) |
| R-09 | 未確定要件の聞き出し | Skill: search-first + Discovery | P-004 |
| R-10 | セキュリティ確認 | security-reviewer + agent-evaluator | P-003 |
| R-11 | 大規模 PR レビュー | Multi-Plan + lang-reviewer + code-reviewer | P-002 + P-003 |
| R-12 | デモシナリオ作成 | brand-voice + taste | P-005 |
| R-13 | 重複コード・dead code 整理 | Skill: refactor-clean + lang-reviewer | P-002 |
| R-14 | Plan mode で read-only 計画 | Plan mode + planner | P-001 |
| R-15 | Skills を on-demand 注入 | Skills + lang-reviewer / 該当 reviewer | P-002 |
| R-16 | Memory tool で過去案件を episodic 検索 | Memory tool + 15_environment/10 agent-memory-hierarchy | P-004 |
| R-17 | Computer Use で GUI 操作 | Computer Use + browser-automation | (P-002 の I/O 拡張) |
| R-18 | Background agent で長時間 batch | Routines + Stop hook | (P-001 + Quality Gate) |
| R-19 | Voice agent で口頭ハンドオフ | gpt-realtime 系 (Voice agents) + Handoffs | P-001 |

## R-01 並列に複数視点で考える

**Need**: 1 つの問題に対して複数の planner 出力を比較したい

**採用**:

```
[Hub: Council]
  ├── planner-A (Opus): 標準路線
  ├── planner-B (Opus): 別アングル
  └── planner-C (Sonnet): 簡素路線
[Synthesis] orchestrator が rationale で統合
```

**Pattern**: P-001 / P-003

## R-02 設計 → 実装 → 検証 を一貫運用

**Need**: 1 機能を SDD → TDD ハイブリッドで完走させたい

**採用**:

```
1. /plan         → P-001 で requirements / design / tasks
2. /tdd          → P-002 で 1 タスクずつ Red→Green→Refactor
3. /review       → code-reviewer + agent-evaluator
4. /pr           → doc-updater + code-reviewer
```

**Pattern**: P-001 + P-002

## R-03 100 件の同種コードを一気に修正

**Need**: 同種の置換・追加を多数ファイルに展開

**採用**:

```
[Hub: dmux / fleet]
  └── 各ファイルに builder-fixer (Sonnet) を分配
[Aggregator] code-reviewer で集約レビュー
```

機械置換で済むものは LLM を使わない。LLM が要るのは「文脈判断」を伴う場合のみ。

## R-04 最終ジャッジを公平に下す

**Need**: 重要決定の最終判断で生成と判定を分離したい

**採用**:

```
[Hub: GAN-Harness]
  ├── Generator: planner / architect
  ├── Judge:     agent-evaluator (別個体)
  └── Refuter:   別 planner で「refute を試みよ」
[Synthesis] rationale を残す
```

**Pattern**: P-003

## R-05 未知領域を最短で学習

**Need**: 新規ドメイン / 新規リポを把握したい

**採用**:

```
[P-004 Discovery]
  ├── codebase-onboarding (skill)
  └── Explore × 3 (異なる角度の grep)
[Skill: deep-research] でドメイン文献を収集
```

## R-06 センス判断 (命名 / コピー / UI)

**Need**: 命名・コピー・UI の良し悪しを判定したい

**採用**:

```
[P-005 taste-decision]
  ├── Generator: taste または brand-voice
  └── Judge:     別 taste 系 (self-review 禁止)
```

## R-07 コスト抑制

**Need**: トークン消費を抑えたい

**採用**:

- Hub: token-budget-advisor で予算可視化
- Agent モデル割当を最適化 (BP-002):
  - 最重要: Opus
  - 中: Sonnet / GPT-5.5 系
  - 軽: Haiku
- prompt cache の活用 (BP-010): 安定 prefix を最後の identical block に置く
- 並列起動の重複出力を抑える (BP-003 の使い所限定)

## R-08 規約遵守 (禁止語 / 出典) を自動化

**Need**: 禁止語ヒット 0 / 出典必須を強制したい

**採用**:

- Hooks (Stop): セッション終了時に grep で禁止語チェック
- Hooks (PostToolUse): write 直後の引用形式 check
- Hub: doc-updater による形式整形

## R-09 未確定要件の聞き出し

**Need**: 仕様が曖昧で開発に入れない

**採用**:

- Skill: search-first → 既存実装・docs を先に調べる
- Pattern P-004 で前提を構造化
- それでも曖昧な場合は人間に「ASK」(`50_permissions/`)

## R-10 セキュリティ確認

**Need**: secret 漏洩 / OWASP リスク確認

**採用**:

- security-reviewer (生成)
- agent-evaluator (独立判定)
- Hooks (Stop) で grep 検査

**Pattern**: P-003 (security 特化)

## R-11 大規模 PR レビュー

**Need**: 数千行 diff の PR レビュー

**採用**:

```
[Multi-Plan]
  ├── code-reviewer (一般品質)
  ├── lang-reviewer (該当言語)
  ├── security-reviewer (セキュ)
  └── agent-evaluator (独立)
[Synthesis] レビュー集約
```

## R-12 デモシナリオ作成

**Need**: ステークホルダ向けデモを作る

**採用**:

- brand-voice (ストーリー)
- taste (UI / コピー)
- doc-updater (ドキュメント)

**Pattern**: P-005

## R-13 重複コード・dead code 整理

**Need**: dead code を安全に消したい

**採用**:

- Skill: refactor-clean
- lang-reviewer で「削除して安全か」を独立判定

## R-14 Plan mode で read-only 計画

**Need**: 実装前に計画だけを read-only で固め、レビューを得たい

**採用**:

```
[Plan mode (read-only)]
  └── planner: requirements / design / tasks の骨格のみ
[Synthesis] 計画 diff のみを人間レビューに回す
```

実装ツールを呼べない状態で計画を固めることで、誤った副作用を未然に防ぐ。承認後に通常モードへ昇格して TDD ループに入る。

**出典**: https://code.claude.com/docs/en/ (Plan review 言及, retrieved 2026-06-23) — 専用ページは未検証

## R-15 Skills を on-demand 注入

**Need**: 反復手順を CLAUDE.md に焼き付けず、必要時のみ読み込みたい

**採用**:

```
[Skills]
  ├── .claude/skills/<name>/SKILL.md を slash 起動 or 自動起動
  └── 該当 reviewer (lang-reviewer / code-reviewer) を後段に
```

CLAUDE.md は事実、Skills は手順、と境界を引く。長尺リファレンスは skill body 化して使う時のみ load する。

**出典**: https://code.claude.com/docs/en/skills (retrieved 2026-06-23)

## R-16 Memory tool で過去案件を episodic 検索

**Need**: 過去の案件 / 進捗 / 学習を会話横断で参照したい

**採用**:

```
[Memory tool] /memories ディレクトリを client-side CRUD
  ├── 進捗ログ (multi-session 開発パターン)
  ├── 案件横断の意思決定アーカイブ
  └── 失敗事例 / pitfall 抜粋
[15_environment/10_agent-memory-hierarchy.md] と接続
```

context window を膨張させず、必要分だけ pull する。`/memories` 配下に閉じ、path traversal を防ぐ実装が前提。

**出典**: https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool (retrieved 2026-06-23)

参照: [../15_environment/10_agent-memory-hierarchy.md](../15_environment/10_agent-memory-hierarchy.md)

## R-17 Computer Use で GUI 操作

**Need**: API / CLI が無い GUI のみのレガシ画面を自動操作したい

**採用**:

```
[Computer Use (beta)]
  ├── screenshot で画面把握
  ├── mouse / keyboard で操作
  └── browser-automation (Playwright MCP) と併用も可
```

API / CLI で代替可能なら必ずそちらを優先する。GUI 自動化は壊れやすく高コストのため、頻度の高い操作は Routines で夜間に回す。

**出典**: https://platform.claude.com/docs/en/agents-and-tools/computer-use (retrieved 2026-06-23)

## R-18 Background agent で長時間 batch

**Need**: 夜間の PR review / docs drift 監視等を放置で回したい

**採用**:

```
[Routines (research preview)]
  ├── trigger: schedule / API / GitHub event
  ├── prompt + repo + connector を保存
  └── 終了時の検証は Stop hook で grep / lint
```

最小間隔 1h、対話探索には不向き。1 ルーチン 1 目的で定義し、副作用範囲を明示する。

**出典**: https://code.claude.com/docs/en/routines (retrieved 2026-06-23)

## R-19 Voice agent で口頭ハンドオフ

**Need**: 口頭で受けた依頼を専門エージェントに即委譲したい

**採用**:

```
[Voice agents] STT → エージェント → TTS の 3 段
  └── Handoffs (transfer_to_<name>) で専門エージェントへ完全委譲
```

会話履歴ごと制御を移譲する Handoffs と相性がよい。短文の指示や口頭トリアージに向く。長文の構造化出力には Voice 不適。

**出典**:
- https://openai.github.io/openai-agents-python/voice/quickstart/ (retrieved 2026-06-23)
- https://openai.github.io/openai-agents-python/handoffs/ (retrieved 2026-06-23)

未検証: gpt-realtime / gpt-realtime-2 の正式モデル名は本検証で確定できず。

参照: [../40_delegation/09_a2a-and-handoff-standards.md](../40_delegation/09_a2a-and-handoff-standards.md) で Handoff vs Manager の切替判断を記述。

## レシピの拡張

新しい Need が出たら本章にレシピを追記する。追記時は:

- Need / 採用機能 / Pattern を明示
- 出典を併記
- `04_self-repair.md` の重複検知を通す

## 出典

- 本パッケージ 40_delegation/02_routing-rubric.md (retrieved 2026-06-23)
- 本パッケージ 40_delegation/01_expert-registry.md (retrieved 2026-06-23)
- 本パッケージ 40_delegation/09_a2a-and-handoff-standards.md (retrieved 2026-06-23)
- 本パッケージ 15_environment/10_agent-memory-hierarchy.md (retrieved 2026-06-23)
- Anthropic Engineering: Built multi-agent research system (https://www.anthropic.com/engineering/built-multi-agent-research-system, retrieved 2026-06-23)
- Anthropic Claude Code Skills (https://code.claude.com/docs/en/skills, retrieved 2026-06-23)
- Anthropic Claude Code Hooks (https://code.claude.com/docs/en/hooks, retrieved 2026-06-23)
- Anthropic Claude Code Routines (https://code.claude.com/docs/en/routines, retrieved 2026-06-23)
- Anthropic Memory tool (https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool, retrieved 2026-06-23)
- Anthropic Computer Use (https://platform.claude.com/docs/en/agents-and-tools/computer-use, retrieved 2026-06-23)
- OpenAI Agents SDK Handoffs (https://openai.github.io/openai-agents-python/handoffs/, retrieved 2026-06-23)
- OpenAI Agents SDK Voice (https://openai.github.io/openai-agents-python/voice/quickstart/, retrieved 2026-06-23)

## 不確実性

- 13 + 6 = 19 レシピは初期版。実運用で頻出の Need が見つかればレシピ化する。
- Hub 機能 (Council / GAN-Harness / dmux / fleet) の実体名は ECC バージョン依存。本章は概念ラベルとして用い、実体は導入先で別名 alias を許容する。
- R-14 (Plan mode) は専用公式ページが本検証で未発見。VS Code 拡張等で言及を確認、retrieved_at: 2026-06-23 のラベルで運用し、四半期 radar で再検証する。
- R-19 (Voice) のモデル名 gpt-realtime / gpt-realtime-2 は公式 quickstart で具体名が確定できず未検証。導入時点の最新モデル名に置換する運用とする。
