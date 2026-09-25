import type { Metadata, ResolvingMetadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { createPageMetadata } from '@/utils/seo';
import { get_raffle_deposits_by_user } from '@/services/api/stellarSelection';
import { PageMessages } from '@/components/i18n/PageMessages';
import { participantAddress } from '@/components/winnings/participantAddress';

import { QuerySeed, seedsDisabled, type QuerySeedEntry } from '../../../QuerySeed';

import UserStellarSelectionETHPage from './UserStellarSelectionETHPage';

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string; address: string }> },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { locale, address } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return createPageMetadata(
    parent,
    t('userStellarSelectionEth.title'),
    t('userStellarSelectionEth.description'),
    undefined,
    `/user/stellar-selection-eth/${address}`,
    { index: false, locale },
  );
}

// Dynamic-param pages render on demand; revalidate keeps live protocol data
// fresh instead of freezing the first render forever (see route-group refactor).
export const revalidate = 300;

/**
 * The participant's Stellar Selection ETH, read on the server with the
 * checksummed address (keyed like `useStellarSelectionDepositsByUser`), so
 * the figures and the ledger are in the first HTML. A failed read seeds
 * nothing; nothing is read for a segment that is not an address, or under
 * the e2e harness.
 */
async function readDeposits(address: `0x${string}` | null): Promise<QuerySeedEntry[]> {
  if (address === null || seedsDisabled()) return [];
  try {
    const rows = await get_raffle_deposits_by_user(address);
    return [{ queryKey: ['raffleDepositsByUser', address], data: rows, at: Date.now() }];
  } catch {
    return [];
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; address: string }>;
}) {
  const { locale, address } = await params;
  setRequestLocale(locale);
  const seeds = await readDeposits(participantAddress(address));
  return (
    <PageMessages namespaces={['glossary', 'myPages', 'statistics', 'tables']}>
      <QuerySeed seeds={seeds}>
        <UserStellarSelectionETHPage address={address} />
      </QuerySeed>
    </PageMessages>
  );
}
