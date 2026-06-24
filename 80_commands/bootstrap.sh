#!/usr/bin/env bash
# ecc-method/80_commands/bootstrap.sh
#
# 新規リポを ecc-method 規約で初期化するためのスクリプト。
# - 冪等 (二回流しても破綻しない)
# - PATH POLICY: 絶対パス禁止。${PROJECT_ROOT} 経由の相対参照のみ
# - 個人・組織情報を含めない (再配布可能)
#
# Usage:
#   bash ecc-method/80_commands/bootstrap.sh --profile=web|cli|data|mobile|research [--root=PATH] [--dry-run]
#
# retrieved_at: 2026-06-23

set -euo pipefail

# ----- 1) パラメタ解釈 ------------------------------------------------------

PROFILE=""
PROJECT_ROOT=""
DRY_RUN="0"

usage() {
  cat <<'USAGE'
Usage:
  bash ecc-method/80_commands/bootstrap.sh \
       --profile=web|cli|data|mobile|research \
       [--root=PATH] \
       [--dry-run]

Options:
  --profile=NAME   配置プロファイル (必須: web | cli | data | mobile | research)
  --root=PATH      配置先ルート (既定: カレント)
  --dry-run        実際には作成せず計画のみ表示
USAGE
}

for arg in "$@"; do
  case "$arg" in
    --profile=*)
      PROFILE="${arg#*=}"
      ;;
    --root=*)
      PROJECT_ROOT="${arg#*=}"
      ;;
    --dry-run)
      DRY_RUN="1"
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "[bootstrap] unknown arg: ${arg}" >&2
      usage
      exit 2
      ;;
  esac
done

if [ -z "${PROFILE}" ]; then
  echo "[bootstrap] --profile is required" >&2
  usage
  exit 2
fi

case "${PROFILE}" in
  web|cli|data|mobile|research) ;;
  *)
    echo "[bootstrap] unsupported profile: ${PROFILE}" >&2
    usage
    exit 2
    ;;
esac

# PROJECT_ROOT 既定はカレント。絶対パスでも与えられたものをそのまま使う
if [ -z "${PROJECT_ROOT}" ]; then
  PROJECT_ROOT="$(pwd)"
fi

# 以降の操作はすべて ${PROJECT_ROOT} 配下の相対参照に閉じる
cd "${PROJECT_ROOT}"

# ----- 2) ヘルパ ------------------------------------------------------------

ACTIONS_LOG=""

log_action() {
  local msg="$1"
  ACTIONS_LOG="${ACTIONS_LOG}${msg}"$'\n'
  echo "[bootstrap] ${msg}"
}

ensure_dir() {
  # 冪等: 既存ならスキップ
  local rel="$1"
  if [ -d "${rel}" ]; then
    log_action "skip dir (exists): ${rel}"
    return 0
  fi
  if [ "${DRY_RUN}" = "1" ]; then
    log_action "would mkdir: ${rel}"
  else
    mkdir -p "${rel}"
    log_action "mkdir: ${rel}"
  fi
}

ensure_file() {
  # 冪等: 既存ならスキップ。既存破壊しない
  local rel="$1"
  local content="$2"
  if [ -e "${rel}" ]; then
    log_action "skip file (exists): ${rel}"
    return 0
  fi
  if [ "${DRY_RUN}" = "1" ]; then
    log_action "would create: ${rel}"
  else
    # ディレクトリ部を確保
    local dir
    dir="$(dirname "${rel}")"
    [ "${dir}" = "." ] || mkdir -p "${dir}"
    printf '%s\n' "${content}" > "${rel}"
    log_action "create: ${rel}"
  fi
}

# ----- 3) 共通ディレクトリ --------------------------------------------------

COMMON_DIRS=(
  "docs"
  "docs/prd"
  "docs/requirements"
  "docs/design"
  "docs/tasks"
  "tests"
  ".tmp"
  "_index"
)

for d in "${COMMON_DIRS[@]}"; do
  ensure_dir "${d}"
done

# ----- 4) プロファイル別ディレクトリ ----------------------------------------

case "${PROFILE}" in
  web)
    PROFILE_DIRS=("app" "app/components" "app/lib" "api" "api/handlers" "tests/unit" "tests/integration" "tests/e2e")
    ;;
  cli)
    PROFILE_DIRS=("cmd" "internal" "internal/config" "tests/unit" "tests/integration")
    ;;
  data)
    PROFILE_DIRS=("pipelines" "pipelines/etl" "notebooks" "data" "data/raw" "data/processed" "tests/unit" "tests/integration")
    ;;
  mobile)
    PROFILE_DIRS=("app" "app/screens" "app/components" "platform" "platform/ios" "platform/android" "tests/unit" "tests/integration")
    ;;
  research)
    PROFILE_DIRS=("experiments" "experiments/baselines" "notes" "data" "data/raw" "tests/unit")
    ;;
esac

for d in "${PROFILE_DIRS[@]}"; do
  ensure_dir "${d}"
done

# ----- 5) .gitignore 雛形 ---------------------------------------------------

GITIGNORE_CONTENT=$(cat <<'GITIGNORE'
# ecc-method generated .gitignore (initial template)
# 案件で必要に応じて追記すること

# Logs / temporary
.tmp/
*.log
npm-debug.log*
yarn-debug.log*

# OS / editor
.DS_Store
Thumbs.db
.vscode/
.idea/

# Secrets (NEVER commit)
.env
.env.*
!.env.example

# Build artifacts
dist/
build/
out/
*.exe
*.o

# Language ecosystems (一般的なもの)
node_modules/
__pycache__/
*.py[cod]
.venv/
target/
.gradle/
.dart_tool/

# Coverage
coverage/
.coverage
*.lcov

# Notebooks の checkpoints
.ipynb_checkpoints/
GITIGNORE
)

ensure_file ".gitignore" "${GITIGNORE_CONTENT}"

# ----- 6) .env.example 雛形 -------------------------------------------------

ENV_EXAMPLE_CONTENT=$(cat <<'ENVEXAMPLE'
# ecc-method generated .env.example
# 実値は .env (コミット禁止) に記載すること
# 個人・組織固有の値はリポにコミットしない

# 例:
# APP_ENV=development
# LOG_LEVEL=info
# API_BASE_URL=
# DB_URL=
ENVEXAMPLE
)

ensure_file ".env.example" "${ENV_EXAMPLE_CONTENT}"

# ----- 7) docs/ プレースホルダ ---------------------------------------------

DOCS_README=$(cat <<'DOCSREADME'
# docs/

ecc-method 規約に従う成果物の置き場。

- `prd/`         — Product Requirements Document
- `requirements/` — Given/When/Then で書く受入基準
- `design/`      — アーキテクチャ・データ・API・エージェント設計
- `tasks/`       — design を順序付き実装単位に分解

雛形は `ecc-method/70_templates/` を参照。
DOCSREADME
)

ensure_file "docs/README.md" "${DOCS_README}"

# ----- 7.5) _index/ プレースホルダ + CodeGraph 自動生成 (任意) ---------------

INDEX_README=$(cat <<'INDEXREADME'
# _index/

探索コスト削減用の派生インデックス置き場。手で編集しない。

- `concept-graph.json` — 全 md の `keywords:` / `related:` frontmatter から自動生成
- 再生成: `node ecc-method/80_commands/generate-keywords-frontmatter.mjs && node ecc-method/80_commands/generate-concept-graph.mjs`

詳細は `ecc-method/_index/README.md` を参照。
INDEXREADME
)

ensure_file "_index/README.md" "${INDEX_README}"

# CodeGraph を初期生成 (node があれば実行、無ければ警告のみ)
ECC_METHOD_DIR=""
for cand in "ecc-method" "../ecc-method" ".ecc-method"; do
  if [ -f "${cand}/80_commands/generate-concept-graph.mjs" ]; then
    ECC_METHOD_DIR="${cand}"
    break
  fi
done

if [ -n "${ECC_METHOD_DIR}" ] && command -v node >/dev/null 2>&1; then
  if [ "${DRY_RUN}" = "1" ]; then
    log_action "would run: node ${ECC_METHOD_DIR}/80_commands/generate-keywords-frontmatter.mjs"
    log_action "would run: node ${ECC_METHOD_DIR}/80_commands/generate-concept-graph.mjs"
  else
    log_action "run: generate-keywords-frontmatter.mjs"
    node "${ECC_METHOD_DIR}/80_commands/generate-keywords-frontmatter.mjs" || log_action "warn: generate-keywords-frontmatter failed (non-fatal)"
    log_action "run: generate-concept-graph.mjs"
    node "${ECC_METHOD_DIR}/80_commands/generate-concept-graph.mjs" || log_action "warn: generate-concept-graph failed (non-fatal)"
  fi
else
  log_action "skip CodeGraph: node or ecc-method/ not found (run generators manually later)"
fi

# ----- 8) サマリ ------------------------------------------------------------

echo ""
echo "[bootstrap] profile=${PROFILE} root=${PROJECT_ROOT} dry_run=${DRY_RUN}"
echo "[bootstrap] done."
echo ""
echo "Next steps:"
echo "  1. ecc-method/10_discovery/ を実行"
echo "  2. ecc-method/30_sdd-phase/ で PRD → requirements → design → tasks"
echo "  3. ecc-method/35_tdd-phase/ で TDD ループ"
echo "  4. ecc-method/45_runbook/INDEX.md を案件用に更新"
echo "  5. ドキュメント追加・改名後は CodeGraph 再生成: node ecc-method/80_commands/generate-keywords-frontmatter.mjs && node ecc-method/80_commands/generate-concept-graph.mjs"

exit 0
