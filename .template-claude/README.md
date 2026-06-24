---
keywords: [template, claude-md, distribution, adoption]
related: [.template-agents/ecc-orchestrator.md, 99_distribution/01_how-to-redistribute.md, 45_runbook/runbooks/RB-006-session-handover-protocol.md]
---
# `.template-claude/` — `~/.claude/CLAUDE.md` テンプレ

Method を採用する開発者向けの `~/.claude/CLAUDE.md` テンプレ。`.template-agents/ecc-orchestrator.md` (agent 定義) と対になる「ユーザーグローバル設定」側のテンプレートで、Method 採用と一体で配布する。

## 採用方針

Method を採用するなら本テンプレも採用することを推奨する (一体規律)。Method を採用しない場合は本テンプレも使わなくてよい。

**なぜ「一体推奨」か**:

- Claude Code の subagent はユーザー入力を直接受け取れない。最初の発話を受けるのは **主 Claude (メインループ)** であり、subagent は主 Claude が `Agent` ツールで呼び出したときのみ起動する単発・isolated context のプランナー。
- したがってセッション開始 / 継続 / 終了の自動プロトコルは **主 Claude 側 (`~/.claude/CLAUDE.md`)** に置かないと発火しない。`.template-agents/ecc-orchestrator.md` のみでは「最初の入力で `.session-state/` を確認する」「クローズ 4 要素を末尾に出す」などの規律が効かない。
- `.template-claude/CLAUDE.md` (主 Claude 向け) と `.template-agents/ecc-orchestrator.md` (委任プランナー向け) を揃えて配布することで、起動 / クローズ / 委任の 3 規律が全セッションで一貫する。

**役割分担 (重要)**:

| ファイル | 配置先 | 担当 |
|---|---|---|
| `.template-claude/CLAUDE.md` | `~/.claude/CLAUDE.md` | 主 Claude の規律: 起動プロトコル / `.session-state/` 管理 / クローズ 4 要素 / SDD ヒアリング実行 / TodoWrite 同期 |
| `.template-agents/ecc-orchestrator.md` | `~/.claude/agents/ecc-orchestrator.md` | 主 Claude から呼ばれる委任プランナー: Runbook / Expert Registry 引きと Delegation Contract ドラフト生成のみ。`.session-state/` Write・ユーザー対話・最終応答は行わない |

## 採用手順 (3 ステップ)

### 1. パスを決める

Method パッケージを置く場所を `<ECC_METHOD_ROOT>` として定める。代表的な配置:

| 配置 | パス例 | 用途 |
|---|---|---|
| ユーザーグローバル | `~/.claude/methods/ecc-method/` | 個人開発者の全プロジェクトで Method を引く (orchestrator テンプレ既定) |
| リポ vendoring | `<repo>/ecc-method/` | プロジェクトに同梱して全メンバーで共有 |
| 任意絶対パス | `/opt/ecc-method/` 等 | 組織内共有マウント / CI 環境 |

### 2. テンプレを置換 + 初回 allowlist 追記

CLAUDE.md 配置と allow 追記を **同じタイミングで** 実行する。両者が揃わないと、初回セッションで Method 規律 (CLAUDE.md) は効くが、orchestrator / skill が走らせる read-only 調査コマンドが毎回 Permission ポップアップで止まる (詳細: §採用後に頻出するポップアップ)。

```bash
# 配置先パスを決める (例: ~/.claude/methods/ecc-method/)
ECC_METHOD_ROOT="$HOME/.claude/methods/ecc-method"

# (a) テンプレを ~/.claude/CLAUDE.md に展開 (置換しながらコピー)
sed "s|<ECC_METHOD_ROOT>|$ECC_METHOD_ROOT|g" \
  "$ECC_METHOD_ROOT/.template-claude/CLAUDE.md" \
  > ~/.claude/CLAUDE.md

# (b) ~/.claude/settings.json に Method 採用直後に頻出する read-only 調査コマンドを allow 追記
#     既存 settings.json を退避してから jq で merge する。jq が無い環境は §2.1 を参照。
test -f ~/.claude/settings.json && \
  cp ~/.claude/settings.json "~/.claude/backups/settings.json.$(date +%Y%m%d-%H%M%S)" 2>/dev/null

jq '
  .permissions.allow = ((.permissions.allow // []) + [
    "Bash(ls *.claude/commands/*)",
    "Bash(ls *.claude/agents/*)",
    "Bash(ls *.claude/methods/*)",
    "Bash(find *.claude/ -name *.md*)",
    "Bash(find *.claude/ -type f*)",
    "Bash(cat *.session-state/*)",
    "Bash(ls .session-state/*)",
    "Bash(mkdir -p .session-state*)"
  ] | unique)
' ~/.claude/settings.json > ~/.claude/settings.json.tmp && \
  mv ~/.claude/settings.json.tmp ~/.claude/settings.json
```

bash / jq が無い環境では §2.1 のフォールバック手順を使う。

#### 2.1 jq が使えない環境

`~/.claude/settings.json` を直接編集して `permissions.allow` に以下を追加する (既存 allow 配列が無ければ新設):

```json
{
  "permissions": {
    "allow": [
      "Bash(ls *.claude/commands/*)",
      "Bash(ls *.claude/agents/*)",
      "Bash(ls *.claude/methods/*)",
      "Bash(find *.claude/ -name *.md*)",
      "Bash(find *.claude/ -type f*)",
      "Bash(cat *.session-state/*)",
      "Bash(ls .session-state/*)",
      "Bash(mkdir -p .session-state*)"
    ]
  }
}
```

**注**: 上記は **read-only 調査 + ローカル可逆操作のみ** を許可する。`50_permissions/02_pre-authorized-actions.md` の事前承認スコープと整合する範囲に絞っている。`force-push` / `rm -rf` 等は明示 allow しない (`50_permissions/01_consent-economy.md` §6 反パターンと整合)。

### 3. 既存 CLAUDE.md がある場合

既存の `~/.claude/CLAUDE.md` を退避してから上書きする:

```bash
mkdir -p ~/.claude/backups
cp ~/.claude/CLAUDE.md "~/.claude/backups/CLAUDE.md.$(date +%Y%m%d-%H%M%S)"
# 上記 §2 の sed コマンドで置換配置
```

退避した既存ファイル内に **Method と整合する独自規律** があれば、`~/.claude/CLAUDE.md` の §1〜§8 のいずれかに追記し、重複定義は削除する (ゼロ重複原則)。

### 4. (任意) subagent narration hook を有効化

RB-005 の subagent リアルタイム観測を採用する場合のみ。`.template-claude/hooks/` と `.template-claude/settings.json` を配布先に取り込む。

```bash
# 配置先プロジェクトの .claude/ に hooks スクリプトを配置
mkdir -p <project>/.claude/hooks
cp "$ECC_METHOD_ROOT/.template-claude/hooks/subagent-narrator.sh"  <project>/.claude/hooks/
cp "$ECC_METHOD_ROOT/.template-claude/hooks/subagent-narrator.ps1" <project>/.claude/hooks/
chmod +x <project>/.claude/hooks/subagent-narrator.sh

# settings.json の hooks ブロックを <project>/.claude/settings.json にマージ (jq が使える環境)
jq -s '.[0] * .[1]' \
  <project>/.claude/settings.json \
  "$ECC_METHOD_ROOT/.template-claude/settings.json" \
  > <project>/.claude/settings.json.tmp \
  && mv <project>/.claude/settings.json.tmp <project>/.claude/settings.json
```

動作:

- subagent (Agent ツール) 内の **PostToolUse** と **SubagentStop** で発火する (公式 docs: subagent 内でも hook は発火、`agent_id` / `agent_type` が入力 JSON に付帯される。出典: https://code.claude.com/docs/en/hooks, retrieved_at 2026-06-24)。
- narration は `<project>/.session-state/agent-narration.log` に追記される (1 行 / tool call)。
- **既定では parent agent の context を汚染しない** (hook の stdout は空に保つ)。`tail -f .session-state/agent-narration.log` で別ペインから観測する想定。
- `ECC_NARRATION_INLINE=1` を export すると `systemMessage` 経由で Claude Code UI にも流れる (ただしこの場合 parent context にも流入する点に注意、長時間タスクでは推奨しない)。
- Windows ネイティブで bash を持たない環境では `subagent-narrator.ps1` を使い、settings.json の `command` を `powershell -NoProfile -ExecutionPolicy Bypass -File "${CLAUDE_PROJECT_DIR}\\.claude\\hooks\\subagent-narrator.ps1"` に差し替える。

詳細仕様 / 検証手順 / トレードオフは本パッケージ `45_runbook/runbooks/RB-005-subagent-realtime-streaming-via-hooks.md` を参照。

## 採用後、新規リポで初回起動するとき

`.template-agents/ecc-orchestrator.md` を `~/.claude/agents/ecc-orchestrator.md` に、`.template-claude/CLAUDE.md` を `~/.claude/CLAUDE.md` に配置した上で、対象リポを VSCode (または `claude` CLI) で開いた後の流れ:

1. **任意の 1 メッセージを送る** (例: `開始` / `.` / `何か作りたい` 等、内容は問わない)
   - Claude Code はターン駆動。フォルダを開いただけでは何も発火しない。
   - 最初のユーザー入力を受けた **1 ターン目で主 Claude が `~/.claude/CLAUDE.md` §0 起動プロトコルを実行** し、`.session-state/` 不在を検出してヒアリングを自動開始する。
2. 主 Claude の質問に **1 つずつ自然文で答える** (5 問以下)
   - 北極星 → ターゲット → 成功条件 → スコープ外 → 既存資産
   - ユーザーが 1 ターン目で具体タスク文を投げた場合、主 Claude は発話から GOAL を抽出し、不足項目のみ最小 1 問で確認して着手する。
3. ヒアリング後、主 Claude が `.session-state/` 5 ファイル (GOAL.md / PENDING.md / current_session.md / COMPLETED.md / HISTORY.md) を自動生成し、5 行サマリを提示してそのまま P0 タスクに着手する。
4. 多段委任プランニングが必要な局面で、主 Claude は `Agent(subagent_type=ecc-orchestrator)` を呼び、Delegation Contract ドラフトを取得してから専門家 subagent を並列起動する。

詳細は本パッケージ `45_runbook/runbooks/RB-009-first-run-sdd-bootstrap.md` を参照。

2 回目以降のセッションは `.session-state/` 既存のため `~/.claude/CLAUDE.md` §0.3 継続モード ルートで自動再開される。

## テンプレの構成

`.template-claude/CLAUDE.md` 11 セクション (§0 を含む):

0. 起動プロトコル (`.session-state/` 二モード判定 / SDD ヒアリング / 継続モード自動再開)
1. 言語 (派生先で上書き可)
2. SSOT (Method 各章への索引テーブル)
3. 検索プロトコル (Runbook → Registry → Pattern → 委任 → Capture)
4. 並列起動と subagent 利用方針 (`ecc-orchestrator` の使いどころ)
5. 作業中規律 (RB-007 + Knowledge 即時記録)
6. 中断時規律 (RB-007)
7. クローズ規律 4 要素 (RB-006 §[6] 書式) + Step [0.5] KNOWLEDGE CAPTURE GATE (RB-011 連動)
8. 行動規律 (No Scope Dodging / No Over Delegation / No Push Handoff / No Internal Status Leak / No Turn-Model Hallucination / Knowledge Capture First)
9. 出典・不確実性
10. ユーザー判断に上げる範囲

各セクション本文は Method 該当章を SSOT とし、CLAUDE.md には索引と書式テンプレ・主 Claude が直接実行する手続きのみを置く (コンテキスト経済 Rule 4)。Runbook 詳細・Registry 一覧・委任契約フォーマット・Knowledge Vault 規約は ecc-method 本体を参照する (`12_knowledge-vault/`, `45_runbook/runbooks/RB-011-knowledge-promotion-flow.md`)。

## 採用後に頻出するポップアップ

ECC Method を初回採用したユーザー環境では、以下のような Permission ポップアップが頻発することが確認されている (報告: 配布先ユーザー, 2026-06-24):

```
Allow this bash command?
ls /<HOME>/.claude/commands/ 2>/dev/null || echo "no commands dir" \
  && find /<HOME>/.claude/ -name "*.md" | grep -v methods | grep -v projects | grep -v backups
Check commands directory and existing skill .md files
```

これは **ECC 採用検出 / skill 棚卸し / orchestrator 起動準備** のために read-only で `~/.claude/` 配下を走査する挙動で、Method 採用直後のセッションで頻繁に発生する。挙動自体はリスクが低い (read-only、ローカル) ため、§2 の手順で **CLAUDE.md 配置と同じタイミング** で allowlist 追記を済ませると初回セットアップ体験が連続する。

allow せずポップアップを 1 件ずつ承認する運用も可能だが、orchestrator 起動初期に同種のコマンドが連続して走るため毎回中断されてしまい、Method の「ゼロ重複・承認最小化」原則 (`50_permissions/01_consent-economy.md`) と整合しない。

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
