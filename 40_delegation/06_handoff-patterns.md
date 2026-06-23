# 06 — Handoff Patterns

専門家への委任の仕方を 6 パターンに整理する。Pattern P-001〜P-006 (Registry 側) はタスク種別単位の編成、本ファイルの Handoff Pattern は構造単位の編成。Routing 結果に合わせて選択する。

## パターン一覧

| ID | 名称 | 適用契機 | 並列性 | 検証方式 |
|---|---|---|---|---|
| H-1 | 単発 (Single) | 範囲が明確で 1 専門家で閉じる | 1 | 任意 |
| H-2 | 連鎖 (Chain) | 出力が次の入力になる順次依存 | 1 | 各段で AC |
| H-3 | 並列 (Fan-out / Fan-in) | 独立したサブタスク群 | N | synthesis 時 |
| H-4 | コンセンサス (Vote) | 同一問いに複数回答を集約 | N | 多数決 + rationale |
| H-5 | トーナメント (Tournament) | 候補を勝ち抜きで絞る | N → 1 | 別 expert が judge |
| H-6 | ループ-until-dry | 出力が枯れるまで反復 | 1〜N | 終了条件で停止 |

## H-1: 単発 (Single)

```
[Orchestrator] --(Delegation Contract)--> [Expert A] --(成果物)--> [Orchestrator]
```

### 使う場面
- 範囲が明確
- 出力スキーマが固定
- AC が閉じている

### 注意
- Delegation Contract の AC を必ず付ける (BP-004)
- 重要度 ≥ 中 では `verifier` を別 expert に指名

### 例
- 「このファイルの型エラーを直して」 → `<lang>-build-resolver`
- 「この文書の typo を直して」 → `code-reviewer` (or 該当 reviewer)

## H-2: 連鎖 (Chain)

```
[Orchestrator]
  -> [Expert A] (出力 a)
  -> [Expert B] (a を入力に出力 b)
  -> [Expert C] (b を入力に出力 c)
```

### 使う場面
- SDD: planner → architect → tdd-guide
- 設計 → 実装 → レビューの直列依存
- 各段の出力が次の前提条件

### 注意
- 各段の Delegation Contract に「前段 contract への参照」を入れる (`03_delegation-contract.md` § 2)
- 段の出力フォーマットが次段の入力フォーマットと一致するように設計する
- 段の途中で AC 不通過 → ループバックを定義する (前段に戻すか、別 expert に振るか)

### 例
- `planner → architect → <lang>-reviewer`
- `Explore → codebase-onboarding → planner`

## H-3: 並列 (Fan-out / Fan-in)

```
[Orchestrator]
  ├─> [Expert A]
  ├─> [Expert B]
  └─> [Expert C]
       └─> 全戻り後 [Synthesis]
```

### 使う場面
- 独立した複数の調査・レビュー
- セキュリティ / 性能 / 可読性のような直交軸
- 言語別 reviewer の並列適用

### 注意
- 同一メッセージ内で複数 Agent 呼び出し (BP-003)
- 各 worker は他 worker の存在を知らないようにする (input を自己完結)
- 戻り値を統合する synthesis 段が必須 (`08_synthesis-protocol.md`)

### 例
- セキュリティ + 性能 + 可読性の三面レビュー
- Discovery 時の Explore × 3
- Pattern P-001: planner + architect 並列

## H-4: コンセンサス (Vote)

```
[Orchestrator]
  ├─> [Expert A] (回答 a)
  ├─> [Expert B] (回答 b)
  ├─> [Expert C] (回答 c)
  └─> 多数決 / 一致点抽出 → 結論
```

### 使う場面
- ハルシネーション低減が必要な事実確認
- 命名 / UI 候補の比較
- 「3 人寄れば」の効果が期待できる判断

### 注意
- N は奇数 (タイブレーク回避)
- 視点を分散させる (perspective-diverse): 同じ system prompt で N 回ではなく、役割を変える
- 全回答が一致した場合の信頼度は低い (perspective-bias の可能性)
- 詳細は `07_cross-verification.md`

### 例
- ライブラリ選定: agent-evaluator × 3 (security 視点 / DX 視点 / 保守性視点)
- API 命名候補の選定: taste × 3 (UX 視点 / 既存規約視点 / 業界慣習視点)

## H-5: トーナメント (Tournament)

```
候補 [C1, C2, C3, C4]
  → ペア対戦 (judge: 別 expert)
     [C1 vs C2] → 勝者 W1
     [C3 vs C4] → 勝者 W2
  → 決勝
     [W1 vs W2] → 最終勝者
```

### 使う場面
- 候補が多く全比較がコスト過剰
- 候補に明確な優劣関係が定義できる

### 注意
- judge は候補生成者と別 expert (BP-024)
- 同一ラウンドの judge は同一 expert (公平性)
- 評価軸を事前固定 (途中で変えない)

### 例
- 設計案 4 つから 1 つ選定 → architect が candidate, agent-evaluator が judge
- コピー候補 8 つ → brand-voice generates, taste judges

## H-6: ループ-until-dry

```
loop:
  [Expert] が新規 finding を出す
  if 新規 finding == 0 or 反復回数 ≥ N_max:
     break
```

### 使う場面
- 脆弱性スキャン (見つからなくなるまで)
- リファクタ候補抽出
- 文献調査 / 反証探索

### 注意
- 終了条件を必ず定義 (新規ヒット 0 / 反復上限)
- 反復ごとに「既に挙がった finding」を input に含める (重複抑止)
- 反復上限はコスト保護 (BP-006: agent count をスケール)

### 例
- security-reviewer × N round (新規 CRITICAL/HIGH が出なくなるまで)
- refactor 候補抽出 (前回挙げた候補を除いて再走)
- 出典探索 (新出典が出なくなるまで)

## 選択ガイド

```
タスクは独立か?
├─ Yes → 並列性が成立
│         複数視点が必要? → H-4 / H-5
│         単純な fan-out? → H-3
└─ No  → 直列依存
          1 段で閉じる? → H-1
          多段? → H-2
          反復? → H-6
```

## アンチパターン

| アンチパターン | 症状 | 対処 |
|---|---|---|
| 並列にすべきを直列で実行 | wall-clock が長い | H-3 に切替 |
| 直列にすべきを並列で実行 | 入力依存が解決されず失敗 | H-2 に切替 |
| Vote の N が偶数 | タイで決められない | N を奇数 (3 / 5) に |
| トーナメントの judge が candidate と同一 | 自己評価バイアス | 別 expert に分離 (BP-024) |
| ループの終了条件なし | コスト爆発 | 反復上限 + 新規ヒット 0 を AND |

## 出典

- BP-003: Anthropic Engineering (https://www.anthropic.com/engineering/built-multi-agent-research-system, retrieved 2026-06-23)
- BP-004: 同上
- BP-006: 同上
- BP-024: Claude Code best practices (https://code.claude.com/docs/en/best-practices, retrieved 2026-06-23)
- BP-026: 同上 (Anthropic Engineering)

## 不確実性

- H-4 のコンセンサス効果は問題ドメイン依存。事実確認では強いが、創造系では多数決が平均化を招く危険がある。
- H-5 のトーナメントは候補数が ≤ 8 程度で実用的。それ以上は予選を切る。
- H-6 の反復上限は経験則。脆弱性スキャンは 3 round、文献調査は 5 round 程度を目安にする。
