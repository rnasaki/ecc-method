# 05 — Maintenance

Runbook の鮮度管理・統合・廃止判定。書きっぱなしの Runbook は時間と共に「むしろ間違う」資産になる。定期メンテで active を保ち、古いものは明示的に死に方を選ばせる。

## 鮮度ステータス (再掲)

| status | 条件 | 表示 / 扱い |
|---|---|---|
| `active` | last_verified ≤ 90 日 | 通常運用 |
| `review-due` | 91〜180 日 | 引用時に「要再確認」警告 |
| `stale` | 181〜365 日 | 検索ヒット時にバナー表示 / 利用前確認推奨 |
| `deprecated` | 366 日超 or 明示廃止 | INDEX に残すが手順実行禁止 |

`status` は `last_verified` から導出可能 (`02_indexing-rules.md`)。`deprecated` のみ明示維持。

## 定期メンテのスケジュール

| 周期 | 作業 |
|---|---|
| 月次 | review-due / stale Runbook の棚卸し (≤ 30 分) |
| 四半期 | 全 Runbook の last_verified 確認、deprecated 候補の決定 |
| 年次 | カテゴリ構造 / タグ辞書の見直し |

スケジュールはあくまで目安。`active` 比率が 70% を切ったら臨時メンテを発動する。

## メンテのトリガ (定期外)

| トリガ | 対応 |
|---|---|
| Runbook の手順実行で失敗 | 該当 Runbook を `review-due` に降格 + 修正 PR |
| ツール / SDK のメジャーバージョン変更 | 影響 Runbook を全件確認 |
| カテゴリ追加 / タグ統一の必要 | INDEX の re-index |
| Capture Trigger で重複候補発生 | 既存 Runbook 更新 vs 新規作成を判定 |

## 統合判定 (Merge)

新規候補が既存 Runbook と重なる場合、新規作成 / 既存更新 / 統合 のいずれかを選ぶ。

### 統合の判断基準

```
trigger / 手順が 70% 以上重複
  → 既存に統合 (新規候補は破棄)

trigger は同じだが手順が分岐
  → 既存に「分岐ケース」セクション追加

trigger も手順も別物だが関連が強い
  → 別 Runbook で `related: [...]` リンク

ほぼ無関係
  → 新規 Runbook として独立
```

### 統合時の作法

1. 既存 Runbook の `updated` / `last_verified` を更新
2. 変更履歴セクションに統合記録
3. 削除した側 (新規候補) の slug を `deprecated` で INDEX に残すかは判断 (履歴必要なら残す、不要なら破棄)

## 廃止判定 (Deprecation)

### deprecate する場面
- 元手順が技術的に通用しなくなった (ツール廃止 / API 廃止)
- セキュリティ上、もはや実施すべきでない
- より良い手順が別 Runbook でカバー済

### deprecate の手順
1. frontmatter の `status: deprecated` 明示
2. 本文冒頭に「DEPRECATED: <理由> / 代替: [[RB-NNN]]」
3. INDEX の `status` を更新
4. 検索プロトコルでヒットしても警告表示

### deprecate しない例
- 単に古いだけ (今でも使えるなら `stale` に留める)
- 「読みづらい」「冗長」 (リファクタで対応)

## 鮮度の再認定 (Re-verify)

`stale` を `active` に戻す手順:

1. 手順を 1 度実際に走らせる (or 検証コマンドを再実行)
2. 結果が期待通りなら frontmatter の `last_verified` を今日に更新
3. 必要なら本文を最新版に微修正
4. INDEX 同期 (last_verified)

「読んだだけ」で再認定するのは禁止。実行検証が必須 (BP-027: evidence)。

## 整合性チェック (定期)

月次メンテ時に以下を確認:

- [ ] 全 Runbook ファイルが INDEX に登録済 (孤立ファイル検出)
- [ ] INDEX に登録された path が実在 (リンク切れ検出)
- [ ] frontmatter の `last_verified` と INDEX が一致
- [ ] 重複 ID がない
- [ ] `status: deprecated` の Runbook 本文に DEPRECATED 表示がある
- [ ] `related` リンクが実在 ID に向いている (or 将来予告として明示)

スクリプト化推奨 (`02_indexing-rules.md` § 整合性チェック)。

## 棚卸しの手順 (月次)

```bash
# 1. review-due / stale の一覧
grep -E "status: (review-due|stale)" 45_runbook/INDEX.md

# 2. 各 Runbook について以下を判断:
#    - 今でも有効 → 再認定 (Re-verify)
#    - 微修正で有効 → 修正 + 再認定
#    - もはや無効 → deprecated 化
#    - 統合先あり → 統合判定

# 3. 結果を変更履歴に記録
```

棚卸しは 30 分タイムボックス。10 件超ある場合は優先順 (利用頻度 / 影響度) で打ち切る。

## メンテ責務

| 役割 | 担当 |
|---|---|
| 月次棚卸し | プロジェクトオーナー or 指定 Orchestrator |
| Runbook 更新 PR レビュー | 関連 expert (`expert-routing` フィールド) |
| カテゴリ / タグ辞書 | プロジェクトオーナー |
| deprecated 化の最終承認 | プロジェクトオーナー (Orchestrator 単独で deprecate しない) |

Orchestrator は単独で `active` ↔ `review-due` ↔ `stale` の遷移は可。`deprecated` は人間承認を必要とする (誤って捨てない安全弁)。

## 統計の見える化 (推奨)

INDEX に以下サマリを併記:

```markdown
## 鮮度サマリ (YYYY-MM-DD 時点)

| status | 件数 | 比率 |
|---|---|---|
| active | NN | XX% |
| review-due | NN | XX% |
| stale | NN | XX% |
| deprecated | NN | XX% |

総数: NN
active 比率目標: ≥ 70%
```

`active` 比率が 70% を切ったら臨時メンテを発動する基準として使う。

## メンテで生まれた知見の還元

棚卸しで「同じ落とし穴を 3 件以上修正した」場合、それ自体が新しい Runbook 化候補 (`pitfall` カテゴリ)。具体例:

- 「ツール X のメジャーバージョン更新で 5 件の Runbook が陳腐化した」 → `RB-NNN-tool-x-version-migration-checklist`
- 「API endpoint の prefix 変更で複数 Runbook が壊れた」 → `RB-NNN-api-prefix-migration-checklist`

メンテ自体を Runbook 化することで、次回のメンテコストが下がる。

## アンチパターン

| アンチパターン | 症状 | 対処 |
|---|---|---|
| 書きっぱなしで放置 | stale だらけ | 月次棚卸しを義務化 |
| 「読んだだけ」で再認定 | 動かない手順が active 扱い | 実行検証必須 (BP-027) |
| deprecated を物理削除 | 過去手順が再生不能 | INDEX に残し status のみ変更 |
| 統合判断せず新規乱立 | 同じ trigger が複数 Runbook に | Capture 時に既存検索を必須化 |
| カテゴリ / タグの粗放 | 検索分散 | 年次見直しで辞書統一 |

## 出典

- BP-027: Anthropic Claude Code best practices (https://code.claude.com/docs/en/best-practices, retrieved 2026-06-23)
- BP-016: Anthropic Claude Code skills docs (https://code.claude.com/docs/en/skills, retrieved 2026-06-23)
- 内部 SSOT: `45_runbook/01_runbook-spec.md`, `45_runbook/02_indexing-rules.md`, `45_runbook/03_capture-trigger.md`, `45_runbook/04_search-protocol.md`

## 不確実性

- 鮮度しきい値 (90 / 180 / 365 日) はドメイン依存。変更頻度の高いツール (例: 主要 LLM SDK) を扱う Runbook はもっと短い (60 / 90 / 180) 方が安全。
- 月次棚卸しの 30 分タイムボックスは経験則。Runbook 数 ≥ 100 規模では足りない。
- `deprecated` 判定の人間承認はオペレーション上のチェック。完全自動化は誤廃止リスクが高い。
