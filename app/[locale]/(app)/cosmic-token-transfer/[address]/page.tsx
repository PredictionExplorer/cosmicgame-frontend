import type { Metadata, ResolvingMetadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { PageMessages } from '@/components/i18n/PageMessages';
import {
  readTransferHistorySeed,
  transferHistoryMetadata,
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
  return transferHistoryMetadata('cst', await params, parent);
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
