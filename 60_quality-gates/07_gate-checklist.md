---
keywords: [quality-gates, gate, checklist]
related: [60_quality-gates/01_fact-check-protocol.md, 60_quality-gates/02_independent-verify.md, 60_quality-gates/06_red-team-loop.md, 60_quality-gates/05_uncertainty-disclosure.md, 60_quality-gates/03_anti-sycophancy.md]
---
# 07 — Gate Checklist (全成果物に通すゲート)

全成果物 (.md / spec / コード / レポート) は、本チェックリストを通って初めて「完了」を宣言できる。`## 出典` `## 不確実性` まで満たすこと。

---

## 1. ゲート 9 項目

| # | 項目 | 確認 | 参照 |
|---|---|---|---|
| 1 | PATH POLICY | 絶対パス禁止。本パッケージ内は相対パス、リポ内成果物は workspace ルート相対 | [25_writing-style/](../25_writing-style/) |
| 2 | L1 出典 | 全事実主張に L1 出典 + retrieved_at | [01_fact-check-protocol.md](./01_fact-check-protocol.md) |
| 3 | 独立検証 | 生成 ≠ 判定。Judge / Adversary が別 context | [02_independent-verify.md](./02_independent-verify.md) / [06_red-team-loop.md](./06_red-team-loop.md) |
| 4 | uncertainty | `## 不確実性` セクション存在 + 確度語彙 | [05_uncertainty-disclosure.md](./05_uncertainty-disclosure.md) |
| 5 | 反対意見 | 重要決定では別案 1 件以上併記 | [03_anti-sycophancy.md](./03_anti-sycophancy.md) §8 |
| 6 | secret / PII | secret / 個人情報 / 認証情報 0 件 | [04_guardrails-compliance.md](./04_guardrails-compliance.md) |
| 7 | banned phrases | 禁止語 0 件 | [25_writing-style/02_avoidance-patterns.md](../25_writing-style/02_avoidance-patterns.md) |
| 8 | context budget | トークン上限内 (節分割 / 委任で抑制) | [05_principles/06_context-economy.md](../05_principles/06_context-economy.md) |
| 9 | closure residue | セッション完了宣言時に git status が clean、または残置物に 1 行根拠が明記されている。「スコープ外」での先送り禁止 | [../45_runbook/runbooks/RB-006-session-handover-protocol.md](../45_runbook/runbooks/RB-006-session-handover-protocol.md) §Step [0] CLOSURE GATE |

---

## 2. チェックリスト本体

成果物提出前に手動 / 自動で全項目に check:

```
[ ] 1. PATH POLICY: grep で絶対パス (^[A-Z]:/ や ^/Users) 0 件
[ ] 2. L1 出典: `## 出典` セクション存在、各項目に URL + retrieved_at
[ ] 3. 独立検証: Judge / Adversary レポートが添付されている
[ ] 4. uncertainty: `## 不確実性` セクション存在
[ ] 5. 反対意見: 重要決定なら別案併記、そうでなければスキップ可
[ ] 6. secret / PII: 検出 grep で 0 件 (sk_/ AKIA / -----BEGIN / メールパターン)
[ ] 7. banned phrases: 禁止語 self-grep で 0 件
[ ] 8. context budget: 単一ファイル < 800 行、リクエスト < <設定上限>
[ ] 9. closure residue: クローズ宣言前に `git status` が clean、または残置物すべてに「本タスクと独立」と 1 行根拠が明記されている (RB-006 §Step [0])
```

---

## 3. 自動 lint スクリプト雛形

```bash
#!/usr/bin/env bash
# scripts/quality-gate.sh <file>
set -e
f="$1"

# 1. PATH POLICY
if grep -E "^[A-Z]:/|^/Users/|^/home/" "$f" > /dev/null; then
  echo "FAIL: absolute path detected"; exit 1
fi

# 2. L1 source
grep -q "^## 出典" "$f" || { echo "FAIL: 出典 section missing"; exit 1; }

# 4. uncertainty
grep -q "^## 不確実性" "$f" || { echo "FAIL: 不確実性 section missing"; exit 1; }

# 6. secrets / PII
if grep -E "sk_live_|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]+PRIVATE KEY-----|ghp_[A-Za-z0-9]{36}" "$f"; then
  echo "FAIL: secret-like pattern"; exit 1
fi

# 7. banned phrases
if grep -E "(最強|万能|完璧|究極|至高|相棒|パートナー|司令塔|素晴らしい|申し分ない|perfect|excellent|ばっちり|がっつり)" "$f"; then
  echo "FAIL: banned phrase"; exit 1
fi

echo "PASS: $f"
```

---

## 4. 通過基準

- 8 項目すべて check で「完了」を宣言可能。
- 1 つでも未確認なら **完了宣言禁止**。
- 「あとで対応」で素通りさせるとゲートが形骸化する。

---

## 5. 例外申請

止むを得ず項目をスキップする場合:

```
[ ] 例外申請: <項目番号>
  - 理由: <事実>
  - 影響: <発生しうる悪結果>
  - 期限: <次回対応 deadline>
  - 承認: <ASK-EACH での明示承認 or L2 escalation>
```

例外は **記録** が義務。スキップが恒常化したら設計を見直す。

---

## 6. CI / Hook 統合

- pre-commit hook で本チェックリストの自動部分を走らせる。
- PR テンプレートにチェックリストをコピペし、レビュー時に確認。
- Stop Hook (BP-015) で完了宣言時に再走させる。

---

## 7. 反パターン

| 反パターン | 害 |
|---|---|
| チェック手書きで形骸化 | 見落とし常態化 |
| 例外申請を口頭のみ | 例外が累積し、後で見えない |
| ゲート未通過で「完了」宣言 | drift / 事故 |
| ゲート全項目を全成果物に強制 (細部まで) | 過剰品質、開発速度低下 |

→ 本チェックリストは「成果物単位」で適用。コード 1 行修正のたびに 8 項目通すのは過剰。

---

## 8. 適用粒度

| 成果物粒度 | 適用 |
|---|---|
| ドキュメント (.md) | 全項目必須 |
| spec / requirements / design | 全項目必須 |
| コード PR | 1, 3, 6, 7, 8 必須。2/4/5 は伴うドキュメントで充足 |
| chore / typo fix | 1, 7 のみ |

---

## 9. 連携

- 個別ゲートの詳細は本ディレクトリ内 01〜06 各章。
- 完了宣言の方法 (証拠提示) は [03_anti-sycophancy.md](./03_anti-sycophancy.md) §4。
- デモ前は本チェック + デモ完了条件 ([55_verification/03_demo-readiness.md](../55_verification/03_demo-readiness.md)) を併走。

---

## 出典

- BP-015 (hooks): Stop hook gates completion, https://code.claude.com/docs/en/best-practices, retrieved_at: 2026-06-23
- BP-024 (adversarial_verification): adversarial review in fresh subagent, https://code.claude.com/docs/en/best-practices, retrieved_at: 2026-06-23
- BP-027 (anti_sycophancy): show evidence rather than assert, https://code.claude.com/docs/en/best-practices, retrieved_at: 2026-06-23

## 不確実性

- 自動 lint の正規表現は表層検出。意味的な迎合 / 過信 / 出典齟齬は LLM ジャッジに別途依頼する。
- 「成果物粒度」表は経験則。プロジェクトの厳格度に応じて調整。
