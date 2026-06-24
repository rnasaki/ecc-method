---
keywords: [quality-gates, guardrails, compliance]
related: [50_permissions/04_settings-presets.md, 50_permissions/05_escalation-policy.md, 60_quality-gates/07_gate-checklist.md]
---
# 04 — Guardrails Compliance (安全 / 著作 / PII / 社外秘)

オーケストレータが守る「絶対線」。これらは ASK でも ACT でもなく、**deny by default** で固める。Hook と settings の二重防御。

---

## 1. 守る対象 4 種

| 種別 | 例 |
|---|---|
| 安全 | 違法行為支援 / 危害助長 / 自傷他傷の指南 |
| 著作 | 第三者著作物の無断複製・翻案 / ライセンス違反 |
| PII | 氏名 / 住所 / 連絡先 / 認証情報 / 顧客識別子 |
| 社外秘 | 顧客契約 / 内部仕様 / 取引情報 / 戦略文書 |

---

## 2. 二重防御

### 2.1 settings 側 (deny)

`.claude/settings.local.json` の `deny` で **ファイル / コマンド** レベルで遮断:

```json
{
  "permissions": {
    "deny": [
      "Read(./.env*)",
      "Read(./secrets/**)",
      "Read(./.aws/**)",
      "Read(./.ssh/**)",
      "Read(./customers/**)",
      "Edit(./.env*)",
      "Edit(./secrets/**)",
      "Bash(curl * customer-api/**)",
      "WebFetch(https://internal.*)"
    ]
  }
}
```

→ プリセット詳細は [50_permissions/04_settings-presets.md](../50_permissions/04_settings-presets.md)。

### 2.2 Hook 側 (PreToolUse)

settings をすり抜けた場合に備えて **PreToolUse Hook** で意味的検出:

```
入力: 呼び出されようとしているツール + 引数
判定:
  - 引数文字列に PII パターン (メール / 電話 / ID) が含まれるか?
  - 引数文字列に secret-like (sk_live_ / AKIA / -----BEGIN) が含まれるか?
  - 出力対象が外部ドメインか?
動作: 該当すれば exit code 非 0 で block + ログ
```

Hook は CLAUDE.md の advisory より強い。BP-013 の通り、deterministic に毎回走る。

---

## 3. 安全領域

| 領域 | 既定 |
|---|---|
| 暴力 / 自傷 / 他害の指南 | refuse |
| 違法行為の支援 | refuse |
| 危険物 (武器 / 化学 / 生物) の作製情報 | refuse |
| 児童に関する不適切な内容 | refuse + 報告 |

`refuse` は応答せず短く理由のみ返す。回避方法を提示しない。

---

## 4. 著作

| 状況 | 対応 |
|---|---|
| 第三者コードを取り込みたい | ライセンスを確認し、互換性を提示。GPL / AGPL は本パッケージで取り込まない (LICENSE 衝突回避) |
| 第三者文章を引用 | 引用範囲は最小限・出典明記・改変は明示 |
| AI 出力の混入境界 | ユーザーが提示した第三者著作物は **生成入力には使うが、出力に丸ごと再現しない** |

---

## 5. PII (個人情報)

### 5.1 検出パターン (例)

```
- email: [\w.+-]+@[\w-]+\.[\w.-]+
- phone (JP): 0\d{1,4}-?\d{1,4}-?\d{4}
- 個人番号 / ID: コンテキスト依存。case-by-case
- 認証情報: sk_live_*, AKIA*, ghp_*, ghs_*, -----BEGIN ... PRIVATE KEY-----
```

検出時の挙動:

1. read 時 → block + 「PII の可能性。範囲を絞ってください」と返す
2. write 時 → block + 「PII を出力しようとしています。マスク / 削除してください」
3. WebFetch / 第三者送信 → block + ASK-EACH に強制昇格

### 5.2 マスク方針

ログ / レポートに PII を出すときは即座にマスク:

```
john.doe@example.com → j***@e***.com
080-1234-5678 → 080-****-5678
```

---

## 6. 社外秘

| パターン | 既定 |
|---|---|
| 顧客名・取引先名 | 固有名禁止 ([25_writing-style/](../25_writing-style/))。汎用化して記述 |
| 内部仕様の外部送信 | block (WebFetch / Slack / Email 系 MCP) |
| 公開リポへの内部資産混入 | pre-commit hook で検出 |

---

## 7. 違反検出時の挙動

```
1. ツール実行を block (Hook 戻り値)
2. ユーザーに通知 (L3 escalation [50_permissions/05_escalation-policy.md])
3. ロールバック可能なら自動巻き戻し (例: 部分的に書いた secret ファイルを削除)
4. 事後レポート: いつ / 何が / どこで検出されたか
```

---

## 8. 自動 lint

CI で以下を強制:

- 全 .md / .json / .yaml に対し PII / secret パターンの grep
- `.gitignore` で secret ディレクトリが除外されているかの確認
- LICENSE 互換性チェック (取り込んだ依存の SPDX 照合)

---

## 9. 反パターン

| 反パターン | 害 |
|---|---|
| settings deny だけで Hook なし | LLM が経路を変えてすり抜け |
| Hook だけで settings deny なし | Hook 設定漏れで貫通 |
| PII を「個人名 1 件くらい」許容 | 1 件の累積が積もる |
| 安全リフューズ理由を長文で | 回避ヒントになる |

---

## 10. 連携

- 権限プリセット: [50_permissions/04_settings-presets.md](../50_permissions/04_settings-presets.md)
- Hook 一般論: [BP-013] / [BP-014]
- L3 エスカレーション: [50_permissions/05_escalation-policy.md](../50_permissions/05_escalation-policy.md)
- 出力前ゲート: [07_gate-checklist.md](./07_gate-checklist.md)

---

## 出典

- BP-013 (hooks): PreToolUse to block destructive ops, https://code.claude.com/docs/en/hooks, retrieved_at: 2026-06-23
- BP-014 (hooks): narrow matchers + if filters, https://code.claude.com/docs/en/hooks, retrieved_at: 2026-06-23
- BP-012 (permissions): OS-level sandboxing, https://code.claude.com/docs/en/best-practices, retrieved_at: 2026-06-23

## 不確実性

- PII 検出パターンは正規表現の限界がある。意味的な PII (例: 文中の人名) は LLM 補助が必要。本章は構造的パターンのみ提示。
- 社外秘の境界はプロジェクト / 顧客契約で個別に決まる。本章は枠組み。
