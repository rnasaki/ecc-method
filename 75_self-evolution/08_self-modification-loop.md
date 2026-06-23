# 08 — Self-Modification Loop (自己改変ループ)

retrieved_at: 2026-06-23

`75_self-evolution/` の Stage 11 として、エージェント自身の system prompt / skill / agent 定義を **agent 自身が改訂** し、A/B eval で勝者を採用する darwinian な自己改変ループを定義する。

`02_auto-update-loop.md` (Stage 1〜7) は **外部出典の更新を本パッケージに反映する** ループであり、本章は **エージェント自身を改訂する** ループとして補完関係にある。

---

## 1. 位置付け

| ループ | 主入力 | 主出力 |
|---|---|---|
| Stage 1〜7 (`02_auto-update-loop.md`) | 公式 docs / Registry の差分 | 本パッケージ章本文・Runbook の更新 patch |
| **Stage 11 (本章)** | eval 回帰 / drift 検知 / 利用ログ | agent 定義 / skill / system prompt の改訂版 |

両ループは別チャネルで動き、最終 patch は `60_quality-gates/07_gate-checklist.md` の同一ゲートを通過する。

---

## 2. なぜ自己改変ループか

外部から本パッケージを書き換えるだけでは、**agent 個体の挙動劣化** には追従できない:

- skill / agent 定義は人手編集が前提だが、世代を重ねるほど局所最適から動けなくなる
- eval スコアが下がっても「どの定義をどう書き換えれば回復するか」は人間が当てる必要がある
- 定義を当てる人手側のスループットが律速になり、改善頻度が落ちる

`Darwin Gödel Machine` (arXiv 2505.22954) は、エージェント自身に自分のコードを改訂させ、ベンチマーク経由で改訂版を経験的に検証することで、SWE-bench を 20% → 50%、Polyglot を 14.2% → 30.7% に押し上げたと報告している。同種の発想を本パッケージの「agent 定義改訂」レイヤに適用するのが本章の目的である。

---

## 3. 自己改変ループの全体像

```
[A 観測] → [B 仮説] → [C ドラフト] → [D A/B eval] → [E 採否判定] → [F 採用 or 退避]
   ↑                                                                       │
   └───────────── archive 蓄積 / cost 上限 / revert 経路 ────────────────┘
```

| Stage | 入力 | 主担当 (Role) | 出力 |
|---|---|---|---|
| A 観測 | eval-regression / drift / 利用ログ | `explorer-research` | 改訂候補対象 ID リスト |
| B 仮説 | 候補対象 + 失敗事例 | `architect` | 改訂仮説 (≤ 3 案) |
| C ドラフト | 仮説 | `planner` | 改訂版 patch (定義ファイル単位) |
| D A/B eval | 旧版 + 新版 | `agent-evaluator` (生成と別個体) | rubric 5 軸スコア + cost / latency |
| E 採否判定 | A/B eval 結果 | `agent-evaluator` + 人間の終了承認 | accept / archive |
| F 採用 or 退避 | 判定 | `builder-fixer` | git commit (採用) または archive (退避) |

各 Stage は [40_delegation/03_delegation-contract.md](../40_delegation/03_delegation-contract.md) の契約形式で受け渡す。

---

## 4. 版管理 (定義ファイルのバージョニング)

改訂対象は次の 3 種:

| 種別 | 例 | 版管理単位 |
|---|---|---|
| agent 定義 | `~/.claude/agents/<name>.md` | 1 ファイル = 1 個体 |
| skill 定義 | `~/.claude/skills/<name>/SKILL.md` | skill ディレクトリ単位 |
| system prompt 断片 | METHOD.md §X 等の本パッケージ章 | section 単位 |

各個体には **世代 ID** を付ける:

```
agent_id: planner
generation: g0042
parent_generation: g0041
created_at: 2026-06-23T...
eval_baseline: eval-baseline-v3
```

git commit を世代の正本とし、`generation` は commit hash 短縮形で良い。

---

## 5. archive の構造 (Darwin 風)

採用版・敗者版を **両方** archive に残す。これは DGM が「diverse, high-quality agents の tree」を保持して並列探索する設計に倣う。

```
ecc-method/75_self-evolution/_archive/
├── planner/
│   ├── g0040.md       (旧採用版)
│   ├── g0041.md       (現採用版)
│   ├── g0041_b.md     (敗者: g0041 と並走した代替案)
│   └── INDEX.yaml     (世代ツリーと eval スコア)
└── ...
```

`INDEX.yaml`:

```yaml
agent_id: planner
generations:
  - id: g0041
    parent: g0040
    status: active
    eval_score:
      accuracy: 0.86
      completeness: 0.82
      clarity: 0.88
    cost_per_run_usd: 0.034
    accepted_at: 2026-06-20
  - id: g0041_b
    parent: g0040
    status: archived
    eval_score:
      accuracy: 0.79
    archived_reason: A/B eval で 5% 以上低下
```

archive 必須理由: 後続世代から「過去案を再評価して復活させる」経路を残すため。線形上書きは退化を招く。

---

## 6. A/B eval の設計

`55_verification/04_eval-regression.md` の dataset / rubric を流用する。本章固有の追加要件:

- **同一 dataset / 同一 rubric / 同一 judge model** で旧版と新版を走らせる
- judge は **生成側と別個体** に固定 (BP-024 独立検証, 60_quality-gates/06_red-team-loop.md と整合)
- 5 軸 (accuracy / completeness / clarity / actionability / conciseness) のうち **複数軸で baseline 比 +N% かつ全軸で −5% 未満** を採用条件にする
- cost / p95 latency の劣化幅も並記し、品質と費用の両面で判定する

採用閾値 (初期値):

| 指標 | 採用条件 (初期値) |
|---|---|
| 主要軸 (accuracy or completeness) | +3% 以上 |
| 全軸 | 旧版比 −5% 未満 |
| cost_per_run | 旧版比 +20% 未満 |
| p95 latency | 旧版比 +25% 未満 |

閾値変更は PR レビュー必須 (`55_verification/04_eval-regression.md` §6 と同じ規律)。

---

## 7. 人間介在は「終了条件のみ」

中間ステップ (A〜D) は agent が自走する。人間の関与点は次の 2 点のみ:

1. **採用承認**: Stage E で `accept` 判定が出た改訂のみ、人間が最終 merge ボタンを押す
2. **緊急停止**: cost / 改変回数 / 異常 KPI のいずれかが閾値を超えたら自動停止 → 人間判断待ち

これは [50_permissions/01_consent-economy.md](../50_permissions/01_consent-economy.md) の ASK 行動原則と整合する: agent 定義の改訂は「第三者にも見える挙動変化」を起こすため、初回採用は ASK 扱いが妥当。

---

## 8. 暴走防止 (safety guardrails)

DGM 系の自己改変は、暴走すると agent 自身が eval を歪めたり改訂回数を肥大化させる。本章は以下を強制する:

| ガード | 仕様 (初期値) |
|---|---|
| cost budget | 1 改訂あたり token / USD 上限 (案件側で設定) |
| 改変回数上限 | 1 個体につき 1 日 ≤ 3 世代まで |
| 自己 eval 禁止 | judge は必ず生成と別個体・別 system prompt |
| revert 経路 | 採用後 7 日以内に KPI 悪化したら自動 git revert |
| 改変対象 allowlist | METHOD.md §1〜3 / 原則本文 / 出典セクションは agent から書き換え禁止 |
| 検知ログ | 全改訂は git log + archive INDEX に二重記録 |

`safety-guard` skill (案件で利用可) と組み合わせ、改変 patch のサイズや禁止 path 触手を pre-commit で機械検査する。

---

## 9. 既存 Stage 1〜10 との整合

`75_self-evolution/` の章番号体系:

| Stage | 章 | 主役 |
|---|---|---|
| Stage 1〜7 | `02_auto-update-loop.md` | 公式 docs 由来の更新を本パッケージに反映 |
| Stage 8 | `03_knowledge-acquisition.md` | 新ナレッジの取り込み |
| Stage 9 | `04_self-repair.md` | 矛盾検知・自動修復 |
| Stage 10 | `05_industry-radar.md` / `07_review-cadence.md` | 四半期 radar・週次レビュー |
| **Stage 11 (本章)** | `08_self-modification-loop.md` | agent 自身の定義を改訂 |

Stage 1〜7 が「外部 → パッケージ」、Stage 11 が「パッケージ → agent 個体」を担う。

---

## 10. 起動条件

| トリガ | 起動範囲 |
|---|---|
| eval-regression が baseline 比 −5% を 2 回連続で記録 | 該当 agent / skill のみ Stage A〜F を起動 |
| drift 検知で agent 出力の format 不整合が増加 | 該当 agent の Stage B〜D |
| 月次レビュー | 全 agent を対象に Stage A 観測のみ実行 |
| 四半期 radar | 改訂候補トップ N に対し Stage A〜F を完走 |
| 人間による手動指定 | 単発実行 (cost budget 適用) |

---

## 11. アンチパターン

| アンチパターン | 起こること | 対策 |
|---|---|---|
| 採用版だけ archive、敗者を捨てる | 退化を招き、再評価の経路を失う | §5 archive 必須 |
| 同一 agent が生成も judge も担う | self-review で sycophancy 化 | judge は別個体 (BP-024) |
| 閾値を下げて採用率を上げる | 静かな品質劣化 | §6 閾値変更は PR レビュー必須 |
| 改変対象に METHOD.md §1〜3 を含める | 原則レベルの自走改訂は監査不能 | §8 allowlist で禁止 |
| revert 経路なしに採用 | 後段で問題が出ても戻せない | §8 自動 revert を設定 |
| eval を本番経路と同じ依存に固定 | 上流障害で eval が巻き添えに | mock + 実依存の二系統 (`04_eval-regression.md` §6) |

---

## 出典

- L1: arXiv 2505.22954 — Darwin Gödel Machine: Open-Ended Evolution of Self-Improving Agents (https://arxiv.org/abs/2505.22954, retrieved_at: 2026-06-23)
  - 内容: 自己改変エージェントが自身のコードを改訂し、ベンチマークで経験的に検証。archive と並列探索で SWE-bench 20% → 50%、Polyglot 14.2% → 30.7%。
- L1: Anthropic 公式 — Claude Code Sub-agents ドキュメント (https://code.claude.com/docs/en/sub-agents, retrieved_at: 2026-06-23)
  - 内容: agent 定義ファイルの構造と版管理の参考。
- L2: ECC 内部参照 — `55_verification/04_eval-regression.md`, `60_quality-gates/06_red-team-loop.md`, `50_permissions/01_consent-economy.md`, `02_auto-update-loop.md`
- L2: 本パッケージ METHOD.md §10 自己更新ループ (retrieved 2026-06-23)

## 不確実性

- DGM の数値 (SWE-bench 20% → 50%) は arXiv 公開値。社内 dataset での再現性は **未検証**。本章で示す閾値は ECC 初期値で、半期ごとに再校正前提。
- §6 採用閾値 (主要軸 +3% / 全軸 −5% 未満) は業界横断のベンチマーク値ではなく ECC 初期値。利用ログから再校正する。
- §8 暴走防止の上限値 (1 日 3 世代 / cost budget) は案件依存。導入先で再設定すること。
- agent 自身による自己改変は arXiv 段階の研究知見が中心であり、商用環境での長期運用ベストプラクティスは確立途上。本章は「仕組みの定義」までを担い、常時稼働の実体は導入先の CI / 権限設計で構築する。
- judge と人間の合意率 (kappa) の許容下限は `04_eval-regression.md` の暫定値 0.7 を本章でも初期値とする (未検証)。
