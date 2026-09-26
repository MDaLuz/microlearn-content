# Molecule module template

The standard for every **molecule module** in Compound: one module per active substance, built the same way every time, so a learner who has done one molecule knows exactly where to find things in the next.

This document sits on top of [`SCHEMA.md`](SCHEMA.md). SCHEMA.md defines what valid JSON looks like; this document defines **what a molecule module says, where each fact comes from, and how it is phrased**. When the two disagree on JSON structure, SCHEMA.md wins.

---

## Contents

1. [Audience and voice](#1-audience-and-voice)
2. [Source hierarchy](#2-source-hierarchy)
3. [Module settings](#3-module-settings)
4. [Lesson blueprint](#4-lesson-blueprint)
5. [The trial card](#5-the-trial-card)
6. [Combination trials: the flag system](#6-combination-trials-the-flag-system)
7. [Jargon policy and master glossary](#7-jargon-policy-and-master-glossary)
8. [Numbers policy](#8-numbers-policy)
9. [Balance and non-promotional rules](#9-balance-and-non-promotional-rules)
10. [Workflow: batches, fact-check, validate](#10-workflow-batches-fact-check-validate)
11. [Pre-publish checklist](#11-pre-publish-checklist)
12. [Refresh policy](#12-refresh-policy)

---

## 1. Audience and voice

**The reader:** an intelligent professional who is not a clinician. Think business development, market access, finance, legal, regulatory operations, or a new starter in a pharma company. They need to *talk about* the medicine with confidence and to know where the facts come from. They do not prescribe it.

**What they should leave with, for every molecule:**

1. What it is and how it works, in one sentence each.
2. Exactly what it is approved for in the EU, and what it is *not* approved for.
3. How it is taken, in what strengths, and who needs a different dose.
4. What the key trials showed, in plain numbers, and which trials tested it **in combination** with other medicines.
5. The main side effects and interactions, and how safety is monitored after approval.
6. Where European cardiology guidelines place it.

**Voice:**

- High-level first, detail second. Each lesson opens with the one-line takeaway.
- Jargon is allowed, but it is always explained where it first appears (see §7).
- Short text blocks. One idea per block. Four to eight blocks per lesson, then flashcards and a quiz.
- Neutral and factual. We teach what the evidence says, including its limits. We never sell (see §9).

---

## 2. Source hierarchy

Every fact comes from a named source. When sources disagree, the higher one wins, and the disagreement is worth mentioning if it is instructive.

| Rank | Source | Use it for | Where |
|---|---|---|---|
| 1 | **SmPC** (Summary of Product Characteristics), current EU version | Indication, posology, contraindications, warnings, interactions, side-effect frequencies, strengths, composition, efficacy summary (5.1) | EMA medicine page → *Product information* |
| 2 | **PIL** (Package Leaflet) | How patients are told the same facts, in plain words. A good check for our own wording | Same PDF as the SmPC, after Annex III |
| 3 | **EPAR** (European Public Assessment Report) | History, the pivotal trial programme, how the regulator weighed benefit against risk, uncertainties, later indication extensions | EMA medicine page → *Assessment history* |
| 4 | **EU RMP summary**, PRAC outcomes, PSUSA outcomes, DHPCs | Pharmacovigilance: known and potential risks, missing information, signals, safety communications | EMA medicine page; PRAC meeting highlights |
| 5 | **Trial registers:** ClinicalTrials.gov (NCT…), EU CTIS (EU CT…), EU Clinical Trials Register (EudraCT…), WHO ICTRP | Design, population, background therapy, status, posted results. **The main tool for finding combination trials** | clinicaltrials.gov · euclinicaltrials.eu · clinicaltrialsregister.eu · trialsearch.who.int |
| 6 | **Primary publication** of the trial (peer-reviewed journal) | Final results when the register has none; subgroup data | Cited from the register or EPAR |
| 7 | **ESC / ESC-EAS guidelines** (latest full guideline and any focused update) | Place in therapy, Class of Recommendation, Level of Evidence | escardio.org → Guidelines |
| 8 | FDA label, Swissmedic information (swissmedicinfo.ch) | **Contrast only.** Where the US or Swiss label differs from the EU one in a way the reader should know | — |

**Nationally authorised molecules.** Older molecules (fenofibrate, rosuvastatin) were never authorised centrally, so they have no EMA EPAR and no EU-wide SmPC. For these:

- Rank 1 is one named **national SmPC**, stated in lesson 1. The first two modules used the Spanish text on AEMPS CIMA (cima.aemps.es), whose REST API also lists every authorised product, holder and marketing status.
- The **EPAR slot** is filled by what exists instead: the reference member state's public assessment report (e.g. the Dutch MEB PAR for Crestor), EMA referrals (Article 29 or 31), and the EPARs of any centrally authorised combination products (e.g. Cholib, Pravafenix).
- PSUSA outcomes on EMA's website still apply: they cover all nationally authorised products for the substance, and each combination has its own.

**Rules:**

- Record the **SmPC revision date** ("Date of revision of the text", section 10) in the disclaimer and in lesson 1. Everything in the module is "as of" that date.
- Register data and publications describe what a *trial* found. The SmPC describes what the *medicine is approved for*. Never let the first read as the second.
- Quote SmPC indication wording closely; it is precise for a reason. Summarise everything else in our own words.
- ESC guidelines and journal articles are copyrighted: summarise, never reproduce tables or figures.
- Switzerland is not in the EU. If the audience is Swiss, check whether the Swissmedic indication differs and say so in lesson 4.

---

## 3. Module settings

| Field | Value |
|---|---|
| `id` | the INN in kebab case — e.g. `fenofibrate`, `rosuvastatin`, `bempedoic-acid`. Asset folder uses the same id. |
| Lesson id prefix | a 3-letter code for the INN, e.g. `fen` → `fen-l01-at-a-glance` |
| `title` | the INN, e.g. "Rosuvastatin". The brand and country of the basis SmPC are named in lesson 1. |
| `discipline` | `"Medicines"` — the same for every molecule module, so they read as one series |
| `schemaVersion` | `4`, as for every current module |
| `levels` | omit |
| `disclaimer` | required (SCHEMA.md §7) — template below; placed just before `lessons` |
| Language | English unless the module is commissioned in another language; never mixed |

**Catalog entry:** `description` "What the label approves, and what the trials showed", `accentColor` `#1D9E75`, `lessonCount` 15 from the first batch onwards (the planned total, as for indemnification), `estimatedMinutes` about 135–150.

**Disclaimer template:**

> Educational summary of public regulatory and scientific sources (Spanish and EU product information and assessment reports, clinical trial registers, ESC/EAS guidelines), current as of the `<brand and strength>` SmPC revised in `<month year>`. This is not medical advice and not promotional material. Treatment decisions must follow the current official product information and a qualified healthcare professional.

**Block shapes** (as used by every module, see SCHEMA.md):

- Flashcards: one `flashcard` block per lesson, titled "Key terms", card ids `<lesson-id>-fc<n>`.
- Quizzes: one `quiz` block per lesson, titled "Check", question ids `<lesson-id>-q<n>`, `stem` + `options` + `correctIndex` + `explanation`.
- Comparison tables: `compare` with 2–3 `items` and labelled `attributes` rows. Give each row a label that says what the row compares ("Kidneys", "Duration"), and order each column's cells so that every row compares like with like. Don't repeat the row label inside the cells.
- No `audio` blocks.

---

## 4. Lesson blueprint

Fifteen lessons, always in this order. The titles used in the published modules are: 1 At a glance · 2 How it works · 3 History · 4 What it's approved for · 5 Strengths and products · 6 How it's taken · 7 Reading a clinical trial · 8 The pivotal trials · 9 🔗 Combination trials · 10 Heart-attack and stroke outcomes · 11 Side effects · 12 Who shouldn't take it, and interactions · 13 Pharmacovigilance · 14 Where the ESC guidelines place it · 15 One-page recap. The table below describes what each covers. Lessons marked *conditional* stay in the module even when there is little to say: a short lesson that says "no outcomes trial has reported yet, and here is why that matters" is valuable.

Every lesson ends with a **Sources** text block (see the end of this section) and, except lesson 15, a `flashcard` and a `quiz`.

| # | Lesson | Main sources | What it must cover | Suggested blocks |
|---|---|---|---|---|
| 01 | **`<Molecule>` at a glance** | SmPC 1–4.1, EPAR overview | One-screen identity card: INN, brand(s), company holding the licence (MAH), drug class, what it treats, how it is taken, EU approval date, black triangle ▼ yes/no, "as of" date | text ×3, flashcard, quiz |
| 02 | **How it works** | SmPC 5.1, 5.2, EPAR | Mechanism in one sentence, then a plain analogy, then what it means for the body. How it differs from the drugs it is most often combined with (e.g. statins, ezetimibe). Basic pharmacokinetics in plain words: once-daily or not, food, how long it lasts | text, `reveal` (mechanism diagram), text, `compare` (vs combination partners), flashcard, quiz |
| 03 | **From lab to label: the history** | EPAR procedural steps, EPAR assessment report, company/press only for discovery context | Discovery, development, first approval (EU and, for contrast, US), later indication extensions, any refusals, withdrawals or label restrictions | text, `timeline` (≤8 events), text, flashcard, quiz |
| 04 | **What it is approved for** | SmPC 4.1, EPAR | The EU indication, near-verbatim, then unpacked phrase by phrase ("adults with primary hypercholesterolaemia" = …). Which combinations are *named in the licence*. What it is **not** approved for. Notable differences from the US/Swiss label | text ×3, `compare` (EU vs US, or approved vs not approved), flashcard, quiz |
| 05 | **Strengths, forms and products** | SmPC 2, 3, 6; EMA product list | Every EU product containing the molecule: strengths, tablet/injection, pack, fixed-dose combinations (FDCs) and what they combine | text, `compare` (mono product vs FDC), flashcard, quiz |
| 06 | **How it is taken: posology** | SmPC 4.2, PIL section 3 | Standard dose, timing, with/without food, missed dose. Special populations: kidney, liver, elderly, children, pregnancy (brief — detail in 12) | text ×2, `compare` (standard vs special populations), `scenario`, flashcard |
| 07 | **Reading a clinical trial** | Master glossary (§7) | Short primer framed on this molecule's own trials: phases, randomised, placebo, double-blind, primary endpoint, surrogate vs hard endpoint, relative vs absolute effect. Identical definitions across all molecule modules | text ×3, flashcard (glossary terms), quiz |
| 08 | **The pivotal trials** | EPAR, SmPC 5.1, registers, publications | The trials the approval rests on, each as a **trial card** (§5) with its combination tag (§6). One-paragraph "what the programme showed as a whole" | text (programme overview), text × trial cards, `compare`, flashcard, quiz |
| 09 | **🔗 Combination trials** | Registers, SmPC 4.1/4.5/5.1, EPAR | See §6. Every trial where the molecule was given on top of, or together with, another lipid-lowering therapy — especially **statins** and **statin + ezetimibe**. Combination register, the 3-way `compare`, whether each combination is licensed, and interaction caveats | text, trial cards, `compare` (mono / +statin / +statin+ezetimibe), text (licensing & interactions), `scenario`, flashcard |
| 10 | **Outcomes: does it prevent heart attacks and strokes?** *(conditional)* | Outcomes trial register entry + publication, EPAR/variation, SmPC 5.1 | Surrogate endpoint (e.g. LDL-C) vs hard outcomes (MACE). The outcomes trial as a trial card, result in absolute and relative terms. If none has reported: which one is running, when it reads out, and why it matters | text ×3, trial card, flashcard, quiz |
| 11 | **Side effects** | SmPC 4.8, PIL section 4 | Frequency categories explained, then the side effects by category. Which are expected from the mechanism. Lab changes. What patients are told to watch for | text, `compare` (very common / common / uncommon+), text, flashcard, quiz |
| 12 | **Who should not take it, and interactions** | SmPC 4.3, 4.4, 4.5, 4.6 | Contraindications, warnings, pregnancy/breastfeeding, interactions — **always including the statin and ezetimibe interaction lines** and any dose caps they impose | text ×3, `scenario`, flashcard, quiz |
| 13 | **Pharmacovigilance: safety after approval** | RMP summary, Annex II, PRAC/PSUSA outcomes, DHPCs, SmPC 4.8 reporting text | What pharmacovigilance is. Black triangle. The RMP's important identified risks, potential risks and missing information. PSURs. Any signals, label changes or safety communications since approval. How side effects are reported | text ×3, `timeline` (safety events, if any), flashcard, quiz |
| 14 | **Place in therapy: the ESC guidelines** | ESC/EAS guideline + focused updates | The treatment ladder the guideline describes, and where this molecule sits. Class of Recommendation and Level of Evidence explained, with the actual rating. What the guideline says about the combinations from lesson 9 | text, `reveal` (treatment ladder), text, flashcard, quiz |
| 15 | **`<Molecule>` in one page** | All of the above | The six takeaways from §1 as a recap, then an integrative `scenario` spanning indication, combination, interaction and safety | text, `scenario` (2–3 questions) |

**Sources block** — the last block of every lesson, always this format:

```json
{
  "type": "text",
  "markdown": "## Sources\n\n1. **SmPC** — <Brand> <strength>, AEMPS CIMA <number>, revision <Month YYYY>. Sections 4.2, 5.2.\n2. **EPAR** — <product>, EMEA/H/C/<number>.\n3. **Journal** — <Author> et al. <Trial>. *<Journal>* <year>;<vol>:<pages>. <NCT number>."
}
```

The bold label names the source type: SmPC, PIL, EPAR, EPAR-level (referrals, national assessment reports), Pharmacovigilance, Registers, Journal, ESC guidelines, US (differences only). Sources blocks are exempt from the jargon rule.

**Lesson 15** is a recap: two text blocks with bold paragraph labels ("What it is.", "Safety."), then one quiz block of three questions. **The recap questions must be new**, not reworded versions of earlier lessons' quizzes; they should join facts from two or more lessons.

**Size target:** 15 lessons, 120–150 minutes, `xpReward` 45–60 per lesson (lesson 15: 50).

---

## 5. The trial card

Every trial the module discusses is presented as a trial card: one `text` block, always the same fields in the same order, so the reader learns the format once.

```markdown
### Trial card: <ACRONYM>
Tag: <one tag from the module's tag set>

- Registry: <NCT… / ISRCTN… / EudraCT…, or "not found in this search">
- Who took part: <N> <population in plain words>, <key entry criterion>
- Background therapy: <what everyone was already taking — this is what the tag summarises>
- Compared with: <placebo / active drug>; <duration>
- Main question: <the primary endpoint, in plain words>
- Headline result: <numbers, with comparator and time point; relative and absolute>
- In plain words: <one or two sentences a non-clinician can repeat>
- Worth knowing: <limitation, safety finding, or why this trial matters>
```

Rules:

- The heading starts `### Trial card:`, the next line is `Tag:`, and the eight fields follow in this order. `scripts/validate-module.mjs --molecule` checks all three.
- Fields are a bullet list: the app's Markdown renderer joins consecutive plain lines into one paragraph.
- Check every registry number against ClinicalTrials.gov, and the publication's own "ClinicalTrials.gov identifier" line where there is one. A trial whose arms look right can still be a different trial (rosuvastatin lesson 9 had this).
- Give the confidence level the paper uses: non-inferiority trials often report 90% intervals, not 95%.
- **Status** is one of: *Recruiting · Active, not recruiting · Completed · Terminated · Withdrawn*, followed by the results state. Trials that ended early say why.
- If a trial has **no posted or published results**, it still gets a card. The headline result then reads "Not yet reported (primary completion <date>)".
- A trial the regulator relied on for approval is marked "pivotal" in *Worth knowing*.
- If the register and the publication disagree (e.g. on N), use the publication and say so in *Worth knowing*.

---

## 6. Combination trials: the flag system

This is the part of the module we care about most for lipid-lowering molecules: **what happens when the molecule is added to a statin, or to a statin plus ezetimibe.**

### 6.1 Combination tags

Every trial card carries exactly one tag, on the `Tag:` line under its heading. Tags describe the **background therapy** — what patients were already on when the molecule (or placebo) was added, plus any lesson 9 partner given by design.

Each module defines its tag set in lesson 7, in a text block headed `## The combination tags`, one `- <tag>: <meaning>` bullet per tag. The validator reads that block and rejects any card whose tag isn't in it. The base set below suits a medicine added to lipid therapy; a statin module swaps in its own partners (rosuvastatin uses `🔗 +EZE`, `🔗 +EZE+PCSK9`, `🔗 +EZE+BEMP`, `🔗 +ASA`, `🔗 +SGLT2`, `🔗 +ANTIHTN`, `🔗 FDC`, `🔗 MIXED`, `STATIN-INTOLERANT`, `MONO`).

| Tag | Meaning |
|---|---|
| `🔗 +STATIN` | Added on top of a statin (state intensity: maximally tolerated / high-intensity / any) |
| `🔗 +STATIN+EZE` | Added on top of a statin **and** ezetimibe |
| `🔗 +EZE` | Added on top of ezetimibe without a statin (usually statin-intolerant patients) |
| `🔗 FDC` | Tests a fixed-dose combination product (two drugs in one tablet) |
| `🔗 MIXED` | Background therapy varied between patients; subgroups reported where available |
| `STATIN-INTOLERANT` | Patients who cannot take a statin, or only a very low dose; no ezetimibe requirement |
| `MONO` | The molecule alone vs placebo or another drug, no background lipid-lowering therapy |

The 🔗 marks every combination trial so it is visible when scrolling. Molecules outside cardiology use the same system with their own partner drugs (e.g. `🔗 +METFORMIN`), defined in their lesson 7 tag block.

### 6.2 What lesson 9 must contain

1. **Combination register** — a text block listing every combination trial found in the registers, one line each: acronym · tag · registry ID · phase · N · status · results yes/no. Include ongoing and unpublished trials. This is the "complete picture"; trial cards are then written for the important ones.
2. **Trial cards** for every combination trial that is pivotal, in the SmPC 5.1, or in the ESC guideline — at minimum one per tag that exists.
3. **The three-way comparison** — a `compare` block, always these three columns:

   | | Molecule alone | + statin | + statin + ezetimibe |
   |---|---|---|---|
   | Key trials | | | |
   | Who was studied | | | |
   | Extra LDL-C lowering vs placebo | | | |
   | Named in the EU licence? | | | |
   | Interaction caveat | | | |

   If a column has no trial, the value says "No dedicated trial" — the gap is information.
4. **Licensing** — is each combination named in SmPC 4.1? Quote the relevant phrase.
5. **Interactions in combination** — the SmPC 4.5 lines for statins and ezetimibe (e.g. statin dose caps, monitoring advice), in plain words.
6. **FDCs** — if a fixed-dose combination product exists, what it combines, which trials support it (bioequivalence and/or factorial trials), and when it is used instead of the separate tablets.
7. A `scenario` block applying the above to a patient on a statin and ezetimibe.

### 6.3 How to find them

- ClinicalTrials.gov: search the INN in *Intervention*, then read each study's **Arms and Interventions** and **Eligibility** for statin/ezetimibe requirements. The API is fastest: `https://clinicaltrials.gov/api/v2/studies?query.intr=<INN>&pageSize=1000`. Filter to studies whose intervention names include a partner, and list the ones not yet in the register with their status and phase.
- Report status exactly as the registry shows it today ("unknown" included). Registries go stale; a published trial can still show "unknown", and a "recruiting" trial may have finished.
- Scan arms, interventions and eligibility text for: `statin`, `atorvastatin`, `rosuvastatin`, `simvastatin`, `pravastatin`, `pitavastatin`, `fluvastatin`, `lovastatin`, `ezetimibe`, `background`, `maximally tolerated`, `lipid-lowering therapy`, `LLT`.
- Cross-check the EU registers (CTIS and the EU Clinical Trials Register) for European trials missing from ClinicalTrials.gov.
- Cross-check the EPAR's list of studies: it is the regulator's own inventory of the pivotal programme.

---

## 7. Jargon policy and master glossary

**Rule:** a technical term may be used as soon as it is explained, and it is explained **where it first appears**, in the same sentence:

> **LDL-C** (the "bad" cholesterol measured in a standard blood test) fell by…

Heavier terms get a **Jargon buster** blockquote right after the paragraph that uses them:

> **Jargon buster — hazard ratio.** A way of comparing how often an event happened in two groups over time. 0.80 means the event happened about 20% less often in the treated group. 1.00 means no difference.

- No more than three new bold terms per text block. Sources blocks and the recap lesson's paragraph labels don't count.
- Every lesson's flashcard block covers that lesson's key new terms.
- Use the **master glossary** wording below so the same term reads the same in every molecule module. Add to this list when a new molecule needs a new term.

### Master glossary

**Regulatory**

| Term | Plain-language definition |
|---|---|
| INN | International Nonproprietary Name — the generic scientific name of the active substance, the same worldwide (e.g. "ezetimibe", as opposed to a brand name). |
| EMA | European Medicines Agency — the EU body that assesses medicines; the European Commission then grants the licence. |
| CHMP | The EMA committee that gives the scientific opinion on whether a medicine should be approved. |
| PRAC | The EMA committee responsible for monitoring medicine safety after approval. |
| Marketing authorisation (MA) | The licence to sell a medicine. In the EU, a centralised MA is valid in every member state. |
| MAH | Marketing authorisation holder — the company legally responsible for the medicine. |
| SmPC | Summary of Product Characteristics — the official, legally binding description of a medicine for healthcare professionals. |
| PIL | Package leaflet — the patient version of the SmPC, found inside the box. |
| EPAR | European Public Assessment Report — the EMA's published explanation of why it approved a medicine. |
| Indication | The disease and patient group a medicine is approved to treat. |
| Off-label | Use outside the approved indication, dose or population. Legal for doctors in some circumstances, but never promoted and not covered by the approval. |
| Posology | How much of a medicine to take, how often, and for how long. |
| Contraindication | A situation where the medicine must not be used. |
| Extension of indication | A later approval that widens who the medicine can be used for. |
| Black triangle ▼ | Marks medicines under additional monitoring, usually because they are new; reporting of any suspected side effect is especially encouraged. |

**Clinical trials**

| Term | Plain-language definition |
|---|---|
| Phase 1 / 2 / 3 / 4 | 1: first in humans, safety and dosing, small groups. 2: does it work, what dose, hundreds of people. 3: large confirmatory trials the approval rests on. 4: studies after approval. |
| Randomised controlled trial (RCT) | Patients are assigned by chance to the drug or a comparator, so the groups are alike except for the treatment. |
| Placebo | A dummy treatment that looks identical to the real one, so any difference is due to the drug itself. |
| Double-blind | Neither patients nor doctors know who gets the real drug, which prevents expectations from colouring the results. |
| Primary endpoint | The single main question the trial was designed to answer, fixed in advance. |
| Surrogate endpoint | A measurement that predicts disease, like LDL-C in a blood test, used because it changes faster than events like heart attacks. |
| Hard endpoint / clinical outcome | An event that matters directly to the patient: heart attack, stroke, death. |
| MACE | Major adverse cardiovascular events — a combined count of events such as heart attack, stroke and cardiovascular death. Definitions vary by trial. |
| Background therapy | The treatment all patients in a trial were already taking before the study drug or placebo was added. |
| Add-on trial | A trial where the study drug is given on top of existing therapy. |
| Pivotal trial | A trial the regulator relied on to decide on approval. |
| Relative risk reduction | How much the risk fell compared with the control group, as a percentage of the control group's risk. |
| Absolute risk reduction | The actual difference in percentage points between the groups; usually much smaller than the relative figure. |
| Hazard ratio (HR) | Compares how often an event happened in two groups over time; 0.80 means about 20% less often. |
| Confidence interval (CI) | The range within which the true effect probably lies. If it crosses 1.0 (for a ratio) the result may be due to chance. |
| p-value | How likely a result at least this strong would be if the drug did nothing. Below 0.05 is conventionally called "statistically significant". |
| Statistically significant vs clinically meaningful | The first means unlikely to be chance; the second means large enough to matter to patients. They are not the same. |

**Lipids and cardiology**

| Term | Plain-language definition |
|---|---|
| LDL-C | Low-density lipoprotein cholesterol, the "bad" cholesterol; the main target of lipid-lowering treatment. |
| Hypercholesterolaemia | Too much cholesterol in the blood. *Primary* = caused by genes or diet rather than another disease. |
| HeFH | Heterozygous familial hypercholesterolaemia — an inherited condition causing very high LDL-C from birth. |
| ASCVD | Atherosclerotic cardiovascular disease — disease caused by fatty plaques in the arteries (heart attack, stroke, narrowed leg arteries). |
| Statin | The first-choice class of cholesterol-lowering drug; reduces the liver's cholesterol production. |
| Ezetimibe | A drug that reduces cholesterol absorption from the gut; the usual second step after a statin. |
| Maximally tolerated statin dose | The highest statin dose a patient can take without unacceptable side effects — which may be lower than the maximum licensed dose. |
| Statin intolerance | Inability to take a statin, or an adequate dose, because of side effects (usually muscle symptoms). |
| Fixed-dose combination (FDC) | Two active substances in one tablet. |
| Class of Recommendation (I, IIa, IIb, III) | How strongly a guideline recommends something. I = recommended; IIa = should be considered; IIb = may be considered; III = not recommended. |
| Level of Evidence (A, B, C) | How strong the supporting data are. A = several randomised trials or a meta-analysis; B = one randomised trial or large non-randomised studies; C = expert consensus or small studies. |

**Safety**

| Term | Plain-language definition |
|---|---|
| Adverse event vs adverse drug reaction | An adverse event is anything bad that happens during treatment; an adverse drug reaction is one the medicine is reasonably thought to have caused. |
| Frequency categories | Very common ≥ 1 in 10 · common 1 in 100 to 1 in 10 · uncommon 1 in 1,000 to 1 in 100 · rare 1 in 10,000 to 1 in 1,000 · very rare < 1 in 10,000 · not known. |
| Pharmacovigilance | The science and activities of detecting, assessing and preventing side effects once a medicine is in use. |
| RMP | Risk management plan — the company's plan, agreed with the EMA, describing known and potential risks and how they are monitored and minimised. |
| Important identified / potential risk; missing information | RMP categories: risks shown to be caused by the drug; risks suspected but not proven; groups or questions not studied enough (e.g. pregnancy). |
| PSUR / PSUSA | Periodic safety update report — regular safety review submitted by the company; PSUSA is the EMA's assessment of it, which can lead to label changes. |
| Signal | New information suggesting a possible new side effect, or a change in a known one, that needs investigating. |
| DHPC | Direct healthcare professional communication — a letter to doctors about an important new safety issue. |
| EudraVigilance | The EU database of suspected side-effect reports. |

---

## 8. Numbers policy

- **Always give the comparator and time point**: "LDL-C fell 18% more than with placebo at 12 weeks" — never just "LDL-C fell 18%".
- **Relative and absolute together** for outcomes: "13% fewer major cardiovascular events (relative); 11.7% vs 13.3% of patients over about 3.4 years (absolute)".
- **Translate one number per trial** into a concrete picture: "for someone starting at 3.0 mmol/L, that's about 0.5 mmol/L lower".
- **Units:** mmol/L first, mg/dL in parentheses on first use in a lesson.
- **Placebo-adjusted** effects are the default; say so when a figure is not placebo-adjusted.
- **Never compare numbers across different trials** as if they were head-to-head. If the reader will be tempted to, say explicitly that the trials were different.
- Round sensibly in prose (18%, not 17.8%), except where the source figure is the point, such as a trial card headline.

---

## 9. Balance and non-promotional rules

These modules may be read by people in the industry, so they must stay on the right side of the line between education and promotion.

- **No superlatives or marketing words:** not "best", "breakthrough", "safest", "powerful", "game-changer", "well tolerated" (use the SmPC's actual frequencies instead).
- **Benefit and risk in the same proportion** as the SmPC and EPAR present them.
- **Uncertainties are content.** The EPAR's "uncertainties" and the RMP's "missing information" belong in the module.
- **Off-label is never framed as an option.** It is mentioned only to make clear what is *not* approved.
- **No brand favouritism** when several products contain the molecule; list them all.
- Company press releases may be used only for history (dates, discovery), never for efficacy or safety claims.

---

## 10. Workflow: batches, fact-check, validate

Each molecule is written in five batches of three lessons (1–3, 4–6, 7–9, 10–12, 13–15; lesson 9 may get a batch of its own). Every batch goes through the same steps before it is pushed:

1. **Pre-flight.** The content repo is clean, and the module has exactly the lessons the batch expects.
2. **Fact-check against the primary sources**, not memory:
   - SmPC and PIL text on CIMA (the Spanish REST API returns every product, holder and marketing status);
   - EMA pages for EPARs, referrals and PSUSA outcomes;
   - ClinicalTrials.gov API v2 for every registry number and status;
   - PubMed abstracts (E-utilities) for trial figures; the abstract usually names the registry number too.
   Correct anything that doesn't match, and report each correction. If a figure can't be verified, drop the number rather than keep it unsourced.
3. **Convert** to the block shapes in §3, and give comparison tables row labels that compare like with like.
4. **Validate:** `node scripts/validate-module.mjs modules/<id>.json --molecule`. Before the last batch the only expected error is `lessonCount` 15 against the lessons written so far.
5. **Commit and push**, bumping `version` in both the module file and its catalog entry.

---

## 11. Pre-publish checklist

**Accuracy**
- [ ] SmPC revision date in the disclaimer and lesson 1
- [ ] Every number traceable to a named source in the lesson's Sources block
- [ ] Indication wording checked against the current SmPC 4.1
- [ ] Side-effect frequencies match SmPC 4.8 and the PIL
- [ ] The statin and ezetimibe interaction lines (or their absence) from SmPC 4.5 are in lessons 9 and 12
- [ ] Every registry number and status checked on ClinicalTrials.gov within the last month

**Combination coverage**
- [ ] Register searched and the date recorded in the lesson 9 register list
- [ ] Every combination trial listed, including ongoing and unpublished ones
- [ ] Every trial card carries exactly one tag from the module's tag set
- [ ] Three-way `compare` block present, with "No dedicated trial" where applicable
- [ ] Licensed vs studied-but-not-licensed combinations clearly distinguished

**Readability**
- [ ] Every jargon term explained on first use, with master glossary wording
- [ ] No text block introduces more than three new bold terms (Sources blocks and the recap are exempt)

**No redundancy**
- [ ] No flashcard front or quiz question appears twice in the module (the validator checks exact repeats)
- [ ] The lesson 15 questions are new, not reworded earlier quizzes (check by reading)
- [ ] No comparison table repeats another lesson's (the validator warns on identical columns)

**Balance**
- [ ] No words from the §9 banned list
- [ ] Uncertainties and missing information included
- [ ] No cross-trial comparisons presented as head-to-head

**Structure**
- [ ] 15 lessons in blueprint order; every lesson ends with a `## Sources` block
- [ ] Module-level `disclaimer` present
- [ ] Validator passes with `--molecule`: 0 errors
- [ ] Catalog entry has `lessonCount` 15 and the same `version` as the module file

---

## 12. Refresh policy

Medicines change after approval. Each molecule module is re-checked:

- **Every 6 months**, and
- **Immediately** when: the SmPC is revised, an indication is extended, an outcomes trial reports, a PSUSA for the substance or one of its combinations ends with a variation, PRAC issues a signal outcome or DHPC, or a new ESC guideline or focused update is published.

A refresh means: re-read the SmPC revision date; check EMA for new PSUSAs, referrals and variations; re-query the registers for new or completed combination trials; update the lessons and the "as of" date in the disclaimer and lesson 1; bump `version` in the module file and the catalog.
