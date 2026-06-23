# 05 — Escalation Policy (人へのエスカレーション方針)

オーケストレータが自動処理を打ち切り、人間判断に上げる条件と手順。承認エコノミー ([01_consent-economy.md](./01_consent-economy.md)) の補完。

---

## 1. エスカレーション 4 階層

> 本章で「L0/L1/L2/L3」と書くものはすべて **Escalation Level** (人へのエスカレーション階層) を指す。Memory layer / Registry Layer / Detection tier とは別概念。

| Level | 上げ先 | 条件 |
|---|---|---|
| Escalation L0 | 自分 (継続) | Runbook / Registry で解決可能 |
| Escalation L1 | 別エージェント | 専門家への委任で解決可能 ([40_delegation/02_routing-rubric.md](../40_delegation/02_routing-rubric.md)) |
| Escalation L2 | ユーザー (担当者) | 方針判断 / 承認が必要 |
| Escalation L3 | ユーザー (緊急停止) | 安全 / 法務 / 規制リスク |

---

## 2. Escalation L1 (別エージェント) に上げる条件

- 専門ドメイン外の判断 (例: フロントエンド担当が DB スキーマ変更を求められた)
- 独立検証が必要 (生成 ≠ 判定の原則)
- 並列調査で時間短縮可能
- → [40_delegation/03_delegation-contract.md](../40_delegation/03_delegation-contract.md) に従って委任

---

## 3. Escalation L2 (ユーザー判断) に上げる条件

以下のいずれかで Escalation L2 に上げる:

1. **方針分岐**: PRD / requirements / design レベルの選択肢が 2 つ以上、いずれにも合理性がある。
2. **同じ訂正が 2 回**: ユーザーが同じ指示を 2 回繰り返した → 進行中タスクを停止 ([27_user-care/](../27_user-care/))。
3. **不可逆操作の事前承認外**: blast-radius 行列で「不可」かつ事前承認リスト未登録 ([03_blast-radius-rubric.md](./03_blast-radius-rubric.md))。
4. **Escalation L1 で 3 回失敗**: 同じタスクを 3 つ目の専門家に投げても解決せず。
5. **コスト上限超過予測**: token / 外部 API quota が事前承認上限を超える見込み。

---

## 4. Escalation L3 (緊急停止) に上げる条件

以下は **即座に作業停止** し、ユーザーへ通知:

- secret / PII / 認証情報 を意図せず読み書きしようとしたとき
- 規制対象データ (個人情報 / 医療 / 金融) に範囲外アクセスが発生したとき
- 第三者の権利を侵害する可能性が出たとき (著作 / 商標 / 名誉)
- 安全関連の判断が必要なとき (運用停止 / 法務通報)

Escalation L3 では「次に何をするか」を提案する前に、**起きた事実のみ** を簡潔に伝える。

---

## 5. エスカレーション時の提示フォーマット

### Escalation L2 用

```
[ESCALATE-L2] <一文で何を判断してほしいか>
- 状況: <事実3行以内>
- 選択肢:
  A) <案>: 利得 / 代償
  B) <案>: 利得 / 代償
  C) <案>: 利得 / 代償
- 推奨: <あれば>。理由 <1行>
- 緊急度: <低 | 中 | 高>
- 影響範囲: <local | shared | external>
```

### Escalation L3 用

```
[ESCALATE-L3 / STOP]
- 起きたこと: <事実>
- なぜ停止したか: <該当条項>
- 巻き戻し状態: <自動巻き戻し済み / 未対応>
- 次に必要な人間判断: <1行>
```

---

## 6. エスカレーション後の挙動

| 上げた後 | 既定挙動 |
|---|---|
| Escalation L1 へ委任 | 委任先の応答を待つ。並列で他タスクは進めてよい (依存ない場合) |
| Escalation L2 (方針) | ユーザー応答待ち。同セッション内で他タスク推進可だが、当該分岐に依存する作業は停止 |
| Escalation L2 (同じ訂正 2 回) | **全停止**。阻害要因除去に集中 ([27_user-care/02_first-response-protocol.md](../27_user-care/02_first-response-protocol.md)) |
| Escalation L3 | **全停止**。ユーザー指示があるまで再開しない |

---

## 7. ループ抑止

- 同一タスクの Escalation L1 委任が 3 回連続で失敗 → **Escalation L2 に強制昇格**。Escalation L1 への 4 回目の委任を試みない。
- Escalation L2 で同じ問いを 2 回出した → 設計に欠陥がある可能性。タスクを再定義する ([55_verification/02_drift-detection.md](../55_verification/02_drift-detection.md))。

---

## 8. ログ要件

各エスカレーションを `.claude/logs/escalations.jsonl` 等に追記推奨:

```json
{"ts":"YYYY-MM-DDTHH:MM:SS","level":"Escalation L2","reason":"...","context":"...","resolution":"..."}
```

これは [60_quality-gates/06_red-team-loop.md](../60_quality-gates/06_red-team-loop.md) の検証材料となる。

---

## 9. 反パターン

| 反パターン | 害 |
|---|---|
| Escalation L2 を出さずに自己判断で続行 | 不可逆事故 |
| 何でも Escalation L2 に上げる | 認知疲労、ASK 過多 |
| Escalation L3 で詳細を喋りすぎる | 緊急時の判断阻害 |
| Escalation L1 失敗を無限ループ | 時間 / token 消尽 |

---

## 出典

- BP-013 (hooks): PreToolUse to block destructive ops, https://code.claude.com/docs/en/hooks, retrieved_at: 2026-06-23
- BP-026 (adversarial_verification): rubric + human spot check, https://www.anthropic.com/engineering/built-multi-agent-research-system, retrieved_at: 2026-06-23
- BP-027 (anti_sycophancy): show evidence rather than assert, https://code.claude.com/docs/en/best-practices, retrieved_at: 2026-06-23

## 不確実性

- 「同じ訂正 2 回」「Escalation L1 失敗 3 回」の閾値は経験則。プロジェクトで再調整する前提。
- Escalation L3 の対象 (規制 / 法務) はドメインで大きく変わる。本章は枠組みのみ提示。
