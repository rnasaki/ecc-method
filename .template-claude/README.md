---
keywords: [template, claude-md, distribution, adoption]
related: [.template-agents/ecc-orchestrator.md, 99_distribution/01_how-to-redistribute.md, 45_runbook/runbooks/RB-006-session-handover-protocol.md]
---
# `.template-claude/` — `~/.claude/CLAUDE.md` テンプレ

Method を採用する開発者向けの `~/.claude/CLAUDE.md` テンプレ。`.template-agents/ecc-orchestrator.md` (agent 定義) と対になる「ユーザーグローバル設定」側のテンプレートで、Method 採用と一体で配布する。

## 採用方針

Method を採用するなら本テンプレも採用することを推奨する (一体規律)。Method を採用しない場合は本テンプレも使わなくてよい。

**なぜ「一体推奨」か**:

- `~/.claude/CLAUDE.md` は orchestrator が起動しない素のセッション (新規プロジェクト初回 / 一時的な対話) でも読まれる。
- `.template-agents/ecc-orchestrator.md` は orchestrator 起動後の規律。これだけでは素セッションに規律が効かない。
- 両者を揃えて配布することで、Method の 4 要素クローズ規律 / 委任ファースト / 内部ステータス非露出が **全セッションで一貫** する。

`.template-agents/ecc-orchestrator.md` のみ採用しても動くが、orchestrator 未起動時は Method 規律が効かない (素 Claude の挙動に戻る)。

## 採用手順 (3 ステップ)

### 1. パスを決める

Method パッケージを置く場所を `<ECC_METHOD_ROOT>` として定める。代表的な配置:

| 配置 | パス例 | 用途 |
|---|---|---|
| ユーザーグローバル | `~/.claude/methods/ecc-method/` | 個人開発者の全プロジェクトで Method を引く (orchestrator テンプレ既定) |
| リポ vendoring | `<repo>/ecc-method/` | プロジェクトに同梱して全メンバーで共有 |
| 任意絶対パス | `/opt/ecc-method/` 等 | 組織内共有マウント / CI 環境 |

### 2. テンプレを置換

```bash
# 配置先パスを決める (例: ~/.claude/methods/ecc-method/)
ECC_METHOD_ROOT="$HOME/.claude/methods/ecc-method"

# テンプレを ~/.claude/CLAUDE.md に展開 (置換しながらコピー)
sed "s|<ECC_METHOD_ROOT>|$ECC_METHOD_ROOT|g" \
  "<ECC_METHOD_ROOT>/.template-claude/CLAUDE.md" \
  > ~/.claude/CLAUDE.md
```

bash が無い環境では手作業で `<ECC_METHOD_ROOT>` を grep して置換する。

### 3. 既存 CLAUDE.md がある場合

既存の `~/.claude/CLAUDE.md` を退避してから上書きする:

```bash
mkdir -p ~/.claude/backups
cp ~/.claude/CLAUDE.md "~/.claude/backups/CLAUDE.md.$(date +%Y%m%d-%H%M%S)"
# 上記 §2 の sed コマンドで置換配置
```

退避した既存ファイル内に **Method と整合する独自規律** があれば、`~/.claude/CLAUDE.md` の §1〜§8 のいずれかに追記し、重複定義は削除する (ゼロ重複原則)。

## テンプレの構成

`.template-claude/CLAUDE.md` 8 セクション:

1. 言語 (派生先で上書き可)
2. SSOT (Method 各章への索引テーブル)
3. 検索プロトコル (Runbook → Registry → Pattern → 委任 → Capture)
4. 並列起動
5. クローズ規律 4 要素 (RB-006 §[6] 書式)
6. 行動規律 (No Scope Dodging / No Over Delegation / No Push Handoff / No Internal Status Leak)
7. 出典・不確実性
8. ユーザー判断に上げる範囲

各セクション本文は Method 該当章を SSOT とし、CLAUDE.md には索引と書式テンプレのみを置く (コンテキスト経済 Rule 4)。

## 派生先の独自カスタム

派生先で独自規律を加える場合は本テンプレに直接書かず、**`~/.claude/CLAUDE.md` の末尾に `## 99. ローカル拡張` セクションを追加** して分離する。Method 上流の更新を取り込んだとき、ローカル拡張だけが残る形にする (`99_distribution/01_how-to-redistribute.md` §6 と整合)。

## 出典

- 本パッケージ `METHOD.md` §5.1 検索プロトコル / §6 Quality Gate
- 本パッケージ `45_runbook/runbooks/RB-006-session-handover-protocol.md` §[6] 4 要素クローズ
- 本パッケージ `.template-agents/ecc-orchestrator.md` (対になる agent 側テンプレ)
- 本パッケージ `99_distribution/01_how-to-redistribute.md` (再配布手順)

## 不確実性

- 本テンプレは `~/.claude/CLAUDE.md` (Claude Code の user-scope global) を前提とする。他のハーネス (Codex CLI / 各種 IDE 拡張) は読込パスが異なるため、派生先で配置を調整する。
- §1 言語は日本語既定。多言語環境では派生先で上書きする。
- §6 行動規律は本パッケージ develop 時点 (commit 35d33cc 以降) で確立した規律を反映。Method 本体の規律進化に合わせて再同期する必要がある。
