# assets/

Images for `image` blocks and glossary entries, served by GitHub Pages next to the
modules. The app caches them for offline use.

## Folders

- `gl-m0/` … `gl-m9/`: one folder per module of the Generics & launch course.
- `glossary/`: pictures attached to glossary entries.
- Older folders (`gardening/`, `indemnification/`, `indoor-gardening/`, `public-speaking/`)
  hold illustrations referenced by full URL from `illustration` blocks; icons and `fonts/`
  belong to the app build. The image validator only warns about unreferenced files there.

## File rules

- **SVG for diagrams.** Allowed: a `viewBox` attribute, embedded fonts and system font
  fallbacks. Not allowed: scripts, `on*` event attributes, external references (`href` and
  `xlink:href` may only point to `#id` fragments or `data:` URIs; no `@import` or external
  `url()` in CSS). At most 300 KB.
- **WebP for photos and screenshots:** at most 1600 px wide and 200 KB.
- **PNG** only if WebP isn't possible, with the same limits as WebP.
- **File names** in kebab-case and describing the content, e.g. `gl-m2/dcp-clock.svg`.
- **Own material** (`license: "own"`) must be anonymised before it's committed: no partner
  names, product names, batch numbers or personal data.

## Licences

Every image declares `credit` and one of these `license` values:
`own`, `CC0`, `PD`, `CC-BY-4.0`, `CC-BY-SA-4.0`, `CC-BY-3.0`, `CC-BY-SA-3.0`, `EMA-reuse`,
`EC-reuse`. Anything other than `own` also needs `sourceUrl`: the page where the image and its
licence were checked. Never use images from search engines, company websites, unlicensed stock
photos, or figures copied from ICH, EDQM or WHO documents (redraw those as own diagrams).

## Validation and credits

```bash
npm run validate:images          # check everything
node scripts/validate-images.mjs --write   # also regenerate credits.json
npm run test:images              # validator self-test on the fixture
```

`credits.json` is generated: it lists every non-`own` image with its credit, licence, source and
where it's used, for the app's Image credits screen. The validator fails if the committed copy is
stale, so regenerate and commit it whenever an image changes. Every file in `gl-*/` and
`glossary/` must be used by at least one image block or glossary entry.
