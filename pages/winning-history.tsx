import React, { useEffect, useState } from "react";
import { Typography } from "@mui/material";
import { MainWrapper } from "../components/styled";
import { useActiveWeb3React } from "../hooks/web3";
import WinningHistoryTable from "../components/WinningHistoryTable";
import api from "../services/api";
import { GetServerSideProps } from "next";

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
          showWinnerAddr={false}
        />
      )}
    </MainWrapper>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const title = "History of My Winnings | Cosmic Signature";
  const description = "History of My Winnings";
  const imageUrl = "http://69.10.55.2/images/cosmicsignature/logo.png";

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

export default WinningHistory;
