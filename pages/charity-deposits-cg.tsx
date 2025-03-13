import React, { useEffect, useState } from "react";
import { Typography } from "@mui/material";
import { MainWrapper } from "../components/styled";
import api from "../services/api";
import { CharityDepositTable } from "../components/CharityDepositTable";
import { GetServerSideProps } from "next";
import { logoImgUrl } from "../utils";

/**
 * Component for displaying Cosmic Game Charity Deposits.
 */
const CharityCGDeposits = () => {
  // Tracks whether the data is still being fetched.
  const [loading, setLoading] = useState(true);

  // Stores the array of CG deposit data.
  const [charityCGDeposits, setCharityCGDeposits] = useState([]);

  /**
   * Fetches the CG deposit data from the API on component mount.
   */
  useEffect(() => {
    const fetchCharityDeposits = async () => {
      try {
        setLoading(true);
        const cg_deposits = await api.get_charity_cg_deposits();
        setCharityCGDeposits(cg_deposits);
      } catch (error) {
        console.error("Failed to fetch CG deposits:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCharityDeposits();
  }, []);

  return (
    <MainWrapper>
      <Typography variant="h4" color="primary" textAlign="center" mb={4}>
        Cosmic Game Charity Deposits
      </Typography>
      {loading ? (
        <Typography variant="h6">Loading...</Typography>
      ) : (
        <CharityDepositTable list={charityCGDeposits} />
      )}
    </MainWrapper>
  );
};

/**
 * Retrieves SEO-related metadata for server-side rendering,
 * including open graph data for social media previews.
 */
export const getServerSideProps: GetServerSideProps = async () => {
  const title = "Cosmic Game Charity Deposits | Cosmic Signature";
  const description = "Cosmic Game Charity Deposits";

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

export default CharityCGDeposits;
