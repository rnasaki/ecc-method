---
keywords: [pitfalls, git, divergence]
related: []
---
# 04 — main 競合の安全プロセス (バックアップ → reset --hard → 意味マージ)

リモート main がローカル main と「分岐」した状態で、安易に `git pull --rebase` や `git push --force` を打つとコミットが消える事故になる。本ファイルは破壊操作なしで安全に統合するための定型を定義する。

## TL;DR

- 分岐 (divergence) を見たら、まず **作業バックアップブランチ** を切る。
- リモートの内容を採用する場合は `git fetch && git reset --hard origin/main` で同期し、自分の変更は別ブランチからチェリーピックで戻す。
- 直接 `git push --force` は禁止。代わりに「意味的にマージしたコミット」を新規に積む。

## 想定する状況

- ローカル `main` とリモート `origin/main` が分岐した。
- ローカルにコミット済みだが未 push の作業がある。
- 他メンバー / CI が同じブランチに push している可能性がある。

## 兆候

```
$ git status
On branch main
Your branch and 'origin/main' have diverged,
and have 3 and 5 different commits each, respectively.
```

または `git pull` 時に:

```
hint: You have divergent branches and need to specify how to reconcile them.
```

## 安全プロセス (5 ステップ)

### Step 1: 状況把握

```bash
git fetch --all --prune
git status
git log --oneline --graph --decorate --all -n 30
git log --oneline main..origin/main   # リモート側にだけある commit
git log --oneline origin/main..main   # ローカル側にだけある commit
```

「両側にだけある commit」を可視化することが最重要。これを見ずに pull/push しない。

### Step 2: バックアップブランチ作成 (必須)

```bash
# 現在地点を保存
git branch backup/main-$(date +%Y%m%d-%H%M%S)

# 必要なら work ブランチも保存
git branch backup/work-$(date +%Y%m%d-%H%M%S)

git branch | grep backup/
```

このバックアップは **削除しない**。少なくとも 1 週間は残す。

### Step 3: 採用方針の決定

| 方針 | 採用ケース |
|---|---|
| **リモート優先 (reset)** | 自分の commit はまだ実験的、リモートが正 |
| **ローカル優先 (merge from local)** | 自分の commit が確定、リモート側が誤マージ |
| **両方統合 (merge / rebase)** | 両方とも残すべき内容 |

迷ったらリモート優先 + チェリーピックで戻す方が安全。

### Step 4-A: リモート優先で同期

```bash
# main をリモートに合わせる (ローカル commit は backup に退避済み)
git checkout main
git reset --hard origin/main

# 必要な commit だけ戻す
git log --oneline backup/main-<timestamp>
git cherry-pick <hash1> <hash2>

# 検証
git log --oneline -n 10
```

### Step 4-B: 両方統合する場合

```bash
git checkout main
git pull --no-rebase --no-ff origin main
# マージコミットメッセージで「なぜ両方残すか」を 1 行書く

# または: 自分の commit を別ブランチで rebase してから PR
git checkout -b feature/local-changes backup/main-<timestamp>
git rebase origin/main
# conflict 解決 → push → PR
```

### Step 5: push と検証

```bash
# dry-run で副作用確認
git push --dry-run origin main

# force-with-lease は禁止 (本番 main では特に)。代わりに新規 commit を積む。
git push origin main
```

push が rejected なら Step 1 からやり直す。

## 禁止操作

| 操作 | なぜ禁止 |
|---|---|
| `git push --force origin main` | 他メンバーの commit を消失させる |
| `git push --force-with-lease origin main` (本番) | local が古い場合は安全だが、共有 main では事故誘発 |
| `git reset --hard` をバックアップなしで実行 | 取り戻し不能 |
| `git rebase -i` で複数人 commit を編集 | 履歴改ざん、署名破壊 |
| pull 失敗を `--allow-unrelated-histories` で誤魔化す | 別リポを統合する誤接続が混入 |

## reflog による緊急リカバリ

reset --hard の直後に「やはり戻したい」場合:

```bash
git reflog              # 直近の HEAD 移動履歴
git reset --hard HEAD@{1}   # 1 個前に戻す
```

reflog は既定 90 日保持。`git gc` を打つと消える可能性があるので、不安なら即バックアップブランチを切り直す。

## CI / レビュー視点

- 共有 `main` への push は PR 経由のみとし、直 push を branch protection で禁止する。
- 直 push が必要な小規模リポでも、`git push --force*` は protection で reject にする。
- マージ戦略は固定 (squash / merge commit / rebase のいずれかに揃える)。

## 検証

成功条件:

- [ ] `git log --oneline origin/main..main` が空 (= push 不要差分なし)
- [ ] 元の commit が `git reflog` または backup ブランチから取り出せる
- [ ] `git push --dry-run` が "Everything up-to-date" を返す
- [ ] CI が green

## エージェントからの扱い

| 事故 | 防ぎ方 |
|---|---|
| LLM が「main が更新されているので reset --hard」と勝手に実行 | reset 前に必ず backup を切る・差分を要約してユーザに確認 |
| diff を見ずに `git pull --rebase` でコンフリクト解決を放置 | conflict が出たら手動レビューを必須化 |
| 複数 push が rejected で `--force` を学習してしまう | エージェント側プロンプトで `--force*` 全面禁止を明記 |

## 出典

- Pro Git Book Chapter 3 (https://git-scm.com/book/en/v2, retrieved_at: 2026-06-23)
- Git Reference `git-reset` (https://git-scm.com/docs/git-reset, retrieved_at: 2026-06-23)
- Git Reference `git-reflog` (https://git-scm.com/docs/git-reflog, retrieved_at: 2026-06-23)

## 不確実性

- 組織のマージポリシー (squash 強制 / Linear history 強制) によっては merge commit が拒否される。プロジェクト規約の確認が前提。
- LFS / submodule を使うリポジトリでは reset 後に追加コマンド (`git lfs pull` / `git submodule update --init`) が必要。
