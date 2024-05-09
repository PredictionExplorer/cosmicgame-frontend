import React, { useEffect, useState } from "react";
import { Box, CardActionArea, Link, Typography } from "@mui/material";
import Head from "next/head";
import { MainWrapper, StyledCard } from "../../../components/styled";
import { GetServerSidePropsContext } from "next";
import api from "../../../services/api";
import { convertTimestampToDateTime } from "../../../utils";
import NFTImage from "../../../components/NFTImage";

const StakingActionDetail = ({ actionId, actionType }) => {
  const [actionInfo, setActionInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const info = await api.get_staking_actions_info(actionId);
        if (!actionType) {
          setActionInfo(info.Stake);
        } else {
          setActionInfo(info.Unstake);
        }
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
          <Box>
            <Box mb={1}>
              <Typography color="primary" component="span">
                Action Type:
              </Typography>
              &nbsp;
              <Typography component="span">
                {actionType === 1 ? "Unstake" : "Stake"}
              </Typography>
            </Box>
            <Box mb={1}>
              <Typography color="primary" component="span">
                Stake Datetime:
              </Typography>
              &nbsp;
              <Typography component="span">
                {convertTimestampToDateTime(actionInfo.TimeStamp)}
              </Typography>
            </Box>
            {actionType === 0 && (
              <Box mb={1}>
                <Typography color="primary" component="span">
                  Unstake Datetime:
                </Typography>
                &nbsp;
                <Typography component="span">
                  {convertTimestampToDateTime(actionInfo.UnstakeTimeStamp)}
                </Typography>
              </Box>
            )}
            <Box mb={1}>
              <Typography color="primary" component="span">
                Is RandomWalk Token?
              </Typography>
              &nbsp;
              <Typography component="span">
                {actionInfo.IsRandomWalk ? "Yes" : "No"}
              </Typography>
            </Box>
            <Box mb={1}>
              <Typography color="primary" component="span">
                Staker Address:
              </Typography>
              &nbsp;
              <Link
                href={`/user/${actionInfo.StakerAddr}`}
                style={{ color: "inherit", wordBreak: "break-all" }}
              >
                <Typography component="span">
                  {actionInfo.StakerAddr}
                </Typography>
              </Link>
            </Box>
            <Box mb={1}>
              <Typography color="primary" component="span">
                Number of Staked Tokens:
              </Typography>
              &nbsp;
              <Typography component="span">
                {actionInfo.NumStakedNFTs}
              </Typography>
            </Box>
            <Box mb={1}>
              <Typography color="primary" component="span">
                {actionType === 0 ? "Staked" : "Unstaked"} Token Id:
              </Typography>
              &nbsp;
              <Link
                href={
                  actionInfo.IsRandomWalk
                    ? `https://randomwalknft.com/detail/${actionInfo.TokenId}`
                    : `/detail/${actionInfo.TokenId}`
                }
                style={{ color: "inherit" }}
              >
                <Typography component="span">{actionInfo.TokenId}</Typography>
              </Link>
            </Box>
            <Box sx={{ maxWidth: "400px", mt: 4, mb: 1 }}>
              <StyledCard>
                <CardActionArea>
                  <Link
                    href={
                      actionInfo.IsRandomWalk
                        ? `https://randomwalknft.com/detail/${actionInfo.TokenId}`
                        : `/detail/${actionInfo.TokenId}`
                    }
                    sx={{ display: "block" }}
                  >
                    <NFTImage
                      src={
                        actionInfo.IsRandomWalk
                          ? `https://randomwalknft.s3.us-east-2.amazonaws.com/${actionInfo.TokenId.toString().padStart(
                              6,
                              "0"
                            )}_black_thumb.jpg`
                          : `https://cosmic-game2.s3.us-east-2.amazonaws.com/${actionInfo.TokenId.toString().padStart(
                              6,
                              "0"
                            )}.png`
                      }
                    />
                  </Link>
                </CardActionArea>
              </StyledCard>
            </Box>
          </Box>
        )}
      </MainWrapper>
    </>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const type = context.params!.actionType;
  const id = context.params!.actionId;
  const actionId = Array.isArray(id) ? id[0] : id;
  const actionType = Array.isArray(type) ? type[0] : type;
  return {
    props: { actionId: parseInt(actionId), actionType: parseInt(actionType) },
  };
}

export default StakingActionDetail;
