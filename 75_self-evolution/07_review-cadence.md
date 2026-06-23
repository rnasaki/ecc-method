# 07 — Review Cadence (週次/月次/四半期チェックリスト)

> **Stage 10 (cadence 側)** (本章は self-evolution の Stage 10、`05_industry-radar.md` と並列で Stage 10 を担う。Stage 体系の全体像は [08_self-modification-loop.md §9](./08_self-modification-loop.md))

健全性 KPI と自動更新ループを「いつ」「誰が」「何を」見るかを定式化する。担当はすべて専門家エージェントに委任する前提で記す。

## 1. サイクル概要

| サイクル | 主目的 | 主担当 |
|---|---|---|
| 週次 | 死活・リンク・block 級違反の即時是正 | explorer-research + agent-evaluator |
| 月次 | 陳腐率・重複率の集計 / Runbook 再利用率の確認 | architect + agent-evaluator |
| 四半期 | industry radar 完走 / KPI 閾値再校正 | orchestrator + planner + agent-evaluator |

## 2. 週次チェックリスト

実行タイミング: 毎週月曜 09:00 (相対) を基準。

- [ ] `06_health-metrics.md` の citation_alive_rate を再計測
- [ ] link_alive_rate を再計測
- [ ] block 級禁止語の差分 grep を実行
- [ ] `02_auto-update-loop.md` Stage 1 (Detect) を完走
- [ ] obsolete に近い (D > 150) エントリの再検証候補を抽出
- [ ] 反映済 patch の Stage 7 (Observe) 観測ログを確認
- [ ] 異常があれば slack / issue / agent-evaluator にエスカレーション

成果物: `_tmp/weekly_<YYYYWW>.json`。

## 3. 月次チェックリスト

実行タイミング: 月初 5 営業日以内。

- [ ] obsolescence_rate を再計測 (目標: ≤ 25%)
- [ ] duplication_rate を再計測 (目標: ≤ 3%)
- [ ] coverage を再計測 (目標: ≥ 90%)
- [ ] gate_pass_rate を集計 (目標: ≥ 80%)
- [ ] runbook_reuse を再計測 (目標: ≥ 70%)
- [ ] 全 KPI を `_tmp/health_metrics_history.jsonl` に追記
- [ ] 月次 finding を `02_auto-update-loop.md` Stage 4 に投入
- [ ] 受入チェックリスト ([60_quality-gates/](../60_quality-gates/)) の通過率を集計
- [ ] 重複検知の自動マージ候補を planner に渡す
- [ ] 月次レポートを `75_self-evolution/monthly_<YYYYMM>.md` に保存

成果物: `monthly_<YYYYMM>.md` + 反映 commit 群。

## 4. 四半期チェックリスト

実行タイミング: 四半期初月の第 2 週。

- [ ] `05_industry-radar.md` の 10 ステップを完走
- [ ] sources.yaml の last_checked を一括更新
- [ ] 原則・Pattern P-001..P-006 の妥当性を再評価
- [ ] Registry エントリの Layer 0 / Layer 1 を全件再検証
- [ ] 健全性 KPI 閾値を再校正
- [ ] 翌四半期の backlog を planner に作成依頼
- [ ] 四半期レポート `quarterly_<YYYY-Q>.md` を保存
- [ ] METHOD.md / README.md の retrieved_at を更新
- [ ] 持ち越し finding が 3 期連続のものは強制 red-team (Pattern P-003)

成果物: `quarterly_<YYYY-Q>.md` + 反映 commit 群 + 更新後 sources.yaml。

## 5. 自動化マトリクス

| サイクル | cron | 委任 Agent | 出力 |
|---|---|---|---|
| 週次 | `0 0 * * 1` | Explore + docs-lookup + agent-evaluator | weekly_*.json |
| 月次 | `0 0 1 * *` | architect + planner + agent-evaluator | monthly_*.md |
| 四半期 | 手動 | orchestrator + 上記全部 | quarterly_*.md |

## 6. レポート最小スキーマ

```yaml
period: "2026-W26"        # 週次の例
type: weekly | monthly | quarterly
metrics:
  obsolescence_rate: <float>
  citation_alive_rate: <float>
  duplication_rate: <float>
  coverage: <float>
  banned_phrase_hit: <int>
findings:
  - id: <string>
    severity: block | warn | note
    summary: <string>
    next_action: <string>
applied_patches:
  - commit: <sha>
    finding_id: <string>
sources:
  - url: <string>
    retrieved_at: <YYYY-MM-DD>
uncertainty:
  - <string>
```

## 7. レビュー会議体 (任意)

人間レビュアーを巻き込む場合、月次 / 四半期に以下を実施する想定:

| 会議 | 頻度 | 入力 |
|---|---|---|
| 月次健全性レビュー | 月 1 回 30 分 | monthly_*.md |
| 四半期方針会議 | 四半期 1 回 60 分 | quarterly_*.md |

会議の議事録は本パッケージには含めない (案件側で別管理)。

## 8. 失敗例 (避ける)

- 週次を抜かして月次から始める (week 単位の差分が積み上がり修復コストが上がる)
- 四半期チェックを月次の延長で済ませる (radar の 4 ソース並列が機能しない)
- レポートをコミットせず slack だけで共有 (監査ログが残らない)

## 9. 連携先一覧

| 章 | 用途 |
|---|---|
| [01_freshness-policy.md](./01_freshness-policy.md) | 鮮度判定基準 |
| [02_auto-update-loop.md](./02_auto-update-loop.md) | 反映パイプライン |
| [03_knowledge-acquisition.md](./03_knowledge-acquisition.md) | 新ナレッジ取り込み |
| [04_self-repair.md](./04_self-repair.md) | 重複・リンク修復 |
| [05_industry-radar.md](./05_industry-radar.md) | 四半期ベンチ |
| [06_health-metrics.md](./06_health-metrics.md) | KPI 計測 |

## 出典

- 本パッケージ METHOD.md §10 自己更新ループ (retrieved 2026-06-23)
- 本パッケージ 75_self-evolution/06_health-metrics.md (retrieved 2026-06-23)
- Anthropic Claude Code Sub-agents docs (https://code.claude.com/docs/en/sub-agents, retrieved 2026-06-23)

## 不確実性

- 週次 cron の起動時刻は組織のタイムゾーン依存。本パッケージは曜日のみ規定する。
- 月次・四半期会議は人間関与を前提とする節を含むため、無人運用の場合は agent-evaluator 単独で代替する。
