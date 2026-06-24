---
keywords: [repo-bootstrap, gitignore, baseline]
related: []
---
# 20-03 — .gitignore Baseline

全プロジェクト共通の `.gitignore` 雛形。secret / 一時生成物 / IDE 固有を確実に弾く。

## 設計

- 言語横断の共通エントリを上段に
- 言語 / FW 固有を下段に追記
- ECC / 本パッケージ固有を末尾に
- 既存 `.gitignore` がある場合は **mergeb** する (上書きしない)

## 共通ベース

```gitignore
# ───── secrets ────────────────────────────────
.env
.env.*
!.env.example
.envrc
.secrets/
*.pem
*.key
*.p12
*.pfx
.codex/
**/credentials.json
**/serviceAccountKey*.json

# ───── OS ─────────────────────────────────────
.DS_Store
Thumbs.db
desktop.ini
ehthumbs.db
Icon?

# ───── editor / IDE ───────────────────────────
.idea/
.vscode/
!.vscode/settings.json.example
*.swp
*.swo
*~
.history/

# ───── logs ───────────────────────────────────
*.log
logs/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# ───── coverage / reports ─────────────────────
coverage/
.coverage
.coverage.*
htmlcov/
.pytest_cache/
.tox/
.mypy_cache/
.ruff_cache/
junit.xml
test-results/
playwright-report/
playwright/.cache/

# ───── build artifacts ────────────────────────
dist/
build/
out/
*.egg-info/
target/
bin/
obj/

# ───── tmp / cache ────────────────────────────
_tmp/
tmp/
.cache/
.parcel-cache/
.next/
.nuxt/
.turbo/
.svelte-kit/
.vite/

# ───── ECC / claude ───────────────────────────
.claude/settings.local.json
.claude/projects/
.claude/sessions/

# ───── package managers ───────────────────────
node_modules/
.pnpm-store/
.npm/
.yarn/cache/
.yarn/install-state.gz
.yarn/build-state.yml
__pycache__/
*.pyc
.venv/
venv/
.uv/

# ───── data (案件で許容判断) ──────────────────
data/raw/
data/intermediate/
*.sqlite
*.db
*.duckdb
```

## 言語別追記

### TypeScript / Node

```gitignore
*.tsbuildinfo
.eslintcache
.stylelintcache
```

### Python

```gitignore
*.pyo
*.pyd
.pytype/
.python-version
poetry.lock                  # commit するなら除外しない (要件次第)
```

### Go

```gitignore
vendor/
*.test
*.out
```

### Rust

```gitignore
target/
**/*.rs.bk
Cargo.lock                   # binary crate は commit、library crate は除外 (公式推奨)
```

### Java / Kotlin / Gradle

```gitignore
.gradle/
build/
!gradle/wrapper/gradle-wrapper.jar
out/
*.class
hs_err_pid*
```

### Swift / Xcode

```gitignore
.build/
xcuserdata/
*.xcworkspace/xcuserdata/
DerivedData/
.swiftpm/
Pods/
```

### Flutter / Dart

```gitignore
.dart_tool/
.flutter-plugins
.flutter-plugins-dependencies
.packages
.pub-cache/
.pub/
build/
ios/Flutter/Flutter.framework
ios/Flutter/Flutter.podspec
```

### Docker

```gitignore
*.pid
.docker/
```

### Terraform

```gitignore
.terraform/
*.tfstate
*.tfstate.*
*.tfvars
!example.tfvars
crash.log
```

### IaC その他

```gitignore
.serverless/
.cdk.out/
cdk.out/
.pulumi/
```

## 機微情報の冗長除外

万一の secret 漏れを防ぐため、以下を **追加で** 末尾に置く:

```gitignore
# defense-in-depth secret guard
*token*
*secret*
*password*
!**/secret*.example
!**/*.secret.tpl
```

ただし誤一致 (ファイル名に "secret" を含む正当なファイル) を起こしうるため、`!` 例外で必要分だけ救う。

## マージ手順

```
1. {{repo_root}}/.gitignore が存在するか確認
2. 存在しなければ本章を貼り付け
3. 存在するなら:
   - 上段 (secrets) を冒頭に挿入
   - 重複行を除去
   - 言語別エントリを該当言語のみ追記
4. gitleaks detect --no-git で 0 件確認
```

## 検証

```
1. `git check-ignore -v <path>` で意図通り無視されているか確認
2. `.env.local` を作成して `git status` に出ないことを確認
3. `_tmp/test.txt` を作成して同上
4. `.env.example` が `git status` に出ることを確認 (! 例外が効いている)
```

## 出典

- GitHub gitignore templates (https://github.com/github/gitignore, retrieved 2026-06-23)
- Anthropic Claude Code Settings (https://code.claude.com/docs/en/settings, retrieved 2026-06-23)
- The Rust Programming Language: Cargo.lock (https://doc.rust-lang.org/cargo/guide/cargo-toml-vs-cargo-lock.html, retrieved 2026-06-23)

## 不確実性

- `Cargo.lock` の commit 是非はクレートの種別 (binary / library) で異なる。要件で確定する。
- `poetry.lock` / `package-lock.json` 等の lockfile は CI 戦略で扱いが分かれる。
- defense-in-depth の `*token*` 等は誤一致リスクあり。運用で `!` 例外を継続メンテ。
