---
keywords: [runbook, search, protocol]
related: []
---
# 04 — Search Protocol

「Runbook を書いても引かれなければ意味がない」を防ぐ検索手順。Orchestrator はタスク受信直後に必ずこのプロトコルを通過する。

## 決定木 (Top-Level)

```
タスク受信
  └─> Step 0: CodeGraph 検索 (`_index/concept-graph.json`)
       └─ keywords / file_index に当てる → 候補 md を抽出
       └─ 候補 md の `related` で 1-hop 拡張
       └─ 該当ファイルの先頭 (frontmatter + TL;DR) のみ Read
       └─ 解決可 → 終了
       └─ 不足 ↓
  └─> Step 1: Runbook 索引 (`45_runbook/INDEX.md` + `_index/by-*.md`)
       └─ trigger / category / tag のいずれかでヒット → Runbook 採用
       └─ ヒットせず ↓
  └─> Step 2: 本文 grep (fallback)
       └─ ヒット → 該当箇所を読み、適用可否判定
       └─ ヒットせず ↓
  └─> Step 3: Registry 委任 (新規問題として処理)
       └─ 完了後に Capture Trigger 評価 (`03_capture-trigger.md`)
```

各 Step は短時間で打ち切る (Step 0〜2 合計で 30 秒程度)。本文 grep は最後の手段で、CodeGraph と Runbook 索引が機能していれば原則不要。

## Step 0: CodeGraph 検索 (最優先)

### 検索対象
- `_index/concept-graph.json` の `file_index` (全 md の `keywords` / `related`)
- `nodes` (keyword → 該当 md ファイル群)
- `edges` (keyword 共起から関連トピックを推定)

### 手順
1. タスク本文から keyword 候補を抽出 (動詞・対象・環境)
2. `file_index` を走査し `keywords` 一致するファイルを列挙
3. 各候補の `related` を辿って 1-hop 拡張
4. 候補ファイルの先頭 (frontmatter + TL;DR / 最初の節) のみ Read
5. 解決可なら終了。不足なら Step 1 へ

### 利点
- 全文 grep より遥かに低コスト (JSON 1 ファイル走査)
- 関連トピックが `related` / `edges` で自動拡張される
- 第 5 原則「コンテキスト最小」を満たす (該当ファイルの先頭のみ)

### 注意
- `_index/concept-graph.json` が古いと当たらない → ドキュメント追加・改名後は再生成 (`80_commands/generate-concept-graph.mjs`)
- keywords が粗い場合は手書きで `keywords:` を補強

## Step 1: Runbook 索引検索

### 検索対象
- `45_runbook/INDEX.md` の `runbooks:` リスト (主に `trigger` / `title` / `tags`)
- `45_runbook/_index/by-category.md` `by-tag.md` `by-trigger.md` (自動生成ビュー)

### 検索クエリの組み立て
タスク本文から以下を抽出:
- 動詞 (やりたいこと): 「実装したい」「失敗する」「設定したい」
- 対象 (名詞): 「pytest」「認証」「proxy」
- 環境 (修飾): 「Windows」「会社環境」

例: 「Windows GitBash で pytest が ImportError で落ちる」
→ クエリ: `pytest`, `ImportError`, `windows`, `gitbash`

### 検索コマンド
```bash
# trigger 文での fuzzy 検索
grep -i "<keyword>" 45_runbook/INDEX.md

# tag 検索
grep -B 1 "tags:.*<keyword>" 45_runbook/INDEX.md

# category 絞り込み
grep "category: pitfall" 45_runbook/INDEX.md
```

### ヒット判定
- 1 件ヒット → そのまま採用
- 2 件以上 → tag が最も近いものを優先、`last_verified` が新しい方
- 0 件 → Step 2 へ (本文 grep)

### ヒット時の挙動
- Runbook 本文を読み、TL;DR と前提を確認
- 前提が満たされている → 手順を実行
- 前提不一致 → 「該当なし」として Step 4 へ

## Step 2: 本文 grep (fallback)

### 適用契機
CodeGraph / Runbook 索引では当たらないが、Runbook 本文中に解決手順が埋まっている可能性。

### 手順
```bash
# 全 Runbook 本文を対象に grep
grep -ri "<エラーメッセージの一部>" 45_runbook/runbooks/

# 複数キーワード AND
grep -ril "<keyword1>" 45_runbook/runbooks/ | xargs grep -l "<keyword2>"
```

### 留意点
- ヒット件数が多い場合は最新更新ファイルを優先
- 本文中の手順が部分一致しただけの場合、全体適用可否を確認

### 制限
- 本文 grep は最後の手段。CodeGraph / Runbook 索引が機能していれば不要なはず
- 多用する場合は keywords / trigger / tag が貧弱な兆候 → frontmatter 補強 + CodeGraph 再生成 (`05_maintenance.md`, `_index/README.md`)

## Step 3: Registry 委任 (新規問題)

`45_runbook` で見つからなければ「新規問題」として `40_delegation` 側へ。

### 手順
1. `40_delegation/02_routing-rubric.md` の決定木で expert 選定
2. `40_delegation/03_delegation-contract.md` の形式で委任契約発行
3. 完了後に `45_runbook/03_capture-trigger.md` を評価
4. Capture 該当なら Runbook 化 → INDEX 追記

### 重要
Step 3 で解決した問題は、**次回同じ問題で Step 0 / Step 1 がヒットするように** Runbook 化 + frontmatter 整備 + CodeGraph 再生成までセットで実施する。書かなければ次回も Step 3 まで降りる。

## 検索失敗の典型パターン

| パターン | 原因 | 対処 |
|---|---|---|
| INDEX に書かれているのに引かれない | trigger 文がフォーマル過ぎ / 英語のみ | trigger を口語日本語に書き直す |
| tag があるのに当たらない | 同義語の乱立 (`auth` vs `authentication`) | タグ辞書で統一 (`02_indexing-rules.md`) |
| 本文 grep で当たるが最新でない | last_verified 古い / 廃止予定 | `05_maintenance.md` の鮮度判定 |
| 検索コスト高 (毎回 grep) | INDEX 不在 / 雑 | INDEX 充実が先決 |

## 検索キャッシュ (推奨)

頻出クエリは Orchestrator 側で簡易キャッシュ可:

```yaml
# _tmp/search_cache.yaml
queries:
  - q: "pytest ImportError windows"
    hit: RB-007-pytest-windows-import
    used_at: YYYY-MM-DD
```

キャッシュは目安。INDEX が一次ソース、キャッシュは派生。

## マルチ Runbook ヒット時の選択

```
複数 Runbook がヒット
  → 1. 直接該当 (trigger / title が完全一致) を最優先
     2. 同点なら status: active を優先 (review-due / stale より)
     3. それでも同点なら last_verified が新しい方
     4. それでも同点ならユーザーに選択を委ねる (ASK)
```

## 検索の Self-check

タスク受信後、Step 0 を必ず実行したか確認するためのチェック:

- [ ] `_index/concept-graph.json` を読んだ (keywords / file_index 走査)
- [ ] Runbook 索引 (INDEX.md / _index/by-*.md) を確認した
- [ ] ヒットなしを確認してから Step 3 (委任) に進んだ
- [ ] 解決後に Capture Trigger を評価し、必要なら CodeGraph を再生成した

このチェックを Stop hook (BP-015) で自動化するのが望ましい。

## アンチパターン

| アンチパターン | 症状 | 対処 |
|---|---|---|
| 検索せず即委任 | 既存 Runbook を毎回再発明 | Step 0 を必須化 |
| CodeGraph / INDEX を読まず本文 grep | コスト高・ヒット率低 | Step 順序を厳守 (0 → 1 → 2) |
| 部分一致で「ヒットなし」と判断 | 隣接ケースを見逃す | `related` 1-hop / 本文まで降りる |
| ヒットしたが古いから無視 | 結局再調査 | last_verified 確認 + 必要なら更新コミット |
| 検索後に Capture を忘れる | 同じ問題が次回も発生 | Stop hook で強制 |
| ドキュメント追加後に CodeGraph 再生成を忘れる | 次回 Step 0 が当たらない | RGR 完了時 / Gate 通過時の規律化 (`30_sdd-phase/06`, `35_tdd-phase/01`) |

## 出典

- BP-007: Anthropic Claude Code best practices (https://code.claude.com/docs/en/best-practices, retrieved 2026-06-23)
- BP-015: 同上
- BP-016: Anthropic Claude Code skills docs (https://code.claude.com/docs/en/skills, retrieved 2026-06-23)
- 内部 SSOT: `45_runbook/INDEX.md`, `45_runbook/02_indexing-rules.md`, `45_runbook/03_capture-trigger.md`

## 不確実性

- Step 1〜3 のタイムボックス (合計 30 秒) は目安。検索コマンドの実行コスト次第で延長可。
- マルチヒット時の選択ルールは経験則。優先順位の入れ替え (例: 直接該当 vs 鮮度) はプロジェクトで再定義可。
- 検索キャッシュの自動更新は本パッケージで提供しない。
