---
keywords: [templates, requirements.template]
related: []
---
# Requirements: {{F-NN}}-{{feature-slug}}

<!-- 展開時はファイル冒頭に CodeGraph 用 frontmatter を追加すること:
---
keywords: [requirements, {{F-NN}}, {{feature-slug}}]
related: [spec/{{F-NN}}-{{feature-slug}}/design.md, spec/{{F-NN}}-{{feature-slug}}/tasks.md]
---
詳細: 70_templates/README.md -->

> 機能単位の要件定義。ユーザーストーリーと AC (受入基準) を Given/When/Then 形式で記述。
> design.md / tasks.md と 1:1 で対応させる。

- Feature ID: {{F-NN}}
- 名称: {{feature-name}}
- 親 PRD: `../../docs/PRD.md` (機能一覧の {{F-NN}} 行)
- 作成日: {{YYYY-MM-DD}}
- 更新日: {{YYYY-MM-DD}}
- ステータス: draft | review | approved

## 1. 概要

{{この機能が何を実現するかを 2〜3 行で。}}

## 2. ユーザーストーリー

### US-01: {{ストーリー名}}

> **As a** {{role}}
> **I want to** {{action}}
> **So that** {{value}}

### US-02: {{...}}

> **As a** {{...}}
> **I want to** {{...}}
> **So that** {{...}}

## 3. 受入基準 (Acceptance Criteria)

各 AC は ID 付き、Given/When/Then 形式、検証可能であること。

### AC-01: {{ACのタイトル}}

- **Given** {{前提条件}}
- **When** {{操作 / イベント}}
- **Then** {{期待結果}}
- 関連 US: US-01
- 検証手段: {{自動テスト / 手動 QA / 監視メトリクス}}

### AC-02: {{...}}

- **Given** {{...}}
- **When** {{...}}
- **Then** {{...}}
- 関連 US: US-01
- 検証手段: {{...}}

### AC-03: {{...}}

- **Given** {{...}}
- **When** {{...}}
- **Then** {{...}}
- 関連 US: US-02
- 検証手段: {{...}}

## 4. スコープ

### 4.1 In-scope

- {{この機能で扱う対象}}

### 4.2 Out-of-scope

- {{扱わない / 後続フェーズに送る事項}}

## 5. データ要件

| データ項目 | 型 | 必須 | 由来 | 備考 |
|---|---|---|---|---|
| {{field}} | {{type}} | yes/no | {{入力 / 外部 API / 計算}} | {{...}} |

## 6. 入出力 (概要)

- 入力: {{...}}
- 出力: {{...}}
- 失敗時の挙動: {{...}}

詳細は `design.md` を参照。

## 7. 非機能要件 (機能固有)

| カテゴリ | 要件 |
|---|---|
| 性能 | {{p95 ≤ {{N}} ms}} |
| エラー処理 | {{失敗時のユーザー体験}} |
| ログ | {{記録項目}} |

## 8. 依存関係

- 前提機能: {{F-NN, ...}}
- 外部 API / SaaS: {{...}}
- データソース: {{...}}

## 9. AC カバレッジ予定

| AC ID | 設計反映先 (design.md) | 実装タスク (tasks.md) | テスト |
|---|---|---|---|
| AC-01 | {{section}} | T-NN | {{test-id}} |
| AC-02 | {{section}} | T-NN | {{test-id}} |

## 出典

- {{業界標準 / API 仕様書}} (URL, retrieved_at: {{YYYY-MM-DD}})

## 不確実性

- {{未確定の AC}}
- {{曖昧な仕様}}
- {{次回レビュー対象}}
