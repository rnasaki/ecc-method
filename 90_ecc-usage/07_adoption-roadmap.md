# 07 — Adoption Roadmap (0→1 導入ロードマップ)

ECC + 本パッケージを段階的に導入するための時系列計画。week 1 / week 2-4 / month 2+ の 3 段階で「機能の解放」と「規律の追加」を進める。

## 0. 導入前準備 (day 0)

- [ ] Claude Code が動く環境を確保
- [ ] 既存リポを 1 件選び、PoC 対象とする
- [ ] 案件メンバーに原則 (`05_principles/`) を共有
- [ ] 禁止語リスト (`25_writing-style/02_banned-phrases.md`) を読む

## 1. Week 1 — 最小ループの確立

**目標**: SDD → TDD ハイブリッドを 1 機能だけ完走する。

| 日 | 作業 | 章 |
|---|---|---|
| D1 | bootstrap.sh で骨格作成 | `80_commands/` |
| D2 | Discovery の P-004 実施 | `10_discovery/` |
| D3 | PRD / requirements ドラフト | `30_sdd-phase/`, `70_templates/` |
| D4 | design / tasks 起こし | `30_sdd-phase/` |
| D5 | TDD ループ 1 機能完走 | `35_tdd-phase/` |

**この段階での解放機能** (絞る):

- planner / architect / code-reviewer / tdd-guide のみ
- skill: codebase-onboarding 1 つ
- MCP: docs-lookup 1 つ
- Hub: Workflow のみ (Council / GAN-Harness は未解放)

**判定**: 1 機能を AC ↔ test 一致まで持っていけたら次段階。

## 2. Week 2-4 — 並列性と品質ゲート

**目標**: 並列性・対抗性・自動規約 を導入し、Quality Gate を稼働させる。

### Week 2: 並列性

- [ ] Explore × N の並列起動を業務に組み込む (BP-003)
- [ ] Multi-Plan / Council を Pattern P-001 で起動
- [ ] dmux / fleet を一括修正タスクに 1 度試す

### Week 3: 対抗性 (Red-Team)

- [ ] Pattern P-003 を最重要決定で必ず使う
- [ ] agent-evaluator を Generator と別個体で起動
- [ ] refuter を「refute を試みよ」起動

### Week 4: 自動規約 (Hooks)

- [ ] Stop hook で禁止語 grep
- [ ] PostToolUse hook で出典形式チェック
- [ ] PreToolUse hook で危険操作の guard
- [ ] consent economy 表 (`50_permissions/`) を settings に反映

**この段階で追加解放**:

- agent-evaluator / security-reviewer / lang-reviewer
- skill: deep-research / taste / refactor-clean
- MCP: 必要に応じて exa / context7
- Hub: Council / GAN-Harness

**判定**: 健全性 KPI (`06_health-metrics.md`) を初回計測し、obsolescence_rate / banned_phrase_hit / link_alive_rate を取得。

## 3. Month 2+ — 自己更新と健全性運用

**目標**: 本パッケージ自身を陳腐化させない継続運用に乗せる。

### Month 2

- [ ] 週次チェックリスト (`07_review-cadence.md`) を cron に乗せる
- [ ] 月次 KPI 集計を開始
- [ ] Runbook System (`45_runbook/`) を本格運用
- [ ] sources.yaml を起こし industry radar の準備

### Month 3 (四半期初期)

- [ ] 初回 industry radar (`05_industry-radar.md`) を完走
- [ ] 原則 / Pattern の妥当性を再評価
- [ ] 持ち越し finding を翌期 backlog に
- [ ] 健全性 KPI 閾値を実測値で再校正

### Month 4 以降

- 通常運用: 週次 / 月次 / 四半期サイクル維持
- 案件横断で Layer 2 Registry を整備
- 失敗事例を `65_pitfalls/` に蓄積

## 4. マイルストーン

| マイルストーン | 達成条件 |
|---|---|
| M1: 単機能完走 (week 1) | 1 機能を P-001 → P-002 で出荷 |
| M2: 並列・対抗導入 (week 4) | P-001 / P-003 が日常運用 |
| M3: 自動規約稼働 (week 4) | hooks による禁止語 / 出典自動チェック |
| M4: KPI 取得 (month 2) | 健全性 KPI の初回スナップショット |
| M5: radar 完走 (month 3) | 四半期レポート 1 期分公開 |
| M6: 自己更新ループ稼働 (month 4) | 検知 → 反映が自走 |

## 5. アンチパターン (このロードマップで避ける)

- Day 1 から全機能解放 (規律が追いつかず A-01〜A-14 が頻発する)
- Week 4 までに hooks を入れない (規約が手動に逆戻り)
- Month 2 で KPI を取らない (改善余地が見えない)
- Month 3 の radar を skip (ECC 仕様変更を取り込めない)

## 6. 撤退判断

導入を進めても効果が出ない場合の撤退条件 (`02_when-to-use-ecc.md` §6 と整合):

- 健全性 KPI が 3 期連続で目標下回り
- ユーザーケアのエスカレーションが頻発
- コストが投資対効果と見合わない

撤退時は学んだ Runbook と Registry を残す。

## 7. ロードマップの再校正

- 毎四半期、本章の week / month 配置を実測値で見直す
- 案件特性 (規模 / 言語 / 規制) によって順序を入れ替える余地あり
- 大幅変更時は Pattern P-003 (Red-Team) を経由

## 出典

- 本パッケージ METHOD.md §2 ループ全体図 (retrieved 2026-06-23)
- 本パッケージ 75_self-evolution/06_health-metrics.md (retrieved 2026-06-23)
- 本パッケージ 75_self-evolution/07_review-cadence.md (retrieved 2026-06-23)
- 本パッケージ 90_ecc-usage/05_anti-patterns.md (retrieved 2026-06-23)

## 不確実性

- week / month の境界は導入チームの規模・経験で前後する。本章は中規模チームを想定した目安。
- 撤退判断は定量化が難しいため、健全性 KPI の最低 3 期実測を経てから運用に乗せる。
