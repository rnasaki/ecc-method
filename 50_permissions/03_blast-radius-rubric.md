---
keywords: [permissions, blast, radius, rubric]
related: [60_quality-gates/04_guardrails-compliance.md, 50_permissions/04_settings-presets.md]
---
# 03 — Blast Radius Rubric (影響半径 × 可逆性 決定木)

アクションごとに **影響半径** と **可逆性** をスコアリングし、ACT / ASK-ONCE / ASK-EACH の振り分けを機械化する。

---

## 1. 2 軸定義

### 影響半径 (blast radius)

| レベル | 定義 |
|---|---|
| local | 自分のワークツリー / 一時ブランチ / ローカル DB のみ |
| shared | 共有 main branch / 共有開発環境 / チーム共有リソース |
| external | 第三者に見える / 課金が走る / 個人データに触れる |

### 可逆性 (reversibility)

| レベル | 定義 |
|---|---|
| 即時 | git revert / undo / restore で 1 分以内に巻き戻せる |
| 数分 | snapshot / backup を引いて数分で復旧可能 |
| 不可 | 復旧不能 (送信済みメッセージ / 物理削除 / 課金) |

---

## 2. 決定行列

| 影響半径 \ 可逆性 | 即時 | 数分 | 不可 |
|---|---|---|---|
| local | ACT | ACT | ASK-ONCE |
| shared | ACT-LOG | ASK-ONCE | ASK-EACH |
| external | ASK-ONCE | ASK-EACH | ASK-EACH (二重確認) |

注: ACT-LOG = 実行はするが結果を要約報告。

---

## 3. 決定木 (簡易版)

```
1. このアクションは外部の第三者に見えるか?
   YES → external にジャンプ
   NO  → 2 へ

2. 共有 main / shared 環境を変更するか?
   YES → shared にジャンプ
   NO  → local

3. 失敗したら 1 分以内に復旧できるか?
   YES → 即時
   NO  → 4

4. backup / snapshot を引けば数分で復旧できるか?
   YES → 数分
   NO  → 不可

5. 行列を引いて ACT / ASK-ONCE / ASK-EACH を決定
```

---

## 4. 例題

### 例 4.1: ローカル feature branch への commit

- 影響半径: local
- 可逆性: 即時 (git reset / revert)
- → **ACT**

### 例 4.2: feature branch を origin に push

- 影響半径: shared (CI が走り、レビュアー通知が出る)
- 可逆性: 即時 (force-push で history を巻ける、ただし副作用 = CI / 通知は不可)
- → **ASK-ONCE** (初回のみ)

### 例 4.3: main branch への force-push

- 影響半径: shared
- 可逆性: 不可 (他者の push を消す可能性)
- → **ASK-EACH (二重確認)** + deny に倒すのが既定

### 例 4.4: prod DB への DELETE FROM users WHERE ...

- 影響半径: external (顧客データ)
- 可逆性: 不可
- → **ASK-EACH (二重確認)** + Hook で PreToolUse ブロック ([60_quality-gates/04_guardrails-compliance.md](../60_quality-gates/04_guardrails-compliance.md))

### 例 4.5: Slack 投稿

- 影響半径: external (第三者に見える)
- 可逆性: 不可 (削除しても通知済み)
- → **ASK-EACH** (初回 ASK-ONCE に降格は要件次第)

### 例 4.6: npm install <new-pkg>

- 影響半径: local (lockfile 更新)
- 可逆性: 即時
- ただし supply-chain risk あり → 既定 **ASK-ONCE**

---

## 5. 自動評価フロー

オーケストレータは Bash / Edit / MCP を呼ぶ前に、内部で以下を評価する:

```
input: { tool, args, target }
↓
classify_blast_radius(target) → local | shared | external
classify_reversibility(tool, args) → 即時 | 数分 | 不可
↓
lookup_decision_matrix() → ACT | ASK-ONCE | ASK-EACH
↓
permission gate ([04_settings-presets.md])
```

評価結果は `.claude/logs/permission-decisions.jsonl` 等に追記推奨 (運用 ECC のみ)。

---

## 6. 反パターン

| 反パターン | 害 |
|---|---|
| 影響半径を local と楽観評価 | 実は CI トリガで shared に伝播し事故 |
| 可逆性を「即時」と誤認 | force-push 副作用 (他者 push 消失) を見落とす |
| 行列を見ずに直感で ACT 判定 | 一貫性が崩れ、ユーザーが挙動を予測できなくなる |

---

## 7. プリセットとの連動

- `conservative`: 行列の右下寄りに倒す。ASK-ONCE → ASK-EACH に昇格。
- `standard`: 行列通り。
- `aggressive`: 行列の左上寄りに倒す。ASK-ONCE → ACT-LOG に降格 (ただし不可逆は据え置き)。

詳細は [04_settings-presets.md](./04_settings-presets.md)。

---

## 出典

- BP-011 (permissions): allowlist for known-safe tools, https://code.claude.com/docs/en/best-practices, retrieved_at: 2026-06-23
- BP-012 (permissions): OS-level sandboxing for blast radius bounds, https://code.claude.com/docs/en/best-practices, retrieved_at: 2026-06-23
- BP-013 (hooks): PreToolUse to block destructive ops, https://code.claude.com/docs/en/hooks, retrieved_at: 2026-06-23

## 不確実性

- 「影響半径」の境界はプロジェクト構成 (CI / branch protection / shared infra) により変わる。本決定木は既定値。各プロジェクトでカスタムする。
- 可逆性「数分」の閾値はチームの SLA と依存し、固定値ではない。
