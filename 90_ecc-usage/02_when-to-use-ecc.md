# 02 — When to Use ECC (適する/適さないケース)

ECC は汎用基盤だが、すべての作業に適合するわけではない。適合・不適合の境界を明示し、誤用を避ける。

## 1. ECC が適するケース

| ケース | 理由 |
|---|---|
| 並列調査 / 監査 | sub-agent の独立 context で並列性を発揮 (BP-003) |
| 複数視点を要する重要決定 | Pattern P-003 (Red-Team) が直結 |
| 反復作業の自動化 | slash + skill + memory で再現可能化 |
| 未知リポの onboarding | Pattern P-004 + codebase-onboarding skill |
| 外部リソース横断 | MCP servers でツール統合 |
| 規約のあるドキュメント生成 | hooks + 禁止語チェックの自動化 |
| 段階分解が要る大型機能 | planner + architect の並列起動 |
| センスが要る命名・コピー | Pattern P-005 (taste 委任) |
| 検証セットでのモデル比較 | agent-evaluator + 別モデルの judge |

## 2. ECC が適さないケース

| ケース | 理由 | 代替 |
|---|---|---|
| 単発の数行修正 | 委任オーバーヘッドが上回る | Claude Code 単発呼び出し |
| 機械的な置換 | LLM 呼び出しが無駄 | sed / awk / IDE 置換 |
| ハード RT 制約 | LLM レイテンシが許容外 | 専用システム |
| 法的助言 / 医療診断 | 専門家責任が必要 | 人間専門家 |
| 厳密な数値計算 | LLM は非決定的 | 数値ライブラリ |
| 機密度極高の単一インシデント | ログが残る運用に乗せにくい | 別オフライン手順 |
| 仕様未確定の試作 | 委任契約が固められない | 一旦 Notebook で探索 |

## 3. 適合判定チェックリスト

採用前に以下を確認する:

- [ ] 並列性 / 対抗性 / 出典遡及性のいずれかを必要とするか
- [ ] 反復頻度がある (Runbook 化のメリットがある) か
- [ ] 委任契約 ([40_delegation/03_delegation-contract.md](../40_delegation/03_delegation-contract.md)) を書ける程度に要件が固まっているか
- [ ] Quality Gate ([60_quality-gates/](../60_quality-gates/)) を通せる程度に成果物の検証可能性があるか
- [ ] コスト見積 ([06_cost-and-context.md](./06_cost-and-context.md)) が許容できるか
- [ ] 個人・組織情報を含めずに記述できるか

3 つ以上 ✓ なら ECC 採用が妥当。2 つ以下なら別手段を検討する。

## 4. 段階的採用

ECC の全機能を一気に投入するのは推奨しない。`07_adoption-roadmap.md` で week 1 / week 2-4 / month 2+ の段階を定義する。

## 5. 適不適のグレーゾーン

| ケース | 判断 |
|---|---|
| 軽量タスクだが頻発する | Runbook 化を伴うなら採用、単発なら不採用 |
| 機微情報を扱う | secret は環境変数で隔離した上で採用 (`50_permissions/`) |
| 学習用の実験 | 試作期は採用ハードルを下げる、運用期は厳格化 |
| マルチ言語混在 | lang-reviewer を分けて採用 |

## 6. 「やめる」判断

ECC を採用したものの効果が出ない場合の撤退条件:

- 健全性 KPI ([06_health-metrics.md](../75_self-evolution/06_health-metrics.md)) が 3 期連続で目標下回り
- ユーザーケア (`25_writing-style/06_user-care/`) のエスカレーションが頻発
- コストが投資対効果と見合わない (`06_cost-and-context.md`)

撤退時は学んだ Runbook と Registry エントリを残し、次回採用時の入口にする。

## 7. 失敗例 (避ける)

- 規模が小さい単発作業に Pattern P-001 を当てる
- 仕様未確定のまま Pattern P-002 に進む
- 機密度が高い情報を Runbook 化する (内製情報の取扱は `99_distribution/`)

## 出典

- 本パッケージ README.md §想定読者 (retrieved 2026-06-23)
- 本パッケージ METHOD.md §1 Method の目的 (retrieved 2026-06-23)
- Anthropic Engineering: Built multi-agent research system (https://www.anthropic.com/engineering/built-multi-agent-research-system, retrieved 2026-06-23)

## 不確実性

- 適不適の判定基準は経験則であり、定量化が難しい。健全性 KPI と組み合わせて運用判断する。
- ハード RT 制約 / 機密度極高 などの非機能要件は案件依存。本章は一般論に留める。
