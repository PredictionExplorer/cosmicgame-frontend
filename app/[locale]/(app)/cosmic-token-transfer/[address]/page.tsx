import type { Metadata, ResolvingMetadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

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

// Dynamic-param pages render on demand; revalidate keeps live protocol data
// fresh instead of freezing the first render forever (see route-group refactor).
export const revalidate = 300;

export default async function Page({ params }: PageProps) {
  const { locale, address } = await params;
  setRequestLocale(locale);
  // The history's first read, so the ledger is in the HTML (no layout shift).
  const seeds = seedsDisabled() ? [] : await readTransferHistorySeed('cst', address);
  return (
    <PageMessages namespaces={['myPages', 'tables']}>
      <QuerySeed seeds={seeds}>
        <CosmicTokenTransfersPage address={address} />
      </QuerySeed>
    </PageMessages>
  );
}
