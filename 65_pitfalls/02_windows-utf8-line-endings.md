---
keywords: [pitfalls, windows, utf8, line, endings]
related: []
---
# 02 — UTF-8 BOM / CRLF・LF 混在の事故 (Windows 開発時)

Windows で開発しつつ Linux でデプロイする構成では、文字コードと改行コードの差異が静かにビルドや実行を壊す。本ファイルは典型事象と恒久対策をまとめる。

## TL;DR

- リポジトリは UTF-8 (BOM なし) + LF を標準とする。
- `.gitattributes` で `* text=auto eol=lf` を宣言し、エディタ側 (`.editorconfig`) で BOM を抑止する。
- 既に混入した BOM / CRLF は `git add --renormalize .` 1 回で再正規化する。

## 想定する状況

- 開発端末: Windows、デプロイ先: Linux コンテナ。
- エディタは複数 (VS Code / メモ帳 / 別 IDE) が混在する可能性がある。
- shell script / Python / YAML / JSON / Markdown が混在する。

## 代表的な症状

| 症状 | 例 | 原因 |
|---|---|---|
| `#!/bin/bash: bad interpreter: No such file or directory` | shell script 実行失敗 | shebang 行末に `\r` が混入 (CRLF) |
| `SyntaxError: invalid non-printable character U+FEFF` | Python | ファイル先頭に UTF-8 BOM |
| `yaml.scanner.ScannerError: mapping values are not allowed here` | YAML パース失敗 | BOM または不可視全角空白 |
| Docker `COPY` 後に `exec format error` | エントリポイント | CRLF が同梱されたまま `RUN chmod +x` |
| `git diff` で全行差分 | レビュー時 | EOL が一斉に変換された |
| 文字化け (`繧ｨ繝ｩ繝ｼ` 等) | Web 表示 | ファイルが CP932 のまま保存 |

## 恒久対策

### .gitattributes

```gitattributes
# 既定: テキストは LF に正規化
* text=auto eol=lf

# Windows 専用ファイルは CRLF 維持
*.bat   text eol=crlf
*.cmd   text eol=crlf
*.ps1   text eol=crlf

# バイナリ
*.png   binary
*.jpg   binary
*.pdf   binary
*.zip   binary
```

### .editorconfig

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
indent_style = space
indent_size = 2

[*.{py}]
indent_size = 4

[*.{bat,cmd,ps1}]
end_of_line = crlf
```

### git の global 設定 (任意)

```bash
# Windows
git config --global core.autocrlf false
git config --global core.eol lf
```

`core.autocrlf=true` は Windows 上で CRLF に自動変換する設定。`.gitattributes` を使うなら `false` で運用するほうが事故が少ない。

## 既に混入した場合のリカバリ

```bash
# Step 1: .gitattributes / .editorconfig を追加してコミット
git add .gitattributes .editorconfig
git commit -m "chore: enforce LF + utf-8 (no BOM)"

# Step 2: 全ファイルを再正規化
git add --renormalize .
git status
git commit -m "chore: renormalize line endings"

# Step 3: BOM を持つファイルを抽出して修正
# (PowerShell)
Get-ChildItem -Recurse -Include *.py,*.yml,*.yaml,*.json,*.md |
  Where-Object { (Get-Content $_ -Encoding Byte -TotalCount 3) -join ',' -eq '239,187,191' } |
  ForEach-Object {
    $content = Get-Content $_.FullName -Raw -Encoding UTF8
    [System.IO.File]::WriteAllText($_.FullName, $content, (New-Object System.Text.UTF8Encoding $false))
  }

# (bash + sed)
# BOM を持つファイル一覧
grep -rl $'\xEF\xBB\xBF' . 2>/dev/null
# BOM 除去 (個別)
sed -i '1s/^\xEF\xBB\xBF//' <file>
```

## 検証

```bash
# CRLF が残っていないか
grep -rl $'\r' . --include='*.sh' --include='*.py' --include='*.yml'

# BOM が残っていないか
grep -rl $'\xEF\xBB\xBF' . 2>/dev/null

# file コマンドで確認
file path/to/script.sh
# 期待: "POSIX shell script, ASCII text executable"
# NG  : "with CRLF line terminators"
```

成功条件:

- [ ] `grep -rl $'\r' --include='*.sh'` が空
- [ ] `grep -rl $'\xEF\xBB\xBF'` が空
- [ ] CI 上で shell script が実行できる
- [ ] Python ファイルで `SyntaxError: invalid non-printable character U+FEFF` が出ない

## エディタ別注意

| エディタ | 設定ポイント |
|---|---|
| VS Code | `"files.eol": "\n"`, `"files.encoding": "utf8"` (utf8bom は使わない) |
| メモ帳 (Windows 11) | 保存時に「UTF-8 (BOM 付き)」が既定の場合あり。「UTF-8」を選択 |
| 別 IDE | プロジェクトレベルで encoding=UTF-8 / line separator=Unix を設定 |
| nano / vim | 既定で LF。`set fileformat=unix` で明示可 |

## アンチパターン

| アンチパターン | 結果 | 代替 |
|---|---|---|
| `core.autocrlf=true` + `.gitattributes` 不整備 | clone するたび diff が発生 | `.gitattributes` で eol を宣言、autocrlf=false |
| BOM ありの YAML をコミット | パイプライン全体が壊れる | エディタで保存時に BOM 無効化 |
| script を Windows 上で chmod +x し忘れて Docker COPY | コンテナ内で実行不能 | Dockerfile 内で `RUN chmod +x` を明示 |
| 既存ファイルを一括変換せず放置 | レビュー時に巨大 diff | 一気に renormalize して別 PR で吸収 |

## 出典

- Git Documentation "gitattributes" (https://git-scm.com/docs/gitattributes, retrieved_at: 2026-06-23)
- EditorConfig Specification (https://editorconfig.org/, retrieved_at: 2026-06-23)
- Unicode FAQ "Byte Order Mark" (https://www.unicode.org/faq/utf_bom.html, retrieved_at: 2026-06-23)

## 不確実性

- Windows + WSL + Linux コンテナの 3 段構成では、ファイルを WSL 経由で編集すれば LF が保たれる場合が多い。WSL を使わない環境では本ファイルの対策が必須。
- PowerShell `Get-Content -Encoding Byte` は古い PowerShell では仕様差異がある。PowerShell 7+ では `-AsByteStream` を推奨。
