---
id: RB-{{NNN}}-{{kebab-slug}}
title: {{短く具体的に}}
category: bootstrap | deploy | debug | infra | review | domain | pitfall | tooling
tags: [{{tag1}}, {{tag2}}]
created: {{YYYY-MM-DD}}
updated: {{YYYY-MM-DD}}
last-verified: {{YYYY-MM-DD}}
status: active
trigger: {{この Runbook が呼ばれる状況の自然文記述。検索ヒット用に複数キーワードを含める}}
expert-routing: [{{expert-id}}]
related: [RB-{{NNN}}]
source: {{出典 URL or 検証コマンド}}
keywords: [runbook, {{topic1}}, {{topic2}}]
---

# {{タイトル}}

> 本ファイルは `45_runbook/01_runbook-spec.md` のフォーマットに準拠する。
> 1 手続き 1 ファイル / 100〜300 行を目安に作成する。

## TL;DR (30 秒で読める結論)

{{3〜5 行の結論。コマンド 1〜2 行を含めると再利用しやすい。}}

## 前提 (要権限・要環境)

- {{CLI / MCP / 権限}}
- {{ENV 変数 / 設定ファイル}}
- {{他 Runbook への依存: [[RB-NNN-slug]]}}

## 手順 (コピペ可能・冪等)

```bash
# Step 1: {{意図}}
{{command}}

# Step 2: {{意図}}
{{command}}

# Step 3: {{意図}}
{{command}}
```

冪等のコツ:

- `mkdir -p` / `git checkout -B` / migration の up-down 両方記述
- 既存ファイルや DB を破壊する場合は明示

## 検証 (成功条件)

- [ ] {{コマンド}} が {{期待出力}} を返す
- [ ] {{...}}
- [ ] {{...}}

## 失敗時のリカバリ

| 症状 | 原因 | 対処 |
|---|---|---|
| {{エラーメッセージ}} | {{原因}} | {{コマンド / リンク先 Runbook}} |
| {{エラーメッセージ}} | {{原因}} | {{...}} |

ロールバック:

```bash
{{rollback-command}}
```

## 関連

- [[RB-{{NNN}}-{{slug}}]] — {{なぜ関連するか}}
- 出典: {{URL}}

## 変更履歴

| 日付 | 変更 | 理由 |
|---|---|---|
| {{YYYY-MM-DD}} | 初版 | 作成 |

## 出典

- {{primary-source}} (URL, retrieved_at: {{YYYY-MM-DD}})
- {{secondary-source}} (URL, retrieved_at: {{YYYY-MM-DD}})

## 不確実性

- {{未検証の前提}}
- {{環境差異の可能性}}
- {{次回 last-verified までに確認すべきこと}}
