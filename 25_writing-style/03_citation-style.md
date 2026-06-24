---
keywords: [writing-style, citation, style]
related: [METHOD.md, 25_writing-style/04_uncertainty-language.md]
---
# 03 — Citation Style (出典分類と引用形式)

主張は出典で支える。本ファイルは出典の分類 (L1 / L2 / L3) と引用形式を定義する。

## 1. 出典分類

| Level | 定義 | 採用可否 |
|---|---|---|
| **L1** | 公式ドキュメント (一次情報) / 公式仕様書 / 公式リファレンス実装のソースコード / 公式 API レスポンス | **必須** (主張に少なくとも 1 件) |
| **L2** | 公式 blog / 公式論文 / 公式が認めた SDK のメンテナの公開記事 / 国際標準規格 | 補助として許可 |
| **L3** | モデル知識単独 / 二次まとめサイト / 個人ブログ / 出典不明の SNS 投稿 | **禁止** |

### L1 の例

- Anthropic Claude Code 公式 docs (code.claude.com / docs.claude.com)
- OpenAI Agents SDK 公式 docs (openai.github.io)
- IETF RFC / W3C 仕様
- 言語仕様書 (Python PEP / TC39 ECMA-262 等)
- 当該パッケージのソースコード (本パッケージ自身を引く場合)

### L2 の例

- Anthropic Engineering Blog (multi-agent research system 等)
- GitHub spec-kit リポジトリの README
- Martin Fowler bliki (TestDrivenDevelopment 等)

### L3 (禁止)

- 「一般に〜と言われている」
- 「ChatGPT が〜と回答した」
- 「(出典なし) 〜が知られている」
- モデル内部知識のみに基づく断定

## 2. 引用形式

### 2.1 行内引用

主張を述べた段落の末尾に括弧で出典を入れる。

```
Claude Code の hook システムは PreToolUse / PostToolUse / Stop の 3 種を持つ
(L1: code.claude.com/docs/hooks, retrieved 2026-06-23)。
```

形式:

```
(<Level>: <URL or repo path>, retrieved <YYYY-MM-DD>)
```

### 2.2 章末「出典」セクション

各 `.md` の末尾に「## 出典」セクションを設け、本文で引いた出典をすべて列挙する。

```markdown
## 出典

- L1: https://docs.claude.com/en/docs/claude-code/hooks (retrieved 2026-06-23)
- L1: https://github.com/<owner>/<repo>/blob/main/path/to/file (retrieved 2026-06-23)
- L2: https://www.anthropic.com/engineering/multi-agent-research-system (retrieved 2026-06-23)
```

### 2.3 リポジトリ内自己参照

本パッケージ内のファイルを引く場合は相対パスで書く。

```
詳細は [METHOD.md](../METHOD.md) §6 を参照。
```

「## 出典」セクションでは以下のように記載してよい。

```
- 本パッケージ METHOD.md §6 Quality Gates (retrieved 2026-06-23, ecc-method/METHOD.md)
```

### 2.4 絶対パスの相対化 (PATH POLICY 整合)

ファイルを出典として引く際、**絶対パスを成果物に書き込まない** (個人ホーム / 組織配置を漏出させない)。下記ルールで相対パスに変換する。

| 元のパス例 | 変換後 |
|---|---|
| `C:/Users/<name>/Documents/GitHub/<repo>/backend/main.py` | `backend/main.py` (リポルート起点の相対パス) |
| `/home/<name>/projects/<repo>/spec/F01/design.md` | `spec/F01/design.md` |
| `~/.claude/agents/architect.md` | `~/.claude/agents/architect.md` (ECC 標準パスは保持。`~` は固有ホームを示さない) |
| `C:\Users\<name>\.claude\projects\c--...\<id>.jsonl` | **書かない**。session log は内部パスなので出典にしない |

ルール:
- リポ内ファイル → リポルート起点の相対パス
- ECC 標準パス (`~/.claude/...` `~/.codex/...`) → そのまま (個人を特定しない汎用パス)
- 個人プロジェクト session log の絶対パス → 出典として記載しない (再現不能 + 個人特定リスク)

実機検証で確認: subagent が `backend/requirements.txt` のような相対パスで出典を出している場合は **PATH POLICY 違反ではない** (誤検知に注意)。

## 3. retrieved_at の規律

- すべての L1 / L2 出典に `retrieved_at` を必ず付ける。
- 本パッケージの規定値: `retrieved 2026-06-23` (パッケージ初版)。
- 個別ファイルが後日更新された場合、そのファイルの `retrieved_at` だけを更新する。

## 4. URL の規約

- 短縮 URL 禁止 (bit.ly / t.co / 等)。最終 URL を貼る。
- アンカー (`#section`) を含めて貼ると引用精度が上がる。
- 認証付きリンクは禁止 (社内 wiki / 個人 Notion 等)。再現不能になるため。

## 5. 引用の粒度

- 段落単位で 1 出典以上。
- 主張が複数 (例: 「A は X、かつ B は Y」) ある場合、それぞれに出典を付けるか、出典が同一であれば段落末に 1 件まとめる。
- 数値 (P95 / coverage / 価格 / トークン上限など) は必ず出典必須。

## 6. 出典が取れない場合

L1 が見つからない主張は **書かない** ことを既定とする。書く必要がある場合は以下のいずれかで対処する:

1. 「## 不確実性」セクションで「未検証」と明示する ([04_uncertainty-language.md](./04_uncertainty-language.md))
2. L2 で代替する (補助扱い)
3. 主張を弱める (「と推測される」「と仮定する」)

L3 のみで支えられた主張は本パッケージでは採択しない。

## 7. 自動チェック

`60_quality-gates/01_fact-check-protocol.md` で以下を確認する:

- 各 `.md` に「## 出典」セクションがあるか
- 各出典に `retrieved` 日付が付いているか
- L3 相当の表現 (「一般に」「と言われている」「らしい」) が本文にないか

## 出典

- 本パッケージ README.md §出典基準 (retrieved 2026-06-23, ecc-method/README.md)
- 本パッケージ METHOD.md §12 出典 (retrieved 2026-06-23, ecc-method/METHOD.md)

## 不確実性

- L1 / L2 の境界はケースで揺れる (例: 公式が引用した個人記事)。本ファイルは「公式が一次的に発行したか」を判定基準とするが、判定が割れる場合は L2 として扱い、別途 L1 を探す運用とする。
- `retrieved_at` の自動更新ループは `75_self-evolution/02_auto-update-loop.md` で別途定義する。
