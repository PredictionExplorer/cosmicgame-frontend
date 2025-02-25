import React, { useEffect, useState } from "react";
import { Box, Link, TableBody, Tooltip, Typography } from "@mui/material";
import { GetServerSideProps } from "next";
import { isMobile } from "react-device-detect";

import { MainWrapper } from "../components/styled";
import {
  convertTimestampToDateTime,
  getAssetsUrl,
  logoImgUrl,
  shortenHex,
} from "../utils";
import { useActiveWeb3React } from "../hooks/web3";
import { useApiData } from "../contexts/ApiDataContext";
import api from "../services/api";

import { Tr } from "react-super-responsive-table";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";

import NFTImage from "../components/NFTImage";
import { CustomPagination } from "../components/CustomPagination";

import {
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from "../components/styled";

/* ------------------------------------------------------------------
  Types
------------------------------------------------------------------ */
interface CSTToken {
  EvtLogId: number;
  TxHash: string;
  TimeStamp: number;
  Seed: string;
  TokenId: number;
  TokenName: string | null;
  RoundNum: number;
  WinnerAddr: string;
  Staked: boolean;
  WasUnstaked: boolean;
  RecordType: number;
}

/* ------------------------------------------------------------------
  Custom Hook: useUserCSTTokens
  Handles fetching user CST tokens, plus loading/error states.
------------------------------------------------------------------ */
function useUserCSTTokens(account: string | null | undefined) {
  const [tokens, setTokens] = useState<CSTToken[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTokens = async (showLoading = true) => {
    if (!account) return;

    try {
      if (showLoading) setLoading(true);
      const cstList = await api.get_cst_tokens_by_user(account);
      setTokens(cstList);
    } catch (err) {
      console.error("Failed to fetch user CST tokens:", err);
      setError("Failed to load CST tokens.");
      setTokens([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount (or whenever account changes)
  useEffect(() => {
    fetchTokens();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  return { tokens, loading, error, refetch: fetchTokens };
}

/* ------------------------------------------------------------------
  Sub-Component: CSTRow
  Renders a single row in the CST table.
------------------------------------------------------------------ */
function CSTRow({ nft }: { nft: CSTToken }) {
  // Generate image URL
  const getTokenImageURL = () =>
    getAssetsUrl(`cosmicsignature/0x${nft.Seed}.png`);

  // If no data
  if (!nft) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow>
      <TablePrimaryCell sx={{ width: "120px" }}>
        <Link
          href={`/detail/${nft.TokenId}`}
          style={{ color: "inherit", fontSize: "inherit" }}
        >
          <NFTImage src={getTokenImageURL()} />
        </Link>
      </TablePrimaryCell>

      <TablePrimaryCell>
        <Link
          color="inherit"
          fontSize="inherit"
          href={`https://arbiscan.io/tx/${nft.TxHash}`}
          target="_blank"
        >
          {convertTimestampToDateTime(nft.TimeStamp)}
        </Link>
      </TablePrimaryCell>

      <TablePrimaryCell align="center">
        <Link
          href={`/detail/${nft.TokenId}`}
          style={{ color: "inherit", fontSize: "inherit" }}
        >
          {nft.TokenId}
        </Link>
      </TablePrimaryCell>

      <TablePrimaryCell align="center">{nft.TokenName || " "}</TablePrimaryCell>

      <TablePrimaryCell align="center">
        <Link
          href={`/prize/${nft.RoundNum}`}
          style={{ color: "inherit", fontSize: "inherit" }}
        >
          {nft.RoundNum}
        </Link>
      </TablePrimaryCell>

      <TablePrimaryCell align="center">
        <Tooltip title={nft.WinnerAddr}>
          <Link
            href={`/user/${nft.WinnerAddr}`}
            style={{
              color: "inherit",
              fontSize: "inherit",
              fontFamily: "monospace",
            }}
          >
            {shortenHex(nft.WinnerAddr, 6)}
          </Link>
        </Tooltip>
      </TablePrimaryCell>

      <TablePrimaryCell align="center">
        {nft.Staked ? "Yes" : "No"}
      </TablePrimaryCell>

      <TablePrimaryCell align="center">
        {nft.WasUnstaked ? "Yes" : "No"}
      </TablePrimaryCell>

      <TablePrimaryCell align="right">
        {nft.RecordType === 3 ? (
          <Link
            href={`/prize/${nft.RoundNum}`}
            style={{ color: "inherit", fontSize: "inherit" }}
          >
            Prize Winner (#{nft.RoundNum})
          </Link>
        ) : nft.RecordType === 4 ? (
          "Random Walk Staking Raffle Token"
        ) : (
          "Raffle Winner"
        )}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
}

/* ------------------------------------------------------------------
  Sub-Component: CSTTable
  Renders a paginated table of CST tokens.
------------------------------------------------------------------ */
function CSTTable({ list }: { list: CSTToken[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const PER_PAGE = 5;

  if (list.length === 0) {
    return <Typography>No tokens yet.</Typography>;
  }

  const startIndex = (currentPage - 1) * PER_PAGE;
  const endIndex = currentPage * PER_PAGE;
  const currentItems = list.slice(startIndex, endIndex);

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          {/* Optional column sizing for non-mobile displays */}
          {!isMobile && (
            <colgroup>
              <col width="10%" />
              <col width="15%" />
              <col width="9%" />
              <col width="10%" />
              <col width="8%" />
              <col width="16%" />
              <col width="8%" />
              <col width="8%" />
              <col width="16%" />
            </colgroup>
          )}
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell />
              <TablePrimaryHeadCell align="left">Datetime</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Token ID</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Token Name</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Round</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Winner Address</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Currently Staked?</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Staked Once?</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                Prize Type
              </TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <TableBody>
            {currentItems.map((nft) => (
              <CSTRow key={nft.EvtLogId} nft={nft} />
            ))}
          </TableBody>
        </TablePrimary>
      </TablePrimaryContainer>

      <CustomPagination
        page={currentPage}
        setPage={setCurrentPage}
        totalLength={list.length}
        perPage={PER_PAGE}
      />
    </>
  );
}

/* ------------------------------------------------------------------
  Main Component: MyWallet
------------------------------------------------------------------ */
function MyWallet() {
  const { account } = useActiveWeb3React();
  const { apiData: status } = useApiData();

  // Use the custom hook for fetching CST tokens
  const { tokens, loading, error, refetch } = useUserCSTTokens(account);

  // Re-fetch whenever global status changes (if needed)
  useEffect(() => {
    if (account) {
      refetch(false);
    }
  }, [status, account]);

  return (
    <MainWrapper>
      <Typography variant="h4" color="primary" gutterBottom textAlign="center">
        My Cosmic Signature (ERC721) Tokens
      </Typography>

      {!account ? (
        <Typography variant="subtitle1">
          Please login to Metamask to see your tokens.
        </Typography>
      ) : loading ? (
        <Typography variant="h6">Loading...</Typography>
      ) : error ? (
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      ) : (
        <Box mt={6}>
          <Typography variant="h6" mb={2}>
            Cosmic Signature Tokens I Own
          </Typography>
          <CSTTable list={tokens} />
        </Box>
      )}
    </MainWrapper>
  );
}

/* ------------------------------------------------------------------
  getServerSideProps (for SEO)
------------------------------------------------------------------ */
export const getServerSideProps: GetServerSideProps = async () => {
  const title = "My Tokens | Cosmic Signature";
  const description =
    "Manage your digital assets on the My Tokens page at Cosmic Signature. View your token balance, transaction history, and ownership details. Keep track of your NFTs and tokens effortlessly.";

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

export default MyWallet;
