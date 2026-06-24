---
keywords: [runbook, spec]
related: []
---
# 01 — Runbook Spec

Runbook の構造定義。1 手続き 1 ファイル。INDEX に登録して再利用可能にする。

## 目的

- 同じ手続きを二度ユーザーに尋ねない (ゼロ重複原則)
- 失敗事例を横展開する (pitfall カテゴリ)
- 手順を冪等・コピペ可能な形で残す

## ファイル配置

```
45_runbook/
├── INDEX.md            # 索引 (機械可読)
├── 01_runbook-spec.md
├── 02_indexing-rules.md
├── 03_capture-trigger.md
├── 04_search-protocol.md
├── 05_maintenance.md
└── runbooks/           # 個別 Runbook 本体 (案件導入時に増殖)
    ├── RB-001-<slug>.md
    ├── RB-002-<slug>.md
    └── ...
```

## Runbook ファイルフォーマット

```markdown
---
id: RB-<NNN>-<kebab-slug>
title: <短く具体的に>
category: bootstrap | deploy | debug | infra | review | domain | pitfall | tooling
tags: [<tag1>, <tag2>]
created: YYYY-MM-DD
updated: YYYY-MM-DD
last-verified: YYYY-MM-DD
status: active | review-due | stale | deprecated
trigger: <この Runbook が呼ばれる状況の自然文記述。検索ヒット用>
expert-routing: [<expert-id>]
related: [<RB-NNN>]
source: <出典 URL or 検証コマンド>
---

# <タイトル>

## TL;DR (30 秒で読める結論)

<3〜5 行で結論>

## 前提 (要権限・要環境)

- <CLI / MCP / 権限要件>
- <ENV 変数 / 設定ファイル>
- <他 Runbook への依存>

## 手順 (コピペ可能・冪等)

```bash
# Step 1: <意図>
<command>

# Step 2: <意図>
<command>
```

## 検証 (成功条件)

- [ ] <検証 1>
- [ ] <検証 2>

## 失敗時のリカバリ

| 症状 | 原因 | 対処 |
|---|---|---|
| <症状> | <原因> | <対処コマンド> |

## 関連

- [[RB-NNN-other]]
- 出典: <URL>

## 変更履歴

| 日付 | 変更 | 理由 |
|---|---|---|
| YYYY-MM-DD | 初版 | 作成 |
```

## 必須項目

| 項目 | 必須? | 用途 |
|---|---|---|
| `id` | 必須 | 一意識別 |
| `title` | 必須 | 索引表示 |
| `category` | 必須 | 索引フィルタ |
| `tags` | 推奨 | 検索ヒット拡張 |
| `created` / `updated` | 必須 | 鮮度判定 |
| `last-verified` | 必須 | 鮮度判定 (180 日で stale) |
| `status` | 必須 | active / stale / deprecated 表示 |
| `trigger` | 必須 | 検索プロトコル一致用の自然文 |
| `expert-routing` | 推奨 | 関連 Registry エントリ |
| `related` | 任意 | 横断リンク |
| `source` | 必須 | L1 出典 |

## カテゴリ定義

| category | 用途 | 例 |
|---|---|---|
| `bootstrap` | 新規環境・新規リポの初期化手順 | python venv 構築、gh auth |
| `deploy` | デプロイ・リリース手順 | CF push、Docker build |
| `debug` | 失敗診断・調査手順 | proxy 経由の SSL 失敗診断 |
| `infra` | インフラ操作 | DB migration、cluster 起動 |
| `review` | レビュー・承認フロー | PR review、QA gate |
| `domain` | ドメイン固有の業務手順 | 業界特有の計算・変換 |
| `pitfall` | ハマりどころと脱出手順 | gh CLI トークン期限切れ対応 |
| `tooling` | ツール導入・設定 | MCP server 追加 |

## TL;DR 必須化

冒頭 30 秒で結論が読めること。これが無いと「再利用」されず再調査になる。

良い TL;DR の例:
> Python 3.11+ で `python -m venv .venv && source .venv/Scripts/activate && pip install -e ".[dev]"` の順で実行する。Windows GitBash 環境では `Scripts/activate` (Linux 系は `bin/activate`)。

悪い例:
> このリポでは Python の仮想環境を使います (← 何をすればよいか書いていない)

## 冪等性の要件

- 同じ手順を 2 回流しても破綻しない
- 中間状態が失敗しても巻き戻し可能
- 既存ファイル / DB を破壊しない (or 破壊する場合は明示)

冪等にするコツ:
- `mkdir -p` を使う (-p で再実行可能)
- `git checkout -B branch` (-B で再作成可能)
- DB migration は up/down 両方記述

## 検証セクションの要件

- 各検証項目はチェックボックス付き
- 検証コマンドが実行可能
- 期待出力が記述されている

例:
```
## 検証
- [ ] `gh auth status` が `Logged in to github.com as <user>` を返す
- [ ] `git push --dry-run origin main` が "Everything up-to-date" を返す
```

## 失敗リカバリの要件

- 想定される失敗を網羅 (エラーメッセージ単位)
- 各失敗に対処コマンド付与
- 巻き戻し手順 (rollback)

## 関連リンクの作法

`[[RB-NNN-slug]]` で他 Runbook を参照する。実在しない slug への参照は許容 (将来書く Runbook の予告として機能)。

## 出典

- Anthropic Claude Code skills docs (https://code.claude.com/docs/en/skills, retrieved 2026-06-23)
- 内部運用知見からの抽象化

## 不確実性

- 1 Runbook の理想長さは 100 〜 300 行。長すぎる場合は分割を検討。
- TL;DR と検証は省略不可。それ以外は内容により省略可。
