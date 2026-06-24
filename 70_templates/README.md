---
keywords: [templates, frontmatter, codegraph]
related: [../_index/README.md, ../20_repo-bootstrap/02_directory-skeleton.md, ../80_commands/generate-concept-graph.mjs]
---

# 70_templates/ — テンプレ展開時の規律

このディレクトリのテンプレからファイルを生成するときは、展開後の md ファイル冒頭に以下の frontmatter を必ず含めること。CodeGraph (`_index/concept-graph.json`) の整合性が保たれる。

## 必須 frontmatter

```yaml
---
keywords: [<topic1>, <topic2>, ...]   # 検索で当たるキーワード (3〜8 件目安、英語小文字 kebab)
related: [<rel-path-to-md>, ...]      # 強い関連がある md への相対パス (≤5 件)
---
```

## 推奨ガイドライン

| フィールド | ルール |
|---|---|
| `keywords` | feature ID / 機能名 / カテゴリ / 重要キーワード。`templates` `runbooks` などのメタ語を 1 つは入れる |
| `related` | spec 同セット (requirements ↔ design ↔ tasks)、同 feature の knowhow、参照する Method 章 |

## 自動補完されるケース

frontmatter を書き忘れて commit しても、`node ecc-method/80_commands/generate-keywords-frontmatter.mjs` がパスとファイル名から keywords を推定して注入する (既存 frontmatter は壊さない)。

ただし **手書き frontmatter が望ましい**。理由:
- 自動推定はディレクトリ名ベースなので、機能ID `F03-search` のような語彙が拾えない
- 自動推定 keywords は粗い (例: `requirements.template` のような複合語)

## テンプレ展開後の必須フロー

ドキュメント追加・改名・大規模 rename を行った後は **必ず** CodeGraph を再生成:

```bash
node ecc-method/80_commands/generate-keywords-frontmatter.mjs
node ecc-method/80_commands/generate-concept-graph.mjs
```

これを怠ると `_index/concept-graph.json` が drift して探索精度が落ちる (CodeGraph SSOT 原則)。

## テンプレ一覧

| テンプレ | 展開先 (例) |
|---|---|
| `PRD.template.md` | `docs/PRD.md` |
| `requirements.template.md` | `spec/F<NN>-<slug>/requirements.md` |
| `design.template.md` | `spec/F<NN>-<slug>/design.md` |
| `tasks.template.md` | `spec/F<NN>-<slug>/tasks.md` |
| `runbook.template.md` | `knowhow/RB-<NNN>-<slug>.md` |
| `delegation-contract.template.md` | `docs/delegation/<contract-id>.md` |
| `demo-scenario.template.md` | `docs/demo/<demo-name>.md` |
| `presentation.template.md` | `docs/presentation/<title>.md` |

## 出典

- [_index/README.md](../_index/README.md) — CodeGraph 仕様
- [RB-002 phased-rollout-plan-index-graph](../45_runbook/runbooks/RB-002-phased-rollout-plan-index-graph.md) — Phase 4/5 の経緯
- 第 5 原則「コンテキスト最小」(`METHOD.md` §3)
