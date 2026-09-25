import type { Metadata, ResolvingMetadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { capCacheWindow } from '@/lib/cacheWindow';
import { createPageMetadata } from '@/utils/seo';
import { PageMessages } from '@/components/i18n/PageMessages';
import {
  readTransferHistorySeed,
  transferHistoryAddress,
} from '@/components/tokens/transferHistoryRoute';

import { QuerySeed, seedsDisabled } from '../../QuerySeed';

import CosmicTokenTransfersPage from './CosmicTokenTransfersPage';

interface PageProps {
  params: Promise<{ locale: string; address: string }>;
}

export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { locale, address } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  // The tab names whose history it is ("CST transfers · 0xA169…63B6"), as the H1 and
  // the address under it do, so two addresses' tabs can be told apart.
  return createPageMetadata(
    parent,
    t('cosmicTokenTransfers.title', { address: transferHistoryAddress(address) }),
    t('cosmicTokenTransfers.description'),
    undefined,
    `/cosmic-token-transfer/${address}`,
    { index: false, locale },
  );
}

/**
 * No history renders at build time: each address's renders on its first
 * visit and is then served from the cache for five minutes
 * (`CACHE_WINDOW.live`: a history grows with every transfer), or a minute
 * when its read failed.
 */
export function generateStaticParams() {
  return [];
}

export const revalidate = 300;

export default async function Page({ params }: PageProps) {
  const { locale, address } = await params;
  setRequestLocale(locale);
  // The history's first read, so the ledger is in the HTML (no layout shift).
  const seeds = seedsDisabled() ? [] : await readTransferHistorySeed('cst', address);
  if (seeds.length === 0) await capCacheWindow('pending');
  return (
    <PageMessages namespaces={['myPages', 'tables']}>
      <QuerySeed seeds={seeds}>
        <CosmicTokenTransfersPage address={address} />
      </QuerySeed>
    </PageMessages>
  );
}
