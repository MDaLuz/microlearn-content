#!/usr/bin/env node
// Validates every image in the content (lesson `image` blocks and glossary
// entry images) and keeps assets/credits.json in step with them.
//
//   node scripts/validate-images.mjs            check (exit 1 on any error)
//   node scripts/validate-images.mjs --write    also regenerate assets/credits.json
//   node scripts/validate-images.mjs --root <dir>   validate another tree (tests)
//
// Hard checks: required fields, licence allowlist, sourceUrl for non-own
// images, file exists, format and size limits, raster width, SVG safety,
// no orphan files in the image folders (assets/gl-*, assets/glossary), and a
// committed credits.json that matches the content. Unreferenced files
// elsewhere in assets/ (app icons, fonts, older illustrations) are warnings.

import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkImage } from './image-check.mjs';

const args = process.argv.slice(2);
const write = args.includes('--write');
const rootArg = args.indexOf('--root');
const root = rootArg >= 0 ? args[rootArg + 1] : join(dirname(fileURLToPath(import.meta.url)), '..');

const errors = [];
const warnings = [];
const err = (where, msg) => errors.push(`${where}: ${msg}`);
const warn = (where, msg) => warnings.push(`${where}: ${msg}`);
const readJson = (p) => JSON.parse(readFileSync(join(root, p), 'utf8'));

// Folders that hold image-block assets; an unreferenced file here is an error.
const IMAGE_DIR = /^assets\/(gl-[^/]+|glossary)\//;
const IGNORED = new Set(['assets/README.md', 'assets/credits.json']);

// ---------------------------------------------------------------------------
// Collect images and every assets/ path the content mentions
// ---------------------------------------------------------------------------

const images = []; // { image, where, use }
const mentioned = new Set();

const modulesDir = join(root, 'modules');
const moduleFiles = existsSync(modulesDir) ? readdirSync(modulesDir).filter((f) => f.endsWith('.json')).sort() : [];
for (const f of moduleFiles) {
  const raw = readFileSync(join(modulesDir, f), 'utf8');
  for (const m of raw.matchAll(/assets\/[A-Za-z0-9_./-]+/g)) mentioned.add(m[0]); // illustrations use full URLs
  const mod = JSON.parse(raw);
  for (const lesson of mod.lessons ?? []) {
    (lesson.blocks ?? []).forEach((b, i) => {
      if (b.type !== 'image') return;
      images.push({ image: b, where: `${mod.id}/${lesson.id} block ${i}`, use: { module: mod.id, lesson: lesson.id } });
    });
  }
}

if (existsSync(join(root, 'glossary.json'))) {
  for (const e of readJson('glossary.json').entries ?? []) {
    if (e.image) images.push({ image: e.image, where: `glossary ${e.id}`, use: { glossary: e.id } });
  }
}

// ---------------------------------------------------------------------------
// Per-image checks
// ---------------------------------------------------------------------------

for (const { image, where } of images) {
  for (const m of checkImage(image, root)) err(where, m);
  if (typeof image.src === 'string') mentioned.add(image.src);
}

// ---------------------------------------------------------------------------
// Orphans
// ---------------------------------------------------------------------------

function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

for (const file of walk(join(root, 'assets'))) {
  const rel = relative(root, file).split(sep).join('/');
  if (IGNORED.has(rel) || rel.endsWith('/.gitkeep') || rel.endsWith('/README.md')) continue;
  if (mentioned.has(rel)) continue;
  if (IMAGE_DIR.test(rel)) err('orphan', `${rel} isn't used by any image block or glossary entry`);
  else warn('unreferenced', rel);
}

// ---------------------------------------------------------------------------
// Credits manifest (non-own images), read by the app's Image credits screen
// ---------------------------------------------------------------------------

const bySrc = new Map();
for (const { image, use } of images) {
  if (!image.license || image.license === 'own' || typeof image.src !== 'string') continue;
  const entry = bySrc.get(image.src) ?? {
    src: image.src,
    credit: image.credit,
    license: image.license,
    sourceUrl: image.sourceUrl ?? null,
    usedIn: [],
  };
  entry.usedIn.push(use);
  bySrc.set(image.src, entry);
}
const credits = { generatedBy: 'scripts/validate-images.mjs', images: [...bySrc.values()].sort((a, b) => a.src.localeCompare(b.src)) };
const creditsText = JSON.stringify(credits, null, 2) + '\n';
const creditsPath = join(root, 'assets', 'credits.json');
const committed = existsSync(creditsPath) ? readFileSync(creditsPath, 'utf8').replace(/\r\n/g, '\n') : null;

if (committed !== creditsText) {
  if (write) {
    writeFileSync(creditsPath, creditsText);
    console.log('assets/credits.json regenerated');
  } else {
    err('credits', 'assets/credits.json is missing or stale; run with --write and commit it');
  }
}

// ---------------------------------------------------------------------------

for (const w of warnings) console.log(`warn  ${w}`);
for (const e of errors) console.log(`ERROR ${e}`);
console.log(
  `\n${images.length} image(s), ${credits.images.length} credited: ${errors.length} error(s), ${warnings.length} warning(s)`
);
process.exit(errors.length ? 1 : 0);
