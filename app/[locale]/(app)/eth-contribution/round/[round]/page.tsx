import type { Metadata, ResolvingMetadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { capCacheWindow, type CacheWindow } from '@/lib/cacheWindow';
import { createPageMetadata } from '@/utils/seo';
import { PageMessages } from '@/components/i18n/PageMessages';

import { readDashboard } from '../../../publicDataReads';
import { DashboardQuerySeed, QuerySeed, seedsDisabled } from '../../../QuerySeed';

import EthDonationByRoundPage from './EthDonationByRoundPage';
import { readCycleContributionsSeed } from './cycleContributionsSeed';

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string; round: string }> },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { locale, round } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  // The tab names the cycle, as the H1 does ("Cycle 1 contributions").
  return createPageMetadata(
    parent,
    t('ethContributionByCycle.title', { cycle: round }),
    t('ethContributionByCycle.description', { cycle: round }),
    undefined,
    `/eth-contribution/round/${round}`,
    { index: false, locale },
  );
}

/**
 * No cycle renders at build time: each renders on its first visit and is
 * then served from the cache. A finalized cycle's contributions are final,
 * so its render keeps a day (`CACHE_WINDOW.final`); the live cycle's grow
 * and keep five minutes, and a render whose reads failed a minute.
 */
export function generateStaticParams() {
  return [];
}

export const revalidate = 86400;

/** How long the render may be served: final once the cycle is behind the live one. */
function cycleContributionsWindow(
  cycle: number,
  seeds: readonly unknown[],
  liveCycle: number | null | undefined,
): CacheWindow {
  if (seeds.length === 0 || typeof liveCycle !== 'number') return 'pending';
  return cycle < liveCycle ? 'final' : 'live';
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; round: string }>;
}) {
  const { locale, round } = await params;
  setRequestLocale(locale);
  const cycle = Number(round);
  // The cycle's first read, so its contributions are in the HTML (no layout shift),
  // and the dashboard's, so the live cycle bounds the neighbours and the cycle's own
  // page link is in the HTML too instead of arriving after hydration.
  const [seeds, dashboard] = await Promise.all([
    readCycleContributionsSeed(cycle),
    seedsDisabled() ? null : readDashboard(),
  ]);
  await capCacheWindow(cycleContributionsWindow(cycle, seeds, dashboard?.data?.CurRoundNum));
  return (
    <PageMessages namespaces={['ethContribution', 'tables']}>
      <DashboardQuerySeed>
        <QuerySeed seeds={seeds}>
          <EthDonationByRoundPage round={cycle} />
        </QuerySeed>
      </DashboardQuerySeed>
    </PageMessages>
  );
}
