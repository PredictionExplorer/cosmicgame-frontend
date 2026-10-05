'use client';

import { useLocale, useTranslations } from 'next-intl';

import {
  ALLOCATION_TRACK_COLORS,
  ALLOCATION_TRACK_COPY_KEYS,
  allocationSharesFromDashboard,
  type AllocationTrackId,
} from '@/config/allocationTracks';
import { cn } from '@/lib/utils';
import { toFiniteNumber } from '@/utils/finiteNumber';
import { formatPercent } from '@/utils/format';

/** The dashboard fields the Cycle Reserve split reads. */
export interface ReserveSplitData {
  PrizePercentage?: number;
  RafflePercentage?: number;
  CharityPercentage?: number;
  StakingPercentage?: number;
  ChronoWarriorPercentage?: number;
  CosmicGameBalanceEth?: number;
}

/** One track of the split: its share of the reserve and that share in ETH (null when unknown). */
export interface ReserveTrack {
  id: AllocationTrackId;
  percent: number | null;
  eth: number | null;
}

/**
 * The Cycle Reserve split in the order and colours every chart of it uses
 * (config/allocationTracks), completed with the share that carries into the
 * next cycle so the tracks add up to the whole reserve. A share or balance
 * that could not be read stays `null`, never 0.
 */
export function reserveTracks(data?: ReserveSplitData | null): ReserveTrack[] {
  const balanceEth = toFiniteNumber(data?.CosmicGameBalanceEth);
  return allocationSharesFromDashboard(data).map(({ id, percent }) => ({
    id,
    percent,
    eth: percent !== null && balanceEth !== null ? (percent * balanceEth) / 100 : null,
  }));
}

/**
 * The Cycle Reserve split as one proportional bar: each track's segment is
 * its share of the whole reserve, in the track colours used on /allocation
 * and /contracts. The bar is a picture of the ledger that names the tracks
 * beside it, so it is hidden from assistive technology and carries the same
 * shares as a list for screen readers. A split that could not be read draws
 * an empty track rather than a guess.
 */
export function FundDistribution({
  data,
  describe = true,
  className,
}: {
  data?: ReserveSplitData | null;
  /**
   * Also list the shares for screen readers. Pass `false` when a ledger of
   * the same tracks follows the bar, so they are not read twice.
   */
  describe?: boolean;
  className?: string;
}) {
  const t = useTranslations('contracts');
  const locale = useLocale();
  const tracks = reserveTracks(data);
  const known = tracks.every((track) => track.percent !== null);

  return (
    <div data-testid="fund-distribution" className={cn('min-w-0', className)}>
      <div
        aria-hidden
        className="flex h-3 w-full gap-0.5 overflow-hidden rounded-pill bg-surface-sunken"
      >
        {known
          ? tracks.map(({ id, percent }) =>
              percent ? (
                <span
                  key={id}
                  data-testid={`fund-track-fill-${id}`}
                  data-track={id}
                  className={cn('h-full min-w-0.5', ALLOCATION_TRACK_COLORS[id])}
                  style={{ flexGrow: percent, flexBasis: 0 }}
                />
              ) : null,
            )
          : null}
      </div>
      {describe ? (
        <ul className="sr-only">
          {tracks.map(({ id, percent }) => (
            <li key={id}>
              {t(`funds.segments.${ALLOCATION_TRACK_COPY_KEYS[id]}.label`)}:{' '}
              {formatPercent(percent, locale)}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
