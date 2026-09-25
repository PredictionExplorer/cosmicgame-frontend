import type { Metadata, ResolvingMetadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { createPageMetadata } from '@/utils/seo';
import { PageMessages } from '@/components/i18n/PageMessages';

import { DashboardQuerySeed, QuerySeed } from '../../../QuerySeed';

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

// Dynamic-param pages render on demand; revalidate keeps live protocol data
// fresh instead of freezing the first render forever (see route-group refactor).
export const revalidate = 300;

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
  const seeds = await readCycleContributionsSeed(cycle);
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
