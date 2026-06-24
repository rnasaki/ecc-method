---
keywords: [discovery, repo, recon]
related: [40_delegation/02_routing-rubric.md, 20_repo-bootstrap/03_gitignore-baseline.md, 20_repo-bootstrap/04_profiles.md]
---
# 10-01 — Repo Recon (既存リポ走査)

未知リポを引き継いだ際、人間に質問する前に **エージェントが自動で取得すべき事実** を定義する。Pattern P-004 (Discovery) の実体。

## 目的

- 言語 / FW / CI / test 体系 / secret 検出を `_tmp/discovery_report.json` に集約する。
- ユーザーへの質問を **同一質問の二度尋ね禁止** ([45_runbook/](../45_runbook/)) に倣い、自動取得可能な事実は自動で取る。
- 取得結果は Bootstrap ([20_repo-bootstrap/](../20_repo-bootstrap/)) と SDD 起点 ([30_sdd-phase/](../30_sdd-phase/)) の入力になる。

## 取得対象 (Recon Schema)

```yaml
recon_report:
  meta:
    repo_root: <path>          # {{repo_root}} で参照
    retrieved_at: 2026-06-23
    scanner_version: 1.0
  languages:
    - { name: <string>, files: <int>, loc: <int>, primary: bool }
  frameworks:
    web: [<string>]            # next | nuxt | django | rails | spring ...
    mobile: [<string>]         # flutter | swift | kotlin ...
    data: [<string>]           # pandas | spark | dbt ...
  package_managers:
    - { tool: <npm|pnpm|uv|poetry|cargo|gradle|...>, lockfile: <path> }
  build_tools:
    - { tool: <make|just|nx|turbo|...>, config: <path> }
  ci:
    - { provider: <github-actions|gitlab|circle|...>, files: [<path>] }
  test_frameworks:
    - { framework: <pytest|vitest|jest|junit|...>, coverage_config: <path?> }
  containerization:
    - { tool: docker|compose|k8s, files: [<path>] }
  iac:
    - { tool: terraform|pulumi|cdk, files: [<path>] }
  secrets_scan:
    findings: <int>
    high_severity: <int>
    detector: <gitleaks|trufflehog|builtin>
  entry_points:
    - { kind: cli|server|service, path: <string>, command: <string> }
  docs:
    readme: <path?>
    adr_dir: <path?>
    spec_dir: <path?>
  vcs:
    default_branch: <string>
    contributors_unique: <int>
    last_commit: <ISO8601>
```

## 検出ヒューリスティクス

### 言語

| 検出ファイル | 言語推定 |
|---|---|
| `package.json`, `tsconfig.json`, `*.ts`, `*.tsx` | TypeScript |
| `pyproject.toml`, `requirements.txt`, `*.py` | Python |
| `go.mod`, `*.go` | Go |
| `Cargo.toml`, `*.rs` | Rust |
| `pom.xml`, `build.gradle`, `*.java` | Java |
| `*.kt`, `build.gradle.kts` | Kotlin |
| `Package.swift`, `*.swift` | Swift |
| `*.csproj`, `*.cs` | C# |
| `pubspec.yaml`, `*.dart` | Dart / Flutter |

primary 判定は LOC 上位 1 件。

### Framework

`package.json` の dependencies / `pyproject.toml` の dependencies / `Gemfile` 等を grep して以下を検出:

- next | nuxt | astro | remix | svelte-kit
- express | fastapi | django | flask | rails | spring-boot | quarkus | gin | actix
- flutter | react-native | jetpack-compose | swiftui

### CI

| パス | provider |
|---|---|
| `.github/workflows/*.yml` | github-actions |
| `.gitlab-ci.yml` | gitlab |
| `.circleci/config.yml` | circleci |
| `azure-pipelines.yml` | azure-devops |
| `Jenkinsfile` | jenkins |

### Secret Scan

優先順:

1. `gitleaks detect --no-git --redact` (CLI 在庫があれば)
2. `trufflehog filesystem .` (代替)
3. ビルトイン正規表現 (最終手段): `AKIA[0-9A-Z]{16}`, `ghp_[A-Za-z0-9]{36}`, `xox[baprs]-[A-Za-z0-9-]+`, `-----BEGIN .* PRIVATE KEY-----`, `sk-[A-Za-z0-9]{20,}`

## 実行プロトコル (P-004 適用)

```
1. 並列 dispatch:
   - codebase-onboarding (skill)         # 全体構造
   - Explore (quick): 言語/FW 検出       # languages + frameworks
   - Explore (medium): CI/test 検出      # ci + test_frameworks
   - Explore (medium): secret 検出       # secrets_scan
2. synthesizer (orchestrator) が JSON に統合
3. agent-evaluator が completeness を判定
4. 不足あれば追加 Explore を 1 round 投げる
5. {{repo_root}}/_tmp/discovery_report.json に保存
```

並列起動ルール ([40_delegation/02_routing-rubric.md](../40_delegation/02_routing-rubric.md)) に従い、独立タスクは同一メッセージで送る。

## 出力先

- 標準: `{{repo_root}}/_tmp/discovery_report.json`
- gitignore 必須 ([20_repo-bootstrap/03_gitignore-baseline.md](../20_repo-bootstrap/03_gitignore-baseline.md))。

## 質問前ガード

ユーザーに質問する前に必ず確認する:

- [ ] 言語は recon で確定したか
- [ ] FW は recon で確定したか
- [ ] CI 有無は recon で確定したか
- [ ] secret findings 0 件か (1 件でも HIGH があれば Quality Gate で停止)

確定済みの事項を再質問してはならない (BP-018: ゼロ重複)。

## 失敗時の挙動

- 言語が複数候補で primary 確定不能 → ユーザーに 1 度だけ確認、結果を Runbook 化。
- secret HIGH findings 検出 → 即停止し security-reviewer に escalate ([60_quality-gates/](../60_quality-gates/))。
- リポが空 / 履歴 0 → bootstrap profile 選定 ([20_repo-bootstrap/04_profiles.md](../20_repo-bootstrap/04_profiles.md)) へ分岐。

## 出典

- Anthropic Claude Code Sub-agents docs (https://code.claude.com/docs/en/sub-agents, retrieved 2026-06-23)
- Anthropic Engineering: Built multi-agent research system (https://www.anthropic.com/engineering/built-multi-agent-research-system, retrieved 2026-06-23)
- gitleaks (https://github.com/gitleaks/gitleaks, retrieved 2026-06-23)
- trufflehog (https://github.com/trufflesecurity/trufflehog, retrieved 2026-06-23)

## 不確実性

- ヒューリスティクスはモノレポ / 多言語混在で誤判定する可能性あり。primary 判定が拮抗 (LOC 比 < 1.5x) の場合は両方を primary 扱いとする。
- secret 検出はビルトイン正規表現フォールバック時に false negative がありうる。可能な限り gitleaks/trufflehog を導入する。
- recon_report のスキーマは v1.0。フィールド追加時は scanner_version を上げる。
