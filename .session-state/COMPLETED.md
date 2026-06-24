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

- id: HW-B
  title: RB-005 検証 + 配布 + RB-004 deprecated 化 + Orchestrator system prompt hook 統合
  category: tooling
  completed_at: 2026-06-24
  session_id: 7
  commit_hashes:
    - "(本セッション完了 commit) (develop: HW-B RB-005 active 化 + RB-004 deprecated + Orchestrator hook 統合 + 配布テンプレ CodeGraph 同期)"
  outcome_summary: |
    公式 docs (https://code.claude.com/docs/en/hooks, retrieved_at 2026-06-24) で
    H1 (subagent 内 hook 発火) / H2 (PostToolUse stdout は context 非流入) /
    H3 (日本語 narration 出力可) を確認し、RB-005 を draft → active 昇格。
    実装一式 (.template-claude/hooks/subagent-narrator.{sh,ps1} +
    .template-claude/settings.json hooks ブロック) を本パッケージに同梱。
    RB-004 を deprecated 化し、上部に RB-005 への移行注記を明示。
    Orchestrator system prompt (40_delegation/04_orchestrator-system-prompt.md)
    の即投入版に == subagent 観測性 (RB-005) == セクションを追加し、
    配布物パス・配置先・stdout 既定空・ECC_NARRATION_INLINE フラグの運用を規定。
    併せて配布テンプレ (.template-claude/CLAUDE.md / README.md / .template-agents/
    ecc-orchestrator.md) の検索プロトコル節を Method 本体 45_runbook/
    04_search-protocol.md と同期し、Step 0 に CodeGraph (_index/concept-graph.json)
    を主体化。前セッションでの CodeGraph 主体化 (commit 7d69a33) が配布テンプレに
    反映されていなかった整合漏れを解消。
  related_runbooks: [RB-004, RB-005]
  related_chapters: [40_delegation/04_orchestrator-system-prompt.md, 45_runbook/04_search-protocol.md]

- id: HW-J
  title: 配布テンプレに Knowledge Vault 駆動規律を実装
  category: distribution
  completed_at: 2026-06-24
  session_id: 8
  commit_hashes:
    - "(本セッション完了 commit) (develop: HW-J Knowledge Vault 駆動規律配布)"
  outcome_summary: |
    Method 本体に 12_knowledge-vault/ + 45_runbook/runbooks/RB-011-knowledge-promotion-flow.md
    が整備済だったが、配布テンプレ (.template-claude/ / .template-agents/) に「いつ案件
    Knowledge/notes/ を書き始めるか」のトリガが無く、案件 Knowledge/ も中央
    ~/Documents/Knowledge/ も 0 ファイルのまま機能していなかった (dead spec)。
    駆動点を 5 箇所挿入して解消:
    1. .template-claude/CLAUDE.md §2 SSOT 表に Knowledge Vault 行追加
    2. §3 検索プロトコル Step 6 Capture Trigger を Runbook / Knowledge note の 2 系統に分岐
    3. §5 作業中規律に Knowledge 即時記録 (notes / procedures / episodes 書込先)
    4. §7 クローズ規律に Step [0.5] KNOWLEDGE CAPTURE GATE 挿入
       (中央 Vault 4 条件で RB-011 起動、満たさないなら案件残置)
    5. §8 行動規律表に Knowledge Capture First (No Scope Dodging 連動)
    6. .template-agents/ecc-orchestrator.md の検索プロトコル Step 6 / 返却フォーマットに
       ## Knowledge 化候補 セクションを追加 (type 分類 + 中央 Vault 4 条件暫定判定)
    7. .template-claude/README.md §テンプレ構成 / §採用後 / 冒頭索引に言及反映
    本セッション自身が dogfood として:
    - Knowledge/episodes/2026-06-24-distribution-template-knowledge-vault-wiring.md を作成
    - 中央 ~/Documents/Knowledge/notes/dead-spec-without-trigger.md に汎用化して昇格
    する形で駆動を実証。汎用学習: 「SSOT に規律があっても、配布テンプレ /
    起動・作業中・クローズの 3 ループに駆動点が無いと永久に発火しない」。
  related_runbooks: [RB-006, RB-011]
  related_chapters: [12_knowledge-vault/, .template-claude/CLAUDE.md, .template-agents/ecc-orchestrator.md]

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
