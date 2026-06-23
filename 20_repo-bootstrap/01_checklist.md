# 20-01 — Bootstrap Checklist (順序付き)

新規リポ立ち上げ時に **同じ順番で** 実行する初期化チェックリスト。プロファイルは [04_profiles.md](./04_profiles.md) で選定する。

## 全体フロー

```
[Discovery] → [Profile 選定] → [雛形展開] → [環境セット] → [初期コミット] → [SDD 起点]
```

## チェックリスト

### Phase 0: Discovery (前提)

- [ ] `10_discovery/01_repo-recon.md` を実行 (既存リポなら必須)
- [ ] `10_discovery/02_domain-elicitation.md` でゴール / ユーザー / 制約を取得
- [ ] `10_discovery/03_stack-inference.md` で stack_proposal を生成
- [ ] `10_discovery/04_constraint-mapping.md` で constraint_report を生成
- [ ] `_tmp/discovery_report.json`, `_tmp/elicitation_result.yaml`, `_tmp/stack_proposal.yaml`, `_tmp/constraint_report.yaml` が揃っている

### Phase 1: Profile 選定

- [ ] `04_profiles.md` から 1 つ選ぶ (web | cli | data | mobile | research)
- [ ] 補助プロファイル (ai-native / monorepo) を要否判定
- [ ] 選定理由を `docs/decision-log.md` に追記

### Phase 2: ディレクトリ雛形

- [ ] `02_directory-skeleton.md` の雛形を展開
- [ ] `spec/`, `docs/`, `knowhow/`, `tests/` を作成
- [ ] `README.md` 雛形を生成 (1 段落のゴール記述のみ)
- [ ] `LICENSE` を選定 (案件方針に従う、不明なら未定義のまま)

### Phase 3: gitignore / 基本設定

- [ ] `03_gitignore-baseline.md` から共通 ignore を `.gitignore` に流し込み
- [ ] `.env.example` を生成 (key 一覧、値は空)
- [ ] `.editorconfig` を生成 (UTF-8 / LF / 4 spaces 既定、言語別差分を許容)
- [ ] `.gitattributes` で改行 / バイナリ判定を整える

### Phase 4: 環境セット

- [ ] `15_environment/01_capabilities-matrix.md` のギャップを潰す
- [ ] `15_environment/02_cli-arsenal.md` から必要 CLI を導入
- [ ] `15_environment/04_mcp-server-bootstrap.md` で MCP を導入
- [ ] `15_environment/05_credentials-vault.md` の方針で secret を配置
- [ ] `15_environment/06_corporate-network.md` (該当時のみ) で proxy / CA を整える
- [ ] `15_environment/07_permission-delegation.md` の段階 1 (Restricted) で開始

### Phase 5: 言語 / FW 初期化

プロファイル別の標準コマンドを実行 ([04_profiles.md](./04_profiles.md))。例:

- web (next.js): `pnpm dlx create-next-app@latest --ts --eslint --app --src-dir`
- cli (go): `go mod init <module>` + `cmd/<name>/main.go`
- data (python): `uv init` + `uv add pandas duckdb`
- mobile (flutter): `flutter create <name>`
- research (python): `uv init --no-readme` + `uv add jupyter`

### Phase 6: テスト基盤

- [ ] テスト FW を選定 (vitest / pytest / go test / cargo test 等)
- [ ] `tests/` 雛形に hello world テストを置く
- [ ] CI で 1 回実行できることを確認 (`70_templates/ci.template.yml` 等)

### Phase 7: ECC 初期化

- [ ] `.claude/settings.json` を生成 (チーム共有部分)
- [ ] `.claude/settings.local.json` を Restricted で生成
- [ ] `40_delegation/04_orchestrator-system-prompt.md` を `CLAUDE.md` 等にリンクで参照
- [ ] `45_runbook/INDEX.md` を空 INDEX で初期化
- [ ] `docs/decision-log.md` を生成 (ADR フォーマット)

### Phase 8: 初期コミット

- [ ] `gitleaks detect --no-git` で secret 0 件を確認
- [ ] `git add -A`
- [ ] `git commit -m "chore: bootstrap repo via ecc-method"`
- [ ] (リモート作成済みなら) `git push -u origin main`

### Phase 9: SDD 起点へ移行

- [ ] `30_sdd-phase/` の手順で PRD ドラフトを開始
- [ ] Pattern P-001 (SDD 起点) を起動: planner + architect 並列
- [ ] requirements.md → design.md → tasks.md の順で書き起こす

## 完了判定

- [ ] Phase 0〜8 のチェックボックスが全て埋まっている
- [ ] `docs/decision-log.md` に「bootstrap 完了」エントリ
- [ ] `45_runbook/INDEX.md` に bootstrap 中の手続きを最低 3 件登録 (再現性確保)

## 失敗時の挙動

| 失敗 | 対応 |
|---|---|
| Discovery 未完で Phase 1 へ進めない | 先に Discovery を完了 |
| 言語初期化コマンド失敗 | `15_environment/06_corporate-network.md` を確認 (proxy / CA) |
| secret 検出 | `15_environment/05_credentials-vault.md` の rotate 手順 |
| Permission preset で頻繁に ask | 段階 1 → 2 へ昇格を検討 |

## 出典

- GitHub spec-kit (https://github.com/github/spec-kit, retrieved 2026-06-23)
- Anthropic Claude Code docs (https://code.claude.com/docs/en, retrieved 2026-06-23)
- Trunk-Based Development (https://trunkbaseddevelopment.com/, retrieved 2026-06-23)

## 不確実性

- 各 Phase の完了判定はプロファイル次第で粒度が違う。本章は最大公約数。
- Phase 5 のコマンドは生態系の変化で書き換わる。四半期 radar で検証。
- Phase 7 の `.claude/*.json` 構造は ECC version で拡張される可能性。
