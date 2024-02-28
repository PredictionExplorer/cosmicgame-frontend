import React, { useEffect, useState } from "react";
import { Typography } from "@mui/material";
import Head from "next/head";
import { MainWrapper } from "../components/styled";
import { useActiveWeb3React } from "../hooks/web3";
import WinningHistoryTable from "../components/WinningHistoryTable";
import api from "../services/api";

const WinningHistory = () => {
  const { account } = useActiveWeb3React();
  const [claimHistory, setClaimHistory] = useState(null);
  useEffect(() => {
    const fetchClaimHistory = async () => {
      const history = await api.get_claim_history_by_user(account);
      setClaimHistory(history);
    };
    if (account) {
      fetchClaimHistory();
    }
  }, []);

  return (
    <>
      <Head>
        <title>History of My Winnings | Cosmic Signature</title>
        <meta name="description" content="" />
      </Head>
      <MainWrapper>
        <Typography variant="h4" color="primary" textAlign="center" mb={4}>
          History of My Winnings
        </Typography>
        {!account ? (
          <Typography variant="subtitle1">
            Please login to Metamask to see your winnings.
          </Typography>
        ) : claimHistory === null ? (
          <Typography variant="h6">Loading...</Typography>
        ) : (
          <WinningHistoryTable
            winningHistory={claimHistory}
            showClaimedStatus={true}
          />
        )}
      </MainWrapper>
    </>
  );
};

export default WinningHistory;
