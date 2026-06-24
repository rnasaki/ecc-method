---
id: RB-008-branch-strategy-and-semver
title: Branch 戦略と semver - 配布物 (main) と開発資産 (develop) の分離 + 版管理
category: bootstrap
tags: [git, branch, gitflow, semver, release, distribution, separation]
created: 2026-06-24
updated: 2026-06-24
last-verified: 2026-06-24
status: active
trigger: 配布物に開発資産が混入する / 利用者が「どの版を使えばいいか」分からない / 試行錯誤期と公開期の境界が不明瞭 / リリース整理プロセスが欠落
expert-routing: [orchestrator, doc-updater, architect]
related: [RB-006-session-handover-protocol, RB-007-1-session-1-task-and-session-state]
source: ユーザー指摘 (2026-06-24, "配布のものにも .handover 追加されん? Git ベスプラに従って")
keywords: [runbook, runbooks, branch, strategy, semver]
---

# Branch 戦略と semver - 配布と開発の分離

## TL;DR (30 秒で読める結論)

ecc-method は **GitFlow 風の branch 分離 + semver tag** で配布と開発を分離する:

- `main` = 配布版。`.session-state/` 等の開発資産は **入らない** (`.gitignore` で除外)
- `develop` = 開発版。`.session-state/` を追跡対象として保持
- `v0.x` = 試行錯誤期 (現在 v0.1.0)
- `v1.0` = 公開・配布期 (HW-D / HW-E / HW-F 完了後)

利用者は `git clone https://github.com/rnasaki/ecc-method.git` で main を取れば、配布版が手に入る。

## 背景: なぜ分離が必要か

| 観点 | 統合 (1 branch) | 分離 (main / develop) |
|---|---|---|
| 利用者の clone 体験 | `.session-state/` 等のノイズが混入 | クリーンな配布版 |
| 開発者の作業 | コミット時に常に「これは配布物に含めていいか」を判断 | develop で自由に作業、main は厳選 |
| リリース判定 | 不明瞭 | tag 付けで明示 |
| 業界標準 | 小規模リポ向き (個人 utility 等) | 配布前提の OSS / Method 向き |

ecc-method は **配布前提** (チームメンバー / 別案件 / 別組織への展開) なので分離が正解。

## branch 戦略

### main branch (配布版)

```
含むもの:
- METHOD.md / README.md / LICENSE
- 全章 (01_overview/ 〜 99_distribution/)
- .template-agents/ (利用者が cp する agent 雛形)
- .gitignore (.session-state/ や _tmp/ を除外)
- bootstrap.sh

含まないもの:
- .session-state/ (開発進捗、develop でのみ追跡)
- _tmp/ (検証中間ファイル)
- IDE 設定 / OS 一時ファイル
```

### develop branch (開発版)

```
main の全内容 + 以下を追加:
- .session-state/ (開発用の GOAL / PENDING / current_session / HISTORY / COMPLETED)
- 検証スクリプト / 一時的なメモ
```

開発作業はすべて develop で行い、リリース判定後に main に merge する。

### branch 運用フロー

```
[1] 機能追加・整備 → develop で作業
[2] develop に commit + push (.session-state/ 含む)
[3] リリース判定 (RB-008 §リリース判定基準) を満たしたら:
    [3.1] develop の中で .session-state/ 以外を整理
    [3.2] git checkout main && git merge develop --no-ff
    [3.3] .gitignore で .session-state/ を除外しているので main には自動的に含まれない
    [3.4] git tag -a vX.Y.Z -m "..." (semver で版を切る)
    [3.5] git push origin main && git push origin vX.Y.Z
[4] 次の開発サイクルは develop で継続
```

## semver 運用

### 版番号のルール

| パターン | 意味 | ecc-method での扱い |
|---|---|---|
| **v0.x.y** | 試行錯誤期、API 不安定 | 現在ここ (v0.1.0)、外部公開はするが「破壊的変更あり得る」と明示 |
| **v1.0.0** | 公開・配布期、API 安定保証 | HW-D / HW-E / HW-F 完了後 |
| **vX.Y.0** (Y > 0) | 機能追加 (後方互換) | 新章 / 新 Runbook 追加など |
| **v1.Y.Z** (Z > 0) | 修正 (後方互換) | typo / リンク修正 / 出典更新 |
| **v2.0.0** | 破壊的変更 | 章構成の大幅変更、原則の追加削除など |

### 試行錯誤期 (v0.x) の規律

- 利用者には「v0.x は試行錯誤期、API 変更の可能性あり」と README に明示
- 各リリースで CHANGELOG に変更点を記録 (たとえ破壊的変更でも v0 中は許容)
- v1.0 リリース判定基準 (下記) を満たしたら v1.0 に進む

### 公開期 (v1.0+) の規律

- 破壊的変更は v2.0 へ昇格 (Major bump)
- 利用者の既存 `.session-state/` 互換性を保つ (schema 変更は major bump)
- deprecate は 1 minor 期間予告 → 次 major で削除

## リリース判定基準 (v0.x → v1.0 への昇格)

以下すべてを満たしたら v1.0 にできる:

- [ ] 採番の意味が再定義されている (現状の `27` `45` `85` 散在を整理)
- [ ] 全章で個人/組織情報・絶対パスゼロ (機械検査 pass)
- [ ] 全章末尾に「## 出典」「## 不確実性」がある
- [ ] CHANGELOG.md が整備されている (v0.x 期の変更履歴含む)
- [ ] 別ユーザー / 別案件で 3 ステップ導入が成功している (再現性確認)
- [ ] 主要 URL の生死確認が直近 30 日以内 (85_frontier/README.md 検証ステータス表)
- [ ] LICENSE が明示されている (現状 MIT)
- [ ] README が利用者視点で書かれている (RB-008 を参照、開発者向けではない)

## .gitignore 規約

`main` branch の `.gitignore` は最低限以下を含める:

```gitignore
# 開発用ハンドオーバーは develop branch のみで追跡 (配布版に混入させない)
.session-state/

# 一時ファイル
_tmp/
*.tmp
*.bak

# Python (検証スクリプト用)
__pycache__/
*.pyc
.pytest_cache/
.coverage

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db
```

`develop` branch では `.session-state/` を **除外しない** (`.gitignore` 内の `.session-state/` 行をコメントアウトするのではなく、merge 戦略で main の `.gitignore` を develop に持ち込んだ上で、`.session-state/` は develop では既に commit 済 = 追跡対象として残る)。

git の挙動: `.gitignore` は **未追跡ファイルを ignore する** ものなので、既に追跡対象のファイルには影響しない。develop で `.session-state/` を最初に commit しておけば、後から main の `.gitignore` を merge しても `.session-state/` は追跡継続される。

## CHANGELOG 規約

`CHANGELOG.md` を main branch のルートに置く:

```markdown
# Changelog

すべての注目すべき変更を記録する。Keep a Changelog 形式 (https://keepachangelog.com/) と Semantic Versioning に従う。

## [Unreleased]

### Added
- (次リリースで追加予定の機能)

### Changed
### Deprecated
### Removed
### Fixed
### Security

## [v0.1.0] - 2026-06-24

### Added
- 初版リリース。8 原則 / Expert Registry / Runbook System / Quality Gate / 文体規範 / Frontier 章
- README + LICENSE (MIT)

## [v0.2.0] - YYYY-MM-DD

### Added
- ...
```

## リリース手順 (チェックリスト)

```
[1] develop でリリース判定基準を確認
[2] CHANGELOG.md の [Unreleased] を [vX.Y.Z] に確定
[3] develop で commit "chore: prepare release vX.Y.Z"
[4] git checkout main
[5] git merge develop --no-ff -m "release: vX.Y.Z"
[6] .gitignore で .session-state/ が除外されていることを確認
[7] git tag -a vX.Y.Z -m "..."
[8] git push origin main
[9] git push origin vX.Y.Z
[10] GitHub Releases UI で release note を作成 (CHANGELOG から転記)
[11] develop で次バージョン (Unreleased) の準備を再開
```

## 検証 (成功条件)

- [ ] main を clone した利用者の作業ディレクトリに `.session-state/` が存在しない
- [ ] develop を clone した開発者の作業ディレクトリに `.session-state/` が存在する
- [ ] `git tag --list` で v0.1.0 が見える
- [ ] README に version / branch 説明がある
- [ ] CHANGELOG.md がある (v1.0 までに整備)

## 失敗時のリカバリ

| 症状 | 原因 | 対処 |
|---|---|---|
| main に `.session-state/` が混入 | `.gitignore` 設定漏れ or git rm 忘れ | `git rm -rf --cached .session-state/` + `.gitignore` 確認 + commit |
| develop で `.session-state/` が無視される | 既に追跡対象だが checkout タイミングで欠落 | `git checkout develop -- .session-state/` |
| tag 付け忘れ | リリース手順の漏れ | `git tag -a vX.Y.Z <commit-hash>` で後から付与可能 |
| v0 で破壊的変更後に互換問題 | v0 は API 不安定と明示しているはずだが利用者が誤解 | README に v0 注意書きを強調、v1.0 を急ぐ |

## アンチパターン

| アンチパターン | 害 |
|---|---|
| main 直接編集 | 配布物に未検証の変更が入る |
| develop で `.session-state/` を `.gitignore` 対象にする | 開発進捗が永続化されず引き継ぎ不能 |
| tag を付けずに main 更新 | 利用者が「どの版を使えばいいか」分からない |
| v0 のまま 1 年放置 | 利用者が試行錯誤期で困る、v1.0 への昇格を判断する人不在 |
| 採番調整なしで v1.0 化 | HW-D 未消化のまま公開、メンテ負荷増大 |

## 関連

- RB-006 (セッション引き継ぎ、`.session-state/` の役割定義)
- RB-007 (1 セッション 1 タスク、`.session-state/` の運用規律)
- HW-D (Method v1.0 リリース整理、本 Runbook の v0→v1 昇格条件と直結)
- HW-E (本 Runbook の作成タスク、本ファイル commit で完了)
- METHOD.md §3 第 8 原則「標準を疑う」(GitFlow 採用は標準寄り、trunk-based も検討余地あり)
- 出典:
  - Vincent Driessen "A successful Git branching model" (https://nvie.com/posts/a-successful-git-branching-model/, retrieved 2026-06-24)
  - Semantic Versioning 2.0.0 (https://semver.org/, retrieved 2026-06-24)
  - Keep a Changelog (https://keepachangelog.com/, retrieved 2026-06-24)
  - ユーザー指摘 (2026-06-24 対話)

## 変更履歴

| 日付 | 変更 | 理由 |
|---|---|---|
| 2026-06-24 | 初版 | 配布物 (main) と開発資産 (develop) の分離規律を Method 化 |
