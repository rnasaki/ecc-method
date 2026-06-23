---
id: RB-002-phased-rollout-plan-index-graph
title: 段階導入予定 - インデックス frontmatter / Concept Graph / 検索プロトコル更新
category: bootstrap
tags: [phased-rollout, index, concept-graph, keywords, search-protocol, deferred]
created: 2026-06-24
updated: 2026-06-24
last-verified: 2026-06-24
status: active
trigger: ecc-method の探索コストを下げるためのインデックス導線整備、Concept Graph 化、検索プロトコル更新を段階導入する計画。Phase 1-3 (avoidance-patterns 概念化) 完了後の次ステップ。
expert-routing: [orchestrator, architect]
related: [RB-001-agent-registry-hot-reload]
source: 本パッケージ実機運用 (2026-06-24, ユーザー指示「インデックス・CodeGraph で探索コスト削減」)
---

# 段階導入予定 - インデックス frontmatter / Concept Graph / 検索プロトコル更新

## TL;DR (30 秒で読める結論)

ecc-method の探索コスト削減のため、Phase 4-7 を段階導入する。Phase 1-3 (avoidance-patterns 概念化、commit `3154624`) は完了済み。Phase 4-7 は影響範囲が大きいため、Phase 4 → 5 → 6 → 7 の順で **1 フェーズずつ運用結果を見て進める**。

## 前提

- Phase 1-3 完了済 (`3154624 refactor(ecc-method): 個別語の永久禁止リストを廃止...`)
- 全 md ファイル数: 130 前後
- 既存の探索手段: 全文 grep (高コスト)
- 目的: AI コーディング時の探索コストを下げる (第 5 原則「コンテキスト最小」)

## Phase 4: 全 md に `keywords:` frontmatter 追加

### 内容
全 md ファイルの先頭に YAML frontmatter を追加:
```yaml
---
keywords: [<topic1>, <topic2>, <category>]
related: [<相対パス1>, <相対パス2>]
---
```

### 影響範囲
- 130 ファイル全件編集
- 既存出典・本文は維持
- frontmatter 未対応の Renderer で見出しが崩れる可能性

### 着手判断
- Phase 1-3 運用後、1〜2 ヶ月の使用実績を見てから
- 探索コストの実測 (grep 回数 / 実時間) を取ってから判断
- ユーザー指示があれば即時着手可

## Phase 5: `_index/concept-graph.json` 作成

### 内容
`ecc-method/_index/concept-graph.json` に概念グラフ:
```json
{
  "nodes": [
    {"id": "delegation", "type": "concept", "files": ["40_delegation/01_expert-registry.md", ...]},
    {"id": "tdd", "type": "concept", "files": ["35_tdd-phase/...", ...]}
  ],
  "edges": [
    {"from": "delegation", "to": "tdd", "rel": "feeds"}
  ]
}
```

### 影響範囲
- 新規 1 ファイル (`_index/concept-graph.json`)
- Phase 4 の keywords frontmatter から自動生成可能
- AI が grep ではなくグラフ走査で探索

### 着手判断
- Phase 4 完了後
- 自動生成スクリプト (`80_commands/generate-concept-graph.sh`) も同時整備

## Phase 6: `45_runbook/_index/` 二段構造化

### 内容
- 現状: `45_runbook/INDEX.md` が単一索引
- 二段化: `_index/by-category.md` `_index/by-tag.md` `_index/by-trigger.md`
- 検索: tag → trigger → 個別 Runbook の順で絞り込み

### 影響範囲
- `45_runbook/INDEX.md` を分割
- 既存参照の更新

### 着手判断
- Phase 5 完了後
- Runbook が 10 件以上溜まってから (現在 RB-001, RB-002 のみ、二段化は早すぎる)

## Phase 7: Orchestrator system prompt の検索プロトコル更新

### 内容
- 現状: Step 1-6 で全文 Read 中心
- 更新後: keywords / concept-graph / index を辿る順序に書き換え
- grep 廃止、grep は LLM judge fallback のみ

### 影響範囲
- `40_delegation/04_orchestrator-system-prompt.md`
- `~/.claude/agents/ecc-orchestrator.md` (実体ファイル)
- 動作テスト必須

### 着手判断
- Phase 4, 5, 6 全完了後
- 実機スモークテストで動作確認

## 段階導入の理由 (一気に進めない根拠)

| Phase | リスク | 不可逆性 |
|---|---|---|
| 4 | 130 ファイル一括編集の merge conflict / typo | 中 (revert 可能だが手間) |
| 5 | concept-graph 設計が後で変わると Phase 4 を全件直しに | 高 |
| 6 | Runbook 数が少ない段階で二段化すると過剰設計 | 低 (段階数を戻すのは簡単) |
| 7 | 検索プロトコル変更で既存 agent 起動が壊れる可能性 | 高 |

**Phase 1-3 の運用結果を見ずに Phase 4-7 に進むと、設計の手戻りで全 130 ファイルを再編集することになる**。これを避けるため段階導入。

## トリガ

各 Phase の着手トリガ:

| Phase | 着手トリガ |
|---|---|
| 4 | (a) ユーザー明示指示、または (b) 探索コスト測定で grep 実時間 > 30 秒/回 が常態化 |
| 5 | Phase 4 完了 + keywords frontmatter が 130 ファイル全件適用済み |
| 6 | Runbook 件数 ≥ 10、かつ Phase 5 完了 |
| 7 | Phase 4, 5, 6 全完了 + 実機テストで動作確認可能な環境 |

## 検証 (各 Phase 完了時)

- [ ] Phase 4 完了: 全 md ファイルの `head -5` で frontmatter 確認、130 件で一致
- [ ] Phase 5 完了: `_index/concept-graph.json` の nodes / edges 件数が keywords 数と整合
- [ ] Phase 6 完了: `45_runbook/_index/by-*.md` で Runbook 件数が `INDEX.md` と一致
- [ ] Phase 7 完了: orchestrator prompt 投入後、新セッションで Pattern P-004 が起動

## 失敗時のリカバリ

| Phase | 症状 | リカバリ |
|---|---|---|
| 4 | frontmatter parse error | `git revert` で該当 commit 戻す |
| 5 | concept-graph 設計ミスで edges が爆発 | 設計をシンプル化、再生成 |
| 6 | Runbook 索引の整合性破綻 | `INDEX.md` 単一構造に戻す |
| 7 | orchestrator agent 起動失敗 | 旧 prompt に戻し、変更点を検証ループに乗せる |

## 関連

- 第 5 原則「コンテキスト最小」(本パッケージ METHOD.md §3)
- ベストプラクティス: BP-007 / BP-008 (本パッケージ `05_principles/_data/best_practices.json`)
- 出典: ユーザー指示「インデックスを辿り、行頭数行を検索」「CodeGraph で AI コーディング探索コスト削減」(2026-06-24 対話)

## 変更履歴

| 日付 | 変更 | 理由 |
|---|---|---|
| 2026-06-24 | 初版 | Phase 1-3 完了後に段階導入計画を永続化 |
