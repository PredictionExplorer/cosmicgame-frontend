/**
 * Copy conventions per translated locale (docs/i18n/README.md §7): the
 * language-specific defects that parity, terminology, and lexicon checks
 * cannot see but a native reader notices first. One entry per locale
 * (`null` when the language has no mechanical conventions worth a gate);
 * every catalog value and copy module of the locale is checked against it.
 * Locale-generic like the other gates: a new locale adds an entry here.
 *
 * Two kinds of check compose an entry:
 *
 * - **Script conventions** (the Chinese locales). Character conversion is
 *   the number-one defect in Traditional Chinese localizations: a Simplified
 *   character pasted into a Traditional catalog, a Taiwan character choice in
 *   Hong Kong copy (裡 for 裏), curly quotes where corner brackets belong.
 *   Detection asks OpenCC for the locale's own rendering of the text (`cn→tw`
 *   for Taiwan, `cn→hk` for Hong Kong, `t→cn` for the mainland) and reports
 *   every character the conversion would change. Text already in the right
 *   script is a fixed point, so correct copy produces no diff; a Simplified 发
 *   in Traditional copy (or a Traditional 發 in Simplified copy) does.
 *   Phrase-aware conversion keeps legitimately shared characters quiet (風采
 *   vs 採用). The one exception OpenCC cannot know about is the glossary's
 *   choice of 台 over 臺 for Taiwan, listed as a shared character.
 * - **Disallowed patterns** (any language). Constructions the style guide
 *   rules out and a regular expression can find: a sound-dependent Korean
 *   particle glued to an ICU placeholder, full-width punctuation in a
 *   language that uses ASCII marks, a pronoun the register drops.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

import * as OpenCC from 'opencc-js';

import type { TranslatedLocale } from '../i18n/routing';

import { fileLocale } from './locale-files';

export type ChineseScript = 'Hans' | 'Hant';

/**
 * OpenCC's Hong Kong tables follow the Hong Kong 常用字字形表 down to
 * glyph-variant code points (説 U+8AAC for 說, 閲 for 閱, 户 for 戶, 税 for 稅,
 * 温 for 溫 …). Hong Kong digital text does not: government, banking, and
 * news sites encode the standard Big5 characters and let Hong Kong fonts
 * (Noto Sans HK, PingFang HK) draw the regional shapes. The character CHOICES
 * that genuinely differ in Hong Kong writing — 裏 (not 裡), 着 as the aspect
 * particle, 台灣 — are kept. Applied by the derive script and by this gate.
 */
export const HK_STANDARD_FORMS: Readonly<Record<string, string>> = {
  説: '說',
  閲: '閱',
  户: '戶',
  兑: '兌',
  悦: '悅',
  愠: '慍',
  温: '溫',
  税: '稅',
  脱: '脫',
  卧: '臥',
  藴: '蘊',
  蜕: '蛻',
  衞: '衛',
  鋭: '銳',
  敍: '敘',
  羣: '群',
  峯: '峰',
  牀: '床',
  麪: '麵',
  啓: '啟',
};

/** OpenCC-backed script checks for a Chinese locale. */
export interface ScriptConventions {
  readonly script: ChineseScript;
  /** This locale's rendering of arbitrary Chinese text; a fixed point for correct copy. */
  readonly expectedForm: (text: string) => string;
  /** Characters of another variant's convention → the expected form. */
  readonly forbiddenCharacters: Readonly<Record<string, string>>;
  /** Punctuation of the other script's convention → the expected mark. */
  readonly forbiddenPunctuation: Readonly<Record<string, string>>;
  /** Characters the glossary keeps although `expectedForm` would change them. */
  readonly sharedCharacters: readonly string[];
}

/** A construction that is always a defect in this locale's copy, found by pattern. */
export interface DisallowedPattern {
  /** Matched per line; the `g` and `u` flags are added if absent. */
  readonly pattern: RegExp;
  /** What to write instead, with a style-guide section, as shown in diagnostics. */
  readonly reason: string;
}

export interface LocaleConventions {
  /** Where the conventions are documented. */
  readonly styleGuide: string;
  /** Script checks, or `null` for a language written in one script. */
  readonly script: ScriptConventions | null;
  /** Pattern checks; empty when the script checks say everything. */
  readonly disallowedPatterns: readonly DisallowedPattern[];
}

const TRADITIONAL_QUOTES: Readonly<Record<string, string>> = {
  '“': '「',
  '”': '」',
  '‘': '『',
  '’': '』',
};

const SIMPLIFIED_QUOTES: Readonly<Record<string, string>> = {
  '「': '“',
  '」': '”',
  '『': '‘',
  '』': '’',
};

const toTaiwan = OpenCC.Converter({ from: 'cn', to: 'tw' });
const toHongKong = OpenCC.Converter({ from: 'cn', to: 'hk' });
const toSimplified = OpenCC.Converter({ from: 't', to: 'cn' });

/**
 * Characters that are Simplified forms of one Traditional character but also
 * Traditional characters in their own right. OpenCC's phrase tables are keyed
 * by Simplified phrases, so inside Traditional text these fall back to the
 * character mapping (風采 → 風採, 干預 → 幹預) and must be allowed explicitly:
 * 台 (台灣, 平台 — the glossary's choice), 里 (公里), 干 (干預, 干擾),
 * 准 (批准), 采 (風采, 神采), 征 (征服), 划 (划船), 岳 (山岳), 郁 (濃郁),
 * 后 (皇后), 于 (surname), 了 — OpenCC's Taiwan table prescribes 瞭解 where
 * everyday Taiwan and Hong Kong writing has 了解 — and 表 (表格, 儀表板; OpenCC
 * prefers the gauge character 錶 in 儀錶板, which nobody types).
 */
const SHARED_TRADITIONAL_CHARACTERS: readonly string[] = [
  '了',
  '表',
  '台',
  '里',
  '干',
  '准',
  '采',
  '征',
  '划',
  '岳',
  '郁',
  '后',
  '于',
];

function applyStandardForms(text: string): string {
  let out = text;
  for (const [variant, standard] of Object.entries(HK_STANDARD_FORMS)) {
    if (out.includes(variant)) out = out.split(variant).join(standard);
  }
  return out;
}

export const LOCALE_CONVENTIONS: Record<TranslatedLocale, LocaleConventions | null> = {
  zh: {
    styleGuide: 'docs/i18n/style-guide-zh.md',
    script: {
      script: 'Hans',
      expectedForm: toSimplified,
      forbiddenCharacters: {},
      forbiddenPunctuation: SIMPLIFIED_QUOTES,
      sharedCharacters: [],
    },
    disallowedPatterns: [],
  },
  'zh-TW': {
    styleGuide: 'docs/i18n/style-guide-zh-TW.md',
    script: {
      script: 'Hant',
      expectedForm: toTaiwan,
      forbiddenCharacters: {
        // Taiwan writes 裡 and 著 in every sense; 裏/着 are Hong Kong choices.
        裏: '裡',
        着: '著',
        // The glossary standardizes on 台 (台灣, 平台), the everyday form.
        臺: '台',
        ...HK_STANDARD_FORMS,
      },
      forbiddenPunctuation: TRADITIONAL_QUOTES,
      sharedCharacters: SHARED_TRADITIONAL_CHARACTERS,
    },
    disallowedPatterns: [],
  },
  'zh-HK': {
    styleGuide: 'docs/i18n/style-guide-zh-HK.md',
    script: {
      script: 'Hant',
      expectedForm: (text) => applyStandardForms(toHongKong(text)),
      forbiddenCharacters: {
        // Hong Kong writes 裏, not the Taiwan 裡.
        裡: '裏',
        臺: '台',
        ...HK_STANDARD_FORMS,
      },
      forbiddenPunctuation: TRADITIONAL_QUOTES,
      sharedCharacters: SHARED_TRADITIONAL_CHARACTERS,
    },
    disallowedPatterns: [],
  },
  // Ukrainian is written in one script and its style rules (cases, four
  // plural forms, «» quotes) need a reader, not a regular expression.
  uk: null,
  // Korean (docs/i18n/style-guide-ko.md): one script, but four defects a
  // regular expression catches reliably.
  ko: {
    styleGuide: 'docs/i18n/style-guide-ko.md',
    script: null,
    disallowedPatterns: [
      {
        // 을/를, 이/가, 은/는, 와/과, (으)로 change with the final sound of the
        // preceding word, which an interpolated value or plural `#` does not
        // have. Counters (개, 회, 명, 번째) are sound-independent and allowed.
        pattern: /[}#](?:을|를|이|가|은|는|와|과|으로|로)(?![가-힣])/,
        reason:
          'sound-dependent particle glued to a placeholder; restructure so the particle follows a fixed noun (style-guide-ko §3)',
      },
      {
        pattern:
          /(?:을|이|은|와|으)\((?:를|가|는|과|로)\)|\((?:을|이|은|와|으)\)(?:를|가|는|과|로)/,
        reason:
          'hedged particle 을(를) / (으)로; rewrite so the particle attaches to a known word (style-guide-ko §3)',
      },
      {
        pattern: /[。，、；：！？（）「」『』]/,
        reason:
          'full-width punctuation or corner brackets; Korean uses ASCII marks and “ ” quotes (style-guide-ko §4)',
      },
      {
        pattern: /당신|귀하/,
        reason: 'second-person pronoun; Korean drops the subject (style-guide-ko §2)',
      },
      {
        pattern: /되어지/,
        reason: 'double passive 되어지다; write the simple passive 되다 (style-guide-ko §3)',
      },
    ],
  },
};

export interface ConventionViolation {
  readonly line: number;
  /** The offending character, or the text a disallowed pattern matched. */
  readonly character: string;
  /** The expected form, or for a pattern its `reason`. */
  readonly expected: string;
  readonly reason: 'wrong-script' | 'regional-form' | 'punctuation' | 'pattern';
  readonly excerpt: string;
}

const HAN = /\p{Script=Han}/u;

function excerptFor(line: string): string {
  const normalized = line.trim().replace(/\s+/g, ' ');
  return normalized.length <= 120 ? normalized : `${normalized.slice(0, 117)}…`;
}

/**
 * Checks text (a catalog value or a whole copy module) against a Chinese
 * locale's script conventions. Each distinct offending character is reported
 * once per line.
 */
export function checkScriptConventions(
  text: string,
  conventions: ScriptConventions,
): ConventionViolation[] {
  const violations: ConventionViolation[] = [];
  const shared = new Set(conventions.sharedCharacters);

  text.split('\n').forEach((line, index) => {
    const seen = new Set<string>();
    const report = (
      character: string,
      expected: string,
      reason: ConventionViolation['reason'],
    ): void => {
      if (seen.has(character)) return;
      seen.add(character);
      violations.push({ line: index + 1, character, expected, reason, excerpt: excerptFor(line) });
    };

    for (const character of line) {
      const punctuation = conventions.forbiddenPunctuation[character];
      if (punctuation) report(character, punctuation, 'punctuation');
      const regional = conventions.forbiddenCharacters[character];
      if (regional) report(character, regional, 'regional-form');
    }

    if (!HAN.test(line)) return;
    const chars = Array.from(line);
    const expected = Array.from(conventions.expectedForm(line));
    if (expected.length !== chars.length) {
      // A phrase substitution changed the length; report the line as a whole.
      report(line.trim(), expected.join(''), 'wrong-script');
      return;
    }
    chars.forEach((character, position) => {
      const converted = expected[position]!;
      if (converted === character || shared.has(character) || !HAN.test(character)) return;
      if (conventions.forbiddenCharacters[character]) return; // already reported
      report(character, converted, 'wrong-script');
    });
  });

  return violations;
}

const globalPatterns = new WeakMap<DisallowedPattern, RegExp>();

/** The pattern with the flags `matchAll` needs, compiled once per entry. */
function globalPattern(entry: DisallowedPattern): RegExp {
  let compiled = globalPatterns.get(entry);
  if (!compiled) {
    const flags = new Set([...entry.pattern.flags, 'g', 'u']);
    compiled = new RegExp(entry.pattern.source, [...flags].join(''));
    globalPatterns.set(entry, compiled);
  }
  return compiled;
}

/**
 * Checks text against a locale's disallowed patterns. Each distinct match of
 * each pattern is reported once per line.
 */
export function checkDisallowedPatterns(
  text: string,
  patterns: readonly DisallowedPattern[],
): ConventionViolation[] {
  if (patterns.length === 0) return [];
  const violations: ConventionViolation[] = [];
  text.split('\n').forEach((line, index) => {
    for (const entry of patterns) {
      const seen = new Set<string>();
      for (const match of line.matchAll(globalPattern(entry))) {
        const matched = match[0];
        if (!matched || seen.has(matched)) continue;
        seen.add(matched);
        violations.push({
          line: index + 1,
          character: matched,
          expected: entry.reason,
          reason: 'pattern',
          excerpt: excerptFor(line),
        });
      }
    }
  });
  return violations;
}

/** Every violation of a locale's conventions in one text, script checks first. */
export function checkConventions(
  text: string,
  conventions: LocaleConventions,
): ConventionViolation[] {
  return [
    ...(conventions.script ? checkScriptConventions(text, conventions.script) : []),
    ...checkDisallowedPatterns(text, conventions.disallowedPatterns),
  ];
}

export interface LocatedViolation {
  /** Repository-relative path. */
  readonly file: string;
  /** Catalog key path for JSON values; empty for copy modules (see `violation.line`). */
  readonly location: string;
  readonly violation: ConventionViolation;
}

function walkFiles(directory: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walkFiles(path));
    else files.push(path);
  }
  return files;
}

function flattenStrings(value: unknown, prefix = ''): Array<{ location: string; text: string }> {
  if (typeof value === 'string') return [{ location: prefix || '(root)', text: value }];
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => flattenStrings(item, `${prefix}[${index}]`));
  }
  if (typeof value === 'object' && value !== null) {
    return Object.entries(value).flatMap(([key, child]) =>
      flattenStrings(child, prefix ? `${prefix}.${key}` : key),
    );
  }
  return [];
}

/** The files a locale's conventions apply to: its catalogs and its copy modules. */
export function localeConventionFiles(
  root: string,
  locale: TranslatedLocale,
): { catalogs: string[]; modules: string[] } {
  const catalogs = walkFiles(join(root, 'messages', locale))
    .filter((path) => extname(path) === '.json')
    .sort();
  const modules = walkFiles(join(root, 'content'))
    .filter((path) => ['.ts', '.tsx'].includes(extname(path)))
    .filter((path) => fileLocale(relative(root, path)) === locale)
    .sort();
  return { catalogs, modules };
}

/** Every violation in a locale's catalogs and copy modules under `root`. */
export function scanLocaleConventions(root: string, locale: TranslatedLocale): LocatedViolation[] {
  const conventions = LOCALE_CONVENTIONS[locale];
  if (!conventions) return [];
  const { catalogs, modules } = localeConventionFiles(root, locale);
  const found: LocatedViolation[] = [];

  for (const path of catalogs) {
    const file = relative(root, path);
    const parsed = JSON.parse(readFileSync(path, 'utf8')) as unknown;
    for (const { location, text } of flattenStrings(parsed)) {
      for (const violation of checkConventions(text, conventions)) {
        found.push({ file, location, violation });
      }
    }
  }
  for (const path of modules) {
    const file = relative(root, path);
    for (const violation of checkConventions(readFileSync(path, 'utf8'), conventions)) {
      found.push({ file, location: '', violation });
    }
  }
  return found;
}

/** One-line summary of what a locale's gate checks, for CLI output. */
export function describeConventions(conventions: LocaleConventions): string {
  const parts = [
    ...(conventions.script ? [`${conventions.script.script} script`] : []),
    ...(conventions.disallowedPatterns.length > 0
      ? [`${conventions.disallowedPatterns.length} pattern(s)`]
      : []),
  ];
  return parts.join(', ');
}

export function describeViolation(
  violation: ConventionViolation,
  conventions: LocaleConventions,
): string {
  const codePoint = (character: string): string =>
    `U+${character.codePointAt(0)!.toString(16).toUpperCase().padStart(4, '0')}`;
  const script = conventions.script?.script ?? 'Hans';
  switch (violation.reason) {
    case 'wrong-script':
      return violation.character.length === 1
        ? `${violation.character} (${codePoint(violation.character)}) is ${
            script === 'Hant' ? 'Simplified' : 'Traditional'
          }; write ${violation.expected}`
        : `mixed-script phrase; the ${script} form is "${violation.expected}"`;
    case 'regional-form':
      return `${violation.character} (${codePoint(violation.character)}) is another variant's form; write ${violation.expected}`;
    case 'punctuation':
      return `${violation.character} is the other script's quotation mark; write ${violation.expected}`;
    case 'pattern':
      return `"${violation.character}": ${violation.expected}`;
  }
}
