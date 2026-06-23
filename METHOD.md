# METHOD — SDD-orchestrated, TDD-disciplined Hybrid with ECC

このパッケージの Single Source of Truth (SSOT)。SDD-orchestrated, TDD-disciplined (SDD が骨格を組み、TDD が実装を規律する) の 1 ループに統合し、ECC のマルチエージェント基盤で運用するための方法論を定義する。

---

## 1. Method の目的

> **SDD-orchestrated, TDD-disciplined**: SDD (PRD → requirements → design → tasks) が **骨格** を組み、TDD (Red → Green → Refactor) が **実装を規律** する。両者は分離せず、1 ループで往復する。

- **意図** (SDD) と **検証** (TDD) を分離せず、1 ループで回す。
- ECC の専門家エージェントに委任することで、単一 LLM の限界を超える。
- 反復可能・再配布可能・自己更新可能なプロセスとして定式化する。

## 2. ループ全体図

```
[Discovery] → [SDD: PRD → req → design → tasks] → [TDD: Red → Green → Refactor] → [Verify] → [Demo / Ship]
     ↑                                                                                              │
     └──────────── Drift 検知 / Self-Evolution / Knowledge Capture ────────────────────────────────┘
```

各フェーズの詳細:

| フェーズ | 目的 | 主担当 (専門家 Role) | 章 |
|---|---|---|---|
| Discovery | 未知のリポ・ドメインを把握する | explorer-research | [10_discovery/](./10_discovery/) |
| Bootstrap | 環境とリポ骨格を整える | builder-fixer | [15_environment/](./15_environment/), [20_repo-bootstrap/](./20_repo-bootstrap/) |
| SDD | PRD → requirements → design → tasks を順に固める | planner / architect | [30_sdd-phase/](./30_sdd-phase/) |
| TDD | tasks を Red → Green → Refactor で実装 | tester-tdd / reviewer | [35_tdd-phase/](./35_tdd-phase/) |
| Verify | SDD ↔ Code 整合・受入基準充足を確認 | reviewer / security | [55_verification/](./55_verification/) |
| Quality Gate | fact-check / 独立検証 / red-team を強制 | reviewer / agent-evaluator | [60_quality-gates/](./60_quality-gates/) |
| Demo / Ship | デモシナリオ・リリース成果物を整える | builder-fixer / taste | (各章の末尾) |
| Self-Evolution | 鮮度・新ナレッジ取り込み・健全性管理 | explorer-research | [75_self-evolution/](./75_self-evolution/) |

## 3. 原則 (要約)

| # | 原則 | 章 |
|---|---|---|
| 1 | 委任ファースト | [05_principles/05_delegation-first.md](./05_principles/05_delegation-first.md) |
| 2 | センスは委ねる | [40_delegation/01_expert-registry.md](./40_delegation/01_expert-registry.md) (taste カテゴリ) |
| 3 | ゼロ重複 (Runbook System) | [45_runbook/](./45_runbook/) |
| 4 | 承認最小化 | [50_permissions/](./50_permissions/) |
| 5 | コンテキスト最小 | [05_principles/06_context-economy.md](./05_principles/06_context-economy.md) |
| 6 | 事実は出典で語る | [60_quality-gates/01_fact-check-protocol.md](./60_quality-gates/01_fact-check-protocol.md) |
| 7 | 反対意見併記 | [60_quality-gates/06_red-team-loop.md](./60_quality-gates/06_red-team-loop.md) |
| 8 | 標準を疑う | [05_principles/00_eighth-principle-question-standards.md](./05_principles/00_eighth-principle-question-standards.md) |

## 4. SDD → TDD ハイブリッドの実体

### 4.1 1 機能 1 ループ

```
SDD-orchestrated  →  TDD-disciplined
[骨格を組む]           [実装を規律する]

PRD ─► requirements ─► design ─► tasks
                                   │
                                   ▼
                         ┌── Red (failing test) ──┐
                         │                        │
                      Refactor ◄── Green (pass) ──┘
                         │
                         ▼
                   tasks 更新 / Verify / Quality Gate
                         │
                         └─► drift があれば SDD 側を先に更新 (§4.3)
```

SDD が決めた AC が TDD の Red を駆動し、TDD で得た知見が SDD (design / tasks) を更新する。一方向ではなく、上下で往復するのが本ループの実体。

機能 ID `F<NN>-<kebab>` または相当の識別子を採番し、以下を **1 ループ** として進める:

1. **PRD 派生**: アプリ全体の PRD ([70_templates/PRD.template.md](./70_templates/PRD.template.md)) から該当機能を派生。
2. **requirements**: AC-NN 受入基準を Given/When/Then で記述 ([70_templates/requirements.template.md](./70_templates/requirements.template.md))。
3. **design**: アーキ・データ・API・AI エージェント設計を含む ([70_templates/design.template.md](./70_templates/design.template.md))。
4. **tasks**: design を順序付き実装単位に分解 ([70_templates/tasks.template.md](./70_templates/tasks.template.md))。各タスクが対応する AC を引く。
5. **TDD ループ**: 各タスクを Red → Green → Refactor で実装。tasks のチェックボックスを更新。
6. **Verify**: AC ↔ test カバレッジマトリクスで漏れ検出。
7. **Quality Gate**: fact-check / red-team を通過するまで完了扱いにしない。

### 4.2 ハンドオフの厳格化

- requirements が固まらないうちに design に進まない。
- design が固まらないうちに tasks に進まない。
- tasks が固まらないうちに実装に進まない。
- 各ハンドオフは [40_delegation/03_delegation-contract.md](./40_delegation/03_delegation-contract.md) の契約形式で記録する。

### 4.3 Drift 検知

実装中にスペック変更が必要になった場合、コードより先に該当スペックを更新してから実装を進める。詳細は [55_verification/02_drift-detection.md](./55_verification/02_drift-detection.md)。

## 5. 委任モデル

### 5.1 検索プロトコル

タスクを受け取ったら以下の順で解決する:

```
1. Runbook を引く ([45_runbook/INDEX.md](./45_runbook/INDEX.md))
   → ヒットすればそのまま実行。ユーザーに聞かない。
2. Expert Registry を引く ([40_delegation/01_expert-registry.md](./40_delegation/01_expert-registry.md))
   → タスク → 専門家のマッピング。
3. ECC 機能で並列性・対抗性が要るかを判定 ([90_ecc-usage/04_routing-recipes.md](./90_ecc-usage/04_routing-recipes.md))
4. 委任契約を交わして dispatch
5. 完了時に Capture Trigger を評価 ([45_runbook/03_capture-trigger.md](./45_runbook/03_capture-trigger.md))
   → 該当すれば Runbook 化して INDEX を更新
```

### 5.2 ルーティング判定

タスクの **重要度** と **ドメイン** で専門家を選定:

| 重要度 | 例 | 推奨モデル / 専門家 |
|---|---|---|
| 最重要 | PRD / architecture / security / 最終ジャッジ | Opus 系 (planner / architect / agent-evaluator) |
| 中 | 実装 / レビュー / build-fix | Sonnet または GPT-5.5 系 (lang-reviewer / lang-build-resolver) |
| 軽 | grep / 要約 / ファイル探索 | Haiku 系 (Explore / docs-lookup) |

詳細は [05_principles/07_multi-llm-routing.md](./05_principles/07_multi-llm-routing.md)。

### 5.3 並列起動

独立したタスクは同一メッセージ内で複数の Agent 呼び出しにまとめる。順次起動禁止。

委任形式 (Handoff: 制御を完全移譲 / Manager (as-tool): 親に戻す) の切替判断は [40_delegation/09_a2a-and-handoff-standards.md](./40_delegation/09_a2a-and-handoff-standards.md) を参照。

詳細は [40_delegation/06_handoff-patterns.md](./40_delegation/06_handoff-patterns.md)。

## 6. Quality Gates

全成果物は以下を通過しないと「完了」扱いにしない ([60_quality-gates/07_gate-checklist.md](./60_quality-gates/07_gate-checklist.md)):

- [ ] PATH POLICY 適合 (絶対パス・個人ホーム・組織内パス禁止)
- [ ] 主張に L1 出典あり (fact-check)
- [ ] 独立検証済み (生成 ≠ 判定 ≠ 反論の 3 者)
- [ ] uncertainty が明示されている
- [ ] 反対意見が併記されている (重要決定のみ)
- [ ] secret / PII / 個人情報 / 組織固有名 0 件
- [ ] 禁止語 0 件 ([25_writing-style/02_banned-phrases.md](./25_writing-style/02_banned-phrases.md))
- [ ] context budget 上限内

## 7. Runbook System (ゼロ重複)

新しい手続き・手順は **その場で Runbook 化** し、`45_runbook/INDEX.md` に索引を追加する。これにより:

- 二度目以降は INDEX を grep するだけで再現可能になる。
- ユーザーに同じ説明を二度させない。
- 失敗事例も `pitfall` カテゴリで Runbook 化し、横展開する。

詳細は [45_runbook/01_runbook-spec.md](./45_runbook/01_runbook-spec.md)。

## 8. 承認エコノミー

事前許可された範囲は確認を取らず実行する。承認は最重要決定のみに集約する。

| 行動分類 | 既定動作 |
|---|---|
| 可逆的なローカル操作 (編集・テスト実行・ブランチ作成) | ACT |
| Runbook 化済みの手続き | ACT |
| Read-only な調査 (grep / 取得) | ACT |
| 既存 Registry エントリへの委任 | ACT |
| アーキテクチャ / PRD レベルの方針分岐 | ASK |
| 不可逆な共有資源への作用 (force-push to main / prod deploy / DB drop) | ASK |
| 第三者に見える操作の初回 (PR 作成 / Slack 投稿) | ASK |

詳細は [50_permissions/01_consent-economy.md](./50_permissions/01_consent-economy.md)。

## 9. ユーザーケア (感情検知時の最短ルート)

ユーザーが感情的になった、または同じ訂正を繰り返した場合、進行中タスクを即停止し、阻害要因除去に集中する。

詳細手順は [27_user-care/02_first-response-protocol.md](./27_user-care/02_first-response-protocol.md)。

## 10. 自己更新ループ

このパッケージ自体が陳腐化しないために、`75_self-evolution/` の手順で:

- 全 Runbook / Registry エントリの `last-verified` を監視
- 公式 docs / Agents SDK / コミュニティの新規機能を四半期ベンチで取り込み
- 矛盾検知時は自動修復ドラフトを生成

を継続する。

## 10.5 標準陳腐化への姿勢

標準懐疑原則 (Question the Standards) を運用レベルで担保する規律 (詳細は [05_principles/00_eighth-principle-question-standards.md](./05_principles/00_eighth-principle-question-standards.md))。

- **業界標準は陳腐化候補として扱う**。多数派の手法であっても `retrieved_at` 必須化と四半期再点検を回避しない。
- **リーダー側の尖った試みを四半期で観測する**。観測対象は公式 ML 研究機関 / 学術 / 公開ベンチマーク上位提出物。観測の置き場は [85_frontier/](./85_frontier/)。
- **半歩先取りは revert 経路を併設して採用する**。採用判定は単独 agent ではなく red-team で対立軸を併記する ([60_quality-gates/06_red-team-loop.md](./60_quality-gates/06_red-team-loop.md))。
- **「N 年後に陳腐化することを恐れない」記述規律**。当たり障りない表現で逃げず、現時点の最良判断を残す。代わりに「## 不確実性」を全ファイル末尾に必須化し、後から学習できる形で残す。
- **agent 自身の陳腐化対策**として、agent 定義 / skill / system prompt の自己改変ループを Stage 11 として運用 ([75_self-evolution/08_self-modification-loop.md](./75_self-evolution/08_self-modification-loop.md))。Stage 1〜7 (`02_auto-update-loop.md`) が「外部 → パッケージ」、Stage 11 が「パッケージ → agent 個体」を担う。
- **暴走防止**は `08_self-modification-loop.md` §8 のガード (cost budget / 改変回数上限 / 自動 revert / allowlist) を強制する。原則レベル (METHOD.md §1〜3 / 原則本文 / 出典セクション) は agent 自走改訂の対象外。

## 11. 用語集

| 用語 | 定義 |
|---|---|
| ECC | Everything Claude Code。Claude Code 上で agents / skills / MCP / hooks / commands を統合運用するエコシステム |
| Orchestrator | タスクを専門家エージェントに委任・統合する司令役。本パッケージの中核 |
| Expert Registry | 専門家エージェント・スキル・MCP を Role 別にカタログ化した一覧 |
| Delegation Contract | 委任時の入出力と検収基準を明文化した契約 |
| Runbook | 再現可能・冪等な手順書。1 手続き 1 ファイル |
| Quality Gate | fact-check / 独立検証 / red-team などの自動 / 半自動チェック |

詳細用語集は [01_overview/04_glossary.md](./01_overview/04_glossary.md)。

## 12. 出典

このパッケージは 2026-06-23 時点で以下を主出典とする:

- Anthropic Claude Code 公式ドキュメント (code.claude.com / platform.claude.com)
- Anthropic Engineering Blog (multi-agent research system)
- OpenAI Agents SDK (openai.github.io)
- GitHub spec-kit (github.com/github/spec-kit)
- Martin Fowler TDD (martinfowler.com/bliki/TestDrivenDevelopment.html)
- Trunk-Based Development (trunkbaseddevelopment.com)

各引用は各章の本文に付記する。詳細は [25_writing-style/03_citation-style.md](./25_writing-style/03_citation-style.md)。

## 13. 不確実性の開示

- ECC エコシステムは更新頻度が速い。本パッケージの記述は 2026-06-23 時点の公式情報に基づく。四半期ごとの再検証が前提。
- ECC の自動更新ループ (`75_self-evolution/02_auto-update-loop.md`) は **仕組みの定義** までを本パッケージで提供する。**常時稼働の実体** (cron / hook / CI) はデプロイ環境側で別途構築する。
- 一部の MCP サーバー (context7 / exa / videodb 等) はインストール状況に依存する。`15_environment/04_mcp-server-bootstrap.md` の手順で確認すること。
