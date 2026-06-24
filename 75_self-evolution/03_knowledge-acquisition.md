---
keywords: [self-evolution, knowledge, acquisition]
related: [75_self-evolution/08_self-modification-loop.md, 40_delegation/03_delegation-contract.md]
---
# 03 — Knowledge Acquisition (新ナレッジ取り込み)

> **Stage 8** (本章は self-evolution の Stage 8。Stage 体系の全体像は [08_self-modification-loop.md §9](./08_self-modification-loop.md))

新しい知識・新機能・新パターンを本パッケージに取り込むための正規ルート。`02_auto-update-loop.md` (Stage 1〜7) が「既存知識の鮮度更新」を担うのに対し、本章は「未収載ナレッジの新規取込」を担う。

## 1. 取り込み対象の分類

| 種別 | 例 | 入口 |
|---|---|---|
| 公式 docs 追加 | Claude Code 新サブコマンド / 新 hook 種別 | `06_health-metrics.md` の docs-watch |
| Agents SDK 拡張 | OpenAI Agents SDK / Anthropic Agent SDK の API 改訂 | バージョン tag を polling |
| 学術 / 一次論文 | 評価手法・推論技法の論文 | arXiv RSS / 著者 list |
| コミュニティ知見 | 著名リポの README / examples | スター閾値 + 言及頻度 |
| 内製 Runbook | 案件側で蓄積された再利用可能手順 | 案件リポからの逆流 |

種別ごとに信頼度 (L1/L2) が異なるため、25_writing-style/03_citation-style.md の出典基準に従う。

## 2. 正規ルート (4 ソース)

### 2.1 公式 docs

優先度: 最高 (L1 必須)。

```
1. RSS / sitemap diff で新ページを検出
2. docs-lookup で内容を取得
3. 既存章への影響を grep で逆引き
4. 02_auto-update-loop.md の Stage 3 (Impact) に投入
```

許可される手法のみを採用する。**未公開 / draft の機能はソースに載せない**。

### 2.2 Agents SDK (OpenAI / Anthropic)

優先度: 高 (L1)。

```
1. リリースタグの変更を polling
2. CHANGELOG を docs-lookup で取得
3. routing パターンに影響する API のみ抽出
4. Pattern P-001..P-006 への影響を architect で評価
5. Registry エントリの module hint を更新
```

### 2.3 学術 / 一次論文

優先度: 中 (L1)。

```
1. arXiv 検索 (キーワード: agentic / multi-agent / evaluation harness など)
2. 査読 / 引用数で 1 次選別
3. agent-evaluator に「主張と再現性」を採点させる
4. 採用閾値を超えたものだけ Pattern / Best Practice に取り込む
```

論文単独で本パッケージの規範を変更しない。**実装可能性が示せた論文のみ**取り込む。

### 2.4 コミュニティ知見

優先度: 低 (L2 補助)。

```
1. 一次情報か (個人の経験談ではないか) を確認
2. ブログ記事は引用ではなく「参照先の docs」を取りに行く
3. 公開リポは license と再配布性を確認
4. 採用前に 04_self-repair.md の重複検知を通す
```

## 3. 取り込み手順 (10 ステップ)

```
[1] Source identify       — どのソースか分類
[2] Cite format check     — L1/L2 を判定
[3] Snippet extract       — 必要部分のみ抽出 (BP-009 コンテキスト経済)
[4] Map to package        — 既存章 / Registry エントリへのマッピング
[5] Conflict scan         — 04_self-repair.md の重複・矛盾検知を流す
[6] Pattern fit check     — Pattern P-001..P-006 への当てはめ
[7] Draft section         — 新規章 or 既存章への追記
[8] Gate                  — 60_quality-gates/ チェックリスト
[9] Apply                 — commit + INDEX 更新
[10] Track in radar       — 05_industry-radar.md のソース台帳に追記
```

各ステップは [40_delegation/03_delegation-contract.md](../40_delegation/03_delegation-contract.md) の契約に乗せる。

## 4. ソース台帳 (registry of sources)

`75_self-evolution/sources.yaml` (案) に以下を保持:

```yaml
- id: anthropic-claude-code-docs
  url: https://code.claude.com/docs/en/
  type: official
  watch_method: sitemap_diff
  cadence: weekly
  last_checked: 2026-06-23
- id: openai-agents-sdk
  url: https://openai.github.io/openai-agents-python/
  type: official
  watch_method: release_tag
  cadence: weekly
  last_checked: 2026-06-23
- id: anthropic-engineering-blog
  url: https://www.anthropic.com/engineering
  type: vendor_blog
  watch_method: rss
  cadence: monthly
  last_checked: 2026-06-23
```

新ソース追加には agent-evaluator のレビューを通す。出典が L3 (モデル知識) しか持たないソースは登録不可。

## 5. 不採用の判断基準

| 状況 | 取扱い |
|---|---|
| 既存 Pattern と重複 | 不採用 (`04_self-repair.md` で除外) |
| 出典が L3 のみ | 不採用 |
| 学術主張に再現コードが無い | 保留 (sources.yaml に `pending` で記録) |
| ライセンス不明 | 不採用 |
| 個人名 / 組織名を引かないと説明できない | 不採用 (本パッケージは中立) |

## 6. 反対意見の取り扱い

新ナレッジが既存原則と矛盾する場合は Pattern P-003 (Red-Team) を強制適用する:

- generator: 取り込みを推奨する役
- judge: 取り込みを評価する役
- refuter: 取り込みに反論する役
- synthesis: orchestrator が決定理由を残す

合意できない場合は「保留」のまま 1 四半期持ち越す。

## 7. 失敗例 (避ける)

- 公式以外のソースから「最新仕様」と称して取り込む
- 論文の主張を一次出典なしに取り込む
- 既存 Pattern を削らずに類似 Pattern を追加 (`04_self-repair.md` の重複検知に抵触)
- 取り込み後に 05_industry-radar.md の台帳更新を忘れる

## 出典

- Anthropic Claude Code 公式 docs (https://code.claude.com/docs/en/, retrieved 2026-06-23)
- OpenAI Agents SDK (https://openai.github.io/openai-agents-python/, retrieved 2026-06-23)
- 本パッケージ 25_writing-style/03_citation-style.md (retrieved 2026-06-23)
- 本パッケージ 60_quality-gates/ (planned, retrieved 2026-06-23)

## 不確実性

- 学術ソースの採点は agent-evaluator の主観に依存する。複数 evaluator の合議制を導入する余地がある。
- sources.yaml の運用は本パッケージでは案として提示するに留め、実体は案件側 CI に委ねる。
