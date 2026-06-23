# 07 — Cross Verification

「生成した本人が判定しない」を運用ルールにする。生成・判定・反論を別個体に分けて、自己採点バイアスとサイコファンシーを抑える。

## 原則

```
生成 (Generator) ≠ 判定 (Judge) ≠ 反論 (Refuter)
```

- Generator: 案を作る
- Judge: 採点する (rubric で評価)
- Refuter: 反証を試みる (赤チーム)

3 役を別個体・別契約で実行する。重要度 = 最重要 では 3 役分離を必須化する。

## 適用契機

| 契機 | 必須? | 理由 |
|---|---|---|
| PRD / アーキテクチャ決定 | 必須 | 影響範囲広く後戻りコスト大 |
| セキュリティ判断 | 必須 | 自己評価で見逃し多発 |
| リリース判断 | 必須 | 不可逆 |
| 命名・UI・コピーの最終確定 | 必須 | サイコファンシーの典型 |
| 単純な実装レビュー | 任意 | reviewer 単独で足りる場合多い |
| read-only 調査 | 不要 | コスト過剰 |

## Judge の作法

### Judge への入力
- 評価対象 (diff / draft / 候補)
- 評価軸 (rubric)
- 採用要件 / 不採用条件
- 関連 AC

### Judge の禁則
- Generator のコンテキスト (思考過程・反省) を渡さない
- 「これは A さんが作った」のような帰属情報を渡さない
- Judge に修正指示は出させない (差し戻しコメントのみ)

### Judge の rubric (汎用)

```yaml
axes:
  accuracy:    # 事実 / 出典の正しさ
  completeness: # 網羅性 / 抜け漏れ
  clarity:     # 表現の明瞭さ
  actionability: # 受け手が実行可能か
  conciseness: # 冗長性
scale: 1..5
threshold: all axes ≥ 3, mean ≥ 3.5
```

各軸に「なぜその点か」の根拠 1 行を必須化する (採点だけでは BP-025 が言う「全部見つけた気になる」リスク)。

## Refuter の作法

### Refuter への入力
- 評価対象 (Judge と同じ)
- 評価軸ではなく、**反証の方針**:
  - 「最も致命的な反例を 1 つ挙げよ」
  - 「採用すると後で必ず後悔する点を 1 つ挙げよ」
  - 「同じ要件を達成する別案を 1 つ示せ」

### Refuter の禁則
- 全否定の指示は出さない (BP-025: 過剰防衛を招く)
- 「致命的な反例」と「軽微な改善点」を分離させる
- 反例を採用しなくても本文に併記する義務は残る

### Refuter の出力フォーマット

```markdown
## Refutation: <task-id>

### 致命的な反例 (採用すれば必ず修正)
- <反例> / 出典: <URL>

### 軽微な懸念 (採用任意)
- <懸念>

### 代替案
- <代替> / 採用条件: <条件>
```

## N 人投票 (コンセンサス)

`06_handoff-patterns.md` の H-4 を運用化する手順。

### 設定
- N = 3 または 5 (奇数)
- 視点を必ず分散させる (perspective-diverse):

```yaml
voters:
  - id: voter-A
    perspective: security
  - id: voter-B
    perspective: maintainability
  - id: voter-C
    perspective: user-experience
```

### 集約手順
1. 全 voter の出力を Orchestrator が並べる
2. 一致点 (majority) を抽出
3. 不一致点を rationale 付きで列挙
4. Tie-break 必要時は別 expert (super-judge) に委ねる

### 集約の出力

```markdown
## Vote Result: <task-id>

### 一致 (N/N で合意)
- <項目>

### 多数決 (N-1/N)
- <項目> / 不一致者 (<voter-id>) の根拠: <文>

### 不一致 (タイ)
- <項目> → super-judge (<expert-id>) に委譲
```

## Perspective-Diverse 化の具体策

同じ rubric を渡すと voter が均質化する。視点を分散させる方法:

| 軸 | voter A | voter B | voter C |
|---|---|---|---|
| 観点 | security | DX | maintainability |
| ペルソナ | 攻撃者視点 | 新人開発者視点 | 半年後の自分視点 |
| 評価期間 | 即時 | 3 ヶ月後 | 1 年後 |
| 規模 | 小規模利用 | 中規模 | エンタープライズ |

軸は 1 つ選んで全 voter に異なる値を割り当てる。複数軸を同時に振ると比較不能になる。

## ケース: PRD レビュー

```
[Orchestrator]
  generator: planner (Opus)
  judge:     agent-evaluator (Sonnet, 5 軸 rubric)
  refuter:   別 planner instance (Opus, "最も致命的な反例を 1 つ" 指示)

統合: orchestrator が 3 出力を Synthesis Protocol (08) で統合
出力: requirements.md + 反対意見併記セクション
```

## ケース: セキュリティ判断

```
[Orchestrator]
  generator: architect (proposed design)
  judge:     security-reviewer (OWASP rubric)
  refuter:   security-reviewer (別 instance, "最悪のシナリオを 1 つ" 指示)

統合: 致命的反例があれば差し戻し (Generator 再起動)
```

## アンチパターン

| アンチパターン | なぜダメか | 対処 |
|---|---|---|
| Generator に「自己レビューしろ」と指示 | 自己採点バイアス | Judge を別 expert で立てる (BP-024) |
| Judge に Generator の rationale を渡す | 評価が引きずられる | 入力を成果物のみに絞る |
| Refuter に「全部潰せ」と指示 | 過剰防衛コードを誘発 | 「致命的な反例 1 つ」に絞る (BP-025) |
| Vote で全員同じ system prompt | 均質回答 | perspective を必ず分散 |
| Vote の結果を Generator が選別 | 自己採点と同値 | Tie-break は super-judge へ |

## 出典

- BP-024: Claude Code best practices (https://code.claude.com/docs/en/best-practices, retrieved 2026-06-23)
- BP-025: 同上
- BP-026: Anthropic Engineering (https://www.anthropic.com/engineering/built-multi-agent-research-system, retrieved 2026-06-23)
- 内部 SSOT: `40_delegation/01_expert-registry.md` Pattern P-003 (Red-Team)

## 不確実性

- N=3 vs N=5 の費用対効果はタスクドメイン依存。重要度 = 最重要 でも N=3 で十分な場合が多い。
- Refuter の「致命的な反例 1 つ」指示は、複数の致命例がある場合に取りこぼす可能性がある。反復ループ (H-6) と組み合わせると緩和できる。
- Perspective-diverse の軸選定は経験則。同じ問題に対し過去どの軸が当たったかを Runbook 化すると改善する。
