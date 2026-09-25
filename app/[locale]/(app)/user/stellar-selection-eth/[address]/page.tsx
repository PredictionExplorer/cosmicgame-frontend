import type { Metadata, ResolvingMetadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { capCacheWindow } from '@/lib/cacheWindow';
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

/**
 * No participant's page renders at build time: each renders on its first visit and is
 * then served from the cache for five minutes (`CACHE_WINDOW.live`: each cycle may add a selection),
 * or a minute when its reads failed.
 */
export function generateStaticParams() {
  return [];
}

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
  if (seeds.length === 0) await capCacheWindow('pending');
  return (
    <PageMessages namespaces={['glossary', 'myPages', 'statistics', 'tables']}>
      <QuerySeed seeds={seeds}>
        <UserStellarSelectionETHPage address={address} />
      </QuerySeed>
    </PageMessages>
  );
}
