'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { useFormat } from '@/hooks/useFormat';
import type { AnchorAction } from '@/services/api/types';
import { DateTime } from '@/components/ui/date-time';
import { TxProofLink } from '@/components/ui/data-table';

import type { AnchorCollection } from './anchorLinks';

export interface AnchorTimelineProps {
  collection: AnchorCollection;
  /** The anchor record. */
  anchor: AnchorAction;
  /** The release record, or `null` while the NFT is still anchored. */
  release: AnchorAction | null;
  className?: string;
}

interface TimelineEventProps {
  title: string;
  /** `current` marks an anchor that is still in place; `past` a completed step. */
  state: 'past' | 'current';
  when?: ReactNode;
  children?: ReactNode;
  last?: boolean;
}

function TimelineEvent({ title, state, when, children, last = false }: TimelineEventProps) {
  return (
    <li className="relative grid grid-cols-[1rem_minmax(0,1fr)] gap-x-3">
      {/* The rail: a dot per event joined by a hairline. */}
      <span aria-hidden className="relative flex justify-center">
        <span
          className={cn(
            'relative z-[1] mt-1.5 size-2.5 rounded-full',
            state === 'current' ? 'bg-positive ring-4 ring-positive-surface' : 'bg-subtle',
          )}
        />
        {last ? null : <span className="absolute inset-y-0 top-4 w-px bg-rule" />}
      </span>
      <div className={cn('min-w-0 space-y-1', last ? 'pb-0' : 'pb-6')}>
        <p className="type-title text-foreground">{title}</p>
        {when ? <p className="type-body-sm text-muted-foreground">{when}</p> : null}
        {children}
      </div>
    </li>
  );
}

/**
 * An anchor's life on one rail: when it was anchored (with its transaction),
 * then either its release, with the ETH it retrieved, or where it stands now
 * while it is still anchored.
 */
export function AnchorTimeline({ collection, anchor, release, className }: AnchorTimelineProps) {
  const t = useTranslations('anchoring');
  const format = useFormat();

  const provenDate = (action: AnchorAction) =>
    action.TxHash ? (
      <TxProofLink hash={action.TxHash}>
        <DateTime timestamp={action.TimeStamp} variant="full" />
      </TxProofLink>
    ) : (
      <DateTime timestamp={action.TimeStamp} variant="full" />
    );

  return (
    <ol className={className}>
      <TimelineEvent
        title={t('anchorActionDetail.timeline.anchored')}
        state="past"
        when={provenDate(anchor)}
      >
        <p className="type-caption text-subtle">
          {t('anchorActionDetail.timeline.anchoredCount', {
            count: format.count(anchor.NumStakedNFTs),
          })}
        </p>
      </TimelineEvent>

      {release ? (
        <TimelineEvent
          title={t('anchorActionDetail.timeline.released')}
          state="past"
          when={provenDate(release)}
          last
        >
          {collection === 'cosmicSignature' && typeof release.RewardAmountEth === 'number' ? (
            <p className="type-caption text-subtle">
              {t('anchorActionDetail.timeline.retrieved', {
                amount: format.amount(release.RewardAmountEth, { unit: 'ETH', context: 'card' }),
              })}
            </p>
          ) : null}
        </TimelineEvent>
      ) : (
        <TimelineEvent title={t('anchorActionDetail.timeline.stillAnchored')} state="current" last>
          <p className="type-body-sm text-muted-foreground">
            {collection === 'cosmicSignature'
              ? t('anchorActionDetail.timeline.stillAnchoredCosmicSignature')
              : t('anchorActionDetail.timeline.stillAnchoredRandomWalk')}
          </p>
        </TimelineEvent>
      )}
    </ol>
  );
}
