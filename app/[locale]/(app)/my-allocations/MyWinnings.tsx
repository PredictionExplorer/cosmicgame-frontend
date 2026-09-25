'use client';

import { useCallback, useMemo, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { useSiteNavCopy } from '@/components/layout/siteNavCopy';
import { Button, buttonVariants } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { PageShell } from '@/components/ui/page-shell';
import { SectionHeader } from '@/components/ui/section-header';
import { WalletRequiredState } from '@/components/wallet/WalletRequiredState';
import { AddressLookup } from '@/components/winnings/AddressLookup';
import { UnretrievedCSTAnchorDistributionsTable } from '@/components/anchoring/UnretrievedCSTAnchorDistributionsTable';
import {
  AttachedNftRetrievalTable,
  AttachedTokenRetrievalTable,
  type AttachedNftRetrievalRow,
} from '@/components/winnings/AttachedRetrievalTables';
import {
  EthAllocationsTable,
  type EthAllocationRow,
} from '@/components/winnings/EthAllocationsTable';
import { RetrievalSummary } from '@/components/winnings/RetrievalSummary';
import { buildRetrievalPlan, nextDeadline } from '@/utils/allocationRetrieval';
import { useRetrievalDeadlines } from '@/components/winnings/useRetrievalDeadlines';
import { useApiData } from '@/contexts/ApiDataContext';
import {
  useDonationsERC20ByUser,
  useUnclaimedDonatedNFTByUser,
  useUnretrievedStellarSelectionDepositsByUser,
} from '@/hooks/useApiQuery';
import { useClaimAllocations } from '@/hooks/useClaimAllocations';
import { useNow } from '@/hooks/useNow';
import { useActiveWeb3React } from '@/hooks/web3';
import { AllocationIcon } from '@/lib/conceptIcons';
import { getDonatedErc20RawClaimAmount } from '@/utils/donatedErc20';
import type { DonatedERC20Token } from '@/services/api/types';

/** The sections a retrieve can start from; the summary owns the status line only for its own run. */
type RetrieveOrigin = 'everything' | 'section';

/**
 * My Allocations: everything the protocol set aside for the connected wallet
 * and one place to retrieve it. A summary leads with what is ready and one
 * "Retrieve everything" transaction; the sections below list each kind of
 * item for anyone who wants to retrieve them one by one. Sections with
 * nothing in them are left out, and a wallet with nothing waiting sees a
 * single empty state.
 */
export default function MyWinnings() {
  const t = useTranslations('myPages');
  const tWallet = useTranslations('wallet');
  const nav = useSiteNavCopy();
  const { account } = useActiveWeb3React();
  const { unretrievedAnchorEth: anchorAmount, unclaimedRewards, retryAnchorRead } = useApiData();

  const {
    data: nftsRaw,
    isLoading: loadingNfts,
    isError: nftError,
    refetch: refetchNfts,
  } = useUnclaimedDonatedNFTByUser(account);
  const {
    data: depositsRaw,
    isLoading: loadingDeposits,
    isError: depositsError,
    refetch: refetchDeposits,
  } = useUnretrievedStellarSelectionDepositsByUser(account);
  const {
    data: tokensRaw,
    isLoading: loadingTokens,
    isError: tokensError,
    refetch: refetchTokens,
  } = useDonationsERC20ByUser(account);

  const refetch = useCallback(() => {
    void refetchNfts();
    void refetchDeposits();
    void refetchTokens();
  }, [refetchNfts, refetchDeposits, refetchTokens]);

  const {
    isClaiming,
    claimingDonatedNFTs,
    claimingDonatedTokens,
    txStage,
    retrieveEverything,
    retrieveAllStellarSelectionETH,
    claimDonatedNFT,
    claimAllDonatedNFTs,
    claimDonatedERC20,
    claimAllDonatedERC20,
  } = useClaimAllocations(refetch);
  const [origin, setOrigin] = useState<RetrieveOrigin | null>(null);

  const deposits = useMemo(
    () => (depositsRaw ?? []).filter((row) => !row.Claimed) as EthAllocationRow[],
    [depositsRaw],
  );
  const nfts = useMemo(
    () =>
      ((nftsRaw ?? []) as unknown as AttachedNftRetrievalRow[])
        .slice()
        .sort((a, b) => (a.TimeStamp ?? 0) - (b.TimeStamp ?? 0)),
    [nftsRaw],
  );
  const tokens = useMemo(() => (tokensRaw ?? []) as DonatedERC20Token[], [tokensRaw]);
  const openTokens = useMemo(() => tokens.filter((token) => !token.Claimed), [tokens]);

  const loading = loadingDeposits || loadingNfts || loadingTokens;
  const plan = useMemo(
    () => (loading ? null : buildRetrievalPlan({ deposits, nfts, tokens })),
    [loading, deposits, nfts, tokens],
  );
  const { deadlines } = useRetrievalDeadlines(plan?.rounds ?? []);
  const nowSeconds = Math.floor(useNow(60_000) / 1000);
  const deadline = plan
    ? nextDeadline(
        plan.rounds.map((round) => deadlines[round]),
        nowSeconds,
      )
    : null;

  // The Anchor Distribution read: `undefined` while it loads, `null` when it failed. Unknown is
  // never "nothing waiting": a failed read keeps its section, with a retry.
  const anchorKnown = anchorAmount !== undefined && anchorAmount !== null;
  const anchorFailed = anchorAmount === null;
  const hasAnchorDistributions =
    anchorFailed || (anchorAmount ?? 0) > 0 || unclaimedRewards.length > 0;

  const runFromSection = (action: () => Promise<void>) => {
    setOrigin('section');
    void action();
  };

  const handleRetrieveEverything = () => {
    if (!plan || plan.isEmpty) return;
    setOrigin('everything');
    void retrieveEverything({
      ethRounds: plan.ethRounds,
      tokenClaims: plan.tokenClaims,
      nftIndexes: plan.nftIndexes,
      successMessage: t('allocations.summary.success'),
    });
  };

  if (!account) {
    return (
      <PageShell variant="data" backdrop="signature">
        <PageHeader
          section="account"
          title={t('allocations.title')}
          subtitle={t('allocations.subtitle')}
        />
        <WalletRequiredState
          title={tWallet('required.allocations.title')}
          description={tWallet('required.allocations.description')}
          publicLink={{ href: '/allocation', label: tWallet('required.allocations.publicLink') }}
        >
          {/* Allocations are public: without a wallet, any address can still be looked up. */}
          <AddressLookup className="mt-8" />
        </WalletRequiredState>
      </PageShell>
    );
  }

  const header = (
    <PageHeader
      section="account"
      title={t('allocations.title')}
      subtitle={t('allocations.subtitle')}
      related={[
        { href: '/recipient-history', label: nav.routeLabel('allocationHistory') },
        { href: '/my-anchors', label: nav.routeLabel('myAnchors') },
      ]}
    />
  );

  // Any list that could not be read makes every total below a guess: a token read that failed
  // would show "0 attached tokens", leave them out of "Retrieve everything" and could even say
  // there is nothing to retrieve, while after the deadline anyone may take them.
  if (nftError || depositsError || tokensError) {
    return (
      <PageShell variant="data" backdrop="signature">
        {header}
        <ErrorState
          headingLevel={2}
          title={t('allocations.loadErrorTitle')}
          message={t('allocations.loadErrorMessage')}
          onRetry={refetch}
        />
      </PageShell>
    );
  }

  const nothingWaiting = plan !== null && plan.isEmpty && anchorKnown && !hasAnchorDistributions;
  // Until the anchor read settles, an empty plan could still be "nothing waiting": the summary
  // holds its skeletons rather than show zeros that may switch to the empty page.
  const summaryPlan = plan?.isEmpty && anchorAmount === undefined ? null : plan;
  const retrieveAllLabel = t('allocations.retrieveAll');

  return (
    <PageShell variant="data" backdrop="signature">
      {header}

      {nothingWaiting ? (
        <EmptyState
          variant="page"
          headingLevel={2}
          icon={<AllocationIcon aria-hidden className="size-6" />}
          title={t('allocations.nothing.title')}
          description={t('allocations.nothing.description')}
          action={
            <Link
              href="/recipient-history"
              className={buttonVariants({ variant: 'outline', size: 'sm' })}
            >
              {nav.routeLabel('allocationHistory')}
              <ArrowRight aria-hidden className="size-4" />
            </Link>
          }
        />
      ) : (
        <div className="space-y-[var(--block-gap)]">
          <RetrievalSummary
            plan={summaryPlan}
            anchorAmount={anchorAmount}
            deadline={deadline}
            busy={isClaiming.everything}
            stage={origin === 'everything' ? txStage : { status: 'idle' }}
            onRetrieveEverything={handleRetrieveEverything}
          />

          {loading || deposits.length > 0 ? (
            <section id="eth" aria-labelledby="eth-heading" className="scroll-mt-28">
              <SectionHeader
                headingId="eth-heading"
                title={t('allocations.sections.eth')}
                description={t('allocations.sections.ethDescription')}
                actions={
                  deposits.length > 0 ? (
                    <Button
                      variant="outline"
                      size="sm"
                      loading={isClaiming.raffleETH}
                      onClick={() =>
                        runFromSection(() =>
                          retrieveAllStellarSelectionETH(deposits.map((row) => row.RoundNum ?? -1)),
                        )
                      }
                    >
                      {retrieveAllLabel}
                    </Button>
                  ) : null
                }
              />
              <EthAllocationsTable
                rows={deposits}
                ariaLabel={t('allocations.sections.eth')}
                deadlines={deadlines}
                loading={loadingDeposits}
                headingLevel={3}
              />
            </section>
          ) : null}

          {hasAnchorDistributions ? (
            <section id="anchors" aria-labelledby="anchors-heading" className="scroll-mt-28">
              <SectionHeader
                headingId="anchors-heading"
                title={t('allocations.sections.anchors')}
                description={t('allocations.sections.anchorsDescription')}
              />
              {anchorFailed ? (
                <ErrorState
                  variant="panel"
                  headingLevel={3}
                  title={t('allocations.anchorLoadError.title')}
                  message={t('allocations.anchorLoadError.message')}
                  onRetry={retryAnchorRead}
                />
              ) : (
                <UnretrievedCSTAnchorDistributionsTable user={account} />
              )}
            </section>
          ) : null}

          {nfts.length > 0 ? (
            <section id="nfts" aria-labelledby="nfts-heading" className="scroll-mt-28">
              <SectionHeader
                headingId="nfts-heading"
                title={t('allocations.sections.nfts')}
                actions={
                  <Button
                    variant="outline"
                    size="sm"
                    loading={isClaiming.donatedNFT}
                    onClick={() =>
                      runFromSection(() => claimAllDonatedNFTs(nfts.map((item) => item.Index)))
                    }
                  >
                    {retrieveAllLabel}
                  </Button>
                }
              />
              <AttachedNftRetrievalTable
                rows={nfts}
                ariaLabel={t('allocations.sections.nfts')}
                headingLevel={3}
                onRetrieve={(index) => runFromSection(() => claimDonatedNFT(index))}
                retrieving={claimingDonatedNFTs}
              />
            </section>
          ) : null}

          {openTokens.length > 0 ? (
            <section id="erc20" aria-labelledby="erc20-heading" className="scroll-mt-28">
              <SectionHeader
                headingId="erc20-heading"
                title={t('allocations.sections.erc20')}
                actions={
                  <Button
                    variant="outline"
                    size="sm"
                    loading={isClaiming.donatedERC20}
                    onClick={() =>
                      runFromSection(() => claimAllDonatedERC20(plan?.tokenClaims ?? []))
                    }
                  >
                    {retrieveAllLabel}
                  </Button>
                }
              />
              <AttachedTokenRetrievalTable
                rows={openTokens}
                ariaLabel={t('allocations.sections.erc20')}
                headingLevel={3}
                onRetrieve={(row) =>
                  runFromSection(() =>
                    claimDonatedERC20(
                      row.RoundNum,
                      row.TokenAddr,
                      getDonatedErc20RawClaimAmount(row),
                    ),
                  )
                }
                retrieving={claimingDonatedTokens}
              />
            </section>
          ) : null}
        </div>
      )}
    </PageShell>
  );
}
