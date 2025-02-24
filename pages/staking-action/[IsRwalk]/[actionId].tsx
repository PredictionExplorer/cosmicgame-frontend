import React, { useEffect, useState } from "react";
import { Box, CardActionArea, Grid, Link, Typography } from "@mui/material";
import { GetServerSidePropsContext } from "next";

import { MainWrapper, StyledCard } from "../../../components/styled";
import api from "../../../services/api";
import NFTImage from "../../../components/NFTImage";
import {
  getAssetsUrl,
  convertTimestampToDateTime,
  logoImgUrl,
} from "../../../utils";

/* ------------------------------------------------------------------
  Custom Hook: useStakingActionDetail
  Handles data fetching & loading states for a single staking action.
------------------------------------------------------------------ */
function useStakingActionDetail(actionId: number, isRwalk: boolean) {
  const [actionInfo, setActionInfo] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStakingAction = async () => {
    try {
      setLoading(true);
      let info;
      if (isRwalk) {
        info = await api.get_staking_rwalk_actions_info(actionId);
      } else {
        info = await api.get_staking_cst_actions_info(actionId);
      }
      setActionInfo(info);
    } catch (e) {
      console.error("Error fetching staking action info:", e);
      setError("Failed to load staking action info.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStakingAction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionId, isRwalk]);

  return { actionInfo, loading, error };
}

/* ------------------------------------------------------------------
  Sub-Component: TokenInfoPanel
  Renders the left side panel with token image and basic info
------------------------------------------------------------------ */
interface TokenInfoPanelProps {
  isRwalk: boolean;
  actionId: number;
  stake: any; // shape from API (Stake info)
}
function TokenInfoPanel({ isRwalk, actionId, stake }: TokenInfoPanelProps) {
  const { TokenId, Seed, StakerAddr } = stake;

  // Build image URL
  const tokenImageURL = isRwalk
    ? getAssetsUrl(
        `${"randomwalk"}/${TokenId.toString().padStart(6, "0")}_black_thumb.jpg`
      )
    : getAssetsUrl(`cosmicsignature/0x${Seed}.png`);

  // Build link to NFT detail
  const tokenDetailHref = isRwalk
    ? `https://randomwalknft.com/detail/${TokenId}`
    : `/detail/${TokenId}`;

  return (
    <Grid item sm={12} md={6}>
      <Box sx={{ maxWidth: "400px", mb: 2 }}>
        <StyledCard>
          <CardActionArea>
            <Link href={tokenDetailHref} sx={{ display: "block" }}>
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
        <Link
          href={`/user/${StakerAddr}`}
          style={{ color: "inherit", wordBreak: "break-all" }}
        >
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
        <Link href={tokenDetailHref} style={{ color: "inherit" }}>
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
  stake: any; // shape from API
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
          href={`https://arbiscan.io/tx/${TxHash}`}
          target="_blank"
        >
          <Typography component="span">
            {convertTimestampToDateTime(TimeStamp)}
          </Typography>
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
  unstake: any; // shape from API
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
          href={`https://arbiscan.io/tx/${TxHash}`}
          target="_blank"
        >
          <Typography component="span">
            {convertTimestampToDateTime(TimeStamp)}
          </Typography>
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
  Main Component: StakingActionDetail
------------------------------------------------------------------ */
function StakingActionDetail({
  IsRwalk,
  actionId,
}: {
  IsRwalk: number;
  actionId: number;
}) {
  const isRwalk = Boolean(IsRwalk);

  // Use the custom hook
  const { actionInfo, loading, error } = useStakingActionDetail(
    actionId,
    isRwalk
  );

  return (
    <MainWrapper>
      <Box mb={4}>
        <Typography variant="h5" color="primary" component="span" mr={2}>
          {`Staking Action for ${
            isRwalk ? "RandomWalk" : "Cosmic Signature"
          } Token`}
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
          <TokenInfoPanel
            isRwalk={isRwalk}
            actionId={actionId}
            stake={actionInfo.Stake}
          />

          {/* Right Panel: Stake & Unstake Info */}
          <Grid item sm={12} md={6}>
            <StakeInfo stake={actionInfo.Stake} />
            <UnstakeInfo unstake={actionInfo.Unstake} />
          </Grid>
        </Grid>
      ) : (
        <Typography>No data found for this staking action.</Typography>
      )}
    </MainWrapper>
  );
}

/* ------------------------------------------------------------------
  getServerSideProps
------------------------------------------------------------------ */
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { actionId, IsRwalk } = context.params as any;

  const parsedActionId = parseInt(
    Array.isArray(actionId) ? actionId[0] : actionId
  );
  const parsedIsRwalk = parseInt(Array.isArray(IsRwalk) ? IsRwalk[0] : IsRwalk);

  const title = `Detail for ${
    parsedIsRwalk ? "RandomWalk NFT" : "Cosmic Signature Token"
  } Staking Action Id = ${parsedActionId} | Cosmic Signature`;
  const description = `Detail for ${
    parsedIsRwalk ? "RandomWalk NFT" : "Cosmic Signature Token"
  } Staking Action Id = ${parsedActionId}`;

  const openGraphData = [
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: logoImgUrl },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: logoImgUrl },
  ];

  return {
    props: {
      title,
      description,
      openGraphData,
      actionId: parsedActionId,
      IsRwalk: parsedIsRwalk,
    },
  };
}

export default StakingActionDetail;
