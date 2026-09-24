'use client';

import { useTranslations } from 'next-intl';

import { formatId } from '@/utils/format';
import { useCSTInfo } from '@/hooks/useApiQuery';
import { signatureMedia, signatureSources } from '@/components/nft/signatureMedia';
import { ArtFrame, PendingPlate } from '@/components/ui/art-frame';
import { TableLink } from '@/components/ui/data-table';

export interface TransferTokenCellProps {
  tokenId: number;
  /**
   * The Signature's seed from the page's collection read. `undefined` when
   * that read lacks the token (it is newer than the read, or the read
   * failed): the plate then looks the one token up itself.
   */
  seed: string | number | null | undefined;
  /** The collection read is still running: the plate waits instead of looking up. */
  seedPending: boolean;
}

/**
 * A moved Signature in the NFT transfer ledger: its artwork on a small black
 * plate (56px wide, the art's own ratio) beside its number, which links to
 * its page. The plate is decorative; the number names the token. It reads
 * only the ledger page's own catalogs.
 */
export function TransferTokenCell({ tokenId, seed, seedPending }: TransferTokenCellProps) {
  const t = useTranslations('myPages.transferHistory');
  const needsLookup = seed === undefined && !seedPending;
  const lookup = useCSTInfo(needsLookup ? tokenId : null);
  const resolvedSeed = needsLookup ? lookup.data?.Seed : seed;
  const waiting = (seed === undefined && seedPending) || (needsLookup && lookup.isLoading);

  return (
    <span className="inline-flex items-center gap-3 align-middle">
      {waiting ? (
        <PendingPlate busy density="compact" alt="" className="w-14 shrink-0 rounded-edge" />
      ) : (
        <ArtFrame
          sources={signatureSources(signatureMedia(resolvedSeed))}
          alt=""
          sizes="56px"
          density="compact"
          unavailableLabel={t('artUnavailable')}
          unavailableDetail={formatId(tokenId)}
          className="w-14 shrink-0"
        />
      )}
      {/* A 24px row: the number is the cell's one link, on a phone too. */}
      <TableLink href={`/detail/${tokenId}`} className="inline-flex min-h-6 items-center">
        <span className="font-mono tabular-nums">{formatId(tokenId)}</span>
      </TableLink>
    </span>
  );
}
