# 01 — Slash Commands → Pattern マッピング

ECC で使う代表的なスラッシュコマンドを、本パッケージの Pattern P-001..P-006 へ紐付ける。コマンド呼び出し時にどの委任編成が起動するかを明示する。

## 1. マッピング全体表

| コマンド | 主目的 | 起動 Pattern | 主担当 Agent | 並列度 |
|---|---|---|---|---|
| `/plan` | SDD 起点 (PRD 派生) | P-001 | planner + architect | 並列 |
| `/tdd` | TDD ループ (Red→Green→Refactor) | P-002 | tdd-guide / tdd-workflow + lang-reviewer | 直列 |
| `/review` | コードレビュー / Quality Gate | P-002 + P-003 | code-reviewer + agent-evaluator | 並列 |
| `/red-team` | 重要決定の対抗評価 | P-003 | planner + agent-evaluator + refuter | 並列 |
| `/discover` | 未知リポ Discovery | P-004 | codebase-onboarding + Explore × N | 並列 |
| `/taste` | 命名 / コピー / UI センス判断 | P-005 | taste / brand-voice + 別 taste 系 | 並列 |
| `/pr` | PR 作成 / 説明文生成 | P-002 + 補助 | doc-updater + code-reviewer | 直列 |
| `/security` | セキュリティ確認 | P-003 (security 特化) | security-reviewer + agent-evaluator | 並列 |

## 2. コマンド別の詳細

### 2.1 `/plan`

- 起動 Pattern: **P-001 (SDD 起点)**
- 入力: 機能名 / 一行要件
- 出力: PRD 派生 → requirements.md ドラフト
- 委任編成 (並列):
  - planner (Opus): 段階分解
  - architect: 構造提案
  - 統合 step: planner 出力に architect 提案を merge
  - cross-verify: agent-evaluator
- 通過条件: AC が Given/When/Then で揃う / 反対意見併記 (重要決定時)

### 2.2 `/tdd`

- 起動 Pattern: **P-002 (TDD ループ)**
- 入力: tasks.md の 1 タスク ID
- 出力: tests/* + 実装 + tasks のチェックボックス更新
- 委任編成 (直列):
  - tdd-guide または tdd-workflow を起動
  - red → green → refactor
  - lang-reviewer (該当言語) でレビュー
- 通過条件: AC ↔ test 一致 / coverage 閾値 (`35_tdd-phase/`)

### 2.3 `/review`

- 起動 Pattern: **P-002 + P-003**
- 入力: 変更差分 (diff) または PR 番号
- 出力: レビュー結果 + 修正提案 + Quality Gate 結果
- 委任編成 (並列):
  - code-reviewer: 一般品質
  - lang-reviewer (該当言語): 言語特化
  - security-reviewer: セキュリティ
  - agent-evaluator: 独立判定
- 通過条件: 60_quality-gates/07_gate-checklist.md の項目すべて

### 2.4 `/red-team`

- 起動 Pattern: **P-003**
- 入力: 重要決定の素案 (アーキ / セキュ / リリース判断)
- 出力: 採用案 + 反対意見 + 採用理由
- 委任編成 (並列):
  - generator: planner または architect
  - judge: agent-evaluator
  - refuter: 別 planner を「refute を試みよ」起動
  - synthesis: orchestrator
- 通過条件: 反対意見が rationale に併記されている

### 2.5 `/discover`

- 起動 Pattern: **P-004**
- 入力: 未知リポ root path
- 出力: `_tmp/discovery_report.json` (structure / dependency / entry-point)
- 委任編成 (並列):
  - codebase-onboarding (skill)
  - Explore × 3 (異なる角度の grep)
- 通過条件: `10_discovery/01_repo-recon.md` の 10 項目踏破

### 2.6 `/taste`

- 起動 Pattern: **P-005**
- 入力: 命名 / コピー / UI 候補
- 出力: 候補リスト + 採用案 + 不採用理由
- 委任編成 (並列):
  - generator: taste または brand-voice
  - judge: 別 taste 系 (self-review 禁止)
- 通過条件: 候補が 3 案以上 / 採用理由が記述されている

### 2.7 `/pr`

- 起動 Pattern: **P-002 + 補助**
- 入力: 現在のブランチ
- 出力: PR タイトル + 本文 + テスト計画
- 委任編成 (直列):
  - doc-updater: 本文ドラフト
  - code-reviewer: 内容妥当性
  - 必要なら lang-reviewer
- 通過条件: 全コミット履歴を反映 / 主張に L1 出典 / 禁止語 0 件

### 2.8 `/security`

- 起動 Pattern: **P-003 (security 特化)**
- 入力: 変更差分または機能 ID
- 出力: 脅威モデル + 修正提案
- 委任編成 (並列):
  - security-reviewer
  - agent-evaluator (Generator と別個体)
- 通過条件: secret / PII / OWASP Top 10 ヒット 0 件

## 3. コマンド合成

複数コマンドを順に呼び出す例:

```
/discover  → P-004
/plan      → P-001 (Discovery 結果を入力)
/tdd       → P-002 (1 タスクずつ)
/review    → P-002 + P-003
/security  → P-003
/pr        → 補助
```

`30_sdd-phase/` および `35_tdd-phase/` の手順と同じ流れ。

## 4. 命名と起動方針

- スラッシュコマンドの実体は ECC のコマンド機構に依存する。本章はマッピングのみを提供する。
- 起動 Pattern は本パッケージの単一ソースとし、コマンド側の実体名は導入先で別名 alias を許容する。
- 1 コマンド = 1 Pattern を原則とし、合成は複数コマンド呼び出しで構成する。

## 5. 失敗例 (避ける)

- `/review` を `/red-team` の代替として使う (Pattern が違う)
- `/discover` を飛ばして `/plan` に直行する (未知リポでの推測禁止)
- `/tdd` を並列起動する (TDD ループは直列が前提)

## 出典

- 本パッケージ 40_delegation/01_expert-registry.md §Layer 1 編成パターン (retrieved 2026-06-23)
- 本パッケージ METHOD.md §5 委任モデル (retrieved 2026-06-23)
- Anthropic Claude Code 公式 docs slash commands (https://code.claude.com/docs/en/, retrieved 2026-06-23)

## 不確実性

- スラッシュコマンドの実体は ECC バージョンに依存し、命名は変動しうる。本章は Pattern と紐付ける役割に留め、実体名は導入先 README で示す。
- `/pr` は Git ホスティングサービス依存の挙動を含む。GitHub 以外のホスティングでは別 alias を用意する想定。
