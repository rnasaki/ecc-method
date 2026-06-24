---
schema: RB-007
session_id: 6 (ecc-method 開発、Session 6、HW-I self-dogfooding)
created_at: 2026-06-24
last_updated: 2026-06-24
status: completed
branch: develop
---

# Current Session - ecc-method 開発

## ターゲットタスク (1 つ)

**HW-I**: Method 開発者の self-dogfooding 設定 — 開発リポ (`Documents/GitHub/ecc-method`, develop) と利用ディレクトリ (`~/.claude/methods/ecc-method`, main) の分離が原因で develop の改修が agent 自身に効かない問題を、Windows junction で構造的に解消する。

選択理由 (RB-003 L1 導出 + ユーザー指摘):
- ユーザー「ECC-Method 読まれてない？」「クローズが無い」が再発した根因は、agent が main 版を Read していたから (develop の 4 要素クローズ規律 / RB-006 改訂 / RB-009/010 が反映されていなかった)。
- v1.0 切りまで main にマージしないポリシー (RB-008) と組み合わさると、自己 dogfooding が半年以上機能しない期間が生じる。
- ユーザー判断「私はMethod開発者であり配布版Methodの利用者でもある。GitHub ディレクトリの開発物と .claude 配下のものが同一である必要がある」 → junction で物理的に同一化。

## 完了条件 (本セッション)

- [x] `~/.claude/methods/ecc-method` の状態確認 (untracked / 未 push 0 件)
- [x] バックアップへ退避 (`ecc-method.bak-2026-06-24`)
- [x] junction 作成 (`mklink /J`)
- [x] 同一性検証 (branch=develop, HEAD 一致)
- [x] 運用手順を `99_distribution/04_developer-self-dogfooding.md` に文書化
- [x] PENDING.md / HISTORY.md / COMPLETED.md / current_session.md 更新

## 本セッションの所見

### A. 死に番回避の判断 (RB-003 L1 + ユーザー指摘)

junction 運用は **Method 開発者 (= dogfooding する自分) のみに発生する**問題。当初 RB-011 として Runbook 化したが、ユーザー指摘「11番は死に番になる。どうする？」で再考:

- Runbook 番号 (RB-NNN) は配布利用者の Concept Graph / Runbook 検索の名前空間も占有する → 利用者に無関係な手順を載せると死に番化
- `99_distribution/` は既に配布側のノウハウ章 (`01_how-to-redistribute.md`, `02_license-note.md`, `03_v1.0.0-release-checklist.md`) が並ぶ。§4 として「開発者向け」と明示すれば自然に納まる
- 利用者は §0 の対象読者表記で読み飛ばせる、開発者だけ参照する

⇒ RB-011 ファイルを削除、`99_distribution/04_developer-self-dogfooding.md` を新設。

### B. 配布版 (main) との関係

| 立場 | 利用ディレクトリ | 同期方法 |
|---|---|---|
| Method 開発者 (= 利用者) | 開発リポへの junction | `git commit` した瞬間に反映 (本章) |
| 一般利用者 | `git clone main` | リリース版を `git pull` (RB-008) |

開発者だけが develop を直視。配布利用者には影響しない。

### C. 検証結果

```
ls ~/.claude/methods/ecc-method/45_runbook/runbooks/  → RB-001〜010 が見える
git branch --show-current                              → develop
git rev-parse HEAD                                     → 開発リポと同一
```

junction は透過的に機能。利用ディレクトリで操作するとリスクがあるため、規律として「変更は開発リポ側でのみ行う」を §4 アンチパターンに記載。

## このセッションで触らなかったもの (スコープ外)

- HW-F (SDD/TDD 汎用化精査) — junction 統合により次セッション以降は agent が develop 最新を読むので継続可能
- HW-B / HW-C / HW-H

## 次セッション (Session 7) の出発点

- branch: develop
- 残 P1: HW-F (9 章残)
- junction 統合により agent は自動で develop の最新規律を読む。次回起動時、初回 Read で `99_distribution/04` の存在を把握、4 要素クローズ等が確実に機能する
- 開始時にユーザーへ「HW-F 続き or 他」を 1 行で問う

## 関連

- GOAL.md (北極星 = SDD/TDD 汎用化 + v1.0 配布)
- PENDING.md (HW-F: 2/11 章完了、HW-I: 完了)
- ../99_distribution/04_developer-self-dogfooding.md (本セッションで新設)
- ../45_runbook/runbooks/RB-003-autonomous-decision-framework.md (L1 導出で死に番回避を agent + ユーザー協調判断)
- ../45_runbook/runbooks/RB-006-session-handover-protocol.md
- ../45_runbook/runbooks/RB-008-branch-strategy-and-semver.md

# ⚠️ このセッションはクローズ
