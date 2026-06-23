# 02 — Audience (想定読者)

ecc-method は、ECC 上で開発を進める実務者・チームを主読者とする。本ファイルでは読者像を 3 軸 (役割 / 経験 / チーム形態) で具体化し、各読者がどの章から読み始めるべきかを示す。

## 1. 想定読者の 3 軸

### 1.1 役割軸

| 役割 | 主な関心 | 入口章 |
|---|---|---|
| 個人開発者 | 1 人で複数案件を回す効率化 | [01_overview/03_how-to-read.md](./03_how-to-read.md) |
| Tech Lead | チームの開発フロー・委任設計 | [40_delegation/](../40_delegation/), [METHOD.md](../METHOD.md) |
| Platform / DevEx | bootstrap / hooks / CI 自動化 | [20_repo-bootstrap/](../20_repo-bootstrap/), [80_commands/](../80_commands/) |
| Security / Compliance | 権限・承認エコノミー・監査 | [50_permissions/](../50_permissions/), [60_quality-gates/](../60_quality-gates/) |
| QA / SET | 検証ループ・drift 検知 | [55_verification/](../55_verification/), [35_tdd-phase/](../35_tdd-phase/) |
| Researcher / Analyst | Discovery と deep research | [10_discovery/](../10_discovery/), [05_principles/06_context-economy.md](../05_principles/06_context-economy.md) |

### 1.2 経験軸

| 経験 | 推定 ECC 経験 | 推奨開始ポイント |
|---|---|---|
| 入門 | ECC 初日〜2 週間 | [README.md](../README.md) → [METHOD.md](../METHOD.md) → [01_overview/04_glossary.md](./04_glossary.md) |
| 中級 | 1 機能を ECC で完結できる | [40_delegation/](../40_delegation/) → [45_runbook/](../45_runbook/) |
| 上級 | マルチエージェント並列で運用済 | [75_self-evolution/](../75_self-evolution/) → [60_quality-gates/](../60_quality-gates/) |

### 1.3 チーム形態軸

| 形態 | 課題 | 対応章 |
|---|---|---|
| ソロ | 確認の負荷を最小化したい | [50_permissions/02_pre-authorized-actions.md](../50_permissions/02_pre-authorized-actions.md) |
| 2〜5 名 | エージェント運用基準を統一したい | [40_delegation/](../40_delegation/), [45_runbook/](../45_runbook/) |
| 6 名以上 | 複数エージェントが mainline に書き込む | [METHOD.md](../METHOD.md) §4.3 (drift 検知), Trunk-Based の運用 |

## 2. 読者ごとの 60 分入門コース

### 2.1 個人開発者 (60 分)

```
1. README.md (5 分)
2. METHOD.md (15 分)
3. 01_overview/04_glossary.md (5 分)
4. 40_delegation/02_routing-rubric.md (15 分)
5. 45_runbook/01_runbook-spec.md (10 分)
6. 80_commands/bootstrap.sh を眺める (10 分)
```

### 2.2 Tech Lead (60 分)

```
1. README.md (5 分)
2. METHOD.md 全体 (20 分)
3. 40_delegation/01_expert-registry.md (15 分)
4. 50_permissions/01_consent-economy.md (10 分)
5. 60_quality-gates/07_gate-checklist.md (10 分)
```

### 2.3 Platform / DevEx (60 分)

```
1. 20_repo-bootstrap/ 全体 (15 分)
2. 80_commands/ (15 分)
3. 15_environment/ (15 分)
4. 75_self-evolution/02_auto-update-loop.md (15 分)
```

## 3. 想定外読者と推奨代替

| 想定外読者 | 推奨代替 |
|---|---|
| ECC を使わない開発者 | 一般的な SDD / TDD 入門書 (本パッケージは ECC 前提) |
| ECC エコシステム自体の貢献者 | Anthropic 公式 docs ([code.claude.com](https://code.claude.com/docs/en/)) を一次資料として使用 |
| ノンエンジニア | 本パッケージはコード生成・検証を含むため対象外 |

## 4. 前提スキル

本パッケージを最大活用するには、最低限以下が必要:

- **CLI 操作**: bash / pwsh いずれかで `git`, `gh`, `python`, `node` などを実行できる
- **Git**: branch / PR / merge の概念
- **TDD の最低知識**: red / green / refactor の語が分かる
- **ECC の基本**: agents / skills / commands / hooks / MCP のいずれかを使ったことがある

不足している場合の補助資料:

| スキル不足 | 推奨ソース |
|---|---|
| ECC 基本 | https://code.claude.com/docs/en/ (retrieved_at: 2026-06-23) |
| Agents SDK | https://openai.github.io/openai-agents-python/ (retrieved_at: 2026-06-23) |
| TDD | Martin Fowler https://martinfowler.com/bliki/TestDrivenDevelopment.html (retrieved_at: 2026-06-23) |
| Trunk-Based | https://trunkbaseddevelopment.com/ (retrieved_at: 2026-06-23) |
| Spec-Driven | GitHub spec-kit https://github.com/github/spec-kit (retrieved_at: 2026-06-23) |

## 5. 読者向け期待値

### 5.1 期待してよいこと

- 着手から運用までを 1 つのリファレンスで参照できる
- 委任先・モデル選定が「なんとなく」でなく Rubric で決まる
- 同じ手順を二度説明する苦痛が減る
- Method 自体が陳腐化しない

### 5.2 期待してはいけないこと

- 個別ドメインの業務知識 ([01_purpose.md](./01_purpose.md) §3 参照)
- 特定組織のセキュリティ規程
- ECC が解決しない問題 (人的合意・予算・組織政治)

## 出典

- Anthropic Claude Code 公式 docs: https://code.claude.com/docs/en/ (retrieved_at: 2026-06-23)
- OpenAI Agents SDK: https://openai.github.io/openai-agents-python/ (retrieved_at: 2026-06-23)
- 本パッケージ内 SSOT: [README.md](../README.md) §「想定読者」

## 不確実性

- 経験軸の「ECC 初日〜2 週間」等の境界は推定。読者の既存スキル次第で前後する (未検証)。
- 60 分入門コースは想定所要時間。実環境では調整が必要。
- チーム形態 6 名以上の運用ノウハウは導入実績次第で更新する余地がある (未検証)。
