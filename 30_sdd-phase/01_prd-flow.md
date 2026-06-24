---
keywords: [sdd-phase, prd, flow]
related: []
---
# 30_sdd-phase / 01 PRD 作成フロー

> Spec-Driven Development (SDD) の起点となる Product Requirements Document (PRD) の作成手順を定義する。
> PRD は「何を、誰のために、なぜ作るか」を確定させるドキュメントであり、後続の requirements / design / tasks の前提となる。

## 1. PRD の位置付け

- SDD パイプライン: `PRD → requirements → design → tasks → TDD 実装`
- PRD は仕様化サイクルの最上流。コード生成ではなく合意形成のための文書とする。
- 1 機能あたり 1 PRD を原則とし、複数機能をまたぐ PRD は分割する。

## 2. 標準セクション (固定 7 項目)

PRD は以下 7 セクションで構成する。順序固定。

| # | セクション | 必須内容 |
|---|------------|----------|
| 1 | 背景 (Background) | 現状の課題、なぜ今これを作るのか、関連する既存資産 |
| 2 | ターゲット (Audience) | 主たる利用者像、利用シーン、利用頻度 |
| 3 | 価値 (Value) | 利用者が得る成果、定量的な改善見込み |
| 4 | スコープ (Scope) | やる/やらないの境界、明示的な除外項目 |
| 5 | 機能一覧 (Features) | F<NN>-<kebab> ID 付きの粒度で羅列 |
| 6 | 成功指標 (Success Metrics) | KGI / KPI、計測方法、合格しきい値 |
| 7 | 技術スタック (Tech Stack) | 言語、フレームワーク、外部サービス、制約 |

## 3. 作成ステップ

### Step 1: Discovery インプットの集約

- `10_discovery/` で実施した利用者ヒアリング、既存ログ分析の結果を取り込む。
- 一次情報を最低 1 件以上引用する (`## 出典` に記載)。

### Step 2: 機能候補の発散

- ブレインストーミング段階では F<NN> 採番をしない。粒度を揃える前に必要機能を出し切る。
- 重複・依存関係を整理し、最終的に MVP に含める機能だけを残す。

### Step 3: F<NN>-<kebab> 採番

- 並び順に NN を 01 から付番する (採番規則の詳細は `02_feature-id-rules.md`)。
- スコープ外と判断した機能は別表に分けて残す (将来の参照用)。

### Step 4: 成功指標の定義

- 1 機能につき 1 つ以上の定量指標を割り当てる。
- 計測不能な指標 (例: 「使いやすくなる」) は禁止。代替の代理指標 (proxy metric) に置き換える。

### Step 5: 技術スタック確定

- 既存リポジトリで採用済みの言語・フレームワークを優先 (新規導入には正当化を要求)。
- 外部 API・LLM プロバイダ依存はここで明示し、後続の design でフェイク注入の対象を確定させる。

### Step 6: レビューとサインオフ

- `06_review-gates.md` の Gate 1 (Requirements 完成) と連動する。PRD は Gate 1 通過の前提となる文書。
- 横串の品質ゲート (`60_quality-gates/`) も同時に通過させる (出典・不確実性・PATH POLICY 等)。
- レビュアは「背景と機能の対応」「スコープ境界の明確さ」「指標の計測可能性」を中心に確認する。

## 4. 受け渡し形式

- 配置 (推奨): リポジトリ直下の `specs/<feature-set>/PRD.md`。組織で別配置を採用する場合は本パッケージの参照先を一括置換する前提で運用する。
- 文字コード: UTF-8 (BOM 無し)
- 改行: LF
- フロントマターに `feature_ids:` 配列を記載し、後段の requirements.md と一意に紐付ける。

## 5. 反復ポリシー

- PRD は確定後も変更可能。ただし変更時は changelog セクションを追記し、影響を受ける requirements / design / tasks に Issue を起票する。
- 「コードを書きながら PRD をこっそり書き換える」を禁止する (BP-020 Spec-First の趣旨)。

## 6. アンチパターン

- 機能一覧と背景が対応していない (背景に書かれていない機能が紛れ込む)。
- 成功指標が「ユーザ満足度」のような計測手段なしの定性語のみ。
- 技術スタックを「後で決める」と空欄で進行する。

## 7. 関連リンク

- `02_feature-id-rules.md` — F<NN>-<kebab> 採番規則
- `03_requirements-template.md` — AC-NN を Given/When/Then で書く規約
- `60_quality-gates/` — Gate 1 のチェック項目

## 出典

- L1: spec-kit (Spec-First development) — https://github.com/github/spec-kit (retrieved_at: 2026-06-23)
- L1: Claude Code best practices (Explore-Plan-Implement-Commit) — https://code.claude.com/docs/en/best-practices (retrieved_at: 2026-06-23)

## 不確実性

- (前提) 成功指標の合格しきい値はプロジェクト個別事情で変動する。本書は「定量化必須」のルールのみ規定し、絶対値は規定しない。
- (前提) 技術スタックの選定基準は組織のスキルセットに依存するため、本書では「既存採用優先」までを規定する。
- (前提) §2 の「標準セクション 7 項目固定 / 順序固定」は本パッケージ独自規定。spec-kit (L1) には PRD 構成の拘束は無い。組織が増減する場合、§2 の表だけを差し替え、Gate 1 のチェック項目と整合させること。
- (未検証) §3 Step 1 の「利用者ヒアリング / 既存ログ分析」を担う Discovery 章 (`10_discovery/`) の対応付けは初版時点で実機運用未検証。02_domain-elicitation / 05_knowledge-acquisition のいずれが主担当かは案件で運用決定。
- (未検証) §4 の `specs/<feature-set>/PRD.md` 配置規約は本パッケージ初版では実案件適用例なし。配置を変更する場合 06_review-gates.md §5.2 の `specs/<feature-set>/REVIEW.md` も合わせて変更すること。
