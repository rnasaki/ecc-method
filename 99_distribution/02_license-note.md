---
keywords: [distribution, note]
related: [99_distribution/01_how-to-redistribute.md, 25_writing-style/03_citation-style.md, 75_self-evolution/01_freshness-policy.md]
---
# 02 — License Note (内製ナレッジ取扱い注意)

本パッケージおよび派生物のライセンス選定指針と、出典の引き継ぎ義務を整理する。

## 1. 本パッケージの位置づけ

- 本パッケージは中立 (個人・組織・固有プロダクト名を含めない) で構成
- 公式 docs / 公開論文 / 公開ブログを出典とする L1 / L2 引用に基づく
- 派生・複製・改変を許容することを前提に書かれている

具体的なライセンス文面は派生先で選定する (`LICENSE` ファイルを同梱する形)。

## 2. ライセンスの選択指針

| 候補 | 性質 | 適合する派生形態 |
|---|---|---|
| CC BY 4.0 | クリエイティブ・コモンズ、帰属表示で再配布可 | ドキュメント主体 |
| CC BY-SA 4.0 | 同条件継承を伴う | 派生物にも同条件を要求したい場合 |
| MIT | コードに広く適合 | bootstrap.sh などスクリプト同梱時 |
| Apache-2.0 | 特許条項あり | 企業導入で特許保護を意識する場合 |
| Proprietary | 公開しない | 社内限定で運用する場合 |

本パッケージ自体はライセンスを **明示しない既定** とし、派生先で選定する。社内限定の派生は Proprietary、対外公開する派生は CC BY または MIT を推奨する。

## 3. 出典の引き継ぎ義務

派生先は以下を必ず維持する:

- [ ] 各章末「## 出典」を残す (削除禁止)
- [ ] retrieved_at を更新する (再取得した日付に書き換える)
- [ ] L1 出典の URL / リソースが死活していないか確認
- [ ] 引用形式 (`25_writing-style/03_citation-style.md`) を踏襲

出典を削除すると本パッケージの規律 (事実は出典で語る) が崩れるため、章本文を変更しても出典セクションは原則として残す。

## 4. 内製ナレッジの取扱い

派生先で追加する **内製ナレッジ** (案件固有 Runbook / Layer 2 Registry / 内部 docs) は、本パッケージの中立性とは別管理にする。

| 内製ナレッジ | 配置 | 公開可否 |
|---|---|---|
| 案件固有 Runbook | 案件リポ / 派生先の `LOCAL/` | 案件契約に従う |
| Layer 2 Registry | 案件リポの `40_delegation/` 末尾 | 案件契約に従う |
| 検証セット / 評価ログ | `_tmp/` / 案件リポ `evals/` | 機微情報を含むため非公開既定 |

内製ナレッジを公開リポに含めない手順は `01_how-to-redistribute.md` のチェックリストを参照。

## 5. 第三者出典の取扱い

第三者の docs / 論文 / ブログを引用する際は:

- 引用範囲を明示 (snippet にする)
- 著作物のライセンスを尊重 (CC0 / CC BY 等)
- 再配布制約があるリソースは引用ではなく **参照リンク** にする
- 改変引用は明示 (例: 「以下は引用 / 改変あり」)

## 6. 帰属表示

派生先で本パッケージから持ち出した章を含める場合、README または `NOTICE` に以下を記載する:

```
This documentation includes content derived from "ecc-method" (commit: <sha>),
distributed under <選定ライセンス>.
Original retrieved: <YYYY-MM-DD>.
```

商標・社名・個人名を含めずに帰属を表現する。

## 7. 注意点

- 出典 URL が消滅した場合の取扱いは `75_self-evolution/01_freshness-policy.md` の `obsolete` 規定に従う
- ライセンス変更を伴う派生は派生先での法務確認を経てから実施する
- 公開後の取り下げは reflog レベルで残るため、機微情報の混入は持ち出し前に必ず確認する

## 8. 失敗例 (避ける)

- 出典セクションを削除してしまう
- ライセンス無記載で公開リポに置く
- 第三者の長文を本文転記する
- 案件固有のクライアント名が残ったまま帰属表示する

## 9. 連携

| 連携先 | 用途 |
|---|---|
| [01_how-to-redistribute.md](./01_how-to-redistribute.md) | 持ち出し手順 |
| [25_writing-style/03_citation-style.md](../25_writing-style/03_citation-style.md) | 出典様式 |
| [75_self-evolution/01_freshness-policy.md](../75_self-evolution/01_freshness-policy.md) | 鮮度管理 |

## 出典

- Creative Commons License Chooser (https://creativecommons.org/choose/, retrieved 2026-06-23)
- 本パッケージ README.md §ライセンスと再配布 (retrieved 2026-06-23)
- 本パッケージ 25_writing-style/03_citation-style.md (retrieved 2026-06-23)

## 不確実性

- ライセンス選定は法務領域に踏み込むため、本章は技術的指針に留める。最終判断は派生先の法務確認に委ねる。
- 第三者出典のライセンスは時間とともに変化することがある。引用時の retrieved_at を必ず残し、四半期 radar で再検証する。
