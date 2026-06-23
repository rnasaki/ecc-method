---
id: RB-010-bash-auto-background-on-windows-pytest
title: Windows + Git Bash 経由の長時間 pytest は 2 分 timeout で自動 background 化され出力が空のまま観測不能になる
category: pitfall
tags: [bash, background, timeout, pytest, windows, git-bash, observability, claude-code]
created: 2026-06-24
updated: 2026-06-24
last-verified: 2026-06-24
status: active
trigger: Bash ツールで pytest 全体実行など 2 分超のコマンドを foreground 起動したが応答が返らない / 自動 background 化された / 出力ファイルがサイズ 0 のまま / TaskOutput でも timeout / 結果が確認できない
expert-routing: [general-purpose, Explore]
related: [[RB-005-subagent-realtime-streaming-via-hooks]]
source: ecc-method 段階 2 テスト Session 2 (2026-06-24) で実機検証、本リポ backend tests/ pytest 実行時に再現
---

# Windows + Git Bash + pytest 全体実行の auto-background 罠

## TL;DR (30 秒で読める結論)

Claude Code の Bash ツールは Windows の Git Bash (mingw64) で `python -m pytest tests/` のような 30 秒超の重いコマンドを `timeout` 既定値 (120,000ms = 2 分) で起動すると、**完了前に自動で background 化** されることがある。さらに本セッションでは:

1. background 化された task の `.output` ファイルが **サイズ 0 のまま** 完了通知が届かない
2. `TaskOutput(block=true)` も自分の timeout で抜ける
3. `TaskStop` で止めても出力は空

結果としてテスト結果が一切観測できない。**回避策は「対象スコープを LLM 関連のみに絞る + `--no-cov` で CPU 削減 + foreground (run_in_background なし) で 2 分以内に完了させる」**。573 → 30 件まで絞ると 16 秒で前景完了する。

## 前提 (要権限・要環境)

- OS: Windows 11 Pro (10.0.26200)
- Shell: Git Bash 4.x (mingw64) — Claude Code on Windows のデフォルト
- Python: `C:/Users/<user>/AppData/Local/Programs/Python/Python312/python.exe` 経由起動
- pytest: pytest-cov, pytest-asyncio が入った状態

## 再現条件 (実機ログ)

```
$ python -m pytest tests/ --no-header -q --no-cov
# → Bash ツールが 120s 経過時点で自動 background 化
# task_id: bdvkgd2mm
# output file: ...\tasks\bdvkgd2mm.output → 4096 byte allocate, 0 byte written
# TaskOutput(block=true, timeout=180000) → <retrieval_status>timeout</retrieval_status>
# TaskStop → "Successfully stopped" (出力空のまま終了)
```

同セッションで `tests/unit/` 限定 + `--no-cov` でも同症状が再現。`tests/unit/test_anthropic_client.py tests/unit/test_azure_openai.py tests/unit/test_aicore_client.py` の 3 ファイル限定 (= 30 テスト) では 16.80 秒で前景完了し、回避できることを確認。

## 手順 (コピペ可能・冪等)

### 推奨パターン: 対象スコープを絞って前景実行

```bash
# 1) 影響範囲を特定 (今回触ったファイルだけ)
python -m pytest tests/unit/test_<target>.py --no-header --no-cov -q

# 2) それでも遅ければ tail を絞る
python -m pytest tests/unit/test_<target>.py --no-header --no-cov -q 2>&1 | tail -5
```

`--no-cov` は coverage プラグイン (pytest-cov) を完全 off にする。Windows ではこれが有意に重く、タイムアウト境界を跨ぎやすい。

### Coverage を取りたい場合

```bash
# coverage は対象モジュール限定で取る (全 src を計測しない)
python -m pytest tests/unit/test_<target>.py \
  --cov=app.<target_pkg>.<target_module> \
  --cov-report=term-missing --no-header -q
```

### 全体回帰が本当に必要なとき

```bash
# tests/unit と tests/integration を分けて 2 回に分割
python -m pytest tests/unit/ --no-header --no-cov -q
python -m pytest tests/integration/ --no-header --no-cov -q
```

それでも 2 分を超える場合は、`pytest-xdist` で `-n auto` 並列化を検討するか、CI に委譲し session 内では実行しない。

### 緊急ストップ手順

background task が応答不能になった場合:

```
1. /tasks コマンドで task_id 一覧確認
2. TaskStop({task_id: "<id>"}) で停止
3. 該当 .output ファイルを Read で開いて内容確認 (空なら諦める)
4. 同じコマンドを foreground + スコープ限定で再実行
```

## 検証 (成功条件)

- [ ] foreground 実行で 120 秒以内に exit (`==== N passed in M.MMs ====` を確認)
- [ ] auto-background に落ちない (task_id が新規発行されない)
- [ ] 出力ファイル (もし background なら) が空ではない

## 失敗時のリカバリ

| 症状 | 原因 | 対処 |
|---|---|---|
| 2 分超えて応答が返らない | Bash デフォルト timeout=120000 | スコープを絞る or 明示的に `timeout: 600000` を指定 |
| `.output` がサイズ 0 のまま | Windows 上で stdout flush せずプロセス停止 | 別シェルから `python -m pytest ...` 直接実行を user に依頼 |
| TaskOutput も timeout | task が hang している | TaskStop で停止し、スコープ限定で再実行 |
| `tail -5` でも空 | パイプの buffering で flush されない前に止まった | `--no-header --no-cov -q` で出力量を最小化、`stdbuf -o0` を試す (mingw64 では効かない場合あり) |
| 部分実行も遅い | conftest fixture が collection 時点で重い | `pytest --collect-only -q` で構造だけ確認 → 真に必要な test ファイルのみ単独実行 |

## 設計判断: Quality Gate との折り合い

ecc-method 60_quality-gates の TDD ループは「全テスト pass で回帰なし」を完了条件にしているが、本 pitfall に該当する場合は:

1. **対象モジュール単体 pass + LLM 関連 (or 同レイヤー) 限定回帰 pass** を最低基準とする
2. **CI で全件回帰** を後追いする (PR 時点で CI green が条件)
3. session 内で全件強行しない (時間と context の浪費を避ける)

これは妥協ではなく、「session の制約と CI の制約を分離する」設計判断。段階 2 テスト Session 2 でこの分離を確立した。

## 関連

- [[RB-005-subagent-realtime-streaming-via-hooks]] — subagent 観測の方は hooks 経由でストリーミングするが、本 pitfall は **メイン loop の Bash ツール** の問題で別系統
- ../03_capture-trigger.md — 「2 分超 / 観測不能」を本 Runbook 化のトリガに追加
- 出典: 実機検証 (Session 2, 2026-06-24, c:/Users/tie209174/Documents/GitHub/企業情報収集/backend tests/)、Claude Code Bash tool 仕様 (timeout: number, max 600000)

## 変更履歴

| 日付 | 変更 | 理由 |
|---|---|---|
| 2026-06-24 | 初版 | Session 2 HW-A.1 完走時に backend/ tests/ pytest 全体実行が auto-background → 出力空 → 観測不能を 3 回踏み、回避策 (LLM 関連限定 + --no-cov + foreground) で完了。再発防止のため永続化 |
