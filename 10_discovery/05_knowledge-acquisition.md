# 10-05 — Knowledge Acquisition (公式優先取得手順)

未知のライブラリ・API・仕様を **L1 公式情報** から取りに行くための手順。L3 (モデル知識単独) は禁止 (METHOD §6 / Quality Gate)。

## 目的

- すべての主張に L1 出典を付帯できるようにする。
- 取得は専門エージェントに委任し、orchestrator は出典付きの要約のみを受け取る。
- 取得結果を Runbook 化し、再取得を避ける (BP-018 ゼロ重複)。

## 取得階層

```
L1: 公式 docs / 公式 spec / 公式 source code
    例: code.claude.com, openai.github.io, docs.python.org, MDN, RFC
L2: 著者特定の一次情報 (公式 blog / 公式論文)
L3: モデル内部知識単独 ← 禁止 (引用付きで再検証必須)
```

## 取得経路 (優先順)

### 経路 A: docs-lookup (Context7 MCP)

最優先。ライブラリ / FW / API の公式 docs を直接引く。

```yaml
agent: docs-lookup
input:
  library: <name>
  version: <semver?>
  query: <natural language>
output:
  excerpt: <string>
  source_url: <l1-url>
  retrieved_at: 2026-06-23
```

### 経路 B: 公式サイト直接取得 (WebFetch)

Context7 にカバーされていないドメイン:

- 公式 blog
- 公式 spec (RFC / W3C / ECMAScript)
- 標準ライブラリ docs

WebFetch で取得し、URL と取得時刻を必ず記録する。

### 経路 C: 公式 GitHub のコード読解

ドキュメント不足時のみ。以下を順に試す:

```
1. gh search code "<symbol>" --repo <owner>/<repo>
2. 該当ファイルを raw で取得
3. 該当 commit hash を出典に含める
```

### 経路 D: Exa 検索 (最終手段)

A/B/C で見つからない場合のみ。Exa は出典の **発見** に使い、取得は L1 ソースに直接当たる。

## 取得プロトコル

```
1. 必要知識を 1 文で言語化
2. 経路 A → B → C → D の順に試す
3. 取得物を以下スキーマに正規化:
   {
     claim: <要約 1〜2 文>,
     evidence: <原文抜粋 ≤ 50 単語>,
     source_url: <l1-url>,
     source_layer: L1 | L2,
     retrieved_at: 2026-06-23,
     library_version: <string?>
   }
4. orchestrator は claim と source_url のみ受け取る
5. Runbook 化候補を評価 (再利用見込みあれば 45_runbook/INDEX.md に追加)
```

## 並列取得

複数ライブラリ / 複数 API を同時に調べる場合、独立タスクとして同一メッセージで並列起動する ([40_delegation/02_routing-rubric.md](../40_delegation/02_routing-rubric.md))。

## Version Pinning

公式 docs は版で書き換わる。記録時に必ず:

- `library_version` を含める
- 取得 URL に版アンカーがあれば優先 (例: `/v1.5/api/`)
- 検証: 主要 API の signature を取得日のソースで再確認

## 取得結果の保存

- 即時利用: 当該タスクの中でのみ参照
- 再利用見込みあり: Runbook 化 → `45_runbook/INDEX.md` に追加
- 高頻度参照: `_tmp/knowledge_cache/<topic>.yaml` (gitignore)

## L3 (モデル知識単独) の取り扱い

- 禁止。出典なしの主張は出力前に削除する。
- どうしても引けない場合は uncertainty として明記し、「未検証」タグで残す。
- 後続セッションで取得経路 A〜D を再走査する。

## Fact-Check Gate との整合

すべての主張は [60_quality-gates/01_fact-check-protocol.md](../60_quality-gates/01_fact-check-protocol.md) の検証を通す。本章はその上流に位置する。

## 失敗時の挙動

| 失敗 | 対応 |
|---|---|
| docs-lookup で hit なし | 経路 B/C/D に escalate |
| 全経路で hit なし | uncertainty として記録、ユーザーに 1 度だけ確認 |
| version 不明 | 当日の latest を採用、`library_version: latest@2026-06-23` で記録 |
| 公式 docs が当該機能をカバーしていない | コード読解 (経路 C) に降格、commit hash 必須 |

## 出典

- Anthropic Claude Code Sub-agents docs (https://code.claude.com/docs/en/sub-agents, retrieved 2026-06-23)
- Context7 MCP (https://github.com/upstash/context7, retrieved 2026-06-23)
- Exa search (https://exa.ai/, retrieved 2026-06-23)

## 不確実性

- Context7 のカバレッジは ライブラリ / バージョンで偏りがある。経路 B/C への自動 fallback が必要。
- WebFetch / Exa は社内ネット制約で失敗しうる ([04_constraint-mapping.md](./04_constraint-mapping.md))。private mirror への切り替え手順は環境章で別途定義。
- knowledge_cache の TTL は未定。鮮度ポリシー ([75_self-evolution/01_freshness-policy.md](../75_self-evolution/01_freshness-policy.md)) に従う。
