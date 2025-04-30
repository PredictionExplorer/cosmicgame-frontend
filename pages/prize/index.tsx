import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { MainWrapper } from "../../components/styled";
import api from "../../services/api";
import { PrizeTable } from "../../components/PrizeTable";
import { GetServerSideProps } from "next";
import { logoImgUrl } from "../../utils";

// PrizeWinners component that displays a list of prize winners
const PrizeWinners = () => {
  const [prizeClaims, setPrizeClaims] = useState<any[]>([]); // State to store prize claims data
  const [loading, setLoading] = useState<boolean>(true); // State to handle loading state

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Set loading to true while fetching data
      try {
        // Fetch the prize claims and sort them by timestamp
        let prizeClaimsData = await api.get_round_list();
        prizeClaimsData = prizeClaimsData.sort(
          (a, b) => b.TimeStamp - a.TimeStamp
        );
        setPrizeClaims(prizeClaimsData); // Update the state with fetched data
      } catch (error) {
        console.error("Error fetching prize claims:", error);
      } finally {
        setLoading(false); // Set loading to false once data is fetched (or on error)
      }
    };

    fetchData(); // Call the function to fetch data
  }, []); // Empty dependency array ensures the effect runs only once on component mount

  return (
    <MainWrapper>
      {/* Title of the page */}
      <Typography variant="h4" color="primary" gutterBottom textAlign="center">
        Main Prize Winnings
      </Typography>
      <Box mt={6}>
        {/* Render the prize table with loading state */}
        <PrizeTable list={prizeClaims} loading={loading} />
      </Box>
    </MainWrapper>
  );
};

// Server-side logic for setting metadata
export const getServerSideProps: GetServerSideProps = async () => {
  const title = "Main Prize Winnings | Cosmic Signature";
  const description = "Main Prize Winnings";

  // Open Graph and Twitter card metadata for SEO and social sharing
  const openGraphData = [
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: logoImgUrl },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: logoImgUrl },
  ];

  return { props: { title, description, openGraphData } }; // Return the metadata as props
};

export default PrizeWinners;
