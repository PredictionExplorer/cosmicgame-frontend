import { GetServerSidePropsContext } from "next";
import React, { useEffect, useState } from "react";
import Head from "next/head";
import NFTTrait from "../../components/NFTTrait";
import { MainWrapper } from "../../components/styled";
import api from "../../services/api";
import { Container, Typography } from "@mui/material";

const Detail = ({ tokenId }) => {
  const [loading, setLoading] = useState(true);
  const [nft, setNft] = useState(null);
  const [prizeInfo, setPrizeInfo] = useState(null);
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const dashboardData = await api.get_dashboard_info();
      setDashboard(dashboardData);
      if (dashboardData.MainStats.NumCSTokenMints > tokenId) {
        const res = await api.get_cst_info(tokenId);
        setNft(res.TokenInfo);
        setPrizeInfo(res.PrizeInfo);
      }
      setLoading(false);
    };
    fetchData();
  }, [tokenId]);

  return (
    <>
      <Head>
        <title>NFT #{nft?.TokenId} | CosmicSignature Token</title>
      </Head>
      <MainWrapper
        maxWidth={false}
        style={{
          paddingLeft: 0,
          paddingRight: 0,
        }}
      >
        {loading ? (
          <Container>
            <Typography variant="h6">Loading...</Typography>
          </Container>
        ) : (
          <NFTTrait
            nft={nft}
            prizeInfo={prizeInfo}
            numCSTokenMints={dashboard.MainStats.NumCSTokenMints}
          />
        )}
      </MainWrapper>
    </>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const id = context.params!.id;
  const tokenId = Array.isArray(id) ? id[0] : id;
  return { props: { tokenId: parseInt(tokenId) } };
}

export default Detail;
