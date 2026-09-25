import { useTranslations } from 'next-intl';

import { PendingPlate } from '@/components/ui/art-frame';
import { Skeleton } from '@/components/ui/skeleton';

import { DETAIL_GRID_CLASS } from './detailLayout';

/**
 * The provenance ledger's rows (cycle, imprinted, allocation, recipient,
 * owner, rarity, anchoring), with the two that carry a caption line
 * (imprinted: how long ago; rarity: the rarest trait) and the ones whose
 * value is a 24px link, so the action row below does not move when the
 * record arrives.
 */
const SPEC_ROWS: readonly { caption: boolean; link: boolean }[] = [
  { caption: false, link: true },
  { caption: true, link: true },
  { caption: false, link: false },
  { caption: false, link: true },
  { caption: false, link: true },
  { caption: true, link: false },
  { caption: false, link: true },
];

/**
 * The detail page while the token record loads, matched to its layout: the
 * pending plate at the art's ratio with the label row under it, and the wall
 * label beside it (breadcrumb, name, caption line, ledger rows). The route's
 * loading boundary (detail/[id]/loading.tsx) and the page's client loading
 * state both render it, so the layout never changes between the two. It
 * announces "Loading" once.
 */
export function NFTDetailSkeleton() {
  const t = useTranslations('common');
  return (
    <div
      role="status"
      aria-busy="true"
      className="site-container"
      data-testid="nft-detail-skeleton"
    >
      <span className="sr-only">{t('status.loadingEllipsis')}</span>
      <div className={DETAIL_GRID_CLASS}>
        <div className="flex flex-col gap-3 max-sm:-mx-[var(--gutter)]">
          <PendingPlate busy className="max-sm:rounded-none" />
          <div className="flex items-center gap-2 max-sm:px-[var(--gutter)]">
            <Skeleton className="h-11 w-44 rounded-control sm:h-9" />
            <Skeleton className="ml-auto h-11 w-40 rounded-control sm:h-9" />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          {/* The loaded rows' own boxes (RecordRow, narrow): each placeholder
              sits in a line of the type it stands for, so a row is as tall
              as the text that replaces it. */}
          <div className="divide-y divide-rule-faint border-y border-rule-faint">
            {SPEC_ROWS.map(({ caption, link }, row) => (
              <div
                key={row}
                className="grid grid-cols-[minmax(0,7.5rem)_minmax(0,1fr)] items-baseline gap-x-4 py-3"
                data-testid="spec-row-skeleton"
              >
                <p className="type-label">
                  <Skeleton as="span" className="inline-block h-3 w-16 align-middle" />
                </p>
                <div className="type-body-sm">
                  <p className={link ? 'flex min-h-6 items-center' : undefined}>
                    <Skeleton as="span" className="inline-block h-3 w-2/3 align-middle" />
                  </p>
                  {caption ? (
                    <p className="mt-0.5 type-caption" data-testid="spec-caption-skeleton">
                      <Skeleton
                        as="span"
                        shine={false}
                        className="inline-block h-2.5 w-1/3 align-middle"
                      />
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-11 w-24 rounded-control sm:h-9" />
            <Skeleton className="h-11 w-36 rounded-control sm:h-9" />
          </div>
        </div>
      </div>
    </div>
  );
}
