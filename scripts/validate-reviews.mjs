#!/usr/bin/env node
// Validates reviews/<moduleId>.reviews.json files against schemas/reviews.schema.json
// and the cross-file rules of the synthesis-review format.
//
//   node scripts/validate-reviews.mjs [reviews/<id>.reviews.json ...] [--no-list]
//
// With no files, checks every file in reviews/. Prints, per file:
//   - errors (exit 1 if any) and warnings
//   - a review list of block and module units (covers + question prompts), so a
//     human can check that their questions draw on at least 2 different lessons
//     (--no-list skips it)
//   - an answer-balance report: position of the correct option, and its length
//     rank among the four options. Flags a file when any position is above 40 %
//     or the correct option is the longest in more than 40 % of questions.

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const showList = !args.includes('--no-list');
let files = args.filter((a) => !a.startsWith('--'));
if (files.length === 0) {
  const dir = join(root, 'reviews');
  files = existsSync(dir)
    ? readdirSync(dir).filter((f) => f.endsWith('.reviews.json')).map((f) => join('reviews', f))
    : [];
}

const catalog = JSON.parse(readFileSync(join(root, 'catalog.json'), 'utf8'));
const words = (s) => s.trim().split(/\s+/).filter(Boolean).length;
const pct = (n, d) => (d ? Math.round((100 * n) / d) : 0);
let failed = false;

for (const file of files) {
  const errors = [];
  const warnings = [];
  const err = (w, m) => errors.push(`${w}: ${m}`);
  const warn = (w, m) => warnings.push(`${w}: ${m}`);

  let r;
  try {
    r = JSON.parse(readFileSync(join(root, file), 'utf8'));
  } catch (e) {
    console.log(`\n${file}\nERROR invalid JSON: ${e.message}`);
    failed = true;
    continue;
  }

  // ---- Shape (mirrors schemas/reviews.schema.json) ----
  const allowed = (obj, keys, w) => {
    for (const k of Object.keys(obj ?? {})) if (!keys.includes(k)) err(w, `unexpected field "${k}"`);
  };
  allowed(r, ['moduleId', 'version', 'blocks', 'units'], 'file');
  if (typeof r.moduleId !== 'string' || !r.moduleId) err('file', 'moduleId must be a non-empty string');
  if (!Number.isInteger(r.version) || r.version < 1) err('file', 'version must be an integer ≥ 1');
  if (!Array.isArray(r.blocks) || r.blocks.length === 0) err('file', 'blocks must be a non-empty array');
  if (!Array.isArray(r.units) || r.units.length === 0) err('file', 'units must be a non-empty array');

  // ---- Module and catalog ----
  const entry = catalog.modules.find((m) => m.id === r.moduleId);
  let lessons = [];
  if (!entry) err('catalog', `no module "${r.moduleId}"`);
  else {
    const expectedPath = `reviews/${r.moduleId}.reviews.json`;
    if (file.replace(/\\/g, '/') !== expectedPath) err('file', `should be named ${expectedPath}`);
    if (entry.reviews !== undefined && entry.reviews !== expectedPath) err('catalog', `reviews "${entry.reviews}" ≠ "${expectedPath}"`);
    if (entry.reviews !== undefined && entry.reviewsVersion !== r.version) err('catalog', `reviewsVersion ${entry.reviewsVersion} ≠ file version ${r.version}`);
    if (entry.reviews === undefined) warn('catalog', `module entry has no "reviews" pointer yet`);
    lessons = JSON.parse(readFileSync(join(root, entry.file), 'utf8')).lessons.map((l) => l.id);
  }
  const lessonSet = new Set(lessons);
  const isRecap = (id) => /-recap$/.test(id);

  // ---- Blocks ----
  const blockIds = new Set();
  const blockOf = new Map();
  for (const [i, b] of (r.blocks ?? []).entries()) {
    const w = `block ${b.id ?? i}`;
    allowed(b, ['id', 'title', 'lessons'], w);
    if (!b.id) err(w, 'missing id');
    else if (blockIds.has(b.id)) err(w, 'duplicate block id');
    blockIds.add(b.id);
    if (!b.title) err(w, 'missing title');
    const n = b.lessons?.length ?? 0;
    if (n < 3 || n > 5) err(w, `needs 3–5 lessons, has ${n}`);
    for (const l of b.lessons ?? []) {
      if (!lessonSet.has(l)) err(w, `lesson "${l}" not in module`);
      if (blockOf.has(l)) err(w, `lesson "${l}" is also in block ${blockOf.get(l)}`);
      blockOf.set(l, b.id);
    }
  }

  // ---- Units ----
  const unitIds = new Set();
  const lessonUnits = new Map();
  const blockUnits = new Map();
  let moduleUnits = 0;
  const balance = { positions: [0, 0, 0, 0], lengthRank: [0, 0, 0, 0], mcqs: 0, selfChecks: 0 };
  const reviewList = [];

  for (const [i, u] of (r.units ?? []).entries()) {
    const w = `unit ${u.id ?? i}`;
    allowed(u, ['id', 'level', 'covers', 'summary', 'exercises'], w);
    if (!u.id) err(w, 'missing id');
    else if (unitIds.has(u.id)) err(w, 'duplicate unit id');
    unitIds.add(u.id);
    const covers = u.covers ?? [];
    for (const l of covers) if (!lessonSet.has(l)) err(w, `covers "${l}", not in module`);
    if (new Set(covers).size !== covers.length) err(w, 'covers lists a lesson twice');

    if (u.level === 'lesson') {
      if (covers.length !== 1) err(w, `lesson unit must cover exactly 1 lesson, covers ${covers.length}`);
      else {
        if (isRecap(covers[0])) err(w, `recap lesson "${covers[0]}" gets no lesson unit`);
        if (lessonUnits.has(covers[0])) err(w, `second lesson unit for "${covers[0]}" (first: ${lessonUnits.get(covers[0])})`);
        lessonUnits.set(covers[0], u.id);
      }
    } else if (u.level === 'block') {
      const block = (r.blocks ?? []).find((b) => b.lessons.length === covers.length && b.lessons.every((l) => covers.includes(l)));
      if (!block) err(w, 'block unit covers must equal one block\'s lessons');
      else {
        if (blockUnits.has(block.id)) err(w, `second block unit for ${block.id} (first: ${blockUnits.get(block.id)})`);
        blockUnits.set(block.id, u.id);
      }
    } else if (u.level === 'module') {
      moduleUnits++;
      const missing = lessons.filter((l) => !covers.includes(l));
      if (missing.length) err(w, `module unit must cover every lesson; missing ${missing.join(', ')}`);
    } else err(w, `level must be lesson | block | module, got "${u.level}"`);

    // Summary
    const s = u.summary ?? {};
    allowed(s, ['title', 'points', 'image'], `${w} summary`);
    if (!s.title) err(w, 'summary.title missing');
    const np = s.points?.length ?? 0;
    if (np < 3 || np > 6) err(w, `summary needs 3–6 points, has ${np}`);
    for (const [pi, p] of (s.points ?? []).entries()) {
      if (typeof p !== 'string' || !p.trim()) err(w, `summary point ${pi + 1} empty`);
      else if (words(p) > 30) err(w, `summary point ${pi + 1} has ${words(p)} words (max 30)`);
    }
    if (s.image !== undefined) {
      if (typeof s.image !== 'string' || /^https?:/i.test(s.image) || s.image.includes('..')) err(w, `summary.image must be a repo path, got "${s.image}"`);
      else if (!existsSync(join(root, s.image))) err(w, `summary.image ${s.image} not found`);
    }

    // Exercises
    const ex = u.exercises ?? [];
    if (ex.length !== 2) err(w, `needs exactly 2 exercises, has ${ex.length}`);
    const exIds = ex.map((e) => e.id).join(',');
    if (ex.length === 2 && exIds !== 'ex1,ex2') err(w, `exercise ids must be ex1, ex2 (got ${exIds})`);
    let selfChecks = 0;
    const prompts = [];
    for (const e of ex) {
      const we = `${w} ${e.id ?? '?'}`;
      allowed(e, ['id', 'kind', 'scenario', 'questions'], we);
      if (!['apply', 'connect'].includes(e.kind)) err(we, `kind must be apply | connect, got "${e.kind}"`);
      if (!e.scenario) err(we, 'missing scenario');
      const nq = e.questions?.length ?? 0;
      if (nq < 2 || nq > 3) err(we, `needs 2–3 questions, has ${nq}`);
      for (const [qi, q] of (e.questions ?? []).entries()) {
        const wq = `${we} q${qi + 1}`;
        prompts.push(`[${e.id}] ${q.prompt}`);
        if (q.type === 'mcq') {
          allowed(q, ['type', 'prompt', 'options', 'answer', 'explanation'], wq);
          if (!q.prompt) err(wq, 'missing prompt');
          if (!q.explanation) err(wq, 'missing explanation');
          if (!Array.isArray(q.options) || q.options.length !== 4) err(wq, `needs 4 options, has ${q.options?.length ?? 0}`);
          else {
            const norm = q.options.map((o) => String(o).trim().toLowerCase());
            if (new Set(norm).size !== 4) err(wq, 'options are not unique');
            if (norm.some((o) => !o)) err(wq, 'empty option');
          }
          if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3) err(wq, `answer must be 0–3, got ${q.answer}`);
          else if (q.options?.length === 4) {
            balance.mcqs++;
            balance.positions[q.answer]++;
            // Rank of the correct option by length: 0 = shortest … 3 = longest (ties share the lower rank).
            const len = q.options[q.answer].length;
            balance.lengthRank[q.options.filter((o) => o.length < len).length]++;
          }
        } else if (q.type === 'self-check') {
          allowed(q, ['type', 'prompt', 'modelAnswer'], wq);
          if (!q.prompt) err(wq, 'missing prompt');
          if (!q.modelAnswer) err(wq, 'missing modelAnswer');
          selfChecks++;
          balance.selfChecks++;
        } else err(wq, `type must be mcq | self-check, got "${q.type}"`);
      }
    }
    if (selfChecks > 1) err(w, `${selfChecks} self-check questions (max 1)`);
    if (u.level === 'block' || u.level === 'module') reviewList.push({ id: u.id, level: u.level, covers, prompts });
  }

  // ---- Coverage: one unit per lesson (except recaps), per block, per module ----
  for (const l of lessons) if (!isRecap(l) && !lessonUnits.has(l)) err('coverage', `lesson "${l}" has no lesson unit`);
  for (const b of blockIds) if (!blockUnits.has(b)) err('coverage', `block ${b} has no block unit`);
  if (moduleUnits !== 1) err('coverage', `needs exactly 1 module unit, has ${moduleUnits}`);

  // ---- Report ----
  console.log(`\n${file}  (${r.units?.length ?? 0} units, ${balance.mcqs} MCQs, ${balance.selfChecks} self-check)`);
  for (const e of errors) console.log(`ERROR ${e}`);
  for (const w of warnings) console.log(`warn  ${w}`);

  if (showList) {
    console.log('\n  Review list: block and module units (check that questions draw on ≥ 2 lessons)');
    for (const u of reviewList) {
      console.log(`  ${u.id} (${u.level}) covers ${u.covers.length === lessons.length ? 'all lessons' : u.covers.join(', ')}`);
      for (const p of u.prompts) console.log(`    - ${p}`);
    }
  }

  const n = balance.mcqs;
  const pos = balance.positions.map((c) => pct(c, n));
  const rank = balance.lengthRank.map((c) => pct(c, n));
  const flags = [];
  pos.forEach((p, i) => p > 40 && flags.push(`position ${i} at ${p} %`));
  if (rank[3] > 40) flags.push(`correct option is the longest in ${rank[3]} %`);
  console.log(`\n  Answer balance (${n} MCQs)`);
  console.log(`    position     0: ${pos[0]} %   1: ${pos[1]} %   2: ${pos[2]} %   3: ${pos[3]} %`);
  console.log(`    length rank  shortest: ${rank[0]} %   2nd shortest: ${rank[1]} %   2nd longest: ${rank[2]} %   longest: ${rank[3]} %`);
  console.log(flags.length ? `    FLAG ${flags.join('; ')}` : '    ok');

  console.log(`\n${file}: ${errors.length} error(s), ${warnings.length} warning(s)${flags.length ? ', balance flagged' : ''}`);
  if (errors.length) failed = true;
}

if (files.length === 0) console.log('No review files found.');
process.exit(failed ? 1 : 0);
