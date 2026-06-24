---
keywords: [delegation, a2a, handoff, standards]
related: []
---
# 09. A2A 通信と Handoff 標準 (Agent-to-Agent Standards)

> 異種ベンダー / 異種フレームワークにまたがる Agent 間通信の標準プロトコルを、ECC の delegation 設計にどう接続するかをまとめる。本ファイルは ECC 内部の同質ハンドオフ (`06_handoff-patterns.md`) を補完し、外部標準 (Anthropic MCP / OpenAI Agents SDK Handoffs) との接続規約を定義する。

---

## 1. なぜ標準が必要か

ECC の従来運用は単一ベンダー内 (Claude Code 内の subagent 連携) を前提にしてきたが、実運用では以下の混成が常態化している。

- Claude Code (Anthropic) を orchestrator にし、専門タスクを外部 SaaS の agent に委譲
- OpenAI Agents SDK で組まれた upstream pipeline から Claude の skill を呼び出す
- Slack / GitHub Issue を介した human-in-the-loop reviewer への handoff
- 内製の MCP server が業務 DB / 検索 API を agent に露出

この時、各ベンダー固有の schema や独自の handoff フォーマットを直接配線すると、(a) 接続が N×M に爆発し、(b) context が二重に膨らみ、(c) 監査ログが分断される。標準プロトコル (MCP / Agents SDK Handoff) を「境界面」として固定することで、接続を N+M に抑える。

---

## 2. リーダー側の標準仕組み

### 2.1 Anthropic MCP (Model Context Protocol)

MCP は AI application を外部システムに接続するためのオープン標準プロトコルである [L1: modelcontextprotocol.io]。Claude / ChatGPT / VS Code / Cursor など多数のクライアントが対応しており、「USB-C のような標準接続点」と位置づけられる。

露出される primitives は 3 種類。

| Primitive | 役割 | ECC 上の使い所 |
|---|---|---|
| **Tools** | モデルが呼び出せる関数 | `crm_search`, `legal_check` など外部 action |
| **Resources** | モデルが読み取れる context データ | 規程文書、過去案件データ |
| **Prompts** | サーバ側で管理する再利用可能 prompt | 監査用 review 雛形 |

クライアントとサーバは JSON-RPC ベースで握手し、tool/resource/prompt 一覧を `list_*` で取得して動的に登録する。サーバ側は ECC の Tool Card (`30_tools/`) と 1:1 で対応させると都合が良い。

### 2.2 OpenAI Agents SDK Handoffs

Agents SDK の Handoff は、ある agent の制御を別の専門 agent に「譲り渡す」機構であり、内部的には `transfer_to_<agent_name>` という tool としてモデルに露出される [L1: openai.github.io/openai-agents-python/handoffs/]。`handoff()` 関数で以下をカスタマイズできる。

- `tool_name_override` / `tool_description_override`: 接続点の命名
- `on_handoff`: 譲渡時のフック (監査ログ / state 永続化)
- `input_type`: 譲渡時に渡される構造化引数 schema
- `input_filter`: 譲渡先が見る会話履歴のフィルタリング
- `is_enabled`: 動的な有効化判定

### 2.3 Google A2A Protocol (概念のみ)

Google A2A は agent 間相互運用の別系統の提案である。本パッケージでは概念的な存在として認識するに留め、実装は MCP と OpenAI Handoffs の互換に集中する。理由は ECC が依存する Claude Code / OpenAI Agents SDK のいずれもが MCP を一級市民として扱っているため。

---

## 3. Handoff vs Manager-style の選定基準

OpenAI Agents SDK の文書は、両パターンの判定軸を明示している [L1: openai.github.io/openai-agents-python/multi_agent/]。ECC ではこの軸をそのまま採用する。

### Manager パターン (Agents as Tools)

- manager が会話の所有者であり続ける
- 複数 specialist の出力を統合して最終回答を生成する
- 共通 guardrails を中央で強制する
- subtask は specialist に閉じ、ユーザ対話は manager が握る

### Handoff パターン

- routing 自体が workflow の一部
- 譲渡先 specialist がユーザに直接応答する
- specialist 側を focused prompt にしたい
- manager に narration をさせず instruction を切り替えたい

### 判断軸 (3 観点)

| 観点 | Manager 優位 | Handoff 優位 |
|---|---|---|
| 専門性の段差 | 緩やか / 部分タスク | 急峻 / モード切替 |
| 統合の必要性 | 複数出力の合成あり | 単一 specialist で完結 |
| context overhead | manager が context を保持できる | 履歴を絞り込みたい (input_filter) |

---

## 4. ECC への適用

### 4.1 既存パターンの分類

`40_delegation/01_expert-registry.md (Layer 1: Pattern P-001..P-006)` の P-001..P-006 は、いずれも orchestrator が会話を所有し worker の結果を統合する形式であるため、**全て Manager 系 (Agents as Tools 相当)** として明示分類する。

| Pattern | 種別 | 補足 |
|---|---|---|
| P-001 sequential pipeline | Manager | 直列 worker 呼び出し、統合は orchestrator |
| P-002 parallel fan-out | Manager | 並列 worker、統合点が固定 |
| P-003 review loop | Manager | reviewer は as_tool、判定は orchestrator |
| P-004 escalation | Manager | 専門 agent を tool として呼ぶ |
| P-005 HITL gate | Manager | human review も as_tool 相当 |

### 4.2 新パターン P-006: Handoff チェーン

段階的に深化する設計タスクでは、planner → architect → tdd-guide のように specialist が前段の context を引き継ぎつつ「主役交代」していく方が、manager narration による context 二重化を避けられる。これを P-006 として追加する。

- **入力**: 1 件の要求 (feature spec)
- **遷移**:
  1. `planner` が分解と優先度を決定 → handoff(`architect`)
  2. `architect` が IF / データフローを確定 → handoff(`tdd-guide`)
  3. `tdd-guide` が RED→GREEN→REFACTOR を駆動
- **記録**: 各 handoff で `on_handoff` 相当のフックに ECC の handoff record (`06_handoff-patterns.md`) を書き出す
- **適用条件**: 各段階で前段の判断を上書きしない / 段差が急峻 / 中間統合が不要

---

## 5. 異種ベンダー連携の実例

### 5.1 Claude Code から OpenAI Agents SDK の agent を呼ぶ

OpenAI Agents SDK で構築した specialist 群を MCP server として公開し、Claude Code 側はそれを通常の MCP tool として登録する。Claude から見れば一様な tool に見え、ベンダー固有 schema は MCP server 内に閉じる。

### 5.2 OpenAI から Claude Code の skill を呼ぶ

Claude Code の skill / subagent を MCP server (もしくは薄い HTTP wrapper) でラップし、OpenAI Agents SDK 側からは `handoff()` の `tool_name_override` を使って `transfer_to_claude_<skill>` として露出する。`input_filter` で会話履歴を最小限に絞る。

### 5.3 人間レビュアーへの handoff

Slack / GitHub Issue 経由の human reviewer への譲渡も「同じ handoff インタフェース」で扱う。Issue / Slack message の作成を `on_handoff` フックで実行し、reviewer の応答を webhook で receiving 側に注入する。HITL gate (P-005) と組み合わせ可能。

---

## 6. アンチパターン

| アンチパターン | 何が起きるか | 対処 |
|---|---|---|
| ベンダー固有 schema を異種環境に直接流用 | 接続点が N×M に膨張、schema drift が伝播 | MCP / Handoff の境界面で必ず正規化 |
| Handoff と Manager を 1 セッションで混在 | context 二重化、監査ログが分断 | P-001..P-006 (Manager) と P-006 (Handoff) を排他適用 |
| `input_filter` を設定せず handoff | 履歴がそのまま膨張、token 浪費 | specialist には必要最小限の context のみ渡す |
| `on_handoff` を未実装で譲渡 | ECC の handoff record が欠落 / 監査不能 | フックで `06_handoff-patterns.md` 形式の record を必ず emit |
| MCP server を介さず外部 SaaS に直接配線 | 認証 / 監査が agent ごとにバラける | MCP server を境界面に固定、認証とログを集約 |

---

## 出典

- [L1] modelcontextprotocol.io, "What is the Model Context Protocol (MCP)?", https://modelcontextprotocol.io/ (retrieved_at: 2026-06-23) — MCP の概要、primitives (tools / resources / prompts)、エコシステム支援範囲
- [L1] OpenAI Agents SDK Documentation, "Handoffs", https://openai.github.io/openai-agents-python/handoffs/ (retrieved_at: 2026-06-23) — `handoff()` 関数の仕様、`on_handoff` / `input_filter` / `tool_name_override` 等のパラメータ
- [L1] OpenAI Agents SDK Documentation, "Multi-agent", https://openai.github.io/openai-agents-python/multi_agent/ (retrieved_at: 2026-06-23) — Manager (Agents as Tools) と Handoff の選定基準
- [L1] Anthropic Docs, "MCP" (Agents and Tools), https://docs.claude.com/en/docs/agents-and-tools/mcp (retrieved_at: 2026-06-23) — Claude による MCP クライアント実装の標準仕様

## 不確実性

- Google A2A Protocol については本文書では概念紹介のみとし、仕様詳細・互換性の評価は未実施。MCP / Agents SDK の優位が逆転した場合は別途追記が必要。
- MCP の `prompts` primitive は ECC のどのレイヤ (skill / handoff record / 監査) に対応付けるかが運用上未確定であり、最初の本番接続時に再検証する。
- Claude Code の subagent を MCP server としてラップする実装方式 (HTTP / stdio / WebSocket) はベンダー側の推奨が変動しうるため、接続実装時点の公式ガイドを再確認すること。
- `on_handoff` フックでの handoff record emit は ECC 内部 (`06_handoff-patterns.md`) との schema 整合を要するが、フィールド名の最終確定は実装フェーズに残している。
