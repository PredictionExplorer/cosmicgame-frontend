'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import type { PageHeaderFigure } from '@/components/layout/PageHeader';
import { useWallPage } from '@/components/nft/useWallPage';
import { ArtTag, PendingPlate } from '@/components/ui/art-frame';
import { DateTime } from '@/components/ui/date-time';
import { ErrorState } from '@/components/ui/error-state';
import { PageShell } from '@/components/ui/page-shell';
import { TablePagination } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { AllocationSignatureCard } from '@/components/winnings/AllocationSignatureCard';
import { StellarSelectionEmpty } from '@/components/winnings/StellarSelectionEmpty';
import {
  InvalidParticipantState,
  StellarSelectionHeader,
} from '@/components/winnings/StellarSelectionHeader';
import { participantAddress } from '@/components/winnings/participantAddress';
import { useCycleHref } from '@/components/tables/useCycleHref';
import { useSignatureIndex } from '@/components/winnings/useSignatureIndex';
import { useStellarSelectionNFTAllocationsByUser } from '@/hooks/useApiQuery';
import { useFormat } from '@/hooks/useFormat';
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

interface UserStellarSelectionNFTPageProps {
  address: string;
  /**
   * Seeds and names of the Signatures on the first page, read on the server,
   * so the first plates and their titles are in the first HTML.
   */
  artSeeds?: Readonly<Record<string, { seed: string | number; name?: string }>>;
  /** The page in the URL (`UserStellarSelectionNFTRoute`); without it the page is local. */
  page?: number;
  onPageChange?: (page: number) => void;
}

/**
 * The Cosmic Signature NFTs Stellar Selection allocated to a participant,
 * shown as the art itself: each Signature on its plate with a wall label
 * (name or number, cycle and date, and what the participant was selected
 * as), newest first.
 */
function UserStellarSelectionNFTPage({
  address: rawAddress,
  artSeeds,
  page: urlPage,
  onPageChange,
}: UserStellarSelectionNFTPageProps) {
  const t = useTranslations('statistics');
  const tDetail = useTranslations('detail');
  const tTables = useTranslations('tables');
  const cycleHref = useCycleHref();
  const format = useFormat();
  const address = participantAddress(rawAddress);
  const [localPage, setLocalPage] = useState(1);
  const page = urlPage ?? localPage;
  const setPage = onPageChange ?? setLocalPage;

  const { data, isLoading, isError, refetch } = useStellarSelectionNFTAllocationsByUser(address);

  const rows = useMemo(
    () =>
      [...(data ?? [])]
        .filter((row) => typeof row.TokenId === 'number')
        .sort((a, b) => (b.TimeStamp ?? 0) - (a.TimeStamp ?? 0)),
    [data],
  );
  const cycles = useMemo(() => new Set(rows.map((row) => row.RoundNum)).size, [rows]);
  // The server's seeds draw the first page; the collection is read only for a plate they
  // do not cover (a later page, or a token newer than the server's read).
  const serverEntry = (tokenId: number) => artSeeds?.[String(tokenId)];
  const needsIndex = rows.some(
    (row) => typeof row.TokenId === 'number' && serverEntry(row.TokenId) === undefined,
  );
  const signatures = useSignatureIndex({ enabled: needsIndex });

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

  // A page past the end (a stale link) shows the last one.
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = rows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const empty = !isLoading && !isError && rows.length === 0;

  return (
    <PageShell variant="data" backdrop="signature">
      <StellarSelectionHeader
        kind="nft"
        address={address}
        // Confirmed zeros for an address with nothing selected yet, so the header never
        // collapses (and moves the page) once the read arrives; a failed read has no figures.
        figures={isError ? undefined : figures}
        empty={empty}
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
        <StellarSelectionEmpty kind="nft" address={address} />
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
              const entry = serverEntry(tokenId) ?? signatures.get(tokenId);
              const id = formatId(tokenId);
              return (
                <li key={`${row.EvtLogId ?? tokenId}-${tokenId}`}>
                  <AllocationSignatureCard
                    tokenId={tokenId}
                    seed={entry?.seed}
                    artState={serverEntry(tokenId) ? 'ready' : signatures.state}
                    title={entry?.name ?? t('stellarSelectionNft.unnamed', { id })}
                    meta={[
                      entry?.name ? <span className="type-mono">{id}</span> : null,
                      typeof row.RoundNum === 'number' ? (
                        <Link href={cycleHref(row.RoundNum)} className="link-quiet">
                          {tTables('allocation.cycle', { cycle: row.RoundNum })}
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
            page={currentPage}
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

/**
 * The page with its page number in the URL (`?page=2`), so Back from a
 * Signature returns to the same plates and a page can be shared. The route
 * renders it under Suspense with the first page as the prerendered fallback.
 */
export function UserStellarSelectionNFTRoute(
  props: Omit<UserStellarSelectionNFTPageProps, 'page' | 'onPageChange'>,
) {
  const { page, setPage } = useWallPage();
  return <UserStellarSelectionNFTPage {...props} page={page} onPageChange={setPage} />;
}

export default UserStellarSelectionNFTPage;
