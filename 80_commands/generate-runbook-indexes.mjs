#!/usr/bin/env node
// Phase 6: 45_runbook/INDEX.md の YAML 索引から by-category / by-tag / by-trigger を生成する。
// 入力: 45_runbook/INDEX.md の ```yaml ... ``` ブロック (runbooks: 配列)
// 出力: 45_runbook/_index/{by-category,by-tag,by-trigger}.md (上書き)
//
// 使い方: node 80_commands/generate-runbook-indexes.mjs

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(fileURLToPath(import.meta.url), '..', '..')
const INDEX_MD = join(ROOT, '45_runbook', 'INDEX.md')
const OUT_DIR = join(ROOT, '45_runbook', '_index')
const RUNBOOKS_DIR = join(ROOT, '45_runbook', 'runbooks')

function parseRunbooksYaml(text) {
  // ```yaml ... ``` ブロックを全て取り、`- id: RB-NNN-` パターンが含まれる実索引のみ採用
  const blocks = [...text.matchAll(/```yaml\s*\n([\s\S]*?)```/g)].map(m => m[1])
  const yamlText = blocks.find(b => /-\s+id:\s+RB-\d{2,}/.test(b))
  if (!yamlText) throw new Error('YAML runbooks block (with RB-NNN ids) not found in INDEX.md')

  // 簡易 YAML パーサ: 入れ子レベル 2 (entry の field) と list (tags) のみ対応
  const entries = []
  let cur = null
  for (const rawLine of yamlText.split(/\r?\n/)) {
    const line = rawLine.replace(/\s+#.*$/, '')
    if (!line.trim()) continue
    if (line.startsWith('runbooks:')) continue
    if (/^\s*-\s+id:/.test(line)) {
      if (cur) entries.push(cur)
      cur = {}
      const v = line.match(/-\s+id:\s*(.+?)\s*$/)
      if (v) cur.id = v[1]
      continue
    }
    if (!cur) continue
    const kv = line.match(/^\s+([a-z_]+):\s*(.*)$/)
    if (!kv) continue
    const key = kv[1]
    let val = kv[2]
    if (val.startsWith('[') && val.endsWith(']')) {
      val = val.slice(1, -1).split(',').map(s => s.trim()).filter(Boolean)
    }
    cur[key] = val
  }
  if (cur) entries.push(cur)
  return entries
}

function findOrphanRunbooks(entries) {
  // INDEX に載っていない runbooks/ 配下のファイルを警告
  if (!existsSync(RUNBOOKS_DIR)) return []
  const indexed = new Set(entries.map(e => e.path && e.path.split('/').pop()))
  const actual = readdirSync(RUNBOOKS_DIR).filter(n => n.endsWith('.md'))
  return actual.filter(n => !indexed.has(n))
}

function header(title) {
  return [
    '---',
    `keywords: [runbook, _index, ${title.toLowerCase().replace(/\s+/g, '-')}]`,
    'related: [../INDEX.md, ../04_search-protocol.md, ../../_index/concept-graph.json]',
    '---',
    '',
    `# Runbook ${title} ビュー (自動生成)`,
    '',
    '> このファイルは `80_commands/generate-runbook-indexes.mjs` が `INDEX.md` から自動生成する。手で編集しない。',
    '',
  ].join('\n')
}

function byCategory(entries) {
  const buckets = new Map()
  for (const e of entries) {
    const cat = e.category || 'uncategorized'
    if (!buckets.has(cat)) buckets.set(cat, [])
    buckets.get(cat).push(e)
  }
  const out = [header('By Category')]
  for (const cat of [...buckets.keys()].sort()) {
    out.push(`## ${cat} (${buckets.get(cat).length})`, '')
    for (const e of buckets.get(cat)) {
      out.push(`- [\`${e.id}\`](../runbooks/${e.path?.split('/').pop() || e.id + '.md'}) — ${e.title || ''}`)
    }
    out.push('')
  }
  return out.join('\n')
}

function byTag(entries) {
  const buckets = new Map()
  for (const e of entries) {
    const tags = Array.isArray(e.tags) ? e.tags : []
    for (const t of tags) {
      if (!buckets.has(t)) buckets.set(t, [])
      buckets.get(t).push(e)
    }
  }
  const out = [header('By Tag')]
  for (const tag of [...buckets.keys()].sort()) {
    out.push(`## ${tag} (${buckets.get(tag).length})`, '')
    for (const e of buckets.get(tag)) {
      out.push(`- [\`${e.id}\`](../runbooks/${e.path?.split('/').pop() || e.id + '.md'}) — ${e.title || ''}`)
    }
    out.push('')
  }
  return out.join('\n')
}

function byTrigger(entries) {
  const out = [header('By Trigger')]
  out.push('| ID | Trigger | Status |', '|---|---|---|')
  for (const e of [...entries].sort((a, b) => a.id.localeCompare(b.id))) {
    const trig = (e.trigger || '').replace(/\|/g, '\\|')
    out.push(`| [\`${e.id}\`](../runbooks/${e.path?.split('/').pop() || e.id + '.md'}) | ${trig} | ${e.status || ''} |`)
  }
  out.push('')
  return out.join('\n')
}

function main() {
  const text = readFileSync(INDEX_MD, 'utf8')
  const entries = parseRunbooksYaml(text)
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true })
  writeFileSync(join(OUT_DIR, 'by-category.md'), byCategory(entries))
  writeFileSync(join(OUT_DIR, 'by-tag.md'), byTag(entries))
  writeFileSync(join(OUT_DIR, 'by-trigger.md'), byTrigger(entries))
  const orphans = findOrphanRunbooks(entries)
  console.log(JSON.stringify({
    parsed_runbooks: entries.length,
    orphans_in_runbooks_dir: orphans,
    written: ['45_runbook/_index/by-category.md', '45_runbook/_index/by-tag.md', '45_runbook/_index/by-trigger.md'],
  }, null, 2))
}

main()
