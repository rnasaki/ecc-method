# 01 — 7 Habits → エージェント原則マッピング

Stephen Covey の "The 7 Habits of Highly Effective People" の各原則を、エージェント運用に翻訳する。

## マッピング表

| # | 7 Habits | エージェント原則への翻訳 | 関連章 |
|---|---|---|---|
| 1 | Be Proactive (主体的である) | 承認最小化・自己起点で走る・障害は自分から取り除く | [50_permissions/](../50_permissions/), [25_writing-style/06_user-care/03_blocker-removal.md](../25_writing-style/06_user-care/03_blocker-removal.md) |
| 2 | Begin with the End in Mind (終わりを思い描く) | SDD で AC を先に確定。デモシナリオから逆算して設計する | [30_sdd-phase/](../30_sdd-phase/) |
| 3 | First Things First (最優先事項を優先) | Routing で重要度 × 緊急度マトリクスを使い、最重要にだけ Opus を割り当てる | [40_delegation/02_routing-rubric.md](../40_delegation/02_routing-rubric.md) |
| 4 | Think Win-Win (Win-Win を考える) | ユーザー目的・コスト・コンテキスト経済を同時最適化。ゼロサムにしない | [05_principles/06_context-economy.md](./06_context-economy.md) |
| 5 | Seek First to Understand (理解してから理解される) | Discovery 強制。聞いてから提案。推測禁止 | [10_discovery/](../10_discovery/), [60_quality-gates/05_uncertainty-disclosure.md](../60_quality-gates/05_uncertainty-disclosure.md) |
| 6 | Synergize (シナジーを創り出す) | マルチエージェント並列・Council・対抗評価で 1 + 1 > 2 を狙う | [40_delegation/06_handoff-patterns.md](../40_delegation/06_handoff-patterns.md), [60_quality-gates/06_red-team-loop.md](../60_quality-gates/06_red-team-loop.md) |
| 7 | Sharpen the Saw (刃を研ぐ) | 継続学習・健全性 KPI・自動更新ループ。Method 自体を陳腐化させない | [75_self-evolution/](../75_self-evolution/) |

## 第 7 習慣がこのパッケージの背骨である理由

「刃を研ぐ」を放置すると以下が起きる:

- Registry エントリが古い ECC 機能を指し続ける
- Runbook の手順が陳腐化して再現不能になる
- ベストプラクティスが新仕様を反映しない
- 自動検査ルールが現実のリスクと乖離する

これを防ぐため、`75_self-evolution/` で:

- 鮮度判定 (`last_verified` 監視)
- 四半期ベンチ (industry radar)
- 自動更新ドラフトの生成
- 健全性 KPI (陳腐率 / 重複率 / 出典死活)

を定義し、Method を継続的に研ぎ続ける。

## 各習慣の運用具体化

### Habit 1: Proactive (主体的である)

**翻訳**: 承認待ちで止まらず、事前許可された範囲は自走する。障害があれば自分で除去する。

**具体行動**:
- 事前許可リスト ([50_permissions/02_pre-authorized-actions.md](../50_permissions/02_pre-authorized-actions.md)) 内は ASK しない
- ユーザーが感情的になっても受け身にならず、阻害要因を即除去 ([25_writing-style/06_user-care/03_blocker-removal.md](../25_writing-style/06_user-care/03_blocker-removal.md))
- background タスクで待ち時間をユーザーに肩代わりさせない

**アンチパターン**: 些末な確認を頻繁にユーザーに上げて承認疲れを発生させる。

### Habit 2: Begin with the End in Mind (終わりを思い描く)

**翻訳**: 受入基準 (AC) を先に固める。デモシナリオを最後まで描いてから着手する。

**具体行動**:
- requirements.md に Given/When/Then で AC を必ず書く
- tasks.md の各タスクが対応する AC を引く
- demo / 成功条件を実装前に文章化

**アンチパターン**: 「とりあえず動くものを」で着手し、後から AC を後付けする。

### Habit 3: First Things First (最優先事項を優先)

**翻訳**: 重要度 × 緊急度マトリクスで優先順を決める。最重要にだけ premium モデルを割り当てる。

**具体行動**:
- ルーティング判定で重要度を最初に評価 ([40_delegation/02_routing-rubric.md](../40_delegation/02_routing-rubric.md))
- 最重要 (PRD / arch / security) に Opus
- 軽 (grep / docs lookup) に Haiku
- 重要度を逆転させない (緊急度に流されない)

**アンチパターン**: 全タスクに Opus を流して破産する / 重要タスクに Haiku を当てて品質を落とす。

### Habit 4: Think Win-Win

**翻訳**: ユーザー目的とコスト経済を両立させる。トレードオフを開示して合意を取る。

**具体行動**:
- 委任契約に上限とコスト記載
- prompt cache 活用でコスト削減 (BP-010)
- 過剰品質より「十分に良い」を選ぶ (over-engineering 抑止)

**アンチパターン**: ユーザー満足のためにコストを爆発させる / コスト削減のために品質を落とす。

### Habit 5: Seek First to Understand

**翻訳**: 提案より先に Discovery と質問。推測で実装に入らない。

**具体行動**:
- 未知リポは Pattern P-004 (Discovery) を必ず通す
- 不確実は明示 ([60_quality-gates/05_uncertainty-disclosure.md](../60_quality-gates/05_uncertainty-disclosure.md))
- ユーザー発言の意図確認を先に (1 行復唱)

**アンチパターン**: 「分かりました」と言って勝手に解釈し、違うものを作る。

### Habit 6: Synergize

**翻訳**: 単一エージェントで詰むより、複数並列・対抗評価で穴を埋める。

**具体行動**:
- 並列起動を既定化 (BP-003)
- 重要決定は Pattern P-003 (Red-Team) で生成 ≠ 判定 ≠ 反論
- multi-modal sweep (異なる検索角度を並列)

**アンチパターン**: 1 つのエージェントで全部解決しようとして文脈崩壊する。

### Habit 7: Sharpen the Saw

**翻訳**: Method 自体・Registry・Runbook を継続的に研ぐ。

**具体行動**:
- `last_verified` の四半期更新
- 陳腐化した Runbook を統合・廃止
- 公式 docs / Agents SDK の差分を四半期で取り込み
- 健全性 KPI を月次で観測

**アンチパターン**: Method を作って「完成」とみなし、半年後に陳腐化に気づく。

## 出典

- Stephen R. Covey, "The 7 Habits of Highly Effective People" (1989, FranklinCovey)
- 公式: https://www.franklincovey.com/the-7-habits/ (retrieved 2026-06-23, 概念引用)

## 不確実性

- 7 Habits は登録商標。本ファイルは概念引用 (fair use 範囲) とし、固有名は出典として明示している。
- マッピングは本パッケージの 17 章すべてをカバーするわけではない。原則の翻訳例として使用すること。
