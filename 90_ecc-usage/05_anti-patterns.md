# 05 — Anti-Patterns (よくある誤用)

ECC 採用時にしばしば発生する誤用と、その回避策を列挙する。

## A-01 全部 Opus で動かす

**症状**: コストが想定の 5〜10 倍。レイテンシ悪化。

**原因**: モデル選定を委任構造と切り離して画一化している。

**回避**:

- BP-002 に従い、軽量タスクは Haiku、実装は Sonnet / GPT-5.5、最重要のみ Opus
- `40_delegation/02_routing-rubric.md` の重要度マトリクスで仕分け
- token-budget-advisor で予算可視化

## A-02 Workflow を使わず即実装

**症状**: 仕様が固まる前に実装が走り、再作業が頻発する。

**原因**: SDD → TDD の段階を省略している。

**回避**:

- METHOD.md §4 の 1 機能 1 ループを順守
- requirements が固まらないうちに design に進まない
- ハンドオフを Delegation Contract で記録

## A-03 Expert Registry を作らない

**症状**: 委任先が毎回ぶれ、再現性が崩れる。

**原因**: ad-hoc にエージェントを呼んでいる。

**回避**:

- `40_delegation/01_expert-registry.md` のスキーマで Layer 0 / 1 をカタログ化
- 案件側 Layer 2 を常に追記
- last_verified を四半期で更新

## A-04 Runbook 化なし (ゼロ重複違反)

**症状**: 同じ説明をユーザーに何度もさせている。

**原因**: 解決手順を Runbook 化していない。

**回避**:

- `45_runbook/01_runbook-spec.md` のスキーマで保存
- INDEX.md を grep して再利用
- Capture Trigger を毎タスク評価

## A-05 都度承認 (Consent Economy 違反)

**症状**: 既知操作にも承認を求め、進行が滞る。

**原因**: 権限設計が未整備で、Agent が defensive に動いている。

**回避**:

- `50_permissions/01_consent-economy.md` の ACT/ASK 表を採用
- 可逆操作・読み取り・既知 Runbook は ACT に集約
- 不可逆共有資源・初出操作のみ ASK

## A-06 並列起動を諦める

**症状**: 独立タスクが直列で流れ、研究時間が膨張する。

**原因**: 同一メッセージ内の複数 Agent 呼び出しを使っていない。

**回避**:

- BP-003: 独立タスクは 1 メッセージで複数 Agent
- ただし TDD ループ (P-002) は直列維持

## A-07 反対意見を取らない (Red-Team 不在)

**症状**: 重要決定が一面的。後から欠点が露呈。

**原因**: Generator = Judge になっている (self-review)。

**回避**:

- Pattern P-003 を強制適用
- generator / judge / refuter を別個体に
- rationale に反対意見を併記

## A-08 出典なしで断定する

**症状**: 主張が検証不能。誤情報の混入。

**原因**: L1 出典の必須化を運用していない。

**回避**:

- `25_writing-style/03_citation-style.md` に従い L1 を必須化
- L3 (モデル知識) 単独は禁止
- retrieved_at を出典に併記

## A-09 hooks を活用しない

**症状**: 規約チェックが手動。抜けが頻発する。

**原因**: 副作用を hooks に下ろしていない。

**回避**:

- Stop hook で禁止語 grep / 出典チェック
- PreToolUse / PostToolUse で整形 / 検査
- 規約は hooks で **強制** する

## A-10 skill / MCP を使わず Agent で全部解く

**症状**: コンテキスト肥大、コスト増。

**原因**: Skill (ナレッジパック) と MCP (外部リソース) を Agent で代替している。

**回避**:

- skill で再利用可能な知識を切り出す
- MCP で外部 docs / DB を tool 化する
- Agent はタスク特化のみ

## A-11 個人・組織情報を Runbook に書き込む

**症状**: 再配布できない。社外秘が漏れる。

**原因**: 案件固有情報と汎用ナレッジを混在させている。

**回避**:

- 本パッケージは中立。個人・組織情報を含めない
- 案件情報は別リポ (案件側 `examples/`) に隔離
- `99_distribution/01_how-to-redistribute.md` のチェックリストを通す

## A-12 一度作って放置する

**症状**: Registry / Runbook が陳腐化。リンク切れ。

**原因**: Self-Evolution ループを回していない。

**回避**:

- `75_self-evolution/02_auto-update-loop.md` を週次 / 月次 / 四半期で起動
- 健全性 KPI を継続監視
- last_verified を期限内に更新

## A-13 メモリを汚染する

**症状**: Memory に不要情報が蓄積し、context 経済が悪化。

**原因**: 全部を memory に放り込んでいる。

**回避**:

- project memory と user memory を分離
- 案件終了時に project memory を整理
- 一時 finding は `_tmp/` に置き memory に流入させない

## A-14 hooks で重い処理を走らせる

**症状**: ツール呼び出しごとに hook が遅延を生む。

**原因**: hooks で時間のかかる検査を同期実行している。

**回避**:

- hooks は軽量チェック専用
- 重い検査は Stop hook or 別 CI に分離

## 失敗 → 学習サイクル

アンチパターンに踏んだら:

1. 該当 commit をリンクして本章に追記
2. `65_pitfalls/` に再発防止 Runbook を生成
3. 健全性 KPI に当該症状の指標を追加 (該当時)

## 出典

- 本パッケージ METHOD.md §3 原則 (retrieved 2026-06-23)
- 本パッケージ 40_delegation/02_routing-rubric.md (retrieved 2026-06-23)
- 本パッケージ 25_writing-style/03_citation-style.md (retrieved 2026-06-23)
- 本パッケージ ./05_principles/_data/best_practices.json (BP-002, BP-003, BP-009, BP-010, retrieved 2026-06-23)

## 不確実性

- 14 件は初期版。運用ログから頻発するアンチパターンを継続追加する。
- アンチパターンの境界は案件特性により変動する (例: 試作期は A-02 を緩める余地)。導入先で重み付けを上書きしてよい。
