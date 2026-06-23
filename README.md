# ecc-method

ECC を活用した、SDD-orchestrated / TDD-disciplined ハイブリッド開発の汎用 Method パッケージ。

## このパッケージは何か

- ECC を採用する個人・チームが、新規プロジェクト開始から運用までを **エージェント主導** で進めるためのリファレンス。
- Spec-Driven Development (SDD) で意図を固め、Test-Driven Development (TDD) で実装を回す。両者を分離せず、**1 ループ**として運用する手順を定義する。
- マルチエージェント・委任設計・コンテキスト経済・権限委譲・自己更新までを横断的にカバーする。
- 個人・組織固有の情報は含めない。実例が必要な場合は `examples/` に隔離する想定。

## 想定読者

- ECC 上で複数案件を並走させる実務者。
- 新規リポを立ち上げるたびに同じ初期化作業を繰り返している開発者。
- マルチエージェント運用を導入したいが「何をどの順で誰に投げるか」で詰まっているチーム。
- 詳細は [01_overview/02_audience.md](./01_overview/02_audience.md) を参照。

## このパッケージの原則

1. **委任ファースト** — 単独 LLM に詰め込まない。専門家エージェントに投げる。
2. **センスは委ねる** — 命名・UI・コピー等は taste カテゴリに委任する。
3. **ゼロ重複** — 同じ手続きを二度ユーザーに尋ねない。Runbook 化して索引する。
4. **承認最小化** — 事前許可された範囲は確認を取らない。最重要決定のみ確認を求める。
5. **コンテキスト最小** — 知識は参照渡し。委任には出力上限を付ける。
6. **事実は出典で語る** — L1 一次情報を必須付帯。未検証は「未検証」と明記する。
7. **反対意見併記** — 重要決定では、生成と判定を別エージェントに分離し、反論も並置する。
8. **標準を疑う** — 業界標準は陳腐化候補。リーダーの尖りを半歩先取りする。

詳細は [05_principles/](./05_principles/) を参照。

## 推奨読み順

1. [01_overview/](./01_overview/) — 目的・読者・用語
2. [05_principles/](./05_principles/) — 原則と 7 Habits マッピング
3. [METHOD.md](./METHOD.md) — Method 本体（SDD → TDD ハイブリッドループ）
4. [40_delegation/](./40_delegation/) — Expert Registry と委任契約
5. [90_ecc-usage/](./90_ecc-usage/) — ECC 機能の活用レシピ
6. 案件着手時は [10_discovery/](./10_discovery/) → [20_repo-bootstrap/](./20_repo-bootstrap/) を順に適用

## ディレクトリ構成

| パス | 目的 |
|---|---|
| `01_overview/` | パッケージの目的・読者・用語・推奨読み順 |
| `05_principles/` | 原則・7 Habits マッピング・北極星指針・公式ベストプラクティス参照 |
| `10_discovery/` | 未知リポ / 未知ドメインへの自己オンボーディング手順 |
| `15_environment/` | 実行環境セットアップ（CLI / MCP / browser / proxy / 権限） |
| `20_repo-bootstrap/` | 新規リポ初期化のプロファイル別チェックリスト |
| `25_writing-style/` | 文体規範（中立・出典付き・禁止語） |
| `27_user-care/` | 感情検知・一次対応・阻害要因除去の手順 |
| `30_sdd-phase/` | Spec-Driven Development の進め方とゲート |
| `35_tdd-phase/` | Test-Driven Development の進め方と coverage 方針 |
| `40_delegation/` | Expert Registry / Routing / Delegation Contract / Orchestrator Prompt |
| `45_runbook/` | Runbook System（INDEX / capture trigger / search protocol） |
| `50_permissions/` | 権限委譲・承認最小化のプリセットと escalation policy |
| `55_verification/` | SDD ↔ Code 整合と drift 検知 |
| `60_quality-gates/` | ファクトチェック・独立検証・anti-sycophancy・red-team |
| `65_pitfalls/` | 一般的な落とし穴（汎用化済み） |
| `70_templates/` | PRD / requirements / design / tasks / runbook / contract 雛形 |
| `75_self-evolution/` | 鮮度判定・自動更新ループ・industry radar・健全性 KPI |
| `80_commands/` | bootstrap.sh / slash command マッピング |
| `90_ecc-usage/` | ECC 活用コンサル本体（feature map / routing / anti-pattern） |
| `99_distribution/` | 再配布手順 |

## 使い方

### 新規プロジェクトに導入する場合

```bash
# 1) このパッケージをコピー
cp -r ecc-method <your-project>/

# 2) bootstrap スクリプトを実行（プロファイル選択）
bash ecc-method/80_commands/bootstrap.sh --profile=web|cli|data|mobile|research

# 3) Discovery を実施
# 詳細: ecc-method/10_discovery/01_repo-recon.md
```

### Method を更新する場合

`75_self-evolution/02_auto-update-loop.md` の手順に従い、出典更新・新 ECC 機能取り込み・Runbook 整理を実施する。

## ライセンスと再配布

再配布手順は [99_distribution/](./99_distribution/) を参照。個人・組織固有情報は含めないため、社内・社外を問わず複製可能。

## 出典基準

- **L1**: 公式ドキュメント (Anthropic / OpenAI / 公式仕様書) または公開ソースコード。引用必須。
- **L2**: 著者特定の一次情報 (公式 blog / 公式論文)。補助的に許可。
- **L3**: モデル知識単独。**禁止**。

詳細は [25_writing-style/03_citation-style.md](./25_writing-style/03_citation-style.md) を参照。

## 不確実性の開示

このパッケージは 2026-06-23 時点の Anthropic Claude Code 公式ドキュメント、OpenAI Agents SDK、および公開コミュニティ知見を出典に作成された。**ECC エコシステムの更新頻度は速いため、四半期ごとに `75_self-evolution/05_industry-radar.md` の手順で再検証すること。**
