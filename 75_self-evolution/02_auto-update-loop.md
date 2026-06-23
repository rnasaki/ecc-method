# 02 — Auto-Update Loop (自動更新ループ)

本パッケージを陳腐化させないための 7 段階パイプライン。`75_self-evolution/01_freshness-policy.md` のステータスをトリガに、検知から反映・観測までを定式化する。

## 1. 全体像

```
[1 Detect] → [2 Extract] → [3 Impact] → [4 Draft] → [5 Gate] → [6 Apply] → [7 Observe]
                                                                                 │
                                              (KPI 反映: 06_health-metrics.md)──┘
```

各段階は専門家エージェントに委任する。Orchestrator はパイプライン全体の整流のみを担う。

## 2. Stage 1: Detect (検知)

入力: 鮮度判定スクリプト (`01_freshness-policy.md` §3) の出力

検知ソースは 4 系統:

| ソース | 役割 |
|---|---|
| `last_verified` 経過 | `aging` / `stale` / `obsolete` の自動抽出 |
| 公式 docs の差分 | RSS / sitemap の変更を polling |
| Registry エントリの参照不能 | URL or 内部 path の 404 / rename |
| 健全性 KPI 異常 | `06_health-metrics.md` の閾値突破 |

委任先: `explorer-research` カテゴリ + `Explore` 並列 (BP-003 並列起動)。

出力: `_tmp/freshness_findings.json` (id / source / age / reason)。

## 3. Stage 2: Extract (差分抽出)

入力: `freshness_findings.json` の各 finding

実施事項:

- 出典 URL を再取得 (WebFetch / docs-lookup)
- 旧版との差分を構造化 (added / removed / changed セクション)
- 影響を受ける本パッケージ章を逆引き (grep + cross-reference 抽出)

委任先: `docs-lookup` (Haiku 寄せでコスト抑制, BP-002)。

出力: `_tmp/diff_<finding-id>.md` (旧/新セクション + 該当章リスト)。

## 4. Stage 3: Impact (影響評価)

入力: 差分 + 該当章リスト

評価軸:

| 軸 | 内容 |
|---|---|
| Scope | 章数 / 行数 / Registry エントリ数 |
| Severity | block / warn / note (`60_quality-gates/` の severity に合わせる) |
| Risk | 「下流の Runbook が動かなくなる」等の連鎖影響 |
| Effort | 数値見積 (S/M/L) |

委任先: `architect` 系。重要度が高い場合のみ `agent-evaluator` で第二意見を取る。

出力: `_tmp/impact_<finding-id>.md`。

## 5. Stage 4: Draft (反映ドラフト)

入力: 影響評価レポート

実施事項:

- 章本文の更新案を patch 形式で起こす
- Registry エントリは YAML 単位で書き換える
- `last_verified` を更新日に揃える
- 「## 出典」「## 不確実性」を再構成 (出典が更新されているため)

委任先: `planner` または domain-specific reviewer (Pattern P-001 の縮小版)。

出力: `_tmp/draft_<finding-id>.patch`。

## 6. Stage 5: Gate (品質ゲート)

入力: ドラフト patch

通過条件 (`60_quality-gates/07_gate-checklist.md` を流用):

- [ ] L1 出典あり / retrieved_at 更新済み
- [ ] 禁止語 0 件 (`25_writing-style/02_avoidance-patterns.md`)
- [ ] cross-reference リンク切れ 0 件
- [ ] `04_self-repair.md` の重複検知に抵触しない
- [ ] 反対意見が必要な変更 (Pattern P-003 該当) は red-team 通過

委任先: `agent-evaluator` (Generator と別個体, BP-007 相当の独立性)。

出力: `_tmp/gate_<finding-id>.json` (pass / warn / block + 詳細)。

## 7. Stage 6: Apply (反映)

入力: ゲート通過済み patch

実施事項:

- patch を本パッケージ HEAD に適用
- commit メッセージは `chore(self-evolution): refresh <id> per <source>`
- INDEX (45_runbook/INDEX.md) や cross-reference を同期更新

委任先: `builder-fixer` カテゴリ (lang-build-resolver は不要、編集のみ)。

不可逆共有資源には作用しない (`50_permissions/01_consent-economy.md` の ASK 行動には該当しない)。

## 8. Stage 7: Observe (観測)

入力: 適用後のリポ HEAD

実施事項:

- 健全性 KPI を再計測 (`06_health-metrics.md`)
- 適用後 7 日間、関連 Runbook の参照回数 / エラー回数を観測
- 異常時は revert + Stage 3 に戻す

委任先: `agent-evaluator` (週次レビュー時に集約)。

## 9. ステージ間引き継ぎ書式

各ステージは [40_delegation/03_delegation-contract.md](../40_delegation/03_delegation-contract.md) の契約形式で受け渡す。最低限必要なフィールド:

```yaml
finding_id: <string>
stage_in: detect | extract | impact | draft | gate | apply | observe
inputs: [<file-path>]
expected_output: <file-path>
hard_constraints:
  - 出典 retrieved_at を必ず更新
  - 禁止語 0 件
  - 反対意見併記 (重要決定のみ)
deadline: <ISO date>
```

## 10. 起動条件

frontier 章は通常章より高速サイクルで運用する。詳細は `01_freshness-policy.md §9` および `85_frontier/README.md` を参照。

| 対象スコープ | サイクル | cron | 担当 | 備考 |
|---|---|---|---|---|
| Method 全体 (Stage 1〜10) | 週次 | `0 0 * * 1` | Explore + agent-evaluator | Stage 1〜2 を週 1 回 |
| Method 全体 月次集計 | 月次 | `0 0 1 * *` | architect + planner | Stage 1〜5 を月 1 回 |
| Method 全体 四半期 | 四半期 (手動) | - | orchestrator + 全員 | industry radar (`05_industry-radar.md`) → Stage 1〜7 を完走 |
| frontier 専用 (`85_frontier/`) | 月次 + トリガ | `0 0 1 * *` + 公式発表 hook | frontier 監視 agent | 30/60/90 日閾値 (`01_freshness-policy.md §9` 参照) |
| KPI 異常 | 即時 | - | orchestrator | Stage 1 を即時起動 |

frontier 章の高速サイクルは通常章の cron と並列に走る。閾値・ステータスラベル (`active` / `review-due` / `stale` / `deprecated`) は `01_freshness-policy.md §9` および `85_frontier/README.md` を SSOT とする。

## 11. 失敗例 (避ける)

- Stage 5 を飛ばして Stage 6 に直行 (品質ゲート未通過の反映禁止)
- 同一 finding を複数並列で Stage 4 に投入 (drift の温床)
- Apply の commit を rebase / squash で潰す (監査ログが消える)

## 出典

- 本パッケージ METHOD.md §10 自己更新ループ (retrieved 2026-06-23)
- Anthropic Engineering: Built multi-agent research system (https://www.anthropic.com/engineering/built-multi-agent-research-system, retrieved 2026-06-23)
- 本パッケージ 60_quality-gates/ (planned, retrieved 2026-06-23)

## 不確実性

- 7 段階のうち Stage 1, 2, 4 は ECC 内で完結するが、Stage 6 (Apply) と Stage 7 (Observe) は CI / cron 環境への依存が残る。本パッケージは仕組みの定義までを担い、実体は導入先で構築する。
- KPI 閾値は初期値であり、運用ログから再校正する想定。
