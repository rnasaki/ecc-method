# 02 — Banned Phrases (禁止語リスト)

本パッケージ・本パッケージ適用案件のドキュメント生成およびユーザー向け応答で **使用禁止** とする語のリスト。Phase H (60_quality-gates/) で機械 grep の対象になる。

## 1. 適用範囲

- 本パッケージ配下の全 `.md`
- 本パッケージから派生したドキュメント (PRD / requirements / design / tasks / Runbook / review レポート / commit message / PR 説明文)
- ユーザーへの最終応答テキスト

## 2. 検出方針

- ヒット = ゲート違反として原則「完了」扱いにしない。
- 引用 (出典の原文転記) かつ引用符で囲まれている場合のみ免除。
- 自動 grep のため、表記ゆれ (全角/半角・カタカナ/英字) を含むエントリは下記 YAML に網羅する。

## 3. 禁止語 (機械可読)

```yaml
# ecc-method banned phrases v1
# retrieved_at: 2026-06-23
# 検出条件: 大文字小文字区別なし / 部分一致

categories:
  self_praise_ja:
    # 自賛・極端表現 (本パッケージ全面禁止)
    - 最強
    - 万能
    - 完璧
    - 究極
    - 至高
    - ハイセンス
    - ハイスペック
    - 素晴らしい
    - 申し分ない
    - ばっちり
    - がっつり

  self_praise_en:
    - perfect
    - excellent
    - flawless
    - ultimate
    - supreme
    - the best
    - state-of-the-art
    - cutting-edge
    - revolutionary
    - game-changer
    - game changing
    - best-in-class
    - world-class

  anthropomorphic:
    # 擬人化・関係性表現 (エージェントを擬人化しない)
    - 相棒
    - パートナー
    - 概念的存在
    - 司令塔
    - 頼れる
    - 頼もしい
    - 心強い
    - 寄り添う

  subjective_adjective_ja:
    # 主観形容詞 (測定可能な事実で代替する)
    - 強力な
    - 強力に
    - 画期的
    - 革新的
    - 斬新
    - 直感的な
    - シームレス
    - スマート
    - エレガント
    - 美しい設計
    - 圧倒的
    - 飛躍的

  subjective_adjective_en:
    - powerful
    - intuitive
    - seamless
    - elegant
    - beautiful
    - amazing
    - awesome
    - incredible
    - stunning

  hype_marketing:
    # マーケティング誇張
    - 業界最高
    - 業界初
    - 唯一
    - 他に類を見ない
    - 比類なき
    - 圧倒的に優れた

  emotional_response:
    # 一次対応外の感情誘導
    - 是非
    - ぜひ
    - お楽しみに
    - 楽しみながら

  sycophancy:
    # 追従・媚び
    - 仰る通り
    - おっしゃる通り
    - さすが
    - お見事
    - 完璧なご質問
    - 鋭いご指摘

  identity_terms:
    # 個人名・組織名・固有プロダクト名はリポジトリ単位で別管理
    # ここでは一般禁止語のみ。案件側で deny リストを追加すること。
    - 弊社
    - 当社
    - 我が社

allow_with_citation:
  # 出典の原文に含まれる場合のみ許容 (引用符で囲うこと)
  - 公式
  - official

severity:
  block:    [self_praise_ja, self_praise_en, anthropomorphic, hype_marketing, sycophancy]
  warn:     [subjective_adjective_ja, subjective_adjective_en, emotional_response, identity_terms]
```

## 4. 検出スクリプト (参考)

```bash
# 例: 禁止語の存在確認 (block 相当)
PATTERN='最強|万能|完璧|究極|至高|ハイセンス|ハイスペック|素晴らしい|申し分ない|ばっちり|がっつり|相棒|パートナー|概念的存在|司令塔|perfect|excellent|flawless|ultimate'
grep -rEn --include='*.md' "$PATTERN" ecc-method/ || echo "OK: no banned phrase"
```

実装は `60_quality-gates/02_anti-sycophancy.md` および `80_commands/` 側で行う。

## 5. 中立化の対応表

| 禁止語 | 中立化候補 |
|---|---|
| 最強の検索機能 | N 件を P95 200ms で返す検索機能 |
| 完璧な精度 | 検証セットで F1 0.94 (出典: …) |
| 直感的な UI | 初回操作 3 ステップ以内 (社内テスト n=12) |
| 強力なエージェント | 〇〇タスクで baseline 比 +18% (出典: …) |
| 相棒 / パートナー | 委任先エージェント / 専門家 Role |
| 司令塔 | Orchestrator |
| 概念的存在 | 抽象 Role / 抽象インターフェース |
| 素晴らしい設計 | 〇〇制約を満たす設計 |

詳細な before/after は [05_examples.md](./05_examples.md) を参照。

## 6. 例外申請

特定文脈で禁止語を使う必要がある場合 (出典の原文転記など) は以下を満たすこと:

1. 引用符で囲う
2. 直後に出典 URL を併記する
3. 当該段落の冒頭で「以下は引用」と明示する

それ以外の例外申請は受け付けない。

## 出典

- 本パッケージ 25_writing-style/01_voice.md (retrieved 2026-06-23)
- 本パッケージ METHOD.md §6 Quality Gates (retrieved 2026-06-23)

## 不確実性

- 表記ゆれ (例: 「最 強」「最．強」) を全網羅する正規表現はメンテナンス負荷が高い。Phase H 実装時に false negative の許容ラインを定義する。
- `subjective_adjective_*` は案件によっては製品コピーで使う必要が生じる。warn ラインに置き、案件ごとに block へ昇格させる運用とする。
