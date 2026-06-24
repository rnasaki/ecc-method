#!/usr/bin/env node
// Phase 4: 全 md ファイルに `keywords:` / `related:` frontmatter を注入する。
// - 既存 frontmatter は壊さない (keywords / related が無ければ追加、有れば skip)
// - keywords: top-dir + ファイル名トークン (番号 prefix 除去)
// - related: 本文中の相対 md リンクから抽出 (最大 5 件、重複排除、自己参照除外)
//
// 使い方: node 80_commands/generate-keywords-frontmatter.mjs [--dry-run]

import { readFileSync, writeFileSync, statSync, readdirSync } from 'node:fs'
import { join, relative, dirname, resolve, posix } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(fileURLToPath(import.meta.url), '..', '..')
const DRY = process.argv.includes('--dry-run')

const EXCLUDE_DIRS = new Set(['.git', '.session-state', '.template-agents', 'node_modules', '_index'])

const STOPWORDS = new Set([
  'and', 'or', 'the', 'a', 'an', 'of', 'to', 'for', 'with', 'in', 'on', 'by',
  'how', 'what', 'why', 'when', 'where',
  'index', 'readme', 'changelog', 'license',
])

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

function stripNumberPrefix(s) {
  return s.replace(/^[0-9]+[_-]/, '')
}

function stripIdPrefix(s) {
  // RB-001-... / BP-007-... / ID-NNN- スタイルの先頭 ID を除去
  return s.replace(/^[A-Za-z]{2,4}-\d{2,}-/, '')
}

function deriveKeywords(absPath) {
  const rel = relative(ROOT, absPath).split(/[\\/]/)
  const fileBase = rel[rel.length - 1].replace(/\.md$/, '')
  const dirs = rel.slice(0, -1)
  const tokens = new Set()
  for (const d of dirs) {
    const cleaned = stripNumberPrefix(d).toLowerCase()
    if (cleaned && !STOPWORDS.has(cleaned)) tokens.add(cleaned)
  }
  const cleanedBase = stripIdPrefix(stripNumberPrefix(fileBase))
  for (const part of cleanedBase.toLowerCase().split(/[-_]/)) {
    if (part.length < 3) continue
    if (/^\d+$/.test(part)) continue
    if (STOPWORDS.has(part)) continue
    tokens.add(part)
  }
  // ルート直下 (METHOD.md / README.md など) で空にならないよう、ファイル名トークンが残らない場合は basename を採用
  if (tokens.size === 0) {
    tokens.add(fileBase.toLowerCase())
  }
  return [...tokens].slice(0, 8)
}

function extractRelated(body, absPath, allFilesSet) {
  // [text](path.md) または [text](path.md#anchor) を拾う
  const re = /\[[^\]]+\]\(([^)\s]+\.md)(?:#[^)]*)?\)/g
  const found = new Set()
  const baseDir = dirname(absPath)
  let m
  while ((m = re.exec(body)) !== null) {
    const link = m[1]
    if (link.startsWith('http')) continue
    const target = resolve(baseDir, link)
    if (target === absPath) continue
    if (!allFilesSet.has(target)) continue
    found.add(posix.normalize(relative(ROOT, target).replace(/\\/g, '/')))
    if (found.size >= 5) break
  }
  return [...found]
}

function parseFrontmatter(text) {
  if (!text.startsWith('---\n') && !text.startsWith('---\r\n')) {
    return { has: false, fmRaw: '', body: text }
  }
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!m) return { has: false, fmRaw: '', body: text }
  return { has: true, fmRaw: m[1], body: text.slice(m[0].length) }
}

function hasKey(fmRaw, key) {
  const re = new RegExp('^' + key + '\\s*:', 'm')
  return re.test(fmRaw)
}

function formatList(arr) {
  if (arr.length === 0) return '[]'
  return '[' + arr.map(s => /^[a-zA-Z0-9_./\-]+$/.test(s) ? s : JSON.stringify(s)).join(', ') + ']'
}

function injectIntoExisting(fmRaw, keywords, related) {
  const lines = fmRaw.split(/\r?\n/)
  const additions = []
  if (!hasKey(fmRaw, 'keywords')) additions.push(`keywords: ${formatList(keywords)}`)
  if (!hasKey(fmRaw, 'related')) additions.push(`related: ${formatList(related)}`)
  if (additions.length === 0) return null
  return [...lines, ...additions].join('\n')
}

function buildNewFrontmatter(keywords, related) {
  return [
    '---',
    `keywords: ${formatList(keywords)}`,
    `related: ${formatList(related)}`,
    '---',
    '',
  ].join('\n')
}

function main() {
  const files = walk(ROOT)
  const allFilesSet = new Set(files)
  let modified = 0
  let skipped = 0
  let added = 0

  for (const f of files) {
    const orig = readFileSync(f, 'utf8')
    const { has, fmRaw, body } = parseFrontmatter(orig)
    const keywords = deriveKeywords(f)
    const related = extractRelated(has ? body : orig, f, allFilesSet)

    let next
    if (has) {
      const updatedFm = injectIntoExisting(fmRaw, keywords, related)
      if (!updatedFm) { skipped++; continue }
      next = `---\n${updatedFm}\n---\n${body.startsWith('\n') ? body.slice(1) : body}`
      modified++
    } else {
      next = buildNewFrontmatter(keywords, related) + orig
      added++
    }

    if (!DRY) writeFileSync(f, next)
  }

  console.log(JSON.stringify({
    total: files.length,
    added_new_frontmatter: added,
    modified_existing_frontmatter: modified,
    skipped_already_complete: skipped,
    dry_run: DRY,
  }, null, 2))
}

main()
