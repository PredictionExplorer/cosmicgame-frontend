import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { readDashboard } from '@/app/[locale]/(app)/publicDataReads';
import { seedsDisabled } from '@/app/[locale]/(app)/QuerySeed';

import { toFiniteNumber } from '@/utils/finiteNumber';
import { parseCanonicalNonNegativeSafeInteger } from '@/utils/routeParams';
import { createMetadata } from '@/utils/seo';

import EmbedEnduranceChart from './EmbedEnduranceChart';
import { readLeadLaneCount } from './leadLaneCount';

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

/**
 * No cycle renders at build time: each one renders on its first visit and is
 * then served from the cache for five minutes, so a shared link costs one
 * server render per cycle and locale, not one per visitor. The chart itself
 * reads the cycle's gestures in the browser; the cached HTML carries only the
 * live cycle (for the badge) and the lane count (for the skeleton's height),
 * and the browser's own dashboard read corrects a badge that went stale.
 */
export function generateStaticParams() {
  return [];
}

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
  if (seedsDisabled()) return <EmbedEnduranceChart roundNum={cycle} />;

  const dashboard = await readDashboard();
  const liveCycle = toFiniteNumber(dashboard.data?.CurRoundNum) ?? undefined;
  const lanes = await readLeadLaneCount(cycle, liveCycle);
  // The embed layout serializes the chart's namespaces (EMBED_NAMESPACES).
  return <EmbedEnduranceChart roundNum={cycle} seedLiveCycle={liveCycle} expectedLanes={lanes} />;
}
