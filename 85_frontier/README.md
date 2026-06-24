---
keywords: [frontier]
related: []
---
# 85_frontier — 業界標準の半歩先

> retrieved_at: 2026-06-23

本ディレクトリは、ECC Method の他章 (`01_overview/` 〜 `80_commands/`, `90_ecc-usage/`, `99_distribution/`) が扱う「業界標準として定着した知識」と異なり、**業界標準の半歩先 (= 公式が試験提供中 / 主要論文発表直後 / 限定的に本番採用が始まった段階)** のトピックを扱う。

## 1. このディレクトリの目的

- 業界標準だけを扱う章群は、本質的に「半年〜数年遅れ」の素材で構成される。frontier 章はその遅れを最小化し、Method 利用者が「次の標準を先取りした設計」を準備できる状態を保つ。
- 公式発表 / 主要論文 / 試験提供機能を、それらが正式採用される前から取り込み、experimental ステータスで記録する。
- 業界標準に昇格したトピックは、適切な通常章 (例: `40_delegation/`, `35_tdd-phase/`) に統合し、本ディレクトリからは要約だけ残す。

## 2. 通常章との運用上の違い

| 項目 | 通常章 | frontier (本ディレクトリ) |
|---|---|---|
| 鮮度サイクル | 四半期 (90 / 180 / 365 日閾値) | 月次 + 公式発表トリガ (30 / 60 / 90 日閾値) |
| 取り込みハードル | 業界標準として複数ベンダー採用 | 公式試験提供 / 主要論文 / 限定 GA でも可 |
| ステータスラベル | `fresh / valid / aging / stale / obsolete` | `active / review-due / stale / deprecated` |
| 出典構成 | L1 (公式) を中心に L2 (権威ある二次情報) も可 | L1 (公式 URL) を必須とし 60% 以上を 2025-2026 H1 の素材で構成 |

詳細は `../75_self-evolution/01_freshness-policy.md §9 frontier 専用の高速サイクル` を参照。

## 3. 出典規律

- **主出典**: 2025-2026 H1 の公式情報 (Anthropic / OpenAI の news / blog / docs / arXiv の同期間論文) を主出典とし、frontier ファイル全体の出典のうち 60% 以上を占めるようにする。
- **基礎研究文脈**: 2023-2024 の文献は「先端の前提となる基礎研究の補強」としてのみ引用する。最新動向の根拠としては使わない。
- **L1 必須**: 公式 URL + `retrieved_at: YYYY-MM-DD` を付与する。L2 (公式が引用するブログ / 著者の個人サイト) は補強としてのみ可。
- **個人名・組織名・絶対パスの本文記載は禁止**。出典 URL 以外で個人名を出さない。

## 4. 全章共通の 5 セクション構成

frontier 配下の各 `.md` は、原則として以下の 5 セクションで構成する。

1. **【現状】業界標準** — 何が業界標準として定着しているか (= 陳腐化候補)。
2. **【先端】今試されていること** — Anthropic / OpenAI / 学術リーダーが実装・公開している先端事例。
3. **【基礎研究】先端を支える研究文脈** — 2023-2024 を中心とした基礎研究 (補強用)。
4. **【未来】標準化されたら本パッケージのどこに統合するか** — 通常章への昇格先と統合形態。
5. **【今すぐ準備】Method 利用者が今できる準備** — 本パッケージを使う実装者が今日から取れるアクション。

各章の末尾には必ず「## 出典」「## 不確実性」を置く (Method 全体の規約と同一)。

## 5. 更新責任とレビュー

- **自動更新**: `../75_self-evolution/02_auto-update-loop.md` Stage 1 (検知) が公式 RSS / sitemap diff から trigger を発火させる。
- **月次レビュー**: `../75_self-evolution/08_self-modification-loop.md` Stage 11 (自己改変ループ) または人間オペレータが、本ディレクトリ全章の `retrieved_at` と各セクションを月次で点検する。
- **トリガ反応**: 公式発表 (Anthropic News / OpenAI Blog) で frontier 関連の発表があった場合、サイクル内であっても 7 日以内に該当章を再点検する。
- **昇格判定**: 連続 3 ヶ月以上 `active` を維持し、複数ベンダーで採用されている、または公式仕様として明文化されたトピックは、`../75_self-evolution/05_industry-radar.md §9 frontier 連動` に従い通常章へ統合する。

## 6. 既存ファイル一覧

| ファイル | テーマ |
|---|---|
| `01_horizon-scanning.md` | 業界標準が陳腐化する仕組みと先端追跡法 |
| `02_self-modifying-agents.md` | 自己改変エージェント (Darwin Gödel Machine / ADAS) |
| `03_dynamic-skill-synthesis.md` | 実行時 skill 合成 |
| `04_emergent-multi-agent.md` | 創発的 multi-agent |
| `05_continual-learning.md` | 継続学習 |
| `06_world-models-for-agents.md` | エージェント向け world model |
| `07_post-llm-architectures.md` | post-LLM アーキテクチャ |

## URL 検証ステータス (2026-06-23 時点)

frontier 7 章で引用した全 46 URL を本作業時に WebFetch で実機検証した結果。

| 状態 | 件数 | 内容 |
|---|---|---|
| 200 OK (実機確認済) | 39 | 各章の引用先で個別タイトル・日付一致 |
| 404 (削除確定) | 1 | `anthropic.com/news/agent-skills` → engineering blog URL に置換済 |
| 403 (Cloudflare bot 拒否、URL 自体は実在の可能性高) | 4 | `openai.com/blog`, `openai.com/index/introducing-chatgpt-agent/`, `openai.com/index/new-tools-for-building-agents/`, ブラウザ経由のみ確認可 |
| 引用無効 (検索ヘルプ画面) | 1 | `arxiv.org/search/?query=...` — 個別 arXiv ID 引用に置換済 |
| リダイレクト | 1 | `docs.claude.com/...` → `platform.claude.com/...` (両方到達可) |

検証手順は本パッケージ作業者が WebFetch を 1 件ずつ実行。subagent の生死報告は採用していない (subagent 報告 ≠ 実機確認)。

## 出典

- 本パッケージ METHOD.md §10 自己更新ループ (retrieved 2026-06-23)
- 本パッケージ 75_self-evolution/01_freshness-policy.md §9 frontier 専用の高速サイクル (retrieved 2026-06-23)
- 本パッケージ 75_self-evolution/05_industry-radar.md §9 frontier 連動 (retrieved 2026-06-23)
- Anthropic News (https://www.anthropic.com/news, retrieved 2026-06-23, 200 OK)
- OpenAI Blog (https://openai.com/blog, retrieved 2026-06-23, **HTTP 403** by bot block — ブラウザ経由のみ確認可)
- Anthropic Claude Code 公式 docs (https://code.claude.com/docs/en/, retrieved 2026-06-23, 200 OK)

## 不確実性

- 月次サイクルと公式発表トリガの組み合わせは、発表頻度が高い 2025-2026 期の状況に最適化された設定。発表頻度が落ち着けば、四半期サイクルへ合流させる方が運用コストが下がる可能性がある。
- 「主出典の 60% 以上を 2025-2026 H1 で構成」という規律は、本ディレクトリ作成時点 (2026-06) の経験則。期間定義は `../75_self-evolution/06_health-metrics.md` の素材年代分布が偏ってきたら見直す。
- 昇格判定の「連続 3 ヶ月以上 active」「複数ベンダー採用」基準は、業界標準形成の経験則であり実測値ではない。誤って昇格させた場合は降格手順 (`01_freshness-policy.md §9.5`) で巻き戻せる設計にしている。
