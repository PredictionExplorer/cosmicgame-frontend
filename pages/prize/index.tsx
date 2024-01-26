import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import Head from "next/head";
import { MainWrapper } from "../../components/styled";
import api from "../../services/api";
import { PrizeTable } from "../../components/PrizeTable";

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
    <>
      <Head>
        <title>Main Prize Winnings | Cosmic Signature</title>
        <meta name="description" content="" />
      </Head>
      <MainWrapper>
        <Typography
          variant="h4"
          color="primary"
          gutterBottom
          textAlign="center"
        >
          Main Prize Winnings
        </Typography>
        <Box mt={6}>
          <PrizeTable list={prizeClaims} loading={loading} />
        </Box>
      </MainWrapper>
    </>
  );
};

export default PrizeWinners;
