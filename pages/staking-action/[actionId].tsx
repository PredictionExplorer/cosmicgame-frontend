import React, { useEffect, useState } from "react";
import { Box, CardActionArea, Grid, Link, Typography } from "@mui/material";
import Head from "next/head";
import { MainWrapper, StyledCard } from "../../components/styled";
import { GetServerSidePropsContext } from "next";
import api from "../../services/api";
import { convertTimestampToDateTime } from "../../utils";
import NFTImage from "../../components/NFTImage";

const StakingActionDetail = ({ actionId }) => {
  const [actionInfo, setActionInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const info = await api.get_staking_actions_info(actionId);
        setActionInfo(info);
        setLoading(false);
      } catch (e) {
        setLoading(false);
        console.error(e);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      <Head>
        <title>Staking Action Detail | Cosmic Signature</title>
        <meta name="description" content="" />
      </Head>
      <MainWrapper>
        <Box mb={4}>
          <Typography variant="h4" color="primary" component="span" mr={2}>
            {`Staking Action Id=${actionId}`}
          </Typography>
          <Typography variant="h4" component="span">
            Information
          </Typography>
        </Box>
        {loading ? (
          <Typography variant="h6">Loading...</Typography>
        ) : (
          <>
            <Grid container spacing={4}>
              <Grid item sm={12} md={6}>
                <Box sx={{ maxWidth: "400px", mb: 2 }}>
                  <StyledCard>
                    <CardActionArea>
                      <Link
                        href={
                          actionInfo.Stake.IsRandomWalk
                            ? `https://randomwalknft.com/detail/${actionInfo.Stake.TokenId}`
                            : `/detail/${actionInfo.Stake.TokenId}`
                        }
                        sx={{ display: "block" }}
                      >
                        <NFTImage
                          src={
                            actionInfo.Stake.IsRandomWalk
                              ? `https://randomwalknft.s3.us-east-2.amazonaws.com/${actionInfo.Stake.TokenId.toString().padStart(
                                  6,
                                  "0"
                                )}_black_thumb.jpg`
                              : `https://cosmic-game2.s3.us-east-2.amazonaws.com/${actionInfo.Stake.TokenId.toString().padStart(
                                  6,
                                  "0"
                                )}.png`
                          }
                        />
                      </Link>
                    </CardActionArea>
                  </StyledCard>
                </Box>
                <Box mb={1}>
                  <Typography color="primary" component="span">
                    Is RandomWalk Token?
                  </Typography>
                  &nbsp;
                  <Typography component="span">
                    {actionInfo.Stake.IsRandomWalk ? "Yes" : "No"}
                  </Typography>
                </Box>
                <Box mb={1}>
                  <Typography color="primary" component="span">
                    Staker Address:
                  </Typography>
                  &nbsp;
                  <Link
                    href={`/user/${actionInfo.Stake.StakerAddr}`}
                    style={{ color: "inherit", wordBreak: "break-all" }}
                  >
                    <Typography component="span" fontFamily="monospace">
                      {actionInfo.Stake.StakerAddr}
                    </Typography>
                  </Link>
                </Box>
                <Box mb={1}>
                  <Typography color="primary" component="span">
                    Token Id:
                  </Typography>
                  &nbsp;
                  <Link
                    href={
                      actionInfo.Stake.IsRandomWalk
                        ? `https://randomwalknft.com/detail/${actionInfo.Stake.TokenId}`
                        : `/detail/${actionInfo.Stake.TokenId}`
                    }
                    style={{ color: "inherit" }}
                  >
                    <Typography component="span">
                      {actionInfo.Stake.TokenId}
                    </Typography>
                  </Link>
                </Box>
              </Grid>
              <Grid item sm={12} md={6}>
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
                      href={`https://arbiscan.io/tx/${actionInfo.Stake.TxHash}`}
                      target="__blank"
                    >
                      <Typography component="span">
                        {convertTimestampToDateTime(actionInfo.Stake.TimeStamp)}
                      </Typography>
                    </Link>
                  </Box>
                  <Box mb={1}>
                    <Typography color="primary" component="span">
                      Unstake Eligible Datetime:
                    </Typography>
                    &nbsp;
                    <Typography component="span">
                      {convertTimestampToDateTime(
                        actionInfo.Stake.UnstakeTimeStamp
                      )}
                    </Typography>
                  </Box>
                  <Box mb={1}>
                    <Typography color="primary" component="span">
                      Number of Staked Tokens:
                    </Typography>
                    &nbsp;
                    <Typography component="span">
                      {actionInfo.Stake.NumStakedNFTs}
                    </Typography>
                  </Box>
                </Box>
                {actionInfo.Unstake.EvtLogId !== 0 && (
                  <Box>
                    <Typography variant="h6">Unstake</Typography>
                    <Box mb={1}>
                      <Typography color="primary" component="span">
                        Unstaked Datetime:
                      </Typography>
                      &nbsp;
                      <Link
                        color="inherit"
                        fontSize="inherit"
                        href={`https://arbiscan.io/tx/${actionInfo.Unstake.TxHash}`}
                        target="__blank"
                      >
                        <Typography component="span">
                          {convertTimestampToDateTime(
                            actionInfo.Unstake.TimeStamp
                          )}
                        </Typography>
                      </Link>
                    </Box>
                    <Box mb={1}>
                      <Typography color="primary" component="span">
                        Number of Staked Tokens:
                      </Typography>
                      &nbsp;
                      <Typography component="span">
                        {actionInfo.Unstake.NumStakedNFTs}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Grid>
            </Grid>
          </>
        )}
      </MainWrapper>
    </>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const id = context.params!.actionId;
  const actionId = Array.isArray(id) ? id[0] : id;
  return {
    props: { actionId: parseInt(actionId) },
  };
}

export default StakingActionDetail;
