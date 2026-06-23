# 01 — Freshness Policy (鮮度判定)

本パッケージのナレッジ・Registry エントリ・Runbook を陳腐化させないための鮮度ポリシー。`last_verified` 日付を起点に 4 段階のステータスを付与し、自動更新ループ ([02_auto-update-loop.md](./02_auto-update-loop.md)) のトリガにする。

## 1. 適用対象

| 対象 | フィールド | 配置例 |
|---|---|---|
| Expert Registry エントリ | `last_verified: YYYY-MM-DD` | `40_delegation/01_expert-registry.md` |
| Runbook | front-matter 相当の `last_verified` | `45_runbook/<id>.md` |
| Best Practices JSON | `retrieved_at` | `./05_principles/_data/best_practices.json` |
| ドキュメント章 | 各章末「## 出典」内 retrieved_at | `*.md` |
| 外部 URL 引用 | 引用の retrieved_at | 本文中 |

`last_verified` / `retrieved_at` のいずれかが必須。両方ある場合は新しい方を採用する。

## 2. ステータス遷移

`now - last_verified` を経過日数 D とする。

| D (日数) | ステータス | 取扱い |
|---|---|---|
| D ≤ 30 | `fresh` | そのまま採用 |
| 30 < D ≤ 90 | `valid` | そのまま採用。次回ベンチで再確認候補 |
| 90 < D ≤ 180 | `aging` | 利用可。出典再確認を推奨。レビュー時に必ずチェック |
| 180 < D ≤ 365 | `stale` | 自動更新ループ ([02](./02_auto-update-loop.md)) の検知対象。30 日以内に再検証 |
| 365 < D | `obsolete` | 利用停止候補。引用前にエージェントが警告を出す |

## 3. 検出スクリプト (参考)

```bash
# 全 .md から last_verified / retrieved_at を抽出し、180 日超を一覧化
TODAY=$(date +%s)
grep -rEn '^(last_verified|retrieved_at):[[:space:]]*[0-9]{4}-[0-9]{2}-[0-9]{2}' \
  --include='*.md' --include='*.json' . \
| awk -F'[: ]+' -v today="$TODAY" '
  {
    cmd = "date -d " $NF " +%s"; cmd | getline ts; close(cmd);
    age = int((today - ts) / 86400);
    if (age > 180) print age" days  "$0;
  }'
```

実装時は `60_quality-gates/` 側のチェック CLI に組み込む。

## 4. 表示規約

ドキュメント本文中で出典を引く場合は以下を明示する:

```
出典: <URL or path> (retrieved 2026-06-23, status: aging)
```

`status` は鮮度判定スクリプトが自動付与する。手書き時は `fresh` / `valid` のみ許容。

## 5. 例外

| 状況 | 取扱い |
|---|---|
| 出典が「不変仕様」 (例: RFC 2119, ISO 規格番号など、改訂が稀なもの) | `obsolete` 警告対象外。年次再確認のみ |
| 内製ナレッジ (本パッケージ内 cross-reference) | リポ HEAD と同期している場合は `fresh` 扱い |
| 著者・組織が消滅した出典 | `obsolete` に強制遷移し、代替出典を探索 |

## 6. 依存関係

| 連携先 | 用途 |
|---|---|
| [02_auto-update-loop.md](./02_auto-update-loop.md) | `stale` 検知 → 検知段階の入力 |
| [04_self-repair.md](./04_self-repair.md) | `obsolete` の自動退避 |
| [06_health-metrics.md](./06_health-metrics.md) | `aging` 比率を陳腐率 KPI として集計 |
| [40_delegation/01_expert-registry.md](../40_delegation/01_expert-registry.md) | Registry エントリの監査 |
| [45_runbook/01_runbook-spec.md](../45_runbook/01_runbook-spec.md) | Runbook front-matter 規約 |

## 7. 運用フロー (要約)

```
[週次]   stale 一覧を生成 → アサインなしの場合は agent-evaluator にトリアージ依頼
[月次]   aging 比率を健全性 KPI に記録
[四半期] industry radar (05_industry-radar.md) で全 source の最新化
```

## 8. 失敗例 (避ける)

- `last_verified` を更新するだけで本文を読み直さない (機械的更新は禁止)
- D > 365 のエントリを引用 (obsolete はまず再検証してから)
- 手元 PR に新規 entry を追加しながら `last_verified` を未来日にする (D を負にしない)

## 9. frontier 専用の高速サイクル

`85_frontier/` 配下のファイル群は、業界標準の半歩先 (= 公式が試験提供中 / 主要論文発表直後) を扱うため、`§2` の四半期サイクル前提では遅すぎる。frontier では別の閾値を適用する。

### 9.1 通常サイクルとの対比

| 区分 | 適用範囲 | サイクル基本周期 |
|---|---|---|
| 通常 (Method 全体) | `01_overview/` 〜 `99_distribution/` (`85_frontier/` 除く) | 四半期 (90 / 180 / 365 日) |
| frontier 高速 | `85_frontier/` 配下のすべての `.md` | 月次 + 新発表トリガ |

### 9.2 frontier の鮮度ステータス閾値

`now - last_verified` の経過日数 D で判定する (`§2` の表を frontier ファイルのみ上書き)。

| D (日数) | ステータス | 取扱い |
|---|---|---|
| D ≤ 30 | `active` | そのまま採用 (月次レビュー対象) |
| 30 < D ≤ 60 | `review-due` | 30 日以内に出典再点検 |
| 60 < D ≤ 90 | `stale` | 自動更新ループの強制対象 (`02_auto-update-loop.md` Stage 1 に直送) |
| 90 < D | `deprecated` | 引用前に必ず再検証。再検証できない場合は frontier から外す |

通常章の `fresh / valid / aging / stale / obsolete` とは別ラベルで併存する (混同しないため接頭辞 `frontier:` を付けて表示してよい)。

### 9.3 トリガベース更新 (周期に縛られない)

公式情報源で frontier 関連の発表があった場合、サイクル内であっても 7 日以内に該当章を再点検する。トリガ源の例:

| トリガ源 | 取得方法 |
|---|---|
| Anthropic News (https://www.anthropic.com/news) | RSS / sitemap diff |
| OpenAI Blog (https://openai.com/blog) | RSS / sitemap diff |
| arXiv 該当カテゴリ (cs.AI / cs.MA) の新着で本パッケージ既出著者・既出キーワードを含むもの | キーワード polling |

トリガ判定は `02_auto-update-loop.md` の Stage 1 (検知) と同居させる。trigger fire 後の処理は通常更新と同じ。

### 9.4 last-verified の更新作法

- frontier ファイルの「## 出典」の `retrieved_at` は月次で更新する。
- 機械的更新 (本文を読まずに日付だけ書き換え) は通常章と同様に禁止。
- 月次レビュー時に出典 URL の生存確認 (HTTP 200 + 主要見出しの diff) を必ず行う。

### 9.5 通常章への昇格 / 降格

- frontier → 通常章への昇格条件は `05_industry-radar.md §frontier 連動` を参照。
- 昇格した章は frontier 高速サイクルから外れ、通常の四半期サイクルに合流する。
- 逆に、通常章で扱っていた話題が「再び実験的状態に戻った」場合 (例: 公式が機能を撤回) は frontier に降格してよい。

## 出典

- 本パッケージ METHOD.md §10 自己更新ループ (retrieved 2026-06-23)
- 本パッケージ 40_delegation/01_expert-registry.md §鮮度管理 (retrieved 2026-06-23)
- Anthropic Claude Code Sub-agents docs (https://code.claude.com/docs/en/sub-agents, retrieved 2026-06-23)
- Anthropic News (https://www.anthropic.com/news, retrieved 2026-06-23)
- OpenAI Blog (https://openai.com/blog, retrieved 2026-06-23)

## 不確実性

- 30/90/180/365 の閾値は ECC 仕様改訂頻度の経験則であり、実測値で再校正する想定。導入先で `06_health-metrics.md` の運用ログから p50 改訂間隔を計測し、上振れ次第で閾値を引き上げる。
- 鮮度ステータスは「日付」のみで判定するため、出典内容の重大変更は検出できない。`02_auto-update-loop.md` の差分検知と組み合わせて運用する。
- frontier 月次サイクルの 30/60/90 日閾値は、Anthropic / OpenAI の公式発表が「数週間〜数ヶ月単位」で頻繁に出る現状に基づく経験則であり、発表頻度が落ち着けば通常サイクルへ統合する。`06_health-metrics.md` の trigger 発火数を四半期ごとに観察して再校正する。
