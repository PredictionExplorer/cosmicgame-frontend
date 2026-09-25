import type { Metadata, ResolvingMetadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { isAddress } from 'viem';

import { formatAddress } from '@/utils/format';
import { capCacheWindow } from '@/lib/cacheWindow';
import { createPageMetadata } from '@/utils/seo';
import { PageMessages } from '@/components/i18n/PageMessages';

import { QuerySeed } from '../../QuerySeed';

import MarketingRewardsPage from './MarketingRewardsPage';
import { readOutreachAddressSeeds } from './outreachAddressSeed';

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string; address: string }> },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { locale, address } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  // The tab names whose record it is, so two contributors' tabs differ.
  const shown = isAddress(address, { strict: false }) ? formatAddress(address) : address;
  return createPageMetadata(
    parent,
    t('outreachAddress.title', { address: shown }),
    t('outreachAddress.description'),
    undefined,
    `/marketing/${address}`,
    { index: false, locale },
  );
}

/**
 * No contributor's page renders at build time: each renders on its first visit and is
 * then served from the cache for five minutes (`CACHE_WINDOW.live`: each outreach allocation adds to it),
 * or a minute when its reads failed.
 */
export function generateStaticParams() {
  return [];
}

export const revalidate = 300;

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; address: string }>;
}) {
  const { locale, address } = await params;
  setRequestLocale(locale);
  // The allocations and the ranking in the HTML: no skeletons, no layout shift.
  const seeds = await readOutreachAddressSeeds(address);
  if (seeds.length === 0) await capCacheWindow('pending');
  return (
    <PageMessages namespaces={['marketing', 'tables']}>
      <QuerySeed seeds={seeds}>
        <MarketingRewardsPage address={address} />
      </QuerySeed>
    </PageMessages>
  );
}
