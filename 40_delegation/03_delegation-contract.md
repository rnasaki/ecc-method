# 03 — Delegation Contract

全委任に共通する契約形式。Orchestrator が専門家にタスクを投げる際、必ずこの形式で記述する。

## 契約フォーマット

```markdown
## Delegation Contract: <task-id>

- 委任元: <orchestrator-id>
- 委任先: <expert-id>
- 委任日時: YYYY-MM-DD HH:MM (任意)

### 1. 目的 (Objective)
<1〜2 文。なぜこのタスクが必要か>

### 2. 入力 (Inputs)
- <自己完結したコンテキスト>
- <参照ファイルパス (相対パス)>
- <関連 AC ID>
- <前段の Delegation Contract への参照 (連鎖の場合)>

### 3. 期待出力 (Expected Output)
- フォーマット: <markdown / JSON / YAML / patch / ...>
- スキーマ: <JSON Schema または項目列挙>
- 上限: <文字数 / token / ファイル数>

### 4. 検収基準 (Acceptance Criteria)
- [ ] AC-NN-A: <具体的に検証可能な条件>
- [ ] AC-NN-B: <出典必須・推測不可>
- [ ] AC-NN-C: <PATH POLICY 適合>

### 5. 制約 (Constraints)
- 使用可能ツール: <Read / Edit / Bash / WebFetch / MCP-* / ...>
- 禁止操作: <delete / force-push / 外部 API への書き込み / ...>
- タイムアウト: <分>
- コスト上限: <token>

### 6. 失敗時 (On Failure)
- 代替: <別 expert id / 再委任先>
- escalation: <user / 別 orchestrator>
- ロールバック手順: <該当ある場合>

### 7. 検証 (Verification)
- 独立検証担当: <別 expert id> (生成 ≠ 判定)
- 検証手順: <test 実行 / diff 確認 / red-team / ...>
```

## 必須項目チェックリスト

委任前に以下を確認する。1 つでも欠けていたら委任不可:

- [ ] 目的が 1 文で書けている
- [ ] 入力が自己完結している (親コンテキストに依存しない)
- [ ] 期待出力にフォーマット・スキーマ・上限がある
- [ ] AC が具体的で検証可能
- [ ] 使用ツールが明示されている
- [ ] 失敗時の代替が決まっている
- [ ] 重要度 = 最重要なら独立検証担当が指名されている

## サンプル: PRD 派生タスク

```markdown
## Delegation Contract: T-2026-06-23-001

- 委任元: orchestrator-main
- 委任先: planner

### 1. 目的
新機能 F03-user-auth の requirements.md ドラフトを作成する。

### 2. 入力
- ./docs/PRD.md (機能一覧の F03 行を参照)
- ./70_templates/requirements.template.md
- 関連 AC: なし (新規)

### 3. 期待出力
- フォーマット: markdown
- スキーマ: requirements.template.md に準拠
- 上限: 800 行

### 4. 検収基準
- [ ] AC-01: 受入基準が Given/When/Then 形式で記述
- [ ] AC-02: 各 AC に ID (AC-NN) を付与
- [ ] AC-03: 出典 URL あり (Auth0 / OAuth2.1 RFC 等)
- [ ] AC-04: PATH POLICY 適合 (個人パス・組織名なし)

### 5. 制約
- 使用可能ツール: Read, Write, Edit, WebFetch
- 禁止操作: 既存 spec の上書き
- タイムアウト: 15 分
- コスト上限: 30k token

### 6. 失敗時
- 代替: architect agent に再委任
- escalation: user に PRD 不足箇所を確認

### 7. 検証
- 独立検証担当: agent-evaluator
- 検証手順: requirements.md を 5 軸 (accuracy/completeness/clarity/actionability/conciseness) で採点
```

## サンプル: TDD タスク

```markdown
## Delegation Contract: T-2026-06-23-042

- 委任元: orchestrator-main
- 委任先: tdd-guide

### 1. 目的
F03-user-auth tasks.md の T03 (login endpoint) を Red→Green→Refactor で実装する。

### 2. 入力
- ./spec/F03-user-auth/tasks.md (T03 行)
- ./spec/F03-user-auth/design.md (login API 仕様)
- 関連 AC: AC-05, AC-06

### 3. 期待出力
- フォーマット: 実装ファイル + テストファイル
- 配置:
    - ./tests/test_auth_login.py (or 該当言語のテスト)
    - ./src/auth/login.py (or 該当)
- 上限: 各 300 行

### 4. 検収基準
- [ ] AC-05 を検証する test が存在し pass
- [ ] AC-06 を検証する test が存在し pass
- [ ] coverage ≥ 80% (該当モジュール)
- [ ] lint / type check pass
- [ ] PATH POLICY 適合

### 5. 制約
- 使用可能ツール: Read, Write, Edit, Bash (test 実行のみ)
- 禁止操作: production DB 接続, secret hardcode
- タイムアウト: 30 分
- コスト上限: 50k token

### 6. 失敗時
- 代替: lang-build-resolver (該当言語) で build 修復後に再開
- escalation: design.md の login 仕様が曖昧なら architect 再委任

### 7. 検証
- 独立検証担当: lang-reviewer (該当言語)
- 検証手順: PR diff レビュー + AC 充足確認
```

## アンチパターン

| アンチパターン | なぜダメか | 対処 |
|---|---|---|
| "research X" のような open-ended 指示 | 範囲不明で重複・抜けが発生 (BP-004) | 範囲・出力スキーマ・ツールを明示 |
| 出力上限なし | コンテキスト溢れ・コスト爆発 | 上限を必ず付帯 |
| 親コンテキストへの暗黙依存 | subagent が文脈を読めず誤解 | 入力を自己完結させる |
| 生成と判定を同一 expert で実施 | 自己採点バイアス (BP-024) | verifier を別個体で指名 |
| ツール無制限 | 暴走・誤操作のリスク | 使用可能ツールをホワイトリスト |

## 出典

- BP-004: Anthropic Engineering "Built multi-agent research system" (2026-06-23)
- BP-024: Claude Code best practices (2026-06-23)
- 詳細は `./05_principles/_data/best_practices.json` を参照

## 不確実性

- 上限値 (タイムアウト / token) は経験則。プロジェクトの SLA に応じて調整。
- 全タスクで verifier を立てるとコストが嵩む。重要度に応じて省略可 (重要度 = 軽 のみ)。
