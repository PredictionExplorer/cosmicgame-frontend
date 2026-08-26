'use client';

import type { ReactNode } from 'react';
import {
  ArrowRight,
  Coins,
  Crown,
  ImageIcon,
  Layers,
  Shuffle,
  Sprout,
  Swords,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';
import { zeroAddress } from 'viem';
import { useLocale, useTranslations } from 'next-intl';

import { formatSeconds, shortenHex } from '@/utils';

import { Link } from '@/i18n/navigation';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Surface } from '@/components/ui/surface';
import { useChampions } from '@/hooks/useChampions';
import { cn } from '@/lib/utils';
import type { DashboardInfo } from '@/services/api';

interface AllocationTracksBoardProps {
  data: DashboardInfo | null;
  account?: string | null;
  className?: string;
}

interface TrackRow {
  key: string;
  icon: ReactNode;
  title: string;
  value: string;
  detail: ReactNode;
  href?: string;
  isLive?: boolean;
  emphasis?: 'signature' | 'none';
}

function sameAddress(left: string | null | undefined, right: string | null | undefined): boolean {
  return !!left && !!right && left.toLowerCase() === right.toLowerCase();
}

function LeaderLine({
  address,
  duration,
  emptyText,
  account,
  youLabel,
  locale,
}: {
  address: string | null;
  duration?: number;
  emptyText: string;
  account?: string | null;
  youLabel: string;
  locale: string;
}) {
  if (!address) {
    return <span className="italic text-muted-foreground/70">{emptyText}</span>;
  }
  return (
    <span className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5">
      <span className="font-mono text-foreground/90">{shortenHex(address, 4)}</span>
      {duration !== undefined && duration > 0 && (
        <span className="tabular-nums">· {formatSeconds(duration, locale)}</span>
      )}
      {sameAddress(account, address) && (
        <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-emerald-400">
          {youLabel}
        </span>
      )}
    </span>
  );
}

/**
 * The Deck's left flank: every allocation track of the current cycle as a
 * compact live scoreboard row — amount, current leader or recipient rule,
 * and a link deeper. Amounts come from the live dashboard read; leaders from
 * the champions snapshot.
 */
export function AllocationTracksBoard({
  data,
  account = null,
  className,
}: AllocationTracksBoardProps) {
  const t = useTranslations('home');
  const tTables = useTranslations('tables');
  const locale = useLocale();
  const champions = useChampions();

  const ethAmount = (value: number) => t('allocation.amounts.eth', { amount: value.toFixed(4) });
  const cstPlusNft = t('deck.board.cstPlusNft');
  const youLabel = tTables('status.youBadge');

  const latestAddress =
    data?.LastBidderAddr && data.LastBidderAddr !== zeroAddress ? data.LastBidderAddr : null;
  const chronoEth =
    ((data?.CosmicGameBalanceEth ?? 0) * (data?.ChronoWarriorPercentage ?? 0)) / 100;
  const publicGoodsEth = ((data?.CosmicGameBalanceEth ?? 0) * (data?.CharityPercentage ?? 0)) / 100;
  const stellarEthRecipients = data?.NumRaffleEthWinnersBidding ?? 0;
  const stellarNftRecipients = data?.NumRaffleNFTWinnersBidding ?? 0;
  const rwlkAnchorRecipients = data?.NumRaffleNFTWinnersStakingRWalk ?? 0;

  const recipients = (count: number) => t('allocation.recipientCount', { count });

  const rows: TrackRow[] = [
    {
      key: 'signature',
      icon: <Trophy className="h-4 w-4" />,
      title: t('allocation.cards.signature.name'),
      value: ethAmount(data?.PrizeAmountEth ?? 0),
      detail: (
        <LeaderLine
          address={champions.latestGesture.address ?? latestAddress}
          duration={champions.latestGesture.holdDuration}
          emptyText={t('deck.board.awaitingGesture')}
          account={account}
          youLabel={youLabel}
          locale={locale}
        />
      ),
      href: '/current-cycle',
      isLive: !!(champions.latestGesture.address ?? latestAddress),
      emphasis: 'signature',
    },
    {
      key: 'chrono',
      icon: <Swords className="h-4 w-4" />,
      title: t('allocation.cards.chronoWarrior.name'),
      value: ethAmount(chronoEth),
      detail: (
        <LeaderLine
          address={champions.chrono.address}
          duration={champions.chrono.duration}
          emptyText={t('deck.board.awaitingRecord')}
          account={account}
          youLabel={youLabel}
          locale={locale}
        />
      ),
      href: '/faq#chrono-warrior',
      isLive: champions.chrono.isLive,
    },
    {
      key: 'endurance',
      icon: <Crown className="h-4 w-4" />,
      title: t('allocation.cards.endurance.name'),
      value: cstPlusNft,
      detail: (
        <LeaderLine
          address={champions.endurance.address}
          duration={champions.endurance.duration}
          emptyText={t('deck.board.awaitingRecord')}
          account={account}
          youLabel={youLabel}
          locale={locale}
        />
      ),
      href: '/faq#endurance-champion',
      isLive: champions.endurance.isLive,
    },
    {
      key: 'stellar-eth',
      icon: <Shuffle className="h-4 w-4" />,
      title: t('allocation.cards.ethStellar.name'),
      value: ethAmount(data?.RaffleAmountEth ?? 0),
      detail: `${recipients(stellarEthRecipients)} · ${t('deck.board.stellarStatus')}`,
    },
    {
      key: 'stellar-nft',
      icon: <ImageIcon className="h-4 w-4" />,
      title: t('allocation.cards.nftStellar.name'),
      value: cstPlusNft,
      detail: `${recipients(stellarNftRecipients)} · ${t('deck.board.stellarStatus')}`,
    },
    {
      key: 'cosmic-anchor',
      icon: <Users className="h-4 w-4" />,
      title: t('allocation.cards.cosmicAnchor.name'),
      value: ethAmount(data?.StakingAmountEth ?? 0),
      detail: t('allocation.cards.cosmicAnchor.recipientLabel'),
      href: '/anchoring',
    },
    {
      key: 'rwlk-anchor',
      icon: <Layers className="h-4 w-4" />,
      title: t('allocation.cards.randomWalkAnchor.name'),
      value: cstPlusNft,
      detail: recipients(rwlkAnchorRecipients),
      href: '/anchoring',
    },
    {
      key: 'public-goods',
      icon: <Sprout className="h-4 w-4" />,
      title: t('allocation.cards.publicGoods.name'),
      value: ethAmount(publicGoodsEth),
      detail: t('allocation.cards.publicGoods.recipientLabel'),
      href: '/public-goods-contributions-cg',
    },
    {
      key: 'final-cst',
      icon: <Coins className="h-4 w-4" />,
      title: t('allocation.cards.finalCst.name'),
      value: cstPlusNft,
      detail: (
        <LeaderLine
          address={champions.lastCst.address}
          emptyText={tTables('specialAllocation.awaitingCstGesture')}
          account={account}
          youLabel={youLabel}
          locale={locale}
        />
      ),
    },
  ];

  return (
    <Surface
      asChild
      variant="glass-bordered"
      radius="xl"
      padding="none"
      className={cn('min-w-0', className)}
    >
      <aside aria-labelledby="allocation-tracks-title" data-testid="allocation-tracks-board">
        <div className="border-b border-white/[0.07] p-4">
          <div className="flex items-center gap-2">
            <h2
              id="allocation-tracks-title"
              className="font-display text-lg font-bold tracking-tight"
            >
              {t('deck.board.title')}
            </h2>
            <InfoTooltip content={t('deck.board.tooltip')} />
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">{t('deck.board.subtitle')}</p>
        </div>

        <ol className="grid grid-cols-1 gap-1.5 p-3 lg:grid-cols-2 xl:grid-cols-1">
          {rows.map((row) => {
            const rowBody = (
              <>
                <span
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                    row.emphasis === 'signature'
                      ? 'bg-gradient-to-br from-primary/20 to-accent/20 text-primary'
                      : 'bg-white/[0.05] text-muted-foreground',
                  )}
                >
                  {row.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs font-semibold text-foreground">
                      {row.title}
                    </span>
                    <span
                      className={cn(
                        'shrink-0 text-xs font-bold tabular-nums',
                        row.emphasis === 'signature'
                          ? 'bg-gradient-to-r from-[#35C9FF] to-[#AC56FF] bg-clip-text text-transparent'
                          : 'text-foreground/90',
                      )}
                    >
                      {row.value}
                    </span>
                  </span>
                  <span className="mt-0.5 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                    <span className="min-w-0 truncate">{row.detail}</span>
                    {row.isLive && (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-emerald-300">
                        <Zap className="h-2.5 w-2.5" />
                        {tTables('specialAllocation.liveGrowing')}
                      </span>
                    )}
                    {row.href && (
                      <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground/50" />
                    )}
                  </span>
                </span>
              </>
            );
            const rowClass = 'flex items-start gap-2.5 rounded-xl border p-2.5 transition-colors';
            const rowTone =
              row.emphasis === 'signature'
                ? 'border-primary/25 bg-primary/[0.055]'
                : 'border-white/[0.05] bg-white/[0.02]';

            return (
              <li key={row.key} data-testid={`track-row-${row.key}`}>
                {row.href ? (
                  <Link
                    href={row.href}
                    className={cn(
                      rowClass,
                      rowTone,
                      'hover:border-primary/30 hover:bg-white/[0.05]',
                    )}
                  >
                    {rowBody}
                  </Link>
                ) : (
                  <div className={cn(rowClass, rowTone)}>{rowBody}</div>
                )}
              </li>
            );
          })}
        </ol>

        <div className="border-t border-white/[0.07] p-3">
          <a
            href="#allocation-breakdown"
            className="inline-flex items-center gap-1.5 px-1 text-xs font-semibold text-primary transition hover:text-foreground"
          >
            {t('deck.board.fullBreakdown')}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </a>
        </div>
      </aside>
    </Surface>
  );
}
