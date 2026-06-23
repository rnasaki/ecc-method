# 02 — Independent Verification (生成 ≠ 判定)

成果物の検証は **生成した本人以外** が行う。self-verify は禁止。これは LLM 単独の自己評価バイアス (sycophancy / 自己合理化) を切るための原則。

---

## 1. 三役分離

| 役割 | 担当 | 入力 |
|---|---|---|
| 生成 (Generator) | 元エージェント | タスク / 入力データ |
| 判定 (Judge) | 別エージェント / 別 context | 生成物 + 受入基準 (rubric) |
| 反論 (Adversary) | さらに別エージェント / 別 context | 生成物 + 反例探索の指示 |

3 役は **異なる context window** で動かす。同一セッションで切り替えるだけでは context 汚染で独立性が崩れる。

---

## 2. Judge の入力

Judge には **生成プロセスを見せない**。最終成果物 + 受入基準 (rubric) のみを渡す:

```
入力:
- 生成物 (diff / 文章 / spec)
- AC リスト ([55_verification/01_traceability.md])
- rubric (採点基準)

出力:
- 各 AC ごとの pass / fail / partial 判定
- 不足箇所の指摘
```

Judge は採点だけ行う。修正提案は出さない (修正で生成者と同化する)。

---

## 3. Adversary の入力

Adversary には **反例探索の使命** を与える:

```
入力:
- 生成物
- 仕様 / 制約

指示:
- この成果物が壊れる入力 / シナリオ / 状態を 3 つ挙げよ
- 受入基準上は通るが意図に反する例を探せ
- セキュリティ / プライバシー / 性能の観点で穴を探せ
```

→ [06_red-team-loop.md](./06_red-team-loop.md) で詳述。

---

## 4. Self-Verify が NG な理由

| 理由 | 内容 |
|---|---|
| 自己合理化 | 生成プロセスの仮定を疑えない |
| 確証バイアス | 通したい結論に向けて評価がぶれる |
| context 汚染 | 同じ context にいると検証用視点が形成されない |
| sycophancy | 生成者がユーザーの意向に寄せた決定を、検証者として再追認してしまう |

→ [03_anti-sycophancy.md](./03_anti-sycophancy.md) と一体。

---

## 5. 別 context で動かす実装手段

### 5.1 別 subagent

```
Agent({
  subagent_type: "code-reviewer",
  description: "Independent verify of <task>",
  prompt: "Review the diff against AC<NN-N>. Flag only correctness gaps; do not propose fixes."
})
```

サブエージェントは **isolated context window** で動く ([BP-001])。

### 5.2 別モデル

可能なら Generator と Judge で異なるモデルファミリを用いる (例: Generator = Sonnet、Judge = Opus)。同一プロバイダ内でも視点差が出る。

### 5.3 別人 (人間レビュー)

最重要決定では人間レビューを混ぜる ([BP-026])。LLM ジャッジ + 人スポットチェックの組み合わせ。

---

## 6. 検証の終了条件

```
1. Judge が全 AC を pass 判定
2. Adversary が「致命的反例なし」と返答
3. それでも不確実性が残れば本文に明示 ([05_uncertainty-disclosure.md])
```

3 つすべて満たして初めて「独立検証済み」と表記できる。

---

## 7. レポートフォーマット

検証結果は次の形式で記録する:

```yaml
verification:
  task_id: <id>
  generator: <agent-id / model>
  judge:
    agent: <agent-id / model>
    verdict: pass | fail | partial
    findings: [...]
  adversary:
    agent: <agent-id / model>
    counterexamples: [...]
  status: verified | drift | rejected
  timestamp: <ISO datetime>
```

---

## 8. 反パターン

| 反パターン | 害 |
|---|---|
| 同じセッションで判定する | context 汚染、sycophancy |
| Judge に修正を書かせる | 役割越境、独立性消失 |
| Adversary を Judge と兼任 | 視点重複、反例探索が浅くなる |
| 検証スキップで「動いたから OK」 | LLM 出力の自己一貫性に騙される |

---

## 9. 連携

- 役割分担と委任は [40_delegation/03_delegation-contract.md](../40_delegation/03_delegation-contract.md) の契約形式で記述。
- レッドチームの具体手順は [06_red-team-loop.md](./06_red-team-loop.md)。
- 迎合抑止は [03_anti-sycophancy.md](./03_anti-sycophancy.md)。

---

## 出典

- BP-024 (adversarial_verification): adversarial review in fresh subagent context, https://code.claude.com/docs/en/best-practices, retrieved_at: 2026-06-23
- BP-025 (adversarial_verification): flag only gaps that affect correctness, https://code.claude.com/docs/en/best-practices, retrieved_at: 2026-06-23
- BP-026 (adversarial_verification): rubric-based LLM judge + human spot check, https://www.anthropic.com/engineering/built-multi-agent-research-system, retrieved_at: 2026-06-23
- BP-001 (subagent_design): isolated context per subagent, https://code.claude.com/docs/en/sub-agents, retrieved_at: 2026-06-23

## 不確実性

- 「異なるモデルで検証」の効果は経験則レベル。同モデル間の独立 context でも一定の効果はあるが、定量比較は本パッケージの範囲外。
- 人スポットチェックの頻度はリスク許容に依存する。本章は混在を推奨するのみ。
