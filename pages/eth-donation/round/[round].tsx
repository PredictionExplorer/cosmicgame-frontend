import React, { useEffect, useState } from "react";
import { Typography } from "@mui/material";
import { MainWrapper } from "../../../components/styled";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import api from "../../../services/api";
import EthDonationTable from "../../../components/EthDonationTable";
import { logoImgUrl } from "../../../utils";

// Define TypeScript types for props
interface EthDonationByRoundProps {
  round: number;
}

// Component to display Ethereum donations by specific round
const EthDonationByRound: React.FC<EthDonationByRoundProps> = ({ round }) => {
  // State for loading indicator
  const [loading, setLoading] = useState<boolean>(true);
  // State to hold fetched donation data
  const [donationInfo, setDonationInfo] = useState<any[]>([]);

  useEffect(() => {
    // Async function to fetch donation data based on round number
    const fetchDonationData = async () => {
      try {
        setLoading(true);
        const donations = await api.get_donations_both_by_round(round);
        setDonationInfo(donations);
      } catch (error) {
        console.error("Error fetching donation data:", error);
        setDonationInfo([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDonationData();
  }, [round]); // Added round as a dependency for better clarity

  if (round < 0) {
    return (
      <MainWrapper>
        <Typography variant="h6">Invalid Round Number</Typography>
      </MainWrapper>
    );
  }

  return (
    <MainWrapper>
      <Typography
        variant="h4"
        color="primary"
        gutterBottom
        textAlign="center"
        mb={4}
      >
        Direct (ETH) Donations for Round {round}
      </Typography>

      {loading ? (
        <Typography variant="h6">Loading...</Typography>
      ) : (
        <EthDonationTable list={donationInfo} />
      )}
    </MainWrapper>
  );
};

// Server-side rendering to fetch initial props
export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  // Extract round parameter from URL context
  const paramRound = context.params!.round;
  const round = Array.isArray(paramRound) ? paramRound[0] : paramRound;

  // Page metadata setup
  const title = `Direct (ETH) Donations for Round ${round} | Cosmic Signature`;
  const description = `View Direct (ETH) Donations for Round ${round}`;

  const openGraphData = [
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: logoImgUrl },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: logoImgUrl },
  ];

  return { props: { title, description, openGraphData, round } };
};

export default EthDonationByRound;
