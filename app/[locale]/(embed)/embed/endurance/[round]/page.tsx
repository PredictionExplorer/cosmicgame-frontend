import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { readDashboard } from '@/app/[locale]/(app)/publicDataReads';
import { seedsDisabled } from '@/app/[locale]/(app)/QuerySeed';

import { get_bid_list_by_round } from '@/services/api/rounds';
import { toFiniteNumber } from '@/utils/finiteNumber';
import { parseCanonicalNonNegativeSafeInteger } from '@/utils/routeParams';
import { createMetadata } from '@/utils/seo';

import EmbedEnduranceChart from './EmbedEnduranceChart';

/**
 * The cycle in the URL; anything but a canonical cycle number ("abc", "-1",
 * "01") is not a page. A cycle that has not opened yet is not one either,
 * which only the live dashboard knows: the chart decides that in the browser
 * rather than caching a 404 for a cycle that opens a minute later.
 */
function cycleOrNotFound(round: string): number {
  const cycle = parseCanonicalNonNegativeSafeInteger(round);
  if (cycle === null) notFound();
  return cycle;
}

/**
 * How many addresses held the lead in `cycle`: every gesture hands its maker
 * the lead, so it is the number of distinct gesture makers. It sizes the
 * chart's loading lanes, so the window keeps its height when they arrive.
 */
async function readLeadLaneCount(cycle: number): Promise<number | undefined> {
  try {
    const gestures = await get_bid_list_by_round(cycle, 'asc');
    const makers = new Set(
      gestures
        .map((gesture) => gesture.BidderAddr?.toLowerCase())
        .filter((address): address is string => Boolean(address)),
    );
    return makers.size;
  } catch {
    return undefined;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; round: string }>;
}): Promise<Metadata> {
  const { locale, round } = await params;
  const cycle = cycleOrNotFound(round);
  const t = await getTranslations({ locale, namespace: 'meta' });
  const tStatistics = await getTranslations({ locale, namespace: 'statistics' });
  const metadata = createMetadata(
    // The tab names the chart and its cycle, as the page's H1 does.
    tStatistics('embed.title', { cycle }),
    t('embedEndurance.description'),
    undefined,
    `/embed/endurance/${round}`,
    { index: false, locale },
  );

  return {
    ...metadata,
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    },
  };
}

// Dynamic-param pages render on demand; revalidate keeps live protocol data
// fresh instead of freezing the first render forever (see route-group refactor).
export const revalidate = 300;

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; round: string }>;
}) {
  const { locale, round } = await params;
  const cycle = cycleOrNotFound(round);
  setRequestLocale(locale);
  // Under the e2e harness the browser's mocked API is the only source, so
  // nothing is read here (the same rule as QuerySeed).
  const seeded = !seedsDisabled();
  const [dashboard, lanes] = seeded
    ? await Promise.all([readDashboard(), readLeadLaneCount(cycle)])
    : [null, undefined];
  const liveCycle = toFiniteNumber(dashboard?.data?.CurRoundNum) ?? undefined;
  // The embed layout serializes the chart's namespaces (EMBED_NAMESPACES).
  return <EmbedEnduranceChart roundNum={cycle} seedLiveCycle={liveCycle} expectedLanes={lanes} />;
}
