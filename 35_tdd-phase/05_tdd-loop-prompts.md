---
keywords: [tdd-phase, tdd, loop, prompts]
related: []
---
# 35_tdd-phase / 05 TDD Loop Prompts

> TDD ループを駆動する 2 つのエージェント / コマンド `tdd-guide` と `tdd-workflow` の使い分けを規定する。
> 「いつ、どちらに、何を渡すか」を決めることで、実装フェーズの摩擦を減らす。

## 1. 役割の違い

| 名称 | 性質 | 主目的 |
|------|------|--------|
| `tdd-guide` | エージェント (常駐型・proactive) | RGR ループの遵守を支援する助言役 |
| `tdd-workflow` | スラッシュコマンド (一発起動) | 1 タスクを TDD で完走させるドライバ |

両者は排他ではなく併用可能。`tdd-workflow` の中で `tdd-guide` を呼び出す構成も成立する。

## 2. tdd-guide エージェント

### 2.1 起動条件

- 新機能実装、バグ修正、リファクタを開始する直前。
- すでに実装に手を出してしまった状態で「テストが無いことに気付いた」とき。
- code-reviewer がテスト不足を指摘した直後。

### 2.2 渡す情報

| 項目 | 内容 |
|------|------|
| Feature ID | F<NN>-<kebab> |
| 対象 AC | AC-NN を 1 つ以上 |
| design 抜粋 | 設計から該当箇所のみ (BP-008 文脈経済) |
| 既存テストパス | 関連既存テストファイルの相対パス |
| 期待アウトプット | 「失敗するテスト 1 件 + 最小実装 + Refactor 提案」 |

### 2.3 期待される動作

- Red → Green → Refactor の各ステップをガイドし、ステップを飛ばさない。
- カバレッジ (`03_coverage-policy.md`) としきい値の達成を確認する。
- AC カバレッジ表 (`30_sdd-phase/05_tasks-template.md`) との整合を取る。

### 2.4 プロンプト雛形

```
あなたは tdd-guide。以下のタスクを RGR で進めてください。

- Feature ID: F03-pdf-text-extract
- 対象 AC: AC-01, AC-02
- design 抜粋: <相対パス: specs/.../design.md セクション>
- 既存テスト: tests/test_F03_pdf_text_extract.py

進行手順:
1. Red: AC-01 に対する失敗するテストを 1 件追加し、実行ログを提示
2. Green: AC-01 を満たす最小実装を提示
3. Refactor: テスト green を維持しつつ整理点を提示
4. AC-02 で同じループを繰り返す

完了条件:
- 全テスト green の証拠ログ
- 新規/変更コードのカバレッジ 90% 以上
- AC カバレッジ表の更新差分
```

## 3. tdd-workflow スラッシュコマンド

### 3.1 起動条件

- 1 タスク (T<NN>) をエンドツーエンドで完走させたいとき。
- 計画から PR 作成までを 1 セッションで回したいとき。

### 3.2 渡す情報

| 項目 | 内容 |
|------|------|
| Task ID | T<NN> |
| ブランチ名 | `feature/<FeatureID>-T<NN>-<slug>` |
| done_when | tasks.md の done_when 配列 |
| 評価エージェント | code-reviewer / security-reviewer の指定 |

### 3.3 期待される動作

- ブランチ作成 → RGR ループ × 必要回数 → カバレッジ確認 → レビュー依頼 → PR ドラフト作成。
- 各ステップで証拠 (テストログ / カバレッジレポート / レビュー結果) を残す (BP-027)。
- Stop hook (BP-015) によりテスト未 green でセッションが終了しないよう保証。

### 3.4 プロンプト雛形

```
/tdd-workflow

inputs:
  task_id: T05
  branch: feature/F03-T05-extract-blank-page
  done_when:
    - 全テストが green
    - 新規/変更コードのカバレッジ 90% 以上
    - covers_ac (AC-03, AC-04) を満たす自動テストが追加されている
  reviewers:
    - code-reviewer
    - security-reviewer

constraints:
  - 1 タスク = 1 PR
  - depends_on の先行タスクが完了していること
  - レビュー差し戻しは最大 2 ラウンドまで自動対応、それ以上は人手介入
```

## 4. 投げ分け判断表

| 状況 | 推奨 |
|------|------|
| AC を 1 つだけ進めたい | tdd-guide |
| 1 タスクを最後まで通したい | tdd-workflow |
| RGR の途中で詰まった | tdd-guide で局所支援 |
| ブランチ運用を含めて任せたい | tdd-workflow |
| レビュー差し戻し対応のみ | tdd-guide |

## 5. アンチパターン

- 詳細な情報を渡さずに `tdd-workflow` に「実装よろしく」だけ投げる (BP-004 違反)。
- `tdd-guide` をオーケストレーション用途に使う (本来は局所支援役)。
- 同じ AC に両者を二重起動して結果がコンフリクト (どちらが master か不明確)。
- 完了条件 (done_when) を空にして「やってみて」と任せる。

## 6. 関連リンク

- `01_red-green-refactor.md` — RGR の手順
- `02_test-pyramid.md` — テスト層
- `03_coverage-policy.md` — カバレッジゲーティング
- `04_fake-injection.md` — フェイク注入
- `40_delegation/01_expert-registry.md` — エージェント割当一覧

## 出典

- L1: BP-004 explicit handoff with objectives — `./05_principles/_data/best_practices.json` (retrieved_at: 2026-06-23)
- L1: BP-005 specialized agents with handoffs — `./05_principles/_data/best_practices.json` (retrieved_at: 2026-06-23)
- L1: BP-015 Stop hook for verification — `./05_principles/_data/best_practices.json` (retrieved_at: 2026-06-23)
- L1: BP-027 evidence-based completion — `./05_principles/_data/best_practices.json` (retrieved_at: 2026-06-23)
- L1: Claude Code best practices — https://code.claude.com/docs/en/best-practices (retrieved_at: 2026-06-23)

## 不確実性

- `tdd-guide` と `tdd-workflow` の実装名はハーネスごとに異なる。本書は概念的な役割分担を規定し、具体名は組織側で読み替える。
- レビュー差し戻しの自動対応上限 (例: 2 ラウンド) は経験則。プロジェクトで調整可。
