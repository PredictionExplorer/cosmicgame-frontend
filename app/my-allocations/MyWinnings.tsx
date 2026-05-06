'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Wallet, Trophy, Gift, Coins } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageShell } from '@/components/ui/page-shell';
import { SectionEyebrow } from '@/components/ui/section-eyebrow';
import { SectionDivider } from '@/components/ui/section-divider';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Spinner } from '@/components/ui/spinner';
import { CustomPagination } from '@/components/common/CustomPagination';
import { useActiveWeb3React } from '@/hooks/web3';
import { useApiData } from '@/contexts/ApiDataContext';
import {
  useUnclaimedDonatedNFTByUser,
  useUnretrievedStellarSelectionDepositsByUser,
  useDonationsERC20ByUser,
} from '@/hooks/useApiQuery';
import { useClaimAllocations } from '@/hooks/useClaimAllocations';
import AttachedNFTTable from '@/components/attachments/AttachedNFTTable';
import { UnretrievedCSTAnchorDistributionsTable } from '@/components/anchoring/UnretrievedCSTAnchorDistributionsTable';
import AttachedERC20Table from '@/components/attachments/AttachedERC20Table';
import {
  StellarSelectionAllocationsTable,
  type StellarSelectionAllocation,
} from '@/components/winnings/StellarSelectionAllocationsTable';

interface UnclaimedDonatedNFT {
  Index: number;
  RecordId: string | number;
  TxHash: string;
  TimeStamp: number;
  DonorAddr: string;
  RoundNum: number;
  TokenAddr: string;
  NFTTokenURI?: string;
  NFTTokenId?: number;
  TokenId?: number;
  [key: string]: unknown;
}

export default function MyWinnings() {
  const { account } = useActiveWeb3React();
  const { apiData: status } = useApiData();
  const router = useRouter();

  const {
    data: nftsRaw,
    isLoading: loadingNFTs,
    isError: nftError,
    refetch: refetchNFTs,
  } = useUnclaimedDonatedNFTByUser(account);
  const {
    data: stellarSelectionRaw,
    isLoading: loadingRaffle,
    isError: raffleError,
    refetch: refetchRaffle,
  } = useUnretrievedStellarSelectionDepositsByUser(account);
  const {
    data: erc20Raw,
    isLoading: erc20Loading,
    refetch: refetchERC20,
  } = useDonationsERC20ByUser(account);

  const refetch = useCallback(() => {
    refetchNFTs();
    refetchRaffle();
    refetchERC20();
  }, [refetchNFTs, refetchRaffle, refetchERC20]);

  const {
    isClaiming,
    claimingDonatedNFTs,
    retrieveAllStellarSelectionETH,
    claimDonatedNFT,
    claimAllDonatedNFTs,
    claimDonatedERC20,
    claimAllDonatedERC20,
  } = useClaimAllocations(refetch);

  const donatedNFTs = useMemo(
    () =>
      nftsRaw
        ? (nftsRaw as UnclaimedDonatedNFT[]).slice().sort((a, b) => a.TimeStamp - b.TimeStamp)
        : null,
    [nftsRaw],
  );
  const stellarSelectionETHAllocations = useMemo(
    () =>
      stellarSelectionRaw
        ? (stellarSelectionRaw as StellarSelectionAllocation[])
            .slice()
            .sort((a, b) => b.TimeStamp - a.TimeStamp)
        : null,
    [stellarSelectionRaw],
  );
  const donatedERC20Data = (erc20Raw ??
    []) as import('@/components/attachments/AttachedERC20Table').DonatedERC20Token[];

  const loading = loadingNFTs || loadingRaffle;
  const error = nftError || raffleError ? 'Failed to load pending allocations data' : null;

  const [currentPage, setCurrentPage] = useState<number>(1);
  const perPage = 5;

  const handleAllETHClaim = () => {
    const roundNums = (stellarSelectionETHAllocations || [])
      .filter((w) => !w.Claimed)
      .map((w) => w.RoundNum);
    retrieveAllStellarSelectionETH(roundNums);
  };

  const handleAllDonatedNFTsClaim = () => {
    if (!donatedNFTs) return;
    claimAllDonatedNFTs(donatedNFTs.map((item) => item.Index));
  };

  const handleAllDonatedERC20Claim = () => {
    const tokens = donatedERC20Data
      .filter((x) => !x.Claimed)
      .map((x) => ({ roundNum: x.RoundNum, tokenAddress: x.TokenAddr, amount: x.AmountEth }));
    claimAllDonatedERC20(tokens);
  };

  if (!account) {
    return (
      <PageShell variant="data" backdrop="signature">
        <PageHeader
          align="left"
          eyebrow={<SectionEyebrow tone="solar">Personal · Allocations</SectionEyebrow>}
          title="My Allocations"
          gradientTitle="signature"
        />
        <EmptyState
          icon={<Wallet className="h-8 w-8 text-muted-foreground/50" />}
          title="Wallet not connected"
          description="Connect your wallet to view and retrieve your allocations."
        />
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell variant="data">
        <PageHeader title="My Allocations" />
        <ErrorState title="Failed to load" message={error} onRetry={refetch} />
      </PageShell>
    );
  }

  return (
    <PageShell variant="data" backdrop="signature">
      <PageHeader
        align="left"
        eyebrow={
          <SectionEyebrow tone="solar" pulse>
            Personal · Allocations
          </SectionEyebrow>
        }
        title="My Allocations"
        gradientTitle="signature"
        subtitle="View and retrieve all your pending allocations"
      />

      <div className="space-y-12">
        {/* ETH Allocations */}
        <section>
          <SectionDivider title="Retrievable ETH Allocations" className="mb-6" />
          {loading && stellarSelectionETHAllocations === null ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : !stellarSelectionETHAllocations || stellarSelectionETHAllocations.length === 0 ? (
            <EmptyState
              icon={<Trophy className="h-8 w-8 text-muted-foreground/50" />}
              title="No ETH allocations yet"
              description="Participate in Stellar Selection by making gestures to receive ETH allocations."
            />
          ) : (
            <>
              <StellarSelectionAllocationsTable
                list={stellarSelectionETHAllocations.slice(
                  (currentPage - 1) * perPage,
                  currentPage * perPage,
                )}
              />
              {status?.ETHRaffleToClaim > 0 && (
                <div className="flex justify-end items-center mt-4 gap-4">
                  <p className="text-sm text-muted-foreground">
                    Retrievable:{' '}
                    <span className="text-white font-medium">
                      {status.ETHRaffleToClaim.toFixed(6)} ETH
                    </span>
                  </p>
                  <Button onClick={handleAllETHClaim} disabled={isClaiming.raffleETH} size="sm">
                    {isClaiming.raffleETH ? (
                      <>
                        <Spinner size="sm" /> Retrieving...
                      </>
                    ) : (
                      'Retrieve All'
                    )}
                  </Button>
                </div>
              )}
              <CustomPagination
                page={currentPage}
                setPage={setCurrentPage}
                totalLength={stellarSelectionETHAllocations.length}
                perPage={perPage}
              />
            </>
          )}
        </section>

        {/* Cosmic Signature NFT Anchoring */}
        <section>
          <SectionDivider title="Cosmic Signature NFT Anchor Distributions" className="mb-6" />
          <UnretrievedCSTAnchorDistributionsTable user={account} />
        </section>

        {/* Attached NFTs */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <SectionDivider title="Attached NFTs" className="flex-1" />
            {status?.NumDonatedNFTToClaim > 0 && (
              <Button
                onClick={handleAllDonatedNFTsClaim}
                disabled={isClaiming.donatedNFT}
                size="sm"
                className="ml-4"
              >
                {isClaiming.donatedNFT ? (
                  <>
                    <Spinner size="sm" /> Retrieving...
                  </>
                ) : (
                  'Retrieve All'
                )}
              </Button>
            )}
          </div>
          {loading && donatedNFTs === null ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : !donatedNFTs || donatedNFTs.length === 0 ? (
            <EmptyState
              icon={<Gift className="h-8 w-8 text-muted-foreground/50" />}
              title="No attached NFTs"
              description="NFTs attached to gestures during cycles will appear here."
            />
          ) : (
            <AttachedNFTTable
              list={donatedNFTs}
              handleClaim={claimDonatedNFT}
              claimingTokens={claimingDonatedNFTs}
            />
          )}
        </section>

        {/* Attached ERC-20 Tokens */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <SectionDivider title="Attached ERC-20 Tokens" className="flex-1" />
            {donatedERC20Data.filter((x) => !x.Claimed).length > 0 && (
              <Button onClick={handleAllDonatedERC20Claim} size="sm" className="ml-4">
                Retrieve All
              </Button>
            )}
          </div>
          {erc20Loading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : donatedERC20Data.length === 0 ? (
            <EmptyState
              icon={<Coins className="h-8 w-8 text-muted-foreground/50" />}
              title="No attached tokens"
              description="ERC-20 tokens attached to gestures during cycles will appear here."
            />
          ) : (
            <AttachedERC20Table list={donatedERC20Data} handleClaim={claimDonatedERC20} />
          )}
        </section>

        <div>
          <Button variant="outline" onClick={() => router.push('/recipient-history')}>
            View Allocation History
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
