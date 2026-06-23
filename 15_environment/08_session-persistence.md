# 15-08 — Session Persistence (`/resume` / `/compact`)

長時間タスクをまたいで context を維持し、再開コストを最小化する手順。

## 目的

- セッション中断後に **同じ脈絡** で再開する。
- context window の終端に近づく前に **要約圧縮** して延命する。
- 重要状態 (PRD draft / TODO / 検討中の選択肢) を outside-of-context に書き出す。

## 主要コマンド

| コマンド | 役割 |
|---|---|
| `/resume` | 最近のセッションから選択して再開 |
| `/compact <focus?>` | 現セッションを要約して context を圧縮 |
| `/save-session <name?>` | 任意名でセッションをスナップショット (skill が有効な場合) |
| `/sessions` | 過去セッション一覧 (skill が有効な場合) |

`/compact` は引数で「圧縮時に残す観点」を渡せる。例: `/compact "現在の TODO と未決事項"`。

## 使い分け

| シーン | コマンド |
|---|---|
| 翌日続きから始める | `/resume` |
| context が 80% 超 / 反応劣化を感じる | `/compact` |
| 長期プロジェクトのチェックポイント | `/save-session <name>` |
| 中断時の一時保存 | `/save-session interim-<date>` |

## 永続化の階層

```
Memory L1: in-session memory (LLM 内)             ← 揮発
Memory L2: session log (~/.claude/projects/...)    ← /resume / /sessions
Memory L3: repo の docs / spec / runbook           ← 永続 (推奨保存先)
Memory L4: 外部 vault / project tracker            ← 横断永続 (Notion / Linear 等)
```

Memory L1 / Memory L2 は揮発リスクがある。重要決定は **必ず Memory L3** に書き出す。

## 重要状態の書き出し先

| 種類 | 推奨保存先 |
|---|---|
| PRD ドラフト | `{{repo_root}}/docs/PRD.md` |
| 要件 | `{{repo_root}}/spec/<feature>/requirements.md` |
| 設計 | `{{repo_root}}/spec/<feature>/design.md` |
| TODO | `{{repo_root}}/docs/TODO.md` または PR / issue |
| 未決 / 不確実性 | `{{repo_root}}/docs/uncertainties.md` |
| 検討中の選択肢 | `{{repo_root}}/docs/decision-log.md` (ADR 形式) |

## /compact の運用ルール

```
1. context が 70% を超えたら compact を予告
2. 重要状態を Memory L3 に書き出してから /compact 実行
3. /compact の引数で残すべき情報を明示:
   /compact "PRD draft / 未決事項 / 直近 TODO / failing test の名前"
4. 圧縮後に "compact後 sanity check" を実行:
   - PRD draft が引き継がれているか
   - 未決事項が消えていないか
   - failing test の文脈が残っているか
5. 失われた情報があれば Memory L3 から再注入
```

## /resume の運用ルール

```
1. 直近セッションが見つからない場合は Memory L3 を読み込んで再構築
2. 再開直後に「直前の最終アクション」を 1 文で要約
3. 続行するか / 仕切り直すかをユーザーに確認 (1 度だけ)
4. 続行決定後は質問せず実行
```

## context budget の考え方

- agent への委任プロンプトには **必ず出力上限** を付帯する (BP-004)
- 大量ファイルを Read する前に、Grep / Glob で必要範囲を絞る (BP-005)
- 取得した web ページは要点抜粋のみを保持 (本文を保持しない)

詳細は [05_principles/06_context-economy.md](../05_principles/06_context-economy.md) を参照。

## 失敗時の挙動

| 症状 | 対応 |
|---|---|
| `/resume` で目的のセッションが出ない | Memory L3 から手動再構築 |
| `/compact` 後に重要情報が消えた | Memory L3 を再 Read、`/compact` 引数で次回改善 |
| context 超過で reply 失敗 | 即 `/compact "直近 5 ターン"` |
| session log が肥大化 | 古い session を `/sessions` から削除 |

## 出典

- Anthropic Claude Code docs: Session management (https://code.claude.com/docs/en/sessions, retrieved 2026-06-23)
- Anthropic Engineering: Context economy (https://www.anthropic.com/engineering/built-multi-agent-research-system, retrieved 2026-06-23)

## 不確実性

- `/resume` / `/compact` のオプションは ECC version で挙動変動の可能性。
- `/save-session` は skill (sessions) を有効化していないと使えない。
- 圧縮時の損失は不可避。重要情報は **常に Memory L3 に二重化** する習慣で吸収する。
