import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { MainWrapper } from "../../components/styled";
import api from "../../services/api";
import { PrizeTable } from "../../components/PrizeTable";
import { GetServerSideProps } from "next";

const PrizeWinners = () => {
  const [prizeClaims, setPrizeClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      let prizeClaims = await api.get_prize_list();
      prizeClaims = prizeClaims.sort((a, b) => b.TimeStamp - a.TimeStamp);
      setPrizeClaims(prizeClaims);
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <MainWrapper>
      <Typography variant="h4" color="primary" gutterBottom textAlign="center">
        Main Prize Winnings
      </Typography>
      <Box mt={6}>
        <PrizeTable list={prizeClaims} loading={loading} />
      </Box>
    </MainWrapper>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const title = "Main Prize Winnings | Cosmic Signature";
  const description = "Main Prize Winnings";
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

export default PrizeWinners;
