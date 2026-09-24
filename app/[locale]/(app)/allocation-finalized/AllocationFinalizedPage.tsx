'use client';

import type { ReactNode } from 'react';
import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { usePublicClient } from 'wagmi';
import { useTranslations } from 'next-intl';

import { Link, useRouter } from '@/i18n/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { AddressChip } from '@/components/ui/address-chip';
import { Amount } from '@/components/ui/amount';
import { PendingPlate, WallLabel } from '@/components/ui/art-frame';
import { buttonVariants } from '@/components/ui/button';
import { DateTime } from '@/components/ui/date-time';
import { ErrorState } from '@/components/ui/error-state';
import { PageShell } from '@/components/ui/page-shell';
import { SectionHeader } from '@/components/ui/section-header';
import { Skeleton } from '@/components/ui/skeleton';
import { TxExplorerLink } from '@/components/ui/tx-status';
import { isRenderPending, signatureMedia, signatureSources } from '@/components/nft/signatureArt';
import { useMissingCycle } from '@/components/winnings/missingCycle';
import { SignatureCard } from '@/components/winnings/SignatureCard';
import { SignatureReveal } from '@/components/winnings/SignatureReveal';
import { SpecList, SpecRow } from '@/components/winnings/SpecList';
import { useSignatureIndex } from '@/components/winnings/useSignatureIndex';
import useCosmicGameContract from '@/hooks/useCosmicGameContract';
import { useCSTInfo, useRoundInfo, useRoundList } from '@/hooks/useApiQuery';
import { useNow } from '@/hooks/useNow';
import { useActiveWeb3React } from '@/hooks/web3';
import { isRecordNotFound } from '@/services/api/readError';
import { toFiniteNumber } from '@/utils/finiteNumber';
import { sameAddress } from '@/utils/format';
import { formatId } from '@/utils/format/ids';

/** Poll interval while waiting for the next cycle to become active (chain activation time). */
const ACTIVATION_POLL_MS = 4000;
/** Poll interval while the indexer has not yet recorded the cycle a participant just finalized. */
const RECORD_POLL_MS = 5000;
/** How many finalized cycles the page shows when no cycle is named. */
const INDEX_CYCLES = 3;

/** The cycle number of the `cycle` query parameter, or `null` when it is not one. */
function cycleParam(raw: string | null): number | null {
  if (raw === null || !/^\d+$/.test(raw)) return null;
  const cycle = Number.parseInt(raw, 10);
  return Number.isSafeInteger(cycle) ? cycle : null;
}

/**
 * The page a participant lands on after finalizing a cycle, and the public
 * record of any finalized cycle's Signature Allocation.
 *
 * - With `?cycle=N`: the cycle's new Signature on its plate (revealed as it
 *   arrives, on the moment it was received) beside what the Signature
 *   Allocation holds: ETH, CST, the NFT, attached NFTs and the recipient.
 *   Only the recipient, arriving from their own finalization, is
 *   congratulated; everyone else reads a neutral record.
 * - Without a cycle: the server-rendered summary and the latest finalized
 *   cycles, each shown by its Signature.
 */
const AllocationFinalizedPage = ({ seoSummary }: { seoSummary?: ReactNode }) => {
  const t = useTranslations('allocation');
  const tCommon = useTranslations('common');
  const searchParams = useSearchParams();
  const router = useRouter();
  const publicClient = usePublicClient();
  const cosmicGameContract = useCosmicGameContract();
  const { account } = useActiveWeb3React();

  const cycle = cycleParam(searchParams.get('cycle'));
  const isClaimSuccess = searchParams.get('message') === 'success';

  const { data: allocationInfo, isLoading, isError, error, refetch } = useRoundInfo(cycle ?? -1);
  const missingCycle = useMissingCycle(cycle ?? 0);
  // The API answers 400 for a cycle it holds no record of: not indexed yet, still open, or not
  // started. Anything else that fails is a failed read, with a retry.
  const missing =
    (isError && isRecordNotFound(error)) || (!isLoading && !isError && !allocationInfo);

  /**
   * After `claimMainPrize`, the chain is on the next cycle; `roundActivationTime()` is when
   * that cycle opens. Until then the participant stays on this page; once it opens they are
   * sent home, where the dashboard shows the live cycle.
   */
  useEffect(() => {
    if (!isClaimSuccess || cycle === null || !publicClient || !cosmicGameContract) return;

    let cancelled = false;

    const maybeRedirectWhenRoundActive = async () => {
      try {
        const activationTime = await cosmicGameContract.read.roundActivationTime?.();
        const block = await publicClient.getBlock({ blockTag: 'latest' });
        if (cancelled || activationTime === undefined || block === null) return;

        const activationSec = Number(activationTime);
        const blockSec = Number(block.timestamp);
        if (!Number.isFinite(activationSec) || activationSec <= 0) return;

        if (blockSec >= activationSec) {
          router.replace('/');
        }
      } catch {
        /* transient RPC or contract read failure — next poll retries */
      }
    };

    void maybeRedirectWhenRoundActive();
    const id = window.setInterval(() => void maybeRedirectWhenRoundActive(), ACTIVATION_POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [isClaimSuccess, cycle, publicClient, cosmicGameContract, router]);

  // A participant who just finalized arrives before the indexer: keep asking until it has
  // the cycle, so the record (and its Signature) appears without a reload.
  const waitingForRecord = isClaimSuccess && cycle !== null && missing;
  useEffect(() => {
    if (!waitingForRecord) return;
    const id = window.setInterval(() => void refetch(), RECORD_POLL_MS);
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
    { label: tCommon('pageHeader.crumbs.allocationRecipients'), href: '/allocation' },
    { label: tCommon('pageHeader.crumbs.cycle', { cycle }), href: `/allocation/${cycle}` },
  ];

  if (isLoading) {
    return (
      <PageShell variant="data" backdrop="signature">
        <PageHeader
          section="records"
          breadcrumbs={trail}
          title={t('finalized.result.title', { cycle })}
        />
        <FinalizedSignatureSkeleton label={t('finalized.loading.status')} />
      </PageShell>
    );
  }

  if (isError && !missing) {
    return (
      <PageShell variant="data" backdrop="signature">
        <PageHeader
          section="records"
          breadcrumbs={trail}
          title={t('finalized.result.title', { cycle })}
        />
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
    // Arriving from their own finalization, the participant waits for the indexer here.
    if (isClaimSuccess) {
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
          />
          <FinalizedSignatureSkeleton label={t('finalized.loading.status')} />
        </PageShell>
      );
    }
    return (
      <PageShell variant="data" backdrop="signature">
        <PageHeader
          section="records"
          breadcrumbs={trail}
          title={missingCycle.title}
          subtitle={missingCycle.body}
          actions={missingCycle.currentCycleLink}
          related={[{ href: '/allocation', label: t('finalized.links.allRecipients') }]}
        />
      </PageShell>
    );
  }

  const isRecipient = sameAddress(account, allocationInfo.WinnerAddr);
  // Congratulations belong to the participant who finalized: arriving from their own
  // finalization, and, when a wallet is connected, holding the recipient's address.
  const congratulate = isClaimSuccess && (!account || isRecipient);

  return (
    <PageShell variant="data" backdrop="signature">
      <PageHeader
        section="records"
        breadcrumbs={trail}
        title={
          congratulate
            ? t('finalized.result.successTitle', { cycle: allocationInfo.RoundNum })
            : t('finalized.result.title', { cycle: allocationInfo.RoundNum })
        }
        subtitle={
          congratulate
            ? t('finalized.result.successLede', { cycle: allocationInfo.RoundNum })
            : t('finalized.result.lede')
        }
      />
      <FinalizedSignature allocation={allocationInfo} reveal={congratulate}>
        {congratulate ? <NextSteps /> : null}
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
  const hasToken = allocation.TokenId >= 0;
  const { data: token } = useCSTInfo(hasToken ? allocation.TokenId : null);
  const nowMs = useNow(60_000);
  const id = formatId(allocation.TokenId);
  const name = typeof token?.TokenName === 'string' ? token.TokenName.trim() : '';
  const rendering = isRenderPending(allocation.TimeStamp, nowMs);
  const attached = toFiniteNumber(allocation.RoundStats?.TotalDonatedNFTs) ?? 0;
  const sources = useMemo(() => signatureSources(signatureMedia(token?.Seed)), [token?.Seed]);

  return (
    <section
      aria-labelledby="finalized-allocation"
      className="grid gap-x-12 gap-y-10 lg:grid-cols-12 lg:items-start"
      data-testid="finalized-signature"
    >
      <figure className="flex min-w-0 flex-col gap-4 lg:col-span-7">
        {hasToken ? (
          <Link href={`/detail/${allocation.TokenId}`} tabIndex={-1} aria-hidden className="block">
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
            meta={[
              name ? <span className="type-mono">{id}</span> : null,
              t('formats.cycle', { cycle: allocation.RoundNum }),
              allocation.TimeStamp ? <DateTime timestamp={allocation.TimeStamp} /> : null,
            ]}
          />
        ) : null}
      </figure>

      <div className="min-w-0 lg:col-span-5">
        <h2 id="finalized-allocation" className="type-heading-3 text-foreground">
          {t('finalized.result.componentsTitle')}
        </h2>
        <SpecList className="mt-4">
          <SpecRow label={t('finalized.result.eth')}>
            <Amount value={allocation.AmountEth} unit="ETH" context="exact" />
          </SpecRow>
          <SpecRow label={t('finalized.result.cst')}>
            <Amount value={allocation.CSTAmountEth} unit="CST" />
          </SpecRow>
          {hasToken ? (
            <SpecRow label={t('finalized.result.nft')}>
              <Link href={`/detail/${allocation.TokenId}`} className="link type-mono">
                {id}
              </Link>
            </SpecRow>
          ) : null}
          {attached > 0 ? (
            <SpecRow label={t('finalized.result.attached')}>
              {t('finalized.result.attachedTokens', { count: attached })}
            </SpecRow>
          ) : null}
          <SpecRow label={t('finalized.result.recipient')}>
            <AddressChip address={allocation.WinnerAddr} />
          </SpecRow>
          {allocation.TimeStamp ? (
            <SpecRow label={t('finalized.result.finalized')}>
              <DateTime timestamp={allocation.TimeStamp} variant="full" />
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
          {allocation.TxHash ? (
            <TxExplorerLink
              hash={allocation.TxHash}
              label={t('finalized.result.viewTransaction')}
              className="type-body-sm"
            />
          ) : null}
        </div>
        {children}
      </div>
    </section>
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

/** The layout of FinalizedSignature while it loads, so nothing moves when it arrives. */
function FinalizedSignatureSkeleton({ label }: { label: string }) {
  return (
    <div
      role="status"
      aria-label={label}
      className="grid gap-x-12 gap-y-10 lg:grid-cols-12 lg:items-start"
    >
      <div className="flex flex-col gap-4 lg:col-span-7">
        <PendingPlate busy />
        <Skeleton className="h-5 w-56" />
        <Skeleton className="h-3.5 w-40" />
      </div>
      <div className="lg:col-span-5">
        <Skeleton className="h-6 w-48" />
        <div className="mt-4 divide-y divide-rule-faint border-y border-rule-faint">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="flex min-h-[var(--row-h)] items-center justify-between">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Without a cycle: the latest finalized cycles, each shown by the Signature it imprinted, and
 * the way to every cycle.
 */
function FinalizedCycleIndex() {
  const t = useTranslations('allocation');
  const tDetail = useTranslations('detail');
  const { data: cycles = [], isLoading } = useRoundList();
  const signatures = useSignatureIndex();
  const latest = useMemo(
    () => [...cycles].sort((a, b) => b.RoundNum - a.RoundNum).slice(0, INDEX_CYCLES),
    [cycles],
  );

  return (
    <section aria-labelledby="finalized-index">
      <SectionHeader
        headingId="finalized-index"
        title={t('finalized.index.title')}
        description={t('finalized.index.description')}
        actions={
          <Link href="/allocation" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
            {t('finalized.links.allRecipients')}
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        }
      />
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
                <SignatureCard
                  tokenId={round.TokenId}
                  seed={signatures.get(round.TokenId)?.seed}
                  href={`/allocation/${round.RoundNum}`}
                  title={t('formats.cycleHash', { cycle: round.RoundNum })}
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
    </section>
  );
}

export default AllocationFinalizedPage;
