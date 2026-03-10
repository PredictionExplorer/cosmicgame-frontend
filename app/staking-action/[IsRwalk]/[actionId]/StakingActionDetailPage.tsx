'use client';

import { Box, CardActionArea, Grid, Link, Typography } from '@mui/material';

import { MainWrapper, StyledCard } from '@/components/styled';
import type { StakingAction } from '@/services/api/types';
import NFTImage from '@/components/nft/NFTImage';
import { getExplorerUrl, getAssetsUrl, getRWLKImageUrl, convertTimestampToDateTime } from '@/utils';
import { useStakingRWLKActionsInfo, useStakingCSTActionsInfo } from '@/hooks/useApiQuery';

/* ------------------------------------------------------------------
  Sub-Component: TokenInfoPanel
  Renders the left side panel with token image and basic info
------------------------------------------------------------------ */
interface TokenInfoPanelProps {
  isRwalk: boolean;
  actionId: number;
  stake: StakingAction;
}
function TokenInfoPanel({ isRwalk, actionId, stake }: TokenInfoPanelProps) {
  const { TokenId, Seed, StakerAddr } = stake;

  // Build image URL
  const tokenImageURL = isRwalk
    ? getRWLKImageUrl(TokenId.toString().padStart(6, '0'))
    : getAssetsUrl(`cosmicsignature/0x${Seed}.png`);

  // Build link to NFT detail
  const tokenDetailHref = isRwalk
    ? `https://randomwalknft.com/detail/${TokenId}`
    : `/detail/${TokenId}`;

  return (
    <Grid size={{ sm: 12, md: 6 }}>
      <Box sx={{ maxWidth: '400px', mb: 2 }}>
        <StyledCard>
          <CardActionArea>
            <Link href={tokenDetailHref} sx={{ display: 'block' }}>
              <NFTImage src={tokenImageURL} />
            </Link>
          </CardActionArea>
        </StyledCard>
      </Box>

      {/* Basic Info */}
      <Box mb={1}>
        <Typography color="primary" component="span">
          Action Id:
        </Typography>
        &nbsp;
        <Typography component="span">{actionId}</Typography>
      </Box>

      <Box mb={1}>
        <Typography color="primary" component="span">
          Staker Address:
        </Typography>
        &nbsp;
        <Link href={`/user/${StakerAddr}`} style={{ color: 'inherit', wordBreak: 'break-all' }}>
          <Typography component="span" fontFamily="monospace">
            {StakerAddr}
          </Typography>
        </Link>
      </Box>

      <Box mb={1}>
        <Typography color="primary" component="span">
          Token Id:
        </Typography>
        &nbsp;
        <Link href={tokenDetailHref} style={{ color: 'inherit' }}>
          <Typography component="span">{TokenId}</Typography>
        </Link>
      </Box>
    </Grid>
  );
}

/* ------------------------------------------------------------------
  Sub-Component: StakeInfo
  Renders the "Stake" section data
------------------------------------------------------------------ */
interface StakeInfoProps {
  stake: StakingAction;
}
function StakeInfo({ stake }: StakeInfoProps) {
  const { TxHash, TimeStamp, NumStakedNFTs } = stake;

  return (
    <Box>
      <Typography variant="h6">Stake</Typography>
      <Box mb={1}>
        <Typography color="primary" component="span">
          Staked Datetime:
        </Typography>
        &nbsp;
        <Link
          color="inherit"
          fontSize="inherit"
          href={getExplorerUrl('tx', TxHash)}
          target="_blank"
        >
          <Typography component="span">{convertTimestampToDateTime(TimeStamp)}</Typography>
        </Link>
      </Box>
      <Box mb={1}>
        <Typography color="primary" component="span">
          Number of Staked Tokens:
        </Typography>
        &nbsp;
        <Typography component="span">{NumStakedNFTs}</Typography>
      </Box>
    </Box>
  );
}

/* ------------------------------------------------------------------
  Sub-Component: UnstakeInfo
  Renders the "Unstake" section data (shown only if EvtLogId !== 0)
------------------------------------------------------------------ */
interface UnstakeInfoProps {
  unstake: StakingAction;
}
function UnstakeInfo({ unstake }: UnstakeInfoProps) {
  const { EvtLogId, TxHash, TimeStamp, NumStakedNFTs } = unstake;

  // If no EvtLog, means not unstaked yet
  if (!EvtLogId || EvtLogId === 0) return null;

  return (
    <Box mt={2}>
      <Typography variant="h6">Unstake</Typography>
      <Box mb={1}>
        <Typography color="primary" component="span">
          Unstaked Datetime:
        </Typography>
        &nbsp;
        <Link
          color="inherit"
          fontSize="inherit"
          href={getExplorerUrl('tx', TxHash)}
          target="_blank"
        >
          <Typography component="span">{convertTimestampToDateTime(TimeStamp)}</Typography>
        </Link>
      </Box>
      <Box mb={1}>
        <Typography color="primary" component="span">
          Number of Staked Tokens:
        </Typography>
        &nbsp;
        <Typography component="span">{NumStakedNFTs}</Typography>
      </Box>
    </Box>
  );
}

/* ------------------------------------------------------------------
  Main Component: StakingActionDetailPage
------------------------------------------------------------------ */
function StakingActionDetailPage({ IsRwalk, actionId }: { IsRwalk: number; actionId: number }) {
  const isRwalk = Boolean(IsRwalk);

  const rwlkQuery = useStakingRWLKActionsInfo(isRwalk ? actionId : null);
  const cstQuery = useStakingCSTActionsInfo(!isRwalk ? actionId : null);
  const activeQuery = isRwalk ? rwlkQuery : cstQuery;
  const { data: actionInfo = null, isLoading: loading } = activeQuery;
  const error = activeQuery.error?.message ?? null;

  return (
    <MainWrapper>
      <Box mb={4}>
        <Typography variant="h5" color="primary" component="span" mr={2}>
          {`Staking Action for ${isRwalk ? 'RandomWalk' : 'Cosmic Signature'} Token`}
        </Typography>
      </Box>

      {loading ? (
        <Typography variant="h6">Loading...</Typography>
      ) : error ? (
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      ) : actionInfo ? (
        <Grid container spacing={4}>
          {/* Left Panel: Token Info */}
          <TokenInfoPanel isRwalk={isRwalk} actionId={actionId} stake={actionInfo.Stake!} />

          {/* Right Panel: Stake & Unstake Info */}
          <Grid size={{ sm: 12, md: 6 }}>
            <StakeInfo stake={actionInfo.Stake!} />
            <UnstakeInfo unstake={actionInfo.Unstake!} />
          </Grid>
        </Grid>
      ) : (
        <Typography>No data found for this staking action.</Typography>
      )}
    </MainWrapper>
  );
}

export default StakingActionDetailPage;
