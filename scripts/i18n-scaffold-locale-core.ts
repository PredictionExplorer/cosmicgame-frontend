/**
 * Generates every per-locale FILE a new language needs (docs/i18n/README.md
 * §10), so that "add a language" starts from `npm run i18n:scaffold` and the
 * compiler, not from a checklist of paths to create by hand:
 *
 *   messages/<locale>/*.json                copies of the source catalogs
 *   content/**\/<stem>.<locale>.ts           copies of the source copy modules,
 *                                           identifiers renamed (`faqTextEn` → `faqTextKo`)
 *   scripts/terminology/<locale>.ts          empty drift-rule pack
 *   e2e/<locale>-smoke.spec.ts               the shared smoke runner
 *   e2e/<locale>-site-qa.desktop.spec.ts     the shared site-QA runner (Latin font defaults)
 *   docs/i18n/{glossary,style-guide,progress}-<locale>.md
 *                                           templates with the section structure the
 *                                           other locales use; the progress tracker is
 *                                           pre-filled with the real catalog key counts
 *
 * Everything written here is a starting point, not copy: catalogs and modules
 * still read as the source language, which `npm run i18n:strict` reports as
 * UNTRANSLATED until each is rewritten. The registries the compiler enforces
 * (`LocaleRecord`s, `Record<TranslatedLocale, …>`) are deliberately NOT
 * edited by this command — `npm run type-check` lists them, each next to the
 * decision it needs. Kept apart from the CLI so it can run against a
 * fixture tree under test.
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative } from 'node:path';

import { routing } from '../i18n/routing';

import { flattenMessages, isPlainObject } from './i18n-parity-core';
import { identifierSuffix, localeModuleName, renameIdentifiers } from './locale-identifiers';

export interface ScaffoldOptions {
  /** Repository root (or a fixture tree with the same layout). */
  readonly root: string;
  /** Canonical BCP 47 tag of the new locale (`ko`, `pt-BR`). */
  readonly locale: string;
  /** Locale whose files are copied; the default locale unless a sibling variant fits better. */
  readonly source?: string;
  /** Replace files that already exist (default: skip them). */
  readonly overwrite?: boolean;
}

export interface ScaffoldResult {
  /** Root-relative paths written. */
  readonly written: readonly string[];
  /** Root-relative paths left untouched because they existed. */
  readonly skipped: readonly string[];
}

/** Why `locale` cannot be scaffolded, or `undefined` when it can. */
export function scaffoldLocaleProblem(locale: string): string | undefined {
  let canonical: string | undefined;
  try {
    canonical = Intl.getCanonicalLocales(locale)[0];
  } catch {
    return `"${locale}" is not a BCP 47 language tag`;
  }
  if (canonical !== locale) {
    return `"${locale}" is not canonical; write it as "${canonical}"`;
  }
  if ((routing.locales as readonly string[]).includes(locale)) {
    return `"${locale}" is already a routing locale`;
  }
  return undefined;
}

/** English name and autonym of the language, from CLDR (`Korean` / `한국어`). */
export function languageNames(locale: string): { english: string; autonym: string } {
  const english = new Intl.DisplayNames(['en'], { type: 'language' }).of(locale) ?? locale;
  const autonym = new Intl.DisplayNames([locale], { type: 'language' }).of(locale) ?? english;
  return { english, autonym };
}

function walk(dir: string, out: string[]): void {
  for (const entry of readdirSync(dir)) {
    if (entry === '__tests__') continue;
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) walk(path, out);
    else out.push(path);
  }
}

class Writer {
  readonly written: string[] = [];
  readonly skipped: string[] = [];

  constructor(
    private readonly root: string,
    private readonly overwrite: boolean,
  ) {}

  write(relativePath: string, contents: string): void {
    const target = join(this.root, relativePath);
    if (existsSync(target) && !this.overwrite) {
      this.skipped.push(relativePath);
      return;
    }
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, contents);
    this.written.push(relativePath);
  }
}

/** Leaf-string counts per source namespace, for the progress tracker table. */
function catalogKeyCounts(root: string, source: string): ReadonlyArray<[string, number]> {
  const dir = join(root, 'messages', source);
  return readdirSync(dir)
    .filter((file) => file.endsWith('.json'))
    .sort()
    .map((file) => {
      const parsed: unknown = JSON.parse(readFileSync(join(dir, file), 'utf8'));
      const leaves = isPlainObject(parsed) ? flattenMessages(parsed).size : 0;
      return [file.replace(/\.json$/, ''), leaves];
    });
}

export function scaffoldLocale(options: ScaffoldOptions): ScaffoldResult {
  const { root, locale } = options;
  const source = options.source ?? routing.defaultLocale;
  const writer = new Writer(root, options.overwrite ?? false);
  const names = languageNames(locale);

  // 1. Message catalogs: byte-for-byte copies of the source namespaces.
  const messagesDir = join(root, 'messages', source);
  for (const file of readdirSync(messagesDir)
    .filter((name) => name.endsWith('.json'))
    .sort()) {
    writer.write(join('messages', locale, file), readFileSync(join(messagesDir, file), 'utf8'));
  }

  // 2. Copy modules: every `<source>.ts` / `*.<source>.ts` under content/.
  const modules: string[] = [];
  walk(join(root, 'content'), modules);
  const contentModules: string[] = [];
  for (const path of modules.sort()) {
    const targetName = localeModuleName(basename(path), source, locale);
    if (!targetName) continue;
    const target = join(dirname(path), targetName);
    writer.write(
      relative(root, target),
      renameIdentifiers(readFileSync(path, 'utf8'), source, locale),
    );
    contentModules.push(relative(root, target));
  }

  // 3. Gate stubs and suites.
  writer.write(
    join('scripts', 'terminology', `${locale}.ts`),
    terminologyPackTemplate(locale, names),
  );
  writer.write(join('e2e', `${locale}-smoke.spec.ts`), smokeSpecTemplate(locale));
  writer.write(join('e2e', `${locale}-site-qa.desktop.spec.ts`), siteQaSpecTemplate(locale, names));

  // 4. Documentation.
  writer.write(join('docs', 'i18n', `glossary-${locale}.md`), glossaryTemplate(locale, names));
  writer.write(join('docs', 'i18n', `style-guide-${locale}.md`), styleGuideTemplate(locale, names));
  writer.write(
    join('docs', 'i18n', `progress-${locale}.md`),
    progressTemplate(locale, names, catalogKeyCounts(root, source), contentModules),
  );

  return { written: writer.written, skipped: writer.skipped };
}

/** The compiler- and test-driven steps that follow the scaffold, for the CLI to print. */
export function nextSteps(locale: string, names = languageNames(locale)): readonly string[] {
  return [
    `Add '${locale}' to LOCALES in i18n/routing.ts (label: ${names.autonym}); npm run type-check then lists every registry that needs a decision: LOCALE_LABELS, LOCALE_ALIASES, LOCALE_CONFIG, the format registries, RAINBOW_KIT_LOCALES, OG_TYPOGRAPHY, OG_FONT_SOURCES, ERROR_CATALOGS, the white-paper BUILDS, LOCALE_COMPANION_FONTS, LEXICON_PROFILES, TERMINOLOGY_PACKS, LOCALE_CONVENTIONS, the e2e fixtures, and test-utils/locale-expectations.ts.`,
    `Register the generated modules in every content/*/index.ts and content/legal/index.ts (the mapped types reject a partial module).`,
    `Typography: check the letter repertoire, not the script name — Clash Display covers basic Latin only (no Cyrillic, few Vietnamese letters). If it lacks letters the copy needs, add a companion face (lib/fonts.ts) with an html:lang(${locale}) rule in styles/global.css, and an OG subset via npm run og:fonts (docs/i18n/README.md §5); lib/__tests__/display-font-coverage.test.ts fails on the first translated string that needs one.`,
    `Write docs/i18n/glossary-${locale}.md and style-guide-${locale}.md first — every batch of copy depends on the coined terms — then encode them: banned register in LEXICON_PROFILES, drift in scripts/terminology/${locale}.ts, mechanical conventions in LOCALE_CONVENTIONS.`,
    `Translate messages/${locale}/*.json and content/**/*.${locale}.ts. npm run i18n:parity reports progress; npm run i18n:check is the gate (it fails while a catalog or module still reads as the source language).`,
    `Finish the surfaces outside the compiler: public/llms.txt and llms-full.txt sections, npm run white-paper:pdf, the lexicon table in AGENTS.md, and docs/i18n/progress-${locale}.md.`,
  ];
}

function terminologyPackTemplate(locale: string, names: { english: string }): string {
  const { upper } = identifierSuffix(locale);
  return `import type { TerminologyRule } from '../terminology-consistency-core';

/**
 * Canonical ${names.english} terminology (docs/i18n/glossary-${locale}.md).
 *
 * One rule per glossary concept: the approved rendering and the plausible
 * alternatives a translator might reach for instead (literal translations,
 * rejected candidates, historic drift). Pick the matcher in
 * TERMINOLOGY_PACKS (scripts/terminology-consistency-core.ts) to fit the
 * script: \`cjk-substring\` for unspaced scripts, \`unicode-stem\` for
 * inflected languages, \`unicode-word\` for whole words.
 *
 * Keep this list to terminology drift. Vocabulary that is banned outright
 * belongs only in LEXICON_PROFILES (scripts/lexicon-scan-core.ts) so neither
 * gate can silently weaken the other.
 */
export const ${upper}_TERMINOLOGY_RULES: readonly TerminologyRule[] = [];
`;
}

function smokeSpecTemplate(locale: string): string {
  return `import { defineLocaleSmoke } from './locale-smoke';

defineLocaleSmoke('${locale}');
`;
}

function siteQaSpecTemplate(locale: string, names: { english: string }): string {
  return `import { LOCALE_CHROME, LOCALE_ROUTE_TEXT } from './locale-fixtures';
import { defineLocaleSiteQa } from './locale-site-qa';

/**
 * Full-site ${names.english} route QA at release widths. The font
 * expectations below assume the Latin faces cover the script (Clash Display
 * for display typography, Inter for body copy); a language that needs a
 * companion face (docs/i18n/README.md §5) pins that face here instead, the
 * way the Chinese and Ukrainian suites do.
 */
defineLocaleSiteQa({
  locale: '${locale}',
  script: LOCALE_CHROME['${locale}'].script,
  expectedText: LOCALE_ROUTE_TEXT['${locale}'],
  // next/font exposes the generated families as \`inter\` and \`clashDisplay\`.
  bodyFontFamily: /inter/i,
  displayFontFamily: /clashDisplay/i,
  forbiddenHeadingFontFamily: /(?!)/,
  unexpectedExactUiCopy: new Set([
    'Signature Allocation',
    'Stellar Selection',
    'Public Goods',
    'Anchor Distribution',
    'Chrono-Warrior',
    'Next cycle',
    'Allocation Tracks',
    'Protocol Configuration',
  ]),
});
`;
}

function glossaryTemplate(locale: string, names: { english: string; autonym: string }): string {
  return `# ${names.english} Glossary (${names.autonym})

This is the **single source of truth** for how Cosmic Signature's coined vocabulary is
rendered in ${names.english}. Every translator and reviewer works with this file open. One
English term = one ${names.english} term, everywhere — a term that drifts between pages
breaks the product's voice and confuses users.

The English lexicon (machine-enforced in \`scripts/lexicon-scan-core.ts\`, run via
\`npm run lexicon:scan\`) is itself a deliberate transcreation layer: _bid_ became
**Gesture**, _raffle_ became **Stellar Selection**, _staking_ became **Anchoring**. The
${names.english} must do the same job: carry an **art-performance register**, never a
gambling / gaming / investment register. Do not translate the underlying banned concept —
translate the coined term.

Machine enforcement for this locale: the banned register in §5 is
\`LEXICON_PROFILES['${locale}']\` in \`scripts/lexicon-scan-core.ts\`; the drift rules in
§2–§3 are \`scripts/terminology/${locale}.ts\` (run via \`npm run terminology:check\`);
mechanical conventions are \`LOCALE_CONVENTIONS['${locale}']\` in
\`scripts/i18n-conventions-core.ts\`.

> Status: **draft**. Freeze it with the locale's first release; afterwards amendments
> require the change process in §6 and must update all existing usages in the same PR.

---

## 1. Term formation rules

When a new English coinage appears, coin the ${names.english} with these rules:

1. **One or two words** for anything that must fit a button, nav item, or table header;
   the full form may be longer, but a short form must exist.
2. Draw from the **art / astronomy / craft register** — never from finance, gaming, or
   gambling registers.
3. Prefer established native terms over calques; a loanword is acceptable only where it
   is the established term in this language.
4. Test every candidate in three places before adopting: a button label, a full
   sentence, and its compounds (_Gesture_ must also work in _Gesture Cost_, _ETH gesture_,
   _Final Gesture_, _gesture count_).
5. Check the term's other meanings and collocations for unwanted flavors.
6. Established crypto terms are used where they are neutral (wallet, token, contract,
   transaction) and avoided where the English deliberately avoided them (staking, mint,
   claim, withdraw).

## 2. Core coinages — decisions with rationale

One subsection per coined term, in this order, each with the decision, the rationale,
a table of the English phrases it appears in, and the rejected alternatives:

### Gesture (was _bid_) →

### Performance Cycle (was _round_) →

### Finalize / Finalization →

### Calibration Window (was _Dutch auction_) →

### Allocation (was _prize_) →

### Recipient (was _winner_) →

### Stellar Selection (was _raffle_) →

### Anchoring (was _staking_) →

### Anchor Distribution (was _yield_) →

### Retrieve (was _withdraw/claim_) →

### Imprint (was _mint_) →

### Endurance Champion → ; Chrono-Warrior →

### Cosmic Council (was _DAO_) →

### Public Goods (was _charity/donation_) →

### Compounding Cycle Reserve →

### Signature (the artwork) →

## 3. General term table

| English | ${names.autonym} | Notes |
| ------- | ---------------- | ----- |

### 3.1 Cosmic Signature trait vocabulary

## 4. Keep in English

Cosmic Signature, RandomWalk NFT, ETH, CST, NFT, Arbitrum, Protocol Guild, contract and
wallet addresses, transaction hashes.

## 5. Banned ${names.english} terms

The words this language actually uses for the banned concepts (auction / bid, prize /
winner, lottery / raffle, gambling, gaming / player, investment / yield / earnings,
staking, charity / donation, withdraw / claim, mint, marketing, round). Encode the list
in \`LEXICON_PROFILES['${locale}']\`.

## 6. Change process

1. Propose the change with the reason and the affected strings.
2. Update this glossary, the terminology pack, and every existing usage in the same PR.
3. \`npm run i18n:check\` must pass before merge.
`;
}

function styleGuideTemplate(locale: string, names: { english: string; autonym: string }): string {
  return `# ${names.english} Style Guide (${names.autonym})

Rules for making the ${names.english} read as if originally written in ${names.english}.
Literal translation is a defect. Terminology lives in
[glossary-${locale}.md](./glossary-${locale}.md); this guide covers everything else.
Conventions a regular expression can check are encoded in
\`LOCALE_CONVENTIONS['${locale}']\` (\`scripts/i18n-conventions-core.ts\`).

## 1. Transcreate, don't translate

## 2. Register and voice

Decide the register (formality level, how the reader is addressed, imperative forms for
buttons) once, here, and use it everywhere.

## 3. Grammar patterns

Sentence structure, agreement, how interpolated values (\`{amount} ETH\`, \`{count}\`)
sit in a sentence without breaking grammar.

## 4. Mechanics: punctuation, spacing, typography

Quotation marks, dashes, ellipsis, spacing around Latin tokens and numbers, capitalization.

## 5. Dates, times, numbers, units

Digit grouping, decimal mark, 12/24-hour time, date order, duration units
(\`messages/${locale}/formats.json\`), and which units stay in English (ETH, CST).

## 6. UI constraints

Length budgets for buttons, nav items, table headers, and tooltips; how to shorten.

## 7. ICU messages in ${names.english}

The plural categories \`Intl.PluralRules('${locale}')\` defines (every one must appear in
each plural block), ordinals, and the placeholder rules.

## 8. Review: the two-pass rule

Pass 1 checks against the English (glossary, facts, placeholders). Pass 2 reads the
${names.english} **without the English open** and edits anything that sounds translated.

## 9. Worked example — a full FAQ entry
`;
}

function progressTemplate(
  locale: string,
  names: { english: string },
  keyCounts: ReadonlyArray<[string, number]>,
  contentModules: readonly string[],
): string {
  const namespaceWidth = Math.max('Namespace'.length, ...keyCounts.map(([ns]) => ns.length));
  const rows = keyCounts
    .map(
      ([namespace, keys]) =>
        `| ${namespace.padEnd(namespaceWidth)} | ${String(keys).padStart(4)} | ☐   | ☐   | ☐   |`,
    )
    .join('\n');
  const moduleRows = contentModules
    .map((module) => `| \`${module}\` | ☐   | ☐   | ☐   |`)
    .join('\n');
  return `# ${names.english} Translation — Progress Tracker

Living document. **Update it in the same PR as the work it records.** Architecture and
workflow: [README.md](./README.md) · terminology: [glossary-${locale}.md](./glossary-${locale}.md) ·
writing rules: [style-guide-${locale}.md](./style-guide-${locale}.md).

Every unit starts at **T** with the English catalog as its source. Stages (defined in
[README.md §8](./README.md)):

- **T — Translated:** ${names.english} written per glossary + style guide; \`npm run i18n:check\`
  green (parity, ICU syntax, placeholder parity, plural categories, lexicon, terminology,
  conventions).
- **R — Reviewed:** blind native-fluency pass (style guide §8, pass 2) by a reader who did
  not write the strings.
- **Q — QA'd:** verified in-context on the rendered \`/${locale}\` page at 320/768/1440 (fonts,
  overflow, tooltips, toasts, locale-preserving links).

Cells contain \`☐\` (not done) → replace with \`✅\` when the stage is complete.

## Foundations (no visible copy)

| #   | Task                                                                                                          | Done |
| --- | ------------------------------------------------------------------------------------------------------------- | ---- |
| 0.1 | \`${locale}\` in \`routing.locales\`, \`LOCALE_LABELS\`, \`LOCALE_ALIASES\`, \`LocaleConfig\`                          | ☐   |
| 0.2 | Every \`LocaleRecord\` registry: content indexes, legal, format/time, OG, wallet, global-error, PDF, fonts      | ☐   |
| 0.3 | Typography: companion face + \`html:lang(${locale})\` rules if needed, OG subset (\`npm run og:fonts\`)          | ☐   |
| 0.4 | Gates: \`LEXICON_PROFILES\`, \`scripts/terminology/${locale}.ts\`, \`LOCALE_CONVENTIONS\`                            | ☐   |
| 0.5 | Test expectations: \`test-utils/locale-expectations.ts\`, \`e2e/locale-fixtures.ts\`, \`${locale}-smoke\`, \`${locale}-site-qa\` | ☐   |
| 0.6 | \`public/llms.txt\` / \`llms-full.txt\` sections, white-paper PDF, AGENTS.md lexicon column                   | ☐   |

## Message catalogs (\`messages/${locale}/*.json\`)

| ${'Namespace'.padEnd(namespaceWidth)} | Keys | T   | R   | Q   |
| ${'-'.repeat(namespaceWidth)} | ---: | --- | --- | --- |
${rows}

## Long-form content (\`content/**/*.${locale}.ts\`)

| Module | T   | R   | Q   |
| ------ | --- | --- | --- |
${moduleRows}

## Notes
`;
}
