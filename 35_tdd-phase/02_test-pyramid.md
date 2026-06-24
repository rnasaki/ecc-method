---
keywords: [tdd-phase, test, pyramid]
related: []
---
# 35_tdd-phase / 02 Test Pyramid

> テストを unit / integration / e2e の 3 層に分け、層ごとに責務と比率を定める。
> 上層 (e2e) ほど遅く脆く高コスト、下層 (unit) ほど速く安定。下層を厚くするのが原則。

## 1. 推奨比率

| 層 | 件数比率の目安 | 実行時間の目安 |
|----|---------------|---------------|
| Unit | 約 70% | テスト全体で数秒〜30 秒 |
| Integration | 約 20% | 数十秒〜数分 |
| E2E | 約 10% | 数分〜10 分 |

比率は厳密値ではなく、「Unit が大半、E2E は限定」という形を維持する目安。

## 2. Unit Test (単体テスト)

### 2.1 責務

- 単一の関数 / クラス / モジュールの内部ロジックを検証する。
- 入力 → 出力の対応関係を確定させる。
- 分岐網羅、例外パス、エッジケースをここで網羅する。

### 2.2 範囲

- ファイル I/O・ネットワーク・DB を使わない。
- 外部依存はすべてフェイク/モック (`04_fake-injection.md`)。
- 1 テスト 1 アサーション原則 (関連が強ければ複数 assert は許容)。

### 2.3 配置

- ファイル: `tests/unit/test_<module>.py` (言語に応じた慣習に合わせる)
- 命名: `test_<FeatureID>_<AC>_<状況>`
- 例: `test_F03_AC_01_extract_blank_page_returns_empty()`

### 2.4 速度目標

- 1 テスト 50ms 以内。
- 全 unit テスト合計で 30 秒以内が望ましい (CI ループの摩擦を減らす)。

## 3. Integration Test (結合テスト)

### 3.1 責務

- 複数モジュールの結合点、または外部依存との接合点を検証する。
- DB スキーマ、API ルーティング、メッセージキュー、ファイル I/O を含む経路。

### 3.2 範囲

- 実 DB (テスト用 DB or テストコンテナ) を使ってよい。
- 外部 API は契約テストまたはサンドボックスで代替。
- LLM 呼び出しはフェイクで代替 (本物 LLM はコスト・再現性の観点で integration では使わない)。

### 3.3 配置

- ファイル: `tests/integration/test_<flow>.py`
- 1 テストで複数モジュールにまたがる前提で記述。

### 3.4 注意点

- セットアップ/ティアダウンが重くなりがち。fixture を共通化する。
- 並列実行時のリソース競合に注意 (DB 名やポートを動的化)。

## 4. E2E Test (End-to-End テスト)

### 4.1 責務

- 利用者視点の主要フローを通しで検証する (UI 操作 / API 経由)。
- requirements.md の主要 AC のうち、利用者観測を直接検証するもの。

### 4.2 範囲

- 本番に近い構成で起動 (DB / API / フロントを統合)。
- LLM は決定論的なフェイクまたはレコーディング再生を推奨。
- 全 AC ではなく、Happy Path + 主要 Sad Path に限定する。

### 4.3 配置

- ファイル: `tests/e2e/test_<journey>.py`
- 重い fixture は `conftest` 等で共有。

### 4.4 フレーキー対策

- 待機を時間ベースではなく状態ベース (要素出現待ち / API 応答待ち) で書く。
- 失敗時のスクショ / ログ / トレースを自動収集する。

## 5. 層の選び方 (判断フロー)

```
新しいテストを書く
  └─ 1 関数の入出力で完結するか?
       ├─ Yes → Unit
       └─ No → 複数モジュールの結合か?
                ├─ Yes → Integration
                └─ No → 利用者視点のフローか?
                         ├─ Yes → E2E
                         └─ No → 設計を見直す
```

## 6. 反パターンの典型

| 形 | 問題 |
|----|------|
| アイスクリームコーン | E2E ばかり厚く Unit が薄い → 遅くて脆い |
| 砂時計 | Unit と E2E はあるが Integration が無い → 結合バグが本番で出る |
| ピラミッドの逆さま | 層比率が逆転 → CI が遅くなり開発体験悪化 |

## 7. AI エージェントとの関係

- LLM 呼び出しを含むモジュールは、Unit ではフェイク注入で挙動を固定する。
- Integration では契約 (入出力スキーマ) を検証し、本物 LLM の呼び出しは行わない。
- E2E でのみ「LLM レコーディング再生」を限定的に使ってよい。

## 8. アンチパターン

- 全テストを E2E で書いて Unit を省略する。
- Unit で外部 DB に接続している (層の責務違反)。
- Integration で本物 LLM を呼んで CI が高コスト・非決定的になる。
- E2E が全 AC を網羅しようとして 1 時間級の実行時間になる。

## 9. 関連リンク

- `01_red-green-refactor.md` — RGR の単位
- `03_coverage-policy.md` — カバレッジしきい値
- `04_fake-injection.md` — 各層でのフェイク戦略

## 出典

- L1: BP-021 Red-Green-Refactor — `./05_principles/_data/best_practices.json` (retrieved_at: 2026-06-23)
- L1: Test Driven Development (Martin Fowler) — https://martinfowler.com/bliki/TestDrivenDevelopment.html (retrieved_at: 2026-06-23)

## 不確実性

- 70/20/10 の比率は経験則であり、ドメインによって変動する (例: データパイプライン中心では integration が増える)。本書は目安として記載。
- E2E の自動化対象範囲はチーム規模で異なる。本書は「Happy Path + 主要 Sad Path」のみ規定する。
