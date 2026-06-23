# ecc-method

Claude Code (ECC) を活用した、汎用 Method パッケージ。SDD-orchestrated / TDD-disciplined ハイブリッド開発を、エージェント主導で進めるための運用規律と Runbook 集。

---

## これは何?

**短い答え**: AI エージェント (Claude Code の `ecc-orchestrator`) に渡すと、案件のゴールから逆算して自律的に開発を進めてくれる **運用ルールブック + 引き継ぎファイル** のセットです。

**もう少し詳しく**:

- **何を解決するか**: 「セッションをまたぐと前の話を忘れる」「タスクが詰め込みすぎになる」「サイコファンシー (媚び) で正しい指摘が消える」「subagent が何をやってるか見えない」「個別語の永久禁止リストで過剰一般化する」など、AI 駆動開発で繰り返し発生する問題を構造的に防ぐ規律集。
- **どう使うか**: 案件リポに `.handover/` ディレクトリを 1 つ置き、`ecc-orchestrator` agent を起動するだけ。ユーザーは「再開」と言うか何も入力しないだけで、agent が前回の続きから自律的に動く。
- **ユーザーの役割**: 物理身体の代行 (認証・不可逆操作の承認) のみ。判断・記憶・優先順位付けは agent が担う ([01_overview/05_user-as-hands.md](./01_overview/05_user-as-hands.md))。

## 何ができるようになるか (具体)

- 新セッション開始時に「再開」と入れるだけで、前回の続きから自動着手
- 案件のゴール (北極星) から逸脱したら agent が自分で気づいて止まる
- セッションが落ちても進捗が `.handover/` に残るので、次セッションが再開ポイントから続行
- 1 セッション 1 タスク原則で詰め込みすぎを防止
- subagent の思考軌跡 / 詰まり / 不採用案を完了時に振り返れる
- 個別語ではなく概念で文体規律を守る (新しい語が出ても自動適用)

---

## 導入手順 (新規メンバー向け、3 ステップ)

### Step 1: Method パッケージを clone

```bash
mkdir -p ~/.claude/methods
git clone https://github.com/rnasaki/ecc-method.git ~/.claude/methods/ecc-method
```

### Step 2: ecc-orchestrator agent を Claude Code に登録

```bash
mkdir -p ~/.claude/agents
cp ~/.claude/methods/ecc-method/.template-agents/ecc-orchestrator.md ~/.claude/agents/
```

**注意 (RB-001)**: Claude Code の agent registry は **セッション起動時のみ読み込み**。新規 agent を登録したら、**Claude Code を再起動**する必要があります ([45_runbook/runbooks/RB-001-agent-registry-hot-reload.md](./45_runbook/runbooks/RB-001-agent-registry-hot-reload.md))。

### Step 3: 案件リポで `.handover/` を初期化

```bash
cd <案件リポ>

# 雛形をコピー
mkdir -p .handover
cp ~/.claude/methods/ecc-method/45_runbook/_handover_template/*.md .handover/

# .handover/GOAL.md を案件内容で書き換える (エディタで開いて編集)
# - 北極星 (1 文)
# - サブゴール
# - 完了の定義
# - スコープ外

# .handover/PENDING.md を案件の宿題で書き換える

# git に登録 (チームで共有)
git add .handover/
git commit -m "feat(.handover): ecc-method 導入 + 案件ゴール定義"
git push
```

### 起動

Claude Code を再起動した後、案件リポの cwd で:

```
Agent(subagent_type="ecc-orchestrator", prompt="再開")
```

または何も入力せずに `ecc-orchestrator` を呼ぶだけ。agent が `.handover/` を Read して自動着手します。

---

## チームへの配布手順 (リーダー向け)

メンバーに使ってもらうには、以下を案件チャット / オンボーディング資料に貼り付けてください:

```
このプロジェクトでは ecc-method を使います。
1. 本 README (https://github.com/rnasaki/ecc-method) を読む
2. 「導入手順 (新規メンバー向け、3 ステップ)」を実行
3. Claude Code を再起動
4. 案件リポで `Agent(subagent_type="ecc-orchestrator", prompt="再開")` を呼ぶ
不明点は本リポの 45_runbook/ または案件リポの .handover/ を参照。
```

---

## ディレクトリ構成

| パス | 目的 |
|---|---|
| `01_overview/` | パッケージの目的・読者・用語・ユーザー役割 |
| `05_principles/` | 原則・7 Habits マッピング・公式ベストプラクティス参照 |
| `10_discovery/` | 未知リポ / 未知ドメインへの自己オンボーディング |
| `15_environment/` | 実行環境セットアップ (CLI / MCP / browser / proxy / 権限) |
| `20_repo-bootstrap/` | 新規リポ初期化のプロファイル別チェックリスト |
| `25_writing-style/` | 文体規範 (中立・出典付き・回避概念) |
| `27_user-care/` | 感情検知・一次対応・阻害要因除去 |
| `30_sdd-phase/` | Spec-Driven Development |
| `35_tdd-phase/` | Test-Driven Development |
| `40_delegation/` | Expert Registry / Routing / Delegation Contract / Orchestrator Prompt |
| `45_runbook/` | Runbook System (INDEX / capture trigger / search protocol) |
| `50_permissions/` | 権限委譲・承認最小化 |
| `55_verification/` | SDD ↔ Code 整合と drift 検知 |
| `60_quality-gates/` | ファクトチェック・独立検証・anti-sycophancy・red-team |
| `65_pitfalls/` | 一般的な落とし穴 |
| `70_templates/` | PRD / requirements / design / tasks / runbook / contract 雛形 |
| `75_self-evolution/` | 鮮度判定・自動更新ループ・industry radar |
| `80_commands/` | bootstrap.sh / slash command |
| `85_frontier/` | 業界半歩先 (月次更新、2025-2026 H1 出典) |
| `90_ecc-usage/` | ECC 機能の活用レシピ |
| `99_distribution/` | 再配布手順 |
| `45_runbook/_handover_template/` | 案件初期化用の雛形 (Step 3 でコピーする元) |

---

## 8 つの原則 (運用判断軸)

詳細は [05_principles/](./05_principles/) を参照。

1. **委任ファースト** — 単独 LLM に詰め込まない。専門家エージェントに投げる。
2. **センスは委ねる** — 命名・UI・コピー等は taste カテゴリに委任する。
3. **ゼロ重複** — 同じ手続きを二度ユーザーに尋ねない。Runbook 化して索引する。
4. **承認最小化** — 事前許可された範囲は確認を取らない。最重要決定のみ確認を求める。
5. **コンテキスト最小** — 知識は参照渡し。委任には出力上限を付ける。
6. **事実は出典で語る** — L1 一次情報を必須付帯。未検証は「未検証」と明記する。
7. **反対意見併記** — 重要決定では、生成と判定を別エージェントに分離し、反論も並置する。
8. **標準を疑う** — 業界標準は陳腐化候補。リーダーの尖りを半歩先取りする。

---

## 詳しく知りたい人向けの読み順

1. [01_overview/](./01_overview/) — 目的・読者・用語・ユーザー役割
2. [METHOD.md](./METHOD.md) — Method 本体 (SDD → TDD ハイブリッドループ)
3. [05_principles/](./05_principles/) — 8 つの原則の詳細
4. [40_delegation/](./40_delegation/) — Expert Registry と委任契約
5. [45_runbook/INDEX.md](./45_runbook/INDEX.md) — Runbook 索引 (RB-001〜007)
6. [90_ecc-usage/](./90_ecc-usage/) — ECC 機能の活用レシピ

---

## ライセンスと再配布

再配布手順は [99_distribution/](./99_distribution/) を参照。個人・組織固有情報は含めないため、社内・社外を問わず複製可能。

## 出典基準

- **L1**: 公式ドキュメント (Anthropic / OpenAI / 公式仕様書) または公開ソースコード。引用必須。
- **L2**: 著者特定の一次情報 (公式 blog / 公式論文)。補助的に許可。
- **L3**: モデル知識単独。**禁止**。

詳細は [25_writing-style/03_citation-style.md](./25_writing-style/03_citation-style.md) を参照。

## 不確実性の開示

このパッケージは 2026-06-24 時点の Anthropic Claude Code 公式ドキュメント、OpenAI Agents SDK、および公開コミュニティ知見を出典に作成された。**ECC エコシステムの更新頻度は速いため、四半期ごとに `75_self-evolution/05_industry-radar.md` の手順で再検証すること。** 主要 URL は [85_frontier/README.md](./85_frontier/README.md) の検証ステータス表を参照。
