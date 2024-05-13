import React, { useEffect, useState } from "react";
import { Typography } from "@mui/material";
import Head from "next/head";
import { MainWrapper } from "../components/styled";
import api from "../services/api";
import EthDonationTable from "../components/EthDonationTable";

const EthDonations = () => {
  const [charityDonations, setCharityDonations] = useState(null);
  useEffect(() => {
    const fetchCharityDonations = async () => {
      const rewards = await api.get_charity_donations();
      setCharityDonations(rewards);
    };
    fetchCharityDonations();
  }, []);

  return (
    <>
      <Head>
        <title>Direct (ETH) Donations | Cosmic Signature</title>
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
          Direct (ETH) Donations
        </Typography>
        {charityDonations === null ? (
          <Typography variant="h6">Loading...</Typography>
        ) : (
          <EthDonationTable list={charityDonations} />
        )}
      </MainWrapper>
    </>
  );
};

export default EthDonations;
