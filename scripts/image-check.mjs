// Shared image rules for lesson `image` blocks and glossary entry images.
// See SCHEMA.md §4.7. Returns a list of error messages (empty = valid).
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

export const LICENSES = ['own', 'CC0', 'PD', 'CC-BY-4.0', 'CC-BY-SA-4.0', 'EMA-reuse', 'EC-reuse'];
export const MAX_BYTES = 200 * 1024;
export const MAX_WIDTH = 1600;

// Pixel width of a WebP file, from its VP8 / VP8L / VP8X header; null if unreadable.
export function webpWidth(buf) {
  if (buf.length < 30 || buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WEBP') return null;
  const chunk = buf.toString('ascii', 12, 16);
  if (chunk === 'VP8X') return 1 + buf.readUIntLE(24, 3);
  if (chunk === 'VP8L') return 1 + (((buf[22] & 0x3f) << 8) | buf[21]);
  if (chunk === 'VP8 ') return buf.readUInt16LE(26) & 0x3fff;
  return null;
}

export function checkImage(img, root) {
  const errs = [];
  const src = img?.src;
  if (typeof src !== 'string' || !src.startsWith('assets/') || src.includes('..')) {
    errs.push(`invalid src "${src}"`);
    return errs;
  }
  if (!img.alt) errs.push('missing alt');
  if (!img.credit) errs.push('missing credit');
  if (!LICENSES.includes(img.license)) {
    errs.push(`license "${img.license}" is not one of ${LICENSES.join(', ')}`);
  } else if (img.license !== 'own' && !/^https:\/\//.test(img.sourceUrl ?? '')) {
    errs.push(`non-own image needs an https sourceUrl`);
  }

  const ext = src.split('.').pop().toLowerCase();
  if (ext !== 'svg' && ext !== 'webp') errs.push(`format .${ext}: use SVG for diagrams, WebP for photos`);
  const path = join(root, src);
  if (!existsSync(path)) {
    errs.push(`file not found: ${src}`);
    return errs;
  }
  const bytes = statSync(path).size;
  if (bytes > MAX_BYTES) errs.push(`${src} is ${Math.round(bytes / 1024)} KB (max ${MAX_BYTES / 1024} KB)`);
  if (ext === 'webp') {
    const w = webpWidth(readFileSync(path));
    if (w == null) errs.push(`${src} isn't a readable WebP file`);
    else if (w > MAX_WIDTH) errs.push(`${src} is ${w} px wide (max ${MAX_WIDTH})`);
  }
  if (ext === 'svg') {
    const svg = readFileSync(path, 'utf8');
    if (/<script|xlink:href="http|href="http|@import/i.test(svg)) errs.push(`${src} must be self-contained (no scripts or external links)`);
  }
  return errs;
}
