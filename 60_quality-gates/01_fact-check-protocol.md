# 01 — Fact-Check Protocol (三層検証)

事実主張は **三層** で検証し、各主張に **{claim, source_url, retrieved_at, confidence}** の四つ組を必ず付ける。これにより事後監査が可能になる。

---

## 1. 三層検証 (L1 / L2 / L3)

| 層 | 性質 | 例 |
|---|---|---|
| L1 (Primary) | 一次情報 | 公式 docs / 公式 API レスポンス / 公式 GitHub repo / 公式論文 |
| L2 (Secondary) | 二次情報 | 公式関連の解説記事 / 一次の引用が明示されたまとめ |
| L3 (Tertiary) | 集約 / 第三者解釈 | ブログ / Q&A サイト / 個人発信 |

主張は **L1 必須**。L2 / L3 のみで主張を立てない。L1 が無い場合は「不確実」と明示する。

---

## 2. 四つ組 (claim quad)

各事実主張は以下の構造でメタ情報を保持する:

```yaml
claim: "<主張本文>"
source_url: "<L1 URL>"
retrieved_at: "YYYY-MM-DD"
confidence: "high | medium | low"
```

### 2.1 confidence 判定基準

| level | 条件 |
|---|---|
| high | L1 出典があり、複数の独立 L1 で再確認できる、または公式 docs の現行版に明記 |
| medium | L1 出典があるが 1 件のみ、または公式 docs に「実験的」「変更予定」の注記 |
| low | L1 が無い / L2 のみ / 古い (retrieved_at が 180 日以上前) |

low の主張は本文で「不確実」「<= 公式情報を再確認すること」と明記する ([05_uncertainty-disclosure.md](./05_uncertainty-disclosure.md))。

---

## 3. 出典明記の書き方

ドキュメント末尾の `## 出典` セクションに以下形式で列挙:

```markdown
## 出典

- BP-XXX (topic): <主張要約>, <L1 URL>, retrieved_at: YYYY-MM-DD
- <一次情報名>, <URL>, retrieved_at: YYYY-MM-DD
```

数値主張・引用文は **本文中** にも `[URL]` 形式で行内引用する。

---

## 4. retrieved_at の運用

- 取得当日の日付を必ず書く (推測禁止)。
- 180 日経過した出典は **再取得** の対象 ([75_self-evolution/](../75_self-evolution/))。
- 再取得時に内容変更があれば四つ組を更新し、`confidence` を再評価。

---

## 5. fact-check が必要な主張類型

以下は必ず四つ組を付ける:

- API / SDK / CLI の挙動・引数・既定値
- ライブラリのバージョン番号 / 互換性
- パフォーマンス / コスト数値
- 規格・規制・契約条項
- 第三者の発言・主張の引用

逆に **不要** な類型:

- 自リポ内のコード位置参照 (相対パスを書けばよい)
- 普遍的な数学・論理 (1+1=2 等)
- 本パッケージ内の章相互参照

---

## 6. NG パターン

| NG | 理由 |
|---|---|
| 「公式に書いてある」(URL なし) | 検証不能 |
| 出典が L3 のみ | 一次にあたっていない |
| retrieved_at が「最近」 | 日付不定 |
| confidence 自己申告 high で根拠 1 件 | 過信 |
| URL 貼るが claim 抽象的 | 何を出典としているか不明 |

---

## 7. 自動チェック (lint)

CI で以下を強制:

```
- 各 .md の `## 出典` セクションが存在
- 数値主張行に [URL] か出典への参照がある
- retrieved_at が ISO 形式 YYYY-MM-DD
- retrieved_at が今日から 180 日以内 (warning)、365 日超 (error)
```

実装は `scripts/fact-check-lint.sh` 等で正規表現ベースの検査でよい。

---

## 8. 反パターン

| 反パターン | 害 |
|---|---|
| 出典をまとめて末尾にだけ列挙 | どの主張がどの出典か不明 |
| 取得日を共通の今日日付で一括 | 古い出典が新しく見える |
| confidence を全部 high | 不確実性が伝わらない |
| 出典 URL が壊れる (404) | 検証不能 |

---

## 9. 連携

- 不確実性の言語化は [05_uncertainty-disclosure.md](./05_uncertainty-disclosure.md) と一体。
- 独立検証は [02_independent-verify.md](./02_independent-verify.md) で別エージェントが再追跡。
- 全成果物のゲートは [07_gate-checklist.md](./07_gate-checklist.md) で確認。

---

## 出典

- BP-027 (anti_sycophancy): show evidence rather than assert, https://code.claude.com/docs/en/best-practices, retrieved_at: 2026-06-23
- BP-026 (adversarial_verification): rubric + human spot check, https://www.anthropic.com/engineering/built-multi-agent-research-system, retrieved_at: 2026-06-23
- BP-029 (anti_sycophancy): heuristics not rigid rules, https://www.anthropic.com/engineering/built-multi-agent-research-system, retrieved_at: 2026-06-23

## 不確実性

- L1/L2/L3 の境界はドメインで微妙に変わる (学術論文か公式 API かで一次の性質が異なる)。本章は技術ドキュメントを前提とする。
- 自動 fact-check lint の精度は正規表現の限界がある。意味的な fact-check は LLM ジャッジに依頼する。
