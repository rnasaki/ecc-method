---
keywords: [index, concept-graph, search-protocol]
related: [../45_runbook/runbooks/RB-002-phased-rollout-plan-index-graph.md, ../05_principles/06_context-economy.md, ../80_commands/generate-keywords-frontmatter.mjs, ../80_commands/generate-concept-graph.mjs]
---

# `_index/` — 探索コスト削減用インデックス

ecc-method の探索コスト削減 (第 5 原則「コンテキスト最小」) のために生成される派生成果物を置く。手で編集しない。

## ファイル

| ファイル | 説明 | 生成元 |
|---|---|---|
| `concept-graph.json` | keyword nodes と共起 edges による概念グラフ + 全 md ファイルの index | `80_commands/generate-concept-graph.mjs` |

## スキーマ (`concept-graph.json`)

```jsonc
{
  "schema_version": "1.0",
  "generated_at": "YYYY-MM-DD",
  "generator": "80_commands/generate-concept-graph.mjs",
  "stats": {
    "total_files": 155,
    "files_with_frontmatter": 155,
    "files_with_keywords": 155,
    "node_count": <int>,
    "edge_count": <int>,
    "edge_min_weight": 2
  },
  "nodes": [
    { "id": "<keyword>", "type": "concept", "file_count": <int>, "files": [<rel-path>, ...] }
  ],
  "edges": [
    { "from": "<keyword-a>", "to": "<keyword-b>", "rel": "cooccurs", "weight": <int> }
  ],
  "file_index": [
    { "path": "<rel-path>", "keywords": [...], "related": [...] }
  ]
}
```

- `weight` は同じファイル内で 2 つの keyword が共起したファイル数。`edge_min_weight = 2` 未満は除外。
- `file_index` は frontmatter から抽出した全 md の keywords / related。grep の代わりに走査用。

## 再生成手順

frontmatter または md ファイル構成を変えたら **必ず** 再生成する。

```bash
# 1. 未 frontmatter の md に keywords/related を注入 (既存 frontmatter は壊さない)
node 80_commands/generate-keywords-frontmatter.mjs

# 2. 全 md の frontmatter から concept-graph.json を再構築
node 80_commands/generate-concept-graph.mjs
```

dry-run で差分を確認したい場合:

```bash
node 80_commands/generate-keywords-frontmatter.mjs --dry-run
```

## 検索プロトコルでの使い方

AI / orchestrator は次の順で探索する (第 5 原則「コンテキスト最小」):

1. `_index/concept-graph.json` の `file_index` を読み、keywords にマッチするファイルを抽出
2. 候補の `related` で 1-hop 拡張
3. 該当ファイルの先頭 (frontmatter + TL;DR) のみ Read
4. それでも不足なら個別 grep にフォールバック

このプロトコルの完全運用化は RB-002 Phase 7 (orchestrator system prompt 更新) で実施予定。

## 出典

- [RB-002 phased-rollout-plan-index-graph](../45_runbook/runbooks/RB-002-phased-rollout-plan-index-graph.md) Phase 4 / Phase 5
- ユーザー指示「インデックス・CodeGraph で AI コーディング探索コスト削減」(2026-06-24 対話)
