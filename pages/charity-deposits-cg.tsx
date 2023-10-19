import React, { useEffect, useState } from "react";
import { Typography } from "@mui/material";
import Head from "next/head";
import { MainWrapper } from "../components/styled";
import api from "../services/api";
import { CharityDepositTable } from "../components/CharityDepositTable";

const CharityCGDeposits = () => {
  const [loading, setLoading] = useState(true);
  const [CGDeposits, setCGDeposits] = useState([]);

  useEffect(() => {
    const fetchCharityDeposits = async () => {
      try {
        setLoading(true);
        const cg_deposits = await api.get_charity_cg_deposits();
        setCGDeposits(cg_deposits);
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
        <title>Cosmic Game Deposits | Cosmic Signature</title>
        <meta name="description" content="" />
      </Head>
      <MainWrapper>
        <Typography variant="h4" color="primary" textAlign="center" mb={4}>
          Cosmic Game Deposits
        </Typography>
        {loading ? (
          <Typography variant="h6">Loading...</Typography>
        ) : (
          <CharityDepositTable list={CGDeposits} />
        )}
      </MainWrapper>
    </>
  );
};

export default CharityCGDeposits;
