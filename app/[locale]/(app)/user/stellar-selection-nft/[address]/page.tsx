import { Suspense } from 'react';
import type { Metadata, ResolvingMetadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { capCacheWindow } from '@/lib/cacheWindow';
import { createPageMetadata } from '@/utils/seo';
import { get_raffle_nft_winnings_by_user } from '@/services/api/stellarSelection';
import { PageMessages } from '@/components/i18n/PageMessages';
import { participantAddress } from '@/components/winnings/participantAddress';

import { QuerySeed, seedsDisabled, type QuerySeedEntry } from '../../../QuerySeed';
import { readSignatureSeeds, type SignatureSeedMap } from '../../../allocation/signatureSeedReads';

import UserStellarSelectionNFTPage, {
  UserStellarSelectionNFTRoute,
} from './UserStellarSelectionNFTPage';

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string; address: string }> },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { locale, address } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return createPageMetadata(
    parent,
    t('userStellarSelectionNft.title'),
    t('userStellarSelectionNft.description'),
    undefined,
    `/user/stellar-selection-nft/${address}`,
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
 * The participant's selections, read on the server with the checksummed
 * address (keyed like `useStellarSelectionNFTAllocationsByUser`), and the
 * seeds of the Signatures on the first page, so the figures and the first
 * plates are in the first HTML. A failed read seeds nothing; nothing is
 * read for a segment that is not an address, or under the e2e harness.
 */
async function readSelections(
  address: `0x${string}` | null,
): Promise<{ seeds: QuerySeedEntry[]; artSeeds: SignatureSeedMap | undefined }> {
  if (address === null || seedsDisabled()) return { seeds: [], artSeeds: undefined };
  try {
    const rows = await get_raffle_nft_winnings_by_user(address);
    const newest = [...rows]
      .sort((a, b) => (b.TimeStamp ?? 0) - (a.TimeStamp ?? 0))
      .slice(0, 12)
      .flatMap((row) => (typeof row.TokenId === 'number' ? [row.TokenId] : []));
    return {
      seeds: [{ queryKey: ['raffleNFTWinningsByUser', address], data: rows, at: Date.now() }],
      artSeeds: await readSignatureSeeds(newest),
    };
  } catch {
    return { seeds: [], artSeeds: undefined };
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; address: string }>;
}) {
  const { locale, address: rawAddress } = await params;
  setRequestLocale(locale);
  const address = participantAddress(rawAddress);
  const { seeds, artSeeds } = await readSelections(address);
  if (seeds.length === 0) await capCacheWindow('pending');
  return (
    <PageMessages namespaces={['detail', 'glossary', 'myPages', 'statistics', 'tables', 'traits']}>
      <QuerySeed seeds={seeds}>
        {/* The page number lives in the URL (`?page=2`), read on the client; the first page
            is the prerendered fallback. */}
        <Suspense
          fallback={<UserStellarSelectionNFTPage address={rawAddress} artSeeds={artSeeds} />}
        >
          <UserStellarSelectionNFTRoute address={rawAddress} artSeeds={artSeeds} />
        </Suspense>
      </QuerySeed>
    </PageMessages>
  );
}
