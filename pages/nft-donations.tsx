import React, { useEffect, useState } from "react";
import { Typography } from "@mui/material";
import { MainWrapper } from "../components/styled";
import api from "../services/api";
import DonatedNFTTable from "../components/DonatedNFTTable";
import { GetServerSideProps } from "next";
import { logoImgUrl } from "../utils";

/**
 * NFTDonations: A page component that fetches and displays NFT donations.
 */
const NFTDonations = () => {
  // State to hold the list of NFT donations. We initialize with null
  // to distinguish between "not yet fetched" and an empty array of results.
  const [nftDonations, setNftDonations] = useState(null);

  /**
   * useEffect: Fetch the list of NFT donations from the server on component mount.
   */
  useEffect(() => {
    const fetchNftDonations = async () => {
      try {
        const list = await api.get_donations_nft_list();
        setNftDonations(list);
      } catch (error) {
        console.error("Error fetching NFT donations:", error);
        // Optionally handle errors here, e.g., show an error message
        setNftDonations([]);
      }
    };
    fetchNftDonations();
  }, []);

  return (
    <MainWrapper>
      {/* Page Title */}
      <Typography
        variant="h4"
        color="primary"
        gutterBottom
        textAlign="center"
        mb={4}
      >
        NFT Donations
      </Typography>

      {/* Conditionally render loading text or the DonatedNFTTable */}
      {nftDonations === null ? (
        <Typography variant="h6">Loading...</Typography>
      ) : (
        <DonatedNFTTable
          list={nftDonations}
          handleClaim={null}
          claimingTokens={[]}
        />
      )}
    </MainWrapper>
  );
};

/**
 * getServerSideProps: Adds SEO metadata for the NFT Donations page.
 */
export const getServerSideProps: GetServerSideProps = async () => {
  const title = "NFT Donations | Cosmic Signature";
  const description = "NFT Donations";

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

export default NFTDonations;
