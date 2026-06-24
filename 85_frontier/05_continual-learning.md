---
keywords: [frontier, continual, learning]
related: []
---
# 05 Continual Learning — 案件横断で knowhow が転移する agent

> 5 段構成: **現状 → 先端 (2025-2026 H1) → 基礎研究 → 未来 → 今すぐ準備**
> retrieved_at: 2026-06-23

---

## 1. 現状 (陳腐化候補)

agent の「学習」はほぼ案件単位で閉じている。2025 年後半に Memory tool 系 API が出たことで「案件横断 memory」が技術的には可能になったが、運用標準はまだ案件単位の閉じた memory が多数派。

- 案件ごとに新しい session / memory を作る
- 過去案件で得た知見は「人間がドキュメント化したものだけ」が次案件に渡る
- 同じ失敗を別案件で繰り返す
- 「memory に追記する」だけの自己改善が多く、転移は人間頼り
- weight 更新型のファインチューンは限定的 (コスト・運用負荷)

**陳腐化の見込み時期**

| 項目 | 陳腐化見込み | 確度 |
|---|---|---|
| 案件単位で memory が分断 | 2027 H1 | 中〜高 (Memory tool GA 化が進めば加速) |
| 知見転移は人間ドキュメント経由のみ | 2027 H2 | 中 |
| 「memory = 単純テキスト追記」前提 | 2028 H1 | 中 (概念メモリ系研究の進展次第) |

---

## 2. 先端 (2025-2026 H1)

### 2.1 Anthropic Memory tool — 2025-09-29 公開 (public beta)

- 公式: https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool (retrieved_at: 2026-06-23)
- 発表 blog: https://claude.com/blog/context-management (retrieved_at: 2026-06-23)
- API tool type: `memory_20250818` / 対応モデル: 公開時点で Claude Sonnet 4.5、その後 Claude Opus 系にも展開
- 機能: `view` / `create` / `str_replace` / `insert` / `delete` / `rename` の 6 コマンド
- ストレージは client-side (アプリ側でファイル/DB/S3 など自由に backing store を選べる)
- 公式ベンチで「memory tool + context editing で複合 agentic タスクが +39%、context editing 単独で +29% 改善、100-turn web search で token -84%」と報告
- 重要設計: agent は「タスク開始前に必ず /memories を view せよ」というシステムプロンプトを自動付与され、context window がいつリセットされても progress を引き継げる前提で動く

これは「LLM の context window = 短期記憶 / Memory tool = 長期記憶」を OS のメモリ階層になぞらえた API であり、案件横断 memory の標準実装になりうる。

### 2.2 OpenAI Agents SDK / Responses API の Sessions

- 関連発表 URL: https://openai.com/index/new-tools-for-building-agents/ (retrieved_at: 2026-06-23 / **取得失敗 = 403 Forbidden**)
- 取得失敗のため詳細は本章では「未検証」とする
- 参考: Responses API には conversation state を server-side で持たせる仕組みが 2025 年に導入されたとされるが、本章では一次出典の確認が取れなかったため確定情報として扱わない (未検証)

### 2.3 ArcMemo — 概念レベル lifelong memory

- arXiv:2509.04439 — "ArcMemo: Abstract Reasoning Composition with Lifelong LLM Memory" (retrieved_at: 2026-06-23)
- 公開: 2025-09-04 (v1) / 2025-10-04 (v3)
- 概要: 推論中に発見した「再利用可能な抽象パターン」を自然言語の概念として永続化する。instance ベースの memory (生ログを丸ごと残す) と対比される
- ARC-AGI で memory なしベースライン比 +7.5% 相対改善、推論計算を増やすほど性能が単調改善
- ECC への含意: 案件横断 memory は「ログ丸ごと」ではなく「概念単位に蒸留して保存」する方が転移効率が良い、という方向性

### 2.4 Sleep-time Compute — context への事前計算 (memory との接続)

- arXiv:2504.13171 — "Sleep-time Compute: Beyond Inference Scaling at Test-time" (retrieved_at: 2026-06-23)
- 公開: 2025-04-17
- 直接の lifelong learning 論文ではないが、「アイドル時間に context を事前計算して memory に積む」という運用設計に直結する
- Stateful 系 reasoning bench で test-time compute -5x、コスト -2.5x/query

### 2.5 Anthropic — Effective harnesses for long-running agents

- 公式 engineering 記事: https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents (Memory tool docs から参照、retrieved_at: 2026-06-23)
- 「複数 session に跨る software dev pattern」として、初期化 session が memory artifact (progress log, feature checklist, init script) を作成し、後続 session はそれを読んで状態復元するパターンを推奨
- ECC への含意: HITL Gate と組み合わせれば「Gate で止まっても次 session が確実に状態復元できる」運用が成立する

### 2.6 出典比率の自己点検

- 2025-2026 出典: Memory tool docs / context-management blog / ArcMemo / Sleep-time compute / Effective harnesses → **5 件**
- 2023-2024 出典 (本セクション): 0 件
- 2025-2026 比率: 100% (本セクション内)

---

## 3. 基礎研究 (歴史文脈)

frontier ではないが、概念の出処として短く列挙。

- Voyager (arXiv:2305.16291, 2023): skill ライブラリ蓄積による生涯学習の原点
- Reflexion (arXiv:2303.11366, 2023): 失敗→自然言語反省→memory の経路を提示
- Generative Agents (arXiv:2304.03442, 2023): 重要度・新しさ・頻度で memory を階層化
- MemGPT (arXiv:2310.08560, 2023): LLM context を主記憶、外部ストアを補助記憶として OS 風に管理
- Continual Learning of LLMs survey (arXiv:2307.06435, 2023): catastrophic forgetting と転移の総説

これらは 2025 年の Memory tool / ArcMemo の前提知識として価値があるが、**frontier の主出典として使うのは陳腐化リスクあり**。

---

## 4. 未来

| 統合先 | 何を入れるか |
|---|---|
| `75_self-evolution/` | 案件横断レトロ → 共通 memory への昇格手順 |
| `40_delegation/` | Memory tool を組み込んだ「過去案件 memory 検索 agent」 |
| `60_quality-gates/` | 転移知見が古くないか (rot) を判定する gate / masking 漏れを検出する gate |
| 新設候補 | `90_ecc-usage/` 配下に「組織共通 memory」章 |

組織共通 memory の成立条件:

- 案件固有情報 (顧客名、機密) を必ず除外する masking 層
- 知見の信頼度スコア (1 案件 = Tier-C, 2 案件 = Tier-B, 3+ 案件 = Tier-A)
- 古くなった知見の自動アーカイブ
- 引用 (この知見はどの案件由来か) のトレーサビリティ
- 概念単位の蒸留 (ArcMemo 流) で容量と転移率を両立

---

## 5. 今すぐできる準備

### 手 1: Memory tool の薄い実装を 1 つ持つ

`memory_20250818` は client-side ツールなので、backing store を完全に自前で握れる。先に薄い実装を持つことで「将来の昇格レール」が引ける。

実装最小要件:

1. `/memories` 配下のみアクセス許可 (path traversal 対策)
2. `view` / `create` / `str_replace` / `insert` / `delete` / `rename` を実装
3. 1 ファイル最大サイズ・全体最大サイズの上限
4. 案件 ID で namespace 分離 (`/memories/<project_id>/...`)
5. Tier-A だけ `/memories/_org/` に置く昇格レーン

### 手 2: 案件横断レトロの定例化 (人間運用)

Memory tool が無くても、四半期に 1 回:

1. 各案件の memory から「他案件にも効きそうな知見」を抽出
2. masking (顧客名・機密・固有名詞を一般化)
3. 信頼度 Tier 付与
4. Tier-A だけを `/memories/_org/` 相当に昇格
5. 昇格知見には「最終確認日」を付け、6 ヶ月触られなければ降格レビュー

これは agent が居なくても回せる人間運用。後で agent 化するときの「教師データ」になる。

### 手 3: memory の階層構造を先取り

| 階層 | 内容 | 寿命 | 対応する 2.x の出典 |
|---|---|---|---|
| L1: session memory | 1 セッション内 context | session 終了で破棄 | Memory tool docs |
| L2: project memory | 案件全体 | 案件完了で凍結 | Effective harnesses (multi-session pattern) |
| L3: org memory | 案件横断昇格知見 | 6 ヶ月毎に再検証 | ArcMemo (概念単位の永続化) |

---

## continual learning の典型的な失敗モード

- **catastrophic forgetting**: 新しい知見が古い知見を上書きする → 階層化 + 引用保持で対処
- **誤転移**: 案件 A で効いたことが案件 B で逆効果 → 適用条件 (preconditions) を memory に必ず書く
- **rot**: モデル更新で前提が変わる → 最終確認日と再検証ルール
- **プライバシー漏洩**: 顧客固有情報が他案件に流れる → masking 層を gate として必須化
- **memory 肥大化**: instance ログを丸ごと積むと検索性が崩壊 → ArcMemo 流の概念蒸留

---

## 出典

- Anthropic Memory tool (公式 docs): https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool (retrieved_at: 2026-06-23)
- Anthropic context-management 発表 (2025-09-29): https://claude.com/blog/context-management (retrieved_at: 2026-06-23)
- ArcMemo: arXiv:2509.04439 (公開 2025-09-04, retrieved_at: 2026-06-23)
- Sleep-time Compute: arXiv:2504.13171 (公開 2025-04-17, retrieved_at: 2026-06-23)
- Effective harnesses for long-running agents (Memory tool docs より参照): https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents (retrieved_at: 2026-06-23)
- (歴史文脈) Voyager: arXiv:2305.16291 / Reflexion: arXiv:2303.11366 / Generative Agents: arXiv:2304.03442 / MemGPT: arXiv:2310.08560 / Continual Learning of LLMs: arXiv:2307.06435 (いずれも retrieved_at: 2026-06-23)

## 不確実性

- OpenAI Agents SDK / Sessions の 2025-2026 仕様は **WebFetch 取得失敗 (403)** のため本章では未検証扱い。次回更新時に一次ソース再取得すること。
- Memory tool は public beta であり、tool type 文字列 (`memory_20250818`) や仕様は GA までに変わる可能性がある。
- ArcMemo の +7.5% は ARC-AGI 特化の数字で、業務 agent タスクへの転移は未検証。
- Tier-A/B/C の閾値 (1/2/3 案件) は経験則であり、組織規模で要調整。
- weight 更新型 continual learning を本番で回す商用例は依然限定的 (未検証)。本章は「memory + retrieval」型を前提とする。
- masking 層の実装は本章では具体化していない (別途専門設計が必要、未検証)。
