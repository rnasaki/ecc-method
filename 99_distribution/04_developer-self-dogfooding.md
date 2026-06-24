# 04 — Method 開発者の self-dogfooding 設定

> **対象読者**: ecc-method 自体を改修する開発者 (= Method の利用者でもある人)。一般利用者 (`git clone main` で導入する人) は読み飛ばして良い。

## 0. なぜこの章があるか

ecc-method の開発者は同時に ecc-method の利用者でもある (dogfooding)。このとき以下の構造的な不整合が起きる。

| 場所 | branch | 役割 | 問題 |
|---|---|---|---|
| 開発リポ (例: `Documents/GitHub/ecc-method`) | develop | 改修の出所 | 最新規律が入る |
| 利用ディレクトリ (`~/.claude/methods/ecc-method/`) | main | agent が実行時に Read | 配布版なので develop の改修が入っていない |

結果、develop で書いた規律 (例: 終了時 4 要素クローズ、RB-006/007/009/010) が **agent 自身に効かない**。`v1.0.0` 切りまで main にマージしない方針 (RB-008) と組み合わさると、改修してから半年以上 dogfooding できない期間が生じる。

本章は、この不整合を **Windows junction (NTFS reparse point)** で構造的に解消する手順。配布利用者には影響しない (利用者は引き続き main を `git clone` する)。

## 1. 立場別の運用

| 立場 | 利用ディレクトリの作り方 | 同期方法 |
|---|---|---|
| Method 開発者 (= 利用者) | 開発リポへの **junction** | `git commit` した瞬間に反映 (本章) |
| 一般利用者 | `git clone main` | リリース版を `git pull` ([RB-008](../45_runbook/runbooks/RB-008-branch-strategy-and-semver.md)) |

開発者だけが develop を直視する。これにより「自分が書いた規律が自分に効かない」現象を解消する。

## 2. 前提

- Windows 10 以降 (junction = NTFS の機能、開発者モード不要)
- 開発リポと利用ディレクトリが **同一ドライブ** (junction は同一ボリューム限定。Linux/macOS は `ln -s` で代替)
- 利用ディレクトリが clean (untracked / 未 push 0 件)
- 開発リポと利用ディレクトリが **同一の origin**

## 3. 手順

### 3.1 利用ディレクトリの状態確認

```bash
cd ~/.claude/methods/ecc-method
git status --short          # 0 件
git log origin/main..HEAD   # 0 件
git remote -v               # 開発リポと同一
```

未 push があれば先に push する。

### 3.2 利用ディレクトリをバックアップへ退避

```bash
mv ~/.claude/methods/ecc-method ~/.claude/methods/ecc-method.bak-$(date +%Y-%m-%d)
```

### 3.3 junction を作成

```bash
# Git Bash から cmd.exe 経由で mklink を呼ぶ
cmd //c "mklink /J C:\\Users\\<USER>\\.claude\\methods\\ecc-method C:\\Users\\<USER>\\Documents\\GitHub\\ecc-method"
```

`/J` = directory junction (管理者権限不要)。Linux / macOS では `ln -s` で代替する。

### 3.4 同一性を検証

```bash
ls ~/.claude/methods/ecc-method/45_runbook/runbooks/
cd ~/.claude/methods/ecc-method && git branch --show-current   # develop
git rev-parse HEAD                                              # 開発リポと同一
```

### 3.5 (任意) バックアップ削除

数日 dogfooding して問題なければバックアップを削除して良い。

```bash
rm -rf ~/.claude/methods/ecc-method.bak-*
```

## 4. アンチパターン

| やってしまいがち | なぜダメか | 代わりに |
|---|---|---|
| 利用ディレクトリで develop を `git pull` し続ける | 都度 pull を忘れて agent が古い規律を読む | junction で物理的に同一化、pull 操作自体を消す |
| main を develop へマージしてから利用側を pull | v1.0 リリースまで main にマージしないポリシー (RB-008) と衝突 | 利用ディレクトリは develop を直視 |
| 利用ディレクトリ側で commit する | 操作の出所が分散して履歴が壊れる | 変更は開発リポ側で行う (junction でも実体は同じなので意識の問題) |

## 5. トラブルシュート

| 症状 | 原因 | 対処 |
|---|---|---|
| `mklink` がエラー (ファイル名…構文…) | Git Bash でパスが POSIX 化された | `cmd //c "mklink /J C:\\backslash\\path ..."` のように完全 Windows パスを cmd 内で渡す |
| `mklink: ファイルは既に存在します` | 利用ディレクトリが残っている | §3.2 でバックアップへ `mv` してから再実行 |
| 別ドライブにあるリポと junction したい | junction は同一ボリュームのみ | `mklink /D` (symbolic link) を使うか、リポを同一ドライブへ移動 |

## 6. ロールバック

junction が原因で挙動がおかしくなった場合:

```bash
cmd //c "rmdir C:\\Users\\<USER>\\.claude\\methods\\ecc-method"   # junction 削除
mv ~/.claude/methods/ecc-method.bak-YYYY-MM-DD ~/.claude/methods/ecc-method
```

`rmdir` は junction を消すだけで実体 (開発リポ) には触れない。

## 7. なぜ Runbook ではなく `99_distribution/` 章か

junction 運用は **Method 開発者にしか発生しない**。Runbook 番号 (RB-NNN) は配布利用者の Concept Graph / Runbook 検索の名前空間も占有するので、利用者に無関係な手順を載せると死に番化する。本章は配布物に同梱されるが、§0 で「対象読者: 開発者のみ」と明示し、利用者はスキップできるようにしてある。

## 関連

- [RB-006](../45_runbook/runbooks/RB-006-session-handover-protocol.md): 終了時 4 要素クローズ規律 — junction 統合前は agent が古い main 版を読んで自身に効いていなかった
- [RB-008](../45_runbook/runbooks/RB-008-branch-strategy-and-semver.md): main / develop 分離戦略
- [03_v1.0.0-release-checklist.md](./03_v1.0.0-release-checklist.md) §1.4: 配布版整合の根拠

## 出典

- 本パッケージ実機検証 (2026-06-24, ecc-method Session 6 — junction 作成 + HEAD 同一性確認)
- Microsoft Docs, `mklink` command reference (`mklink /J <Link> <Target>`) (retrieved 2026-06-24)
- 本パッケージ `45_runbook/runbooks/RB-008-branch-strategy-and-semver.md` (retrieved 2026-06-24)

## 不確実性

- (実機未検証) Linux / macOS の symlink (`ln -s`) でも同様に機能するはずだが本リポでは未検証 (Windows 11 のみ確認)
- (前提) 開発リポと利用ディレクトリが同一 origin / 同一ユーザー所有。CI 環境や別ユーザーで利用するケースは想定外
- (限界) 本章は self-dogfooding 専用。配布利用者には適用しない
