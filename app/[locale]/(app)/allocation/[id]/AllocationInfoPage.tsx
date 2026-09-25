'use client';

import { useMemo, type ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { getEnduranceChampions } from '@/utils';
import { protocolFacts } from '@/content/protocol-facts';

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
import { PendingPlate, WallLabelMeta } from '@/components/ui/art-frame';
import { AllocationSplitBar, type AllocationSplitSegment } from '@/components/ui/allocation-split';
import { Badge } from '@/components/ui/badge';
import { DateTime } from '@/components/ui/date-time';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { PageShell } from '@/components/ui/page-shell';
import { RecordPager } from '@/components/ui/record-pager';
import { SectionHeader } from '@/components/ui/section-header';
import { Skeleton, SkeletonTable } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { AllocationSignatureCard } from '@/components/winnings/AllocationSignatureCard';
import {
  cycleReserveSplit,
  type DistributedTrackId,
} from '@/components/winnings/cycleReserveSplit';
import { cycleRoles, type CycleRole } from '@/components/winnings/cycleRoles';
import { useLiveCycle, useMissingCycle } from '@/components/winnings/missingCycle';
import { ShareCycleButton } from '@/components/winnings/ShareCycleButton';
import { useSignatureIndex, type SignatureArtState } from '@/components/winnings/useSignatureIndex';
import {
  useRoundInfo,
  useGestureListByCycle,
  useDonationsNFTByRound,
  useCSTAnchorDistributionsByCycle,
  useDonationsERC20ByRound,
} from '@/hooks/useApiQuery';
import { useFormat } from '@/hooks/useFormat';
import { isRecordNotFound } from '@/services/api/readError';
import type { RoundInfo } from '@/services/api/types';
import { countRecipients } from '@/utils/allocationRecords';
import { toFiniteNumber } from '@/utils/finiteNumber';
import { formatAddress, formatAmount } from '@/utils/format';
import { formatId } from '@/utils/format/ids';

/** What a role received besides its Signature, as wall-label facts ("3.5397 ETH", "1,000 CST"). */
function roleAmounts(role: CycleRole): ReactNode[] {
  return [
    role.eth !== null && role.eth > 0 ? <Amount key="eth" value={role.eth} unit="ETH" /> : null,
    role.cst !== null && role.cst > 0 ? <Amount key="cst" value={role.cst} unit="CST" /> : null,
  ];
}

/** The ETH each distributed track of a finalized cycle carried, as the API reports it. */
function distributedEth(cycle: RoundInfo): Record<DistributedTrackId, number | null> {
  return {
    signature: toFiniteNumber(cycle.AmountEth),
    chrono: toFiniteNumber(cycle.ChronoWarriorAmountEth),
    stellar: toFiniteNumber(cycle.RoundStats?.TotalRaffleEthDepositsEth),
    anchor: toFiniteNumber(cycle.StakingDepositAmountEth),
    publicGoods: toFiniteNumber(cycle.CharityAmountETH),
  };
}

/** One list behind a tab: its rows, and whether it is loading or could not be read. */
interface TabRead<T> {
  data: readonly T[] | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => unknown;
}

/** A read with nothing to show because it failed (a failed refresh keeps its rows). */
function unread<T>(read: TabRead<T>): boolean {
  return read.isError && read.data === undefined;
}

/**
 * A tab's count: a short skeleton while it loads, a quiet "0" for an empty
 * list (a tab with no badge beside tabs with one reads as still loading),
 * and nothing when its list could not be read.
 */
function TabCount({ count, loading }: { count: number | null; loading: boolean }) {
  const format = useFormat();
  // A span: it sits inside the tab's button.
  if (loading) return <Skeleton as="span" className="ml-2 inline-block h-4 w-6" />;
  if (count === null) return null;
  return (
    <Badge size="sm" className={cn('ml-2 tabular-nums', count === 0 && 'text-subtle')}>
      {format.count(count)}
    </Badge>
  );
}

/**
 * A tab's body for one read: its skeleton while it loads, a retryable error
 * when it could not be read (never the empty state, which would say the cycle
 * had none), the empty state, or the ledger.
 */
function TabBody<T>({
  read,
  skeleton,
  empty,
  children,
}: {
  read: TabRead<T>;
  skeleton: ReactNode;
  empty: ReactNode;
  children: ReactNode;
}) {
  const t = useTranslations('allocation');
  if (read.isLoading) return <>{skeleton}</>;
  if (unread(read)) {
    return (
      <ErrorState
        variant="panel"
        headingLevel={3}
        title={t('details.data.error.title')}
        message={t('details.data.error.message')}
        onRetry={() => void read.refetch()}
      />
    );
  }
  return <>{(read.data ?? []).length > 0 ? children : empty}</>;
}

/**
 * Previous and next finalized cycle, labelled on every screen size (the
 * shared RecordPager). Nothing is offered past the newest finalized cycle,
 * and no next link until the live cycle is known.
 */
function CycleNavigation({
  cycle,
  lastFinalized,
}: {
  cycle: number;
  lastFinalized: number | null;
}) {
  const t = useTranslations('allocation');
  const target = (to: number) => ({
    href: `/allocation/${to}`,
    label: t('formats.cycle', { cycle: to }),
  });
  return (
    <RecordPager
      data-testid="round-navigation"
      label={t('details.navigation.label')}
      previousLabel={t('details.navigation.previousAria')}
      nextLabel={t('details.navigation.nextAria')}
      previous={cycle > 0 ? target(cycle - 1) : null}
      next={lastFinalized !== null && cycle < lastFinalized ? target(cycle + 1) : null}
    />
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
  /**
   * The recipients' Signature seeds by token id, read on the server with the
   * record, so the plates are in the first HTML without reading the whole
   * collection in the browser.
   */
  roleSeeds?: Readonly<Record<string, { seed: string | number }>>;
}

/**
 * A finalized cycle's record, story first and audit trail second. The header
 * carries the cycle, its finalization and the figures that define it; the
 * recipients follow as the Signatures their roles imprinted, then how the ETH
 * split (with the cycle's other facts under it) and every allocation record,
 * grouped by recipient; the gestures, champions, anchor-holders and
 * contributions close the page in tabs. The server seeds the record and the
 * plates' seeds, so everything above the tabs is in the first HTML; each tab
 * loads, fails and retries on its own, and a list that could not be read is
 * never shown as an empty one.
 */
const AllocationInfoPage = ({ roundNum, roleSeeds }: AllocationInfoPageProps) => {
  const t = useTranslations('allocation');
  const tContracts = useTranslations('contracts');
  const tCommon = useTranslations('common');
  const tDetail = useTranslations('detail');
  const locale = useLocale();
  const format = useFormat();

  const {
    data: allocationInfo,
    isLoading: loadingRound,
    isError: roundFailed,
    error: roundError,
    refetch: refetchRound,
  } = useRoundInfo(roundNum);
  const missingCycle = useMissingCycle(roundNum);
  const liveCycle = useLiveCycle();
  const lastFinalized = liveCycle === null ? null : liveCycle - 1;
  const gestures = useGestureListByCycle(roundNum, 'desc');
  const nfts = useDonationsNFTByRound(roundNum);
  const anchorDistributions = useCSTAnchorDistributionsByCycle(roundNum);
  const erc20 = useDonationsERC20ByRound(roundNum);

  const gestureHistory = useMemo(() => gestures.data ?? [], [gestures.data]);
  const nftDonations = (nfts.data ?? []) as NFTRecord[];
  const donatedERC20Tokens = (erc20.data ?? []) as DonatedERC20Token[];

  // Each plate's seed: the server's read, else the record's own (its Signature's), else the
  // collection index, which is read only for a token neither of the others has.
  const roles = useMemo(() => (allocationInfo ? cycleRoles(allocationInfo) : []), [allocationInfo]);
  const knownSeed = (tokenId: number) =>
    roleSeeds?.[String(tokenId)]?.seed ??
    (tokenId === allocationInfo?.TokenId ? allocationInfo?.TokenSeed : undefined);
  const signatures = useSignatureIndex({
    enabled: roles.some((role) => role.tokenId >= 0 && knownSeed(role.tokenId) === undefined),
  });

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

  const breadcrumbs = [{ label: t('details.breadcrumbs.recipients'), href: '/allocation' }];
  const title = t('formats.cycle', { cycle: roundNum });

  // The API answers 400 for a cycle it holds no record of (the live cycle, one not started):
  // a final answer, not a failure to retry.
  const missing =
    (roundFailed && isRecordNotFound(roundError)) ||
    (!loadingRound && !roundFailed && !allocationInfo);
  if (missing) {
    return (
      <PageShell variant="data" backdrop="signature">
        <PageHeader
          section="records"
          breadcrumbs={breadcrumbs}
          title={missingCycle.title}
          subtitle={missingCycle.body}
          actions={
            <>
              {missingCycle.currentCycleLink}
              {missingCycle.state === 'unknown' ||
              lastFinalized === null ||
              lastFinalized < 0 ? null : (
                // From a cycle not finalized yet, "previous" is the newest finalized one.
                <CycleNavigation cycle={lastFinalized + 1} lastFinalized={lastFinalized} />
              )}
            </>
          }
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
      // No wallet in the ledger yet (still indexing) reads as unknown, never
      // "0" above the recipient cards.
      value: allocationInfo ? (recipientCount > 0 ? format.count(recipientCount) : null) : pending,
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
              <ShareCycleButton
                title={title}
                text={t('details.share.summary', {
                  cycle: roundNum,
                  amount: formatAmount(allocationInfo.AmountEth, {
                    unit: 'ETH',
                    locale,
                    withUnit: false,
                  }),
                  recipient: formatAddress(allocationInfo.WinnerAddr),
                  gestures: format.count(allocationInfo.RoundStats.TotalBids),
                })}
              />
            ) : null}
            <CycleNavigation cycle={roundNum} lastFinalized={lastFinalized} />
          </>
        }
        figures={figures}
        meta={
          allocationInfo ? (
            <>
              <span>
                {t.rich('details.hero.finalized', {
                  // A record's date stands alone: the year and the reader's zone, always.
                  dateTime: () => (
                    <DateTime timestamp={allocationInfo.TimeStamp} year="always" showZone />
                  ),
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
          roles={roles}
          ledger={cycleAllocationLedger}
          anchorHolders={
            anchorDistributions.isLoading
              ? undefined
              : unread(anchorDistributions)
                ? null
                : (anchorDistributions.data ?? []).length
          }
          signatureSeed={(tokenId) => knownSeed(tokenId) ?? signatures.get(tokenId)?.seed}
          artState={(tokenId) => (knownSeed(tokenId) !== undefined ? 'ready' : signatures.state)}
          artFailed={signatures.state === 'failed'}
          onRetryArt={signatures.retry}
          trackLabel={(id) => tContracts(`funds.segments.${ALLOCATION_TRACK_COPY_KEYS[id]}.label`)}
          trackDefinition={(id) =>
            tContracts(`funds.segments.${ALLOCATION_TRACK_COPY_KEYS[id]}.tooltip`)
          }
          unavailable={tCommon('status.unavailable')}
          artworkUnavailable={tDetail('image.artworkUnavailable')}
        />
      )}

      {/* The audit trail: a panel-size heading, a level under the story above it. */}
      <section aria-labelledby="cycle-data" className="scroll-mt-28">
        <SectionHeader headingId="cycle-data" size="panel" title={t('details.data.divider')} />
        <Tabs defaultValue="gestures" className="w-full">
          <TabsList variant="underline" scroll>
            <TabsTrigger value="gestures">
              {t('details.data.tabs.gestures')}
              <TabCount
                count={unread(gestures) ? null : gestureHistory.length}
                loading={gestures.isLoading}
              />
            </TabsTrigger>
            <TabsTrigger value="endurance">
              {t('details.data.tabs.endurance')}
              <TabCount
                count={unread(gestures) ? null : championList.length}
                loading={gestures.isLoading || !allocationInfo}
              />
            </TabsTrigger>
            <TabsTrigger value="anchoring">
              {t('details.data.tabs.anchoring')}
              <TabCount
                count={unread(anchorDistributions) ? null : (anchorDistributions.data ?? []).length}
                loading={anchorDistributions.isLoading}
              />
            </TabsTrigger>
            <TabsTrigger value="contributions">
              {t('details.data.tabs.contributions')}
              <TabCount
                count={
                  unread(nfts) || unread(erc20)
                    ? null
                    : nftDonations.length + donatedERC20Tokens.length
                }
                loading={nfts.isLoading || erc20.isLoading}
              />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gestures" className="mt-6">
            <TabBody
              read={gestures}
              skeleton={<SkeletonTable rows={8} columns={5} />}
              empty={<EmptyState headingLevel={3} title={t('details.data.empty.gestures')} />}
            >
              <GestureHistoryTable
                gestureHistory={gestureHistory}
                showRound={false}
                heldUntil={allocationInfo?.TimeStamp}
              />
            </TabBody>
          </TabsContent>

          <TabsContent value="endurance" className="mt-6">
            {!allocationInfo ? (
              <SkeletonTable rows={5} columns={5} />
            ) : (
              <TabBody
                read={gestures}
                skeleton={<SkeletonTable rows={5} columns={5} />}
                empty={<EmptyState headingLevel={3} title={t('details.data.empty.endurance')} />}
              >
                {championList.length > 0 ? (
                  <EnduranceChampionsTable championList={championList} />
                ) : (
                  <EmptyState headingLevel={3} title={t('details.data.empty.endurance')} />
                )}
              </TabBody>
            )}
          </TabsContent>

          <TabsContent value="anchoring" className="mt-6">
            <TabBody
              read={anchorDistributions}
              skeleton={<SkeletonTable rows={5} columns={4} />}
              empty={<EmptyState headingLevel={3} title={t('details.data.empty.anchoring')} />}
            >
              <AnchoringRecipientTable list={anchorDistributions.data ?? []} />
            </TabBody>
          </TabsContent>

          <TabsContent value="contributions" className="mt-6 space-y-10">
            <div>
              <SectionHeader
                as="h3"
                size="panel"
                title={t('details.data.contributions.nfts')}
                info={t('details.data.contributions.nftsTooltip')}
              />
              <TabBody
                read={nfts}
                skeleton={<SkeletonTable rows={3} columns={5} />}
                empty={<EmptyState variant="inline" title={t('details.data.empty.nfts')} />}
              >
                <AttachedNFTTable list={nftDonations} />
              </TabBody>
            </div>
            <div>
              <SectionHeader
                as="h3"
                size="panel"
                title={t('details.data.contributions.erc20')}
                info={t('details.data.contributions.erc20Tooltip')}
              />
              <TabBody
                read={erc20}
                skeleton={<SkeletonTable rows={3} columns={5} />}
                empty={<EmptyState variant="inline" title={t('details.data.empty.erc20')} />}
              >
                <AttachedERC20Table list={donatedERC20Tokens} />
              </TabBody>
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </PageShell>
  );
};

/**
 * The parts of the record that come with the cycle itself: the recipients' Signatures, how the
 * ETH split (with the cycle's other facts under it) and every allocation record.
 */
function CycleRecord({
  cycle,
  roles,
  ledger,
  anchorHolders,
  signatureSeed,
  artState,
  artFailed,
  onRetryArt,
  trackLabel,
  trackDefinition,
  unavailable,
  artworkUnavailable,
}: {
  cycle: RoundInfo;
  roles: readonly CycleRole[];
  ledger: WinningHistoryEntry[];
  /**
   * Wallets that received this cycle's Anchor Distribution: `undefined` while it loads, `null`
   * when it could not be read (the unknown dash, never a confident 0).
   */
  anchorHolders: number | null | undefined;
  signatureSeed: (tokenId: number) => string | number | undefined;
  /** Whether a plate's seed is known yet (the collection index loads apart from the cycle). */
  artState: (tokenId: number) => SignatureArtState;
  artFailed: boolean;
  onRetryArt: () => void;
  trackLabel: (id: AllocationTrackId) => string;
  trackDefinition: (id: AllocationTrackId) => string;
  unavailable: string;
  artworkUnavailable: string;
}) {
  const t = useTranslations('allocation');
  const locale = useLocale();
  const format = useFormat();

  // Shares of the Cycle Reserve, as /allocation draws the protocol split (25%, 8%, …, ~50%).
  const split = cycleReserveSplit(distributedEth(cycle), protocolFacts.mainEthPercentage);
  const knownTotal = split.distributed;
  const segments: AllocationSplitSegment[] = split.shares.map((share) => ({
    ...share,
    label: trackLabel(share.id),
    definition: trackDefinition(share.id),
    // The remainder is derived from the reserve: shown as approximate.
    approximate: share.id === 'nextCycle',
  }));

  const contributed = toFiniteNumber(cycle.RoundStats?.TotalDonatedAmountEth);
  // A count the record does not carry is unknown (the header's dash), never a confident 0.
  const count = (value: unknown) => {
    const known = toFiniteNumber(value);
    return known === null ? null : format.count(known);
  };
  // The cycle's other facts, set a size under the header's figures: they sit with the split,
  // whose tracks they explain (the anchored NFTs shared the Anchor Distribution, the direct
  // contributions went into the reserve).
  const facts: PageHeaderFigure[] = [
    {
      id: 'attachedNfts',
      label: t('details.statistics.cards.attachedNfts.label'),
      value: count(cycle.RoundStats?.TotalDonatedNFTs),
    },
    {
      id: 'anchoredTokens',
      label: t('details.statistics.cards.anchoredTokens.label'),
      value: count(cycle.StakingNumStakedTokens),
    },
    {
      id: 'uniqueAnchorHolders',
      label: t('details.statistics.cards.uniqueAnchorHolders.label'),
      value:
        anchorHolders === undefined ? (
          <Skeleton className="h-6 w-10" />
        ) : anchorHolders === null ? null : (
          format.count(anchorHolders)
        ),
      info: t('details.statistics.cards.uniqueAnchorHolders.tooltip'),
    },
    {
      id: 'totalContributed',
      label: t('details.statistics.cards.totalContributed.label'),
      value:
        contributed === null ? null : (
          // An ETH figure at ledger precision with its unit, linked as a record.
          <Link href={`/eth-contribution/round/${cycle.RoundNum}`} className="link-entity">
            <Amount value={contributed} unit="ETH" context="table" />
          </Link>
        ),
      info: t('details.statistics.cards.totalContributed.tooltip'),
    },
  ];

  const anyArtFailed = artFailed && roles.some((role) => artState(role.tokenId) === 'failed');

  return (
    <>
      {/* One explanation of the four roles for the section; each card's title is the way to
          its Signature, like every other card of a Signature. */}
      <CycleSection
        id="cycle-recipients"
        title={t('details.recipientSection.title')}
        description={t('details.recipientSection.description')}
        info={t('details.recipientSection.rolesInfo')}
      >
        {anyArtFailed ? (
          <ErrorState
            variant="inline"
            headingLevel={3}
            tone="warning"
            title={t('art.failed')}
            onRetry={onRetryArt}
            className="mb-6"
          />
        ) : null}
        {/* Each card spans four shared rows (plate, role, amounts, recipient),
            so a role whose amounts wrap on a phone does not push its
            recipient line below its neighbour's. The cards' bottom padding
            spaces the rows of cards; the list hands the last one back. */}
        <ul className="-mb-7 grid grid-cols-2 gap-x-4 gap-y-1 sm:-mb-9 sm:gap-x-6 lg:grid-cols-4">
          {roles.map((role, index) => {
            const hasToken = role.tokenId >= 0;
            const id = hasToken ? formatId(role.tokenId) : null;
            return (
              <li
                key={role.id}
                data-testid={`recipient-card-${role.id}`}
                className="row-span-4 grid grid-cols-1 grid-rows-subgrid pb-7 sm:pb-9"
              >
                {hasToken ? (
                  <AllocationSignatureCard
                    tokenId={role.tokenId}
                    seed={signatureSeed(role.tokenId)}
                    artState={artState(role.tokenId)}
                    title={t(`details.recipientSection.cards.${role.id}.title`)}
                    titleAs="h3"
                    meta={[
                      <span key="token" className="type-mono">
                        {id}
                      </span>,
                      ...roleAmounts(role),
                    ]}
                    sizes="(min-width: 1024px) 18rem, 50vw"
                    priority={index < 2}
                    unavailableLabel={artworkUnavailable}
                    unavailableDetail={id}
                    subgrid
                  >
                    {role.address ? (
                      <p className="mt-1 flex flex-wrap items-center gap-x-2 type-caption text-subtle">
                        <span>{t('details.recipientCard.recipient')}</span>
                        {/* A protocol name ("Cosmic Signature Protocol") wraps in the narrow card. */}
                        <AddressChip address={role.address} wrapLabel />
                      </p>
                    ) : null}
                  </AllocationSignatureCard>
                ) : (
                  <div className="row-span-4 grid grid-cols-1 grid-rows-subgrid">
                    <PendingPlate density="compact" label={artworkUnavailable} className="mb-2" />
                    <h3 className="type-body-md font-medium text-foreground">
                      {t(`details.recipientSection.cards.${role.id}.title`)}
                    </h3>
                    <WallLabelMeta items={roleAmounts(role)} />
                    <AddressChip address={role.address} wrapLabel />
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
        <PageHeaderFigures
          figures={facts}
          className="mt-8 sm:mt-10 lg:[&>div>dd:first-of-type]:type-figure-md"
        />
      </CycleSection>

      <CycleSection
        id="cycle-ledger"
        title={t('details.ledger.title')}
        description={t('details.ledger.description')}
      >
        {ledger.length > 0 ? (
          <RecipientHistoryTable
            allocationRecords={ledger}
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
