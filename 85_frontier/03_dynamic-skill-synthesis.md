# 03. Dynamic Skill Synthesis — skill 動的合成

> 観測日: 2026-06-23
> 主題: agent が必要に応じて skill / tool を動的にロード・合成する潮流。
> 静的 tool registry から、文脈駆動で skill を引き寄せる model context へ。

---

## 1. 現状 (陳腐化候補)

現行 ecc-method を含む多くの agent 実装は、以下の静的構造に依存している。

- **静的 tool registry**: 起動時に全 tool definition を system prompt / tool schema へ列挙
  - tool 数が増えると context を圧迫し、選定精度が低下する
  - 案件横断で同じ tool セットを背負うため、用途特化のチューニングが効きにくい
- **hardcoded skill registry**: 業種別 prompt や few-shot を分岐ロジックで切り替える
  - 新規ドメインを追加するたびに分岐を増やす保守コスト
  - skill 同士の合成 (例: 「与信」+「物流」) が表現できない

**陳腐化見込み**

| 対象 | 時期 | 確度 |
|---|---|---|
| 静的 tool 全列挙 (10 件超) | 2026 H2 までに非推奨化 | 中 |
| hardcoded skill 分岐 | 2026-2027 にかけて段階的退場 | 中 |
| MCP 経由でない外部 tool 直結 | 2026-2027 で標準から外れる可能性 | 低-中 |

確度ラベルは観測時点の主観であり、ベンダー / OSS 動向で前後する。

---

## 2. 先端 (2025-2026 H1)

### 2.1 Anthropic Agent Skills (2025-10-16 公開)

- 出典: https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills
- retrieved_at: 2026-06-23
- 内容:
  - **Skill = ディレクトリ + SKILL.md** という単純な単位
  - SKILL.md は YAML front matter (name, description) + 本文の指示
  - **progressive disclosure (段階的情報開示)** が中核
    1. 起動時: skill metadata (name/description) のみを system prompt へプリロード
    2. 関連と判断: SKILL.md 全文を読み込む
    3. 必要時: 参照ファイル / scripts を選択的に探索
  - 提供面: **Claude.ai / Claude Code / Claude Agent SDK / Claude Developer Platform**
- ecc-method への含意: skill registry を「全部 prompt に詰める」から「metadata index + 本文遅延読込」へ転換できる

### 2.2 Anthropic 関連の周辺発表 (2026 H1)

- 出典: https://www.anthropic.com/news (retrieved_at: 2026-06-23)
- 観測内容:
  - 2026-05-28: Claude Opus 4.8 — agentic task / coding 強化との記述あり
  - 2026-06-03: Services Track / Partner Hub
- **Computer use / Code execution の 2026 詳細仕様**: 上記ニュースインデックスからは個別記事の日付が辿れず **未検証**。Anthropic Skills のページからは Claude Agent SDK 経由で SKILL から script / Code execution を呼ぶ流れが暗示されているが、独立確認は要追跡。

### 2.3 OpenAI Agents SDK の動的 tool 読込

- 出典: https://developers.openai.com/api/docs/guides/agents (retrieved_at: 2026-06-23, 旧 platform.openai.com から 301 移行)
- 観測内容:
  - **Tool search** が Built-in tools の一覧に含まれる — agent が必要な tool を文脈から検索する系
  - **Skills (Record & Replay)** セクションが存在 — 操作系列を記録し再利用する設計
  - **MCP and Connectors** に Secure MCP Tunnel / MCP server 統合
  - dynamic composition の詳細は navigation ページからは取れず、個別 reference に分散している
- https://openai.com/blog は HTTP 403 で **未検証** (retrieved_at: 2026-06-23)

### 2.4 arXiv 2025-2026 H1 の skill synthesis 系

- 出典: https://arxiv.org/list/cs.AI/2025 (retrieved_at: 2026-06-23, 一覧の最初の数十件のみ)
- 直接ヒットは限定的 (一覧 50 件中):
  - arXiv:2501.00539 — MCP-Solver (LM × 制約プログラミング)
  - arXiv:2501.01702 — AgentRefine (refinement tuning による汎化)
- skill 自動合成 / tool 自動生成を主題にした論文は本一覧では薄く、**検索ワード別のクロスリストが必要**。本ファイルでは「2025-2026 に skill synthesis 系の流れは観測されるが、決定打となる single paper は未確定」とする。

### 2.5 観測まとめ

- **skill = 静的に積む** から **skill = 状況に応じて引き寄せる (retrieval over skills)** への流れが、Anthropic / OpenAI 双方で観測される
- 共通点:
  - skill / tool に metadata index を持たせ、本文は遅延読込
  - MCP を共通プロトコルとして、外部 skill / tool を後付け接続
  - Code execution を「動的 skill 実行の安全な逃げ場」として併設

---

## 3. 基礎研究 (歴史文脈)

skill / tool の動的扱いは 2023-2024 の研究で土台ができている。

- **Toolformer (Schick et al., 2023, arXiv:2302.04761)** — LM が API 呼び出しを self-supervise で学ぶ初期作。tool 利用の自己発見の基礎。
- **Gorilla (Patil et al., 2023, arXiv:2305.15334)** — 大量 API ドキュメントから retrieval して tool を選ぶ — 「tool retrieval」概念の代表例。
- **ToolLLM / ToolBench (Qin et al., 2023, arXiv:2307.16789)** — 16k+ real-world API 上での tool use 評価フレーム。
- **Voyager (Wang et al., 2023, arXiv:2305.16291)** — Minecraft 上で skill library を自己生成し蓄積する agent。skill synthesis の象徴。
- **CRAFT (Yuan et al., 2023, arXiv:2309.17428)** — task に応じて専用 toolset を生成する creation 系。

これらが現在の Anthropic Skills / OpenAI Tool search の前提を作った。

---

## 4. 未来

ecc-method 内では `80_advanced/` の skill / tool 章が接続点になる (該当ディレクトリ実在前提で、未作成なら新設)。

- **80_advanced/skills/**: 業種別 SKILL.md 群を並べる
  - `manufacturing/SKILL.md` / `logistics/SKILL.md` / `financial-services/SKILL.md` など
  - 各 SKILL.md は metadata + 本文 + 参照スクリプトという Anthropic 形式に揃える
- **40_orchestrator/**: orchestrator 側に skill index loader を入れ、案件タイプから関連 skill だけを pull する
- **60_data-collection/**: scraping / API 連携を MCP server 化し、tool search 経由で動的選択
- **70_quality-gate/**: skill が動的合成されると静的レビューが効きにくくなるため、実行ログ × HITL Gate の組合せで補う

成熟順序の目安:

1. SKILL.md 形式の採用 (静的書き換えだけで効く)
2. skill metadata index と遅延読込
3. MCP server 化と tool search
4. agent 自身が新規 skill を提案 → 人間レビュー → 採用 (Voyager 系)

---

## 5. 今すぐできる準備

1. **`80_advanced/skills/<業種>/SKILL.md` の雛形を 1 件作る**
   - YAML front matter に `name` / `description` を必須化
   - 本文は 200 行以内 + `references/` に詳細を逃がす (progressive disclosure を真似る)
2. **orchestrator の skill 切り替えを「分岐 if 文」から「skill_id ベースの lookup」に書き換える**
   - 将来 skill metadata index へ差し替えるための前段
   - skill 追加が「分岐コード変更」ではなく「ファイル追加」で済む状態を目指す

これだけで、後で Anthropic Skills 形式 / OpenAI Tool search 形式どちらに寄せるとしても移行コストが小さくなる。

---

## 出典

- https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills — Anthropic Agent Skills, 2025-10-16 公開, retrieved_at: 2026-06-23
- https://www.anthropic.com/news — Anthropic newsroom (Opus 4.8 / Partner Hub 等), retrieved_at: 2026-06-23
- https://developers.openai.com/api/docs/guides/agents — OpenAI Agents SDK docs (Tool search / Skills Record & Replay / MCP), retrieved_at: 2026-06-23
- https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills — Anthropic Skills 個別ニュース, retrieved_at: 2026-06-23, **取得失敗 (HTTP 404)**
- https://openai.com/blog — OpenAI blog index, retrieved_at: 2026-06-23, **取得失敗 (HTTP 403)**
- https://arxiv.org/list/cs.AI/2025 — arXiv cs.AI 2025 一覧 (一部), retrieved_at: 2026-06-23
  - arXiv:2501.00539 MCP-Solver
  - arXiv:2501.01702 AgentRefine
- arXiv:2302.04761 Toolformer (2023)
- arXiv:2305.15334 Gorilla (2023)
- arXiv:2307.16789 ToolLLM / ToolBench (2023)
- arXiv:2305.16291 Voyager (2023)
- arXiv:2309.17428 CRAFT (2023)

2025-2026 出典: 6 件 / 2023-2024 出典: 5 件 = **2025-2026 比率 約 55%** (取得失敗 2 件込み)。失敗 2 件を分母から除くと 6/9 = **約 67%**。

---

## 不確実性

- **取得失敗**:
  - https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills (404) — 元 URL 構造が変わっている可能性。代替で engineering 配下の記事を採用。
  - https://openai.com/blog (403) — bot 検知の可能性。OpenAI Agents SDK の dynamic tool 読込の **発表日付** はここからは確認できなかった。
- **未検証**:
  - Computer use / Code execution の 2026 H1 個別仕様 — Anthropic newsroom インデックスからは個別記事日付に辿れず。
  - OpenAI Agents SDK の Tool search / Skills (Record & Replay) の **正式 GA 日付** — docs ページからは未取得。
- **arXiv 一覧の網羅性**: cs.AI 2025 の最初の 50 件のみ参照しており、skill synthesis を主題とする 2025-2026 H1 論文の全量は未踏査。本ファイルの「決定打 single paper は未確定」は本観測範囲での評価。
- **陳腐化見込みの確度ラベル** は観測時点の主観であり、ベンダー / OSS 動向で前後する。
