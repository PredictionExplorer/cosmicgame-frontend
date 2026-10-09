'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

import { formatId } from '@/utils/format';
import { Link } from '@/i18n/navigation';
import { AddressChip } from '@/components/ui/address-chip';
import { WallLabel } from '@/components/ui/art-frame';
import { TxProofLink } from '@/components/ui/data-table';
import { DateTime } from '@/components/ui/date-time';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { TablePagination } from '@/components/ui/pagination';
import { SectionHeader } from '@/components/ui/section-header';
import { SkeletonArtPlate, Skeleton } from '@/components/ui/skeleton';
import { useCycleCell } from '@/components/tables/useCycleCell';
import { useSignatureIndex } from '@/components/winnings/useSignatureIndex';
import type { AnchorDistributionImprint } from '@/services/api';

import { TokenPlate } from './TokenPlate';

/** Cycles per page: each cycle's selections hang as one row of plates or two. */
export const IMPRINT_CYCLES_PER_PAGE = 2;

const GRID_CLASS = 'grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-5';

interface CycleImprints {
  cycle: number;
  /** When the cycle's selections were imprinted: one finalization, one transaction. */
  timeStamp: number | undefined;
  txHash: string | undefined;
  imprints: AnchorDistributionImprint[];
}

/** The imprints grouped by the cycle whose finalization selected them, newest cycle first. */
export function groupImprintsByCycle(list: readonly AnchorDistributionImprint[]): CycleImprints[] {
  const byCycle = new Map<number, CycleImprints>();
  for (const imprint of list) {
    const group = byCycle.get(imprint.RoundNum) ?? {
      cycle: imprint.RoundNum,
      timeStamp: imprint.TimeStamp,
      txHash: imprint.TxHash,
      imprints: [],
    };
    group.imprints.push(imprint);
    byCycle.set(imprint.RoundNum, group);
  }
  return [...byCycle.values()]
    .sort((a, b) => b.cycle - a.cycle)
    .map((group) => ({
      ...group,
      imprints: [...group.imprints].sort((a, b) => a.TokenId - b.TokenId),
    }));
}

interface SelectionImprintGalleryProps {
  list: readonly AnchorDistributionImprint[];
  title: string;
  description?: string;
  loading?: boolean;
  error?: string;
  errorTitle?: string;
  onRetry?: () => void;
  className?: string;
}

/**
 * The Anchored-NFT Stellar Selection imprints as what they are, newly
 * imprinted Signatures: grouped by the cycle whose finalization selected
 * them (the cycle, its moment as the transaction's proof, and how many were
 * selected, said once per cycle rather than on every row), then the plates
 * with wall labels (the token and its recipient). A few cycles a page, the
 * newest first. A failed read says so with a retry, never "no imprints yet".
 */
export function SelectionImprintGallery({
  list,
  title,
  description,
  loading = false,
  error,
  errorTitle,
  onRetry,
  className,
}: SelectionImprintGalleryProps) {
  const t = useTranslations('anchoring');
  const tTables = useTranslations('tables');
  const tCommon = useTranslations('common');
  const cycleCell = useCycleCell();
  const [page, setPage] = useState(1);
  // The imprints carry no seed: one collection read serves every plate.
  const signatures = useSignatureIndex({ enabled: list.length > 0 });
  const groups = useMemo(() => groupImprintsByCycle(list), [list]);
  const pageCount = Math.max(1, Math.ceil(groups.length / IMPRINT_CYCLES_PER_PAGE));
  const currentPage = Math.min(page, pageCount);
  const visible = groups.slice(
    (currentPage - 1) * IMPRINT_CYCLES_PER_PAGE,
    currentPage * IMPRINT_CYCLES_PER_PAGE,
  );

  return (
    <section aria-labelledby="selection-imprints-heading" className={className}>
      <SectionHeader
        headingId="selection-imprints-heading"
        title={title}
        description={description}
      />
      {loading ? (
        <div role="status" aria-label={tCommon('status.loading')}>
          <Skeleton className="mb-5 h-5 w-48" />
          <ul aria-hidden className={GRID_CLASS}>
            {Array.from({ length: 5 }, (_, index) => (
              <li key={index} className="flex flex-col gap-3">
                <SkeletonArtPlate />
                <Skeleton className="h-4 w-2/3" />
              </li>
            ))}
          </ul>
        </div>
      ) : error ? (
        <ErrorState
          variant="panel"
          headingLevel={3}
          title={errorTitle}
          message={error}
          onRetry={onRetry}
        />
      ) : groups.length === 0 ? (
        <EmptyState
          headingLevel={3}
          title={t('common.empty.imprints.title')}
          description={t('common.empty.imprints.description')}
        />
      ) : (
        <>
          <div className="space-y-12">
            {visible.map((group) => (
              <section key={group.cycle} aria-labelledby={`selection-cycle-${group.cycle}`}>
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-rule-faint pb-3">
                  <h3 id={`selection-cycle-${group.cycle}`} className="type-title text-foreground">
                    {cycleCell(group.cycle)}
                  </h3>
                  <p className="type-caption text-subtle">
                    {group.txHash ? (
                      <TxProofLink hash={group.txHash}>
                        <DateTime timestamp={group.timeStamp} year="always" showZone />
                      </TxProofLink>
                    ) : (
                      <DateTime timestamp={group.timeStamp} year="always" showZone />
                    )}
                    {' · '}
                    {t('ledgers.imprints.selections', { count: group.imprints.length })}
                  </p>
                </div>
                <ul className={`mt-6 ${GRID_CLASS}`}>
                  {group.imprints.map((imprint) => {
                    const id = formatId(imprint.TokenId);
                    const href = `/detail/${imprint.TokenId}`;
                    return (
                      <li key={imprint.EvtLogId} className="min-w-0">
                        <figure className="flex flex-col gap-3">
                          {/* A pointer shortcut; the number below is the one named link. */}
                          <Link href={href} tabIndex={-1} aria-hidden className="block">
                            <TokenPlate
                              collection="cosmicSignature"
                              tokenId={imprint.TokenId}
                              seed={signatures.seedFor(imprint.TokenId)}
                              seedPending={signatures.state === 'loading'}
                              alt=""
                              sizes="(min-width: 1024px) 14rem, (min-width: 640px) 30vw, 45vw"
                            />
                          </Link>
                          <WallLabel
                            as="figcaption"
                            title={
                              <Link href={href} className="link-quiet font-mono tabular-nums">
                                {id}
                              </Link>
                            }
                          >
                            <p className="mt-1 flex flex-wrap items-center gap-x-2 type-caption text-subtle">
                              <span>{t('tables.randomWalkImprints.columns.recipient')}</span>
                              <AddressChip address={imprint.WinnerAddr} variant="plain" />
                            </p>
                          </WallLabel>
                        </figure>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
          <TablePagination
            page={currentPage}
            pageSize={IMPRINT_CYCLES_PER_PAGE}
            total={groups.length}
            onPageChange={setPage}
            label={tTables('pagination.labelFor', { table: title })}
            className="mt-10"
          />
        </>
      )}
    </section>
  );
}
