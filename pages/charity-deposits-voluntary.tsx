import React, { useEffect, useState } from "react";
import { Typography } from "@mui/material";
import Head from "next/head";
import { MainWrapper } from "../components/styled";
import api from "../services/api";
import { CharityDepositTable } from "../components/CharityDepositTable";

const CharityDepositsVoluntary = () => {
  const [loading, setLoading] = useState(true);
  const [voluntary, setVoluntary] = useState([]);

  useEffect(() => {
    const fetchCharityDeposits = async () => {
      try {
        setLoading(true);
        const voluntary = await api.get_charity_voluntary();
        setVoluntary(voluntary);
        setLoading(false);
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    };
    fetchCharityDeposits();
  }, []);

  return (
    <>
      <Head>
        <title>Deposits To Charity Wallet | Cosmic Signature</title>
        <meta name="description" content="" />
      </Head>
      <MainWrapper>
        <Typography variant="h4" color="primary" textAlign="center" mb={4}>
          Voluntary Deposits
        </Typography>
        {loading ? (
          <Typography variant="h6">Loading...</Typography>
        ) : (
          <CharityDepositTable list={voluntary} />
        )}
      </MainWrapper>
    </>
  );
};

export default CharityDepositsVoluntary;
