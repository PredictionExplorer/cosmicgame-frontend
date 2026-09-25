'use client';

import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePublicClient } from 'wagmi';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { TOUCH_TARGET_TEXT_LINK_CLASS } from '@/lib/touch-target';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/layout/PageHeader';
import { AddressChip } from '@/components/ui/address-chip';
import { Amount } from '@/components/ui/amount';
import { PendingPlate, WallLabel } from '@/components/ui/art-frame';
import { buttonVariants } from '@/components/ui/button';
import { DateTime } from '@/components/ui/date-time';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { PageShell } from '@/components/ui/page-shell';
import { SectionHeader } from '@/components/ui/section-header';
import { Skeleton } from '@/components/ui/skeleton';
import { TxExplorerLink } from '@/components/ui/tx-status';
import { isRenderPending, signatureMedia, signatureSources } from '@/components/nft/signatureArt';
import { useLiveCycle, useMissingCycle } from '@/components/winnings/missingCycle';
import { AllocationSignatureCard } from '@/components/winnings/AllocationSignatureCard';
import { SignatureReveal } from '@/components/winnings/SignatureReveal';
import { SpecList, SpecRow } from '@/components/ui/spec-list';
import { useSignatureIndex } from '@/components/winnings/useSignatureIndex';
import useCosmicGameContract from '@/hooks/useCosmicGameContract';
import { useCSTInfo, useRoundInfo, useRoundList } from '@/hooks/useApiQuery';
import { useFormat } from '@/hooks/useFormat';
import { useNow } from '@/hooks/useNow';
import { useActiveWeb3React } from '@/hooks/web3';
import { AllocationIcon } from '@/lib/conceptIcons';
import { isRecordNotFound } from '@/services/api/readError';
import { toFiniteNumber } from '@/utils/finiteNumber';
import { sameAddress } from '@/utils/format';
import { formatId } from '@/utils/format/ids';

import { FinalizedSignatureSkeleton } from './FinalizedSignatureSkeleton';

/** Poll interval while waiting for the next cycle to become active (chain activation time). */
const ACTIVATION_POLL_MS = 4000;
/** Poll interval while the indexer has not yet recorded the cycle a participant just finalized. */
const RECORD_POLL_MS = 5000;
/**
 * How long the page waits for the indexer before it stops asking: past it the
 * page reads as the neutral "no record yet" state, which a reload re-checks.
 */
const RECORD_POLL_LIMIT_MS = 5 * 60_000;
/** How many finalized cycles the page shows when no cycle is named. */
const INDEX_CYCLES = 3;

interface AllocationFinalizedPageProps {
  /** The cycle of `?cycle=N`, read on the server; `null` shows the index of the latest cycles. */
  cycle: number | null;
  /** The reader arrived from their own finalization (`?message=success`). */
  isClaimSuccess: boolean;
  /** The server-rendered header of the index. */
  seoSummary?: ReactNode;
}

/**
 * The page a participant lands on after finalizing a cycle, and the public
 * record of any finalized cycle's Signature Allocation.
 *
 * - With a cycle: the cycle's new Signature on its plate (revealed as it
 *   arrives, on the moment it was received) beside what the Signature
 *   Allocation holds: ETH, CST, the NFT, attached NFTs and the recipient.
 *   Only the recipient's own wallet, arriving from their finalization, is
 *   congratulated; everyone else, and anyone whose wallet is still
 *   connecting, reads the neutral record.
 * - Without a cycle: the server-rendered summary and the latest finalized
 *   cycles, each shown by its Signature.
 *
 * The server reads the query and seeds the record, so the first HTML is the
 * page. Every state of a cycle's record keeps the same header (title and
 * lede) over a body of the same shape, so nothing moves while it loads.
 */
const AllocationFinalizedPage = ({
  cycle,
  isClaimSuccess,
  seoSummary,
}: AllocationFinalizedPageProps) => {
  const t = useTranslations('allocation');
  const { account } = useActiveWeb3React();

  const { data: allocationInfo, isLoading, isError, error, refetch } = useRoundInfo(cycle ?? -1);
  const missingCycle = useMissingCycle(cycle ?? 0);
  // The API answers 400 for a cycle it holds no record of: not indexed yet, still open, or not
  // started. Anything else that fails is a failed read, with a retry.
  const missing =
    (isError && isRecordNotFound(error)) || (!isLoading && !isError && !allocationInfo);

  const nextCycleOpen = useNextCycleOpen(isClaimSuccess && cycle !== null);
  const nextCycleNotice = nextCycleOpen ? <NextCycleNotice /> : null;
  // A `message=success` link can be shared, bookmarked or typed: its claim ("your finalization
  // is on-chain") is believed only once the chain has moved past the cycle.
  const finalizedOnChain = useCycleFinalizedOnChain(isClaimSuccess ? cycle : null);
  const verifiedSuccess = isClaimSuccess && finalizedOnChain === true;

  // A participant who just finalized arrives before the indexer: keep asking until it has the
  // cycle, so the record (and its Signature) appears without a reload. The wait is capped, and
  // a hidden tab does not ask.
  const [pollExpired, setPollExpired] = useState(false);
  const waitingForRecord = verifiedSuccess && cycle !== null && missing && !pollExpired;
  useEffect(() => {
    if (!waitingForRecord) return;
    const started = Date.now();
    const id = window.setInterval(() => {
      if (Date.now() - started > RECORD_POLL_LIMIT_MS) {
        window.clearInterval(id);
        setPollExpired(true);
        return;
      }
      if (document.visibilityState === 'visible') void refetch();
    }, RECORD_POLL_MS);
    return () => window.clearInterval(id);
  }, [refetch, waitingForRecord]);

  if (cycle === null) {
    return (
      <PageShell variant="data" backdrop="signature">
        {seoSummary ?? (
          <PageHeader
            section="records"
            title={t('finalized.title')}
            subtitle={t('finalized.index.description')}
          />
        )}
        <FinalizedCycleIndex />
      </PageShell>
    );
  }

  const trail = [
    { label: t('details.breadcrumbs.recipients'), href: '/allocation' },
    { label: t('formats.cycle', { cycle }), href: `/allocation/${cycle}` },
  ];

  // The neutral record's header: the loading and error states keep it, so the record lands
  // under the same title and lede.
  const recordHeader = (
    <PageHeader
      section="records"
      breadcrumbs={trail}
      title={t('finalized.result.title', { cycle })}
      subtitle={t('finalized.result.lede')}
    />
  );

  // Arriving from their own finalization (the chain agrees), the participant waits for the
  // indexer here: the same header while the first read loads and while the indexer catches up.
  if (waitingForRecord || (verifiedSuccess && isLoading)) {
    return (
      <PageShell variant="data" backdrop="signature">
        <PageHeader
          section="records"
          breadcrumbs={trail}
          title={t('finalized.pending.successTitle', { cycle })}
          subtitle={t('finalized.pending.successBody')}
          related={[
            { href: `/allocation/${cycle}`, label: t('finalized.links.viewCycle', { cycle }) },
            { href: '/my-allocations', label: t('finalized.links.myAllocations') },
          ]}
        >
          {nextCycleNotice}
        </PageHeader>
        <FinalizedSignatureSkeleton label={t('finalized.loading.status')} />
      </PageShell>
    );
  }

  if (isLoading) {
    return (
      <PageShell variant="data" backdrop="signature">
        {recordHeader}
        <FinalizedSignatureSkeleton label={t('finalized.loading.status')} />
      </PageShell>
    );
  }

  if (isError && !missing) {
    return (
      <PageShell variant="data" backdrop="signature">
        {recordHeader}
        <ErrorState
          headingLevel={2}
          title={t('details.error.title')}
          message={t('details.error.message', { cycle })}
          onRetry={() => void refetch()}
        />
      </PageShell>
    );
  }

  if (!allocationInfo) {
    return (
      <PageShell variant="data" backdrop="signature">
        <PageHeader
          section="records"
          breadcrumbs={trail}
          title={missingCycle.title}
          subtitle={missingCycle.body}
          actions={missingCycle.currentCycleLink}
        />
      </PageShell>
    );
  }

  // Congratulations belong to the participant who finalized: arriving from their own
  // finalization with the recipient's wallet connected. A shared or bookmarked success link,
  // another wallet, or one still reconnecting reads the neutral record.
  const congratulate = isClaimSuccess && sameAddress(account, allocationInfo.WinnerAddr);

  return (
    <PageShell variant="data" backdrop="signature">
      {congratulate ? (
        <PageHeader
          section="records"
          breadcrumbs={trail}
          title={t('finalized.result.successTitle', { cycle: allocationInfo.RoundNum })}
          subtitle={t('finalized.result.successLede', { cycle: allocationInfo.RoundNum })}
        />
      ) : (
        recordHeader
      )}
      <FinalizedSignature allocation={allocationInfo} reveal={congratulate}>
        {congratulate ? <NextSteps /> : null}
        {nextCycleNotice}
      </FinalizedSignature>
    </PageShell>
  );
};

interface FinalizedAllocation {
  RoundNum: number;
  WinnerAddr: string;
  AmountEth: number;
  CSTAmountEth: number;
  TokenId: number;
  /** The Signature's seed, from the record itself: the art needs no token read. */
  TokenSeed?: string | number;
  TxHash: string;
  TimeStamp: number;
  RoundStats: { TotalDonatedNFTs?: unknown };
}

/**
 * The cycle's new Signature on its plate (7 of 12 columns from `lg`) and, beside it, what the
 * Signature Allocation holds, as a spec sheet, with the ways onward.
 */
function FinalizedSignature({
  allocation,
  reveal,
  children,
}: {
  allocation: FinalizedAllocation;
  reveal: boolean;
  /** Shown under the ways onward (the recipient's next steps). */
  children?: ReactNode;
}) {
  const t = useTranslations('allocation');
  const tDetail = useTranslations('detail');
  const format = useFormat();
  const hasToken = allocation.TokenId >= 0;
  const { data: token, isLoading: loadingToken } = useCSTInfo(hasToken ? allocation.TokenId : null);
  const nowMs = useNow(60_000);
  const id = formatId(allocation.TokenId);
  const name = typeof token?.TokenName === 'string' ? token.TokenName.trim() : '';
  const rendering = isRenderPending(allocation.TimeStamp, nowMs);
  const attached = toFiniteNumber(allocation.RoundStats?.TotalDonatedNFTs) ?? 0;
  // The record carries its Signature's seed; the token read adds the name (and the seed when
  // an older record lacks it).
  const seed = token?.Seed ?? allocation.TokenSeed;
  const artPending = seed === undefined && loadingToken;
  const sources = useMemo(() => signatureSources(signatureMedia(seed)), [seed]);

  return (
    <section
      aria-labelledby="finalized-allocation"
      className="grid gap-x-12 gap-y-10 lg:grid-cols-12 lg:items-start"
      data-testid="finalized-signature"
    >
      <figure className="flex min-w-0 flex-col gap-4 lg:col-span-7">
        {hasToken ? (
          <Link href={`/detail/${allocation.TokenId}`} tabIndex={-1} aria-hidden className="block">
            {/* The seed is on its way: a busy plate, never "Artwork unavailable". */}
            {artPending ? (
              <PendingPlate busy />
            ) : (
              <SignatureReveal
                reveal={reveal}
                sources={sources}
                alt=""
                sizes="(min-width: 1280px) 45rem, (min-width: 1024px) 56vw, 100vw"
                priority
                unavailableLabel={
                  rendering ? tDetail('image.rendering') : tDetail('image.artworkUnavailable')
                }
                unavailableDetail={id}
              />
            )}
          </Link>
        ) : (
          <PendingPlate label={tDetail('image.artworkUnavailable')} />
        )}
        {hasToken ? (
          <WallLabel
            as="figcaption"
            title={
              <Link href={`/detail/${allocation.TokenId}`} className="link-quiet">
                {name || t('formats.cosmicSignatureToken', { token: id.replace(/^#/, '') })}
              </Link>
            }
            // The finalization moment is the spec sheet's "Finalized" row, not repeated here.
            meta={[
              name ? <span className="type-mono">{id}</span> : null,
              t('formats.cycle', { cycle: allocation.RoundNum }),
            ]}
          />
        ) : null}
      </figure>

      <div className="min-w-0 lg:col-span-5">
        <h2 id="finalized-allocation" className="type-heading-3 text-foreground">
          {t('finalized.result.componentsTitle')}
        </h2>
        <SpecList className="mt-4">
          {/* One value scale down the sheet, each unit in its value only. ETH at ledger precision,
              as the cycle's own distribution legend prints it (the full value is on hover); CST
              as the cycle's cards print it. */}
          <SpecRow label={t('finalized.result.allocation')}>
            <span className="inline-flex flex-wrap justify-end gap-x-3">
              <Amount value={allocation.AmountEth} unit="ETH" context="table" />
              <Amount value={allocation.CSTAmountEth} unit="CST" />
            </span>
          </SpecRow>
          {hasToken ? (
            <SpecRow label={t('finalized.result.nft')}>
              <Link href={`/detail/${allocation.TokenId}`} className="link-entity font-mono">
                {id}
              </Link>
            </SpecRow>
          ) : null}
          {attached > 0 ? (
            <SpecRow label={t('finalized.result.attached')}>
              <span className="tabular-nums">{format.count(attached)}</span>
            </SpecRow>
          ) : null}
          <SpecRow label={t('finalized.result.recipient')}>
            {/* The short form keeps the sheet one line a row beside the plate; the chip copies
                the full address. */}
            <AddressChip address={allocation.WinnerAddr} variant="plain" />
          </SpecRow>
          {allocation.TimeStamp ? (
            <SpecRow label={t('finalized.result.finalized')}>
              {/* The format the cycle's record prints the same moment in, with the zone. */}
              <DateTime timestamp={allocation.TimeStamp} year="always" showZone />
            </SpecRow>
          ) : null}
        </SpecList>
        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
          <Link
            href={`/allocation/${allocation.RoundNum}`}
            className={buttonVariants({ variant: 'outline', size: 'sm' })}
          >
            {t('finalized.links.viewCycle', { cycle: allocation.RoundNum })}
            <ArrowRight aria-hidden className="size-4" />
          </Link>
          <FinalizedCycleNavigation cycle={allocation.RoundNum} />
          {allocation.TxHash ? (
            <TxExplorerLink
              hash={allocation.TxHash}
              label={t('finalized.result.viewTransaction')}
              className={cn('type-body-sm', TOUCH_TARGET_TEXT_LINK_CLASS)}
            />
          ) : null}
        </div>
        {children}
      </div>
    </section>
  );
}

/**
 * Whether the chain has moved past `cycle` (its `roundNum()` is higher, so the
 * cycle is finalized), read once from the contract: `undefined` until read,
 * or when no cycle is asked about. A success link is believed only on `true`.
 */
function useCycleFinalizedOnChain(cycle: number | null): boolean | undefined {
  const cosmicGameContract = useCosmicGameContract();
  const [answer, setAnswer] = useState<{ cycle: number; finalized: boolean } | null>(null);

  useEffect(() => {
    if (cycle === null || !cosmicGameContract) return;
    let cancelled = false;
    void (async () => {
      try {
        const current = await cosmicGameContract.read.roundNum?.();
        if (cancelled || current === undefined) return;
        const finalized = BigInt(current as bigint | number) > BigInt(cycle);
        // The same answer keeps its object, so a re-read never re-renders the page.
        setAnswer((previous) =>
          previous?.cycle === cycle && previous.finalized === finalized
            ? previous
            : { cycle, finalized },
        );
      } catch {
        /* an RPC failure leaves the claim unverified: the neutral record stands */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [cycle, cosmicGameContract]);

  return answer !== null && answer.cycle === cycle ? answer.finalized : undefined;
}

/**
 * After `claimMainPrize` the chain is on the next cycle, which opens at `roundActivationTime()`.
 * True once it has. The page then says so quietly and never takes the reader elsewhere: the
 * recipient may still be looking at the Signature they just received.
 */
function useNextCycleOpen(enabled: boolean): boolean {
  const publicClient = usePublicClient();
  const cosmicGameContract = useCosmicGameContract();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!enabled || open || !publicClient || !cosmicGameContract) return;
    let cancelled = false;

    const check = async () => {
      try {
        const activationTime = await cosmicGameContract.read.roundActivationTime?.();
        const block = await publicClient.getBlock({ blockTag: 'latest' });
        if (cancelled || activationTime === undefined || block === null) return;
        const activationSec = Number(activationTime);
        if (!Number.isFinite(activationSec) || activationSec <= 0) return;
        if (Number(block.timestamp) >= activationSec) setOpen(true);
      } catch {
        /* transient RPC or contract read failure: the next poll retries */
      }
    };

    void check();
    const id = window.setInterval(() => void check(), ACTIVATION_POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [enabled, open, publicClient, cosmicGameContract]);

  return open;
}

/**
 * The neighbouring cycles' Signature Allocations, as the cycle's record steps
 * through cycles: "‹ Cycle 0" and "Cycle 2 ›", the next one only once it is
 * finalized. Each link is named by its visible label first.
 */
function FinalizedCycleNavigation({ cycle }: { cycle: number }) {
  const t = useTranslations('allocation');
  const liveCycle = useLiveCycle();
  const link = (target: number, direction: 'previous' | 'next') => {
    const label = t('formats.cycle', { cycle: target });
    return (
      <Link
        href={`/allocation-finalized?cycle=${target}`}
        aria-label={t(`details.navigation.${direction}Aria`, { cycle: label })}
        className={buttonVariants({ variant: 'ghost', size: 'sm' })}
      >
        {direction === 'previous' ? <ChevronLeft aria-hidden className="size-4" /> : null}
        {label}
        {direction === 'next' ? <ChevronRight aria-hidden className="size-4" /> : null}
      </Link>
    );
  };
  const hasNext = liveCycle !== null && cycle + 1 < liveCycle;
  if (cycle <= 0 && !hasNext) return null;
  return (
    <nav aria-label={t('finalized.links.cycles')} className="flex items-center gap-1">
      {cycle > 0 ? link(cycle - 1, 'previous') : null}
      {hasNext ? link(cycle + 1, 'next') : null}
    </nav>
  );
}

/** The next cycle has opened: a quiet line with the way to it, announced politely. */
function NextCycleNotice() {
  const t = useTranslations('allocation');
  return (
    <p
      role="status"
      data-testid="next-cycle-notice"
      className="mt-6 flex items-start gap-2 border-t border-rule-faint pt-4 type-body-sm text-muted-foreground"
    >
      <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-positive" />
      <span>
        {t.rich('finalized.nextCycle', {
          link: (chunks) => (
            <Link href="/" className="link">
              {chunks}
            </Link>
          ),
        })}
      </span>
    </p>
  );
}

/** Where the recipient's other allocations of the cycle wait. */
function NextSteps() {
  const t = useTranslations('allocation');
  return (
    <section aria-labelledby="finalized-next" className="mt-8 border-t border-rule-faint pt-6">
      <h3 id="finalized-next" className="type-title text-foreground">
        {t('finalized.next.title')}
      </h3>
      <p className="mt-2 type-body-sm text-muted-foreground">
        {t.rich('finalized.next.body', {
          allocations: (chunks) => (
            <Link href="/my-allocations" className="link">
              {chunks}
            </Link>
          ),
          anchors: (chunks) => (
            <Link href="/my-anchors" className="link">
              {chunks}
            </Link>
          ),
        })}
      </p>
    </section>
  );
}

/**
 * Without a cycle: the latest finalized cycles, each shown by the Signature it imprinted, and
 * the way to every cycle.
 */
function FinalizedCycleIndex() {
  const t = useTranslations('allocation');
  const tDetail = useTranslations('detail');
  const { data: cycles, isLoading, isError, refetch } = useRoundList();
  const latest = useMemo(
    () => [...(cycles ?? [])].sort((a, b) => b.RoundNum - a.RoundNum).slice(0, INDEX_CYCLES),
    [cycles],
  );
  // Each record carries its Signature's seed; the collection is read only for one that lacks it.
  const signatures = useSignatureIndex({
    enabled: latest.some((round) => round.TokenSeed === undefined),
  });

  let body: ReactNode;
  if (!cycles && isError) {
    body = (
      <ErrorState
        headingLevel={3}
        title={t('finalized.index.error')}
        onRetry={() => void refetch()}
      />
    );
  } else if (!isLoading && latest.length === 0) {
    body = (
      <EmptyState
        headingLevel={3}
        icon={<AllocationIcon aria-hidden className="size-6" />}
        title={t('finalized.index.empty.title')}
        description={t('finalized.index.empty.description')}
      />
    );
  } else {
    body = (
      <>
        {signatures.state === 'failed' ? (
          <ErrorState
            variant="inline"
            headingLevel={3}
            tone="warning"
            title={t('art.failed')}
            onRetry={signatures.retry}
            className="mb-6"
          />
        ) : null}
        <ul className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3" aria-busy={isLoading}>
          {isLoading
            ? Array.from({ length: INDEX_CYCLES }, (_, index) => (
                <li key={index} className="flex flex-col gap-3">
                  <PendingPlate busy density="compact" />
                  <Skeleton className="h-4 w-2/5" />
                  <Skeleton className="h-3 w-3/5" />
                </li>
              ))
            : latest.map((round) => (
                <li key={round.RoundNum}>
                  <AllocationSignatureCard
                    tokenId={round.TokenId}
                    seed={round.TokenSeed ?? signatures.get(round.TokenId)?.seed}
                    artState={round.TokenSeed === undefined ? signatures.state : 'ready'}
                    href={`/allocation/${round.RoundNum}`}
                    title={t('formats.cycle', { cycle: round.RoundNum })}
                    meta={[
                      <Amount key="eth" value={round.AmountEth} unit="ETH" />,
                      round.TimeStamp ? <DateTime key="date" timestamp={round.TimeStamp} /> : null,
                    ]}
                    sizes="(min-width: 1024px) 26rem, (min-width: 640px) 45vw, 100vw"
                    unavailableLabel={tDetail('image.artworkUnavailable')}
                    unavailableDetail={formatId(round.TokenId)}
                  />
                </li>
              ))}
        </ul>
      </>
    );
  }

  return (
    <section aria-labelledby="finalized-index">
      <SectionHeader
        headingId="finalized-index"
        title={t('finalized.index.title')}
        description={t('finalized.index.description')}
        actions={
          <Link href="/allocation" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
            {t('finalized.links.allCycles')}
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        }
      />
      {body}
    </section>
  );
}

export default AllocationFinalizedPage;
