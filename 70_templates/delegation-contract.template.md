---
keywords: [templates, delegation, contract.template]
related: []
---
# Delegation Contract Template

<!-- 展開時はファイル冒頭に CodeGraph 用 frontmatter を追加すること:
---
keywords: [delegation, contract, {{contract-id}}]
related: [<同じ feature の design.md など>]
---
詳細: 70_templates/README.md -->

> `40_delegation/03_delegation-contract.md` と同形式。
> Orchestrator が専門エージェントに委任する際、必ずこの形式で記述する。

```markdown
## Delegation Contract: {{T-YYYY-MM-DD-NNN}}

- 委任元: {{orchestrator-id}}
- 委任先: {{expert-id}}
- 委任日時: {{YYYY-MM-DD HH:MM}}

### 1. 目的 (Objective)

{{1〜2 文。なぜこのタスクが必要か。期待する成果。}}

### 2. 入力 (Inputs)

- {{自己完結したコンテキスト要約}}
- 参照ファイル (相対パス):
  - {{path/to/file1}}
  - {{path/to/file2}}
- 関連 AC: {{AC-NN, AC-NN}}
- 前段の Delegation Contract: {{T-... or なし}}
- 外部資料: {{URL (retrieved_at: YYYY-MM-DD)}}

### 3. 期待出力 (Expected Output)

- フォーマット: {{markdown / JSON / YAML / patch / file}}
- スキーマ: {{JSON Schema / 項目列挙}}
- 配置先: {{path/to/output}}
- 上限: {{文字数 / token / ファイル数}}

### 4. 検収基準 (Acceptance Criteria)

- [ ] AC-{{NN}}-A: {{具体的に検証可能な条件}}
- [ ] AC-{{NN}}-B: {{出典必須・推測不可}}
- [ ] AC-{{NN}}-C: PATH POLICY 適合 (絶対パス・個人パス・固有組織名なし)
- [ ] AC-{{NN}}-D: 禁止語チェック pass

### 5. 制約 (Constraints)

- 使用可能ツール: {{Read / Edit / Write / Bash / WebFetch / MCP-*}}
- 禁止操作:
  - {{delete / force-push / 外部 API への書き込み}}
  - secret hardcode
  - production DB 直接操作
- タイムアウト: {{N}} 分
- コスト上限: {{N}}k token

### 6. 失敗時 (On Failure)

- 代替: {{別 expert id / 再委任先}}
- escalation: {{user / 別 orchestrator}}
- ロールバック手順: {{該当ある場合のコマンド}}
- 部分成果の扱い: {{保存 / 破棄 / レビュー}}

### 7. 検証 (Verification)

- 独立検証担当: {{別 expert id}} (生成 ≠ 判定)
- 検証手順:
  - {{test 実行 / diff レビュー / red-team}}
  - {{rubric: accuracy / completeness / clarity / actionability / conciseness}}
- 合格ライン: {{...}}
```

## 必須項目チェックリスト (委任前)

- [ ] 目的が 1 文で書けている
- [ ] 入力が自己完結している (親コンテキストに依存しない)
- [ ] 期待出力にフォーマット・スキーマ・上限がある
- [ ] AC が具体的で検証可能
- [ ] 使用ツールが明示されている
- [ ] 失敗時の代替が決まっている
- [ ] 重要度 = 最重要なら独立検証担当が指名されている

## 利用例

例 1: PRD 派生タスク → planner

例 2: TDD タスク → tdd-guide + lang-reviewer (verifier)

例 3: build 修復 → lang-build-resolver

詳細サンプルは `40_delegation/03_delegation-contract.md` を参照。

## 出典

- `40_delegation/03_delegation-contract.md` (本リポ内)
- Anthropic Engineering best practices (https://www.anthropic.com/engineering, retrieved_at: 2026-06-23)

## 不確実性

- 上限値 (タイムアウト / token) は経験則。SLA に応じて調整。
- 全タスクで verifier を立てるとコスト増。重要度に応じて省略可。
