---
keywords: [quality-gates, red, team, loop]
related: [60_quality-gates/02_independent-verify.md, 60_quality-gates/03_anti-sycophancy.md, 40_delegation/06_handoff-patterns.md, 55_verification/02_drift-detection.md, 40_delegation/03_delegation-contract.md]
---
# 06 — Red Team Loop (adversarial-verify パターン)

「生成 ≠ 判定 ≠ 反論」を 3 役に分け、それぞれ別 context で動かす。判定で通った成果物にも反論役が反例を探し、見落としを掘り起こす。

---

## 1. 3 役の責務

| 役割 | 入力 | 出力 | 禁止事項 |
|---|---|---|---|
| Generator | タスク + 入力 | 成果物 | 自己採点しない |
| Judge | 成果物 + AC + rubric | pass/fail/partial 判定 | 修正提案を書かない |
| Adversary | 成果物 + 仕様 | 反例 / 攻撃シナリオ | 修正提案を書かない |

3 役は **異なる subagent** で起動し、各自の context は独立。 ([02_independent-verify.md](./02_independent-verify.md) と一体)

---

## 2. ループ図

```
[Generator] → 成果物
       ↓
   [Judge] ──── pass ──→ [Adversary]
       │                       │
      fail                  反例あり
       ↓                       ↓
   返却 (修正)            返却 (再生成 or AC 追加)
                               │
                          反例なし
                               ↓
                          検証完了
```

---

## 3. Adversary プロンプト雛形

```
あなたはレッドチームレビュアーです。以下の成果物に対し、次の観点で反例を探してください。

[成果物]
<diff / 文章 / spec>

[仕様]
<AC リスト>

[探索観点]
1. AC は通るが意図に反する入力 / 状態
2. セキュリティ: 入力検証 / 認可 / SSRF / injection の穴
3. プライバシー: PII 漏洩経路
4. 性能: 入力サイズ・並行度・タイムアウトでの破綻
5. 仕様の沈黙領域: 仕様に書かれていない境界での挙動

[出力フォーマット]
- 反例 1: <入力> → <現状の挙動> / <期待> / <重要度: critical|high|medium|low>
- 反例 2: ...
- 反例 3: ...

修正提案は書かないでください。反例の列挙のみ。
```

---

## 4. Adversary が flagging する基準

BP-025 に従い、**correctness or stated requirements に影響するものだけ** を flag:

| flag する | flag しない |
|---|---|
| AC を破る入力 | 「もっと美しく書ける」 |
| secret 漏洩経路 | 命名の趣味 |
| パフォーマンス破綻 (10x 以上) | マイクロ最適化 |
| 仕様外の沈黙領域での未定義挙動 | 仕様外でも害がない挙動 |

「全部の反例を列挙」させると過剰品質に陥り、要件外の防御コードが膨らむ。

---

## 5. 重要度別の処理

| 重要度 | 処理 |
|---|---|
| critical | 修正必須。merge ブロック |
| high | 修正推奨。merge 前に対応 or 「既知 issue」として明示 |
| medium | 任意。対応可能なら対応 |
| low | ログのみ |

---

## 6. ループの終了条件

```
1. Judge: 全 AC pass
2. Adversary: critical / high なし
3. open な high が「既知 issue」として明示記録されている
```

3 つのいずれも満たして「検証完了」を宣言できる。 self-declare 禁止 ([03_anti-sycophancy.md](./03_anti-sycophancy.md))。

---

## 7. 並列化

3 役のうち Judge と Adversary は **並列** に走らせてよい (両者は独立)。Generator は前段に依存するので順次。

```
Generator
  ↓
[Judge ‖ Adversary]   ← 並列起動
  ↓
統合判断
```

並列起動は同一メッセージで複数 Agent 呼び出しを書く ([40_delegation/06_handoff-patterns.md](../40_delegation/06_handoff-patterns.md))。

---

## 8. 反パターン

| 反パターン | 害 |
|---|---|
| Generator が自分で反例を探す | 自己合理化、視点重複 |
| Judge と Adversary を兼任 | 採点と反例探索の役割が混ざる |
| Adversary に修正させる | Generator の権限と衝突 |
| critical/high の境界を曖昧に | 過剰品質 or 重大見落とし |
| ループ無限化 (反例 → 修正 → 新反例 → ...) | 終了条件未定義 |

---

## 9. ループ抑止

- 同一成果物の Adversary 反復が 3 回 → AC 自体を見直す ([55_verification/02_drift-detection.md](../55_verification/02_drift-detection.md))。
- 反例数が右肩上がり → 仕様の沈黙領域が広すぎる。requirements を埋める。

---

## 10. 連携

- 三役分離の哲学: [02_independent-verify.md](./02_independent-verify.md)
- 委任契約: [40_delegation/03_delegation-contract.md](../40_delegation/03_delegation-contract.md)
- 反対意見の併記: [03_anti-sycophancy.md](./03_anti-sycophancy.md) §8
- ゲート: [07_gate-checklist.md](./07_gate-checklist.md)

---

## 出典

- BP-024 (adversarial_verification): adversarial review in fresh subagent, https://code.claude.com/docs/en/best-practices, retrieved_at: 2026-06-23
- BP-025 (adversarial_verification): flag only gaps that affect correctness, https://code.claude.com/docs/en/best-practices, retrieved_at: 2026-06-23
- BP-026 (adversarial_verification): rubric + human spot check, https://www.anthropic.com/engineering/built-multi-agent-research-system, retrieved_at: 2026-06-23
- BP-003 (subagent_design): parallel subagent spawning, https://www.anthropic.com/engineering/built-multi-agent-research-system, retrieved_at: 2026-06-23

## 不確実性

- 重要度区分 (critical/high/medium/low) の判定は LLM ジャッジに依存し、ぶれが出る。閾値の運用調整が必要。
- ループ終了条件「Adversary 3 回」は経験則。複雑領域では緩める判断もある。
