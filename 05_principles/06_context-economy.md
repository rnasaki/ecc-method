---
keywords: [principles, context, economy]
related: [05_principles/05_delegation-first.md, 05_principles/07_multi-llm-routing.md]
---
# 06 — Context Economy (コンテキスト経済 / 6 ルール)

主 context を希少資源として扱い、性能崩壊とコスト爆発を防ぐための 6 ルール。

## 1. 主 context を希少資源として扱う背景

### 1.1 性能劣化の発生源

LLM は context が埋まるほど earlier instruction の追従精度が落ち、誤答 / 忘却 / 一貫性低下が増える (BP-007 の根拠)。

### 1.2 コスト構造

- マルチエージェント運用は単一 chat の **約 15 倍** トークンを消費する (BP-009 出典)。
- prompt cache を使えば cache read は通常 input の **約 10%** コストで済む (BP-010)。
- 主 context を太らせるほど、後続全リクエストの input 単価が増える。

## 2. Context Economy の 6 ルール

### Rule 1: 関係ないタスク間で context を clear / compact する (BP-007)

```text
WRONG: 1 セッションで「機能 A 実装 → 機能 B 設計 → リリース文書 → デバッグ」を全部やる
RIGHT: タスク境界で /clear または compact を入れる
```

**判定基準**: 直前タスクの artifact が次タスクの参照に不要なら clear する。

### Rule 2: ファイル探索はサブエージェントに委任する (BP-008)

```text
主 Orchestrator は Read を直接呼ばない (例外: 確定した 1〜2 ファイル)。
ファイル探索 / 大量 grep は Explore に委任し、要約だけを主 context に取り込む。
```

**効果**: 主 context は要約 (数百 token) のみを抱える。フルファイル読み (数千〜数万 token) は subagent 内で完結し discard。

### Rule 3: 委任には出力上限を必ず付ける (BP-004 派生)

```yaml
delegation:
  expected_output:
    max_size: 1500 tokens   # 必須項目
```

**理由**: 出力上限なしで委任すると subagent が長文を返し、主 context が肥大化する。

### Rule 4: 永続情報は外部メモリに置く (BP-009 派生)

| 情報種別 | 配置 | 理由 |
|---|---|---|
| 全セッション必要な規約 | CLAUDE.md (短く) | 毎回読込まれる |
| 用途別手続き | Skill / Runbook | 呼ばれたときだけ context に乗る |
| 案件メタ | `45_runbook/INDEX.md` | grep で引ける |
| 大量データ | `_tmp/` 等の外部ファイル | 必要時だけ Read |

CLAUDE.md は容赦なく剪定する (BP-017): 各行に「削除したらモデルがミスする?」を問う。

### Rule 5: prompt cache breakpoint は不変ブロックの末尾に置く (BP-010)

```text
[system prompt: 5000 tokens]    ← 不変
[tool definitions: 2000 tokens] ← 不変
[KB 抜粋: 1500 tokens]          ← 不変
<<<< cache breakpoint <<<<      ← ここに置く
[per-request user input]        ← 可変
```

**アンチパターン**: timestamp や per-request 内容を cacheable 範囲に入れて cache hit ゼロにする。

### Rule 6: 事前ウォーミングで cache write 遅延を user に転嫁しない (BP-030)

レイテンシ重要なプロダクション環境では、ユーザー直前に `max_tokens=0` の no-op で cache を hot 状態にする。

## 3. 6 ルールのチェックリスト

タスク開始前 / セッション中に確認:

- [ ] 直近のタスクと関係ない context が残っていないか (Rule 1)
- [ ] 主 Orchestrator が Read で大量ファイルを抱えていないか (Rule 2)
- [ ] 委任契約に `max_size` があるか (Rule 3)
- [ ] CLAUDE.md は剪定済みか / Runbook で代替可能か (Rule 4)
- [ ] cache breakpoint は不変ブロック末尾か (Rule 5)
- [ ] レイテンシ重要なら pre-warm を仕込んだか (Rule 6)

## 4. context バジェット

タスク重要度別の context budget 目安:

| 重要度 | 委任出力上限 | 主 context 占有率 (目安) |
|---|---|---|
| 最重要 (PRD / arch / security) | 2000-3000 token | 主 context の 30% 以下 |
| 中 (実装 / レビュー / build-fix) | 800-1500 token | 主 context の 20% 以下 |
| 軽 (grep / docs lookup) | 200-500 token | 主 context の 5% 以下 |

主 context 占有率を超えそうなら subagent 側でさらに圧縮させる (要約 / JSON 構造化)。

## 5. 圧縮テクニック

### 5.1 構造化出力で圧縮

自然文より JSON / YAML で短く表現できる場合が多い。

```yaml
# 自然文 (約 80 token)
"認証関連のコードは src/auth/ にあり、login.ts と session.ts の 2 ファイル。
 login.ts は POST /login を処理し session.ts は cookie ベースのセッションを管理"

# 構造化 (約 35 token)
auth_module:
  path: src/auth/
  files:
    - { name: login.ts, role: "POST /login" }
    - { name: session.ts, role: "cookie session" }
```

### 5.2 参照渡し

ファイル全文ではなく path + 行番号を渡し、必要時に subagent が読む。

```text
WRONG: 主 context にファイル全文を抱える
RIGHT: 主 context は "{{repo_root}}/src/auth/login.ts:42-78 の処理" だけ抱える
```

### 5.3 要約の段階化

長文 doc は段階要約する:

```text
原文 10000 tokens
  → subagent A: 章別要約 2000 tokens
  → subagent B: 1 行要約 200 tokens
主 context は 200 token のみ取り込み、必要時に 2000 / 10000 を pull
```

## 6. アンチパターン (Kitchen Sink Session)

```text
1 セッションで:
  - 機能 A の PRD ドラフト
  - 機能 B のデバッグ
  - リリース文書執筆
  - 別案件のレビュー
を全部やる
```

**起きること**:
- 主 context が無関係 artifact で埋まる
- earlier instruction が忘却される
- コストが線形以上に膨らむ

**対処**: タスク境界で `/clear` または別セッションに分ける (Rule 1)。

## 7. context 経済と他原則の関係

| 関係先 | 連動内容 |
|---|---|
| 委任ファースト ([05](./05_delegation-first.md)) | 委任先の独立 context が主 context を温存する |
| ゼロ重複 ([45_runbook/](../45_runbook/)) | Runbook を grep して必要時のみ取り込み |
| Multi-LLM Routing ([07](./07_multi-llm-routing.md)) | 軽 = Haiku で context budget を節約 |
| Quality Gate ([60_quality-gates/](../60_quality-gates/)) | context budget 上限内かを gate チェック |

## 8. 関連 Best Practices

| BP-ID | 関連性 |
|---|---|
| BP-007 | 主 context は希少資源 |
| BP-008 | ファイル探索の委任 |
| BP-009 | マルチエージェント ~15x token |
| BP-010 | prompt cache breakpoint |
| BP-016 | CLAUDE.md と Skills の使い分け |
| BP-017 | CLAUDE.md 剪定 |
| BP-030 | cache 事前ウォーミング |

## 出典

- Anthropic Claude Code Best Practices: https://code.claude.com/docs/en/best-practices (retrieved_at: 2026-06-23)
- Anthropic prompt-caching: https://platform.claude.com/docs/en/docs/build-with-claude/prompt-caching (retrieved_at: 2026-06-23)
- Anthropic Engineering, Built multi-agent research system: https://www.anthropic.com/engineering/built-multi-agent-research-system (retrieved_at: 2026-06-23)
- Anthropic Claude Code Skills: https://code.claude.com/docs/en/skills (retrieved_at: 2026-06-23)
- best_practices.json BP-007..010, BP-016, BP-017, BP-030 (`./05_principles/_data/best_practices.json`)

## 不確実性

- 「~15 倍」「~10%」等の数値は出典の引用。本パッケージで再計測したものではない (出典記載のまま)。
- 第 4 章の context budget 目安は経験則。実モデル / 実タスクで調整が必要 (未検証)。
- prompt cache breakpoint の最適配置は API バージョンと共に変動する可能性がある。四半期再検証が前提。
