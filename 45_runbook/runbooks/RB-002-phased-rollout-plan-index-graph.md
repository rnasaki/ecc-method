---
id: RB-002-phased-rollout-plan-index-graph
title: 段階導入予定 - インデックス frontmatter / Concept Graph / 検索プロトコル更新
category: bootstrap
tags: [phased-rollout, index, concept-graph, keywords, search-protocol, deferred]
created: 2026-06-24
updated: 2026-06-24
last-verified: 2026-06-24
status: completed
phase-status:
  phase-1-3: completed (commit 3154624)
  phase-4: completed (2026-06-24, 80_commands/generate-keywords-frontmatter.mjs)
  phase-5: completed (2026-06-24, 80_commands/generate-concept-graph.mjs, _index/concept-graph.json)
  phase-6: completed (2026-06-24, 80_commands/generate-runbook-indexes.mjs, 45_runbook/_index/by-{category,tag,trigger}.md)
  phase-7: completed (2026-06-24, 45_runbook/04_search-protocol.md と 40_delegation/04_orchestrator-system-prompt.md を CodeGraph 主体に更新)
trigger: ecc-method の探索コストを下げるためのインデックス導線整備、Concept Graph 化、検索プロトコル更新を段階導入する計画。Phase 1-3 (avoidance-patterns 概念化) 完了後の次ステップ。
expert-routing: [orchestrator, architect]
related: [RB-001-agent-registry-hot-reload]
source: 本パッケージ実機運用 (2026-06-24, ユーザー指示「インデックス・CodeGraph で探索コスト削減」)
keywords: [runbook, runbooks, phased, rollout, plan, graph]
---

# 段階導入予定 - インデックス frontmatter / Concept Graph / 検索プロトコル更新

## TL;DR (30 秒で読める結論)

ecc-method の探索コスト削減のため、Phase 4-7 を段階導入。**全 Phase (1-7) を 2026-06-24 に完了**。Phase 4-5 で CodeGraph 本体を生成、Phase 6 で Runbook 二段索引化 (件数 ≥ 10 達成)、Phase 7 で orchestrator / search-protocol を CodeGraph 主体に更新した。Runbook 自体は履歴・運用手順として保持 (status: completed)。

## 前提

- Phase 1-3 完了済 (`3154624 refactor(ecc-method): 個別語の永久禁止リストを廃止...`)
- 全 md ファイル数: 130 前後
- 既存の探索手段: 全文 grep (高コスト)
- 目的: AI コーディング時の探索コストを下げる (第 5 原則「コンテキスト最小」)

## Phase 4: 全 md に `keywords:` frontmatter 追加 ✅ 完了 (2026-06-24)

**実装**: `80_commands/generate-keywords-frontmatter.mjs`
**結果**: 155 ファイル (新規追加 136, 既存 frontmatter に keywords/related 追記 17, 既に完備 2)
**実行**: `node 80_commands/generate-keywords-frontmatter.mjs [--dry-run]`

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

## Phase 5: `_index/concept-graph.json` 作成 ✅ 完了 (2026-06-24)

**実装**: `80_commands/generate-concept-graph.mjs`
**生成物**: `_index/concept-graph.json` (nodes 279, edges 20 (weight ≥ 2), file_index 155)
**仕様**: `_index/README.md`
**実行**: `node 80_commands/generate-concept-graph.mjs`

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

## Phase 6: `45_runbook/_index/` 二段構造化 ✅ 完了 (2026-06-24)

**実装**: `80_commands/generate-runbook-indexes.mjs`
**生成物**: `45_runbook/_index/by-category.md` `by-tag.md` `by-trigger.md` (`INDEX.md` の YAML 索引から自動生成)
**実行**: `node 80_commands/generate-runbook-indexes.mjs`
**着手条件達成**: Runbook 件数 11 (RB-001〜RB-011)

## Phase 7: Orchestrator system prompt の検索プロトコル更新 ✅ 完了 (2026-06-24)

**更新ファイル**:
- `40_delegation/04_orchestrator-system-prompt.md` — Step 0 として `_index/concept-graph.json` 検索を追加。Step 1 で Runbook 索引 (`INDEX.md` + `_index/by-*.md`) を引く。grep は最終手段に格下げ。Step 6 完了時に CodeGraph 再生成を必須化。
- `45_runbook/04_search-protocol.md` — 決定木を Step 0 (CodeGraph) → Step 1 (Runbook 索引) → Step 2 (本文 grep fallback) → Step 3 (Registry 委任) に再構成。
**残作業**: 実機スモークテストでの動作確認 (本セッション以降の運用で検証)。

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
| 2026-06-24 | Phase 4-5 完了反映 | `generate-keywords-frontmatter.mjs` で 155 md に keywords/related 注入、`generate-concept-graph.mjs` で `_index/concept-graph.json` 生成 |
| 2026-06-24 | A-E 標準化反映 | `_index/` を生成 PJ 骨格に追加 (directory-skeleton / checklist / bootstrap.sh / 70_templates/README.md / SDD-TDD 章の再生成規律) |
| 2026-06-24 | Phase 6-7 完了反映 | Runbook 11 件で着手条件達成。`generate-runbook-indexes.mjs` で `45_runbook/_index/by-{category,tag,trigger}.md` 生成。`04_search-protocol.md` と `04_orchestrator-system-prompt.md` の検索プロトコルを CodeGraph 主体 (Step 0) に再構成。RB-002 全 Phase 完了で status: completed |
