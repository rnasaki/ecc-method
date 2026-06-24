---
keywords: [permissions, consent, economy]
related: [50_permissions/03_blast-radius-rubric.md, 50_permissions/02_pre-authorized-actions.md, 50_permissions/04_settings-presets.md, 45_runbook/03_capture-trigger.md]
---
# 01 — Consent Economy (承認エコノミー)

承認は **希少資源** として扱う。何にでも確認を取れば、ユーザーは認知疲労で雑に YES を返すようになり、本当に重要な分岐の判断品質が下がる。METHOD §8 を運用レベルに落とした詳細版。

---

## 1. 承認の 4 区分

各アクションを 4 区分のいずれかに割り当てる。区分が決まれば挙動は機械的に決まる。

| 区分 | 既定動作 | 例 |
|---|---|---|
| ACT (実行) | 黙って実行。事後ログのみ。 | grep / read / lint / 既存 Runbook の冪等手順 |
| ACT-LOG | 実行するが結果を要約して報告 | local file edit / branch 作成 / unit test 実行 |
| ASK-ONCE | 一度承認を取れば同セッション内は再確認不要 | 新しい外部 API 呼び出し / 新規パッケージ追加 |
| ASK-EACH | 毎回確認 | force-push to main / prod deploy / DB drop / 第三者通知 |

---

## 2. ACT に倒す条件 (聞かない条件)

以下を **すべて** 満たすなら ASK しない:

1. **可逆性**: ローカルファイル / branch / 一時環境のみに作用し、git や snapshot で巻き戻せる。
2. **影響半径**: 自分のワークツリー以内。共有資源 (main / prod / 外部 API / Slack) に伝播しない。
3. **既知性**: Runbook 化済み、または Expert Registry の事前承認カテゴリに該当。
4. **コスト**: 1 操作のコストが事前承認上限内 (LLM token / 外部 API quota)。

→ [03_blast-radius-rubric.md](./03_blast-radius-rubric.md) の決定木に従う。

---

## 3. ASK に倒す条件 (聞く条件)

以下のいずれかに該当するなら ASK:

- **不可逆**: ファイル削除、branch 強制更新、外部送信、課金発生。
- **共有資源への作用**: main branch、prod 環境、共有 DB、第三者ツール (Slack / Jira / Email)。
- **アーキテクチャ判断**: PRD / requirements / design レベルの方針分岐。
- **新規外部呼び出し**: 初回の MCP / API 呼び出し、特に課金や個人データを伴うもの。
- **PII / secret 接触**: 個人情報、認証情報、社外秘の読み書き。

---

## 4. 承認時の提示フォーマット

ASK 時は次の 5 項目を 1 メッセージにまとめる。逐次質問はしない。

```
[ASK] <一文で何をするか>
- 影響半径: <local | shared | external>
- 可逆性: <即時 | 数分 | 不可>
- リスク: <想定される悪結果と確率>
- 代替案: <もしあれば 1〜2 個>
- 既定で YES なら省略可: <該当する事前承認条項>
```

ユーザーは YES/NO/代替案 の 3 択で即答できる。

---

## 5. 反パターン

| 反パターン | 害 | 対処 |
|---|---|---|
| 全アクションで都度確認 | 認知疲労、判断雑化 | 事前承認リスト ([02_pre-authorized-actions.md](./02_pre-authorized-actions.md)) を整備 |
| `--dangerously-skip-permissions` 多用 | 不可逆操作の事故 | プリセット ([04_settings-presets.md](./04_settings-presets.md)) で絞る |
| ASK 時の情報不足 (理由・代替案なし) | ユーザーが盲判定する | §4 のフォーマット強制 |
| 一度の YES を永続承認と解釈 | 範囲逸脱 | ASK-ONCE はセッション境界で reset |
| 内部権限ステータスをユーザーへ露出する (例:「push は ASK 該当のため保留しています」「権限がないため実行できません。実行してよいか教えてください」) | ハーネスの ASK/ALLOW 状態は agent 内部の都合であり、ユーザーは判断材料を持たない。露出すると承認疲労 + 信頼低下を招く | ASK で弾かれた場合も「保留」通知を出さず、agent 側で代替手段 / 再試行を試みる。それでも進めない場合に限り、§4 フォーマットで **人間可読な事実と選択肢** を提示する |

---

## 6. セッション境界

- セッション開始時: 事前承認リストを読み込む。
- セッション中: ASK-ONCE の承認はセッション内のみ有効。
- セッション終了時: 事後ログを `45_runbook/` 候補として評価 ([45_runbook/03_capture-trigger.md](../45_runbook/03_capture-trigger.md))。

---

## 7. ユーザーが「以後聞かないで」と言ったら

- そのアクションを **明示的に事前承認リストに追記** する ([02_pre-authorized-actions.md](./02_pre-authorized-actions.md))。
- 範囲を狭く書く (例: `git commit` ではなく `git commit -m "*" -- <配下のみ>`)。
- 範囲外は引き続き ASK。

---

## 出典

- BP-011 (permissions): allowlist for known-safe tools, Anthropic Claude Code best practices, https://code.claude.com/docs/en/best-practices, retrieved_at: 2026-06-23
- BP-012 (permissions): OS-level sandboxing, https://code.claude.com/docs/en/best-practices, retrieved_at: 2026-06-23
- BP-013 (hooks): PreToolUse for destructive ops, https://code.claude.com/docs/en/hooks, retrieved_at: 2026-06-23

## 不確実性

- 「不可逆」「共有資源」の境界はプロジェクトごとに揺れる。本章は既定値を提示するが、各プロジェクトの `settings.local.json` で上書きする前提。
- セッション境界の永続化方式 (どこまでを 1 セッションと扱うか) は CLI のバージョンに依存し、四半期ベンチで再検証する。
