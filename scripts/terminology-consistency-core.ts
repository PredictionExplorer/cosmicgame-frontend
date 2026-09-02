/**
 * Canonical terminology guard for every translated locale.
 *
 * This complements (and intentionally does not duplicate) the banned-register
 * checks in lexicon-scan-core.ts. The lexicon scanner rejects legally risky
 * vocabulary; this module catches plausible but inconsistent translations of
 * approved glossary concepts.
 *
 * Rules live in one pack per locale under scripts/terminology/<locale>.ts;
 * each pack names the matcher that fits its script (CJK substrings for zh,
 * Unicode word-initial stems for inflected uk). `TERMINOLOGY_PACKS` is typed
 * against `TranslatedLocale`, so a locale added to routing.locales must ship
 * a pack before the type-check passes.
 */

import type { TranslatedLocale } from '../i18n/routing';

import { buildTermPattern, type TermMatcher } from './locale-text-matchers';
import { UK_TERMINOLOGY_RULES } from './terminology/uk';
import { ZH_TERMINOLOGY_RULES } from './terminology/zh';

export interface TerminologyRule {
  /** English concept name used in diagnostics. */
  concept: string;
  /** Approved rendering from docs/i18n/glossary-<locale>.md. */
  canonical: string;
  /** Known literal translations, rejected candidates, and historic drift. */
  variants: readonly string[];
}

export interface TerminologyPack {
  /** Where the canonical renderings are documented. */
  readonly glossary: string;
  /** Boundary strategy for `variants` (see locale-text-matchers.ts). */
  readonly matcher: TermMatcher;
  readonly rules: readonly TerminologyRule[];
}

export interface TerminologyHit {
  concept: string;
  canonical: string;
  variant: string;
  line: number;
  excerpt: string;
}

export const TERMINOLOGY_PACKS: Record<TranslatedLocale, TerminologyPack> = {
  zh: {
    glossary: 'docs/i18n/glossary-zh.md',
    matcher: 'cjk-substring',
    rules: ZH_TERMINOLOGY_RULES,
  },
  uk: {
    glossary: 'docs/i18n/glossary-uk.md',
    matcher: 'unicode-stem',
    rules: UK_TERMINOLOGY_RULES,
  },
};

/** The Simplified-Chinese rules, kept under the historical name for existing call sites. */
export const TERMINOLOGY_RULES: readonly TerminologyRule[] = ZH_TERMINOLOGY_RULES;

const ALLOW_START = 'terminology-allow-start';
const ALLOW_END = 'terminology-allow-end';
const ALLOW_LINE = 'terminology-allow-line';

function excerptFor(line: string): string {
  const normalized = line.trim().replace(/\s+/g, ' ');
  return normalized.length <= 180 ? normalized : `${normalized.slice(0, 177)}…`;
}

/** A bare rule list is treated as a CJK-substring pack (the historical default). */
function toPack(rulesOrPack: readonly TerminologyRule[] | TerminologyPack): TerminologyPack {
  return Array.isArray(rulesOrPack)
    ? { glossary: TERMINOLOGY_PACKS.zh.glossary, matcher: 'cjk-substring', rules: rulesOrPack }
    : (rulesOrPack as TerminologyPack);
}

const compiledVariants = new WeakMap<
  TerminologyPack,
  ReadonlyArray<{ rule: TerminologyRule; variant: string; pattern: RegExp }>
>();

function variantsOf(pack: TerminologyPack) {
  let compiled = compiledVariants.get(pack);
  if (!compiled) {
    compiled = pack.rules.flatMap((rule) =>
      rule.variants.map((variant) => ({
        rule,
        variant,
        pattern: buildTermPattern({ matcher: pack.matcher, terms: [variant] }),
      })),
    );
    compiledVariants.set(pack, compiled);
  }
  return compiled;
}

/**
 * Scans decoded user-facing text or a translated content source file.
 *
 * Content modules may use narrowly scoped `terminology-allow-*` comments when
 * quoting third-party copy or discussing a rejected rendering. JSON catalogs
 * cannot contain comments, so every catalog value is always enforced.
 */
export function scanTerminology(
  text: string,
  rulesOrPack: readonly TerminologyRule[] | TerminologyPack = TERMINOLOGY_PACKS.zh,
): TerminologyHit[] {
  const pack = toPack(rulesOrPack);
  const variants = variantsOf(pack);
  const hits: TerminologyHit[] = [];
  let allowed = false;

  text.split('\n').forEach((line, index) => {
    if (line.includes(ALLOW_START)) {
      allowed = true;
      return;
    }
    if (line.includes(ALLOW_END)) {
      allowed = false;
      return;
    }
    if (allowed || line.includes(ALLOW_LINE)) return;

    for (const { rule, variant, pattern } of variants) {
      pattern.lastIndex = 0;
      for (const match of line.matchAll(pattern)) {
        hits.push({
          concept: rule.concept,
          canonical: rule.canonical,
          variant: match[0] === variant ? variant : `${variant} (${match[0]})`,
          line: index + 1,
          excerpt: excerptFor(line),
        });
      }
    }
  });

  return hits;
}

export function validateTerminologyRules(
  rules: readonly TerminologyRule[] = TERMINOLOGY_RULES,
  matcher: TermMatcher = 'cjk-substring',
): string[] {
  const errors: string[] = [];
  const owners = new Map<string, string>();

  for (const rule of rules) {
    if (!rule.concept.trim()) errors.push('A terminology rule has an empty concept name.');
    if (!rule.canonical.trim()) {
      errors.push(`${rule.concept || '(unnamed rule)'} has an empty canonical rendering.`);
    }
    if (rule.variants.length === 0) {
      errors.push(`${rule.concept} has no drift variants.`);
    }

    for (const variant of rule.variants) {
      if (!variant.trim()) {
        errors.push(`${rule.concept} has an empty drift variant.`);
        continue;
      }
      // A variant that matches the canonical rendering under the pack's own
      // matcher would flag every correct usage.
      if (buildTermPattern({ matcher, terms: [variant] }).test(rule.canonical)) {
        errors.push(`${rule.concept} canonical rendering contains its drift variant "${variant}".`);
      }
      const existingOwner = owners.get(variant);
      if (existingOwner) {
        errors.push(
          `Drift variant "${variant}" is owned by both ${existingOwner} and ${rule.concept}.`,
        );
      } else {
        owners.set(variant, rule.concept);
      }
    }
  }

  return errors;
}

/** Validates every locale's pack; returns `locale: message` strings. */
export function validateTerminologyPacks(
  packs: Record<string, TerminologyPack> = TERMINOLOGY_PACKS,
): string[] {
  return Object.entries(packs).flatMap(([locale, pack]) =>
    validateTerminologyRules(pack.rules, pack.matcher).map((error) => `${locale}: ${error}`),
  );
}
