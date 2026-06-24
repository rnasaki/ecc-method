---
keywords: [ecc-usage, ecc, overview]
related: [90_ecc-usage/02_when-to-use-ecc.md, 90_ecc-usage/03_feature-map.md, 90_ecc-usage/04_routing-recipes.md, 90_ecc-usage/05_anti-patterns.md, 90_ecc-usage/06_cost-and-context.md]
---
# 01 — ECC Overview (ECC とは何か)

ECC (Everything Claude Code) は、Claude Code を中核に、専門家エージェント・スキル・MCP サーバ・hooks・slash commands・memory を統合運用するエコシステム。本パッケージはこの ECC の上で SDD → TDD ハイブリッドを回すための運用論を提供する。

## 1. ECC を構成する 6 要素

| 要素 | 役割 |
|---|---|
| Claude Code (CLI / IDE) | 開発者と Orchestrator の対話入口。ファイル操作・実行・委任の起点 |
| Sub-agents | タスク特化型の Agent。独立した context window と限定ツールで動く |
| Skills | 再利用可能な手順・ナレッジパック。slash 起動 or 自動トリガで呼ぶ |
| MCP servers | 外部リソース (docs / DB / browser など) をツール化して Agent に渡す |
| Hooks | PreToolUse / PostToolUse / Stop で副作用 (整形・検査・通知) を挟む |
| Memory / settings | 横断記憶・設定・権限プリセット |

## 2. ECC が解く問題

| 課題 | ECC の解 |
|---|---|
| 単一 LLM の context 限界 | sub-agent ごとに独立 context |
| プロンプト肥大 | skill / memory による参照渡し |
| 外部資源アクセス | MCP の標準化 |
| 副作用の安全担保 | hooks による pre/post チェック |
| 反復作業 | slash command / runbook |
| マルチ LLM ルーティング | model field でモデル選択 |

## 3. ECC と本パッケージの関係

```
[ECC エコシステム]                        [本パッケージ]
  Claude Code      ─┐
  Sub-agents       ─┤   ──> Expert Registry (Layer 0/1) で抽象化
  Skills           ─┤   ──> Pattern P-001..P-006 で編成
  MCP              ─┤   ──> 環境セットアップは 15_environment/
  Hooks            ─┤   ──> Quality Gates で参照
  Memory           ─┘   ──> Runbook System で永続化
```

本パッケージは ECC の **使い方** を体系化したもの。ECC 自体の仕様変更には `75_self-evolution/` で追従する。

## 4. 推奨ワークフロー

```
[Discovery] → [SDD] → [TDD] → [Verify] → [Quality Gate] → [Demo / Ship]
   ↑                                                           │
   └────── Self-Evolution / Knowledge Capture ─────────────────┘
```

各フェーズで使う ECC 機能を `90_ecc-usage/03_feature-map.md` で対照表化する。

## 5. ECC と他のエコシステムの違い

本章では「比較」より「位置づけ」を重視する:

- ECC は単独 LLM ラッパーではなく **マルチエージェント運用基盤**
- スクリプトを書かずに sub-agent / hooks / slash を組み合わせて運用できる
- エージェント間の I/O は本パッケージの **Delegation Contract** で明文化する

## 6. 利用前提

- Claude Code が動く環境 (CLI / IDE / SDK のいずれか)
- 公式 docs (https://code.claude.com/docs/en/) が参照可能
- 必要に応じて MCP servers が起動する

## 7. ECC の更新頻度

ECC は更新頻度が速い。本パッケージは四半期 radar (`75_self-evolution/05_industry-radar.md`) で追従する。**最新仕様の追跡は本パッケージのスコープ外**。あくまで「運用論」を担う。

## 8. 用語の整合

| 本パッケージ用語 | ECC 用語との対応 |
|---|---|
| 専門家エージェント | sub-agent |
| ナレッジパック | skill |
| 外部ツール | MCP server |
| 起動コマンド | slash command |
| 横断記憶 | memory |
| 委任契約 | (本パッケージ独自) |
| Pattern P-001..P-006 | (本パッケージ独自) |

## 9. 失敗例 (避ける)

- ECC を単一 LLM の代替として使う (context 経済を活かせない)
- sub-agent / skill / MCP を全部 Opus で動かす (コストが膨張する)
- hooks を使わずに Quality Gate を手動運用する (再現性が崩れる)
- slash command を書かずに毎回プロンプトを直書きする (Runbook 化されない)

## 10. 続きの章

| 章 | 目的 |
|---|---|
| [02_when-to-use-ecc.md](./02_when-to-use-ecc.md) | 適する/適さないケース |
| [03_feature-map.md](./03_feature-map.md) | 機能マップ |
| [04_routing-recipes.md](./04_routing-recipes.md) | Need → 機能の選定 |
| [05_anti-patterns.md](./05_anti-patterns.md) | よくある誤用 |
| [06_cost-and-context.md](./06_cost-and-context.md) | コスト・コンテキスト最適化 |
| [07_adoption-roadmap.md](./07_adoption-roadmap.md) | 導入ロードマップ |

## 出典

- Anthropic Claude Code 公式 docs (https://code.claude.com/docs/en/, retrieved 2026-06-23)
- Anthropic Claude Code Sub-agents docs (https://code.claude.com/docs/en/sub-agents, retrieved 2026-06-23)
- Anthropic Engineering: Built multi-agent research system (https://www.anthropic.com/engineering/built-multi-agent-research-system, retrieved 2026-06-23)
- 本パッケージ METHOD.md §11 用語集 (retrieved 2026-06-23)

## 不確実性

- ECC は「正式名称」というより本パッケージ内で用いる略称である。導入先で別名を使う場合は本章の語彙を上書きする。
- 6 要素の境界は ECC バージョンで変動しうる (例: skill / agent の役割境界)。仕様改訂は四半期 radar で追跡する。
