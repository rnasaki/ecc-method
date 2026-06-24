---
keywords: [permissions, cost, budget, enforcement]
related: [50_permissions/05_escalation-policy.md, 50_permissions/01_consent-economy.md, 40_delegation/03_delegation-contract.md, 50_permissions/03_blast-radius-rubric.md, 75_self-evolution/01_freshness-policy.md]
---
# 06 — Cost / Budget Enforcement (コスト上限と自動停止)

エージェント運用の予算超過を **検知 / 警告 / 停止 / 巻き戻し** で制御するための独立章。Delegation Contract のプレースホルダ「コスト上限」を実体化し、escalation policy ([05_escalation-policy.md](./05_escalation-policy.md)) の L2 条件「コスト上限超過予測」に実行可能な発火条件を与える。

---

## 1. なぜ enforcement が独立章として必要か

承認最小化原則 ([01_consent-economy.md](./01_consent-economy.md)) の下では、エージェントは多くの操作を自走させる。一方でモデル呼び出し / 外部 API / 検索系 MCP は **暴走時に分単位で予算が溶ける**。

- 承認を減らすほど、コスト超過時の唯一のブレーキは **自動 enforcement** になる。
- escalation policy Escalation L2 「コスト上限超過予測」は閾値・観測点・停止手段が無いと発火できない。
- Delegation Contract §5 ([../40_delegation/03_delegation-contract.md](../40_delegation/03_delegation-contract.md)) の「コスト上限: <token>」は、呼び出し側が enforcement を持って初めて契約として成立する。

本章は「上限の宣言 → 観測 → 段階停止 → 巻き戻し → 学習」までを一筆書きで規定する。

---

## 2. リーダー側 (公式) の仕組み

| 提供 | API / 機能 | 用途 |
|---|---|---|
| Anthropic | Usage and Cost Admin API (`/v1/organizations/usage_report/messages`, `/v1/organizations/cost_report`) | 組織 / workspace / api_key / model 単位の token・USD コストを `1m` / `1h` / `1d` で取得 |
| Anthropic | Message Batches API | 非同期一括処理で **コスト 50% 削減**、多くは 1 時間以内に完了 |
| OpenAI | Usage API | 組織単位の token / 課金粒度の取得 |
| OpenAI | Agents SDK Tracing | trace / span 階層で agent / generation / tool call を記録、custom processor で外部観測基盤に流せる |

Anthropic Usage API は **データ反映 ~5 分**, **推奨ポーリング 1 回 / 分** という運用上の制約があるため、リアルタイム enforcement には自前のローカル計上が必須となる。

---

## 3. 階層別予算 (Budget Hierarchy)

予算は 4 階層で宣言する。下位は上位を超過できない。

| 階層 | 単位 | 典型しきい値 (warn / soft-stop / hard-stop) |
|---|---|---|
| Session | 1 セッション (会話) | 50% / 80% / 100% |
| Agent / Subagent | Delegation Contract 1 件 | 60% / 85% / 100% |
| Workflow | 機能開発 1 サイクル (PRD → ship) | 70% / 90% / 100% |
| 月次 / 組織 | カレンダー月 | 70% / 90% / 95% |

各しきい値は **token / USD / 外部 API 呼び出し回数** の 3 軸で並走させる。token 換算が困難な MCP 操作 (例: 検索クォータ) は呼び出し回数で代替する。

---

## 4. ECC 実装

### 4.1 宣言 — Delegation Contract

`./40_delegation/03_delegation-contract.md` §5 の「コスト上限」を **必須パラメータ化**:

```yaml
budget:
  tokens_in: 30000
  tokens_out: 10000
  usd: 0.50
  external_calls: 20
on_exceed: soft_stop   # warn | soft_stop | hard_stop
fallback_model: mid    # premium → mid → small
```

宣言なしの委任は orchestrator 側で reject する。

### 4.2 観測 — PreToolUse / PostToolUse hook

| Hook | 役割 |
|---|---|
| PreToolUse | 直近の累積コスト + 当該呼び出しの **見積** を加算し、hard-stop 閾値超過予測なら block。soft-stop 閾値超過なら新規 spawn 系ツールのみ block |
| PostToolUse | 実 token / 実コストを `.claude/logs/cost.jsonl` に追記 |
| Stop | session 合計を確定し、上位階層 (workflow / monthly) に集計 |

見積アルゴリズムは「直近 N 呼び出しの平均 × 安全係数 1.3」で十分。精度より **発火の確実性** を優先する。

### 4.3 連携 — Token Budget Advisor

token 観点の助言は Token Budget Advisor skill に委ね、enforcement 本体は本章のしきい値に基づく決定的な gate として動く。助言と enforcement を **同一エージェントに集約しない** (生成 ≠ 判定の原則)。

---

## 5. 超過時の挙動 (3 段階)

> 本章で「L0/L1/L2/L3」と書くものは **Escalation Level** (人へのエスカレーション階層) を指す。Memory layer / Registry Layer / Detection tier とは別概念。

| 段階 | 発火条件 | 既定挙動 | escalation 先 |
|---|---|---|---|
| warn | warn 閾値 到達 | ログ + ユーザー通知のみ。作業継続 | 自分 (Escalation L0) |
| soft-stop | soft-stop 閾値到達 | 進行中 subagent は完了まで待つ。**新規 spawn 停止 / 新規外部呼び出し停止** | 別エージェント (Escalation L1) もしくは ユーザー (Escalation L2) |
| hard-stop | hard-stop 閾値到達 / 予測超過 | **即時停止**。直近の不可逆操作を ロールバック手順 ([../50_permissions/03_blast-radius-rubric.md](./03_blast-radius-rubric.md)) に従って巻き戻し検討 | ユーザー (Escalation L2 / 状況により Escalation L3) |

各段階は escalation policy の Level マッピングに従い、`.claude/logs/escalations.jsonl` に同時記録する。

---

## 6. フォールバック戦略

hard-stop を避けるため、warn → soft-stop の間に以下を **自動候補** として提示する。

1. **モデル降格**: premium (例: 上位推論モデル) → mid (例: 標準推論モデル) → small (例: 軽量モデル)。降格時は出力品質の劣化リスクを 1 行で添える。
2. **並列度縮減**: 同時 subagent 数を `max_parallel` から半減。Workflow 全体の SLA を再見積。
3. **バッチ化**: 即時応答が不要なものを Message Batches 系の非同期パスに寄せ、約 50% のコスト削減を狙う。
4. **スコープ縮小提案**: 機能 AC のうち priority 低位を「次サイクル送り」にする提案を planner 経由で提出。
5. **キャッシュ強化**: prompt caching を有効化し、固定プロンプト分の課金を削減。

自動降格は **可逆な範囲** に限定する。ファイル書き込みやデプロイの途中での降格は禁止。

---

## 7. メトリクス

`75_self-evolution/06_health-metrics.md` に統合する指標:

| 指標 | 定義 | 用途 |
|---|---|---|
| session_cost | 1 session の合計 USD / token | 暴走検知 |
| agent_cost | Delegation Contract 1 件の実コスト | 委任見積精度の改善 |
| cost_per_AC | 機能 1 AC 充足あたりのコスト | 機能の費用対効果 |
| cost_per_task | tasks.md の 1 task あたりのコスト | 過大設計の検知 |
| fallback_rate | 全呼び出しに占める降格発火率 | 上限値の妥当性確認 |
| hard_stop_rate | hard-stop 発火頻度 | 設計欠陥のシグナル |

鮮度ポリシー ([../75_self-evolution/01_freshness-policy.md](../75_self-evolution/01_freshness-policy.md)) に従い、月次でしきい値を見直す。

---

## 8. アンチパターン

| アンチパターン | 害 |
|---|---|
| 上限を設定しない | 暴走で予算枯渇、サービス停止 |
| warn のみで stop しない | 警告慣れし、結局止まらない |
| ロールバックなしで hard-stop | 中途半端な状態の成果物が残る |
| 月次予算を session に流用 | 月初で枯渇、後続作業が全停止 |
| 見積を高精度化しすぎる | hook が重くなり本体タスクが遅延 |
| premium → small へ一段飛ばし降格 | 品質劣化が大きく作業がやり直し |
| usage api のラグを考慮しない | 5 分前の値で判断し、超過を素通り |

---

## 出典

- Usage and Cost Admin API (endpoints / time buckets / freshness ~5min / poll 1/min): https://platform.claude.com/docs/en/api/usage-cost-api retrieved_at: 2026-06-23
- Message Batches API (50% cost reduction, mostly < 1 hour): https://platform.claude.com/docs/en/build-with-claude/batch-processing retrieved_at: 2026-06-23
- OpenAI Usage API (organization usage endpoints): https://platform.openai.com/docs/api-reference/usage retrieved_at: 2026-06-23
- OpenAI Agents SDK Tracing (trace / span / custom processors): https://openai.github.io/openai-agents-python/tracing/ retrieved_at: 2026-06-23

## 不確実性

- 各しきい値 (50/80/100 等) は経験則。プロジェクトの SLA / 業務リスクで再校正前提。
- token 見積の安全係数 1.3 は推奨デフォルト。MCP / 外部ツールが多い構成では係数を引き上げる方が安全。
- OpenAI Usage API のリアルタイム性 / 粒度は本章執筆時点の公式 URL で再確認すること (公式ドキュメント直接取得が 403 で部分的に未確認)。
- 月次予算の組織側 quota は契約形態で変動するため、本章は枠組みのみ規定する。
