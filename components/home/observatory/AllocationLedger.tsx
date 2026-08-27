'use client';

import type { ReactNode } from 'react';
import {
  ArrowRight,
  Crown,
  ImageIcon,
  Layers,
  RefreshCw,
  Shuffle,
  Sprout,
  Swords,
  Trophy,
  Users,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Link } from '@/i18n/navigation';
import { deriveAllocationTrackAmounts } from '@/lib/allocationTracks';
import { TOUCH_TARGET_TEXT_LINK_CLASS } from '@/lib/touch-target';
import { cn } from '@/lib/utils';
import type { DashboardInfo } from '@/services/api';

export interface AllocationLedgerProps {
  data: DashboardInfo | null;
  className?: string;
}

interface LedgerTrack {
  key: string;
  icon: ReactNode;
  name: string;
  tooltip: string;
  amount: string;
  detail: string;
  href?: string;
  tone?: 'signature' | 'impact' | 'default';
}

/**
 * Border-divided allocation ledger for the home control desk.
 *
 * Every live amount is visible in one compact desktop row. Phones retain the
 * same complete dataset in a horizontal snap strip rather than duplicating a
 * second full allocation-card section lower on the page.
 */
export function AllocationLedger({ data, className }: AllocationLedgerProps) {
  const t = useTranslations('home');
  const amounts = deriveAllocationTrackAmounts(data);
  const ethAmount = (value: number) => t('allocation.amounts.eth', { amount: value.toFixed(4) });
  const cstPlusNft = t('observatory.standings.cstPlusNft');
  const recipients = (count: number) => t('allocation.recipientCount', { count });

  const tracks: LedgerTrack[] = [
    {
      key: 'signature',
      icon: <Trophy className="h-3.5 w-3.5" aria-hidden />,
      name: t('allocation.cards.signature.name'),
      tooltip: t('allocation.cards.signature.tooltip'),
      amount: ethAmount(amounts.signatureEth),
      detail: recipients(1),
      href: '/current-cycle',
      tone: 'signature',
    },
    {
      key: 'chrono',
      icon: <Swords className="h-3.5 w-3.5" aria-hidden />,
      name: t('allocation.cards.chronoWarrior.name'),
      tooltip: t('allocation.cards.chronoWarrior.tooltip'),
      amount: ethAmount(amounts.chronoEth),
      detail: recipients(1),
      href: '/faq#chrono-warrior',
    },
    {
      key: 'endurance',
      icon: <Crown className="h-3.5 w-3.5" aria-hidden />,
      name: t('allocation.cards.endurance.name'),
      tooltip: t('allocation.cards.endurance.tooltip'),
      amount: cstPlusNft,
      detail: recipients(1),
      href: '/faq#endurance-champion',
    },
    {
      key: 'stellar-eth',
      icon: <Shuffle className="h-3.5 w-3.5" aria-hidden />,
      name: t('allocation.cards.ethStellar.name'),
      tooltip: t('allocation.cards.ethStellar.tooltip'),
      amount: ethAmount(amounts.stellarEth),
      detail: recipients(amounts.stellarEthRecipients),
    },
    {
      key: 'stellar-nft',
      icon: <ImageIcon className="h-3.5 w-3.5" aria-hidden />,
      name: t('allocation.cards.nftStellar.name'),
      tooltip: t('allocation.cards.nftStellar.tooltip'),
      amount: cstPlusNft,
      detail: recipients(amounts.stellarNftRecipients),
    },
    {
      key: 'cosmic-anchor',
      icon: <Users className="h-3.5 w-3.5" aria-hidden />,
      name: t('allocation.cards.cosmicAnchor.name'),
      tooltip: t('allocation.cards.cosmicAnchor.tooltip'),
      amount: ethAmount(amounts.cosmicAnchorEth),
      detail: t('allocation.cards.cosmicAnchor.recipientLabel'),
      href: '/anchoring',
    },
    {
      key: 'rwlk-anchor',
      icon: <Layers className="h-3.5 w-3.5" aria-hidden />,
      name: t('allocation.cards.randomWalkAnchor.name'),
      tooltip: t('allocation.cards.randomWalkAnchor.tooltip'),
      amount: cstPlusNft,
      detail: recipients(amounts.rwlkAnchorRecipients),
      href: '/anchoring',
    },
    {
      key: 'public-goods',
      icon: <Sprout className="h-3.5 w-3.5" aria-hidden />,
      name: t('allocation.cards.publicGoods.name'),
      tooltip: t('allocation.cards.publicGoods.tooltip', {
        percent: String(data?.CharityPercentage ?? 0),
      }),
      amount: ethAmount(amounts.publicGoodsEth),
      detail: t('allocation.cards.publicGoods.recipientLabel'),
      href: '/public-goods-contributions-cg',
      tone: 'impact',
    },
    ...(amounts.nextCyclePercent != null
      ? [
          {
            key: 'next-cycle',
            icon: <RefreshCw className="h-3.5 w-3.5" aria-hidden />,
            name: t('observatory.ribbon.nextCycleName'),
            tooltip: t('observatory.ribbon.nextCycleTooltip'),
            amount: ethAmount(amounts.nextCycleEth),
            detail: t('observatory.ribbon.nextCycleDetail'),
          } satisfies LedgerTrack,
        ]
      : []),
  ];

  return (
    <section
      id="allocation-breakdown"
      aria-labelledby="allocation-ledger-title"
      data-testid="allocation-ledger"
      className={cn('min-w-0 border-t border-white/[0.08]', className)}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-3 py-1">
        <div className="flex min-w-0 items-center gap-2">
          <h2
            id="allocation-ledger-title"
            className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground"
          >
            {t('observatory.ribbon.title')}
          </h2>
          <InfoTooltip content={t('observatory.ribbon.tooltip')} />
          <span className="hidden text-[10px] text-muted-foreground/70 sm:inline">
            {t('observatory.ribbon.subtitle')}
          </span>
        </div>
        <Link
          href="/current-cycle#allocation-breakdown"
          className={cn(
            'inline-flex items-center gap-1 text-[10px] font-semibold text-primary transition hover:text-foreground',
            TOUCH_TARGET_TEXT_LINK_CLASS,
          )}
        >
          {t('observatory.ribbon.fullBreakdown')}
          <ArrowRight className="h-3 w-3" aria-hidden />
        </Link>
      </div>

      <ul
        data-testid="allocation-ledger-list"
        className="flex snap-x snap-mandatory overflow-x-auto border-t border-white/[0.06] xl:grid xl:grid-cols-9 xl:snap-none xl:overflow-visible"
      >
        {tracks.map((track) => {
          const content = (
            <>
              <span className="flex items-start gap-1.5">
                <span
                  className={cn(
                    'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded',
                    track.tone === 'signature'
                      ? 'bg-primary/12 text-primary'
                      : track.tone === 'impact'
                        ? 'bg-[rgb(var(--impact-green-rgb)/0.12)] text-[rgb(var(--impact-green-rgb))]'
                        : 'bg-white/[0.05] text-muted-foreground',
                  )}
                >
                  {track.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-start gap-1">
                    <span className="min-w-0 break-words text-[10px] font-semibold leading-tight text-foreground">
                      {track.name}
                    </span>
                    <InfoTooltip content={track.tooltip} className="ml-auto shrink-0" />
                  </span>
                  <span
                    className={cn(
                      'mt-0.5 block text-xs font-bold tabular-nums',
                      track.tone === 'signature'
                        ? 'text-primary'
                        : track.tone === 'impact'
                          ? 'text-[rgb(var(--impact-green-rgb))]'
                          : 'text-foreground/90',
                    )}
                  >
                    {track.amount}
                  </span>
                  <span className="mt-0.5 block break-words text-[9px] leading-tight text-muted-foreground">
                    {track.detail}
                  </span>
                </span>
              </span>
            </>
          );

          return (
            <li
              key={track.key}
              data-testid={`ledger-track-${track.key}`}
              className={cn(
                'min-w-[10rem] flex-1 snap-start border-r border-white/[0.06] last:border-r-0 xl:min-w-0',
                track.tone === 'signature'
                  ? 'bg-primary/[0.035]'
                  : track.tone === 'impact'
                    ? 'bg-[rgb(var(--impact-green-rgb)/0.025)]'
                    : 'bg-black/[0.06]',
              )}
            >
              {track.href ? (
                <Link
                  href={track.href}
                  className="block h-full p-2 transition-colors hover:bg-white/[0.035]"
                >
                  {content}
                </Link>
              ) : (
                <div className="h-full p-2">{content}</div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
