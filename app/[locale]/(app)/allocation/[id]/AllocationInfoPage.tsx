'use client';

import { useMemo, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { useLocale, useTranslations } from 'next-intl';

import { getEnduranceChampions } from '@/utils';

import { ALLOCATION_TRACK_COPY_KEYS, type AllocationTrackId } from '@/config/allocationTracks';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { TOUCH_TARGET_TEXT_LINK_CLASS } from '@/lib/touch-target';
import {
  PageHeader,
  PageHeaderFigures,
  type PageHeaderFigure,
} from '@/components/layout/PageHeader';
import { AddressChip } from '@/components/ui/address-chip';
import { Amount } from '@/components/ui/amount';
import { PendingPlate } from '@/components/ui/art-frame';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { DateTime } from '@/components/ui/date-time';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { PageShell } from '@/components/ui/page-shell';
import { SectionHeader } from '@/components/ui/section-header';
import { Skeleton, SkeletonTable } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Term } from '@/components/ui/term';
import { TxExplorerLink } from '@/components/ui/tx-status';
import GestureHistoryTable from '@/components/tables/GestureHistoryTable';
import AnchoringRecipientTable from '@/components/tables/AnchoringRecipientTable';
import AttachedNFTTable, { type NFTRecord } from '@/components/attachments/AttachedNFTTable';
import EnduranceChampionsTable from '@/components/tables/EnduranceChampionsTable';
import AttachedERC20Table, {
  type DonatedERC20Token,
} from '@/components/attachments/AttachedERC20Table';
import RecipientHistoryTable, {
  type WinningHistoryEntry,
} from '@/components/tables/RecipientHistoryTable';
import {
  AllocationSplitBar,
  type AllocationSplitSegment,
} from '@/components/winnings/AllocationSplitBar';
import { SignatureCard } from '@/components/winnings/SignatureCard';
import { useSignatureIndex } from '@/components/winnings/useSignatureIndex';
import {
  useRoundInfo,
  useGestureListByCycle,
  useDonationsNFTByRound,
  useCSTAnchorDistributionsByCycle,
  useDonationsERC20ByRound,
  useRoundList,
} from '@/hooks/useApiQuery';
import { useClipboard } from '@/hooks/useClipboard';
import { useFormat } from '@/hooks/useFormat';
import type { RoundInfo } from '@/services/api/types';
import { countRecipients, STELLAR_SELECTION_RECORD_TYPES } from '@/utils/allocationRecords';
import { toFiniteNumber } from '@/utils/finiteNumber';
import { formatAddress, formatAmount } from '@/utils/format';
import { formatId } from '@/utils/format/ids';
import type { GlossaryTermId } from '@/lib/glossary';

/** The four roles a finalized cycle imprints a Signature for, in the order they are shown. */
type RoleId = 'signature' | 'chrono' | 'endurance' | 'finalCst';

/** Each role's glossary entry: the role's name explains itself. */
const ROLE_TERMS = {
  signature: 'signatureAllocation',
  chrono: 'chronoWarrior',
  endurance: 'enduranceChampion',
  finalCst: 'finalCstGesture',
} as const satisfies Record<RoleId, GlossaryTermId>;

interface CycleRole {
  id: RoleId;
  address: string;
  tokenId: number;
}

function cycleRoles(cycle: RoundInfo): CycleRole[] {
  const roles: CycleRole[] = [
    { id: 'signature', address: cycle.WinnerAddr, tokenId: cycle.TokenId },
    { id: 'chrono', address: cycle.ChronoWarriorAddr, tokenId: cycle.ChronoWarriorNftTokenId },
    {
      id: 'endurance',
      address: cycle.EnduranceWinnerAddr,
      tokenId: toFiniteNumber(cycle.EnduranceERC721TokenId) ?? -1,
    },
    {
      id: 'finalCst',
      address: cycle.LastCstBidderAddr,
      tokenId: toFiniteNumber(cycle.LastCstBidderERC721TokenId) ?? -1,
    },
  ];
  // A role nobody filled (no CST gesture in the cycle, say) has neither holder nor token.
  return roles.filter((role) => Boolean(role.address) || role.tokenId >= 0);
}

/** The ETH tracks a finalized cycle distributed, in the order every chart of the split uses. */
const DISTRIBUTED_TRACKS = ['signature', 'chrono', 'stellar', 'anchor', 'publicGoods'] as const;

function distributedEth(
  cycle: RoundInfo,
): Record<(typeof DISTRIBUTED_TRACKS)[number], number | null> {
  return {
    signature: toFiniteNumber(cycle.AmountEth),
    chrono: toFiniteNumber(cycle.ChronoWarriorAmountEth),
    stellar: toFiniteNumber(cycle.RoundStats?.TotalRaffleEthDepositsEth),
    anchor: toFiniteNumber(cycle.StakingDepositAmountEth),
    publicGoods: toFiniteNumber(cycle.CharityAmountETH),
  };
}

/** A tab's label with its count, or a short skeleton while the count loads. */
function TabCount({ count, loading }: { count: number; loading: boolean }) {
  const format = useFormat();
  if (loading) {
    // A span, not the block Skeleton: it sits inside the tab's button.
    return (
      <span
        aria-hidden
        className="ml-2 inline-block h-4 w-6 animate-pulse rounded-edge bg-muted/70 motion-reduce:animate-none"
      />
    );
  }
  if (count === 0) return null;
  return (
    <Badge size="sm" className="ml-2 tabular-nums">
      {format.count(count)}
    </Badge>
  );
}

/** Previous and next cycle, labelled on every screen size. */
function CycleNavigation({ cycle, lastCycle }: { cycle: number; lastCycle: number }) {
  const t = useTranslations('allocation');
  const link = (target: number, direction: 'previous' | 'next') => {
    const label = t('formats.cycle', { cycle: target });
    return (
      <Link
        href={`/allocation/${target}`}
        aria-label={`${t(`details.navigation.${direction}Aria`)}, ${label}`}
        className={buttonVariants({ variant: 'outline', size: 'sm' })}
      >
        {direction === 'previous' ? <ChevronLeft aria-hidden className="size-4" /> : null}
        {label}
        {direction === 'next' ? <ChevronRight aria-hidden className="size-4" /> : null}
      </Link>
    );
  };
  return (
    <div className="flex items-center gap-2" data-testid="round-navigation">
      {cycle > 0 ? link(cycle - 1, 'previous') : null}
      {cycle < lastCycle ? link(cycle + 1, 'next') : null}
    </div>
  );
}

/** The recipients' Signatures while the cycle loads: the same grid, as pending plates. */
function RecipientPlatesSkeleton() {
  return (
    <div
      aria-hidden
      className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-4"
    >
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="flex flex-col gap-3">
          <PendingPlate busy density="compact" />
          <Skeleton className="h-4 w-3/5" />
          <Skeleton className="h-3.5 w-2/5" />
        </div>
      ))}
    </div>
  );
}

/** A page section named by its own heading. */
function CycleSection({
  id,
  title,
  description,
  info,
  children,
}: {
  id: string;
  title: string;
  description?: ReactNode;
  info?: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="mb-[var(--block-gap)] scroll-mt-28">
      <SectionHeader headingId={id} title={title} description={description} info={info} />
      {children}
    </section>
  );
}

interface AllocationInfoPageProps {
  roundNum: number;
}

/**
 * A finalized cycle's record. The header carries the cycle, its finalization and the figures
 * that define it; the recipients follow as the Signatures their roles imprinted (the art as soon
 * as the cycle loads), then how the ETH split, the cycle's statistics, every allocation record
 * and, in tabs, the detailed data. Each part renders as its own query arrives: the gesture
 * list, the anchoring and contribution reads only hold their own tab.
 */
const AllocationInfoPage = ({ roundNum }: AllocationInfoPageProps) => {
  const t = useTranslations('allocation');
  const tContracts = useTranslations('contracts');
  const tCommon = useTranslations('common');
  const tDetail = useTranslations('detail');
  const locale = useLocale();
  const format = useFormat();
  const { copy } = useClipboard();

  const {
    data: allocationInfo,
    isLoading: loadingRound,
    isError: roundFailed,
    refetch: refetchRound,
  } = useRoundInfo(roundNum);
  const { data: gestureHistory = [], isLoading: loadingGestures } = useGestureListByCycle(
    roundNum,
    'desc',
  );
  const { data: nftDonationsRaw = [], isLoading: loadingNFT } = useDonationsNFTByRound(roundNum);
  const { data: anchorDistributions = [], isLoading: loadingAnchoring } =
    useCSTAnchorDistributionsByCycle(roundNum);
  const { data: donatedERC20Raw = [], isLoading: loadingERC20 } =
    useDonationsERC20ByRound(roundNum);
  const { data: roundList = [] } = useRoundList();
  const signatures = useSignatureIndex();

  const nftDonations = nftDonationsRaw as NFTRecord[];
  const donatedERC20Tokens = donatedERC20Raw as DonatedERC20Token[];

  const lastCycle = useMemo(
    () => roundList.reduce((max, r) => Math.max(max, r.RoundNum ?? 0), 0),
    [roundList],
  );

  const championList = useMemo(() => {
    if (gestureHistory.length > 0 && allocationInfo) {
      const champions = getEnduranceChampions(gestureHistory, allocationInfo.TimeStamp);
      return champions.sort((a, b) => b.chronoWarrior - a.chronoWarrior);
    }
    return [];
  }, [gestureHistory, allocationInfo]);

  const cycleAllocationLedger = useMemo(
    () => (allocationInfo?.AllPrizes ?? []) as WinningHistoryEntry[],
    [allocationInfo?.AllPrizes],
  );

  const stellarSelectionLedger = useMemo(
    () =>
      cycleAllocationLedger.filter((entry) => STELLAR_SELECTION_RECORD_TYPES.has(entry.RecordType)),
    [cycleAllocationLedger],
  );

  const handleShareRound = async () => {
    if (!allocationInfo) return;
    const summary = t('details.share.summary', {
      cycle: roundNum,
      amount: formatAmount(allocationInfo.AmountEth, { unit: 'ETH', locale, withUnit: false }),
      recipient: formatAddress(allocationInfo.WinnerAddr),
      gestures: format.count(allocationInfo.RoundStats.TotalBids),
      url: typeof window !== 'undefined' ? window.location.href : '',
    });
    await copy(summary);
    toast.success(t('details.share.success'));
  };

  const breadcrumbs = [{ label: t('details.breadcrumbs.recipients'), href: '/allocation' }];
  const title = t('formats.cycleHash', { cycle: roundNum });

  if (roundNum < 0 || (!loadingRound && !roundFailed && !allocationInfo)) {
    const invalid = roundNum < 0;
    return (
      <PageShell variant="data" backdrop="signature">
        <PageHeader
          section="records"
          breadcrumbs={breadcrumbs}
          title={invalid ? t('details.invalid.title') : t('details.notFound.title')}
          subtitle={
            invalid ? t('details.invalid.help') : t('details.notFound.help', { cycle: roundNum })
          }
          related={[{ href: '/allocation', label: t('details.breadcrumbs.recipients') }]}
        />
      </PageShell>
    );
  }

  if (roundFailed) {
    return (
      <PageShell variant="data" backdrop="signature">
        <PageHeader section="records" breadcrumbs={breadcrumbs} title={title} />
        <ErrorState
          headingLevel={2}
          title={t('details.error.title')}
          message={t('details.error.message', { cycle: roundNum })}
          onRetry={() => void refetchRound()}
        />
      </PageShell>
    );
  }

  const pending = <Skeleton className="h-7 w-24" />;
  const recipientCount = countRecipients(cycleAllocationLedger);
  const figures: PageHeaderFigure[] = [
    {
      id: 'signatureEth',
      label: t('details.statistics.cards.signatureEth.label'),
      value: allocationInfo ? (
        <span data-testid="hero-allocation-amount">
          <Amount value={allocationInfo.AmountEth} unit="ETH" context="hero" />
        </span>
      ) : (
        pending
      ),
      info: t('details.statistics.cards.signatureEth.tooltip'),
    },
    {
      id: 'gestures',
      label: t('details.statistics.cards.gestures.label'),
      value: allocationInfo ? format.count(allocationInfo.RoundStats.TotalBids) : pending,
    },
    {
      id: 'recipients',
      label: t('details.statistics.cards.recipients.label'),
      value: allocationInfo ? format.count(recipientCount) : pending,
      info: t('details.statistics.cards.recipients.tooltip'),
    },
  ];

  return (
    <PageShell variant="data" backdrop="signature">
      <PageHeader
        section="records"
        breadcrumbs={breadcrumbs}
        title={title}
        titleId="cycle-heading"
        actions={
          <>
            {allocationInfo ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => void handleShareRound()}
                aria-label={t('details.hero.shareAria')}
                data-testid="share-round-button"
              >
                <Share2 aria-hidden className="size-4" />
                {t('details.hero.share')}
              </Button>
            ) : null}
            <CycleNavigation cycle={roundNum} lastCycle={lastCycle} />
          </>
        }
        figures={figures}
        meta={
          allocationInfo ? (
            <>
              <span>
                {t.rich('details.hero.finalized', {
                  dateTime: () => <DateTime timestamp={allocationInfo.TimeStamp} />,
                })}
              </span>
              {allocationInfo.TxHash ? (
                <TxExplorerLink
                  hash={allocationInfo.TxHash}
                  label={t('details.hero.viewTransaction')}
                  className={cn('type-caption', TOUCH_TARGET_TEXT_LINK_CLASS)}
                />
              ) : null}
            </>
          ) : null
        }
      />

      {!allocationInfo ? (
        <div role="status" aria-label={t('details.loading')}>
          <RecipientPlatesSkeleton />
          <SkeletonTable announce={false} rows={6} columns={4} className="mt-[var(--block-gap)]" />
        </div>
      ) : (
        <CycleRecord
          cycle={allocationInfo}
          ledger={cycleAllocationLedger}
          anchorHolders={loadingAnchoring ? undefined : anchorDistributions.length}
          signatureSeed={(tokenId) => signatures.get(tokenId)?.seed}
          trackLabel={(id) => tContracts(`funds.segments.${ALLOCATION_TRACK_COPY_KEYS[id]}.label`)}
          trackDefinition={(id) =>
            tContracts(`funds.segments.${ALLOCATION_TRACK_COPY_KEYS[id]}.tooltip`)
          }
          unavailable={tCommon('status.unavailable')}
          artworkUnavailable={tDetail('image.artworkUnavailable')}
        />
      )}

      <section aria-labelledby="cycle-data" className="scroll-mt-28">
        <SectionHeader headingId="cycle-data" title={t('details.data.divider')} />
        <Tabs defaultValue="gestures" className="w-full">
          <TabsList variant="underline" scroll>
            <TabsTrigger value="gestures">
              {t('details.data.tabs.gestures')}
              <TabCount count={gestureHistory.length} loading={loadingGestures} />
            </TabsTrigger>
            <TabsTrigger value="endurance">
              {t('details.data.tabs.endurance')}
              <TabCount count={championList.length} loading={loadingGestures || !allocationInfo} />
            </TabsTrigger>
            <TabsTrigger value="stellar-selection">
              {t('details.data.tabs.stellar')}
              <TabCount count={stellarSelectionLedger.length} loading={!allocationInfo} />
            </TabsTrigger>
            <TabsTrigger value="anchoring">
              {t('details.data.tabs.anchoring')}
              <TabCount count={anchorDistributions.length} loading={loadingAnchoring} />
            </TabsTrigger>
            <TabsTrigger value="contributions">
              {t('details.data.tabs.contributions')}
              <TabCount
                count={nftDonations.length + donatedERC20Tokens.length}
                loading={loadingNFT || loadingERC20}
              />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gestures" className="mt-6">
            {loadingGestures ? (
              <SkeletonTable rows={8} columns={5} />
            ) : gestureHistory.length > 0 ? (
              <GestureHistoryTable
                gestureHistory={gestureHistory}
                showRound={false}
                heldUntil={allocationInfo?.TimeStamp}
              />
            ) : (
              <EmptyState headingLevel={3} title={t('details.data.empty.gestures')} />
            )}
          </TabsContent>

          <TabsContent value="endurance" className="mt-6">
            {loadingGestures || !allocationInfo ? (
              <SkeletonTable rows={5} columns={5} />
            ) : championList.length > 0 ? (
              <EnduranceChampionsTable championList={championList} />
            ) : (
              <EmptyState headingLevel={3} title={t('details.data.empty.endurance')} />
            )}
          </TabsContent>

          <TabsContent value="stellar-selection" className="mt-6">
            {!allocationInfo ? (
              <SkeletonTable rows={6} columns={4} />
            ) : stellarSelectionLedger.length > 0 ? (
              <RecipientHistoryTable
                winningHistory={stellarSelectionLedger}
                showRoundColumn={false}
                perPage={10}
              />
            ) : (
              <EmptyState headingLevel={3} title={t('details.data.empty.stellar')} />
            )}
          </TabsContent>

          <TabsContent value="anchoring" className="mt-6">
            {loadingAnchoring ? (
              <SkeletonTable rows={5} columns={4} />
            ) : anchorDistributions.length > 0 ? (
              <AnchoringRecipientTable list={anchorDistributions} />
            ) : (
              <EmptyState headingLevel={3} title={t('details.data.empty.anchoring')} />
            )}
          </TabsContent>

          <TabsContent value="contributions" className="mt-6 space-y-10">
            <div>
              <SectionHeader
                as="h3"
                size="panel"
                title={t('details.data.contributions.nfts')}
                info={t('details.data.contributions.nftsTooltip')}
              />
              {loadingNFT ? (
                <SkeletonTable rows={3} columns={5} />
              ) : nftDonations.length > 0 ? (
                <AttachedNFTTable list={nftDonations} handleClaim={undefined} claimingTokens={[]} />
              ) : (
                <EmptyState variant="inline" title={t('details.data.empty.nfts')} />
              )}
            </div>
            <div>
              <SectionHeader
                as="h3"
                size="panel"
                title={t('details.data.contributions.erc20')}
                info={t('details.data.contributions.erc20Tooltip')}
              />
              {loadingERC20 ? (
                <SkeletonTable rows={3} columns={5} />
              ) : donatedERC20Tokens.length > 0 ? (
                <AttachedERC20Table list={donatedERC20Tokens} handleClaim={null} />
              ) : (
                <EmptyState variant="inline" title={t('details.data.empty.erc20')} />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </PageShell>
  );
};

/**
 * The parts of the record that come with the cycle itself: the recipients' Signatures, how the
 * ETH split, the cycle's statistics and every allocation record.
 */
function CycleRecord({
  cycle,
  ledger,
  anchorHolders,
  signatureSeed,
  trackLabel,
  trackDefinition,
  unavailable,
  artworkUnavailable,
}: {
  cycle: RoundInfo;
  ledger: WinningHistoryEntry[];
  /** Wallets that received this cycle's Anchor Distribution; `undefined` while it loads. */
  anchorHolders: number | undefined;
  signatureSeed: (tokenId: number) => string | number | undefined;
  trackLabel: (id: AllocationTrackId) => string;
  trackDefinition: (id: AllocationTrackId) => string;
  unavailable: string;
  artworkUnavailable: string;
}) {
  const t = useTranslations('allocation');
  const locale = useLocale();
  const format = useFormat();

  const amounts = distributedEth(cycle);
  const knownTotal = DISTRIBUTED_TRACKS.every((id) => amounts[id] !== null)
    ? DISTRIBUTED_TRACKS.reduce((sum, id) => sum + (amounts[id] ?? 0), 0)
    : null;
  const segments: AllocationSplitSegment[] = DISTRIBUTED_TRACKS.map((id) => ({
    id,
    label: trackLabel(id),
    definition: trackDefinition(id),
    amount: amounts[id],
    percent: knownTotal && amounts[id] !== null ? ((amounts[id] ?? 0) / knownTotal) * 100 : null,
  }));

  const contributed = toFiniteNumber(cycle.RoundStats?.TotalDonatedAmountEth);
  const statistics: PageHeaderFigure[] = [
    {
      id: 'attachedNfts',
      label: t('details.statistics.cards.attachedNfts.label'),
      value: format.count(toFiniteNumber(cycle.RoundStats?.TotalDonatedNFTs) ?? 0),
    },
    {
      id: 'anchoredTokens',
      label: t('details.statistics.cards.anchoredTokens.label'),
      value: format.count(toFiniteNumber(cycle.StakingNumStakedTokens) ?? 0),
    },
    {
      id: 'uniqueAnchorHolders',
      label: t('details.statistics.cards.uniqueAnchorHolders.label'),
      value:
        anchorHolders === undefined ? (
          <Skeleton className="h-7 w-10" />
        ) : (
          format.count(anchorHolders)
        ),
      info: t('details.statistics.cards.uniqueAnchorHolders.tooltip'),
    },
    {
      id: 'totalContributed',
      label: t('details.statistics.cards.totalContributed.label'),
      value:
        contributed === null ? null : (
          <Link href={`/eth-contribution/round/${cycle.RoundNum}`} className="link-quiet">
            <Amount value={contributed} unit="ETH" context="hero" />
          </Link>
        ),
      info: t('details.statistics.cards.totalContributed.tooltip'),
    },
  ];

  const roles = cycleRoles(cycle);

  return (
    <>
      <CycleSection
        id="cycle-recipients"
        title={t('details.recipientSection.title')}
        description={t('details.recipientSection.description')}
      >
        <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-4">
          {roles.map((role, index) => {
            const hasToken = role.tokenId >= 0;
            const id = hasToken ? formatId(role.tokenId) : null;
            return (
              <li key={role.id} data-testid={`recipient-card-${role.id}`}>
                {hasToken ? (
                  <SignatureCard
                    tokenId={role.tokenId}
                    seed={signatureSeed(role.tokenId)}
                    title={
                      <Term id={ROLE_TERMS[role.id]}>
                        {t(`details.recipientSection.cards.${role.id}.title`)}
                      </Term>
                    }
                    titleAs="h3"
                    linkTitle={false}
                    meta={[
                      <Link key="token" href={`/detail/${role.tokenId}`} className="link type-mono">
                        {id}
                      </Link>,
                    ]}
                    sizes="(min-width: 1024px) 18rem, 50vw"
                    priority={index < 2}
                    unavailableLabel={artworkUnavailable}
                    unavailableDetail={id}
                  >
                    {role.address ? (
                      <p className="mt-1 flex flex-wrap items-center gap-2 type-caption text-subtle">
                        <span>{t('details.recipientCard.recipient')}</span>
                        <AddressChip address={role.address} />
                      </p>
                    ) : null}
                  </SignatureCard>
                ) : (
                  <div className="flex flex-col gap-3">
                    <PendingPlate density="compact" label={artworkUnavailable} />
                    <h3 className="type-body-md font-medium text-foreground">
                      <Term id={ROLE_TERMS[role.id]}>
                        {t(`details.recipientSection.cards.${role.id}.title`)}
                      </Term>
                    </h3>
                    <AddressChip address={role.address} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </CycleSection>

      <CycleSection
        id="cycle-distribution"
        title={t('details.distribution.title')}
        description={
          knownTotal === null
            ? undefined
            : t('details.distribution.total', {
                amount: formatAmount(knownTotal, { unit: 'ETH', locale, withUnit: false }),
              })
        }
        info={t('details.distribution.tooltip')}
      >
        <AllocationSplitBar
          segments={segments}
          label={t('details.distribution.title')}
          unavailableLabel={unavailable}
        />
      </CycleSection>

      <CycleSection
        id="cycle-statistics"
        title={t('details.statistics.title')}
        info={t('details.statistics.tooltip')}
      >
        <PageHeaderFigures figures={statistics} className="mt-0 sm:mt-0" />
      </CycleSection>

      <CycleSection
        id="cycle-ledger"
        title={t('details.ledger.title')}
        description={t('details.ledger.description')}
      >
        {ledger.length > 0 ? (
          <RecipientHistoryTable
            winningHistory={ledger}
            showRoundColumn={false}
            groupBy="recipient"
          />
        ) : (
          <EmptyState headingLevel={3} title={t('details.ledger.empty')} />
        )}
      </CycleSection>
    </>
  );
}

export default AllocationInfoPage;
