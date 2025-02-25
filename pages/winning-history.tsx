import React, { useEffect, useState } from "react";
import { Typography } from "@mui/material";
import { MainWrapper } from "../components/styled";
import { useActiveWeb3React } from "../hooks/web3";
import WinningHistoryTable from "../components/WinningHistoryTable";
import api from "../services/api";
import { GetServerSideProps } from "next";
import { logoImgUrl } from "../utils";

/* ------------------------------------------------------------------
  Custom Hook: useUserWinningHistory
  Handles fetching and storing the user's winning history (claim history).
------------------------------------------------------------------ */
function useUserWinningHistory(account: string | null | undefined) {
  const [winningHistory, setWinningHistory] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWinningHistory = async () => {
    if (!account) return;
    setLoading(true);
    setError(null);
    try {
      const history = await api.get_claim_history_by_user(account);
      setWinningHistory(history);
    } catch (err) {
      console.error("Failed to fetch winning history:", err);
      setError("Failed to load your winning history.");
      setWinningHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWinningHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  return { winningHistory, loading, error };
}

/* ------------------------------------------------------------------
  Main Component: WinningHistory
------------------------------------------------------------------ */
function WinningHistory() {
  const { account } = useActiveWeb3React();
  const { winningHistory, loading, error } = useUserWinningHistory(account);

  // If user is not connected
  if (!account) {
    return (
      <MainWrapper>
        <Typography variant="h4" color="primary" textAlign="center" mb={4}>
          History of My Winnings
        </Typography>
        <Typography variant="subtitle1">
          Please login to Metamask to see your winnings.
        </Typography>
      </MainWrapper>
    );
  }

  return (
    <MainWrapper>
      <Typography variant="h4" color="primary" textAlign="center" mb={4}>
        History of My Winnings
      </Typography>

      {loading ? (
        <Typography variant="h6">Loading...</Typography>
      ) : error ? (
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      ) : !winningHistory || winningHistory.length === 0 ? (
        <Typography variant="subtitle1">
          You currently have no recorded winnings.
        </Typography>
      ) : (
        <WinningHistoryTable
          winningHistory={winningHistory}
          showClaimedStatus={true}
          showWinnerAddr={false}
        />
      )}
    </MainWrapper>
  );
}

/* ------------------------------------------------------------------
  getServerSideProps (SEO Config)
------------------------------------------------------------------ */
export const getServerSideProps: GetServerSideProps = async () => {
  const title = "History of My Winnings | Cosmic Signature";
  const description = "History of My Winnings";

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

export default WinningHistory;
