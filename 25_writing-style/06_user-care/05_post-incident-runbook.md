# 05 — Post-Incident Runbook (衝突原因の Runbook 化手順)

[02_first-response-protocol.md](./02_first-response-protocol.md) Step 6 の詳細手順。ユーザーとの衝突 (感情検知 / 同一訂正 / 明示的停止指示) が発生し解消した後、原因と解消手順を Runbook 化して再発を防ぐ。

## 1. 目的

- ゼロ重複原則 ([README.md §原則](../../README.md)) を達成する。
- 同種の衝突が再発したとき、検知 → 復唱 → 阻害要因絞り込みのステップを **省略** して直接対処に入れるようにする。
- 衝突を「個別の事故」で終わらせず、Method の継続改善材料にする。

## 2. 起動条件

衝突が解消した直後 (Step 5 で実行した「次の 1 手」が成功した直後) に以下のいずれかなら起動する。

- 同じ阻害要因が同一案件で 2 回以上発生した
- 解消手順が 3 ステップ以上だった
- 解消までに 30 分以上かかった
- ユーザーから明示的に「次回は最初からこうしてほしい」の発話があった

## 3. Runbook の場所と命名

- 配置: `45_runbook/incidents/<YYYY>/<incident-id>.md`
- incident-id: `INC-<YYYYMMDD>-<seq>` (例: `INC-20260623-01`)
- INDEX 更新: `45_runbook/INDEX.md` に 1 行追加

## 4. Runbook テンプレート

```markdown
# INC-<YYYYMMDD>-<seq> — <短い症状>

## メタ
- 発生日時: <ISO8601>
- 解消日時: <ISO8601>
- 案件: <project-id>
- 阻害要因カテゴリ: <認識ずれ / 権限不足 / 失敗連鎖 / 情報過多 / 待ち時間>
- 重大度: <low | medium | high>
- 検知トリガ: <直接シグナル / 反復 / 明示停止>
- 関連 Runbook: <既存 Runbook id があれば>

## 症状
- ユーザー発話の特徴 (1〜3 行、引用)
- システム側で観測した事象 (エラーメッセージ / ログ抜粋)

## 直接原因
- 1 文で。なぜ詰まったか。

## 根本原因
- 1〜3 文で。なぜその直接原因が発生したか (5 Whys)。

## 解消手順 (再発時の処方箋)
1. <コマンド or 操作>
2. <コマンド or 操作>
3. <コマンド or 操作>

## 検証手順
- 解消したことをどう確認するか (テスト / ログ / 出力例)。

## 再発防止策
- 永続化された変更 (設定ファイル / hook / Runbook / Registry エントリ)。

## 出典
- 該当案件のチャットログ ID / commit hash / PR URL
- retrieved <YYYY-MM-DD>

## 不確実性
- (前提) 〜
- (未検証) 〜
```

## 5. 5 Whys の使い方

「根本原因」セクションでは 5 Whys を **必ず 1 回** 通す。直接原因で止めない。

例:

```
直接原因: deploy が build cache 不整合で失敗した
  Why 1? buildpack が requirements.txt を旧キャッシュから読んだ
  Why 2? requirements.txt の場所をリポジトリ直下に置いていなかった
  Why 3? backend ディレクトリ構成のドキュメントが Runbook 化されていなかった
  Why 4? deploy 手順を口頭で伝達しており文書化を後回しにしていた
  Why 5? deploy 手順は「初回だけ確認すれば良い」と判断していた
根本原因: deploy 手順を Runbook 化していなかった (Why 5)
再発防止: 45_runbook/deploy-<platform>.md を作成し INDEX 更新
```

## 6. 永続化チェック (再発防止のレベル分け)

| レベル | 内容 | 効果 |
|---|---|---|
| L1 | Runbook を書く | 次回検索すれば手順が出る |
| L2 | Registry エントリに反映 ([40_delegation/01_expert-registry.md](../../40_delegation/01_expert-registry.md)) | 委任先・モデル選定が自動で改善 |
| L3 | hook / lint で機械的に検知 | そもそも再発しない |
| L4 | 設定ファイル / プリセットを更新 | 別案件にも横展開される |

最低でも L1 を達成する。L3 / L4 まで上げられるなら積極的に上げる。

## 7. INDEX 更新

`45_runbook/INDEX.md` に 1 行追加する。形式は以下。

```
| INC-<YYYYMMDD>-<seq> | <短い症状> | <カテゴリ> | <key tags> | <last_verified> |
```

`key tags` には grep で引きやすいキーワードを 3〜5 個入れる (例: `deploy`, `buildpack`, `python`, `cache`)。

## 8. 月次レビュー

`75_self-evolution/` の月次レビューで以下を観測する。

- INC-* Runbook の発生本数
- カテゴリ分布 (どの阻害要因が多いか)
- 同一カテゴリの再発間隔
- L3 / L4 まで永続化された割合

カテゴリ分布が偏っている場合、Method 側の章 (例: 失敗連鎖が多いなら [60_quality-gates/](../../60_quality-gates/)) を強化する。

## 9. アンチパターン

| アンチパターン | 害 |
|---|---|
| 「次回気をつける」だけで終わる | 何の永続化もない。再発する |
| 直接原因止まりで 5 Whys を回さない | 表層対処になる |
| Runbook を書いて INDEX を更新しない | grep で見つからず再発する |
| ユーザー名・組織名を Runbook に書く | 配布不能になる ([01_voice.md](../01_voice.md) §2.5) |
| 「ユーザーが悪かった」で締める | 根本原因の特定を放棄している |

## 10. 完了基準

以下をすべて満たしたら完了。

- [ ] Runbook ファイルが `45_runbook/incidents/` 配下に作成された
- [ ] 5 Whys を 1 回通した
- [ ] 再発防止策が L1 以上で永続化された
- [ ] `45_runbook/INDEX.md` が更新された
- [ ] 個人名・組織名・固有プロダクト名を含まない
- [ ] 「## 出典」「## 不確実性」セクションが付いている

## 出典

- 本パッケージ METHOD.md §7 Runbook System (retrieved 2026-06-23, ecc-method/METHOD.md)
- 本パッケージ METHOD.md §9 ユーザーケア (retrieved 2026-06-23, ecc-method/METHOD.md)
- 本パッケージ 25_writing-style/06_user-care/02_first-response-protocol.md (retrieved 2026-06-23)
- 本パッケージ 05_principles/01_seven-habits-mapping.md Habit 7 (retrieved 2026-06-23)

## 不確実性

- (前提) Runbook の配置先 (`45_runbook/incidents/<YYYY>/`) は本パッケージの規約。既存案件で別構成を採用している場合、案件側で吸収すること。
- (前提) 5 Whys は単一原因の追跡に偏りやすい。複数原因が絡む場合は fishbone / Ishikawa diagram を別途併用する選択肢がある。
