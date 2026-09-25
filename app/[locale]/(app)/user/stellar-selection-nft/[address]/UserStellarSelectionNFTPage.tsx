'use client';

import { useMemo, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import type { PageHeaderFigure } from '@/components/layout/PageHeader';
import { ArtTag, PendingPlate } from '@/components/ui/art-frame';
import { buttonVariants } from '@/components/ui/button';
import { DateTime } from '@/components/ui/date-time';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { PageShell } from '@/components/ui/page-shell';
import { TablePagination } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { SignatureCard } from '@/components/winnings/SignatureCard';
import {
  InvalidParticipantState,
  STELLAR_SELECTION_FAQ_HREF,
  StellarSelectionHeader,
} from '@/components/winnings/StellarSelectionHeader';
import { participantAddress } from '@/components/winnings/participantAddress';
import { useSignatureIndex } from '@/components/winnings/useSignatureIndex';
import { useStellarSelectionNFTAllocationsByUser } from '@/hooks/useApiQuery';
import { useFormat } from '@/hooks/useFormat';
import { StellarSelectionIcon } from '@/lib/conceptIcons';
import { formatId } from '@/utils/format/ids';
import type { StellarSelectionNFTRecipient } from '@/services/api/types';

/** Plates per page: four rows of three on a desktop, six rows of two on a phone. */
const PAGE_SIZE = 12;

const GRID_CLASS = 'grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-3 lg:gap-x-8';

type SelectionSource = 'participant' | 'anchorHolder';

/**
 * Who the NFT was selected as: a participant (by their gestures), or an
 * anchor-holder, of a Random Walk NFT or of a Cosmic Signature NFT.
 */
function selectionSource(row: StellarSelectionNFTRecipient): SelectionSource {
  return row.IsStaker ? 'anchorHolder' : 'participant';
}

/**
 * The Cosmic Signature NFTs Stellar Selection allocated to a participant,
 * shown as the art itself: each Signature on its plate with a wall label
 * (name or number, cycle and date, and what the participant was selected
 * as), newest first.
 */
function UserStellarSelectionNFTPage({ address: rawAddress }: { address: string }) {
  const t = useTranslations('statistics');
  const tDetail = useTranslations('detail');
  const format = useFormat();
  const address = participantAddress(rawAddress);
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useStellarSelectionNFTAllocationsByUser(address);
  const signatures = useSignatureIndex();

  const rows = useMemo(
    () =>
      [...(data ?? [])]
        .filter((row) => typeof row.TokenId === 'number')
        .sort((a, b) => (b.TimeStamp ?? 0) - (a.TimeStamp ?? 0)),
    [data],
  );
  const cycles = useMemo(() => new Set(rows.map((row) => row.RoundNum)).size, [rows]);

  if (!address) {
    return (
      <PageShell variant="data" backdrop="signature">
        <InvalidParticipantState />
      </PageShell>
    );
  }

  const pending = <Skeleton className="h-7 w-12" />;
  const figures: PageHeaderFigure[] = [
    {
      id: 'count',
      label: t('stellarSelectionNft.figures.count'),
      value: isLoading ? pending : format.count(rows.length),
    },
    {
      id: 'cycles',
      label: t('stellarSelectionNft.figures.cycles'),
      value: isLoading ? pending : format.count(cycles),
    },
  ];

  const visible = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <PageShell variant="data" backdrop="signature">
      <StellarSelectionHeader
        kind="nft"
        address={address}
        // An address with nothing selected yet (or whose read failed) reads from its state alone.
        figures={isError || (!isLoading && rows.length === 0) ? undefined : figures}
        empty={!isLoading && !isError && rows.length === 0}
      />

      {isError ? (
        <ErrorState
          variant="page"
          headingLevel={2}
          title={t('stellarSelectionNft.errorTitle')}
          message={t('stellarSelectionPages.errorMessage')}
          onRetry={() => void refetch()}
        />
      ) : isLoading ? (
        <ul className={GRID_CLASS} aria-busy="true" aria-label={t('stellarSelectionNft.gridLabel')}>
          {Array.from({ length: 6 }, (_, index) => (
            <li key={index} className="flex flex-col gap-3">
              <PendingPlate busy density="compact" />
              <Skeleton className="h-4 w-3/5" />
              <Skeleton className="h-3 w-2/5" />
            </li>
          ))}
        </ul>
      ) : rows.length === 0 ? (
        <EmptyState
          variant="page"
          headingLevel={2}
          icon={<StellarSelectionIcon aria-hidden className="size-6" />}
          title={t('stellarSelectionNft.emptyTitle')}
          description={t('stellarSelectionNft.emptyDescription')}
          action={
            <Link
              href={STELLAR_SELECTION_FAQ_HREF}
              className={buttonVariants({ variant: 'outline', size: 'sm' })}
            >
              {t('stellarSelectionPages.howItWorks')}
              <ArrowRight aria-hidden className="size-4" />
            </Link>
          }
        />
      ) : (
        <section aria-label={t('stellarSelectionNft.gridLabel')} className="mb-10">
          {signatures.state === 'failed' ? (
            <ErrorState
              variant="inline"
              headingLevel={2}
              tone="warning"
              title={t('stellarSelectionNft.artFailed')}
              onRetry={signatures.retry}
              className="mb-6"
            />
          ) : null}
          <ul className={GRID_CLASS}>
            {visible.map((row) => {
              const tokenId = row.TokenId as number;
              const entry = signatures.get(tokenId);
              const id = formatId(tokenId);
              return (
                <li key={`${row.EvtLogId ?? tokenId}-${tokenId}`}>
                  <SignatureCard
                    tokenId={tokenId}
                    seed={entry?.seed}
                    artState={signatures.state}
                    title={entry?.name ?? t('stellarSelectionNft.unnamed', { id })}
                    meta={[
                      entry?.name ? <span className="type-mono">{id}</span> : null,
                      typeof row.RoundNum === 'number' ? (
                        <Link href={`/allocation/${row.RoundNum}`} className="link-quiet">
                          {t('stellarSelectionNft.cycle', { cycle: row.RoundNum })}
                        </Link>
                      ) : null,
                      row.TimeStamp ? <DateTime timestamp={row.TimeStamp} /> : null,
                    ]}
                    // Two short tags rather than one long one, so neither wraps in a phone column.
                    tags={
                      <>
                        <ArtTag>{t(`stellarSelectionNft.sources.${selectionSource(row)}`)}</ArtTag>
                        {row.IsStaker && row.IsRWalk ? (
                          <ArtTag>{t('stellarSelectionNft.sources.randomWalk')}</ArtTag>
                        ) : null}
                      </>
                    }
                    sizes="(min-width: 1024px) 26rem, (min-width: 640px) 45vw, 50vw"
                    unavailableLabel={tDetail('image.artworkUnavailable')}
                    unavailableDetail={id}
                  />
                </li>
              );
            })}
          </ul>
          <TablePagination
            page={page}
            pageSize={PAGE_SIZE}
            total={rows.length}
            onPageChange={setPage}
            className="mt-10"
          />
        </section>
      )}
    </PageShell>
  );
}

export default UserStellarSelectionNFTPage;
