#!/usr/bin/env node
// Self-test for validate-images: builds a throwaway content tree in a temp
// folder (never shipped in any module), runs the validator on it, and checks
// that the valid image passes and each invalid case is caught.
//
//   node scripts/test-validate-images.mjs

import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const VALIDATOR = join(dirname(fileURLToPath(import.meta.url)), 'validate-images.mjs');
const root = mkdtempSync(join(tmpdir(), 'images-fixture-'));
const put = (rel, data) => {
  mkdirSync(dirname(join(root, rel)), { recursive: true });
  writeFileSync(join(root, rel), data);
};

// Minimal file headers are enough for the format and width checks.
const png = (w) => {
  const b = Buffer.alloc(33);
  Buffer.from('89504e470d0a1a0a', 'hex').copy(b, 0);
  b.writeUInt32BE(13, 8);
  b.write('IHDR', 12);
  b.writeUInt32BE(w, 16);
  b.writeUInt32BE(100, 20);
  return b;
};
const webp = (w, pad = 0) => {
  const b = Buffer.alloc(30 + pad);
  b.write('RIFF', 0);
  b.write('WEBP', 8);
  b.write('VP8X', 12);
  b.writeUIntLE(w - 1, 24, 3);
  return b;
};
const svg = (body = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10">${body}</svg>`;

put('assets/gl-m0/valid.svg', svg('<rect width="10" height="10" fill="url(#g)"/>'));
put('assets/gl-m0/photo.webp', webp(1200));
put('assets/gl-m0/script.svg', svg('<script>alert(1)</script>'));
put('assets/gl-m0/onload.svg', svg('<rect onload="x()"/>'));
put('assets/gl-m0/external.svg', svg('<image href="https://example.org/a.png"/>'));
put('assets/gl-m0/css-url.svg', svg('<style>rect{fill:url(https://example.org/p.svg)}</style>'));
put('assets/gl-m0/huge.svg', svg(`<!--${'x'.repeat(310 * 1024)}-->`));
put('assets/gl-m0/heavy.webp', webp(800, 210 * 1024));
put('assets/gl-m0/wide.png', png(2000));
put('assets/gl-m0/photo.jpg', 'not really a jpeg');
put('assets/gl-m0/orphan.svg', svg());

const own = (src, extra = {}) => ({ type: 'image', src, alt: 'Alt text', credit: 'Compound (own diagram)', license: 'own', ...extra });
const blocks = {
  valid: own('assets/gl-m0/valid.svg', { zoomable: true }),
  credited: own('assets/gl-m0/photo.webp', { license: 'CC-BY-SA-4.0', credit: 'Jane / Wikimedia Commons', sourceUrl: 'https://commons.wikimedia.org/x' }),
  noAlt: own('assets/gl-m0/valid.svg', { alt: '' }),
  noCredit: own('assets/gl-m0/valid.svg', { credit: '' }),
  badLicense: own('assets/gl-m0/valid.svg', { license: 'CC-BY-NC-4.0' }),
  noSource: own('assets/gl-m0/valid.svg', { license: 'CC0' }),
  missingFile: own('assets/gl-m0/nope.svg'),
  jpeg: own('assets/gl-m0/photo.jpg'),
  heavy: own('assets/gl-m0/heavy.webp'),
  huge: own('assets/gl-m0/huge.svg'),
  wide: own('assets/gl-m0/wide.png'),
  script: own('assets/gl-m0/script.svg'),
  onload: own('assets/gl-m0/onload.svg'),
  external: own('assets/gl-m0/external.svg'),
  cssUrl: own('assets/gl-m0/css-url.svg'),
  longAlt: own('assets/gl-m0/valid.svg', { alt: 'a'.repeat(201) }),
};
put(
  'modules/fixture.json',
  JSON.stringify({
    id: 'fixture',
    lessons: Object.entries(blocks).map(([id, b]) => ({ id, blocks: [b] })),
  })
);
put(
  'glossary.json',
  JSON.stringify({ version: 1, entries: [{ id: 'g-photo', image: blocks.credited }] })
);

function run(extra = []) {
  try {
    return { code: 0, out: execFileSync('node', [VALIDATOR, '--root', root, ...extra], { encoding: 'utf8' }) };
  } catch (e) {
    return { code: e.status, out: e.stdout };
  }
}

// First run writes credits.json; the rest then check against it.
run(['--write']);
const { code, out } = run();
const lines = out.split('\n');
const has = (lesson, text) => lines.some((l) => l.includes(`fixture/${lesson} `) && l.includes(text));

const expectations = [
  ['1 required alt', has('noAlt', 'missing alt')],
  ['1 required credit', has('noCredit', 'missing credit')],
  ['1 licence allowlist', has('badLicense', 'license "CC-BY-NC-4.0"')],
  ['2 sourceUrl for non-own', has('noSource', 'needs an https sourceUrl')],
  ['3 file exists', has('missingFile', 'file not found')],
  ['4 format', has('jpeg', 'format .jpg')],
  ['4 raster size', has('heavy', 'KB (max 200 KB)')],
  ['4 SVG size', has('huge', 'KB (max 300 KB)')],
  ['5 raster width', has('wide', '2000 px wide')],
  ['6 SVG script', has('script', '<script>')],
  ['6 SVG on* attribute', has('onload', 'on* event attribute')],
  ['6 SVG external href', has('external', 'external reference')],
  ['6 SVG external CSS url', has('cssUrl', 'external reference in CSS')],
  ['7 orphan', lines.some((l) => l.includes('orphan') && l.includes('assets/gl-m0/orphan.svg'))],
  ['alt length', has('longAlt', 'alt is 201 characters')],
  ['valid image passes', !lines.some((l) => l.includes('fixture/valid '))],
  ['credited image passes', !lines.some((l) => l.includes('fixture/credited '))],
  ['credits.json up to date', !out.includes('stale')],
  ['exit code is non-zero', code !== 0],
];

// Stale manifest: remove the credited image from the glossary, keep the old credits.json.
put('glossary.json', JSON.stringify({ version: 1, entries: [] }));
const stale = run();
expectations.push(['stale credits.json fails', stale.out.includes('credits.json is missing or stale')]);

rmSync(root, { recursive: true, force: true });

let failed = 0;
for (const [name, ok] of expectations) {
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${name}`);
  if (!ok) failed++;
}
console.log(`\n${expectations.length - failed}/${expectations.length} checks passed`);
process.exit(failed ? 1 : 0);
