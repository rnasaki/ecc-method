# 05 — コンテキスト窓溢れ・/compact / subagent 隔離

長時間セッションや大規模リポ操作では、LLM のコンテキスト窓 (context window) を使い切り、応答品質が急落する。本ファイルは「気付き → 圧縮 → 隔離」の運用を定義する。

## TL;DR

- 直近の応答が「直前の指示を忘れる」「無関係なファイルを開き直す」「同じ調査を繰り返す」になったらコンテキスト枯渇のサイン。
- `/compact` で会話を要約して縮約、または subagent に隔離タスクを切り出す。
- 長期作業は最初から「親は計画、subagent は実行」の分割で開始する。

## 想定する状況

- LLM コーディングエージェントを長時間 (1〜数時間) 連続使用している。
- リポジトリが大きく、参照ファイルが累積している。
- 同一スレッドで設計 → 実装 → レビュー → デプロイまでを通している。

## 兆候

| 兆候 | 例 |
|---|---|
| 同じファイルを何度も Read する | 直前に開いた内容を覚えていない |
| 直前の合意 (例: AC-03 の文言) を再度尋ねる | 短期記憶が消えた |
| 「この行は今日の前半に修正したはず」を再修正 | 過去 turn を参照できない |
| ToolUse 失敗のリトライが増える | 過去の失敗理由を忘れている |
| 応答全体の質が下がる (要約が雑になる) | 残コンテキストが圧迫されている |
| 「最初の指示は何でしたか」と尋ねる | 先頭の指示が押し出された |

## 対処の優先順位

### 1. 圧縮 (compact)

`/compact <focus>` 形式で、何を残したいか焦点を渡す:

```
/compact Keep the architecture decisions for F03-user-auth and the open
issues. Drop intermediate file Reads and tool errors.
```

良い compact 指示の条件:

- 残すべきもの (decisions / open issues / in-flight TODO) を列挙
- 落としてよいもの (生ログ / 中間 Read 結果) を明示
- 最終アウトプットの形式 (markdown / table) を指定

### 2. チェックポイント保存

会話を要約して外部ファイルへ書き出す。次セッションの開始材料になる:

```
docs/session-log/2026-06-23-feature-f03.md
- 達成: requirements.md / design.md ドラフト
- 未完: tasks.md の T05 実装中 (login endpoint)
- 次回: T05 を tdd-guide で着手、AC-05/AC-06 を最優先
```

3〜10 個の bullet で十分。長文は逆効果。

### 3. Subagent 隔離

汎用エージェントから「親が見たくない作業」を分離する:

| 委任対象 | 例 |
|---|---|
| 大量ファイル grep / find | 100 ファイル超のスキャン |
| 長尺ログ要約 | CI ログ全体から失敗の根本原因抽出 |
| 単発の build 修復 | build-error-resolver |
| 1 回限りの探索 | "どこで X 関数が呼ばれているか" |

委任時の規約 (詳細は `40_delegation/03_delegation-contract.md`):

- 入力は自己完結 (親の文脈を含めなくても理解可能)
- 出力上限を必ず指定 (token / 行数)
- 結果は要約形式で受け取り、生ログは subagent 側で破棄

### 4. 新規セッション開始

compact でも改善しなければ、checkpoint ファイルを開いて新規セッションを始める。
中途半端な圧縮を続けるより、計画的に区切るほうが結果的に速い。

## 予防策

### 親エージェントは「読まない」

- 大ファイル (1000 行超) は親で Read しない。subagent に「該当箇所を 30 行で要約して返す」と委任。
- 長尺ログは tail / grep してから渡す。

### 早めにファイルへ書き出す

- ドラフト・決定事項は会話に置きっぱなしにせず、ファイル (PRD / design / decisions) に逐次保存。
- 会話履歴を一次記憶にしない。

### 計画 → 実行を分ける

- 親エージェント: 設計・委任・検収のみ。
- subagent: ファイル読み書き・コード生成・テスト実行。

### コンテキスト残量の感覚

公開モデルは `context_left` を直接表示しないため、UI 側のインジケータと、応答品質のセルフチェック (上記「兆候」) で判断する。

## アンチパターン

| アンチパターン | 結果 | 代替 |
|---|---|---|
| compact を遅らせる | 後半全 turn が低品質に | 兆候を見たら即 compact |
| compact 指示を「短くまとめて」だけ | 残すべき決定が落ちる | focus を明示 |
| subagent から長文をそのまま親に戻す | 親側で再度溢れる | 要約 / スキーマ固定で受領 |
| 同一スレッドで 1 日中作業 | 後半事故率が跳ね上がる | 区切りで checkpoint + 新規セッション |
| `/clear` を勧められて全消し | 直前の意思決定が消える | clear ではなく compact + checkpoint |

## 検証

成功条件:

- [ ] compact 後、直前の決定事項 (AC / 設計判断) が要約に残っている
- [ ] subagent への委任で親 turn が減っている
- [ ] 同じファイルを 3 回以上 Read していない
- [ ] checkpoint ファイルを次セッションの先頭で読み込めば再開できる

## 出典

- Anthropic Engineering "Building effective agents" (https://www.anthropic.com/engineering/building-effective-agents, retrieved_at: 2026-06-23)
- Anthropic Engineering "How we built our multi-agent research system" (https://www.anthropic.com/engineering, retrieved_at: 2026-06-23)
- Claude Code Documentation "Memory and context" (https://code.claude.com/docs, retrieved_at: 2026-06-23)

## 不確実性

- compact の効果はモデル / 実装ごとに差がある。出力を確認して、決定事項が抜けていないか必ず目視。
- subagent の独立コンテキストはコスト増に直結する。委任のコスト/便益は重要度で判定 (`40_delegation/02_routing-rubric.md` 参照)。
