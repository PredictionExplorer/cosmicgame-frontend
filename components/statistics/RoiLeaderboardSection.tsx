'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import {
  TablePrimary,
  TablePrimaryBody,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from '@/components/styled';
import { AddressLink } from '@/components/common/AddressLink';
import { CustomPagination } from '@/components/common/CustomPagination';
import { Spinner } from '@/components/ui/spinner';
import { ErrorState } from '@/components/ui/error-state';
import { useRoiLeaderboard } from '@/hooks/useApiQuery';
import type { RoiLeaderboardEntry, RoiLeaderboardSort } from '@/services/api/types';

// lexicon-allow-start: sort ids below are the sealed backend query-param contract
const SORT_TABS: { id: RoiLeaderboardSort; labelKey: string }[] = [
  { id: 'net_pl', labelKey: 'netEth' },
  { id: 'roi', labelKey: 'netPercent' },
  { id: 'winrate', labelKey: 'allocationRate' },
  { id: 'spent', labelKey: 'spender' },
  { id: 'nfts', labelKey: 'nfts' },
];
// lexicon-allow-end

const MIN_GESTURES_OPTIONS = [5, 10, 25];
const PER_PAGE = 10;

/** Whether this participant paid no ETH (CST-only) — ETH-only return is undefined for them. */
const isCstOnly = (e: RoiLeaderboardEntry) => e.TotalEthSpentEth <= 0;

const fmtEth = (n: number) => n.toFixed(4);
const fmtSignedEth = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(4)}`;

const Pill = ({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    aria-pressed={active}
    onClick={onClick}
    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
      active
        ? 'border-primary/50 bg-primary/15 text-primary'
        : 'border-white/10 bg-white/[0.03] text-muted-foreground hover:border-white/20 hover:text-white'
    }`}
  >
    {children}
  </button>
);

const NetCell = ({ value }: { value: number }) => {
  const tone =
    value > 0 ? 'text-emerald-400' : value < 0 ? 'text-red-400' : 'text-muted-foreground';
  return <span className={`font-semibold ${tone}`}>{fmtSignedEth(value)}</span>;
};

const NetPctCell = ({
  entry,
  cstOnlyTooltip,
  noEthReceivedTooltip,
}: {
  entry: RoiLeaderboardEntry;
  cstOnlyTooltip: string;
  noEthReceivedTooltip: string;
}) => {
  if (isCstOnly(entry)) {
    return (
      <span className="text-muted-foreground" title={cstOnlyTooltip}>
        —
      </span>
    );
  }
  const pct = entry.Roi * 100;
  // "-100%" simply means no ETH allocations received yet — expected for most
  // participants while cycles run. Mute it instead of painting the table red.
  if (pct <= -100 && entry.EthWonEth <= 0) {
    return (
      <span className="tabular-nums text-muted-foreground" title={noEthReceivedTooltip}>
        −100%
      </span>
    );
  }
  const tone = pct > 0 ? 'text-emerald-400' : pct < 0 ? 'text-red-400' : 'text-muted-foreground';
  return (
    <span className={`font-semibold ${tone}`}>{`${pct >= 0 ? '+' : ''}${pct.toFixed(0)}%`}</span>
  );
};

const AllocationBadges = ({ entry }: { entry: RoiLeaderboardEntry }) => {
  if (entry.PrizesCount <= 0) {
    return <span className="text-muted-foreground">—</span>;
  }
  return (
    <span className="inline-flex flex-wrap items-center justify-end gap-1.5">
      {entry.NftPrizesCount > 0 && (
        <span className="rounded-full border border-[rgb(var(--aurora-cyan-rgb)/0.3)] bg-[rgb(var(--aurora-cyan-rgb)/0.1)] px-2 py-0.5 text-[11px] font-medium text-primary">
          {entry.NftPrizesCount} NFT
        </span>
      )}
      {entry.CstPrizesCount > 0 && (
        <span className="rounded-full border border-[rgb(var(--nebula-violet-rgb)/0.3)] bg-[rgb(var(--nebula-violet-rgb)/0.1)] px-2 py-0.5 text-[11px] font-medium text-[rgb(var(--nebula-violet-rgb))]">
          {entry.CstPrizesCount} CST
        </span>
      )}
    </span>
  );
};

const Row = ({
  entry,
  rank,
  cstOnlyLabel,
  cstOnlyTooltip,
  noEthReceivedTooltip,
  locale,
}: {
  entry?: RoiLeaderboardEntry;
  rank?: number;
  cstOnlyLabel: string;
  cstOnlyTooltip: string;
  noEthReceivedTooltip: string;
  locale: string;
}) => {
  const t = useTranslations('statistics');
  const tTables = useTranslations('tables');

  if (!entry) {
    return <TablePrimaryRow />;
  }
  return (
    <TablePrimaryRow>
      <TablePrimaryCell label={tTables('columns.position')} align="center">
        {rank}
      </TablePrimaryCell>
      <TablePrimaryCell label={t('performance.leaderboard.columns.participant')}>
        <AddressLink address={entry.BidderAddr} url={`/user/${entry.BidderAddr}`} />
        {isCstOnly(entry) && (
          <span className="ml-2 align-middle text-[11px] text-muted-foreground">
            {cstOnlyLabel}
          </span>
        )}
      </TablePrimaryCell>
      <TablePrimaryCell label={t('performance.leaderboard.columns.allocationRate')} align="right">
        {Math.round(entry.WinRate * 100)}%
        <span className="ml-1 text-xs text-muted-foreground">
          ({entry.RoundsWon}/{entry.RoundsParticipated})
        </span>
      </TablePrimaryCell>
      {/*
       * Gesture volume is already implied by the allocation-rate fraction next
       * to it, and it is the one column no sort tab orders by — so the card
       * layout drops it rather than spend a row on it.
       */}
      <TablePrimaryCell
        label={t('performance.leaderboard.columns.gestures')}
        align="right"
        priority="secondary"
      >
        {entry.NumBids.toLocaleString(locale)}
      </TablePrimaryCell>
      <TablePrimaryCell label={t('performance.leaderboard.columns.spent')} align="right">
        {fmtEth(entry.TotalEthSpentEth)}
        {entry.TotalCstSpentEth > 0 && (
          <span className="block text-xs text-muted-foreground">
            {entry.TotalCstSpentEth.toFixed(0)} CST
          </span>
        )}
      </TablePrimaryCell>
      {/* Recoverable from Spent + Net, both of which stay on the card. */}
      <TablePrimaryCell
        label={t('performance.leaderboard.columns.received')}
        align="right"
        priority="secondary"
      >
        {fmtEth(entry.EthWonEth)}
      </TablePrimaryCell>
      <TablePrimaryCell label={t('performance.leaderboard.columns.net')} align="right">
        <NetCell value={entry.NetPlEth} />
      </TablePrimaryCell>
      <TablePrimaryCell label={t('performance.leaderboard.columns.netPercent')} align="right">
        <NetPctCell
          entry={entry}
          cstOnlyTooltip={cstOnlyTooltip}
          noEthReceivedTooltip={noEthReceivedTooltip}
        />
      </TablePrimaryCell>
      <TablePrimaryCell label={t('performance.leaderboard.columns.allocations')} align="right">
        <AllocationBadges entry={entry} />
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

export const RoiLeaderboardSection = () => {
  const t = useTranslations('statistics');
  const locale = useLocale();
  const [sort, setSort] = useState<RoiLeaderboardSort>('net_pl');
  const [minBids, setMinBids] = useState(5);
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useRoiLeaderboard(sort, minBids);
  const list = data ?? [];

  const onSort = (next: RoiLeaderboardSort) => {
    setSort(next);
    setPage(1);
  };
  const onMinGestures = (next: number) => {
    setMinBids(next);
    setPage(1);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm leading-6 text-muted-foreground">
        {t.rich('performance.leaderboard.description', {
          em: (chunks) => <span className="text-white">{chunks}</span>,
        })}
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {SORT_TABS.map((tab) => (
            <Pill key={tab.id} active={sort === tab.id} onClick={() => onSort(tab.id)}>
              {t(`performance.leaderboard.sort.${tab.labelKey}`)}
            </Pill>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {t('performance.leaderboard.minimumGestures')}
          </span>
          {MIN_GESTURES_OPTIONS.map((opt) => (
            <Pill key={opt} active={minBids === opt} onClick={() => onMinGestures(opt)}>
              ≥{opt}
            </Pill>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : isError ? (
        <ErrorState
          title={t('performance.leaderboard.loadErrorTitle')}
          message={t('performance.leaderboard.loadErrorMessage')}
          onRetry={() => refetch()}
          className="py-10"
        />
      ) : list.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">
          {t('performance.leaderboard.empty')}
        </p>
      ) : (
        <>
          <TablePrimaryContainer>
            <TablePrimary>
              <TablePrimaryHead>
                <tr>
                  <TablePrimaryHeadCell align="center">#</TablePrimaryHeadCell>
                  <TablePrimaryHeadCell align="left">
                    {t('performance.leaderboard.columns.participant')}
                  </TablePrimaryHeadCell>
                  <TablePrimaryHeadCell align="right">
                    {t('performance.leaderboard.columns.allocationRate')}
                  </TablePrimaryHeadCell>
                  <TablePrimaryHeadCell align="right" priority="secondary">
                    {t('performance.leaderboard.columns.gestures')}
                  </TablePrimaryHeadCell>
                  <TablePrimaryHeadCell align="right">
                    {t('performance.leaderboard.columns.spent')}
                  </TablePrimaryHeadCell>
                  <TablePrimaryHeadCell align="right" priority="secondary">
                    {t('performance.leaderboard.columns.received')}
                  </TablePrimaryHeadCell>
                  <TablePrimaryHeadCell align="right">
                    {t('performance.leaderboard.columns.net')}
                  </TablePrimaryHeadCell>
                  <TablePrimaryHeadCell align="right">
                    {t('performance.leaderboard.columns.netPercent')}
                  </TablePrimaryHeadCell>
                  <TablePrimaryHeadCell align="right">
                    {t('performance.leaderboard.columns.allocations')}
                  </TablePrimaryHeadCell>
                </tr>
              </TablePrimaryHead>
              <TablePrimaryBody>
                {list.slice((page - 1) * PER_PAGE, page * PER_PAGE).map((entry, idx) => (
                  <Row
                    key={entry.BidderAid}
                    entry={entry}
                    rank={(page - 1) * PER_PAGE + idx + 1}
                    cstOnlyLabel={t('performance.leaderboard.cstOnly')}
                    cstOnlyTooltip={t('performance.leaderboard.cstOnlyTooltip')}
                    noEthReceivedTooltip={t('performance.leaderboard.noEthReceivedTooltip')}
                    locale={locale}
                  />
                ))}
              </TablePrimaryBody>
            </TablePrimary>
          </TablePrimaryContainer>
          <CustomPagination
            page={page}
            setPage={setPage}
            totalLength={list.length}
            perPage={PER_PAGE}
          />
        </>
      )}
    </div>
  );
};

export default RoiLeaderboardSection;
