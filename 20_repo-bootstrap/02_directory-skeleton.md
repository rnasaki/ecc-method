---
keywords: [repo-bootstrap, directory, skeleton]
related: [20_repo-bootstrap/04_profiles.md]
---
# 20-02 — Directory Skeleton (spec / docs / knowhow / tests 雛形)

新規リポに最初に作るディレクトリ骨格を定義する。プロファイル ([04_profiles.md](./04_profiles.md)) で差分を持つ。

## 共通骨格

```
{{repo_root}}/
├── README.md                  # 1 段落のゴールと使い方の入口
├── CLAUDE.md                  # ECC 用エントリ (Method への参照)
├── LICENSE                    # 案件方針に従う
├── .gitignore                 # 03_gitignore-baseline.md から
├── .gitattributes
├── .editorconfig
├── .env.example               # key のみ、値なし
├── .claude/
│   ├── settings.json          # チーム共有
│   └── settings.local.json    # 個人 (gitignore)
├── docs/
│   ├── PRD.md                 # アプリ全体 PRD
│   ├── decision-log.md        # ADR
│   ├── TODO.md
│   └── uncertainties.md
├── spec/                      # 機能別 SDD
│   └── _template/
│       ├── requirements.md
│       ├── design.md
│       └── tasks.md
├── knowhow/                   # 案件固有 Runbook
│   └── INDEX.md
├── tests/                     # 共通テスト置き場
│   └── _smoke/
├── _index/                    # 探索コスト削減用の派生インデックス (生成物)
│   └── concept-graph.json     # 全 md の keywords/related から自動生成 (CodeGraph)
├── _tmp/                      # 一時アウトプット (gitignore)
└── (言語/FW 別ソース)
```

## 役割

| ディレクトリ | 役割 |
|---|---|
| `docs/` | 製品 / プロジェクト全体の文書 |
| `spec/` | 機能 1 つにつき `requirements.md` / `design.md` / `tasks.md` を 1 セット |
| `knowhow/` | 「やってみて分かったこと」の Runbook (45_runbook/ の prj 版) |
| `tests/` | 言語 / FW の単体テスト以外 (E2E / integration / smoke) |
| `_tmp/` | discovery_report.json など一時生成物 |
| `_index/` | `concept-graph.json` (CodeGraph) 等の派生インデックス。手で編集しない。`80_commands/generate-concept-graph.mjs` で再生成 |

## spec/ の運用

```
spec/
├── _template/                 # 雛形 (70_templates/ から派生)
├── F01-auth-basic/
│   ├── requirements.md
│   ├── design.md
│   └── tasks.md
└── F02-search-fts/
    ├── requirements.md
    ├── design.md
    └── tasks.md
```

機能 ID は `F<NN>-<kebab>`。AC は `AC-<NN>` で番号付け、tasks のチェックボックスから AC を引用する (METHOD §4.1)。

## docs/ の運用

```
docs/
├── PRD.md                     # 全体 PRD (1 つだけ)
├── decision-log.md            # ADR スタイル
├── TODO.md                    # 軽量 TODO (PR/issue 化前の置き場)
├── uncertainties.md           # 未決事項
├── architecture.md (任意)
├── api.md (任意)
└── ops.md (任意)
```

## knowhow/INDEX.md

```
knowhow/
├── INDEX.md                   # 索引
└── <category>/
    └── <slug>.md              # 1 手続き 1 ファイル
```

```yaml
# 例: knowhow/INDEX.md
runbooks:
  - id: rb-001
    slug: setup/local-dev
    summary: ローカル開発環境のゼロからセットアップ
    last_verified: 2026-06-23
  - id: rb-002
    slug: deploy/staging-rollback
    summary: staging のロールバック
    last_verified: 2026-06-23
```

## tests/ の運用

```
tests/
├── _smoke/
│   └── health.spec.<ext>      # 起動 / 200 OK の最小確認
├── e2e/                       # browser / API 通し
├── integration/               # DB / ext 系
└── fixtures/
```

単体テストは言語慣習に従い source 隣接 (例: Go の `*_test.go`、Python の `tests/unit/`、TS の `*.test.ts`) に置く。`tests/` 配下は **越境系** に絞る。

## CLAUDE.md 雛形

```
# CLAUDE.md

このリポは ecc-method を取り込んでいる。

- Method 本体: ./ecc-method/METHOD.md
- 委任の起点: ./ecc-method/40_delegation/04_orchestrator-system-prompt.md
- Runbook 索引: ./knowhow/INDEX.md
- 環境制約: ./_tmp/constraint_report.yaml
```

## ファイル不在の判定

- `docs/PRD.md` が空 = 未着手 (許容)
- `spec/` が空 = SDD 未起動
- `knowhow/INDEX.md` が空 = bootstrap 直後 (許容)
- `_tmp/discovery_report.json` 不在 = Discovery 未完 (Phase 0 へ戻る)
- `_index/concept-graph.json` 不在 = CodeGraph 未生成 (`node 80_commands/generate-concept-graph.mjs` を実行)

## プロファイル別の追加

| プロファイル | 追加するディレクトリ |
|---|---|
| web | `src/`, `public/`, `tests/e2e/playwright.config.ts` |
| cli | `cmd/<name>/`, `internal/` |
| data | `notebooks/`, `data/` (gitignore), `dvc.yaml` (使うなら) |
| mobile | `lib/`, `assets/`, プラットフォーム別 (`ios/`, `android/`) |
| research | `notebooks/`, `figures/`, `data/` (gitignore) |

詳細は [04_profiles.md](./04_profiles.md)。

## 出典

- GitHub spec-kit (https://github.com/github/spec-kit, retrieved 2026-06-23)
- Anthropic Claude Code memory (CLAUDE.md) docs (https://code.claude.com/docs/en/memory, retrieved 2026-06-23)
- ADR (architecture decision records) (https://adr.github.io/, retrieved 2026-06-23)

## 不確実性

- spec / knowhow の命名は本パッケージの規約。既存リポの命名と衝突する場合は別名で運用可、ただし全章にわたる参照を一括置換すること。
- tests/ の越境系と単体系の境界は言語慣習で揺れる。プロファイルで上書き可能。
- monorepo 採用時は `apps/` `packages/` の上位構造が入る。各 app に本骨格を埋める。
