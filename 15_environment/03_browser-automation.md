---
keywords: [environment, browser, automation]
related: [10_discovery/04_constraint-mapping.md]
---
# 15-03 — Browser Automation (Playwright MCP / Remote Debugging)

ECC で GUI 検証・E2E・スクリーンショット取得を行うための環境設定。

## 目的

- 「言ったことが動くか」を実画面で検証する ([55_verification/](../55_verification/))。
- E2E テストを agent (e2e-runner) から起動できる状態にする。
- 起動済みブラウザに **アタッチ** することで、ログイン状態を引き継いで操作する。

## 経路

### 経路 A: Playwright MCP (推奨)

ECC native の MCP サーバ。Claude Code から直接ブラウザを操作する。

```
1. インストール:
   claude mcp add playwright npx '@playwright/mcp@latest'
2. 起動確認:
   claude mcp list | grep playwright
3. ブラウザバイナリ取得:
   npx playwright install chromium
4. 利用例 (agent から):
   mcp__playwright__browser_navigate { url: "https://example.com" }
   mcp__playwright__browser_snapshot
```

利点:

- 起動 / 操作 / スクリーンショット / network ログ取得が 1 セットで揃う
- agent からの呼び出しが宣言的

注意:

- 大量テキスト入力時はトークン消費に注意。最小要素にフォーカスする。
- ヘッドレス既定。GUI 確認したい場合は `headed` オプションを明示。

### 経路 B: Remote Debugging Port (既存ブラウザ流用)

ログイン状態 / SSO 状態を保ったまま操作したい場合。

```
1. Chrome / Edge を debugging port 付きで起動:
   chrome --remote-debugging-port=9222 --user-data-dir={{home}}/.chrome-ecc
2. Playwright から attach:
   browser = playwright.chromium.connect_over_cdp("http://localhost:9222")
3. 既存タブを取得して操作
```

利点:

- 既ログインセッションを再利用 (SSO / 2FA を avoid)
- 人間が操作しているブラウザを横から見る形で観察可能

注意:

- `--user-data-dir` は ECC 専用に分離 (個人プロファイルと混ぜない)
- secret 入力中の状態を agent に渡さない (PII 流出回避)

### 経路 C: 純 Playwright (CI / バッチ向け)

agent 経由でなく test runner として起動する。

```
1. プロジェクトに導入:
   pnpm add -D @playwright/test
   npx playwright install --with-deps
2. spec を書く: tests/e2e/*.spec.ts
3. 実行: npx playwright test --reporter=html
4. 失敗時 trace: --trace on
```

CI で実行する場合は [60_quality-gates/](../60_quality-gates/) の e2e ゲートと連携する。

## 経路の使い分け

| シーン | 推奨経路 |
|---|---|
| ローカルで「動くか確認」 | A (Playwright MCP) |
| ログイン後画面の探索 | B (remote debugging) |
| 自動 E2E スイート | C (playwright test) |
| 大量視覚回帰 | C + percy / lost-pixel |

## 取得すべき成果物

```yaml
artifacts:
  screenshot: png (フルページ)
  console_log: structured
  network_log: HAR
  trace: playwright trace (失敗時のみ)
  video: mp4 (失敗時のみ)
```

成果物は `_tmp/e2e/<task_id>/` に保存し、レポートに埋める。

## セキュリティ注意

- 個人ブラウザプロファイルと共有しない (Cookie / 履歴混入)
- 認証画面の入力は agent から行わず、人間に委ねる
- スクリーンショットを共有する前に PII / 社外秘を blur

## 失敗時の挙動

| 失敗 | 対応 |
|---|---|
| MCP サーバ起動失敗 | npx 再実行 → 失敗時は経路 C にフォールバック |
| chromium 取得失敗 | proxy / CA bundle を確認 ([10_discovery/04_constraint-mapping.md](../10_discovery/04_constraint-mapping.md)) |
| 9222 が衝突 | 9223〜9230 を試す。固定したい場合は Runbook 化 |
| flaky | `--retries=2` を許容、3 回連続失敗で quarantine ([60_quality-gates/](../60_quality-gates/)) |

## 出典

- Microsoft Playwright docs (https://playwright.dev/docs/intro, retrieved 2026-06-23)
- Playwright MCP server (https://github.com/microsoft/playwright-mcp, retrieved 2026-06-23)
- Chrome DevTools Protocol (https://chromedevtools.github.io/devtools-protocol/, retrieved 2026-06-23)

## 不確実性

- Playwright MCP のインストール手順は配布形態で変動する。`claude mcp` の引数は version で変わる可能性。
- Remote debugging で attach した場合の操作分離は OS 側のサンドボックスに依存する。
- 視覚回帰の closed-source SaaS (percy 等) は将来 EOL の可能性あり。代替候補を四半期 radar で監視する。
