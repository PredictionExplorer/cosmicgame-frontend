import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

import { getAllFaqItems, getFaqContent } from '@/content/faq';
import { getLandingContent } from '@/content/landing';
import { getLearnContent } from '@/content/learn';
import { protocolFacts } from '@/content/protocol-facts';
import { getQuizContent } from '@/content/quiz';
import { DURATION_NOUNS, type DurationNouns } from '@/test-utils/locale-expectations';

import { getLocaleConfig } from '@/i18n/localeConfig';
import { routing, type AppLocale } from '@/i18n/routing';
import { DEFAULT_ACTIVE_PERIOD_GAP_HOURS } from '@/utils/biddingAnalytics';

/**
 * Cross-copy numeric drift guard.
 *
 * Extracts protocol-mechanics tokens (percentages, hour/week/day durations,
 * CST amounts) from every centralized copy source in every locale and
 * asserts each one is derivable from `protocolFacts` (or explicitly
 * allowlisted as a non-protocol number). If a percentage or duration is
 * reworded or a new one is introduced, this test forces it through the
 * verified facts module instead of hardcoded prose.
 *
 * Duration words are matched per language through the `DURATION_NOUNS`
 * registry (English and Ukrainian inflect their unit nouns; Chinese durations
 * use 小时/周/天), so a translated figure is held to the same facts as the
 * English it renders, and a new locale cannot ship without declaring its
 * nouns. Numbers are read with the locale's own digit-grouping and decimal
 * marks (from `Intl`): English writes 1,000 CST, Ukrainian 1 000 CST,
 * Vietnamese 1.000 CST, and each spells the same amount.
 */

interface CopySource {
  name: string;
  text: string;
  /** The language the source is written in; absent for the mixed-language llms docs. */
  locale?: AppLocale;
}

const readPublicFile = (fileName: string) =>
  readFileSync(join(process.cwd(), 'public', fileName), 'utf8');

/** Concatenated message catalogs for a locale (messages/<locale>/*.json). */
const readMessageCatalogs = (locale: string) => {
  const dir = join(process.cwd(), 'messages', locale);
  return readdirSync(dir)
    .filter((fileName) => fileName.endsWith('.json'))
    .map((fileName) => readFileSync(join(dir, fileName), 'utf8'))
    .join('\n');
};

const sources: CopySource[] = [
  ...routing.locales.flatMap((locale): CopySource[] => [
    {
      name: `faq-${locale}`,
      locale,
      text: getAllFaqItems(getFaqContent(locale))
        .map((item) => `${item.question} ${item.answer}`)
        .join('\n'),
    },
    { name: `landing-${locale}`, locale, text: JSON.stringify(getLandingContent(locale)) },
    { name: `learn-${locale}`, locale, text: JSON.stringify(getLearnContent(locale).articles) },
    { name: `quiz-${locale}`, locale, text: JSON.stringify(getQuizContent(locale)) },
    { name: `messages-${locale}`, locale, text: readMessageCatalogs(locale) },
  ]),
  { name: 'llms.txt', text: readPublicFile('llms.txt') },
  { name: 'llms-full.txt', text: readPublicFile('llms-full.txt') },
];

type DurationUnit = keyof Pick<DurationNouns, 'hours' | 'weeks' | 'days'>;

/**
 * `48 hours`, `48-hour`, `48 годин`, `48 小時`: one pattern per locale so a
 * language can guard its own false positives (a lookbehind for calendar
 * dates). Every pattern runs against every source — stray English in a
 * translated catalog is held to the facts too.
 */
function durationPatterns(unit: DurationUnit): readonly RegExp[] {
  return routing.locales.map((locale) => {
    const nouns = DURATION_NOUNS[locale];
    const guard = nouns.notAfter ? `(?<!${nouns.notAfter})` : '';
    return new RegExp(`${guard}(\\d+(?:\\.\\d+)?)[- ]?(?:${nouns[unit]})(?![\\p{L}])`, 'giu');
  });
}

const allowedPercents = new Set<number>([
  // Chart prose uses the neutral zero boundary ("no activity shows 0%").
  0,
  protocolFacts.mainEthPercentage,
  protocolFacts.chronoWarriorEthPercentage,
  protocolFacts.stellarSelectionEthPercentage,
  protocolFacts.anchorDistributionPercentage,
  protocolFacts.publicGoodsPercentage,
  protocolFacts.compoundingReservePercentage,
  protocolFacts.randomWalkDiscountPercentage,
  protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture,
  protocolFacts.cstCalibrationWindowDecreasePercentPerEthGesture,
  protocolFacts.cycleTimeIncrementIncreasePercentPerCycle,
  protocolFacts.ethGestureCostStepUpPercent,
  protocolFacts.councilQuorumPercent,
]);

const allowedHourFigures = new Set<number>([
  protocolFacts.initialCstCalibrationWindowHours,
  protocolFacts.finalGestureExclusivityHours,
  protocolFacts.initialCycleFinalizationHoursAtLaunch,
  protocolFacts.initialCycleTimeIncrementHours,
  // Statistics chart parameter (not a protocol mechanic), quoted in the
  // active-periods description of every locale.
  DEFAULT_ACTIVE_PERIOD_GAP_HOURS,
]);

const allowedWeekFigures = new Set<number>([
  protocolFacts.secondaryRetrievalTimeoutWeeks,
  protocolFacts.councilVotingPeriodWeeks,
]);

const allowedDayFigures = new Set<number>([
  protocolFacts.councilVotingDelayDays,
  // "1 day" appears as a dynamic-CST elapsed-time example and as the
  // approximate initial Cycle Finalization Time at launch.
  1,
]);

const allowedCstAmounts = new Set<number>([
  protocolFacts.specialAllocationCst,
  protocolFacts.outreachReserveCst,
  protocolFacts.typicalCstImprintsPerCycle,
  // NFT-paired CST subtotal quoted in the llms docs (24 x 1,000).
  protocolFacts.typicalNftsPerCycle * protocolFacts.specialAllocationCst,
  protocolFacts.cstCalibrationCeilingMinCst,
  protocolFacts.cstCalibrationFloorCst,
  protocolFacts.councilProposalThresholdCst,
  // Worked examples of the dynamic Participation CST formula.
  ...protocolFacts.dynamicCstRewardExamples.map((example) => Number(example.cst)),
]);

/**
 * How a source writes numbers: the character class of its digit-grouping
 * marks and the marks it may use for decimals. A locale's marks come from
 * `Intl` for its `intlLocale` — English groups with a comma, Ukrainian with a
 * space or no-break space, Vietnamese with a dot and writes decimals with a
 * comma — and copy may type any space where Intl emits a no-break space. The
 * ASCII dot is also accepted as a decimal mark wherever it is not the
 * grouping mark, since protocol figures such as 0.398% are quoted that way
 * across catalogs. The mixed-language llms docs accept every locale's marks:
 * a comma or space before exactly three digits is a group, a dot followed by
 * exactly three digits is a thousands group there ("1.000 CST"), and any
 * other dot or comma is a decimal ("0.398%", "0,398%").
 */
interface NumberGrammar {
  readonly groupClass: string;
  readonly decimalClass: string;
  /** Whether a dot may be a grouping mark (the mixed docs) rather than only a decimal. */
  readonly dotGroups: boolean;
}

const SPACE_GROUP_MARKS = '\\u00a0\\u202f ';

const escapeRegex = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function numberGrammar(locale: AppLocale | undefined): NumberGrammar {
  if (!locale) {
    return { groupClass: `[,${SPACE_GROUP_MARKS}]`, decimalClass: '[.,]', dotGroups: true };
  }
  const parts = new Intl.NumberFormat(getLocaleConfig(locale).intlLocale).formatToParts(1234567.5);
  const group = parts.find((part) => part.type === 'group')?.value ?? ',';
  const decimal = parts.find((part) => part.type === 'decimal')?.value ?? '.';
  const decimals = new Set([decimal, ...(group === '.' ? [] : ['.'])]);
  return {
    groupClass: /\s/u.test(group) ? `[${SPACE_GROUP_MARKS}]` : `[${escapeRegex(group)}]`,
    decimalClass: `[${[...decimals].map(escapeRegex).join('')}]`,
    dotGroups: group === '.',
  };
}

function parseNumber(raw: string, grammar: NumberGrammar, grouped: boolean): number {
  let text = raw;
  if (grouped) {
    // A grouping mark is only a grouping mark before exactly three digits;
    // "1,5" in a comma-decimal language stays a fraction.
    text = text.replace(new RegExp(`${grammar.groupClass}(?=\\d{3}(?!\\d))`, 'g'), '');
    // "1.000" / "24.000": dots that each precede exactly three digits are groups.
    if (grammar.dotGroups && /^\d{1,3}(?:\.\d{3})+$/.test(text)) text = text.replace(/\./g, '');
  }
  return Number(text.replace(new RegExp(grammar.decimalClass), '.'));
}

/** `1,000`, `1 000`, `1.000`, `0.398`, `0,5` — a grouped number with an optional fraction. */
function numberPattern(grammar: NumberGrammar): string {
  const dotGroups = grammar.dotGroups && !grammar.groupClass.includes('.') ? '(?:\\.\\d{3})*' : '';
  return `\\d{1,3}(?:${grammar.groupClass}\\d{3})*${dotGroups}(?:${grammar.decimalClass}\\d+)?`;
}

/**
 * Every number a pattern's first group captures in the source, read with the
 * source's number grammar. Percentages and durations are never grouped, so
 * they skip the grouping marks (a dot there is always a decimal); CST amounts
 * are `grouped`.
 */
function collect(
  source: CopySource,
  patterns: RegExp | readonly RegExp[],
  { grouped = false }: { grouped?: boolean } = {},
): Array<{ value: number; context: string }> {
  const grammar = numberGrammar(source.locale);
  const hits: Array<{ value: number; context: string }> = [];
  for (const pattern of Array.isArray(patterns) ? patterns : [patterns as RegExp]) {
    for (const match of source.text.matchAll(pattern)) {
      const index = match.index ?? 0;
      hits.push({
        value: parseNumber(match[1]!, grammar, grouped),
        context: source.text.slice(Math.max(0, index - 60), index + 60).replace(/\s+/g, ' '),
      });
    }
  }
  return hits;
}

function assertAllowed(
  source: string,
  hits: Array<{ value: number; context: string }>,
  allowed: ReadonlySet<number>,
  kind: string,
): void {
  for (const hit of hits) {
    if (!allowed.has(hit.value)) {
      throw new Error(
        `${source}: ${kind} "${hit.value}" is not derived from protocolFacts.\n` +
          `Context: …${hit.context}…\n` +
          `Add the underlying fact to content/protocol-facts.ts (verified against ` +
          `the deployed contracts) instead of hardcoding the number in copy.`,
      );
    }
  }
}

describe('copy numeric claims stay pinned to protocolFacts', () => {
  it.each(sources)('$name: every percentage is in the verified allowlist', (source) => {
    // Percentages are never grouped, so the fraction mark is whichever the
    // grammar allows (0.398% in English and Ukrainian copy, 0,398% in Vietnamese).
    const { decimalClass } = numberGrammar(source.locale);
    assertAllowed(
      source.name,
      collect(source, new RegExp(`(\\d+(?:${decimalClass}\\d+)?)%`, 'g')),
      allowedPercents,
      'percentage',
    );
  });

  it.each(sources)('$name: every "N hours" figure is verified', (source) => {
    assertAllowed(
      source.name,
      collect(source, durationPatterns('hours')),
      allowedHourFigures,
      'hour figure',
    );
  });

  it.each(sources)('$name: every "N weeks" figure is verified', (source) => {
    assertAllowed(
      source.name,
      collect(source, durationPatterns('weeks')),
      allowedWeekFigures,
      'week figure',
    );
  });

  it.each(sources)('$name: every "N days" figure is verified', (source) => {
    assertAllowed(
      source.name,
      collect(source, durationPatterns('days')),
      allowedDayFigures,
      'day figure',
    );
  });

  it.each(sources)('$name: every "N CST" amount is verified', (source) => {
    assertAllowed(
      source.name,
      collect(
        source,
        new RegExp(`(${numberPattern(numberGrammar(source.locale))})\\s+CST\\b`, 'g'),
        { grouped: true },
      ),
      allowedCstAmounts,
      'CST amount',
    );
  });

  it('the key deployed percentages are actually present in the public docs', () => {
    // Guards against accidental deletion: llms.txt must keep quoting the
    // allocation split so crawlers see the verified numbers.
    const llms = readPublicFile('llms.txt');
    for (const percent of [
      protocolFacts.mainEthPercentage,
      protocolFacts.chronoWarriorEthPercentage,
      protocolFacts.stellarSelectionEthPercentage,
      protocolFacts.anchorDistributionPercentage,
      protocolFacts.publicGoodsPercentage,
    ]) {
      expect(llms).toContain(`${percent}%`);
    }
  });
});
