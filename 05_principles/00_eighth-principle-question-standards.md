---
keywords: [principles, eighth, principle, question, standards]
related: [05_principles/01_seven-habits-mapping.md, 25_writing-style/03_citation-style.md, 75_self-evolution/01_freshness-policy.md, 75_self-evolution/02_auto-update-loop.md, 75_self-evolution/08_self-modification-loop.md]
---
# 00 — 標準懐疑原則 (Question the Standards)

retrieved_at: 2026-06-23

運用原則群の外側に **標準懐疑原則** を置く。「業界標準は陳腐化候補」を前提とし、**標準に乗ったまま固まらない** ための規律を定義する。

---

## 1. 原則の宣言

```
業界標準 = 数年後に陳腐化する候補。
リーダー (フロンティア) の尖った試みを四半期で追跡し、
半歩先を取り込む規律を持つ。
「これは将来陳腐化する」ことを恐れず書く。
```

---

## 2. なぜ標準懐疑原則か

運用原則群 (委任ファースト / センス委譲 / ゼロ重複 / 承認最小 / コンテキスト最小 / 出典必須 / 反対意見併記) は **今ある標準を正しく運用する** 規律である。これだけでは次の劣化に対応できない:

- 標準そのものが陳腐化する (例: agent 設計の前提が 1 年で書き換わる)
- 「みんなやっている」だけで採用された手法を疑えなくなる
- リーダー側の尖った試みが視界に入る前に固定化が進む

運用原則群を **保守の規律**、標準懐疑原則を **更新の規律** と位置付け、両者の併走で陳腐化を遅らせる。

### 思想的な系譜 (出典付き)

標準懐疑原則は単一の理論からの引用ではなく、以下の複数系譜の合流点に位置する。本パッケージで便宜的に「更新の規律」と呼んでいる側面は、PDCA / OODA / Antifragile の合流に近い。

| 系譜 | 関連性 | 出典 |
|---|---|---|
| **Innovator's Dilemma** (Clayton Christensen, 1997) | 「業界リーダーが既存顧客の要求に応え続けて陳腐化する」破壊的イノベーション論。**業界標準陳腐化の主張そのもの** | https://en.wikipedia.org/wiki/The_Innovator%27s_Dilemma (retrieved_at: 2026-06-23, L2) |
| **First Principles Thinking** | 「常識・慣習を分解して根本から再構築する」思考法。標準を疑うときの **方法論** として参照 | https://en.wikipedia.org/wiki/First_principle (retrieved_at: 2026-06-23, L2) |
| **PDCA Cycle** (Shewhart / Deming) | Plan-Do-Check-Act の反復による継続改善。**「更新の規律」の最も近い既存概念**。本パッケージの四半期サイクルはこの系統 | https://en.wikipedia.org/wiki/PDCA (retrieved_at: 2026-06-23, L2) |
| **OODA Loop** (John Boyd) | Observe-Orient-Decide-Act の高速反復による適応。frontier 観測 → 採用判断のサイクルと整合 | https://en.wikipedia.org/wiki/OODA_loop (retrieved_at: 2026-06-23, L2) |
| **Antifragility** (Nassim Taleb) | 衝撃で強くなる性質。標準陳腐化を「燃料」として吸収する発想 | https://en.wikipedia.org/wiki/Antifragility (retrieved_at: 2026-06-23, L2) |
| **Kaizen (改善)** | 小さな改善の継続的積み重ね。漸進更新の文化的基盤 | https://en.wikipedia.org/wiki/Continuous_improvement_process (retrieved_at: 2026-06-23, L2) |
| **Critical Thinking** (Paul-Elder framework 等) | 個別主張の吟味スキル。**部分的に重なるが同義ではない** (CT は時間軸の主張をカバーしない) | 参考のみ、本原則とは別系統 |

便宜的に「クリシン (critical thinking) 系」「更新の規律」と呼ぶ場合があるが、厳密には:

- 「業界標準が陳腐化する」主張 → Innovator's Dilemma
- 「標準を疑い再構築する」方法論 → First Principles
- 「観測→更新を反復する」運用 → PDCA / OODA
- 「陳腐化を吸収する」設計姿勢 → Antifragile

の系譜の合流点に位置付ける。単一理論ではない。

---

## 3. 「標準」と「リーダー」の定義

| 区分 | 定義 | 本パッケージでの扱い |
|---|---|---|
| 業界標準 | 多数の組織で広く運用されている手法 | 採用するが「陳腐化候補」として retrieved_at を必須化 |
| リーダー側の尖った試み | 公式 ML 研究機関 / 学術 / 一次情報での先行実験 | 四半期で追跡、半歩先取り候補として評価 |
| モデル知識単独 (L3) | 出典なしの慣行 | 不採用 (`25_writing-style/03_citation-style.md`) |

リーダー側の主な観測対象 (本パッケージ内):

- Anthropic 公式 docs / Engineering Blog
- OpenAI 公式 docs (Agents SDK 等)
- arXiv の agent / self-improvement 関連最新論文
- 公開ベンチマーク (SWE-bench / Polyglot 等) の上位提出物

---

## 4. 運用原則群との整合

| 原則 | 標準懐疑原則との関係 |
|---|---|
| 委任ファースト原則 | 委任先カタログ自体を四半期で更新する |
| センス委譲原則 | センスの基準も陳腐化する。taste カテゴリの定義を半期で見直す |
| ゼロ重複原則 (Runbook) | Runbook の `last_verified` を四半期で再点検 |
| 承認最小原則 | 承認基準も陳腐化候補。escalation policy を年次で見直す |
| コンテキスト最小原則 | context budget の閾値を新モデル世代ごとに再評価 |
| 出典必須原則 | 出典の retrieved_at が古いものは「未検証」へ降格 |
| 反対意見併記原則 | 反対意見の論拠 (リーダー側の対立試み) を四半期で更新 |

標準懐疑原則は運用原則群を **時系列で運用するための上位規律** に位置付く。

---

## 5. 運用 (四半期サイクル)

| Step | 内容 | 連携 |
|---|---|---|
| Q-1 観測 | 公式 docs / arXiv / ベンチマーク上位を grep 観測 | `75_self-evolution/05_industry-radar.md` |
| Q-2 候補抽出 | 「標準と異なる尖り」を 3〜10 件抽出 | `85_frontier/` (新規候補の置き場) |
| Q-3 影響評価 | 本パッケージのどの章 / Runbook が陳腐化するか逆引き | `02_auto-update-loop.md` Stage 3 |
| Q-4 半歩先取り判定 | 採用 / 様子見 / 不採用 を理由付きで判定 | `60_quality-gates/06_red-team-loop.md` で反対意見を併記 |
| Q-5 反映 or archive | 採用は patch として反映、不採用は理由ごと archive | `02_auto-update-loop.md` Stage 5〜7 |

`85_frontier/` は **観測中の試み** を退避する作業領域として位置付ける (本パッケージ既存ディレクトリ)。

---

## 6. 「将来陳腐化することを恐れない」規律

本パッケージは **意図的に陳腐化候補を本文に含める**。回避すると以下が起きる:

- 当たり障りのない記述しか残らず、意思決定の助けにならない
- 「現時点の最良判断」が記録されず、後から学習できない
- リーダー側の試みを取り込む経路が閉じる

代わりに、陳腐化を前提に次の規律を敷く:

- 全 L1 出典に `retrieved_at: YYYY-MM-DD` を必須化 (`25_writing-style/03_citation-style.md`)
- 「## 不確実性」を全ファイル末尾に必須化 (本ファイルも同様)
- 反対意見が成立する論点では「## 反対意見」または red-team 経路で対立軸を残す
- `last_verified` 経過したエントリは `aging` / `stale` / `obsolete` のいずれかへ自動降格 (`75_self-evolution/01_freshness-policy.md`)

---

## 7. アンチパターン

| アンチパターン | 起こること | 対策 |
|---|---|---|
| 「業界標準だから安全」で採用 | 陳腐化と同時に本パッケージも陳腐化 | retrieved_at 必須化、四半期再点検 |
| リーダー側の試みを「実験段階」と切り捨て | 半歩先取りの経路が閉じる | `85_frontier/` で観測継続 |
| 当たり障りない記述で逃げる | 意思決定の助けにならない | §6 の規律を優先 |
| 出典なしの慣行で「みんなやっている」 | L3 単独依拠で再検証不能 | L1 必須 (`25_writing-style/03_citation-style.md`) |
| 採用判定を agent 単独で行う | 反対意見が消える | red-team で対立軸併記 |

---

## 8. 関連章

- 運用原則群本体: [01_seven-habits-mapping.md](./01_seven-habits-mapping.md)
- 出典規範: [../25_writing-style/03_citation-style.md](../25_writing-style/03_citation-style.md)
- 鮮度判定: [../75_self-evolution/01_freshness-policy.md](../75_self-evolution/01_freshness-policy.md)
- 自動更新ループ: [../75_self-evolution/02_auto-update-loop.md](../75_self-evolution/02_auto-update-loop.md)
- 自己改変ループ: [../75_self-evolution/08_self-modification-loop.md](../75_self-evolution/08_self-modification-loop.md)
- フロンティア観測: [../85_frontier/](../85_frontier/)

---

## 出典

- L1: Anthropic 公式 — Claude Code 公式ドキュメント (https://code.claude.com/, retrieved_at: 2026-06-23)
- L1: OpenAI 公式 — Agents SDK ドキュメント (https://openai.github.io/openai-agents-python/, retrieved_at: 2026-06-23)
- L1: arXiv 2505.22954 — Darwin Gödel Machine (https://arxiv.org/abs/2505.22954, retrieved_at: 2026-06-23) — 自己改変エージェントによる開かれた更新規律の参考
- L2: 本パッケージ METHOD.md §3 (原則) / §10 自己更新ループ (retrieved 2026-06-23)
- L2: 本パッケージ `25_writing-style/03_citation-style.md`, `75_self-evolution/01_freshness-policy.md`, `85_frontier/`

## 不確実性

- 「四半期サイクル」の周期は ECC 初期値。案件のドメインによっては月次・半期に再校正余地あり (未検証)。
- §3 「リーダー」の指定対象は本日 (2026-06-23) 時点の主要観測点。観測対象が陳腐化したら本章自身が改訂対象になる。
- §6 「陳腐化を恐れない」規律と「最終応答の中立性」の両立は文体規範 (`25_writing-style/`) との同時運用が前提。本章単独では中立性を保証しない。
- リーダー側の試みのうち、商用環境での長期運用ベストプラクティスが未確立のものは多い。半歩先取りは常に **revert 経路を併設** して採用すること (`75_self-evolution/08_self-modification-loop.md` §8 と整合)。
