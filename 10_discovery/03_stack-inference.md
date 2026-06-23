# 10-03 — Stack Inference (ユースケース → 技術スタック推論)

ユースケースとユーザー回答 ([02_domain-elicitation.md](./02_domain-elicitation.md)) から、初期技術スタック候補を機械的に絞り込むためのルール集。

## 目的

- 「どの DB / FW / 言語を使うか」を **エージェントが先に提案** し、ユーザーは承認・修正のみで進めるようにする。
- 特定の流行スタックに固定せず、ユースケース別に既定値を持つ。
- 提案はあくまで初期値。最終決定は architect エージェントの設計レビューを通す。

## 入力

```yaml
inputs:
  primary_role: <user_role>
  scale: <users_concurrent>
  data_class: <public|internal|confidential|regulated>
  deploy_target: <cloud-public|cloud-private|on-prem|edge|hybrid>
  budget_monthly: <usd>
  feature_kind: <web|cli|data|mobile|research|service|hybrid>
  team_size: <int>
  realtime: <bool>
  ai_native: <bool>             # LLM が中核機能か
```

## 出力

```yaml
stack_proposal:
  language: <primary_lang>
  runtime: <node|python|jvm|go|rust|...>
  web_framework: <string?>
  api_style: <rest|graphql|grpc|rpc|none>
  data_store:
    primary: <postgres|mysql|sqlite|firestore|dynamodb|...>
    cache: <redis|memcached|none>
    search: <opensearch|meilisearch|pgvector|none>
    vector: <pgvector|qdrant|chromadb|none>
  queue: <none|redis|sqs|cloud-tasks|kafka>
  auth: <none|oauth|oidc|saml|magic-link>
  hosting: <vercel|railway|fly|cloud-run|aks|eks|gke|self-host>
  ci: <github-actions|gitlab-ci|circleci>
  observability: { logs, metrics, traces }
  rationale: <string>
```

## ルール (主要パターン)

### Rule R-W1: Web SaaS (small)

```
if feature_kind == web and scale < 1k and budget < $100/mo
then propose:
  language: typescript
  runtime: node
  web_framework: next.js
  data_store.primary: postgres (managed)
  hosting: vercel + supabase
  rationale: "小規模 SaaS の標準構成。managed DB と PaaS で運用コスト最小化"
```

### Rule R-W2: Web SaaS (medium-large)

```
if feature_kind == web and 1k <= scale < 100k
then propose:
  language: typescript or python
  data_store.primary: postgres (managed) + redis cache
  hosting: cloud-run | fly.io | aks
  observability: opentelemetry + managed metrics backend
```

### Rule R-D1: Data pipeline

```
if feature_kind == data
then propose:
  language: python
  runtime: uv (lockfile)
  primary_libs: [pandas | polars, duckdb]
  orchestrator: prefect | dagster | airflow (規模で選定)
  data_store.primary: postgres or duckdb (volume で選定)
  warehouse: bigquery | snowflake (volume > 100GB)
```

### Rule R-M1: Mobile

```
if feature_kind == mobile and team_size <= 3
then propose:
  framework: flutter
  language: dart
  backend: firebase | supabase
  rationale: "小規模チーム + 両 OS 対応で flutter 既定"

if feature_kind == mobile and team_size > 3 and platform == ios-only
then propose:
  framework: swiftui
  language: swift
```

### Rule R-C1: CLI tool

```
if feature_kind == cli
then propose:
  language: go or rust (single binary 配布)
  alt: python + uv (内部利用のみ)
  config: viper | clap (該当言語)
  ci: github-actions + goreleaser | cargo-dist
```

### Rule R-AI1: AI-native (LLM 中核)

```
if ai_native == true
then add:
  ai_provider: anthropic claude | openai (重要度別ルーティング)
  vector: pgvector (small) | qdrant (medium+)
  agent_runtime: claude code agents | openai agents sdk | langgraph
  rationale: "ECC native の agents 機能を最優先 (Layer 0 で完結する)"
```

### Rule R-R1: Research / one-shot

```
if feature_kind == research
then propose:
  language: python (jupyter)
  runtime: uv with pyproject
  data_store: sqlite | duckdb (local)
  ci: optional
  rationale: "再現性重視。重い CI/CD は導入しない"
```

## 制約による補正

```
if data_class in [confidential, regulated]:
  hosting -= [vercel, railway]    # public PaaS から外す
  add: hosting in [cloud-private, on-prem, hybrid]
  add: encryption at rest required
  add: audit log required

if compliance == HIPAA:
  add: BAA 締結可能なベンダのみ
  add: PHI 取り扱いゾーン分離

if deploy_target == edge:
  language preferred: rust | go
  remove: jvm (起動時間)
```

## 提案の検証

stack_proposal は architect エージェントに 1 ラウンドだけ反論を取る (Pattern P-003 の簡易版):

```
1. inference エンジン (このルール) → proposal_v1
2. architect → 反論 + 代替案
3. orchestrator が rationale で統合 → proposal_final
4. ユーザーに提示 (差分とトレードオフを併記)
```

## 出力先

`{{repo_root}}/_tmp/stack_proposal.yaml`

## 既定値の更新

四半期ごとに [75_self-evolution/05_industry-radar.md](../75_self-evolution/05_industry-radar.md) でルール R-* の有効性を再評価する。

## 出典

- Anthropic Claude Code Sub-agents docs (https://code.claude.com/docs/en/sub-agents, retrieved 2026-06-23)
- Vercel Next.js docs (https://nextjs.org/docs, retrieved 2026-06-23)
- Astral uv docs (https://docs.astral.sh/uv/, retrieved 2026-06-23)
- Flutter docs (https://docs.flutter.dev/, retrieved 2026-06-23)

## 不確実性

- 提案ルールは 2026-06-23 時点の生態系を前提とする。FW / hosting の優位性は 6〜12 ヶ月で変動する。
- budget_monthly の閾値はおおまかな目安で、機能要件で大きくずれる。
- AI-native ルールは LLM API 価格・モデル能力で変動する。`05_principles/07_multi-llm-routing.md` の routing と整合させること。
