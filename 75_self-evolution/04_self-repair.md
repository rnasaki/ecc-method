# 04 — Self-Repair (整合性自動修復)

> **Stage 9** (本章は self-evolution の Stage 9。Stage 体系の全体像は [08_self-modification-loop.md §9](./08_self-modification-loop.md))

リンク切れ・重複・陳腐化など、本パッケージ自身の整合性ゆらぎを検知して自動修復するためのプロトコル。`02_auto-update-loop.md` (Stage 1〜7) のステージ間でも呼び出される。

## 1. 修復対象

| 種別 | 例 | 検知レイヤ |
|---|---|---|
| リンク切れ | `[link](path)` の path が不存在 | 静的 |
| 内部 ID 不整合 | Pattern P-006 を引いているが registry に未登録 | 静的 |
| 重複 Runbook | 同一手順が 2 ファイルに分散 | 構造 |
| 重複 Registry エントリ | id が衝突 / description が酷似 | 構造 |
| 陳腐 Cross-Reference | 被参照ファイルが消滅 | 静的 |
| 出典 URL 死活 | 404 / DNS 不能 | 動的 |
| 禁止語混入 | `25_writing-style/02_banned-phrases.md` 違反 | 静的 |
| 鮮度逸脱 | `obsolete` ステータスのまま引用 | 静的 |

## 2. 検知パイプライン

```
[1] 静的スキャン      — grep / link-check / id 一意性
[2] 構造スキャン      — registry の cross-table 検証
[3] 動的スキャン      — 出典 URL の HEAD 確認 (週次)
[4] 重複検知          — n-gram / 段落 hash で類似度 ≥ 0.9 を抽出
[5] レポート生成      — _tmp/repair_findings.json
[6] 委任              — agent-evaluator がトリアージ
[7] ドラフト          — 修復 patch を planner が起こす
[8] ゲート + 反映     — 02_auto-update-loop.md の Stage 5 / 6 に合流
```

## 3. リンク切れ検知 (例)

```bash
# 内部リンク網羅 (Markdown 内 (../)?xxx.md or anchor)
grep -rEn '\]\(([^)]+\.md)(#[^)]+)?\)' --include='*.md' . \
| awk -F':' '{print $1" -> "$3}' \
| while read line; do
    src=$(echo "$line" | cut -d' ' -f1)
    target=$(echo "$line" | sed -E 's/.* -> //; s/\(([^)]+\.md).*/\1/')
    [ -f "$(dirname $src)/$target" ] || echo "BROKEN: $src -> $target"
  done
```

実装は `60_quality-gates/` 側の link-check に統合する。

## 4. 重複検知

3 段階で抽出する。本表で「L0/L1/L2」と書くものはすべて **Detection Tier** (重複検知の段階) を指す。Memory layer / Registry Layer / Escalation Level とは別概念。

| 段階 | 手法 | 閾値 |
|---|---|---|
| Detection L0 | id 完全一致 | exact |
| Detection L1 | description / front-matter title の n-gram | Jaccard ≥ 0.85 |
| Detection L2 | 段落 embedding 類似度 (オプション) | cosine ≥ 0.92 |

検出後の処理:

- 自動マージは行わない (merge は意味的判断を要するため)
- planner が「保持 / 統合 / 退避」候補を提案
- agent-evaluator が単独で承認できるのは「保持」のみ。統合・退避は orchestrator 経由

## 5. 矛盾検知

「主張 A を述べる章」と「A を否定する章」が同居していないかを検知する。

実装方針:

- 主要規範 (原則・禁止語・出典基準) を `_tmp/canonical_claims.yaml` に箇条書き化
- 各章本文を agent-evaluator が読み、canonical_claims に対して `support` / `neutral` / `conflict` で採点
- `conflict` が出た章のみ red-team Pattern P-003 で再評価

## 6. 修復の優先度

severity に従って逐次修復する:

| severity | 例 | 起動条件 |
|---|---|---|
| block | リンク切れ / 出典 URL 死活 / 禁止語 | 検知次第即修復 |
| warn | 重複 / 鮮度 aging | 月次バッチ |
| note | description 表現ゆれ | 四半期バッチ |

## 7. 反映後の検証

修復 patch を反映した後は以下を必ず再実行する:

- 静的スキャン (リンク・id・禁止語)
- `01_freshness-policy.md` の鮮度判定
- `06_health-metrics.md` の KPI 再計測

KPI が悪化した場合は revert + 修復案を再起こし。

## 8. 失敗例 (避ける)

- 重複統合を自動マージで実施 (意味の取りこぼしが発生)
- リンク切れを `# TODO` でコメントアウトして残す (block 違反)
- 矛盾検知で `conflict` が出たまま反映を進める

## 9. 連携

| 連携先 | 用途 |
|---|---|
| [01_freshness-policy.md](./01_freshness-policy.md) | 鮮度逸脱の検知 |
| [02_auto-update-loop.md](./02_auto-update-loop.md) | 修復 patch を Stage 5/6 に合流 |
| [06_health-metrics.md](./06_health-metrics.md) | 修復前後の KPI 集計 |
| [60_quality-gates/](../60_quality-gates/) | 反映前の独立検証 |

## 出典

- 本パッケージ METHOD.md §10 自己更新ループ (retrieved 2026-06-23)
- 本パッケージ 25_writing-style/02_banned-phrases.md (retrieved 2026-06-23)
- Anthropic Claude Code Sub-agents docs (https://code.claude.com/docs/en/sub-agents, retrieved 2026-06-23)

## 不確実性

- Detection L2 重複検知 (embedding) は埋め込みモデル依存で結果が揺れる。Detection L0 / Detection L1 で 8 割は検出できる前提とし、Detection L2 は補助に留める。
- 矛盾検知の `canonical_claims.yaml` は本パッケージで雛形のみ提供する。導入先で原則差異がある場合は上書きする。
