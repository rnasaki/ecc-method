# 03 — How to Read (推奨読み順と各章サマリ)

ecc-method は 17 ディレクトリ + ルート 2 ファイルで構成される。本ファイルは、目的別に最短ルートを提示する読み順ガイドである。

## 1. 最短ルート (15 分・概観のみ)

```text
1. README.md         (5 分) — パッケージ全体像と原則
2. METHOD.md         (8 分) — SDD → TDD ハイブリッドループ本体
3. 04_glossary.md    (2 分) — 用語チェック
```

ここまでで「何をするパッケージか」「中核ループ」「使われる用語」が分かる。

## 2. 標準ルート (60 分・運用開始前)

```text
1. 01_overview/01_purpose.md
2. 01_overview/02_audience.md
3. 05_principles/ 全体
4. METHOD.md
5. 40_delegation/01_expert-registry.md
6. 40_delegation/02_routing-rubric.md
7. 45_runbook/01_runbook-spec.md
8. 50_permissions/01_consent-economy.md
9. 60_quality-gates/07_gate-checklist.md
10. 80_commands/ を流し読み
```

## 3. 案件着手ルート (新規プロジェクト導入時)

```text
1. 80_commands/bootstrap.sh --profile=<...>
2. 10_discovery/ を Pattern P-004 で実行
3. 20_repo-bootstrap/ のチェックリスト適用
4. 15_environment/ で CLI / MCP / 権限を整える
5. 30_sdd-phase/ で PRD → requirements → design → tasks
6. 35_tdd-phase/ で Red → Green → Refactor
7. 55_verification/ + 60_quality-gates/ を通過
8. 45_runbook/03_capture-trigger.md で Runbook 化判定
```

## 4. 章サマリ

| パス | 章タイトル | 一言サマリ |
|---|---|---|
| [01_overview/](../01_overview/) | Overview | 目的・読者・読み順・用語 |
| [05_principles/](../05_principles/) | Principles | 原則 / 7 Habits / 北極星 / 公式 BP / 委任 / 経済 / 多 LLM ルーティング |
| [10_discovery/](../10_discovery/) | Discovery | 未知リポ・未知ドメインの自己オンボーディング |
| [15_environment/](../15_environment/) | Environment | CLI / MCP / proxy / 権限・実行環境 |
| [20_repo-bootstrap/](../20_repo-bootstrap/) | Repo Bootstrap | 新規リポ初期化のプロファイル別チェックリスト |
| [25_writing-style/](../25_writing-style/) | Writing Style | 文体規範・出典スタイル・禁止語 |
| [27_user-care/](../27_user-care/) | User Care | 感情検知・一次対応・阻害要因除去 |
| [30_sdd-phase/](../30_sdd-phase/) | SDD Phase | Spec-Driven Development の進め方 |
| [35_tdd-phase/](../35_tdd-phase/) | TDD Phase | Red-Green-Refactor の進め方 |
| [40_delegation/](../40_delegation/) | Delegation | Expert Registry / Routing / Contract / Orchestrator |
| [45_runbook/](../45_runbook/) | Runbook | INDEX / capture / search / maintenance |
| [50_permissions/](../50_permissions/) | Permissions | 承認エコノミー・事前許可・escalation |
| [55_verification/](../55_verification/) | Verification | SDD ↔ Code 整合・drift 検知 |
| [60_quality-gates/](../60_quality-gates/) | Quality Gates | fact-check / 独立検証 / red-team |
| [65_pitfalls/](../65_pitfalls/) | Pitfalls | 一般的な落とし穴 |
| [70_templates/](../70_templates/) | Templates | PRD / requirements / design / tasks / runbook 雛形 |
| [75_self-evolution/](../75_self-evolution/) | Self-Evolution | 鮮度判定・自動更新ループ・industry radar |
| [80_commands/](../80_commands/) | Commands | bootstrap.sh / slash command マッピング |
| [90_ecc-usage/](../90_ecc-usage/) | ECC Usage | feature map / routing / anti-pattern |
| [99_distribution/](../99_distribution/) | Distribution | 再配布手順 |
| [METHOD.md](../METHOD.md) | METHOD (SSOT) | SDD → TDD ハイブリッドループ本体 |
| [README.md](../README.md) | README | エントリポイント |

## 5. 用途別ナビゲーション

### 「迷ったときの索引」として読む

```text
- 委任先が分からない    → 40_delegation/02_routing-rubric.md
- 過去の手順を再利用    → 45_runbook/INDEX.md
- 確認すべきか判断不能  → 50_permissions/01_consent-economy.md
- 出典の付け方         → 25_writing-style/03_citation-style.md
- 禁止語を確認         → 25_writing-style/02_avoidance-patterns.md
- レビューの判定基準    → 60_quality-gates/07_gate-checklist.md
```

### 「運用前のチェック」として読む

```text
- 環境準備   → 15_environment/
- 権限設定   → 50_permissions/02_pre-authorized-actions.md
- 雛形利用   → 70_templates/
- 落とし穴   → 65_pitfalls/
```

### 「保守・更新時」として読む

```text
- 鮮度判定   → 75_self-evolution/01_freshness-policy.md
- 自動更新   → 75_self-evolution/02_auto-update-loop.md
- KPI       → 75_self-evolution/04_health-kpi.md
```

## 6. 読み順アンチパターン

以下の順は推奨しない:

| アンチパターン | 起きること |
|---|---|
| いきなり 90_ecc-usage/ から読む | 用語と原則の前提が抜け、応用が定着しない |
| 70_templates/ をコピーして埋める | テンプレート埋め作業になり SDD 本体が形骸化 |
| METHOD.md だけ読む | 委任 / 出典 / Runbook の運用が抜ける |
| 各原則を「読み物」として消費 | 章間のリンクが活きず再現できない |

## 7. ファイル間リンクの規約

- 章内リンクは相対パス: `[text](./other.md)` または `[text](../section/file.md)`
- 同パッケージ内のリンクは絶対パス禁止
- 外部 URL は出典セクションでまとめて列挙

## 出典

- 本パッケージ内 SSOT: [README.md](../README.md) §「推奨読み順」, [METHOD.md](../METHOD.md)
- Anthropic Claude Code 公式 docs: https://code.claude.com/docs/en/ (retrieved_at: 2026-06-23)

## 不確実性

- 所要時間 (15 分・60 分) は推定。読者の既存知識次第で前後する (未検証)。
- 章サマリは 2026-06-23 時点のディレクトリ構成を反映。新章追加時は本ファイルも更新する必要がある。
