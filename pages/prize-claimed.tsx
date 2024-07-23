import React, { useEffect, useRef, useState } from "react";
import { Box, Link, Typography } from "@mui/material";
import Head from "next/head";
import { MainWrapper } from "../components/styled";
import { useRouter } from "next/router";
import Fireworks, { FireworksHandlers } from "@fireworks-js/react";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import api from "../services/api";
import { GetServerSideProps } from "next";

const PrizeClaimed = () => {
  const router = useRouter();
  const ref = useRef<FireworksHandlers>(null);
  const [finishFireworks, setFinishFireworks] = useState(false);
  const [prizeInfo, setPrizeInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleFireworksClick = () => {
    ref.current.stop();
    setFinishFireworks(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const roundStr = router.query.round;
        const roundNum = parseInt(
          Array.isArray(roundStr) ? roundStr[0] : roundStr
        );
        const prizeInfo = await api.get_prize_info(roundNum);
        setPrizeInfo(prizeInfo);
        setLoading(false);
      } catch (e) {
        console.log(e);
        setLoading(false);
      }
    };
    if (router.query && router.query.round !== undefined) {
      fetchData();
    }
  }, []);

  return (
    <>
      <MainWrapper>
        {loading ? (
          <Typography variant="h6">Loading...</Typography>
        ) : prizeInfo === null ? (
          <Typography variant="h6">No prize information.</Typography>
        ) : (
          <>
            {router.query && router.query.message && !finishFireworks && (
              <Fireworks
                ref={ref}
                options={{ opacity: 0.5 }}
                style={{
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  position: "fixed",
                  zIndex: 10000,
                }}
                onClick={handleFireworksClick}
              />
            )}
            <Typography
              variant="h4"
              color="primary"
              gutterBottom
              textAlign="center"
              mb={6}
            >
              {`Congratulations! You won the Round ${prizeInfo.PrizeNum}.`}
            </Typography>
            <Typography variant="h5" mb={2}>
              {`Round ${prizeInfo.PrizeNum} rewards are:`}
            </Typography>
            <Box ml={4}>
              <Typography variant="subtitle1">
                {prizeInfo?.AmountEth.toFixed(6)} ETH
              </Typography>
              <Typography variant="subtitle1">
                Cosmic Signature Token Number{" "}
                <Link
                  href={`/detail/${prizeInfo.TokenId}`}
                  sx={{ fontSize: "inherit", color: "inherit" }}
                >
                  {prizeInfo.TokenId}
                </Link>
              </Typography>
              {!!prizeInfo.RoundStats.TotalDonatedNFTs && (
                <Typography variant="subtitle1">
                  {prizeInfo.RoundStats.TotalDonatedNFTs} donated tokens
                  (ERC721)
                </Typography>
              )}
            </Box>
            <Typography variant="subtitle2" mt={4}>
              There also could be random rewards from raffles, to check your
              winnings go to{" "}
              <Link href="/my-winnings" color="inherit">
                My-Winnings
              </Link>{" "}
              page. For staking rewards go to{" "}
              <Link href="/my-staking" color="inherit">
                My-Staking
              </Link>{" "}
              page.
            </Typography>
          </>
        )}
      </MainWrapper>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const title = "Claimed Prize Rewards | Cosmic Signature";
  const description = "Claimed Prize Rewards";
  const imageUrl = "https://cosmic-game2.s3.us-east-2.amazonaws.com/logo.png";

  const openGraphData = [
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: imageUrl },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: imageUrl },
  ];

  return { props: { title, description, openGraphData } };
};

export default PrizeClaimed;
