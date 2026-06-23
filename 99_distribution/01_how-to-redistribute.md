# 01 — How to Redistribute (再配布手順)

本パッケージを別リポ・別組織へ持ち出すための手順。本パッケージは中立 (個人・組織・固有プロダクト名を含めない) で構成しているが、案件で派生したファイルを混在させたまま持ち出すと再配布性が崩れる。本章は「持ち出し前に削除すべき情報」を明示する。

## 1. 持ち出しの 3 形態

| 形態 | 用途 | 注意点 |
|---|---|---|
| Fork | 別リポへ全文複製 | 案件固有資産を含めない |
| Vendoring | サブディレクトリとして取り込む | 上流追従の方法を決める |
| Cherry-pick | 特定章のみ複製 | cross-reference を再修正 |

## 2. 削除すべき情報チェックリスト

持ち出し前に以下が混入していないかを必ず確認する。

### 2.1 機微情報

- [ ] secret (API キー / token / パスワード)
- [ ] PII (氏名 / 住所 / メール / 電話)
- [ ] 個人 ID / 社員番号 / アカウント名
- [ ] 内部 URL (社内ドメイン / 内部 IP)
- [ ] 案件名 / 顧客名 / プロダクト名

### 2.2 組織固有資産

- [ ] 組織名 / 会社名 / 部署名
- [ ] 内部ツール固有の手順
- [ ] 内部ライセンスを前提とした参照
- [ ] 案件固有の Runbook (`45_runbook/<id>.md` で `category: project-specific`)
- [ ] Layer 2 Registry エントリ (`40_delegation/01_expert-registry.md`)

### 2.3 一時成果物

- [ ] `_tmp/` 配下 (best_practices.json は **残す**、それ以外は削除)
- [ ] `.tmp/` 配下
- [ ] `monthly_*.md` / `quarterly_*.md` の案件固有レポート

### 2.4 ライセンス・帰属

- [ ] 既存出典の retrieved_at が古いまま (180 日超は再検証)
- [ ] 引用 URL が組織内 share point などになっていないか
- [ ] `LICENSE` / `NOTICE` が同梱されているか

## 3. 自動チェック (参考)

```bash
# 機微情報の機械検出 (例: secret の単純パターン)
grep -rEn 'AKIA[0-9A-Z]{16}|sk-[A-Za-z0-9]{20,}|-----BEGIN [A-Z ]+ PRIVATE KEY-----' \
  --include='*.md' --include='*.sh' --include='*.json' . \
  || echo "OK: no obvious secret"

# 内部 URL の検出 (案件側で URL パターンを補う)
grep -rEn '\.internal\.|\.local/|10\.[0-9]+\.[0-9]+\.[0-9]+' --include='*.md' . \
  || echo "OK: no internal url"

# 禁止語 (再配布前にも必ず流す。以下は 25_writing-style/02_avoidance-patterns.md からの引用パターン)
grep -rEn -f <(grep -E '^[[:space:]]+- ' "ecc-method/25_writing-style/02_avoidance-patterns.md" \
              | sed -E 's/^[[:space:]]+- //') \
  --include='*.md' . \
  || echo "OK: no banned phrase"
```

実装は `60_quality-gates/` の検査と同じ枠組みに揃える。

## 4. 持ち出し手順 (10 ステップ)

```
[1] Fork target を決定        — 別リポ / 別組織
[2] sanitize ブランチを切る   — main から派生
[3] 削除リスト適用            — §2 のチェックリスト
[4] cross-ref 再点検          — リンク切れ 0 件を確認
[5] 出典再検証                — retrieved_at を更新 (90 日超は再取得)
[6] 健全性 KPI 計測           — obsolescence_rate / link_alive_rate
[7] LICENSE / NOTICE 同梱    — 02_license-note.md 参照
[8] README に出自を明記      — 派生元 / 採用ポイント
[9] PR / 公開                 — 受領者に sanitize レポートを共有
[10] 受領後の追従方針合意      — quarterly radar の同期方法
```

## 5. 再配布レポートのテンプレ

```markdown
# Redistribution Report — <target>

- 派生元: ecc-method @ <commit>
- 派生先: <repo / org>
- sanitize 実施: <YYYY-MM-DD>

## 削除した情報
- 機微情報: <件数>
- 組織固有資産: <件数>
- 一時成果物: <件数>

## 出典再検証
- retrieved_at 更新: <件数>
- 削除: <件数>

## 健全性 KPI (持ち出し直後)
- obsolescence_rate: <float>
- link_alive_rate: <float>
- banned_phrase_hit: 0

## 追従方針
- 上流同期: <quarterly | event-driven>
- 担当: <agent or role>
```

## 6. 派生先での運用

派生先は以下を継続する:

- `75_self-evolution/` の週次 / 月次 / 四半期サイクル
- 健全性 KPI 計測
- 上流 (本パッケージ) への変更点フィードバック (任意)

派生先が独自の規約を加える場合は本パッケージの章に追記せず、派生先側の `LOCAL.md` 等に分離する。

## 7. よくある失敗

- `_tmp/` を `.gitignore` 追加せず公開リポに混入
- README に案件名が残ったまま fork
- Layer 2 Registry が含まれたまま再配布
- LICENSE 同梱を忘れる

## 8. 連携

| 連携先 | 用途 |
|---|---|
| [02_license-note.md](./02_license-note.md) | ライセンス選択 |
| [25_writing-style/02_avoidance-patterns.md](../25_writing-style/02_avoidance-patterns.md) | 禁止語検査 |
| [60_quality-gates/](../60_quality-gates/) | 受入チェック |
| [75_self-evolution/06_health-metrics.md](../75_self-evolution/06_health-metrics.md) | KPI 計測 |

## 出典

- 本パッケージ README.md §ライセンスと再配布 (retrieved 2026-06-23)
- 本パッケージ 25_writing-style/02_avoidance-patterns.md (retrieved 2026-06-23)
- 本パッケージ 75_self-evolution/06_health-metrics.md (retrieved 2026-06-23)

## 不確実性

- 機微情報の検出パターンは網羅的でない。派生先で利用する secret 形式に応じて検出パターンを追加する。
- 受領組織の規約は様々。本章は「最低限の sanitize」を担保し、追加要件は派生先で上書きする想定。
