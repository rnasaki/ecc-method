# 08 — Synthesis Protocol

複数専門家の出力を 1 つの成果物に統合する手順。Fan-out / Fan-in の Fan-in 段、コンセンサスの集約段、トーナメントの決勝段で共通利用する。

## 目的

- 並列出力の重複を除去する
- 対立する主張を平等に扱う
- 反対意見を消さずに本文へ残す

## 入出力

```
入力:
  - tasks_id: <共通タスク ID>
  - rubric: 評価軸 (任意)
  - outputs: [
      {expert_id, role, content, citations, rationale}
    ]

出力:
  - synthesized: 統合本文
  - dissent: 反対意見セクション
  - residual_open_questions: 統合不能な未解決
```

## 統合 5 ステップ

### Step 1: 抽出 (Extract)

各 output を「主張 (claim)」単位に分解する。

```yaml
- claim_id: C-001
  source: <expert_id>
  statement: <1 文>
  citations: [<URL>]
  confidence: high | medium | low
```

claim 粒度を揃える (段落単位ではなく文単位 〜 短い段落単位)。

### Step 2: 重複除去 (Deduplicate)

同じことを言う claim を 1 つに畳む。

```yaml
- claim_id: C-001-merged
  sources: [voter-A, voter-B]
  statement: <代表表現>
  citations: [<URL-A>, <URL-B>]
  agreement: 2/3
```

判定基準:
- 同じ事実 (URL / 数値) を引いている
- 言い換え同義 (LLM 判定 or 人手)
- 「ほぼ同じ」は別 claim として残す (微差が後で効くことがある)

### Step 3: 対立検出 (Conflict)

重複しない claim ペアの中で、互いに排他的なものを抽出する。

```yaml
- conflict_id: K-001
  claim_a: C-005 (source: voter-A)
  claim_b: C-007 (source: voter-B)
  topic: <争点>
  resolvable: true | false
```

排他性の判定:
- 同じ命題に対し yes / no が分かれている
- 推奨値が異なる (「N=3」vs「N=5」)
- 因果関係の方向が逆

### Step 4: 調停 (Reconcile)

調停の優先順位:

```
1. 出典の質で優劣がつく場合 → 強い出典側を採用
2. 評価軸で優劣がつく場合 → 該当軸の voter を採用
3. どちらも valid → 両論併記 (本文 + dissent)
4. 判定不能 → super-judge へ委譲 (`07_cross-verification.md` § Tie-break)
```

調停した結果を以下に書き出す:

```yaml
- conflict_id: K-001
  resolution: adopt_a | adopt_b | both | super-judge
  rationale: <文>
  retained_dissent: <両論併記時の反対側 claim>
```

### Step 5: 統合 (Compose)

採用 claim を本文として並べる。順序は以下を優先:

```
1. 全員一致の claim (TL;DR / 結論先)
2. 多数派 claim
3. 採用された conflict 解決
4. 反対意見セクション (dissent)
5. 未解決 (residual_open_questions)
```

## 反対意見の併記ルール

- **消さない**: 採用しなかった claim も dissent として本文に残す
- **匿名化**: voter id は残すが、人格化しない (「A の方が正しい」ではなく「視点 A では...」)
- **採用条件を書く**: その反対意見が採用されるべき条件を 1 行添える

```markdown
## 反対意見

### 視点: maintainability (voter-B)
- 主張: <文>
- 出典: <URL>
- 採用条件: 「3 ヶ月後の改修頻度が月 2 回を超える場合は本案を再評価」
```

## 出力テンプレート

```markdown
# Synthesis: <task-id>

## TL;DR
<3〜5 行で結論>

## 採用された主張
1. <claim>
   - 出典: <URL>
   - 合意度: N/M
2. ...

## 解決された対立
- K-001: <topic>
  - 採用: <claim>
  - 不採用: <claim>
  - 理由: <文>

## 反対意見
<上記「反対意見の併記ルール」セクション>

## 未解決の Open Question
- <question> (super-judge 委譲先: <expert-id>)

## 統合のメタ情報
- 入力 expert 数: N
- 重複除去前の claim 数: M
- 重複除去後: M'
- 検出された対立: K
- 採用率: <採用 claim / M'>
```

## 統合の品質チェック

統合後に Self-check:

- [ ] TL;DR が 5 行以内に収まっている
- [ ] 全 claim に出典 (citations) がある
- [ ] 反対意見セクションが空でない (重要決定の場合)
- [ ] 未解決 Open Question を黙って消していない
- [ ] 入力に無い claim を「補完」していない (ハルシネーション禁止)
- [ ] 量的にバランスしている (1 voter の主張だけが過大反映されていない)

## 統合担当の選定

| 場面 | 統合担当 |
|---|---|
| Discovery Fan-in | orchestrator 自身 (軽い summary) |
| 並列レビュー Fan-in | orchestrator + agent-evaluator |
| 重要決定の Vote 集約 | super-judge (別 expert) |
| トーナメント決勝後 | judge と別 expert |

統合担当は generator / voter のいずれとも別個体にする (BP-024)。

## アンチパターン

| アンチパターン | 症状 | 対処 |
|---|---|---|
| 多数決で反対意見を捨てる | 後で同じ反対意見が再浮上する | dissent セクションに必ず残す |
| LLM の「いい感じに統合して」一発任せ | 重複が残り対立が消される | Step 1〜5 を明示プロンプト化 |
| 統合担当が generator と同一 | 自己採点バイアス | 別個体に分離 |
| 出典なしの claim を採用 | ハルシネーション混入 | 出典なし claim は除外 or 「未検証」マーク |
| 未解決を黙って消す | サイコファンシー | residual_open_questions に必ず移送 |

## 出典

- BP-024: Claude Code best practices (https://code.claude.com/docs/en/best-practices, retrieved 2026-06-23)
- BP-026: Anthropic Engineering (https://www.anthropic.com/engineering/built-multi-agent-research-system, retrieved 2026-06-23)
- BP-027: Claude Code best practices (https://code.claude.com/docs/en/best-practices, retrieved 2026-06-23) — evidence over assertion
- 内部 SSOT: `40_delegation/07_cross-verification.md`

## 不確実性

- claim 粒度の決定 (文 vs 段落) は判断要素が大きい。粒度が細かすぎると統合コストが増し、粗すぎると重複が見逃される。
- Step 4 の「出典の質」判定基準は本パッケージで定義していない。導入先で「公式 docs > public repo > blog > 推測」のような優先表を別途整備する。
- Step 5 の順序は経験則。プロジェクトの読み手特性に応じて調整可。
