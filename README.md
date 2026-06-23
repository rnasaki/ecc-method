# ecc-method

Claude Code (ECC) を使った AI 駆動開発の運用 Method。案件リポに `.handover/` を 1 つ置き、`ecc-orchestrator` agent を起動すれば、セッション間引き継ぎ・ゴール逸脱検知・サイコファンシー抑止が自動で効くようになる規律集。

## 何を解決するか

- セッションをまたぐと前回の続きを忘れる → `.handover/` が状態を永続化
- タスク詰め込みすぎ・ゴール逸脱 → 1 セッション 1 タスク + 北極星照合
- サイコファンシー (媚び) で正しい指摘が消える → 概念ベースの文体規律
- subagent が何をやってるか見えない → final report で完了時に思考軌跡が読める
- 複数案件で同じ初期化作業を繰り返す → bootstrap で完結

## 何をしないか

- 案件のドメイン判断 (要件定義・技術選定はユーザーまたは専門家 agent が行う)
- 物理身体を伴う操作 (認証・GUI・不可逆操作の最終承認はユーザー)
- リアルタイム subagent 観測 (RB-005 で別途検証中)

## 導入手順 (3 ステップ)

### Step 1. clone

```bash
git clone https://github.com/rnasaki/ecc-method.git ~/.claude/methods/ecc-method
```

### Step 2. agent 登録

```bash
mkdir -p ~/.claude/agents
cp ~/.claude/methods/ecc-method/.template-agents/ecc-orchestrator.md ~/.claude/agents/
```

Claude Code を **再起動** ([RB-001 ホットリロード制約](./45_runbook/runbooks/RB-001-agent-registry-hot-reload.md))。

### Step 3. 案件リポで `.handover/` 初期化

```bash
cd <案件リポ>
mkdir -p .handover
cp ~/.claude/methods/ecc-method/45_runbook/_handover_template/*.md .handover/
# .handover/GOAL.md と PENDING.md を案件内容で書き換える
git add .handover/ && git commit -m "feat(.handover): ecc-method 導入"
```

### 起動

```
Agent(subagent_type="ecc-orchestrator", prompt="再開")
```

agent が `.handover/` を Read して自動着手。

## 詳細を知りたい人へ

導入後 → 運用 → 配布の流れで読む:

- **全体像**: [Method 本体](./METHOD.md)
- **何のために・誰が読む・用語**: [概要](./01_overview/)
- **判断軸となる 8 つの原則**: [原則](./05_principles/)
- **専門家への委任設計**: [委任](./40_delegation/)
- **運用中にハマったら引く**: [Runbook 索引](./45_runbook/INDEX.md)
- **チームに配布したい**: [配布手順](./99_distribution/)

## メンバーへの配布 (リーダー向け)

案件チャットに以下を貼る:

> このプロジェクトでは ecc-method を使います。
> README を読んで導入してください: https://github.com/rnasaki/ecc-method

メンバーは README の「導入手順 (3 ステップ)」を実行するだけで使える状態になる。

## ライセンス

MIT License。詳細は [LICENSE](./LICENSE) を参照。
