import React, { useEffect, useState } from "react";
import { Typography } from "@mui/material";
import { MainWrapper } from "../components/styled";
import api from "../services/api";
import DonatedNFTTable from "../components/DonatedNFTTable";
import { GetServerSideProps } from "next";

const NFTDonations = () => {
  const [nftDonations, setNftDonations] = useState(null);
  useEffect(() => {
    const fetchNftDonations = async () => {
      const list = await api.get_donations_nft_list();
      setNftDonations(list);
    };
    fetchNftDonations();
  }, []);

  return (
    <>
      <MainWrapper>
        <Typography
          variant="h4"
          color="primary"
          gutterBottom
          textAlign="center"
          mb={4}
        >
          NFT Donations
        </Typography>
        {nftDonations === null ? (
          <Typography variant="h6">Loading...</Typography>
        ) : (
          <DonatedNFTTable list={nftDonations} handleClaim={null} />
        )}
      </MainWrapper>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const title = "NFT Donations | Cosmic Signature";
  const description = "NFT Donations";
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

export default NFTDonations;
