import { protocolFacts } from '@/content/protocol-facts';

import { cn } from '@/lib/utils';
import { NBSP, formatPercent } from '@/utils/format/numbers';

/**
 * The ETH tracks of §5.1 in the order of its table, each with its share and
 * its colour in the allocation-track palette. The Compounding Cycle Reserve
 * is the remainder, so the bar always spans exactly 100%.
 */
const DISTRIBUTED = [
  { share: protocolFacts.mainEthPercentage, color: 'bg-track-signature' },
  { share: protocolFacts.chronoWarriorEthPercentage, color: 'bg-track-chrono' },
  { share: protocolFacts.publicGoodsPercentage, color: 'bg-track-public-goods' },
  { share: protocolFacts.anchorDistributionPercentage, color: 'bg-track-anchoring' },
  { share: protocolFacts.stellarSelectionEthPercentage, color: 'bg-track-stellar-eth' },
] as const;

export const ALLOCATION_SPLIT_TRACKS = [
  ...DISTRIBUTED.map((track) => ({ ...track, approximate: false })),
  {
    share: 100 - DISTRIBUTED.reduce((total, track) => total + track.share, 0),
    color: 'bg-track-compounding',
    approximate: true,
  },
] as const;

export interface AllocationSplitProps {
  /** The tracks' names, in the order of `ALLOCATION_SPLIT_TRACKS` (the §5.1 table's rows). */
  labels: readonly string[];
  locale: string;
  className?: string;
}

/**
 * The Cycle Reserve's split at finalization as one proportional bar, with a
 * legend of the tracks and their shares in tabular figures. The bar is a
 * picture of the legend, so only the legend is exposed to assistive tech.
 */
export function AllocationSplit({ labels, locale, className }: AllocationSplitProps) {
  return (
    <div className={className}>
      <div aria-hidden className="flex h-3 w-full gap-0.5">
        {ALLOCATION_SPLIT_TRACKS.map((track, index) => (
          <span
            key={index}
            className={cn('h-full first:rounded-l-pill last:rounded-r-pill', track.color)}
            style={{ flexGrow: track.share, flexBasis: 0 }}
          />
        ))}
      </div>
      <ul className="mt-5 grid gap-x-10 gap-y-2.5 sm:grid-cols-2">
        {ALLOCATION_SPLIT_TRACKS.map((track, index) => (
          <li
            key={index}
            className="flex items-baseline gap-3 border-b border-rule-faint pb-2.5 type-body-sm"
          >
            <span
              aria-hidden
              className={cn('size-2.5 shrink-0 translate-y-px rounded-edge', track.color)}
            />
            <span className="min-w-0 flex-1 text-muted-foreground">{labels[index]}</span>
            <span className="type-figure-sm text-foreground">
              {track.approximate ? `≈${NBSP}` : null}
              {formatPercent(track.share, locale)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
