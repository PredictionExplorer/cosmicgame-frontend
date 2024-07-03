import React, { useEffect, useState } from "react";
import { Typography } from "@mui/material";
import Head from "next/head";
import { MainWrapper } from "../components/styled";
import api from "../services/api";
import DonatedNFTTable from "../components/DonatedNFTTable";

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
      <Head>
        <title>NFT Donations | Cosmic Signature</title>
        <meta name="description" content="" />
      </Head>
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

export default NFTDonations;
