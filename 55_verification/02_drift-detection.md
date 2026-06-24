---
keywords: [verification, drift, detection]
related: [55_verification/01_traceability.md, 60_quality-gates/06_red-team-loop.md, 50_permissions/05_escalation-policy.md, 55_verification/03_demo-readiness.md]
---
# 02 — Drift Detection (スペックとコードの乖離検知)

実装が進むにつれ、spec と code は必ず乖離する。乖離を **早期検知** し、コードより先に spec を更新する規律を保つ。

---

## 1. drift とは

| 種別 | 定義 | 例 |
|---|---|---|
| spec-test drift | spec の AC とテストが対応しない | AC12-3 の文言と TEST-AC12-3 の検証内容が違う |
| spec-code drift | spec の design とコードが矛盾 | D12-A は in-memory cache と書いたが Redis 実装になっている |
| AC-coverage drift | spec の AC にテストが存在しない | AC12-4 を検証するテストがゼロ |
| ghost code | spec から外れたコードが残存 | 削除済み AC のための関数が arbitrary に残っている |

---

## 2. 検知方法 (3 系統)

### 2.1 受入基準カバレッジ表

[01_traceability.md](./01_traceability.md) のカバレッジ表を以下のチェックで自動評価:

```
- 全 AC が test に存在する
- 全 test が AC を引いている
- 全 AC が code 位置 (任意) と紐づく
- status = Drift の行がゼロ
```

CI で再生成し、差分があれば PR をブロックする。

### 2.2 Hash 比較

各 AC ブロックの内容を SHA-256 でハッシュし、テスト先頭コメントに記録:

```typescript
// TEST-AC12-1
// spec_hash: 7f3c... (requirements.md AC12-1 ブロックの SHA-256)
test('AC12-1: ...', () => { ... })
```

CI で再ハッシュし、テスト側 hash と spec 側 hash が一致しなければ drift とみなす。

```bash
# 擬似コード
spec_hash=$(grep -A 4 "## AC12-1" requirements.md | sha256sum)
test_hash=$(grep "spec_hash:" tests/foo.test.ts | head -1 | awk '{print $3}')
[ "$spec_hash" = "$test_hash" ] || echo "DRIFT: AC12-1"
```

### 2.3 spec-test mismatch (semantic)

ハッシュは表層変化に弱い (空白 1 文字で drift 扱い)。意味的 mismatch は別レビューエージェント ([60_quality-gates/06_red-team-loop.md](../60_quality-gates/06_red-team-loop.md)) に AC とテストを比べさせる:

```
入力: AC12-1 文面 + TEST-AC12-1 ソース
判定: テストは AC を確かに検証しているか? (yes / no / partial)
```

partial / no が出たらフラグ。

---

## 3. drift 発生時の規律

実装中に「spec と違う方が良い」と気づいた場合:

```
1. 実装を一旦止める
2. spec (requirements / design / tasks) を更新
3. AC ID は変えない (履歴保全)、内容のみ書き換え
4. 関連テストの spec_hash を再計算
5. テスト名・コメントを更新
6. その上でコードを修正
```

**コード先行で spec 修正は事後** という流れは禁止。発見されにくい drift を生む。

---

## 4. drift status の運用

カバレッジ表 ([01_traceability.md](./01_traceability.md)) に `status: Drift` を立てたら、解消まで以下を強制:

- 該当 F<NN> の他 AC への新規実装を停止
- ASK-EACH に昇格 ([50_permissions/05_escalation-policy.md](../50_permissions/05_escalation-policy.md))
- drift 解消 PR が他作業に先行する

---

## 5. ghost code 検出

- `git log -p` で削除されるべき AC の文字列を残コードから grep。
- 言語別ツール:
  - JS/TS: knip / ts-prune / depcheck
  - Python: vulture / unimport
  - Go: deadcode (`golang.org/x/tools/cmd/deadcode`)
  - Rust: cargo udeps
- 結果と spec の AC リストを突合し、AC を持たないモジュールを候補化。

---

## 6. 実行タイミング

| タイミング | 実施 |
|---|---|
| ローカル commit 前 | カバレッジ表再生成 (高速) |
| PR 提出時 | hash 比較 + semantic mismatch (CI) |
| 週次 | ghost code 検出 (重め) |
| デモ前 | 全件再走 ([03_demo-readiness.md](./03_demo-readiness.md)) |

---

## 7. 反パターン

| 反パターン | 害 |
|---|---|
| spec を後追いで書き換え | drift が累積し、spec が嘘になる |
| AC ID を再利用 | 履歴破壊、テスト誤参照 |
| hash 比較のみで semantic を見ない | 空白変更で false positive、深い drift で false negative |
| drift を warning に降格 | だんだん見なくなる |

---

## 8. 連携

- カバレッジ表は [01_traceability.md](./01_traceability.md) の規約に従う。
- semantic mismatch レビューは [60_quality-gates/06_red-team-loop.md](../60_quality-gates/06_red-team-loop.md) のレッドチーム枠で実行。
- drift 解消の優先順位上げは [50_permissions/05_escalation-policy.md](../50_permissions/05_escalation-policy.md) の L2 扱い。

---

## 出典

- BP-020 (spec_test_code_loop): Spec-First, https://github.com/github/spec-kit, retrieved_at: 2026-06-23
- BP-021 (spec_test_code_loop): Red-Green-Refactor, https://martinfowler.com/bliki/TestDrivenDevelopment.html, retrieved_at: 2026-06-23
- BP-024 (adversarial_verification): adversarial review in fresh subagent, https://code.claude.com/docs/en/best-practices, retrieved_at: 2026-06-23

## 不確実性

- semantic mismatch 判定は LLM ジャッジに依存し、判定ぶれがある。BP-026 に従い rubric + 人スポットチェックを併用する。
- ghost code 検出ツールは言語ごとの精度に差があり、誤検出があり得る。削除前に必ず人レビュー。
