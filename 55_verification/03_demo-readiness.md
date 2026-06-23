# 03 — Demo Readiness (デモ完了条件)

「動いた」だけではデモ可能ではない。AC カバレッジ・シナリオ脚本・代替経路の 3 点を満たして初めてデモ完了とみなす。

---

## 1. デモ完了の 3 条件

| 条件 | 検証方法 |
|---|---|
| AC カバレッジ完備 | カバレッジ表 ([01_traceability.md](./01_traceability.md)) で全 AC が Green |
| シナリオ脚本確定 | デモシナリオが手順番号で記述され、再現可能 |
| 代替経路の確認 | エラー時 / ネット切断時 / 入力境界での挙動を 1 パターン以上確認 |

---

## 2. シナリオ脚本フォーマット

`docs/<feature>/demo-script.md` に以下を置く:

```markdown
# Demo Script: F12 — <feature 名>

## 前提
- 環境: <staging / local / sandbox>
- 事前データ: <fixture 名 / コマンド>
- 想定時間: <分>

## 手順
1. <操作>
   - 期待: <画面 / 出力>
   - 関連 AC: AC12-1
2. <操作>
   - 期待: ...
   - 関連 AC: AC12-2
3. ...

## 代替経路
- 入力境界: <例: 0 件 / 上限件数>
- 異常系: <例: ネット切断 / 認証失効>
- ロールバック: <手順>

## 質疑想定
- Q: <よくある質問>
  A: <一文回答>
```

---

## 3. 完了チェック (デモ前 24h)

```
[ ] カバレッジ表で全 AC が Green
[ ] drift status のフラグがゼロ ([02_drift-detection.md])
[ ] シナリオ脚本のすべての手順が再現可能 (1 度通し稽古した)
[ ] 代替経路の 1 パターン以上を実行確認
[ ] 質疑想定が 3 件以上記述
[ ] デモデータが本物 (production fixture) と乖離していない、または乖離が明示されている
[ ] secret / PII を画面共有時に露出しないことを確認 (.env / API key / 顧客名)
[ ] 録画 / スクリーンショット保存先を決定
```

---

## 4. プレゼン資料の完了条件

スライド / 資料を伴う場合:

- 主張ごとに **L1 出典** を脚注で明記 ([60_quality-gates/01_fact-check-protocol.md](../60_quality-gates/01_fact-check-protocol.md))。
- 数値主張は計測条件 (期間 / 母集団 / 計測方式) を併記。
- 不確実性開示セクションを 1 枚以上含む ([60_quality-gates/05_uncertainty-disclosure.md](../60_quality-gates/05_uncertainty-disclosure.md))。
- 禁止語ゼロ ([25_writing-style/02_avoidance-patterns.md](../25_writing-style/02_avoidance-patterns.md))。
- 個人 / 組織 / 製品の固有名は事前承認のもののみ。

---

## 5. 通し稽古 (リハーサル)

- 1 度は **本番と同じ環境** で頭から末尾まで通す。
- 通し稽古でつまずいた箇所はシナリオ脚本に注記する (例: 「ここで 5 秒待つ」)。
- 通し稽古の所要時間が想定の +30% を超えたら、デモ範囲を縮小する。

---

## 6. デモ中の事故対応

| 事故 | 既定対応 |
|---|---|
| 機能が想定通り動かない | 該当箇所をスキップし、「ここは現在 known issue として把握」と明示 |
| ネット / 認証が落ちた | 録画 / スクリーンショットでフォールバック |
| 想定外の質問 | 「現時点で確認できていません。後ほど回答します」と明言。推測で答えない |

---

## 7. デモ後の処理

- カバレッジ表のスナップショットをタグ (`demo-YYYY-MM-DD`) としてリポに残す。
- デモ中の発見 (バグ / 要望) を `tasks` に AC 候補として追記。
- デモシナリオで露呈した手順 / つまずきは Runbook 化候補 ([45_runbook/03_capture-trigger.md](../45_runbook/03_capture-trigger.md))。

---

## 8. 反パターン

| 反パターン | 害 |
|---|---|
| カバレッジ未確認のままデモ | 当日想定外バグで信頼喪失 |
| 通し稽古なし | 所要時間超過 / 順序ミス |
| 代替経路未確認 | 簡単な質問で詰まる |
| 数値の出典なし | 質疑応答で破綻 |
| シナリオ口頭のみ | 再現不能、引き継ぎ困難 |

---

## 9. 連携

- AC カバレッジは [01_traceability.md](./01_traceability.md) の表を流用。
- drift がある状態でのデモは禁止。先に [02_drift-detection.md](./02_drift-detection.md) を解消。
- 完了判定はゲートチェックリスト ([60_quality-gates/07_gate-checklist.md](../60_quality-gates/07_gate-checklist.md)) を通すことで初めて宣言可能。

---

## 出典

- BP-021 (spec_test_code_loop): Red-Green-Refactor, https://martinfowler.com/bliki/TestDrivenDevelopment.html, retrieved_at: 2026-06-23
- BP-027 (anti_sycophancy): show evidence rather than assert, https://code.claude.com/docs/en/best-practices, retrieved_at: 2026-06-23
- BP-029 (anti_sycophancy): heuristics not rigid rules, https://www.anthropic.com/engineering/built-multi-agent-research-system, retrieved_at: 2026-06-23

## 不確実性

- 「通し稽古 1 回」は最低基準。複雑なデモでは 2〜3 回必要になる。本章は下限のみ提示。
- デモ中事故対応のスクリプトは文化 / 顧客特性で大きく変わる。本章は枠組み。
