#!/usr/bin/env node
// Phase 5: 全 md ファイルの frontmatter から `_index/concept-graph.json` を生成する。
// nodes: keyword → { files: [...] }
// edges: 同じファイル内に共起する keyword pair (重み = 共起ファイル数, ≥2 のみ)
//
// 使い方: node 80_commands/generate-concept-graph.mjs

import { readFileSync, writeFileSync, statSync, readdirSync, mkdirSync, existsSync } from 'node:fs'
import { join, relative, resolve, posix } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(fileURLToPath(import.meta.url), '..', '..')
const OUT_DIR = join(ROOT, '_index')
const OUT = join(OUT_DIR, 'concept-graph.json')
const EXCLUDE_DIRS = new Set(['.git', '.session-state', '.template-agents', 'node_modules', '_index'])
const EDGE_MIN_WEIGHT = 2

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (EXCLUDE_DIRS.has(name)) continue
    const full = join(dir, name)
    const st = statSync(full)
    if (st.isDirectory()) walk(full, out)
    else if (name.endsWith('.md')) out.push(full)
  }
  return out
}

function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!m) return null
  return m[1]
}

function readListField(fmRaw, key) {
  // 例: keywords: [a, b, c]  または  keywords:\n  - a\n  - b
  const reInline = new RegExp('^' + key + '\\s*:\\s*\\[([^\\]]*)\\]\\s*$', 'm')
  const inline = fmRaw.match(reInline)
  if (inline) {
    return inline[1].split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean)
  }
  const reBlock = new RegExp('^' + key + '\\s*:\\s*\\n((?:\\s+-\\s+.*\\n?)+)', 'm')
  const block = fmRaw.match(reBlock)
  if (block) {
    return block[1].split(/\n/).map(l => l.replace(/^\s+-\s+/, '').trim().replace(/^["']|["']$/g, '')).filter(Boolean)
  }
  return []
}

function relPath(absPath) {
  return posix.normalize(relative(ROOT, absPath).replace(/\\/g, '/'))
}

function main() {
  const files = walk(ROOT)
  const nodes = new Map()              // keyword -> Set(files)
  const cooccur = new Map()            // "a||b" -> Set(files)
  const fileIndex = []                 // {path, keywords, related}
  let filesWithFm = 0
  let filesWithKeywords = 0

  for (const f of files) {
    const text = readFileSync(f, 'utf8')
    const fm = parseFrontmatter(text)
    const rp = relPath(f)
    if (!fm) {
      fileIndex.push({ path: rp, keywords: [], related: [] })
      continue
    }
    filesWithFm++
    const keywords = [...new Set(readListField(fm, 'keywords').map(s => s.toLowerCase()))]
    const related = readListField(fm, 'related')
    fileIndex.push({ path: rp, keywords, related })
    if (keywords.length === 0) continue
    filesWithKeywords++

    for (const k of keywords) {
      if (!nodes.has(k)) nodes.set(k, new Set())
      nodes.get(k).add(rp)
    }
    const sorted = [...keywords].sort()
    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        const key = `${sorted[i]}||${sorted[j]}`
        if (!cooccur.has(key)) cooccur.set(key, new Set())
        cooccur.get(key).add(rp)
      }
    }
  }

  const nodeList = [...nodes.entries()]
    .map(([id, fs]) => ({ id, type: 'concept', file_count: fs.size, files: [...fs].sort() }))
    .sort((a, b) => b.file_count - a.file_count || a.id.localeCompare(b.id))

  const edgeList = [...cooccur.entries()]
    .filter(([, fs]) => fs.size >= EDGE_MIN_WEIGHT)
    .map(([k, fs]) => {
      const [from, to] = k.split('||')
      return { from, to, rel: 'cooccurs', weight: fs.size }
    })
    .sort((a, b) => b.weight - a.weight || a.from.localeCompare(b.from) || a.to.localeCompare(b.to))

  const out = {
    schema_version: '1.0',
    generated_at: new Date().toISOString().slice(0, 10),
    generator: '80_commands/generate-concept-graph.mjs',
    stats: {
      total_files: files.length,
      files_with_frontmatter: filesWithFm,
      files_with_keywords: filesWithKeywords,
      node_count: nodeList.length,
      edge_count: edgeList.length,
      edge_min_weight: EDGE_MIN_WEIGHT,
    },
    nodes: nodeList,
    edges: edgeList,
    file_index: fileIndex.sort((a, b) => a.path.localeCompare(b.path)),
  }

  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true })
  writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n')
  console.log(JSON.stringify(out.stats, null, 2))
  console.log('written:', relPath(OUT))
}

main()
