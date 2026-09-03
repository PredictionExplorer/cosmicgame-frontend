import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

import { getAllFaqItems, getFaqContent } from '@/content/faq';
import { getLandingContent } from '@/content/landing';
import { getLearnContent } from '@/content/learn';
import { protocolFacts } from '@/content/protocol-facts';
import { getQuizContent } from '@/content/quiz';
import { DURATION_NOUNS, type DurationNouns } from '@/test-utils/locale-expectations';

import { routing } from '@/i18n/routing';
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
 * nouns.
 */

interface CopySource {
  name: string;
  text: string;
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
      text: getAllFaqItems(getFaqContent(locale))
        .map((item) => `${item.question} ${item.answer}`)
        .join('\n'),
    },
    { name: `landing-${locale}`, text: JSON.stringify(getLandingContent(locale)) },
    { name: `learn-${locale}`, text: JSON.stringify(getLearnContent(locale).articles) },
    { name: `quiz-${locale}`, text: JSON.stringify(getQuizContent(locale)) },
    { name: `messages-${locale}`, text: readMessageCatalogs(locale) },
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

// English groups thousands with commas; Ukrainian (and Intl for uk-UA) with a
// space or no-break space. Both spell the same number.
const THOUSANDS_SEPARATOR = '[,\\u00a0\\u202f ]';

function parseNumber(raw: string): number {
  return Number(raw.replace(new RegExp(THOUSANDS_SEPARATOR, 'g'), ''));
}

function collect(
  text: string,
  patterns: RegExp | readonly RegExp[],
): Array<{ value: number; context: string }> {
  const hits: Array<{ value: number; context: string }> = [];
  for (const pattern of Array.isArray(patterns) ? patterns : [patterns as RegExp]) {
    for (const match of text.matchAll(pattern)) {
      const index = match.index ?? 0;
      hits.push({
        value: parseNumber(match[1]!),
        context: text.slice(Math.max(0, index - 60), index + 60).replace(/\s+/g, ' '),
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
  it.each(sources)('$name: every percentage is in the verified allowlist', ({ name, text }) => {
    assertAllowed(name, collect(text, /(\d+(?:\.\d+)?)%/g), allowedPercents, 'percentage');
  });

  it.each(sources)('$name: every "N hours" figure is verified', ({ name, text }) => {
    assertAllowed(
      name,
      collect(text, durationPatterns('hours')),
      allowedHourFigures,
      'hour figure',
    );
  });

  it.each(sources)('$name: every "N weeks" figure is verified', ({ name, text }) => {
    assertAllowed(
      name,
      collect(text, durationPatterns('weeks')),
      allowedWeekFigures,
      'week figure',
    );
  });

  it.each(sources)('$name: every "N days" figure is verified', ({ name, text }) => {
    assertAllowed(name, collect(text, durationPatterns('days')), allowedDayFigures, 'day figure');
  });

  it.each(sources)('$name: every "N CST" amount is verified', ({ name, text }) => {
    assertAllowed(
      name,
      collect(
        text,
        new RegExp(`(\\d{1,3}(?:${THOUSANDS_SEPARATOR}\\d{3})*(?:\\.\\d+)?)\\s+CST\\b`, 'g'),
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
