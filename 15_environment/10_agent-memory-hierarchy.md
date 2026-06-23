# 15-10 — Agent Memory Hierarchy (Episodic / Semantic / Procedural)

長時間自律 agent が「過去から学ぶ」「ドメイン知識を保持する」「手順を自律学習する」ために、agent memory を **3 層** で扱う。本ファイルは [08_session-persistence.md](./08_session-persistence.md) の **session 継続** とは役割が異なり、**agent learning** の側を扱う。

> 役割分離: `08_session-persistence.md` (L1〜L4) は「中断したセッションを再開する」ための context 永続化。本ファイルは「セッションを跨いで agent が事実・手順を蓄積し再利用する」ための memory 設計。

---

## 1. なぜ memory 階層が必要か

short-lived な single-turn では context window 内で完結するが、long-running agent は次の三点で限界に当たる。

- **context window overflow**: 全履歴を載せると active context が肥大化する。Anthropic は「rather than loading all relevant information upfront, agents store what they learn in memory and pull it back on demand」を memory tool の主目的としている [1]。
- **cross-session learning の断絶**: session 終了で in-context 学習が消える。Claude Code の auto memory も「Each Claude Code session begins with a fresh context window」を前提とする [2]。
- **失敗→再現の繰り返し**: 同じ修正を毎回会話で渡す状況を解消するため、CLAUDE.md と auto memory が補完的に提供されている [2]。

このため agent memory は **役割の異なる 3 層** に分けて運用する。

---

## 2. 3 層分類

| 層 | 何を保持するか | 用途 |
|---|---|---|
| Episodic | 過去 run のログ・対話・決定 | 類似タスク再現・原因分析 |
| Semantic | ドメイン事実・用語・関係 | 事実の参照・整合性チェック |
| Procedural | 手順・成功パターン・lint 規則 | 再利用可能な手続き呼び出し |

> 注: Anthropic の memory tool 公式ページは episodic/semantic/procedural という 3 分類語を直接は使っておらず、`/memories` ディレクトリ配下の任意ファイルを agent が CRUD する設計である [1]。本節の 3 分類は実装上の整理であり、いずれも memory tool / auto memory / Sessions のどれかに mapping して保管する。

### 2.1 Episodic memory

- **用途**: 過去 run の入力・観察・決定・結果を意味検索で取り出す。
- **書込みトリガ**: run 終了時 (success / fail 双方)、`/compact` 直前のチェックポイント。OpenAI Agents SDK の Sessions は「After each run: All new items generated during the run...are automatically stored in the session」と明記し、run 単位の自動永続を提供する [3]。
- **読出しトリガ**: 新 run 起動時に類似タスクを検索。Sessions は run 起動時に「retrieves the conversation history for the session and prepends it to the input items」を自動で行う [3]。
- **鮮度管理**: TTL ベースで失効。Sessions の `DaprSession` / `EncryptedSession` は TTL を持ち、`SessionSettings(limit=N)` で履歴件数も制限できる [3]。
- **容量上限**: store 側で行サイズ・件数・disk quota を上限化。Anthropic も「track memory file sizes and preventing files from growing too large」を推奨 [1]。
- **プライバシー**: PII を含みやすい層。後段の redaction とアクセス境界 (path traversal 防止 [1]) を必ず適用。

### 2.2 Semantic memory

- **用途**: ドメイン事実 (定義・関係・スキーマ) を構造化保持。
- **書込みトリガ**: agent が「事実」と判定した時点 (人手レビュー後)。Episodic から繰り返し観測されたパターンが昇格する場合は §4 を参照。
- **読出しトリガ**: タスク開始時の context engineering。Anthropic は memory を「key primitive for just-in-time context retrieval」と位置付ける [1]。
- **鮮度管理**: ECC の [`75_self-evolution/01_freshness-policy.md`](../75_self-evolution/01_freshness-policy.md) と [`07_review-cadence.md`](../75_self-evolution/07_review-cadence.md) のレビュー周期に従い、再検証されない事実は失効印を付ける。
- **容量上限**: 1 ファイル 200 行・25KB を超えないことが望ましい (Claude Code auto memory の `MEMORY.md` ロード上限が「first 200 lines or 25KB」 [2])。超過分はトピック別ファイルに分割。
- **プライバシー**: 個人名・所属・連絡先を含む事実は **書き込まない**。

### 2.3 Procedural memory

- **用途**: 手順・成功パターン・チェックリスト・lint 規則。
- **書込みトリガ**: 同手順が複数回成功し、再利用価値が認められた時。
- **読出しトリガ**: タスク種別マッチ時に on-demand ロード。Claude Code の skill は「only load when you invoke them or when Claude determines they're relevant to your prompt」 [2]。本層はこれと同じ load-on-demand を採る。
- **鮮度管理**: ECC の [`45_runbook/05_maintenance.md`](../45_runbook/05_maintenance.md) と同 INDEX に従い、参照されない procedural は archive。
- **容量上限**: 1 手順 1 ファイル。1 ファイル 200 行を上限の目安とする [2]。
- **プライバシー**: 手順内に資格情報・絶対パスを書かない。`05_credentials-vault.md` 経由で参照する。

---

## 3. ECC 実装マッピング

| ECC 層 | Anthropic | OpenAI | ECC 内既存資産 |
|---|---|---|---|
| Episodic | memory tool の `/memories/episodes/*` (client-side filesystem [1]) | Agents SDK Sessions: `SQLiteSession` / `SQLAlchemySession` / `RedisSession` / `MongoDBSession` / `EncryptedSession` [3] | `08_session-persistence.md` の L2 session log |
| Semantic | Claude Code の **CLAUDE.md / .claude/rules/** + memory tool の `/memories/facts/*` [1][2] | Agents SDK の `instructions` + Sessions の structured items [3] | `75_self-evolution/` (鮮度管理) |
| Procedural | Claude Code **skills** (load-on-demand) + memory tool の `/memories/runbooks/*` [2][1] | Agents SDK の tool / handoff 定義 [3] | `45_runbook/` (Procedural の正本) |

### 3.1 Anthropic 側

- **memory tool**: `/memories` 配下のみを CRUD 対象とし、path traversal 検証必須 [1]。本 ECC では `/memories/episodes/`・`/memories/facts/`・`/memories/runbooks/` の 3 サブディレクトリで 3 層を分離する。
- **Claude Code project memory**: `./CLAUDE.md` または `./.claude/CLAUDE.md` を semantic の team-shared 層、`./CLAUDE.local.md` を user 層、`~/.claude/CLAUDE.md` を user 横断とする [2]。
- **auto memory**: 機械ローカルかつ git repo 単位で共有される [2]。**個人/組織情報の流入禁止** (§5)。

### 3.2 OpenAI 側

- Agents SDK の **Sessions** を episodic の正本とする。distributed worker では `RedisSession` または `SQLAlchemySession`、暗号化要件があれば `EncryptedSession` を被せる [3]。
- TTL は `DaprSession` / `EncryptedSession` を使う [3]。

### 3.3 既存 ECC 資産との関係

- `45_runbook/` は **procedural memory の正本** とする。memory tool / skills はそこへの薄い参照に留め、二重化しない。
- `75_self-evolution/` は **semantic memory の鮮度管理** を担う。`01_freshness-policy.md` と `07_review-cadence.md` の周期で失効印・更新を行う。
- `08_session-persistence.md` は **session 継続** のみを扱う。本ファイルとは目的が異なる。

---

## 4. 階層間の遷移ルール

memory は層をまたいで昇格させる。**生成と判定は別 agent** で分離する (single-agent self-judge を避ける)。

### 4.1 Episodic → Semantic

- 条件: 同一事実が **N 回以上** 独立 run で再観測される (推奨 N=3)。
- 抽出 agent: episodic を要約し候補事実を提案。
- 判定 agent: 出典・整合性を検査し semantic に書き込む。
- 失敗時: 候補は episodic 側に「未承認候補」として残し、TTL で失効。

### 4.2 Semantic → Procedural

- 条件: ある事実が「常に同じ操作列で活用される」と確認できた時。
- 抽出 agent: 操作列を runbook 草案に整形 (`45_runbook/01_runbook-spec.md` 準拠)。
- 判定 agent: 副作用・可逆性・前提条件を検査し procedural に登録。
- 失敗時: 草案を破棄、semantic 側にメタ情報のみ残す。

### 4.3 共通原則

- 各遷移は **書込み先の層と異なる agent** が判定する (council pattern)。
- 全昇格は audit log に残し、`/memory` 等で人間が監査できる状態にする [2]。

---

## 5. プライバシー・セキュリティ

- **PII redaction**: episodic への書込み前に氏名・メール・電話・社員番号・絶対パスを除去。memory tool 公式も「Claude will usually refuse to write down sensitive information... However, you may want to implement stricter validation that strips out potentially sensitive information」と明記 [1]。
- **個人/組織情報の流入禁止**: semantic / procedural には個人名・組織名を書かない。本 ECC の文体規約 (`25_writing-style/`) と整合させる。
- **path traversal**: `/memories` 外への書込みを必ず拒否する。`../`・URL エンコード `%2e%2e%2f` も検査 [1]。
- **TTL / 削除権**:
  - Episodic は run 終了から既定 TTL (例: 30 日) で失効。
  - Semantic は `75_self-evolution/01_freshness-policy.md` の周期に従う。
  - Procedural は参照ゼロが一定期間続いたら archive。
  - ユーザ削除要求 (right to erasure) は memory tool の `delete` コマンド [1] と Sessions の delete API [3] で実行。
- **Zero Data Retention**: Anthropic memory tool は ZDR 対応であり、ZDR 契約下では「data sent through this feature is not stored after the API response is returned」 [1]。本 ECC ではサーバ側に依存せず client-side filesystem を memory backend とする。
- **暗号化**: 機密を含み得る episodic には `EncryptedSession` を被せる [3]。
- **監査**: `/memory` で人間が中身を閲覧・編集・削除できる状態を保つ [2]。

---

## 出典

- [1] Anthropic, "Memory tool", retrieved_at: 2026-06-23. https://docs.claude.com/en/docs/agents-and-tools/tool-use/memory-tool (302 redirect → https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool)
- [2] Anthropic, "How Claude remembers your project (Claude Code memory)", retrieved_at: 2026-06-23. https://docs.claude.com/en/docs/claude-code/memory (301 redirect → https://code.claude.com/docs/en/memory)
- [3] OpenAI, "Sessions — OpenAI Agents SDK", retrieved_at: 2026-06-23. https://openai.github.io/openai-agents-python/sessions/

## 不確実性

- 本 ECC では Anthropic memory tool の 3 サブディレクトリ分割 (`episodes/` `facts/` `runbooks/`) を提案しているが、これは公式の規約ではなく実装上の整理である [1]。
- Episodic → Semantic 昇格の閾値 N=3 は経験則であり、公式 docs に根拠はない。実運用での tuning 対象。
- Sessions の TTL 既定値は backend 実装ごとに異なるため [3]、運用前に各 backend の挙動を計測する必要がある。
- `45_runbook/` を procedural の正本とする方針は ECC 内設計であり、外部公式仕様ではない。
