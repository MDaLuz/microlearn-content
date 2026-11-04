#!/usr/bin/env node
// Validates glossary.json against catalog.json, then reports how many of the
// modules' bold terms the glossary covers.
//
//   node scripts/validate-glossary.mjs
//
// Hard checks (exit 1 on failure): schema, unique kebab-case ids, required
// fields, `short` of 25 words or fewer, `related` / `example.moduleId` /
// `modules` links, and no term or alias shared by two entries.
// The coverage report is informational: bold spans in the text blocks (Sources
// excluded) of the Molecules modules and of any module an entry is tagged with that match no term or alias, minus label-like spans and the
// entries in glossary-ignore.json.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkImage } from './image-check.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => JSON.parse(readFileSync(join(root, f), 'utf8'));
const errors = [];
const err = (where, msg) => errors.push(`${where}: ${msg}`);

// Lowercase, trim, strip trailing ':' and '.'.
export const normalise = (s) => s.toLowerCase().trim().replace(/[:.]+$/, '').trim();

const CATEGORIES = ['trials', 'regulatory', 'lipids', 'safety', 'pharmacology', 'diabetes', 'legal', 'launch'];
const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;

let glossary;
try {
  glossary = read('glossary.json');
} catch (e) {
  console.error(`glossary.json: invalid JSON (${e.message})`);
  process.exit(1);
}
const catalog = read('catalog.json');
const moduleIds = new Set(catalog.modules.map((m) => m.id));

if (!Number.isInteger(glossary.version)) err('glossary', '`version` must be an integer');
if (!Array.isArray(glossary.entries) || glossary.entries.length === 0) {
  err('glossary', '`entries` must be a non-empty array');
  glossary.entries = [];
}
const entries = glossary.entries;
const ids = new Set();

const filled = (v) => (typeof v === 'string' ? v.trim() !== '' : Array.isArray(v) ? v.length > 0 : v != null);

for (const [i, e] of entries.entries()) {
  const where = `entry ${e.id ?? `#${i}`}`;
  if (!KEBAB.test(e.id ?? '')) err(where, 'id must be kebab-case');
  if (ids.has(e.id)) err(where, 'duplicate id');
  ids.add(e.id);
  for (const f of ['id', 'term', 'category', 'short', 'simpler', 'notToConfuse', 'related', 'modules']) {
    if (!filled(e[f])) err(where, `missing or empty \`${f}\``);
  }
  if (!Array.isArray(e.aliases)) err(where, '`aliases` must be an array');
  if (!filled(e.example?.moduleId) || !filled(e.example?.text)) err(where, '`example` needs moduleId and text');
  if (e.category && !CATEGORIES.includes(e.category)) err(where, `unknown category "${e.category}"`);
  // Optional layers: a picture (same rules as lesson images) and translations.
  if (e.image !== undefined) for (const m of checkImage(e.image, root)) err(where, `image: ${m}`);
  if (e.translations !== undefined) {
    const t = e.translations;
    if (!t || typeof t !== 'object' || Array.isArray(t)) err(where, '`translations` must be an object');
    else for (const [lang, v] of Object.entries(t)) {
      if (!['fr', 'de'].includes(lang)) err(where, `translations: "${lang}" isn't a supported language (fr, de)`);
      if (typeof v !== 'string' || !v.trim()) err(where, `translations.${lang} must be a non-empty string`);
    }
  }
  const words = (e.short ?? '').trim().split(/\s+/).filter(Boolean).length;
  if (words > 25) err(where, `\`short\` has ${words} words (max 25)`);
}

for (const e of entries) {
  const where = `entry ${e.id}`;
  for (const r of e.related ?? []) if (!ids.has(r)) err(where, `related id "${r}" doesn't exist`);
  if (e.example?.moduleId && !moduleIds.has(e.example.moduleId)) {
    err(where, `example.moduleId "${e.example.moduleId}" isn't in catalog.json`);
  }
  for (const m of e.modules ?? []) {
    if (m !== '*' && !moduleIds.has(m)) err(where, `modules value "${m}" isn't "*" or a catalog module`);
  }
}

// Term and alias lookup; a name may repeat within one entry, not across two.
const owner = new Map();
for (const e of entries) {
  for (const name of new Set([e.term, ...(e.aliases ?? [])].filter(Boolean).map(normalise))) {
    if (owner.has(name) && owner.get(name) !== e.id) {
      err(`entry ${e.id}`, `"${name}" is also a term or alias of ${owner.get(name)}`);
    } else owner.set(name, e.id);
  }
}

if (errors.length) {
  for (const e of errors) console.log(`ERROR ${e}`);
  console.log(`\nglossary.json: ${errors.length} error(s)`);
  process.exit(1);
}
console.log(`glossary.json: ${entries.length} entries, all hard checks passed\n`);

// ---------------------------------------------------------------------------
// Coverage report
// ---------------------------------------------------------------------------

const ignore = new Set(read('glossary-ignore.json').map(normalise));
const labelLike = (raw) => /[:.]\s*$/.test(raw);
const allUnmatched = new Map();

console.log('Coverage (Molecules and glossary-tagged modules; bold spans in text blocks, Sources excluded)');
const tagged = new Set(entries.flatMap((e) => e.modules ?? []));
for (const m of catalog.modules.filter((x) => x.discipline === 'Molecules' || tagged.has(x.id))) {
  let mod;
  try {
    mod = read(m.file);
  } catch {
    continue;
  }
  let matched = 0;
  let total = 0;
  const unmatched = new Map();
  for (const lesson of mod.lessons ?? []) {
    for (const b of lesson.blocks ?? []) {
      if (b.type !== 'text' || /^\s*## Sources/.test(b.markdown)) continue;
      for (const [, raw] of b.markdown.matchAll(/\*\*([^*]+)\*\*/g)) {
        const span = normalise(raw);
        if (labelLike(raw) || ignore.has(span)) continue;
        total++;
        if (owner.has(span)) matched++;
        else {
          unmatched.set(span, (unmatched.get(span) ?? 0) + 1);
          allUnmatched.set(span, (allUnmatched.get(span) ?? 0) + 1);
        }
      }
    }
  }
  const rate = total ? Math.round((matched / total) * 100) : 0;
  console.log(`\n${m.id}: ${matched}/${total} matched (${rate}%)`);
  const sorted = [...unmatched].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  if (sorted.length) console.log('  unmatched: ' + sorted.map(([s, n]) => (n > 1 ? `${s} ×${n}` : s)).join(', '));
}

const top = [...allUnmatched].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 15);
console.log('\nTop 15 unmatched across all modules');
for (const [s, n] of top) console.log(`  ${n}  ${s}`);
