# 30_sdd-phase / 06 レビュー Gate

> SDD では「PRD → requirements → design → tasks」の各遷移点に Human-in-the-Loop (HITL) のレビュー Gate を置き、
> 下流に未確定要素を流さないようにする。本書は Gate 1/2/3 のレビュー観点を規定する。

## 1. Gate 構成

| Gate | 通過条件の対象 | 対応文書 |
|------|--------------|----------|
| Gate 1 | requirements 完成 | requirements.md |
| Gate 2 | design 完成 | design.md |
| Gate 3 | tasks 完成 | tasks.md |

すべての Gate は `60_quality-gates/` の品質ゲート群と接続する。

## 2. Gate 1: Requirements 完成

### 2.1 通過条件

- [ ] PRD の全 Feature ID が requirements.md にブロックとして存在する
- [ ] 全 Feature ID に AC-01 以降が 1 つ以上ある
- [ ] 全 AC が Given/When/Then 形式で書かれている
- [ ] 全 AC が `03_requirements-template.md` の検証可能性チェックを満たす
- [ ] 非機能要件は数値+測定方法を併記している (該当する場合)
- [ ] 出典・retrieved_at が記載されている

### 2.2 レビュー観点

| 観点 | チェック内容 |
|------|-------------|
| 完全性 | PRD と AC の対応に漏れがないか |
| 検証可能性 | 各 AC が自動テストにできるか |
| 一意性 | 同じ AC が複数機能で重複していないか |
| 観測可能性 | Then が利用者観測可能な対象を指しているか |

### 2.3 差し戻し条件

- 検証不能語 (「正しく動作する」など) が含まれる
- AC が PRD 機能説明の写経になっている
- 非機能要件の数値根拠が無い

## 3. Gate 2: Design 完成

### 3.1 通過条件

- [ ] requirements.md の全 AC に対応する設計箇所が特定可能
- [ ] AI エージェント設計に役割分割 / モデル割当 / フェイク注入点が明示されている
- [ ] 外部依存 (DB / LLM / 外部 API) がすべて列挙されている
- [ ] エラー処理方針が利用者向けとログ向けに分離されている
- [ ] 設計判断ログに採用/却下と理由が残っている

### 3.2 レビュー観点

| 観点 | チェック内容 |
|------|-------------|
| 充足性 | 全 AC が設計でカバーされているか |
| 試験可能性 | フェイク注入点が決まり、TDD 開始可能か |
| 安全性 | 認証/認可/入力検証の責務が割り当て済みか |
| 拡張性 | 将来の AC 追加に耐える分割になっているか |
| 説明責任 | 設計判断ログで「なぜこうしたか」が追跡可能か |

### 3.3 差し戻し条件

- AC のうち 1 つ以上が設計のどこにも登場しない
- LLM の役割分割が不明瞭で、フェイク注入点が決められない
- 設計判断ログが空欄

## 4. Gate 3: Tasks 完成

### 4.1 通過条件

- [ ] tasks.md の AC カバレッジ表が全 AC を 1 行以上カバーしている
- [ ] 全タスクに id / title / feature_ids / covers_ac / depends_on / est_hours / artifacts / done_when が揃っている
- [ ] 各タスクが PR 1 個分の粒度 (差分 800 行以内目安) に収まる
- [ ] depends_on の循環依存がない
- [ ] done_when に「テスト green」「AC を満たす自動テスト追加」が含まれている

### 4.2 レビュー観点

| 観点 | チェック内容 |
|------|-------------|
| カバレッジ | AC カバレッジ表が requirements の全 AC を網羅しているか |
| 粒度 | タスクが大きすぎ/小さすぎないか |
| 順序 | depends_on が現実的で循環していないか |
| 証拠主義 | done_when が観測可能な完了条件になっているか (BP-027) |
| 並列性 | 並列実行可能なタスクがフェーズで括られているか |

### 4.3 差し戻し条件

- AC カバレッジ表に空欄 AC がある
- 1 タスクが 5 日級など極端な規模
- done_when が「実装完了」のみで証拠を要求していない

## 5. レビュー実施方法

### 5.1 アドバーサリアル レビュー (BP-024)

- 各 Gate のレビューは「文書を書いた人」とは別のレビュアまたは別エージェント文脈で実施する。
- レビュア用プロンプトには、評価対象の文書と本書の通過条件のみを渡す (BP-025: 関連しない指摘を抑える)。

### 5.2 Gate 通過の記録

- 通過した Gate は `specs/<feature-set>/REVIEW.md` に記録する。
  - フォーマット: `- Gate 1: <PASS|FAIL> by <reviewer> at <YYYY-MM-DD>`
- FAIL の場合は差し戻し理由と再提出予定を併記。

## 6. アンチパターン

- 同じ人が書いて同じ人が承認 (アドバーサリアル性が無い)。
- Gate 通過記録を残さず「口頭で承認」した
- Gate 1 を飛ばして design 着手 (AC 未確定のまま設計し手戻り発生)
- レビュアが「些末な指摘で差し戻す」(BP-025 違反、要件外の指摘で進行を阻害)

## 7. 関連リンク

- `01_prd-flow.md` 〜 `05_tasks-template.md` — 各 Gate の対象文書
- `60_quality-gates/` — 実装後の品質ゲート
- `40_delegation/01_expert-registry.md` — レビュアエージェント割当

## 出典

- L1: BP-024 adversarial review / BP-025 scoped reviewer prompts — `./05_principles/_data/best_practices.json` (retrieved_at: 2026-06-23)
- L1: Claude Code best practices (Stop hook for verification) — https://code.claude.com/docs/en/best-practices (retrieved_at: 2026-06-23)
- L1: spec-kit (gate-based workflow) — https://github.com/github/spec-kit (retrieved_at: 2026-06-23)

## 不確実性

- HITL レビュアの人数 (1 名/2 名以上) はプロジェクト裁量。本書は「書いた人と別の主体」のみ規定する。
- 自動レビュー (LLM-judge) と人手レビューの組み合わせ比率は規定しない (BP-026 と整合)。
