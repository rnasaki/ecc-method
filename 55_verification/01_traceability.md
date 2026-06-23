# 01 — Traceability (AC ↔ design ↔ tasks ↔ test ↔ code)

SDD 成果物と TDD 成果物を **同じ ID** で串刺しに追跡する。これにより drift 検知 ([02_drift-detection.md](./02_drift-detection.md)) と受入確認 ([03_demo-readiness.md](./03_demo-readiness.md)) が機械化できる。

---

## 1. ID 体系

| 種別 | プレフィックス | 例 | 由来 |
|---|---|---|---|
| 機能 | F | F12 | PRD に登場した機能単位 |
| 受入基準 | AC | AC12-3 | F12 の 3 番目の受入基準 |
| 設計要素 | D | D12-A | F12 の design 内の構成要素 A |
| 実装タスク | T | T12-005 | F12 の 5 番目の実装タスク |
| テスト | TEST | TEST-AC12-3 | AC12-3 を検証するテスト |
| コード | CODE | (パス + 関数名) | テストから参照される実装位置 |

---

## 2. 串刺しのキー

ID をハイフンで連結することで、双方向に追える:

```
F12  ─┬─ AC12-1 ── TEST-AC12-1 ── CODE: src/foo.ts:bar()
      ├─ AC12-2 ── TEST-AC12-2 ── CODE: src/foo.ts:baz()
      └─ AC12-3 ── TEST-AC12-3 ── CODE: src/foo.ts:qux()
                          │
                          └─ T12-005 (実装タスク) ── D12-A (設計要素)
```

---

## 3. 各ファイル内の表記規約

### 3.1 PRD / requirements

```markdown
## AC12-1
- Given: <事前状態>
- When:  <操作>
- Then:  <期待結果>
- 関連: D12-A, T12-005
```

### 3.2 design

```markdown
### D12-A: <要素名>
- 担当: <該当 AC: AC12-1, AC12-2>
- 依存: <D11-X>
- 影響範囲: <ファイル / モジュール>
```

### 3.3 tasks

```markdown
- [ ] T12-005: <タスク内容> [AC12-1, AC12-2]
```

### 3.4 テスト

```typescript
// TEST-AC12-1: <タイトル>
test('AC12-1: returns empty array when no markets match query', () => { ... })
```

### 3.5 コード (任意・推奨)

```typescript
/** Implements AC12-1, AC12-2 */
export function bar() { ... }
```

---

## 4. カバレッジ表 (matrix)

各機能 F<NN> ごとに以下のテーブルを生成し、`docs/<feature>/coverage.md` に置く:

| AC | design | task | test | code | status |
|---|---|---|---|---|---|
| AC12-1 | D12-A | T12-005 | TEST-AC12-1 | src/foo.ts:bar | Green |
| AC12-2 | D12-A | T12-005 | TEST-AC12-2 | src/foo.ts:baz | Green |
| AC12-3 | D12-B | T12-007 | (未実装) | (未実装) | Red |

`status`:

- Red: テスト未存在 or 失敗
- Green: テスト pass
- Refactor: pass しているが品質改善余地あり
- Drift: spec と code に乖離 → [02_drift-detection.md](./02_drift-detection.md)

---

## 5. 自動生成方針

- カバレッジ表はリポ内スクリプトで再生成可能にする (例: `scripts/coverage-matrix.sh`)。
- AC ID とテスト名 / コードコメントの対応を grep で取り出す。
- 抜け検出: PRD 内の AC 全件 ⊆ test 内の AC 言及。差分があればレッド。

---

## 6. 命名規則

- ID は **大文字英数 + ハイフン**。
- 一度割り当てた ID は **再利用しない**。削除された AC は履歴で `(deprecated)` 表記。
- 機能 F<NN> 内での連番は 1 始まり、ゼロ埋めなし (AC12-1, AC12-2, ...)。
- タスクのみゼロ埋め 3 桁 (T12-001) で順序を視覚化。

---

## 7. 反パターン

| 反パターン | 害 |
|---|---|
| ID なしで「これと、あれの」表現 | 何が網羅されたか追えない |
| AC を後付けで番号変更 | テスト名・コードコメントが古いままになり drift |
| design の D-id を割り振らない | 影響範囲の追跡不能 |
| 1 テストが複数 AC を曖昧に検証 | カバレッジ表が嘘になる |

---

## 8. 連携

- ハンドオフ契約 ([40_delegation/03_delegation-contract.md](../40_delegation/03_delegation-contract.md)) の検収基準に AC ID を必ず引く。
- テスト命名は [35_tdd-phase/](../35_tdd-phase/) のテスト規約に従う。
- カバレッジ表を [60_quality-gates/07_gate-checklist.md](../60_quality-gates/07_gate-checklist.md) のゲート項目とする。

---

## 出典

- BP-020 (spec_test_code_loop): Spec-First, https://github.com/github/spec-kit, retrieved_at: 2026-06-23
- BP-021 (spec_test_code_loop): Red-Green-Refactor, https://martinfowler.com/bliki/TestDrivenDevelopment.html, retrieved_at: 2026-06-23
- BP-022 (spec_test_code_loop): Explore → Plan → Implement → Commit, https://code.claude.com/docs/en/best-practices, retrieved_at: 2026-06-23

## 不確実性

- ID の連番採番は手動運用を前提としている。スクリプトでの自動採番は導入時に検討。
- カバレッジ表の自動生成スクリプトはリポごとに言語固有 (Python / Node / Go) に書く必要がある。本章は規約のみ提示。
