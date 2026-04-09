'use client';

import Link from 'next/link';

import { getExplorerUrl, getAssetsUrl, getRWLKImageUrl, convertTimestampToDateTime } from '@/utils';

import { MainWrapper, StyledCard } from '@/components/styled';
import type { StakingAction } from '@/services/api/types';
import NFTImage from '@/components/nft/NFTImage';
import { useStakingRWLKActionsInfo, useStakingCSTActionsInfo } from '@/hooks/useApiQuery';

interface TokenInfoPanelProps {
  isRwalk: boolean;
  actionId: number;
  stake: StakingAction;
}
function TokenInfoPanel({ isRwalk, actionId, stake }: TokenInfoPanelProps) {
  const { TokenId, Seed, StakerAddr } = stake;

  const tokenImageURL = isRwalk
    ? getRWLKImageUrl(TokenId.toString().padStart(6, '0'))
    : getAssetsUrl(`cosmicsignature/0x${Seed}.png`);

  const tokenDetailHref = isRwalk
    ? `https://randomwalknft.com/detail/${TokenId}`
    : `/detail/${TokenId}`;

  return (
    <div className="w-full md:w-1/2">
      <div className="mb-4 max-w-[400px]">
        <StyledCard>
          <Link href={tokenDetailHref} className="block">
            <NFTImage src={tokenImageURL} />
          </Link>
        </StyledCard>
      </div>

      <div className="mb-2">
        <span className="text-primary">Action Id:</span>
        &nbsp;
        <span>{actionId}</span>
      </div>

      <div className="mb-2">
        <span className="text-primary">Staker Address:</span>
        &nbsp;
        <Link href={`/user/${StakerAddr}`} className="break-all text-inherit">
          <span className="font-mono">{StakerAddr}</span>
        </Link>
      </div>

      <div className="mb-2">
        <span className="text-primary">Token Id:</span>
        &nbsp;
        <Link href={tokenDetailHref} className="text-inherit">
          <span>{TokenId}</span>
        </Link>
      </div>
    </div>
  );
}

interface StakeInfoProps {
  stake: StakingAction;
}
function StakeInfo({ stake }: StakeInfoProps) {
  const { TxHash, TimeStamp, NumStakedNFTs } = stake;

  return (
    <div>
      <h4 className="text-lg font-semibold">Stake</h4>
      <div className="mb-2">
        <span className="text-primary">Staked Datetime:</span>
        &nbsp;
        <a
          className="text-inherit"
          href={getExplorerUrl('tx', TxHash)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>{convertTimestampToDateTime(TimeStamp)}</span>
        </a>
      </div>
      <div className="mb-2">
        <span className="text-primary">Number of Staked Tokens:</span>
        &nbsp;
        <span>{NumStakedNFTs}</span>
      </div>
    </div>
  );
}

interface UnstakeInfoProps {
  unstake: StakingAction;
}
function UnstakeInfo({ unstake }: UnstakeInfoProps) {
  const { EvtLogId, TxHash, TimeStamp, NumStakedNFTs } = unstake;

  if (!EvtLogId || EvtLogId === 0) return null;

  return (
    <div className="mt-4">
      <h4 className="text-lg font-semibold">Unstake</h4>
      <div className="mb-2">
        <span className="text-primary">Unstaked Datetime:</span>
        &nbsp;
        <a
          className="text-inherit"
          href={getExplorerUrl('tx', TxHash)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>{convertTimestampToDateTime(TimeStamp)}</span>
        </a>
      </div>
      <div className="mb-2">
        <span className="text-primary">Number of Staked Tokens:</span>
        &nbsp;
        <span>{NumStakedNFTs}</span>
      </div>
    </div>
  );
}

function StakingActionDetailPage({ IsRwalk, actionId }: { IsRwalk: number; actionId: number }) {
  const isRwalk = Boolean(IsRwalk);

  const rwlkQuery = useStakingRWLKActionsInfo(isRwalk ? actionId : null);
  const cstQuery = useStakingCSTActionsInfo(!isRwalk ? actionId : null);
  const activeQuery = isRwalk ? rwlkQuery : cstQuery;
  const { data: actionInfo = null, isLoading: loading } = activeQuery;
  const error = activeQuery.error?.message ?? null;

  return (
    <MainWrapper>
      <div className="mb-8">
        <span className="mr-4 text-xl font-semibold text-primary">
          {`Staking Action for ${isRwalk ? 'RandomWalk' : 'Cosmic Signature'} Token`}
        </span>
      </div>

      {loading ? (
        <p className="text-lg font-semibold">Loading...</p>
      ) : error ? (
        <p className="text-lg font-semibold text-destructive">{error}</p>
      ) : actionInfo ? (
        <div className="flex flex-wrap gap-8">
          <TokenInfoPanel isRwalk={isRwalk} actionId={actionId} stake={actionInfo.Stake!} />

          <div className="w-full md:w-1/2">
            <StakeInfo stake={actionInfo.Stake!} />
            <UnstakeInfo unstake={actionInfo.Unstake!} />
          </div>
        </div>
      ) : (
        <p>No data found for this staking action.</p>
      )}
    </MainWrapper>
  );
}

export default StakingActionDetailPage;
