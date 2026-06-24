---
keywords: [self-evolution, industry, radar]
related: [75_self-evolution/08_self-modification-loop.md]
---
# 05 — Industry Radar (四半期ベンチ)

> **Stage 10 (radar 側)** (本章は self-evolution の Stage 10、`07_review-cadence.md` と並列で Stage 10 を担う。Stage 体系の全体像は [08_self-modification-loop.md §9](./08_self-modification-loop.md))

ECC エコシステムの動向を四半期ごとに体系的に把握し、本パッケージへ反映するための手順。`03_knowledge-acquisition.md` (Stage 8) のソース台帳と連動する。

## 1. 目的

- 公式 / SDK / 学術 / コミュニティの 4 ソース系統に対し、四半期 1 度の構造化レビューを実施
- 鮮度ステータス `aging` 以上の出典を一括再検証
- 原則・Pattern・Registry エントリの妥当性を再評価

## 2. レビュー範囲 (4 ソース)

### 2.1 Anthropic 公式

| 監査対象 | 取得方法 |
|---|---|
| Claude Code 公式 docs | sitemap diff |
| Engineering Blog | RSS |
| Sub-agents / Skills / MCP リファレンス | docs-lookup |
| 価格・モデル一覧 | model 行のみ snapshot |

### 2.2 OpenAI Agents SDK

| 監査対象 | 取得方法 |
|---|---|
| Agents SDK CHANGELOG | release tag |
| Cookbooks / examples | git log |
| Realtime / Tool use 仕様 | docs-lookup |

### 2.3 学術 (一次論文)

| 監査対象 | 取得方法 |
|---|---|
| arXiv: agentic / multi-agent / evaluation | キーワード検索 |
| 主要会議録 | サイト内サーチ |
| 著者リスト (本パッケージで参照済み) | 著者ページ polling |

### 2.4 コミュニティ

| 監査対象 | 取得方法 |
|---|---|
| 著名公開リポ | star / fork 増加率 |
| 公式が引用するブログ | 引用元のみ追跡 |
| spec-kit 系プロジェクト | release tag |

## 3. 四半期ベンチ手順 (10 ステップ)

```
[1] Snapshot      — sources.yaml の last_checked を一括 snapshot
[2] Pull          — 4 系統のソースを並列で取得 (BP-003)
[3] Diff          — 旧 snapshot との差分を構造化
[4] Cluster       — 差分を「破壊的 / 機能追加 / 仕様明確化 / 価格改定」に分類
[5] Map           — 影響を受ける章 / Registry エントリを逆引き
[6] Score         — 影響度 (S/M/L) と緊急度 (今/次/翌期) を採点
[7] Plan          — planner が反映計画を起こす
[8] Apply         — 02_auto-update-loop.md の Stage 4〜6 に流す
[9] Verify        — 反映後の KPI を 06_health-metrics.md で確認
[10] Publish      — 75_self-evolution/quarterly_<YYYY-Q>.md として記録
```

## 4. レビュー出力フォーマット

四半期レポートは以下の構造で残す:

```markdown
# Quarterly Radar — 2026 Q2

## サマリ
- 総 finding 数: <N>
- 破壊的変更: <N>
- 反映済み: <N> / 持ち越し: <N>

## ソース別

### Anthropic 公式
- finding-001: <概要> (severity: <block|warn|note>, applied: <commit>)
- ...

### OpenAI Agents SDK
- ...

### 学術
- ...

### コミュニティ
- ...

## 翌期持ち越し
- finding-XXX: <理由>

## 出典
- ...

## 不確実性
- ...
```

## 5. ソース別の取り扱い差

| ソース | 採用ハードル | 適用先 |
|---|---|---|
| Anthropic 公式 | 低 (L1) | METHOD / Registry / Pattern |
| OpenAI Agents SDK | 低 (L1) | Registry の SDK 連携部 |
| 学術 | 中 (再現性確認) | Best Practices / 評価軸 |
| コミュニティ | 高 (L2 補助) | 失敗例 / 65_pitfalls/ |

## 6. 委任構成

四半期ベンチは並列度が高い。以下の committee を編成する:

| 役割 | 専門家 |
|---|---|
| Coordinator | orchestrator (Opus 系) |
| Source pullers (×4) | Explore + docs-lookup (Haiku 寄せ) |
| Diff analyst | architect |
| Impact scorer | agent-evaluator |
| Drafters | planner + lang-reviewer (該当時) |
| Final approver | orchestrator + agent-evaluator (合議) |

並列起動は同一メッセージ内で複数 Agent をまとめる (BP-003)。

## 7. レビュー成果の永続化

- `quarterly_<YYYY-Q>.md` は本パッケージ配下に保存
- `sources.yaml` の last_checked を一括更新
- KPI ダッシュボード (`06_health-metrics.md`) に四半期マークを打つ

## 8. 失敗例 (避ける)

- 1 ソースのみで完結させる (4 系統並列が前提)
- finding を全件即時反映 (緊急度別に層別する)
- 持ち越し finding を翌期に消し込みしないまま放置 (3 期持ち越しで強制再評価)

## 9. frontier 連動

`85_frontier/` 配下は月次 + 公式発表トリガのサイクルで運用される (`01_freshness-policy.md §9`)。industry radar (本章) の四半期サイクルとは役割を分担する。

### 9.1 サイクル分担

| サイクル | 主な役割 | アウトプット |
|---|---|---|
| frontier 月次 | 公式発表 / 主要論文を素早く取り込み、experimental 状態でドキュメント化 | `85_frontier/*.md` の各章更新 |
| industry radar 四半期 | 4 ソース系統を体系的にレビューし、本パッケージ全体への影響を構造化 | `quarterly_<YYYY-Q>.md` |

frontier の trigger fire は radar の Stage [3] Diff 入力にも直送される (二重取り込み防止のため `radar_consumed: true` を frontier 側に記録する)。

### 9.2 frontier から industry radar への昇格条件

frontier で扱っていたトピックを radar の正規 finding として扱う条件:

- 公式が GA (一般提供) を発表している、または
- 主要ベンダー (Anthropic / OpenAI 公式 SDK の少なくとも 1 つ) が標準パスとして採用している

昇格後は四半期 finding として `quarterly_<YYYY-Q>.md` に記録し、severity を付ける。

### 9.3 industry radar から本体章への昇格条件

radar finding を `85_frontier/` 外の通常章 (例: `40_delegation/`, `35_tdd-phase/`) に統合する条件:

- frontier 側で連続 3 ヶ月以上 `active` ステータスを維持している
- かつ複数ベンダー (Anthropic / OpenAI 以外を含む) で採用されている、または公式仕様として明文化されている

昇格時は frontier 側の該当章は要約だけ残し、詳細は通常章に移す。

## 10. 簡易チェックリスト

- [ ] 4 ソースすべて pull したか
- [ ] sources.yaml の last_checked を更新したか
- [ ] finding ごとに severity を付けたか
- [ ] 反映 commit を quarterly レポートと相互リンクしたか
- [ ] KPI ダッシュボードに四半期マークを打ったか
- [ ] 持ち越し finding を次期 backlog に登録したか

## 出典

- 本パッケージ METHOD.md §10 自己更新ループ (retrieved 2026-06-23)
- Anthropic Claude Code 公式 docs (https://code.claude.com/docs/en/, retrieved 2026-06-23)
- OpenAI Agents SDK (https://openai.github.io/openai-agents-python/, retrieved 2026-06-23)
- Anthropic Engineering: Built multi-agent research system (https://www.anthropic.com/engineering/built-multi-agent-research-system, retrieved 2026-06-23)

## 不確実性

- 学術ソースの選定は探索範囲が広く、見落としが発生しうる。著者リストを継続更新する形で漏れを抑える。
- 四半期サイクルは ECC の更新頻度次第で短縮の余地あり。月次サイクルへの昇格判定は `06_health-metrics.md` の陳腐率閾値で行う。
