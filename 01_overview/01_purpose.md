# 01 — Purpose (このパッケージの目的)

ecc-method は、ECC (Everything Claude Code) を採用した個人・チームが、**新規プロジェクト着手から運用・自己更新まで** を一貫したマルチエージェント方式で進めるためのリファレンスである。

## 1. 解決したい問題

実務で繰り返し発生する以下の摩擦を、Method として解消対象に取る。

| # | 問題 | 帰結 | 本パッケージでの対処 |
|---|---|---|---|
| 1 | 初期化の毎回車輪再発明 | 案件着手のたびに同じ環境構築 / 規約整備を繰り返す | [20_repo-bootstrap/](../20_repo-bootstrap/), [80_commands/](../80_commands/) |
| 2 | 単一 LLM への過積載 | 1 エージェントに全部詰め込み、文脈崩壊・推論劣化を起こす | [05_principles/05_delegation-first.md](../05_principles/05_delegation-first.md) |
| 3 | 委任先・並列性が選定できない | 何をどの順で誰に投げるか判断不能 | [40_delegation/](../40_delegation/) |
| 4 | SDD と TDD の分断 | 仕様と実装が乖離 (drift)、後工程で破綻 | [METHOD.md](../METHOD.md), [55_verification/](../55_verification/) |
| 5 | 同じ手順を二度説明される | ユーザーが同じ補足を繰り返し求められる | [45_runbook/](../45_runbook/) |
| 6 | 承認疲れ | 些末確認の頻出で速度が落ちる | [50_permissions/](../50_permissions/) |
| 7 | 出典なき主張 | LLM が知識単独で答え、誤情報を混入させる | [60_quality-gates/01_fact-check-protocol.md](../60_quality-gates/01_fact-check-protocol.md) |
| 8 | Method の陳腐化 | 公式仕様 / Agents SDK の更新を取り込めない | [75_self-evolution/](../75_self-evolution/) |

## 2. このパッケージが提供する価値

### 2.1 反復可能な開始点

`80_commands/bootstrap.sh` を流せば、プロファイル (web / cli / data / mobile / research) ごとに必要な骨組み・規約・Runbook 雛形が揃う。

### 2.2 委任ファーストの設計図

Expert Registry ([40_delegation/01_expert-registry.md](../40_delegation/01_expert-registry.md)) と Routing Rubric ([40_delegation/02_routing-rubric.md](../40_delegation/02_routing-rubric.md)) によって、タスク → 専門家 → モデル の 3 段マッピングを規定する。

### 2.3 SDD → TDD ハイブリッドループ

[METHOD.md](../METHOD.md) は PRD → requirements → design → tasks → Red-Green-Refactor → Verify を **1 機能 1 ループ** で運用する手順を定義する。

### 2.4 ゼロ重複運用基盤

新しい手続きは即 Runbook 化し、`45_runbook/INDEX.md` から検索可能にする。これにより同じ説明を二度ユーザーから求めない。

### 2.5 自己更新ループ

[75_self-evolution/](../75_self-evolution/) によって `last_verified` を監視し、四半期ベンチで Method 自体を継続的に研ぎ続ける。

## 3. 非ゴール (やらないこと)

- **個別ドメインの業務知識は含めない**。例えば「会計領域のドメインルール」は導入先の Layer 2 (案件カスタム) で持つ。
- **特定組織の運用規程は含めない**。社内固有のセキュリティ・ガバナンス規程は別ファイルで管理する。
- **特定プロダクト名・人名は含めない**。再配布可能性を保つためにすべて中立化する。
- **常時稼働インフラの提供はしない**。自動更新ループの「仕組み」までを定義し、実体 (cron / hook / CI) はデプロイ環境側で用意する。

## 4. 期待される運用形態

```text
1. パッケージを {{repo_root}} 配下にコピー
   $ cp -r ecc-method {{repo_root}}/

2. Bootstrap でプロファイル適用
   $ bash {{repo_root}}/ecc-method/80_commands/bootstrap.sh --profile=web

3. Discovery で現状把握
   → 10_discovery/ の Pattern P-004 を実行

4. SDD → TDD ループで機能を 1 機能ずつ進める
   → METHOD.md 第 4 章

5. 完了時に Runbook 化判定
   → 45_runbook/03_capture-trigger.md
```

## 5. 原則との対応

| 原則 | 本ファイルでの根拠 |
|---|---|
| 委任ファースト原則 | §2.2 委任ファーストの設計図 |
| センス委譲原則 | Layer 2 でドメインカスタム / taste カテゴリ参照 |
| ゼロ重複原則 | §2.4 / §1.5 |
| 承認最小原則 | §1.6 / [50_permissions/](../50_permissions/) |
| コンテキスト最小原則 | §1.2 / [05_principles/06_context-economy.md](../05_principles/06_context-economy.md) |
| 出典必須原則 | §1.7 / §6 (本ファイルの出典) |
| 反対意見併記原則 | §2.2 (Routing で生成 ≠ 判定 ≠ 反論を分離) |

## 出典

- Anthropic Claude Code 公式 docs: https://code.claude.com/docs/en/best-practices (retrieved_at: 2026-06-23)
- Anthropic Engineering, Built multi-agent research system: https://www.anthropic.com/engineering/built-multi-agent-research-system (retrieved_at: 2026-06-23)
- OpenAI Agents SDK: https://openai.github.io/openai-agents-python/ (retrieved_at: 2026-06-23)
- 本パッケージ内 SSOT: [README.md](../README.md), [METHOD.md](../METHOD.md)

## 不確実性

- 「想定読者」「推奨読み順」「用語」の詳細はそれぞれ別ファイル ([02_audience.md](./02_audience.md), [03_how-to-read.md](./03_how-to-read.md), [04_glossary.md](./04_glossary.md)) に分離している。本ファイルは目的の宣言にとどめる。
- ECC エコシステムは更新頻度が速いため、本ファイルの内容は四半期再検証が前提 (詳細: [75_self-evolution/01_freshness-policy.md](../75_self-evolution/01_freshness-policy.md))。
