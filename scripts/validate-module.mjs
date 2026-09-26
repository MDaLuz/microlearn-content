#!/usr/bin/env node
// Validates a module file against SCHEMA.md and its catalog entry.
//
//   node scripts/validate-module.mjs modules/<id>.json [--molecule]
//
// --molecule adds the MOLECULE-TEMPLATE.md checks: disclaimer, 15 lessons,
// a Sources block closing every lesson, known combination tags, and no
// promotional wording. Exits 1 on any error; warnings don't fail the run.

import { readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const molecule = args.includes('--molecule');
const file = args.find((a) => !a.startsWith('--'));
if (!file) {
  console.error('Usage: node scripts/validate-module.mjs modules/<id>.json [--molecule]');
  process.exit(2);
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const warnings = [];
const err = (where, msg) => errors.push(`${where}: ${msg}`);
const warn = (where, msg) => warnings.push(`${where}: ${msg}`);

const mod = JSON.parse(readFileSync(file, 'utf8'));
const catalog = JSON.parse(readFileSync(join(root, 'catalog.json'), 'utf8'));

// ---- Module and catalog ----

for (const f of ['id', 'title', 'discipline', 'version', 'lessons']) {
  if (mod[f] === undefined) err('module', `missing "${f}"`);
}

const entry = catalog.modules.find((m) => m.id === mod.id);
if (!entry) {
  warn('catalog', `no entry for "${mod.id}" yet`);
} else {
  const relFile = relative(root, file).replace(/\\/g, '/');
  if (entry.file !== relFile) err('catalog', `file "${entry.file}" ≠ "${relFile}"`);
  if (entry.version !== mod.version) err('catalog', `version ${entry.version} ≠ module ${mod.version}`);
  if (entry.discipline !== mod.discipline) err('catalog', `discipline "${entry.discipline}" ≠ module "${mod.discipline}"`);
  if (entry.lessonCount !== mod.lessons.length) err('catalog', `lessonCount ${entry.lessonCount} ≠ ${mod.lessons.length} lessons`);
}

// ---- Blocks ----

// Lesson, card and question ids must be unique across the whole module.
const globalIds = new Map();
const claimId = (id, where) => {
  if (!id) return err(where, 'missing id');
  if (globalIds.has(id)) err(where, `duplicate id "${id}" (first used in ${globalIds.get(id)})`);
  else globalIds.set(id, where);
};

const MIN_SCHEMA = { compare: 2, timeline: 2, reveal: 3, image: 3, scenario: 3, audio: 5 };
let neededSchema = 1;

const checkQuestions = (qs, where) => {
  if (!Array.isArray(qs) || qs.length < 1 || qs.length > 4) err(where, `needs 1–4 questions, has ${qs?.length ?? 0}`);
  for (const [i, q] of (qs ?? []).entries()) {
    const w = `${where} q${i + 1}`;
    claimId(q.id, w);
    if (!q.stem) err(w, 'missing stem');
    if (!Array.isArray(q.options) || q.options.length < 3 || q.options.length > 4) err(w, 'needs 3–4 options');
    if (!Number.isInteger(q.correctIndex) || q.correctIndex < 0 || q.correctIndex >= (q.options?.length ?? 0)) {
      err(w, `correctIndex ${q.correctIndex} out of range`);
    }
    if (!q.explanation) err(w, 'missing explanation');
  }
};

const uniqueWithinBlock = (items, where, label) => {
  const seen = new Set();
  for (const it of items ?? []) {
    if (!it.id) err(where, `${label} missing id`);
    else if (seen.has(it.id)) err(where, `duplicate ${label} id "${it.id}"`);
    seen.add(it.id);
  }
};

for (const lesson of mod.lessons ?? []) {
  const lw = `lesson ${lesson.id}`;
  claimId(lesson.id, lw);
  if (!lesson.title) err(lw, 'missing title');
  if (!Number.isInteger(lesson.xpReward)) err(lw, 'missing integer xpReward');
  if (!Array.isArray(lesson.blocks) || lesson.blocks.length === 0) err(lw, 'no blocks');

  for (const [bi, b] of (lesson.blocks ?? []).entries()) {
    const w = `${lw} block ${bi + 1} (${b.type})`;
    neededSchema = Math.max(neededSchema, MIN_SCHEMA[b.type] ?? 1);
    switch (b.type) {
      case 'text':
        if (!b.markdown) err(w, 'empty markdown');
        if (/^# /m.test(b.markdown ?? '')) err(w, 'uses "#" heading (reserved for the lesson title)');
        break;
      case 'flashcard':
        if (!Array.isArray(b.cards) || b.cards.length < 2) err(w, 'needs at least 2 cards');
        for (const c of b.cards ?? []) {
          claimId(c.id, w);
          if (!c.front || !c.back) err(w, `card ${c.id} missing front/back`);
        }
        break;
      case 'quiz':
        checkQuestions(b.questions, w);
        break;
      case 'scenario':
        if (!b.context) err(w, 'missing context');
        checkQuestions(b.questions, w);
        break;
      case 'compare': {
        const n = b.items?.length ?? 0;
        if (n < 2 || n > 3) err(w, `needs 2–3 items, has ${n}`);
        uniqueWithinBlock(b.items, w, 'item');
        uniqueWithinBlock(b.attributes, w, 'attribute');
        const na = b.attributes?.length ?? 0;
        if (na < 2 || na > 8) err(w, `needs 2–8 attributes, has ${na}`);
        for (const a of b.attributes ?? []) {
          if (a.values?.length !== n) err(w, `attribute "${a.id}" has ${a.values?.length} values for ${n} items`);
        }
        break;
      }
      case 'timeline': {
        const n = b.events?.length ?? 0;
        if (n < 2 || n > 8) err(w, `needs 2–8 events, has ${n}`);
        uniqueWithinBlock(b.events, w, 'event');
        for (const e of b.events ?? []) if (!e.marker || !e.title) err(w, `event ${e.id} missing marker/title`);
        break;
      }
      case 'reveal': {
        const steps = new Set([...(b.svg ?? '').matchAll(/data-step="(\d+)"/g)].map((m) => m[1]));
        if ((b.steps?.length ?? 0) < 2) err(w, 'needs at least 2 steps');
        if (steps.size !== (b.steps?.length ?? 0)) err(w, `${b.steps?.length} steps but ${steps.size} distinct data-step groups`);
        uniqueWithinBlock(b.steps, w, 'step');
        break;
      }
      case 'image':
        if (!b.src?.startsWith('assets/') || b.src.includes('..')) err(w, `invalid src "${b.src}"`);
        if (!b.alt) err(w, 'missing alt');
        break;
      case 'illustration':
        if (!b.imageUrl?.startsWith('https://')) err(w, 'imageUrl must be https');
        if (!b.alt) err(w, 'missing alt');
        break;
      case 'audio':
        for (const f of ['audioUrl', 'caption', 'alt', 'duration']) if (b[f] === undefined) err(w, `missing ${f}`);
        break;
      default:
        warn(w, `unknown block type "${b.type}" (renders as a placeholder)`);
    }
  }
}

if ((mod.schemaVersion ?? 1) < neededSchema) {
  err('module', `schemaVersion ${mod.schemaVersion ?? 1} but blocks need ${neededSchema}`);
}

// ---- Molecule template checks ----

if (molecule) {
  if (!mod.disclaimer) err('molecule', 'disclaimer is required (SCHEMA.md §7)');
  else if (!/as of/i.test(mod.disclaimer)) warn('molecule', 'disclaimer has no "as of" basis');
  if (mod.discipline !== 'Medicines') warn('molecule', `discipline "${mod.discipline}" (template: "Medicines")`);
  if (mod.lessons.length !== 15) warn('molecule', `${mod.lessons.length} lessons (blueprint has 15)`);

  const BANNED = /\b(best-in-class|breakthrough|game[- ]changer|revolutionary|safest|most effective|powerful|well[- ]tolerated|superior to)\b/i;
  const CARD_FIELDS = ['- Registry:', '- Who took part:', '- Background therapy:', '- Compared with:', '- Main question:', '- Headline result:', '- In plain words:', '- Worth knowing:'];
  const texts = mod.lessons.flatMap((l) => l.blocks.filter((b) => b.type === 'text').map((b) => ({ l, b })));

  // Each module defines its own tag set in the "combination tags" block of its trial-reading lesson.
  const tagBlock = texts.find(({ b }) => /^## The combination tags/m.test(b.markdown));
  const tags = tagBlock ? [...tagBlock.b.markdown.matchAll(/^- (🔗 \S+|STATIN-INTOLERANT|MONO):/gm)].map((m) => m[1]) : [];
  if (!tagBlock) err('molecule', 'no "## The combination tags" block defining the tag set');

  const seen = new Set();
  mod.lessons.forEach((lesson, li) => {
    const lw = `lesson ${lesson.id}`;
    const last = lesson.blocks.at(-1);
    if (!(last?.type === 'text' && last.markdown.startsWith('## Sources'))) err(lw, 'last block is not a "## Sources" text block');

    for (const [bi, b] of lesson.blocks.entries()) {
      if (b.type !== 'text') continue;
      const md = b.markdown;

      if (md.startsWith('### Trial card:')) {
        const lines = md.split('\n');
        const tagLines = lines.filter((x) => x.startsWith('Tag:'));
        if (tagLines.length !== 1) err(lw, `trial card "${lines[0]}" needs exactly one Tag: line`);
        else if (!tags.includes(tagLines[0].slice(4).trim())) err(lw, `trial card "${lines[0]}" tag "${tagLines[0].slice(4).trim()}" isn't in the module's tag set`);
        let pos = -1;
        for (const f of CARD_FIELDS) {
          const k = lines.findIndex((x) => x.startsWith(f));
          if (k <= pos) { err(lw, `trial card "${lines[0]}" field "${f}" missing or out of order`); break; }
          pos = k;
        }
      }

      // Jargon rule: at most 3 newly bolded terms per block. Sources blocks and the
      // recap lesson (bold paragraph labels) are exempt.
      const bold = [...md.matchAll(/\*\*(.+?)\*\*/g)].map((m) => m[1]);
      const fresh = [...new Set(bold.filter((x) => !seen.has(x)))];
      const exempt = md.startsWith('## Sources') || li === mod.lessons.length - 1;
      if (!exempt && fresh.length > 3) warn(lw, `block ${bi + 1} introduces ${fresh.length} bold terms: ${fresh.join(', ')}`);
      bold.forEach((x) => seen.add(x));
    }

    const hit = JSON.stringify(lesson).match(BANNED);
    if (hit) err(lw, `promotional wording "${hit[0]}"`);
  });

  // Redundancy: the same flashcard front or quiz question twice in one module is an error;
  // two comparison tables with the same columns are worth a second look.
  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const dupes = (label, pairs) => {
    const at = new Map();
    for (const [k, where] of pairs) at.set(norm(k), [...(at.get(norm(k)) ?? []), where]);
    for (const [k, ws] of at) if (ws.length > 1) err('molecule', `duplicate ${label} "${k}" in ${ws.join(', ')}`);
  };
  const blocks = mod.lessons.flatMap((l) => l.blocks.map((b) => ({ l, b })));
  dupes('flashcard', blocks.filter(({ b }) => b.type === 'flashcard').flatMap(({ l, b }) => b.cards.map((c) => [c.front, l.id])));
  dupes('quiz question', blocks.filter(({ b }) => ['quiz', 'scenario'].includes(b.type)).flatMap(({ l, b }) => b.questions.map((q) => [q.stem, l.id])));
  const cols = new Map();
  for (const { l, b } of blocks.filter(({ b }) => b.type === 'compare')) {
    const k = b.items.map((i) => i.label).join(' / ');
    cols.set(k, [...(cols.get(k) ?? []), l.id]);
  }
  for (const [k, ls] of cols) if (ls.length > 1) warn('molecule', `comparison tables with the same columns (${k}) in ${ls.join(', ')}`);
}

// ---- Report ----

for (const w of warnings) console.log(`warn  ${w}`);
for (const e of errors) console.log(`ERROR ${e}`);
console.log(`\n${file}: ${errors.length} error(s), ${warnings.length} warning(s)`);
process.exit(errors.length ? 1 : 0);
