# Compound Content Schema

This is the canonical reference for the Compound content schema. It defines what valid module content looks like. The app-side implementation notes live in `CONTENT.md` in the app repo.

**Source-of-truth rule:** when the schema and the app diverge, this document wins. When a new block type ships, update this document in a content-repo commit first, then update `CONTENT.md` in an app-repo commit once the app supports it.

---

## Table of contents

1. [File structure](#1-file-structure)
2. [catalog.json](#2-catalogjson)
3. [Module files](#3-module-files)
4. [Block types](#4-block-types)
   - [text](#41-text)
   - [flashcard](#42-flashcard)
   - [quiz](#43-quiz)
   - [compare](#44-compare)
   - [timeline](#45-timeline)
   - [reveal](#46-reveal)
   - [image](#47-image)
   - [scenario](#48-scenario)
   - [audio](#49-audio)
5. [Asset hosting](#5-asset-hosting)
6. [Schema version history](#6-schema-version-history)
7. [Content and copyright](#7-content-and-copyright)

---

## 1. File structure

```
content-repo/
  catalog.json          ← module registry (app reads this first)
  SCHEMA.md             ← this document
  modules/
    indoor-gardening.json
    public-speaking.json
    djing.json
    ...
  assets/
    indoor-gardening/
      early-blight.jpg
      ...
    djing/
      l04-beatmatch-before.mp3
      l04-beatmatch-after.mp3
      ...
```

Assets (images, audio) live under `assets/<module-id>/` and are served via GitHub Pages. The app fetches them by constructing a full HTTPS URL from the GitHub Pages base and the relative path.

---

## 2. catalog.json

The app fetches `catalog.json` on every launch (or from cache when offline) to know which modules exist and whether it has the latest version.

### Full example

```json
{
  "schemaVersion": 1,
  "modules": [
    {
      "id": "indoor-gardening",
      "title": "Jardinage d'intérieur",
      "discipline": "Gardening",
      "description": "Comprendre ce dont les plantes d'intérieur ont vraiment besoin.",
      "file": "modules/indoor-gardening.json",
      "version": 9,
      "lessonCount": 16,
      "estimatedMinutes": 120,
      "accentColor": "#639922"
    }
  ]
}
```

### Fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `schemaVersion` | integer | yes | Always `1`. Increment only if the catalog structure itself changes. |
| `modules` | array | yes | One entry per published module. |

### Module entry fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes | Kebab-case. Matches the module's `id` field and the folder name under `assets/`. |
| `title` | string | yes | Display title in the app's module list. |
| `discipline` | string | yes | Used to derive the accent color set. Examples: `"Gardening"`, `"Communication"`, `"DJing"`. |
| `description` | string | yes | One or two sentences, plain text. Shown in the module detail screen. |
| `file` | string | yes | Path to the module JSON relative to the repo root. |
| `version` | integer | yes | Monotonically increasing. Bump whenever the module content changes. The app uses this to decide whether to re-fetch the module file. |
| `lessonCount` | integer | yes | Total number of lessons in the module. Must equal the actual count in the module file. Used to display progress before the module is loaded. |
| `estimatedMinutes` | integer | yes | Rough total completion time. Used for display only; no enforcement. |
| `accentColor` | string | yes | Hex color string (`#RRGGBB`). Used as the module accent throughout the UI. |

---

## 3. Module files

### Top-level structure

```json
{
  "id": "public-speaking",
  "title": "Prise de parole en public",
  "discipline": "Communication",
  "version": 5,
  "schemaVersion": 5,
  "disclaimer": "Optional plain-text disclaimer shown before the first lesson.",
  "levels": [
    { "level": 1, "xpRequired": 0, "title": "Débutant" },
    { "level": 2, "xpRequired": 180, "title": "Orateur en formation" },
    { "level": 3, "xpRequired": 500, "title": "Orateur confiant" }
  ],
  "lessons": [ ... ]
}
```

### Top-level fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes | Must match the catalog entry's `id`. |
| `title` | string | yes | Full module title. |
| `discipline` | string | yes | Must match the catalog entry's `discipline`. |
| `version` | integer | yes | Must match the catalog entry's `version`. |
| `schemaVersion` | integer | yes | See [§6 Schema version history](#6-schema-version-history). Use the minimum version that covers the block types used. |
| `disclaimer` | string | no | Shown as a warning banner before the first lesson. Use for content that has health, legal, or mental-health-adjacent scope. |
| `levels` | array | no | XP level thresholds for the module. Include when the discipline benefits from progression titles. Omit for modules with a flat completion model. |
| `lessons` | array | yes | Ordered list of lesson objects. |

### Lesson fields

```json
{
  "id": "ps-l01-pourquoi-echouent",
  "title": "Pourquoi les présentations échouent",
  "xpReward": 40,
  "blocks": [ ... ]
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes | Globally unique within the module. Convention: `<module-prefix>-l<nn>-<slug>`. |
| `title` | string | yes | Lesson title. Shown in the lesson header. |
| `xpReward` | integer | yes | Base XP awarded on completion. Typical range: 30–60. |
| `blocks` | array | yes | Ordered list of block objects. |

### ID uniqueness

All IDs — lesson IDs, flashcard card IDs, quiz question IDs, timeline event IDs — must be unique within a module. The batch validation scripts enforce this. Reusing an ID across lessons is an error.

---

## 4. Block types

Every block is a JSON object with a `"type"` string discriminator. Unknown types are passed through without error by the app (rendered as a grey placeholder), which allows new block types to be authored before the app ships support for them.

---

### 4.1 `text`

**Purpose:** The primary narrative block. Renders Markdown as flowing prose. Use for concept introduction, explanations, examples, summaries, and any content that doesn't benefit from an interactive format.

**schemaVersion required:** any (original primitive)

```json
{
  "type": "text",
  "markdown": "## Section heading\n\nParagraph text with **bold** and *italic*. Markdown is rendered natively.\n\nSupported: headings (##, ###), bold, italic, bullet lists, numbered lists, blockquotes, inline code, horizontal rules."
}
```

#### With inline SVG (deprecated in favor of `image` and `reveal`)

```json
{
  "type": "text",
  "markdown": "The structure is illustrated below.",
  "svg": "<svg viewBox=\"0 0 400 200\" ...>...</svg>",
  "caption": "Caption shown below the SVG."
}
```

#### Fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `type` | `"text"` | yes | |
| `markdown` | string | yes | CommonMark Markdown. Rendered natively. |
| `svg` | string | no | Inline SVG string. Deprecated; prefer `image` or `reveal` blocks for new content. |
| `caption` | string | no | Caption shown below the SVG when `svg` is present. |

#### Authoring conventions

- Use `##` for section headings within a block, `###` for sub-sections. Never `#` (reserved for lesson title).
- Prefer multiple short text blocks over one giant text block. The lesson player scrolls through blocks sequentially; a wall of text hurts engagement.
- Do not repeat information from the lesson title or previous blocks.
- Write in the lesson's language throughout (no code-switching).
- Avoid passive voice where active is possible.

---

### 4.2 `flashcard`

**Purpose:** Spaced-repetition vocabulary cards. Each card has a front (question/term) and a back (answer/definition). Cards are seeded into the SR review queue on first completion.

**schemaVersion required:** any (original primitive)

```json
{
  "type": "flashcard",
  "title": "Termes clés",
  "cards": [
    {
      "id": "ig-l01-fc1",
      "front": "Photosynthèse",
      "back": "Processus par lequel une plante convertit la lumière en sucres. Nécessite de la lumière, de l'eau et du CO₂."
    },
    {
      "id": "ig-l01-fc2",
      "front": "Transpiration",
      "back": "Évaporation de l'eau par les stomates des feuilles. Principal mécanisme de perte d'eau chez les plantes."
    }
  ]
}
```

#### Fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `type` | `"flashcard"` | yes | |
| `title` | string | no | Shown as a block heading. Defaults to generic label if omitted. |
| `cards` | array | yes | At least 2 cards. No hard maximum, but >8 cards per block is unusual. |

#### Card fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes | Globally unique within the module. Convention: `<lesson-id>-fc<n>`. |
| `front` | string | yes | The question, term, or prompt. Keep short: 3–12 words. |
| `back` | string | yes | The answer or definition. 1–3 sentences. |

#### Authoring conventions

- Use flashcards for discrete facts worth memorizing: terminology, definitions, key principles, named techniques.
- Do not create flashcards for content that is better understood than memorized (processes, how-to instructions, context-heavy concepts).
- `front` and `back` should be self-contained: the card will be reviewed out of context months later.
- Avoid cards where the answer is trivially deducible from the question. Flashcards reward recall, not inference.

---

### 4.3 `quiz`

**Purpose:** Comprehension check with one or more multiple-choice questions. Each question has exactly one correct answer and an explanation shown after answering.

**schemaVersion required:** any (original primitive)

```json
{
  "type": "quiz",
  "title": "Vérification",
  "questions": [
    {
      "id": "ps-l02-q1",
      "stem": "Après combien de minutes l'attention d'un public non engagé chute-t-elle significativement?",
      "options": [
        "5 minutes.",
        "10 minutes.",
        "20 minutes.",
        "45 minutes."
      ],
      "correctIndex": 1,
      "explanation": "La recherche sur l'attention montre une chute significative autour de 10 minutes sans réengagement actif. Ce n'est pas une règle absolue — un orateur excellent peut maintenir l'attention plus longtemps — mais c'est le seuil à partir duquel la conception du contenu doit intégrer des points de réengagement."
    }
  ]
}
```

#### Fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `type` | `"quiz"` | yes | |
| `title` | string | no | Block heading. Defaults to generic label if omitted. |
| `questions` | array | yes | 1–4 questions per block. More than 4 should be split into a `scenario` block or multiple quiz blocks. |

#### Question fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes | Globally unique within the module. Convention: `<lesson-id>-q<n>`. |
| `stem` | string | yes | The question. Complete sentence, ends with `?`. |
| `options` | array of string | yes | 3–4 options. |
| `correctIndex` | integer | yes | 0-based index of the correct option. |
| `explanation` | string | yes | Shown after the reader answers (correct or incorrect). 2–5 sentences. Explains the correct answer and, if useful, why the most tempting wrong answer is wrong. |

#### Authoring conventions

- Write quiz blocks at the **end** of a lesson section, not at the start. They check comprehension; the reader needs the content first.
- Explanations are not summaries of the lesson — they are targeted follow-up on the specific question. Write them as if the reader just got it wrong.
- Wrong options should be plausible. Trivially wrong distractors waste the pedagogical opportunity.
- Avoid questions where the answer is obvious from the question wording ("Which of the following is NOT a good practice for...").
- `correctIndex: 0` is permitted but should not be overused — readers learn to guess the first option if it's disproportionately correct.

---

### 4.4 `compare`

**Purpose:** Side-by-side comparison of 2 or 3 items across multiple attributes. Good for "Option A vs Option B", format comparisons, or before/after analysis.

**schemaVersion required:** 2+

```json
{
  "type": "compare",
  "title": "Petit groupe vs grande audience",
  "items": [
    { "id": "small", "label": "Petit groupe (3-15)" },
    { "id": "large", "label": "Grande audience (100+)" }
  ],
  "attributes": [
    {
      "id": "voice",
      "label": "Voix",
      "values": [
        "Conversationnelle, volume normal",
        "Porte loin, variations très marquées"
      ]
    },
    {
      "id": "energy",
      "label": "Énergie",
      "values": [
        "Niveau baseline",
        "Nettement au-dessus du baseline"
      ]
    }
  ]
}
```

#### Fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `type` | `"compare"` | yes | |
| `title` | string | no | Block heading. |
| `items` | array | yes | 2 or 3 items. The `items` array length must exactly equal the length of every `values` array in `attributes`. |
| `attributes` | array | yes | 2–8 attributes. |

#### Item fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes | Unique within this block. Short slug. |
| `label` | string | yes | Column header. Keep short: 2–5 words. |
| `sublabel` | string | no | Secondary label shown below the main label. Useful for units or qualifiers. |

#### Attribute fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes | Unique within this block. |
| `label` | string | yes | Row label. 1–4 words. |
| `values` | array of string | yes | One value per item, in the same order as `items`. Must have exactly the same length as `items`. |

#### Authoring conventions

- Use compare for content where the contrast **is** the insight. If the comparison is obvious, skip it.
- Items should be structurally parallel (same category of thing). Comparing "a hammer" with "on Tuesday" is invalid; comparing "a hammer" with "a screwdriver" is valid.
- Values should be comparably sized across items. A 50-word value in column A next to a 5-word value in column B breaks the table visually.
- 3-item compare blocks are valid and useful for "small / medium / large" or "before / during / after" structures.

---

### 4.5 `timeline`

**Purpose:** Ordered sequence of events or steps. Good for processes, historical progressions, preparation sequences, and any content where order is the core structure.

**schemaVersion required:** 2+

```json
{
  "type": "timeline",
  "title": "Une bonne préparation sur une semaine",
  "events": [
    {
      "id": "ev1",
      "marker": "7 jours avant",
      "title": "Première répétition à voix haute",
      "description": "Présentation complète à voix haute, debout. Notez les passages qui ne tiennent pas."
    },
    {
      "id": "ev2",
      "marker": "5 jours avant",
      "title": "Enregistrement",
      "description": "Répétition enregistrée. Ne pas réécouter le jour même."
    }
  ]
}
```

#### Fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `type` | `"timeline"` | yes | |
| `title` | string | no | Block heading. |
| `events` | array | yes | 2–8 events. |

#### Event fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes | Unique within this block. Convention: `ev<n>`. |
| `marker` | string | yes | The label on the timeline axis: date, step number, phase name. Keep short: 1–5 words. |
| `title` | string | yes | Event title. 3–8 words. |
| `description` | string | no | 1–3 sentences elaborating on the event. |

#### Authoring conventions

- Use `marker` for the axis label (time, step number, phase), not for the event name itself. The `title` carries the event name.
- Keep the sequence count under 8. More than 8 events compress poorly on mobile and should be split across a text block + a shorter timeline.
- All events should be at the same level of granularity. Mixing "one day" steps with "one year" steps in the same timeline confuses the reader.

---

### 4.6 `reveal`

**Purpose:** A progressive SVG reveal — a diagram that builds step by step as the reader taps through. Use for anatomical diagrams, system architectures, process flows, or any visual where the "builds up piece by piece" structure aids understanding.

**schemaVersion required:** 3+

```json
{
  "type": "reveal",
  "title": "Structure racinaire d'une plante en pot",
  "caption": "Chaque zone joue un rôle différent dans l'absorption.",
  "svg": "<svg viewBox=\"0 0 400 300\" xmlns=\"http://www.w3.org/2000/svg\"><g><!-- always visible base --></g><g data-step=\"1\"><!-- revealed at step 1 --></g><g data-step=\"2\"><!-- revealed at step 2 --></g></svg>",
  "steps": [
    { "id": "s1", "label": "Zone apicale — absorption active" },
    { "id": "s2", "label": "Zone de maturation — transport vers la tige" }
  ]
}
```

#### Fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `type` | `"reveal"` | yes | |
| `title` | string | no | Block heading. |
| `caption` | string | no | Caption below the SVG. |
| `svg` | string | yes | Inline SVG. Groups with `data-step="N"` are initially hidden; they appear when the reader reaches step N. Groups without `data-step` are always visible. |
| `steps` | array | yes | 2–6 steps. Must match the number of distinct `data-step` values in the SVG. |

#### Step fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes | Unique within this block. Convention: `s<n>`. |
| `label` | string | yes | Shown as the step label when that step is active. 3–10 words. |

#### SVG conventions

- Use `data-step="1"`, `data-step="2"`, etc. (1-based). There is no `data-step="0"` — step-0 content is simply content without a `data-step` attribute (always visible).
- All `<g>` elements with a given `data-step` value reveal simultaneously when that step is reached.
- SVG colors should use `currentColor` or hardcoded values appropriate for a dark background. The app renders SVGs on a dark surface.
- Keep SVG file sizes reasonable: under 20 KB inline. Complex SVGs should be hosted as image assets instead.

---

### 4.7 `image`

**Purpose:** A static image asset hosted in the content repo. Use for photographs, diagrams, screenshots, illustrations, and any visual content that doesn't benefit from progressive reveal.

**schemaVersion required:** 3+

```json
{
  "type": "image",
  "src": "assets/indoor-gardening/early-blight.jpg",
  "alt": "Feuille de tomate présentant des taches circulaires brunes avec des anneaux concentriques caractéristiques du mildiou précoce.",
  "caption": "Mildiou précoce — les taches concentriques distinguent cette maladie de la brûlure bactérienne.",
  "aspectRatio": 1.5
}
```

#### Fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `type` | `"image"` | yes | |
| `src` | string | yes | Path relative to the content repo root. Must start with `assets/`. Must not contain `..` or `http(s)://`. The app validates this before fetching. |
| `alt` | string | yes | Accessibility text. See conventions below. |
| `caption` | string | no | Short caption shown below the image. Sentence case. |
| `aspectRatio` | number | no | Width ÷ height. Defaults to 4:3 (1.333) if omitted. Set explicitly to prevent layout shift before the image loads. |

#### Image file specs

- Format: JPEG for photographs and complex illustrations. PNG for diagrams with transparency or sharp edges.
- Max dimensions: 1200 × 1200 px. Larger images waste bandwidth on mobile.
- File size target: under 300 KB per image. JPEG quality 75–85 is usually sufficient.
- Naming: `assets/<module-id>/<lesson-id>-<slug>.<ext>`. Example: `assets/indoor-gardening/l03-yellowing-leaves.jpg`.

#### Alt text conventions

- Describe what is depicted, not what it means or why it matters. The caption handles meaning.
- Include specifics: colors, shapes, quantity, spatial relationships. "Three brown spots on the underside of a leaf near the petiole" beats "leaf with disease symptoms".
- Do not begin with "Image of" or "Picture of" — screen readers prefix this.
- Length: 1–3 sentences. Complete sentences.
- Write in the lesson's language.

---

### 4.8 `scenario`

**Purpose:** Case-study questions. A shared context passage is shown above a set of questions. Good for applied comprehension, professional judgment exercises, and anything requiring a situation to be set up before the question makes sense.

**schemaVersion required:** 3+

```json
{
  "type": "scenario",
  "title": "Cas pratique",
  "context": "Marc présente les résultats trimestriels à son comité de direction (8 personnes, salle de réunion, 45 minutes). Il a préparé 42 slides. À la slide 15, il remarque que deux membres consultent leur téléphone.",
  "questions": [
    {
      "id": "ps-l09-sc1",
      "stem": "Quelle est la cause probable du décrochage à la slide 15?",
      "options": [
        "42 slides est trop pour 45 minutes; Marc est en retard sur son plan.",
        "Les membres ne sont pas intéressés par les résultats.",
        "La salle est trop petite.",
        "Marc ne projette pas sa voix assez fort."
      ],
      "correctIndex": 0,
      "explanation": "42 slides pour 45 minutes (< 1 min/slide) est objectivement trop dense. Un format sain pour ce type de réunion est 10–15 slides maximum, avec du temps pour la discussion. Le décrochage à la slide 15 (déjà un tiers du chemin mais à peine 8 minutes) est le signal que le rythme est insoutenable."
    }
  ]
}
```

#### Fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `type` | `"scenario"` | yes | |
| `title` | string | no | Block heading. |
| `context` | string | yes | The case description, rendered as Markdown above the questions. 3–10 sentences. |
| `questions` | array | yes | 1–4 questions. Same structure as quiz questions. |

#### Question fields

Identical to quiz question fields: `id`, `stem`, `options`, `correctIndex`, `explanation`.

#### Authoring conventions

- The context should contain enough information to answer the question without requiring outside knowledge.
- Questions should test judgment or application, not memorization. If the question can be answered without the context, it should be a quiz question instead.
- Keep context concise. A five-sentence case study with one well-chosen question is better than a ten-sentence case study with four generic questions.
- Contexts and questions are in the same language as the lesson.

---

### 4.9 `audio`

**Purpose:** An inline audio player for a hosted MP3. Use for content where sound is the teaching medium: musical examples, pronunciation exercises, listening comprehension, perceptual training.

**schemaVersion required:** 5+

```json
{
  "type": "audio",
  "audioUrl": "https://mdauz.github.io/microlearn-content/assets/djing/l04-beatmatch-before.mp3",
  "caption": "Deux morceaux à 128 BPM avant beatmatch — les kicks se croisent en flanging.",
  "alt": "Extrait de 30 secondes de deux morceaux non alignés, avec un effet de flanging audible sur les kicks.",
  "duration": 30
}
```

#### Fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `type` | `"audio"` | yes | |
| `audioUrl` | string | yes | Absolute HTTPS URL to a hosted MP3. In practice, always points to the GitHub Pages URL for this repo: `https://<owner>.github.io/<repo>/assets/<module-id>/<filename>.mp3`. |
| `caption` | string | yes | Shown below the player. Explains what the reader is listening for. Sentence case, in the lesson's language. 5–25 words. |
| `alt` | string | yes | Accessibility text for users who cannot hear the audio. Describes what the audio contains, not why it matters. |
| `duration` | integer | yes | Duration in seconds. Used by the player for the total-duration display before the file loads. Must match the actual file duration within 1 second. |

#### Audio file specs

- Format: MP3.
- Bitrate: 128 kbps stereo for musical content. 96 kbps mono is acceptable for spoken content (language, pronunciation).
- Duration: individual clips SHOULD be under 60 seconds. If a concept requires longer audio, split it into multiple sequential blocks with intervening text.
- File size target: under 1 MB per clip. A 45-second 128 kbps stereo MP3 is approximately 720 KB.
- Peak level: normalize to −3 dBFS. Consistent levels prevent surprise loud playback.
- Strip ID3 tags before commit (no artist metadata, no album art).
- Naming: `assets/<module-id>/<lesson-id>-<slug>.mp3`. Example: `assets/djing/l04-beatmatch-before.mp3`.

#### Authoring conventions

**Tell the reader what to listen for, before the audio plays.** The preceding text block should name the specific thing the reader should perceive. Audio blocks are perceptual training, and perception requires priming.

Wrong order (prose describes what the audio contained):
```json
[
  { "type": "text", "markdown": "Voici deux morceaux avant beatmatch:" },
  { "type": "audio", ... },
  { "type": "text", "markdown": "Comme vous l'avez entendu, les kicks se croisent en flanging." }
]
```

Right order (prose tells the reader what to listen for):
```json
[
  { "type": "text", "markdown": "Écoutez les deux prochains kicks. Ils sont au même tempo (128 BPM), mais un léger décalage de phase produit un **flanging** très reconnaissable sur les transients." },
  { "type": "audio", ... }
]
```

**Paired audio (before/after).** For comparisons, use two audio blocks with an intervening text block explaining what changed:
```json
[
  { "type": "audio", "caption": "Avant le beatmatch.", ... },
  { "type": "text", "markdown": "Maintenant, après ajustement du pitch de +2 centièmes..." },
  { "type": "audio", "caption": "Après le beatmatch.", ... }
]
```

Both clips should be the same length and normalized to the same peak level so the comparison is fair.

---

## 5. Asset hosting

### GitHub Pages setup

Assets are served from the content repo's GitHub Pages site. The URL pattern is:

```
https://<owner>.github.io/<repo-name>/assets/<module-id>/<filename>
```

For the current repo: `https://mdauz.github.io/microlearn-content/assets/...`

GitHub Pages is configured at: **Repo Settings → Pages → Source: Deploy from a branch → branch: `main`, folder: `/ (root)`**

### Folder structure

```
assets/
  <module-id>/
    <lesson-id>-<slug>.<ext>
```

Examples:
```
assets/
  indoor-gardening/
    l03-yellowing-leaves.jpg
    l07-root-anatomy-diagram.png
  djing/
    l04-beatmatch-before.mp3
    l04-beatmatch-after.mp3
    l08-key-mix-example.mp3
```

### Image specs summary

| Property | Target |
|---|---|
| Format | JPEG (photos), PNG (diagrams with transparency) |
| Max dimensions | 1200 × 1200 px |
| File size | < 300 KB |
| JPEG quality | 75–85 |
| Color space | sRGB |

### Audio specs summary

| Property | Target |
|---|---|
| Format | MP3 |
| Bitrate | 128 kbps stereo (music), 96 kbps mono (speech) |
| Max duration | 60 sec per clip |
| File size | < 1 MB |
| Peak level | −3 dBFS |
| Tags | Stripped (no ID3 metadata) |

---

## 6. Schema version history

The `schemaVersion` field in a module file indicates the minimum app version needed to render all blocks in that module correctly. The app reads any module at or below its supported maximum; modules at a higher schema version than the app supports are shown with a "please update the app" prompt.

### v1 (original)

Not explicitly versioned. Modules without a `schemaVersion` field, or with `schemaVersion: 1`, use only the original primitives.

**Blocks:** `text` (markdown only, no SVG), `flashcard`, `quiz`.

### v2 (wave 1)

**Blocks added:** `compare`, `timeline`.

Also: `text` blocks gained the optional `svg` and `caption` fields.

Modules using `compare` or `timeline` should declare `"schemaVersion": 2`.

### v3 (wave 2)

**Blocks added:** `reveal`, `image`, `scenario`.

These three blocks were introduced together. Modules using any of them should declare `"schemaVersion": 3`.

The `image` block (`src` as a content-repo-relative path) supersedes the inline `svg` field on `text` blocks for new content. The inline SVG approach is supported indefinitely but not recommended for new modules.

### v4 (illustration block)

This version number was reserved during development but the `illustration` block type was not shipped. No new block types were added at v4. The version exists in the history because the content schema documents reference it; in practice no modules need to declare `"schemaVersion": 4` unless they were authored during the v4 development window.

### v5 (audio block)

**Blocks added:** `audio`.

The `audio` block renders an inline audio player for hosted MP3 files. It enables content where listening is the teaching medium: DJing, language learning, music appreciation, and perceptual training exercises of any kind.

Modules using `audio` blocks must declare `"schemaVersion": 5`. App version required: Compound 1.x with `expo-audio` support.

---

## 7. Content and copyright

### Language

All lesson content is authored in the module's declared language. French modules use French throughout — lesson titles, block content, captions, quiz stems, explanations, alt text. Do not mix languages within a module.

### Audio copyright

Audio content must be one of:
- **Original recordings** (loops, mixes, demonstrations you produced yourself).
- **Public-domain material.**
- **Creative Commons licensed** with a license permitting educational use (CC-BY, CC-BY-SA, or more permissive).
- **Explicitly licensed** for the intended use.

Commercial music tracks — even short clips — must not be hosted on GitHub Pages without a license. The safest default is to produce reference audio yourself: simple loops at specific BPMs, in specific keys, demonstrating specific techniques. This gives maximum pedagogical control and eliminates licensing concerns.

### Image copyright

Same principle. Use original photographs, Creative Commons images, or images from public-domain sources. Do not use images scraped from Google Image Search without verifying the license.

### Health, legal, and mental-health-adjacent content

Modules covering topics with professional-scope implications (medical decisions, legal advice, mental health crisis response) must include a `disclaimer` field at the module level, directing the reader to qualified professionals when needed. The disclaimer is shown before the first lesson and is non-skippable.

The disclaimer language should be factual and specific, not generic boilerplate. Example:

```json
"disclaimer": "Ce module couvre des stratégies générales de gestion du stress. Il ne remplace pas un accompagnement par un professionnel de santé mentale. Si vous traversez une période difficile, consultez votre médecin ou un psychologue."
```
