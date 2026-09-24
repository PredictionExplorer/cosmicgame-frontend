'use client';

import type { ComponentType, ReactNode, SVGProps } from 'react';
import { ArrowRight, ImageIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
  AnchorDistributionIcon,
  AnchoringIcon,
  ChronoWarriorIcon,
  CompoundingReserveIcon,
  EnduranceChampionIcon,
  PublicGoodsIcon,
  SignatureAllocationIcon,
  StellarSelectionIcon,
} from '@/lib/conceptIcons';
import { Amount } from '@/components/ui/amount';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Link } from '@/i18n/navigation';
import { deriveAllocationTrackAmounts } from '@/lib/allocationTracks';
import { TOUCH_TARGET_TEXT_LINK_CLASS } from '@/lib/touch-target';
import { cn } from '@/lib/utils';
import type { DashboardInfo } from '@/services/api';

import { ValuePending } from './ValuePending';

export interface AllocationLedgerProps {
  data: DashboardInfo | null;
  className?: string;
}

type TrackIcon = ComponentType<SVGProps<SVGSVGElement>>;

interface LedgerTrack {
  key: string;
  icon: TrackIcon;
  name: string;
  tooltip: string;
  /** ETH for the track, or a fixed description for the CST + NFT tracks. */
  amount: { eth: number } | { text: string };
  detail: string;
  href?: string;
  tone?: 'signature' | 'impact';
}

const ICON_TONE: Record<NonNullable<LedgerTrack['tone']> | 'default', string> = {
  signature: 'text-primary',
  impact: 'text-impact-green',
  default: 'text-subtle',
};

/**
 * Every allocation track of the cycle as one ruled ledger: the track, who it
 * goes to, and its live amount in tabular figures. One column on phones, two
 * from tablets up, three on wide screens. Each name opens its detail page
 * where there is one, and each carries its definition beside it; a figure the
 * dashboard has not reported yet reads as pending, never as 0 ETH.
 */
export function AllocationLedger({ data, className }: AllocationLedgerProps) {
  const t = useTranslations('home');
  const amounts = deriveAllocationTrackAmounts(data);
  const cstPlusNft = { text: t('observatory.standings.cstPlusNft') };
  const recipients = (count: number) => t('allocation.recipientCount', { count });

  const tracks: LedgerTrack[] = [
    {
      key: 'signature',
      icon: SignatureAllocationIcon,
      name: t('allocation.cards.signature.name'),
      tooltip: t('allocation.cards.signature.tooltip'),
      amount: { eth: amounts.signatureEth },
      detail: recipients(1),
      href: '/current-cycle',
      tone: 'signature',
    },
    {
      key: 'chrono',
      icon: ChronoWarriorIcon,
      name: t('allocation.cards.chronoWarrior.name'),
      tooltip: t('allocation.cards.chronoWarrior.tooltip'),
      amount: { eth: amounts.chronoEth },
      detail: recipients(1),
      href: '/faq#chrono-warrior',
    },
    {
      key: 'endurance',
      icon: EnduranceChampionIcon,
      name: t('allocation.cards.endurance.name'),
      tooltip: t('allocation.cards.endurance.tooltip'),
      amount: cstPlusNft,
      detail: recipients(1),
      href: '/faq#endurance-champion',
    },
    {
      key: 'stellar-eth',
      icon: StellarSelectionIcon,
      name: t('allocation.cards.ethStellar.name'),
      tooltip: t('allocation.cards.ethStellar.tooltip'),
      amount: { eth: amounts.stellarEth },
      detail: recipients(amounts.stellarEthRecipients),
    },
    {
      key: 'stellar-nft',
      icon: ImageIcon,
      name: t('allocation.cards.nftStellar.name'),
      tooltip: t('allocation.cards.nftStellar.tooltip'),
      amount: cstPlusNft,
      detail: recipients(amounts.stellarNftRecipients),
    },
    {
      key: 'cosmic-anchor',
      icon: AnchorDistributionIcon,
      name: t('allocation.cards.cosmicAnchor.name'),
      tooltip: t('allocation.cards.cosmicAnchor.tooltip'),
      amount: { eth: amounts.cosmicAnchorEth },
      detail: t('allocation.cards.cosmicAnchor.recipientLabel'),
      href: '/anchoring',
    },
    {
      key: 'rwlk-anchor',
      icon: AnchoringIcon,
      name: t('allocation.cards.randomWalkAnchor.name'),
      tooltip: t('allocation.cards.randomWalkAnchor.tooltip'),
      amount: cstPlusNft,
      detail: recipients(amounts.rwlkAnchorRecipients),
      href: '/anchoring',
    },
    {
      key: 'public-goods',
      icon: PublicGoodsIcon,
      name: t('allocation.cards.publicGoods.name'),
      tooltip: t('allocation.cards.publicGoods.tooltip', {
        percent: String(data?.CharityPercentage ?? 0),
      }),
      amount: { eth: amounts.publicGoodsEth },
      detail: t('allocation.cards.publicGoods.recipientLabel'),
      href: '/public-goods-contributions-cg',
      tone: 'impact',
    },
    ...(amounts.nextCyclePercent != null
      ? [
          {
            key: 'next-cycle',
            icon: CompoundingReserveIcon,
            name: t('observatory.ribbon.nextCycleName'),
            tooltip: t('observatory.ribbon.nextCycleTooltip'),
            amount: { eth: amounts.nextCycleEth },
            detail: t('observatory.ribbon.nextCycleDetail'),
          } satisfies LedgerTrack,
        ]
      : []),
  ];

  const amountOf = (track: LedgerTrack): ReactNode => {
    if ('text' in track.amount) {
      return <span className="type-label text-muted-foreground">{track.amount.text}</span>;
    }
    return data ? (
      <Amount value={track.amount.eth} unit="ETH" context="card" />
    ) : (
      <ValuePending ch={10} />
    );
  };

  return (
    <section
      id="allocation-ledger"
      aria-labelledby="allocation-ledger-title"
      data-testid="allocation-ledger"
      className={cn('min-w-0 px-5 pb-5 pt-4 sm:px-6', className)}
    >
      <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <div className="flex min-w-0 items-center gap-1.5">
          <h2 id="allocation-ledger-title" className="type-label text-foreground">
            {t('observatory.ribbon.title')}
          </h2>
          <InfoTooltip
            content={t('observatory.ribbon.tooltip')}
            label={t('observatory.ribbon.title')}
          />
        </div>
        <Link
          href="/current-cycle#allocation-breakdown"
          className={cn(
            'link-quiet type-label inline-flex items-center gap-1 text-primary',
            TOUCH_TARGET_TEXT_LINK_CLASS,
          )}
        >
          {t('observatory.ribbon.fullBreakdown')}
          <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </header>
      <p className="type-caption mt-0.5 text-subtle">{t('observatory.ribbon.subtitle')}</p>

      <ul
        role="list"
        data-testid="allocation-ledger-list"
        className="mt-3 grid gap-x-8 sm:grid-cols-2 xl:grid-cols-3"
      >
        {tracks.map((track) => {
          const Icon = track.icon;
          return (
            <li
              key={track.key}
              data-testid={`ledger-track-${track.key}`}
              className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-baseline gap-x-3 border-t border-rule-faint py-2.5"
            >
              <Icon
                className={cn(
                  'size-4 shrink-0 translate-y-0.5',
                  ICON_TONE[track.tone ?? 'default'],
                )}
                aria-hidden
              />
              <span className="min-w-0">
                <span className="flex min-w-0 items-center gap-1">
                  {track.href ? (
                    <Link
                      href={track.href}
                      className="link-quiet type-label min-w-0 break-words text-foreground"
                    >
                      {track.name}
                    </Link>
                  ) : (
                    <span className="type-label min-w-0 break-words text-foreground">
                      {track.name}
                    </span>
                  )}
                  <InfoTooltip content={track.tooltip} label={track.name} className="shrink-0" />
                </span>
                <span className="type-caption block text-subtle">{track.detail}</span>
              </span>
              <span className="type-figure-sm whitespace-nowrap text-end text-foreground">
                {amountOf(track)}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
