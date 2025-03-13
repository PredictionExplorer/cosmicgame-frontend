import React, { useEffect, useState } from "react";
import { Typography } from "@mui/material";
import { MainWrapper } from "../components/styled";
import api from "../services/api";
import CharityWithdrawalTable from "../components/CharityWithdrawalTable";
import { GetServerSideProps } from "next";
import { logoImgUrl } from "../utils";

/**
 * CharityWithdrawals:
 * - Fetches and displays a list of withdrawals from the charity wallet.
 */
const CharityWithdrawals = () => {
  /**
   * loading: Indicates whether the data is currently being fetched.
   * charityWithdrawals: Stores the list of fetched withdrawals from the API.
   */
  const [loading, setLoading] = useState(true);
  const [charityWithdrawals, setCharityWithdrawals] = useState([]);

  /**
   * Fetches the list of charity withdrawals from the server on component mount.
   */
  useEffect(() => {
    const fetchCharityWithdrawals = async () => {
      try {
        setLoading(true);
        const withdrawals = await api.get_charity_withdrawals();
        setCharityWithdrawals(withdrawals);
      } catch (error) {
        console.error("Error fetching charity withdrawals:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCharityWithdrawals();
  }, []);

  return (
    <MainWrapper>
      {/* Page Title */}
      <Typography variant="h4" color="primary" textAlign="center" mb={4}>
        Withdrawals from Charity Wallet
      </Typography>

      {/* Conditionally render a loading indicator or the table of withdrawals */}
      {loading ? (
        <Typography variant="h6">Loading...</Typography>
      ) : (
        <CharityWithdrawalTable list={charityWithdrawals} />
      )}
    </MainWrapper>
  );
};

/**
 * getServerSideProps:
 * Injects metadata for SEO and social sharing into the page.
 */
export const getServerSideProps: GetServerSideProps = async () => {
  const title = "Withdrawals from Charity Wallet | Cosmic Signature";
  const description = "Withdrawals from Charity Wallet";

  // Open Graph and Twitter meta data
  const openGraphData = [
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: logoImgUrl },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: logoImgUrl },
  ];

  return { props: { title, description, openGraphData } };
};

export default CharityWithdrawals;
