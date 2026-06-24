---
keywords: [tdd-phase, fake, injection]
related: []
---
# 35_tdd-phase / 04 Fake Injection

> LLM / 外部 API / I/O などの非決定的・高コストな依存を、テスト中はフェイク (Fake / Stub) に差し替える。
> design.md で「フェイク注入点」を確定し、テストでは決定論的な代替実装を注入する。

## 1. 用語

| 種類 | 説明 |
|------|------|
| Fake | 軽量だが本物に近い動作をする代替実装 (例: in-memory DB) |
| Stub | 固定応答を返すだけの単純な代替 |
| Mock | 呼び出し回数や引数を検証する代替 |
| Spy | 実装は本物に委譲しつつ呼び出しを記録する代替 |

本書ではテスト目的別に Fake / Stub を使い分ける。Mock の多用は脆いテストにつながるため避ける。

## 2. 注入対象 (代表例)

| 対象 | 理由 | 推奨置換 |
|------|------|----------|
| LLM クライアント | 非決定的 / コスト / 遅延 | FakeLLM (固定応答) |
| HTTP クライアント | ネットワーク依存 / 外部障害伝播 | FakeFetcher (URL→応答マップ) |
| 時計 (now) | 時刻依存テストが不安定化 | FakeClock (固定時刻) |
| 乱数 | 再現性なし | SeededRandom |
| ファイルシステム | I/O 速度 / 副作用 | tmpdir + 抽象化 |
| 外部メッセージキュー | 結合の重さ | InMemoryQueue |

## 3. 設計原則

### 3.1 インタフェース駆動

- 本物実装と同じインタフェースを持つ Fake を提供する。
- アプリ本体は具象クラスではなくインタフェース (抽象基底 / Protocol / interface) に依存する。

### 3.2 依存注入 (DI)

- コンストラクタ引数 / 関数引数 / DI コンテナでフェイクを差し込む。
- グローバル変数を直接書き換える手法 (monkeypatch) は最終手段とする。

### 3.3 1 つの責務に 1 つの注入点

- LLM クライアントとプロンプト構築を 1 クラスに混ぜない。
- 注入点を増やしすぎると「フェイクの組み合わせ爆発」が起きるため、責務分割で抑制する。

## 4. FakeLLM パターン

### 4.1 最小実装

```python
class FakeLLM:
    def __init__(self, responses: dict[str, str]):
        # key: プロンプトの正規化文字列, value: 期待レスポンス
        self._responses = responses
        self.calls: list[str] = []

    def complete(self, prompt: str) -> str:
        self.calls.append(prompt)
        for key, value in self._responses.items():
            if key in prompt:
                return value
        raise KeyError(f"FakeLLM: no response registered for prompt fragment")
```

### 4.2 典型的な使い方

- ハッピーパス: 期待レスポンスを 1 件登録。
- 失敗系: `complete` が例外を投げる FakeLLM 派生を用意。
- 構造化出力 (JSON) のテスト: 不正 JSON を返すバリエーションも準備。

### 4.3 注意点

- 「常に成功する FakeLLM」だけでテストを揃えると失敗系が検証されない。
- レスポンスは 1 行リテラルではなく、本物の構造 (JSON スキーマ) と一致させる。
- 呼び出しログ (`self.calls`) を assert に活用し、プロンプト構築の回帰を捕まえる。

## 5. FakeFetcher パターン

```python
class FakeFetcher:
    def __init__(self, mapping: dict[str, FakeResponse]):
        self._mapping = mapping
        self.calls: list[str] = []

    def get(self, url: str) -> FakeResponse:
        self.calls.append(url)
        if url not in self._mapping:
            raise LookupError(f"FakeFetcher: no fixture for {url}")
        return self._mapping[url]
```

- HTTP ステータス / ヘッダ / ボディを `FakeResponse` で表現。
- タイムアウトや 5xx を再現するために、例外を投げるバリアントも用意。

## 6. Stub パターン

最低限の固定応答だけ必要な場合は Stub で十分。

```python
class StubClock:
    def now(self) -> datetime:
        return datetime(2026, 6, 23, 12, 0, 0)
```

- 状態を持たない / ロジックを持たないことが Stub の特徴。
- 呼び出し検証が必要なら Spy か Mock に格上げする。

## 7. テスト層別の使い分け

| 層 | 推奨 |
|----|------|
| Unit | Stub / Fake を使い、外部 I/O は完全に遮断 |
| Integration | 本物の DB / キューは使ってよい。LLM と外部 API は Fake |
| E2E | 必要に応じて LLM を「録画再生」型 Fake に差し替え |

詳細は `02_test-pyramid.md` を参照。

## 8. design.md での明示

design.md (`30_sdd-phase/04_design-template.md`) の「AI エージェント設計」セクションに以下を記載すること。

- 注入点となるインタフェース名
- フェイク実装のクラス名と配置パス
- テストで切り替える DI ポイント (コンストラクタ / DI コンテナ / 環境変数)

## 9. アンチパターン

- 本体コード内に `if testing:` 分岐を埋め込む (本体がテストを知る逆転)。
- 巨大な Mock 設定で 1 テストに 50 行のセットアップが必要。
- フェイクのレスポンスがハードコード文字列で実構造と乖離している。
- monkeypatch でプライベート関数を書き換え、リファクタ耐性が失われる。

## 10. 関連リンク

- `01_red-green-refactor.md` — RGR の中で Fake をどう使うか
- `02_test-pyramid.md` — 層ごとの Fake 戦略
- `30_sdd-phase/04_design-template.md` — フェイク注入点の明示

## 出典

- L1: BP-021 Red-Green-Refactor — `./05_principles/_data/best_practices.json` (retrieved_at: 2026-06-23)
- L1: BP-008 delegate file-heavy investigation (依存切り離しの一般原則) — `./05_principles/_data/best_practices.json` (retrieved_at: 2026-06-23)
- L1: Test Driven Development (Martin Fowler) — https://martinfowler.com/bliki/TestDrivenDevelopment.html (retrieved_at: 2026-06-23)

## 不確実性

- Fake / Stub / Mock / Spy の用語定義は文献によって揺れがある。本書は xUnit Patterns に近い区分を採用するが、厳密な分類は規定しない。
- DI 方式 (コンストラクタ / セッタ / DI コンテナ) は言語/フレームワーク依存のため、本書は「DI を使う」原則のみ規定する。
