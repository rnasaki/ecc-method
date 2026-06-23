# 06 — Health Metrics (健全性 KPI)

本パッケージの健全性を継続監視するための KPI 定義。`02_auto-update-loop.md` および `04_self-repair.md` のトリガとして用い、四半期ベンチ (`05_industry-radar.md`) で再評価する。

## 1. KPI 一覧

| KPI | 定義 | 目標値 | 計測周期 |
|---|---|---|---|
| 陳腐率 (obsolescence_rate) | `aging` 以上 (D > 90 日) のエントリ比率 | ≤ 25% | 月次 |
| 死活率 (citation_alive_rate) | 出典 URL の HEAD 200 OK 比率 | ≥ 98% | 週次 |
| 重複率 (duplication_rate) | Jaccard ≥ 0.85 で類似する Runbook / Registry エントリ比率 | ≤ 3% | 月次 |
| カバレッジ (coverage) | 原則 / Pattern を 1 件以上参照する章の比率 | ≥ 90% | 月次 |
| 禁止語混入率 (banned_phrase_hit) | block 級禁止語のヒット件数 (ファイル単位) | 0 | 毎コミット |
| リンク健全率 (link_alive_rate) | 内部リンク・外部 URL を合算した健全率 | ≥ 99% | 週次 |
| Quality Gate 通過率 (gate_pass_rate) | 直近 30 日の patch のうちゲート pass 比率 | ≥ 80% | 月次 |
| Runbook 再利用率 (runbook_reuse) | INDEX 検索ヒット / 同種タスク発生数 | ≥ 70% | 月次 |

## 2. 計測方法

### 2.1 陳腐率

```
total = (Registry エントリ + Runbook + 出典) 数
aging = last_verified or retrieved_at の経過日数 > 90 のもの
rate  = aging / total
```

実装は `01_freshness-policy.md` §3 のスクリプトを再利用。

### 2.2 死活率

外部 URL は週次で HEAD リクエスト (timeout 5s)。連続 2 週 NG で `obsolete` 候補に格上げ。

### 2.3 重複率

```
1. Registry エントリ description / Runbook title を抽出
2. n-gram (n=3) ベクタ化
3. ペアワイズ Jaccard を計算
4. 0.85 以上のペア数 / 全ペア数
```

### 2.4 カバレッジ

```
1. 全 .md を収集
2. 各章本文に原則名 (委任ファースト等) または Pattern P-XXX を引いているかを grep
3. 引いている章 / 全章
```

### 2.5 禁止語混入率

`25_writing-style/02_avoidance-patterns.md` §4 のスクリプトでヒット件数を機械集計。block 級は 0 を維持。

## 3. ダッシュボード (案)

最小構成は `_tmp/health_metrics.json` の形で永続化:

```json
{
  "snapshot_at": "2026-06-23",
  "obsolescence_rate": 0.18,
  "citation_alive_rate": 0.99,
  "duplication_rate": 0.02,
  "coverage": 0.93,
  "banned_phrase_hit": 0,
  "link_alive_rate": 0.995,
  "gate_pass_rate": 0.85,
  "runbook_reuse": 0.71
}
```

時系列は append-only で `_tmp/health_metrics_history.jsonl` に追記する。

## 4. 閾値外動作 (アラート → 自動修復)

| 条件 | アクション |
|---|---|
| obsolescence_rate > 25% | `02_auto-update-loop.md` Stage 1 を即時起動 |
| citation_alive_rate < 95% | URL 死活レポートを `04_self-repair.md` に投入 |
| duplication_rate > 5% | `04_self-repair.md` 重複検知を月次から週次に昇格 |
| coverage < 85% | 章レビューを `02_auto-update-loop.md` Stage 3 で実施 |
| banned_phrase_hit > 0 | コミット ブロック (block severity) |
| link_alive_rate < 95% | リンク全置換ジョブを起動 |
| gate_pass_rate < 70% | ゲート設計を四半期 radar で再評価 |
| runbook_reuse < 50% | INDEX 設計 / 検索プロトコルを再設計 |

## 5. 連携

| 連携先 | 用途 |
|---|---|
| [01_freshness-policy.md](./01_freshness-policy.md) | 陳腐率の元データ |
| [02_auto-update-loop.md](./02_auto-update-loop.md) | 自動修復のトリガ |
| [04_self-repair.md](./04_self-repair.md) | 重複・リンク不全の修復 |
| [05_industry-radar.md](./05_industry-radar.md) | 四半期レビュー時の入力 |
| [07_review-cadence.md](./07_review-cadence.md) | 週次 / 月次 / 四半期チェック表 |

## 6. 計測の自動化

最小構成は週次 cron で以下を実行:

```bash
# pseudo
ecc-method/80_commands/bootstrap.sh --health-check
# 内部で:
#  1. 鮮度判定スクリプト
#  2. URL 死活確認
#  3. 重複検知
#  4. 禁止語 grep
#  5. health_metrics.json 出力
```

`80_commands/bootstrap.sh` は新規セットアップ用が主目的だが、`--health-check` サブコマンドの導入余地を残す。

## 7. 失敗例 (避ける)

- 月初の 1 度だけ計測して放置 (週次 / 月次 / 四半期の階層を守る)
- 閾値突破時に手動でしか修復しない (自動修復に乗せない)
- 全 KPI を「平均」で示し中央値・最悪値を示さない (テールリスクが見えない)

## 出典

- 本パッケージ METHOD.md §10 自己更新ループ (retrieved 2026-06-23)
- 本パッケージ 60_quality-gates/ (planned, retrieved 2026-06-23)
- Anthropic Engineering: Built multi-agent research system (https://www.anthropic.com/engineering/built-multi-agent-research-system, retrieved 2026-06-23)

## 不確実性

- 閾値はすべて初期値であり、運用ログから再校正する。最低 3 ヶ月間の実測を経てから固定化する。
- 重複率の Jaccard 閾値 (0.85) は短文タイトルでは偽陽性が発生しやすい。L2 重複検知 (`04_self-repair.md`) で補正する。
