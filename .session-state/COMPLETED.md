---
last_updated: 2026-06-24
schema: RB-006
branch: develop
---

# COMPLETED - 完了済宿題アーカイブ (ecc-method 開発)

このファイルは **ecc-method パッケージ自身の開発・整備用**。`develop` branch でのみ追跡される。

完了した宿題の永続記録。検索性のため category / completed_at / commit_hash で索引化。

---

## 完了宿題

```yaml
- id: HW-E
  title: Branch / semver / 配布規律 (RB-008) を永続化
  category: bootstrap
  completed_at: 2026-06-24
  session_id: 1
  commit_hashes:
    - "31f42e0 (main: .gitignore)"
    - "a9fae53 (main: README version note)"
    - "v0.1.0 (main: tag)"
    - "96229db (develop: .session-state 追加)"
    - "4cd970e (develop: RB-008 永続化)"
  outcome_summary: |
    main = 配布版 / develop = 開発版 (.session-state/ 等を含む) の役割分離を確立。
    semver v0.1.0 を main に付与。RB-008 で配布規律を永続化。
  related_runbooks: [RB-008]

- id: HW-G
  title: 全体プロセス再設計 (.session-state/ の役割と初回フロー)
  category: bootstrap
  completed_at: 2026-06-24
  session_id: 2
  commit_hashes:
    - "5e08921 (Session 1: 主要実装 + RB-009 + .session-state リネーム + HW-H 追加)"
    - "f53d340 (Session 1: HW-G を P0 で追加)"
    - "fbcd4152 (Session 2: RB-006 改訂・README・.template-agents・整合)"
  outcome_summary: |
    .handover/ → .session-state/ へリネーム + 概念再定義。
    .session-state/ は引き継ぎ資料ではなく SDD/TDD プロセスの中間成果物として位置付け。
    初回 = 生成 (RB-009 SDD ヒアリング 5 質問)、継続 = Read/Write (RB-006) の二モード化。
    RB-006 を「セッション状態プロトコル」へ全面書き直し。GOAL/current_session 主管を RB-007 に分離。
    README Step 3 を再設計し利用者の手動 cp を廃止。.template-agents/ ecc-orchestrator.md の起動時必須も RB-009 委譲形に書き直し。
  related_runbooks: [RB-006, RB-007, RB-009]

- id: HW-I
  title: Method 開発者の self-dogfooding 設定 (junction 統合 + 99_distribution/04 章)
  category: bootstrap
  completed_at: 2026-06-24
  session_id: 6
  commit_hashes:
    - "(本セッション完了 commit) (develop: HW-I self-dogfooding junction + 99_distribution/04)"
  outcome_summary: |
    開発リポ (Documents/GitHub/ecc-method, develop) と利用ディレクトリ
    (~/.claude/methods/ecc-method, main) の分離が原因で、develop の改修
    (4 要素クローズ規律 / RB-006 改訂 / RB-009/010) が agent 自身に効いて
    いなかった問題を解消。Windows junction で利用ディレクトリを開発リポへ
    シンボリックリンクし、`git commit` した瞬間に agent 起動時の Read 対象
    に反映されるよう構造化。利用ディレクトリは ecc-method.bak-2026-06-24 へ
    退避。運用手順は RB-NNN 名前空間を消費せず 99_distribution/04_
    developer-self-dogfooding.md として配布側ノウハウ章に配置。配布利用者は
    引き続き main を git clone するため影響なし。
  related_chapters: [99_distribution/04_developer-self-dogfooding.md]
  related_runbooks: [RB-006, RB-008]

- id: HW-D
  title: Method v1.0 リリース整理 (採番再定義 + CHANGELOG + v1.0.0 tag 切り条件)
  category: release
  completed_at: 2026-06-24
  session_id: 3
  parallel_session: 4 (HW-F、別チャットで並列進行)
  commit_hashes:
    - "(本セッション完了 commit) (develop: HW-D Method v1.0 リリース整理 + 27_user-care 統合)"
  outcome_summary: |
    採番ポリシーを「5 刻み単一規律」で確定。トップレベル唯一の 5 刻み破り 27_user-care/ を
    25_writing-style/06_user-care/ にサブディレクトリ化し、関連 18 箇所のリンクを張替え。
    CHANGELOG.md を Keep a Changelog 1.1.0 形式で雛形作成 (v0.1.0 既往分 + Unreleased)。
    99_distribution/03_v1.0.0-release-checklist.md を新設し、RB-008 §リリース判定基準を
    進捗追跡可能な独立 checklist として抽出。LICENSE / README / 99_distribution/01-02 は v0.1.0 状態を維持。
    主要学習: RB-003 L0/L1 で導出可能な判断は agent 主導が原則。委譲しすぎは
    ユーザー疲れを発生させる。「45/85 散在」の問題提起は 27 のみが実態だった (誇張に注意)。
  related_runbooks: [RB-008, RB-003]
```

---

## 索引フォーマット (新規追加時)

```yaml
- id: HW-<X>
  title: <タイトル>
  category: <カテゴリ>
  completed_at: YYYY-MM-DD HH:MM
  session_id: <セッション識別子 or 累計番号>
  commit_hashes: [<関連 commit hash>]
  outcome_summary: <1-3 行で結果>
  related_runbooks: [<RB-NNN>]
```
