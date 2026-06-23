# 10-02 — Domain Elicitation (ヒアリング設計)

ユーザーの頭の中にある **未文書の意図** を、最小質問で最大情報量で取り出すための設計。

## 設計原則

1. **既知は再質問しない** — Recon ([01_repo-recon.md](./01_repo-recon.md)) で確定済みの事項を再度問わない (BP-018)。
2. **Yes/No より MCQ より自由記述** の順で取得効率を上げる。回答コストを下げる。
3. **3 質問 / バッチ** を上限とする。一度に 5 つ並べると回答が薄くなる。
4. **委任ファースト** — 質問設計自体を planner に委任して、質問の重複と粒度ばらつきを排除する。
5. **回答は Runbook に蓄積** — 同じドメインで再度立ち上げる場合に再利用する。

## 質問テンプレート (4 軸)

### 軸 1: ゴール (Why)

| 質問 | 形式 | 既定回答候補 |
|---|---|---|
| この案件で 90 日後に達成したい状態は? | 自由 | (なし) |
| 成功したと言える KPI は? | 自由 | conversion / latency / accuracy / cost |
| 失敗の定義は? | 自由 | (なし) |

### 軸 2: ユーザー (Who)

| 質問 | 形式 | 既定回答候補 |
|---|---|---|
| 一次ユーザーの役割は? | MCQ | end-user / operator / developer / analyst / executive |
| 想定スキルレベルは? | MCQ | novice / intermediate / advanced |
| 同時アクセス想定規模は? | MCQ | <10 / <1k / <100k / >100k |

### 軸 3: 制約 (Constraint)

| 質問 | 形式 | 既定回答候補 |
|---|---|---|
| データの機密区分は? | MCQ | public / internal / confidential / regulated |
| デプロイ先の制約は? | MCQ | cloud-public / cloud-private / on-prem / edge / hybrid |
| 監査・コンプライアンス要件は? | MCQ | none / GDPR / HIPAA / PCI-DSS / SOC2 / 業界固有 |
| 月次運用予算上限は? | MCQ | <$100 / <$1k / <$10k / >$10k |

### 軸 4: スコープ (What)

| 質問 | 形式 | 既定回答候補 |
|---|---|---|
| MVP に必須の機能 3 つは? | 自由 | (なし) |
| 明示的に除外する機能は? | 自由 | (なし) |
| 既存システムとの統合は? | MCQ | standalone / 既存 DB 共有 / 既存 API 利用 / replace existing |

## 進行プロトコル

```
1. Recon 完了を前提とする
2. planner に "Elicitation Plan" を委任:
   - 出力: 質問 6〜9 件 (3 質問 × 3 バッチ)
   - 各質問に "なぜこの情報が要るか" を併記
3. ユーザーに 1 バッチ目を提示
4. 回答受領 → 不確定が残れば 2 バッチ目を提示
5. 3 バッチ以内で確定しない場合は仮決定 + 不確実性として記録
6. 結果を 70_templates/PRD.template.md にマップ
```

## 質問品質ゲート

各質問は以下を満たすこと:

- [ ] Recon で取得済みではない
- [ ] 回答が PRD / requirements に直接マップできる
- [ ] Yes/No で答えられる場合は MCQ にしない (情報量不足)
- [ ] 専門用語にプレーン語の補足を併記
- [ ] 回答候補がある場合は最大 5 択 (Miller's law)

## 沈黙・即答時の挙動

| ユーザー反応 | 対応 |
|---|---|
| 「任せる」「いい感じに」 | taste カテゴリに委任、決定は仮置き、最後にレビュー依頼 |
| 「わからない」 | 既定値を提案 + 採用理由を併記 |
| 即答 (3 秒以内相当の確信) | 採用、Runbook に "確信回答" タグ |
| 長考 (返信遅延) | 進めずに待つ。並行で取得可能な情報のみ進める |

## 感情検知時の中断

ユーザーが苛立ち / 同じ訂正の反復を示した場合、即座に質問を停止し [25_writing-style/06_user-care/02_first-response-protocol.md](../25_writing-style/06_user-care/02_first-response-protocol.md) に従う。

## 出力フォーマット

```yaml
elicitation_result:
  retrieved_at: 2026-06-23
  goals: [<string>]
  kpi: [<string>]
  failure_modes: [<string>]
  users: { primary_role, skill_level, scale }
  constraints: { data_class, deploy_target, compliance, budget_monthly }
  scope: { mvp_must, exclude, integrations }
  uncertainties: [<string>]
  next_actions: [<string>]
```

`{{repo_root}}/_tmp/elicitation_result.yaml` に保存し、PRD ドラフトの起点とする。

## 出典

- Anthropic Claude Code: Best practices for agentic coding (https://www.anthropic.com/engineering/claude-code-best-practices, retrieved 2026-06-23)
- GitHub spec-kit (https://github.com/github/spec-kit, retrieved 2026-06-23)

## 不確実性

- 質問数の上限 (3 / バッチ) は経験則。複雑案件では 4 まで許容しうる。
- 「任せる」「いい感じに」のような曖昧指示の解釈は taste 委任で吸収するが、最終判断は人間レビューを推奨。
- elicitation_result.yaml のスキーマは v1.0。フィールド追加時は version を明記。
