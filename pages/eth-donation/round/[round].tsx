import React, { useEffect, useState } from "react";
import { Typography } from "@mui/material";
import { MainWrapper } from "../../../components/styled";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import api from "../../../services/api";
import EthDonationTable from "../../../components/EthDonationTable";

const EthDonationByRound = ({ round }) => {
  const [loading, setLoading] = useState(true);
  const [donationInfo, setDonationInfo] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const info = await api.get_donations_both_by_round(round);
      setDonationInfo(info);
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <MainWrapper>
      <Typography
        variant="h4"
        color="primary"
        gutterBottom
        textAlign="center"
        mb={4}
      >
        Direct (ETH) Donation for Round {round}
      </Typography>
      {loading ? (
        <Typography variant="h6">Loading...</Typography>
      ) : (
        <EthDonationTable list={donationInfo} />
      )}
    </MainWrapper>
  );
};

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const params = context.params!.round;
  const round = Array.isArray(params) ? params[0] : params;
  const title = `Direct (ETH) Donation for Round ${round} | Cosmic Signature`;
  const description = `Direct (ETH) Donation for Round ${round}`;
  const imageUrl = "http://69.10.55.2/images/cosmicsignature/logo.png";

  const openGraphData = [
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: imageUrl },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: imageUrl },
  ];

  return { props: { title, description, openGraphData, round } };
};

export default EthDonationByRound;
