import React, { useEffect, useState } from "react";
import { Typography } from "@mui/material";
import { MainWrapper } from "../components/styled";
import api from "../services/api";
import EthDonationTable from "../components/EthDonationTable";
import { GetServerSideProps } from "next";

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

export const getServerSideProps: GetServerSideProps = async () => {
  const title = "Direct (ETH) Donations | Cosmic Signature";
  const description = "Direct (ETH) Donations";
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

export default EthDonations;
