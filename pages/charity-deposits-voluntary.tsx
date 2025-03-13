import React, { useEffect, useState } from "react";
import { Typography } from "@mui/material";
import { MainWrapper } from "../components/styled";
import api from "../services/api";
import { CharityDepositTable } from "../components/CharityDepositTable";
import { GetServerSideProps } from "next";
import { logoImgUrl } from "../utils";

/**
 * Page component for displaying voluntary deposits to the charity wallet.
 */
const CharityDepositsVoluntary = () => {
  // Track the loading state to conditionally render a loading message or the table
  const [loading, setLoading] = useState(true);

  // Store the list of voluntary deposits fetched from the API
  const [voluntaryDeposits, setVoluntaryDeposits] = useState([]);

  // Fetch voluntary deposits from the API on component mount
  useEffect(() => {
    const fetchCharityDeposits = async () => {
      try {
        setLoading(true);
        const response = await api.get_charity_voluntary();
        setVoluntaryDeposits(response);
      } catch (err) {
        console.error("Failed to fetch charity voluntary deposits:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCharityDeposits();
  }, []);

  return (
    <MainWrapper>
      <Typography variant="h4" color="primary" textAlign="center" mb={4}>
        Voluntary Deposits
      </Typography>

      {loading ? (
        <Typography variant="h6">Loading...</Typography>
      ) : (
        // Pass the fetched voluntary deposits to the table component
        <CharityDepositTable list={voluntaryDeposits} />
      )}
    </MainWrapper>
  );
};

/**
 * Fetches metadata for server-side rendering, including title, description,
 * and open graph data for social sharing.
 */
export const getServerSideProps: GetServerSideProps = async () => {
  const title = "Deposits To Charity Wallet | Cosmic Signature";
  const description = "Deposits To Charity Wallet";

  const openGraphData = [
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: logoImgUrl },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: logoImgUrl },
  ];

  return {
    props: { title, description, openGraphData },
  };
};

export default CharityDepositsVoluntary;
