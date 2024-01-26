import React, { useEffect, useState } from "react";
import { Typography } from "@mui/material";
import Head from "next/head";
import { MainWrapper } from "../components/styled";
import api from "../services/api";
import CharityWithdrawalTable from "../components/CharityWithdrawalTable";

const CharityWithdrawals = () => {
  const [loading, setLoading] = useState(true);
  const [withdrawals, setWithdrawals] = useState([]);

  useEffect(() => {
    const fetchCharityWithdrawals = async () => {
      try {
        setLoading(true);
        const withdrawals = await api.get_charity_withdrawals();
        setWithdrawals(withdrawals);
        setLoading(false);
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    };
    fetchCharityWithdrawals();
  }, []);

  return (
    <>
      <Head>
        <title>Withdrawals from Charity Wallet | Cosmic Signature</title>
        <meta name="description" content="" />
      </Head>
      <MainWrapper>
        <Typography variant="h4" color="primary" textAlign="center" mb={4}>
          Withdrawals from Charity Wallet
        </Typography>
        {loading ? (
          <Typography variant="h6">Loading...</Typography>
        ) : (
          <>
            <CharityWithdrawalTable list={withdrawals} />
          </>
        )}
      </MainWrapper>
    </>
  );
};

export default CharityWithdrawals;
