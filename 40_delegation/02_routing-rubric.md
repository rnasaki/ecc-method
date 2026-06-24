---
keywords: [delegation, routing, rubric]
related: []
---
# 02 — Routing Rubric

タスク → 専門家のマッピング判定アルゴリズム。Orchestrator が Registry を引く際の決定木。

## 入出力

```
入力: { user_request: string, context: optional }
出力: {
  experts: [<id>],
  models: [<model>],
  parallelism: number,
  verifier: <id> | null,
  recipe: <P-NNN> | null,
  rationale: string
}
```

## アルゴリズム

```
Step 1: タスク分類
  - implementation | design | review | research | test | ui | infra | taste | security | unknown

Step 2: ドメイン推定
  - 言語 (python / typescript / go / rust / java / kotlin / swift / ...)
  - 領域 (frontend / backend / data / ml / mobile / devops)

Step 3: 重要度判定
  - 最重要: PRD / architecture / security / 最終判定
  - 中: 実装 / レビュー / build-fix
  - 軽: grep / 要約 / docs lookup

Step 4: Registry 絞り込み
  - category × domain で候補抽出
  - cost_tier × 重要度マトリクスで選定:
      最重要 → premium / high
      中     → mid
      軽     → low
  - parallel_safe に応じ並列性を決定

Step 5: 編成パターン適用
  - 該当 Pattern (P-001..P-006) があればそのまま採用
  - なければ category 単発委任

Step 6: Taste Trigger 適用
  - 命名 / UI / コピー / 「いい感じに」「ハイセンスに」検知時は taste カテゴリ強制追加

Step 7: Verifier 決定
  - 重要度 = 最重要 → 別 expert を verifier に指名 (生成 ≠ 判定)
  - 中以下 → verifier 任意

Step 8: rationale 出力
  - なぜその expert / model / 並列数を選んだかを 1〜2 文で記録
```

## Taste Trigger

以下の signal を検知したら、Orchestrator は自前判断せず taste カテゴリ専門家に委任する:

| signal | 対応 expert |
|---|---|
| 命名 / 識別子 / ファイル名 / プロダクト名 | `taste` |
| UI / UX / 視覚デザイン | `frontend-design-direction`, `make-interfaces-feel-better` |
| API / CLI / SDK の形 | `api-design` skill |
| README / プレゼン / デモシナリオの語り口 | `brand-voice` |
| 「いい感じに」「センスよく」「磨いて」等 | 上記から context で選定 |

判定もプロに委ねる。生成専門家とジャッジ専門家を分離する (self-review 禁止)。

## サンプル通し例

### Sample 1: 「認証周りの新機能を実装したい」

```
Step 1: implementation + design
Step 2: backend / 言語推定: 既存リポから判定
Step 3: 重要度: 最重要 (security 含む)
Step 4: 候補: planner, architect, security-reviewer, lang-reviewer
Step 5: Pattern P-001 (SDD 起点) 適用
Step 6: Taste Trigger なし
Step 7: Verifier: agent-evaluator + security-reviewer (別個体)
Step 8: rationale: "auth は security 必須。planner+architect 並列で SDD 起点、security-reviewer を verifier に分離"

出力: {
  experts: [planner, architect, security-reviewer, lang-reviewer],
  models: [opus, sonnet, sonnet, sonnet],
  parallelism: 2 (planner と architect),
  verifier: agent-evaluator,
  recipe: P-001
}
```

### Sample 2: 「この関数の名前を変えたい」

```
Step 1: taste
Step 2: domain は関数名 → naming
Step 3: 重要度: 中 (影響範囲による)
Step 4: 候補: taste
Step 6: Taste Trigger 発火 → taste 強制
Step 7: 別 taste 専門家を judge に
Step 8: rationale: "命名は taste 委任。candidate 生成と judge を分離"

出力: {
  experts: [taste, taste (judge instance)],
  models: [sonnet, sonnet],
  parallelism: 1,
  verifier: taste (別個体),
  recipe: P-005
}
```

### Sample 3: 「全テストを走らせて失敗を直して」

```
Step 1: test + builder-fixer
Step 2: 言語推定が必要 → Explore で先に判定
Step 3: 重要度: 中
Step 4: lang-build-resolver (該当言語)
Step 6: Taste Trigger なし
Step 7: Verifier: 任意
Step 8: rationale: "失敗修復は lang-build-resolver の専門。Explore で言語確定後に委任"

出力: {
  experts: [Explore, <lang>-build-resolver],
  models: [haiku, sonnet],
  parallelism: 1 (sequential),
  verifier: null,
  recipe: null
}
```

### Sample 4: 「この PR をレビューして」

```
Step 1: review
Step 2: 言語推定 (PR diff から)
Step 3: 重要度: 中 (security 含むかで分岐)
Step 4: lang-reviewer + security-reviewer (もし auth/payment/secret 触る場合)
Step 6: Taste Trigger なし
Step 7: Verifier: 不要 (review 自体が verify)
Step 8: rationale: "言語 reviewer + security 並列。security 必要時のみ追加"

出力: {
  experts: [<lang>-reviewer, security-reviewer?],
  models: [sonnet, sonnet],
  parallelism: 2 if security else 1
}
```

### Sample 5: 「未知のリポを引き継いだ。何ができるか教えて」

```
Step 1: research
Step 2: domain unknown
Step 3: 重要度: 中
Step 4: codebase-onboarding + Explore × 3
Step 5: Pattern P-004 (Discovery)
Step 6: Taste Trigger なし
Step 7: Verifier: agent-evaluator (synthesis 後)
Step 8: rationale: "Discovery は P-004 で Explore 並列 + onboarding skill"

出力: {
  experts: [codebase-onboarding, Explore, Explore, Explore],
  models: [null, haiku, haiku, haiku],
  parallelism: 4,
  verifier: agent-evaluator,
  recipe: P-004
}
```

## 並列起動の必須ルール

- 独立タスクは **同一メッセージ内** で複数の Agent 呼び出しにまとめる。
- 順次起動は禁止 (並列性が成立する条件下では)。
- 各 Agent には自己完結プロンプト + 出力上限 + 出典指示を付帯する (BP-004)。

## 並列省略基準 (Pattern P-004 等で適用)

並列起動は重要だが、規模が小さいタスクで並列を強行するとオーバーヘッドが上回る。以下の **省略可能基準** を満たす場合は単独実行に縮退してよい (実機検証 2026-06-24 で確認):

| 条件 | 閾値 | 適用例 |
|---|---|---|
| 探索範囲 (ファイル数) | ≤ 20 ファイル | 小規模リポの Discovery |
| 探索範囲 (ディレクトリ深さ) | ≤ 3 階層 | フラットな構造 |
| 推定 token 消費 | ≤ 5k token | 単発 Read で完結する規模 |
| 重要度 | ≤ 中 | 最重要なら並列強制 (verifier 含む) |

すべて満たす場合のみ単独実行可。**1 つでも満たさなければ並列起動 (BP-003) を強制**。

省略時は `rationale` に「規模 < N で単独実行を選択」を記録。

判断の責任は Orchestrator にある。subagent 側で勝手に省略しない (Delegation Contract で並列指示があれば従う)。

## モデル選定の既定値

| 用途 | 既定モデル | 出典 |
|---|---|---|
| Explore (read-only 検索) | Haiku | BP-002 |
| docs-lookup | Haiku | BP-002 |
| code review (lang-reviewer) | Sonnet | (Agent ファイル準拠) |
| planner (SDD 起点) | Opus | (推論深度優先) |
| architect | Sonnet | (個別判断で Opus) |
| TDD ガイド | Sonnet | (Agent ファイル準拠) |
| 最終ジャッジ (agent-evaluator) | Sonnet | BP-026 |

## 出典

- BP-002, BP-004, BP-018, BP-026: `./05_principles/_data/best_practices.json`
- Anthropic Claude Code Sub-agents docs (2026-06-23)

## 不確実性

- domain / 言語推定が曖昧な場合は Explore を先行起動して確定させる。憶測で routing しない。
- Pattern マッチングは網羅的でない。Pattern 不在時は category 単発で委任し、後で Pattern 化候補に挙げる。
