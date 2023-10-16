import React, { useEffect, useState } from "react";
import { Typography } from "@mui/material";
import Head from "next/head";
import { MainWrapper } from "../components/styled";
import api from "../services/api";
import { CharityDepositTable } from "../components/CharityDepositTable";

const CharityDeposits = () => {
  const [loading, setLoading] = useState(true);
  const [CGDeposits, setCGDeposits] = useState([]);
  const [voluntary, setVoluntary] = useState([]);

  useEffect(() => {
    const fetchCharityDeposits = async () => {
      try {
        setLoading(true);
        const cg_deposits = await api.get_charity_cg_deposits();
        setCGDeposits(cg_deposits);
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
          Deposits To Charity Wallet
        </Typography>
        {loading ? (
          <Typography variant="h6">Loading...</Typography>
        ) : (
          <>
            <Typography variant="h6" mb={2}>
              Cosmic Game Deposits
            </Typography>
            <CharityDepositTable list={CGDeposits} />
            <Typography variant="h6" mt={4} mb={2}>
              Voluntary Deposits
            </Typography>
            <CharityDepositTable list={voluntary} />
          </>
        )}
      </MainWrapper>
    </>
  );
};

export default CharityDeposits;
