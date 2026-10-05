// Shared image rules for lesson `image` blocks and glossary entry images.
// See SCHEMA.md §4.7 and assets/README.md. checkImage returns a list of
// error messages (empty = valid).
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

export const LICENSES = [
  'own',
  'CC0',
  'PD',
  'CC-BY-4.0',
  'CC-BY-SA-4.0',
  'CC-BY-3.0',
  'CC-BY-SA-3.0',
  'EMA-reuse',
  'EC-reuse',
];
export const MAX_RASTER_BYTES = 200 * 1024; // WebP, PNG
export const MAX_SVG_BYTES = 300 * 1024;
export const MAX_WIDTH = 1600;
export const MAX_ALT = 200;
export const MAX_CAPTION = 140;

// Pixel width of a WebP file, from its VP8 / VP8L / VP8X header; null if unreadable.
export function webpWidth(buf) {
  if (buf.length < 30 || buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WEBP') return null;
  const chunk = buf.toString('ascii', 12, 16);
  if (chunk === 'VP8X') return 1 + buf.readUIntLE(24, 3);
  if (chunk === 'VP8L') return 1 + (((buf[22] & 0x3f) << 8) | buf[21]);
  if (chunk === 'VP8 ') return buf.readUInt16LE(26) & 0x3fff;
  return null;
}

// Pixel width of a PNG file, from its IHDR chunk; null if unreadable.
export function pngWidth(buf) {
  const sig = '89504e470d0a1a0a';
  if (buf.length < 24 || buf.toString('hex', 0, 8) !== sig || buf.toString('ascii', 12, 16) !== 'IHDR') return null;
  return buf.readUInt32BE(16);
}

// SVG safety: no scripts, no event-handler attributes, and links only to
// fragments (#id) or embedded data: URIs.
export function svgProblems(svg) {
  const out = [];
  if (/<script/i.test(svg)) out.push('contains <script>');
  if (/\son[a-z]+\s*=/i.test(svg)) out.push('contains an on* event attribute');
  for (const m of svg.matchAll(/(?:xlink:)?href\s*=\s*["']([^"']*)["']/gi)) {
    const v = m[1].trim();
    if (!v.startsWith('#') && !v.toLowerCase().startsWith('data:')) out.push(`external reference "${v}"`);
  }
  if (/@import|url\(\s*["']?(?!#|data:)[^)]/i.test(svg)) out.push('external reference in CSS (@import or url())');
  return out;
}

export function checkImage(img, root) {
  const errs = [];
  const src = img?.src;
  if (typeof src !== 'string' || !src.startsWith('assets/') || src.includes('..')) {
    errs.push(`invalid src "${src}"`);
    return errs;
  }
  if (!img.alt) errs.push('missing alt');
  else if (img.alt.length > MAX_ALT) errs.push(`alt is ${img.alt.length} characters (max ${MAX_ALT})`);
  if (img.caption && img.caption.length > MAX_CAPTION) errs.push(`caption is ${img.caption.length} characters (max ${MAX_CAPTION})`);
  if (!img.credit) errs.push('missing credit');
  if (!LICENSES.includes(img.license)) {
    errs.push(`license "${img.license}" is not one of ${LICENSES.join(', ')}`);
  } else if (img.license !== 'own' && !/^https:\/\//.test(img.sourceUrl ?? '')) {
    errs.push('non-own image needs an https sourceUrl');
  }
  if (img.zoomable !== undefined && typeof img.zoomable !== 'boolean') errs.push('zoomable must be true or false');

  const ext = src.split('.').pop().toLowerCase();
  if (!['svg', 'webp', 'png'].includes(ext)) {
    errs.push(`format .${ext}: use SVG for diagrams, WebP for photos (PNG only if WebP isn't possible)`);
    return errs;
  }
  const path = join(root, src);
  if (!existsSync(path)) {
    errs.push(`file not found: ${src}`);
    return errs;
  }
  const bytes = statSync(path).size;
  const max = ext === 'svg' ? MAX_SVG_BYTES : MAX_RASTER_BYTES;
  if (bytes > max) errs.push(`${src} is ${Math.round(bytes / 1024)} KB (max ${max / 1024} KB)`);
  if (ext === 'svg') {
    for (const p of svgProblems(readFileSync(path, 'utf8'))) errs.push(`${src}: ${p}`);
  } else {
    const buf = readFileSync(path);
    const w = ext === 'webp' ? webpWidth(buf) : pngWidth(buf);
    if (w == null) errs.push(`${src} isn't a readable ${ext.toUpperCase()} file`);
    else if (w > MAX_WIDTH) errs.push(`${src} is ${w} px wide (max ${MAX_WIDTH})`);
  }
  return errs;
}
