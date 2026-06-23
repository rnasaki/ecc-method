# 02. Self-Modifying Agents — agent 自己改変

agent が自身の prompt / tool / policy / コードを書き換え、評価ループを回しながら改善していく方向性。
2025 H1 に Sakana AI の Darwin-Gödel Machine が出てから、研究界では「agent が自分自身を編集する」設計が一気に主流テーマに昇格した。

retrieved_at は全て 2026-06-23。

---

## 1. 現状 (陳腐化候補)

ecc-method 含む現場運用の大半は、まだ以下の静的構造で動いている:

- **静的 system prompt**: orchestrator / planner / fact_check の指示文が手書きで固定。改善は人手の PR でのみ反映。
- **固定 tool セット**: tools/ 配下の関数列挙が起動時に確定。実行ログを見て tool を追加/削除する判断は人間。
- **固定 policy / gate**: HITL Gate の閾値、warning 降格条件、cost cap などが config 直書き。
- **skill / plan も人手更新**: 80_advanced/skills の skill ファイル、plan.md などは人間がレビュー committer。

陳腐化見込み (確度ラベル付き):

| 項目 | 陳腐化見込み | 確度 |
|---|---|---|
| 完全静的 system prompt 運用 | 2027 H1 までに「ベースライン以下」扱いに | 中 |
| tool セットを human-only で更新 | 2027 中に「半自動更新」が標準化 | 中 |
| ループ評価なしの単発 agent 実行 | 2026 H2 中に評価ループ前提に移行 | 高 |
| HITL Gate の閾値手書き | 2027 以降、ログ駆動の自動チューニングが浸透 | 低-中 |

確度はあくまで現時点の判断であり、本パッケージの推測。

---

## 2. 先端 (2025-2026 H1)

### 2.1 Darwin-Gödel Machine (DGM) — Sakana AI / UBC

- arXiv ID: 2505.22954 (v1: 2025-05-29 提出 / v3: 2026-03-12 改訂)
- タイトル: "Darwin Godel Machine: Open-Ended Evolution of Self-Improving Agents"
- 著者: Jenny Zhang, Shengran Hu, Cong Lu, Robert Lange, Jeff Clune
- URL: https://arxiv.org/abs/2505.22954
- Sakana AI 解説ブログ: https://sakana.ai/dgm/ (2025-05-30)
- 概要: agent が自身のコードを反復的に書き換え、coding benchmark で経験的に検証するループ。Darwin 的進化に着想を得て、coding agent の archive を保持して多様な改善経路を探索。SWE-bench で 20.0% → 50.0%、Polyglot で 14.2% → 30.7% を報告。sandbox と人間監督の安全策を併用。
- retrieved_at: 2026-06-23

### 2.2 Continuous Thought Machines (CTM) — Sakana AI

- 公開日: 2025-05-12
- URL: https://sakana.ai/ctm/
- 概要: ニューロンの時間的同期を用いた新アーキテクチャ。「時間で考える」パラダイム。self-modifying そのものではないが、DGM と同じ系統で「agent の内部状態が走行中に再編される」流れの一部。
- arXiv ID: 未検証 (Sakana ブログ列挙からは ID 未取得)
- retrieved_at: 2026-06-23

### 2.3 Transformer² : Self-Adaptive LLMs — Sakana AI

- arXiv ID: 2501.06252 (v1: 2025-01-09 / v3: 2025-01-24)
- タイトル: "Transformer-Squared: Self-adaptive LLMs"
- 著者: Qi Sun, Edoardo Cetin, Yujin Tang
- URL: https://arxiv.org/abs/2501.06252
- 採択: ICLR 2025
- 概要: 二段階推論で、まずタスク同定、次に重み行列の特異成分のみを task-specific expert vector で動的に混合。LoRA より少パラメータで上回ると主張。「重みレベルの自己適応」という意味で self-modifying の最弱定義に該当。
- retrieved_at: 2026-06-23

### 2.4 Anthropic Claude Opus 4.8 — Messages API の system 動的更新

- 発表日: 2026-05-28
- URL: https://www.anthropic.com/news/claude-opus-4-8
- 関連変更:
  - Messages API が messages 配列内に system エントリを受け取れるようになった
  - タスク走行中に permissions / token budgets / environment context を「prompt cache を壊さずに」更新可能
  - Dynamic Workflows: agent が数百の parallel subagent を計画して走らせる構造
- 位置づけ: 「agent が自身の prompt を自律的に書き換える」までは明示されていない。あくまで人間または上位 orchestrator が走行中に指示を差し替えるためのフック。ただし self-modifying loop を実装する側の前提インフラとして大きい。
- retrieved_at: 2026-06-23

### 2.5 Anthropic 系 Constitutional AI 更新

- 2026-06-23 時点で https://www.anthropic.com/news の一覧から「Constitutional AI 系の self-modifying 拡張」を直接確認できる発表は未取得。
- 状況: **未検証**。一覧ページのトップに掲出されている発表は Claude Opus 4.8 / Claude Fable 5 / Claude Mythos 5 / Claude Corps であり、Constitutional AI の改訂発表はそこには露出していなかった。
- retrieved_at: 2026-06-23

### 2.6 OpenAI 系メタ最適化発表

- https://openai.com/blog および https://openai.com/index/introducing-chatgpt-agent/ は 2026-06-23 時点で WebFetch から HTTP 403 が返り取得失敗。
- 状況: **未検証**。OpenAI 側の self-improving / メタ最適化発表については本パッケージで一次確認できていない。
- retrieved_at: 2026-06-23

---

## 3. 基礎研究 (歴史文脈)

self-modifying agent の流行は 2023 の以下三系統の延長線にある。本セクションは記憶に基づく文脈整理であり、本作業中に一次再確認はしていない (未検証扱い)。

- **Voyager (2023)**: Minecraft 環境で LLM agent が skill library を自動増築。skill = 関数を agent 自身が書き、再利用する初期事例。
- **Reflexion (2023)**: 失敗した実行に対し agent が自然言語の self-reflection を生成し、次回 prompt にフィードバックして性能を上げるループ。
- **Self-Refine (2023)**: 単一 LLM 内で生成 → 自己批評 → 改稿を回す枠組み。
- **AutoGPT / BabyAGI (2023)**: tool 呼び出しと自己ループの可視化が一気に大衆化、自己改変議論の発火点。
- **DSPy (2023-2024)**: prompt を「最適化されるプログラム」として扱い、コンパイラが prompt を書き換えるパラダイム。

これらは 2023-2024 の文献であり、現代の Darwin-Gödel Machine 系はこの上に「コード自身の書き換え」と「進化的 archive」を載せた版とみなせる。

---

## 4. 未来

ecc-method 内での落とし所候補:

- **80_advanced/skills**: agent が skill ファイルを生成・更新するループの足場として、現状の skill 構造をまず「機械可読 + 評価指標付き」に整える。Voyager の skill library に近い。
- **30_orchestration / orchestrator**: Reflexion 的 self-reflection を fact_check や plan_review の failure path に追加。warning 降格と相性が良い (既に warning ベースで止めない設計のため、ループ素材になる)。
- **HITL Gate (Plan / FactCheck)**: DGM 風の archive を Gate のログに当てる。「過去 plan の archive から類似ケースを拾い、現 plan を patch する」構造。
- **cost / latency policy**: Transformer² 的な軽量自己適応は、まず policy 層 (どの model を呼ぶか / どこまで深く考えるか) の動的切替に使うのが現実的。
- **85_frontier 自身**: 本ファイル群が陳腐化検知ループの教材になる。frontier ファイル自体を agent に定期再生成させる構成は、self-modifying のミニ実装として手頃。

---

## 5. 今すぐできる準備

1. **評価ハーネスを先に置く**: self-modifying は評価が無いと壊れる方向にしか進まない。SWE-bench / Polyglot 相当の小型ローカル評価 (本パッケージなら fact_check 出力 + 期待値の golden set) を先に固定する。DGM が improvement を「coding benchmark で empirical に検証」している点が肝。
2. **prompt と skill を「機械が編集できる形式」に整える**: 現状の skill / system prompt をフロントマター付き Markdown または JSON に揃え、diff レビューと自動 patch を載せやすくする。Messages API の system 動的更新 (Opus 4.8) を活かすにもこの整形が前提。

---

## 出典

- Darwin-Gödel Machine (Zhang et al.): https://arxiv.org/abs/2505.22954 — retrieved_at: 2026-06-23 (2025 H1)
- Sakana AI DGM 解説: https://sakana.ai/dgm/ (2025-05-30) — retrieved_at: 2026-06-23
- Sakana AI CTM: https://sakana.ai/ctm/ (2025-05-12) — retrieved_at: 2026-06-23
- Transformer² (Sun et al., ICLR 2025): https://arxiv.org/abs/2501.06252 — retrieved_at: 2026-06-23 (2025 H1)
- Sakana AI ブログ一覧: https://sakana.ai/blog — retrieved_at: 2026-06-23
- Anthropic Claude Opus 4.8 発表: https://www.anthropic.com/news/claude-opus-4-8 (2026-05-28) — retrieved_at: 2026-06-23 (2026 H1)
- Anthropic ニュース一覧: https://www.anthropic.com/news — retrieved_at: 2026-06-23

2025-2026 出典: 7 件 (うち 2026 H1: 2 件、2025 H1-H2: 5 件)
2023-2024 出典: 0 件 (3 章は記憶ベース文脈で URL 一次確認なしのため未検証扱い)
2025-2026 比率: 100% (一次確認済み出典のうち)

---

## 不確実性

- **OpenAI 系**: https://openai.com/blog および https://openai.com/index/introducing-chatgpt-agent/ は 2026-06-23 時点で HTTP 403 が返り、WebFetch から内容取得できなかった。OpenAI のメタ最適化発表は **未検証**。
- **Anthropic Constitutional AI 系の更新**: ニュース一覧の表層からは self-modifying 文脈の発表を抽出できず、**未検証**。Opus 4.8 の Messages API 動的 system 更新は確認できたが、これは agent 自律の改変ではなくインフラ。
- **arXiv 検索ページ**: https://arxiv.org/search/?query=self-improving+agent はインターフェース説明のみ返り、論文一覧の中身は未取得。本ファイルに載った arXiv ID は個別に到達できた DGM (2505.22954) と Transformer² (2501.06252) のみ。
- **Sakana CTM の arXiv ID**: ブログ列挙からは取得できず、**未検証**。
- **第 3 章 (2023-2024 基礎研究)**: 本作業中に一次 URL 確認していない記憶ベース整理。Voyager / Reflexion / Self-Refine / DSPy の年代・主張は要再確認。
- **陳腐化見込み時期と確度ラベル**: 本パッケージの推測。
- **Claude Opus 4.8 の発表日 (2026-05-28)** は WebFetch 結果に基づくが、本ファイル作成日 (2026-06-23) 時点での該当ページの記載に依存しており、ページ更新により変動しうる。
