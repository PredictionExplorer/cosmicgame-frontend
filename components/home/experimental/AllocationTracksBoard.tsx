'use client';

import { useLocale, useTranslations } from 'next-intl';

import { Amount } from '@/components/ui/amount';
import { ExplainedTerm } from '@/components/ui/explain-popover';
import { SectionHeader } from '@/components/ui/section-header';
import { UnknownValue } from '@/components/ui/unknown-value';
import { deriveAllocationTrackAmounts } from '@/lib/allocationTracks';
import { cn } from '@/lib/utils';
import type { DashboardInfo } from '@/services/api';
import { formatAmount, formatNumber } from '@/utils/format';

import { QUIET_TERM_CLASS } from './quietTerm';

interface AllocationTracksBoardProps {
  data: DashboardInfo | null;
  className?: string;
}

interface TrackRow {
  key: string;
  name: string;
  definition: string;
  /** The amount, or a fixed allocation in words ("1,000 CST + NFT"). */
  amount: { eth: number } | { text: string };
  detail: string;
  /** Share of the Cycle Reserve in percent; drives the bar and the caption. */
  share?: number | null;
  /** Swatch colour of the track in the reserve bar. */
  swatch?: string;
}

function finitePercent(value: number | undefined): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null;
}

/**
 * Everything the cycle distributes at finalization, once, as a ledger. The
 * ETH tracks share the Cycle Reserve: a proportional bar shows the split and
 * each row carries its colour, amount and share, down to the part that seeds
 * the next cycle. The fixed CST and NFT allocations follow as a second group.
 * Who currently holds each contested allocation lives in the standings, so
 * no figure appears twice.
 */
export function AllocationTracksBoard({ data, className }: AllocationTracksBoardProps) {
  const t = useTranslations('home');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const amounts = deriveAllocationTrackAmounts(data);
  const recipients = (count: number) => t('allocation.recipientCount', { count });
  const cstPlusNft = t('deck.board.cstPlusNft');

  const ethTracks: TrackRow[] = [
    {
      key: 'signature',
      name: t('allocation.cards.signature.name'),
      definition: t('allocation.cards.signature.tooltip'),
      amount: { eth: amounts.signatureEth },
      detail: recipients(1),
      share: finitePercent(data?.PrizePercentage),
      swatch: 'bg-track-signature',
    },
    {
      key: 'chrono',
      name: t('allocation.cards.chronoWarrior.name'),
      definition: t('allocation.cards.chronoWarrior.tooltip'),
      amount: { eth: amounts.chronoEth },
      detail: recipients(1),
      share: finitePercent(data?.ChronoWarriorPercentage),
      swatch: 'bg-track-chrono',
    },
    {
      key: 'stellar-eth',
      name: t('allocation.cards.ethStellar.name'),
      definition: t('allocation.cards.ethStellar.tooltip'),
      amount: { eth: amounts.stellarEth },
      detail:
        amounts.stellarEthRecipients > 0
          ? `${recipients(amounts.stellarEthRecipients)} · ${t('allocation.amounts.ethEach', {
              amount: formatAmount(amounts.stellarEthEach, {
                unit: 'ETH',
                locale,
                withUnit: false,
              }),
            })}`
          : recipients(0),
      share: finitePercent(data?.RafflePercentage),
      swatch: 'bg-track-stellar-eth',
    },
    {
      key: 'cosmic-anchor',
      name: t('allocation.cards.cosmicAnchor.name'),
      definition: t('allocation.cards.cosmicAnchor.tooltip'),
      amount: { eth: amounts.cosmicAnchorEth },
      detail: t('allocation.cards.cosmicAnchor.recipientLabel'),
      share: finitePercent(data?.StakingPercentage),
      swatch: 'bg-track-anchoring',
    },
    {
      key: 'public-goods',
      name: t('allocation.cards.publicGoods.name'),
      definition: t('allocation.cards.publicGoods.tooltip', {
        percent: String(data?.CharityPercentage ?? 0),
      }),
      amount: { eth: amounts.publicGoodsEth },
      detail: t('allocation.cards.publicGoods.recipientLabel'),
      share: finitePercent(data?.CharityPercentage),
      swatch: 'bg-track-public-goods',
    },
    {
      key: 'next-cycle',
      name: t('observatory.ribbon.nextCycleName'),
      definition: t('observatory.ribbon.nextCycleTooltip'),
      amount: { eth: amounts.nextCycleEth },
      detail: t('observatory.ribbon.nextCycleDetail'),
      share: amounts.nextCyclePercent,
      swatch: 'bg-track-compounding',
    },
  ];

  const fixedTracks: TrackRow[] = [
    {
      key: 'endurance',
      name: t('allocation.cards.endurance.name'),
      definition: t('allocation.cards.endurance.tooltip'),
      amount: { text: cstPlusNft },
      detail: recipients(1),
    },
    {
      key: 'final-cst',
      name: t('allocation.cards.finalCst.name'),
      definition: t('allocation.cards.finalCst.tooltip'),
      amount: { text: cstPlusNft },
      detail: recipients(1),
    },
    {
      key: 'stellar-nft',
      name: t('allocation.cards.nftStellar.name'),
      definition: t('allocation.cards.nftStellar.tooltip'),
      amount: { text: cstPlusNft },
      detail: `${recipients(amounts.stellarNftRecipients)} · ${t('deck.board.stellarStatus')}`,
    },
    {
      key: 'rwlk-anchor',
      name: t('allocation.cards.randomWalkAnchor.name'),
      definition: t('allocation.cards.randomWalkAnchor.tooltip'),
      amount: { text: cstPlusNft },
      detail: recipients(amounts.rwlkAnchorRecipients),
    },
  ];

  // The bar only draws when every share is known; a partial split would lie.
  const barShares = ethTracks.every((track) => track.share != null)
    ? ethTracks.filter((track) => (track.share ?? 0) > 0)
    : null;
  const shareLabel = (share: number | null | undefined) =>
    share == null
      ? null
      : t('observatory.ribbon.percentOfReserve', {
          percent: formatNumber(share, locale, { maximumFractionDigits: 1 }),
        });

  const renderRows = (tracks: readonly TrackRow[], withSwatch: boolean) => (
    <ul className="divide-y divide-rule-faint">
      {tracks.map((track) => (
        <li
          key={track.key}
          data-testid={`track-row-${track.key}`}
          className="grid grid-cols-[0.625rem_minmax(0,1fr)_auto] items-baseline gap-x-3 py-3"
        >
          <span
            aria-hidden
            className={cn('size-2.5 translate-y-px rounded-edge', withSwatch && track.swatch)}
          />
          <div className="min-w-0">
            <p className="type-body-sm text-foreground">
              <ExplainedTerm definition={track.definition} className={QUIET_TERM_CLASS}>
                {track.name}
              </ExplainedTerm>
            </p>
            <p className="mt-0.5 type-caption text-subtle">{track.detail}</p>
          </div>
          <div className="text-end">
            <p className="type-figure-sm text-foreground">
              {'eth' in track.amount ? (
                data ? (
                  <Amount value={track.amount.eth} unit="ETH" unitClassName="text-subtle" />
                ) : (
                  <UnknownValue label={tCommon('status.unavailable')} />
                )
              ) : (
                track.amount.text
              )}
            </p>
            {track.share != null ? (
              <p className="mt-0.5 type-caption text-subtle">{shareLabel(track.share)}</p>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );

  return (
    <section
      aria-labelledby="allocation-tracks-title"
      data-testid="allocation-tracks-board"
      className={cn('min-w-0', className)}
    >
      <SectionHeader
        as="h2"
        size="panel"
        headingId="allocation-tracks-title"
        title={t('deck.board.title')}
        description={t('deck.board.subtitle')}
        className="mb-5 sm:mb-6"
      />

      <h3 className="type-label text-muted-foreground">{t('deck.board.ethGroup')}</h3>
      {barShares && barShares.length > 0 ? (
        <div
          aria-hidden
          data-testid="reserve-split-bar"
          className="mt-3 flex h-1.5 w-full gap-px overflow-hidden rounded-pill"
        >
          {barShares.map((track) => (
            <span
              key={track.key}
              className={cn('h-full', track.swatch)}
              style={{ flexGrow: track.share ?? 0, flexBasis: 0 }}
            />
          ))}
        </div>
      ) : null}
      <div className="mt-1">{renderRows(ethTracks, true)}</div>

      <h3 className="mt-6 type-label text-muted-foreground">{t('deck.board.fixedGroup')}</h3>
      <div className="mt-1">{renderRows(fixedTracks, false)}</div>
    </section>
  );
}
