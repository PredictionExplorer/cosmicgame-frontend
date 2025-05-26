import React, { useEffect, useState } from "react";
import { Box, Link, TableBody, Typography } from "@mui/material";
import { GetServerSidePropsContext } from "next";
import { ethers } from "ethers";

import api from "../../../services/api";
import { logoImgUrl, convertTimestampToDateTime } from "../../../utils";
import { CustomPagination } from "../../../components/CustomPagination";

import {
  MainWrapper,
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from "../../../components/styled";

import { Tr } from "react-super-responsive-table";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";

/* ------------------------------------------------------------------
  Types
------------------------------------------------------------------ */
interface RaffleNFTWinning {
  EvtLogId: number;
  TxHash: string;
  TimeStamp: number;
  RoundNum: number;
  IsRWalk: boolean;
  IsStaker: boolean;
  TokenId: number;
}

/* ------------------------------------------------------------------
  Sub-Component: NFTWinningsRow
  Renders a single row in the table for Raffle NFT winnings.
------------------------------------------------------------------ */
function NFTWinningsRow({ row }: { row: RaffleNFTWinning }) {
  if (!row) return <TablePrimaryRow />;

  const { TxHash, TimeStamp, RoundNum, IsRWalk, IsStaker, TokenId } = row;

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        <Link
          color="inherit"
          fontSize="inherit"
          href={`https://arbiscan.io/tx/${TxHash}`}
          target="_blank"
        >
          {convertTimestampToDateTime(TimeStamp)}
        </Link>
      </TablePrimaryCell>

      <TablePrimaryCell align="center">
        <Link
          href={`/prize/${RoundNum}`}
          style={{
            color: "inherit",
            fontSize: "inherit",
            fontFamily: "monospace",
          }}
          target="_blank"
        >
          {RoundNum}
        </Link>
      </TablePrimaryCell>

      <TablePrimaryCell align="center">
        {IsRWalk ? "Yes" : "No"}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {IsStaker ? "Yes" : "No"}
      </TablePrimaryCell>

      <TablePrimaryCell align="center">
        <Link
          href={`/detail/${TokenId}`}
          style={{
            color: "inherit",
            fontSize: "inherit",
            fontFamily: "monospace",
          }}
        >
          {TokenId}
        </Link>
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
}

/* ------------------------------------------------------------------
  Sub-Component: NFTWinningsTable
  Renders the entire table of Raffle NFT winnings, with pagination.
------------------------------------------------------------------ */
function NFTWinningsTable({ list }: { list: RaffleNFTWinning[] }) {
  const PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  if (!list.length) {
    return <Typography>No NFT winnings yet.</Typography>;
  }

  const startIndex = (currentPage - 1) * PER_PAGE;
  const endIndex = currentPage * PER_PAGE;
  const currentItems = list.slice(startIndex, endIndex);

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">Datetime</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Round</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Is RandomWalk</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Is Staker</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Token ID</TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <TableBody>
            {currentItems.map((row) => (
              <NFTWinningsRow key={row.EvtLogId} row={row} />
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
  Custom Hook: useRaffleNFTWinnings
  Fetches and sorts the user's raffle NFT winnings.
------------------------------------------------------------------ */
function useRaffleNFTWinnings(userAddress: string) {
  const [raffleNfts, setRaffleNfts] = useState<{
    data: RaffleNFTWinning[];
    loading: boolean;
  }>({
    data: [],
    loading: false,
  });

  const fetchRaffleNFTWinnings = async () => {
    setRaffleNfts((prev) => ({ ...prev, loading: true }));
    try {
      const response = await api.get_raffle_nft_winnings_by_user(userAddress);
      const sorted = response.sort(
        (a: RaffleNFTWinning, b: RaffleNFTWinning) => b.TimeStamp - a.TimeStamp
      );
      setRaffleNfts({ data: sorted, loading: false });
    } catch (err) {
      console.error("Error fetching raffle NFT winnings:", err);
      setRaffleNfts({ data: [], loading: false });
    }
  };

  return { raffleNfts, fetchRaffleNFTWinnings };
}

/* ------------------------------------------------------------------
  Main Component: UserRaffleNFT
------------------------------------------------------------------ */
function UserRaffleNFT({ address }: { address: string }) {
  const [invalidAddress, setInvalidAddress] = useState(false);

  const { raffleNfts, fetchRaffleNFTWinnings } = useRaffleNFTWinnings(address);

  // On mount / address changes
  useEffect(() => {
    if (!address || address === "Invalid Address") {
      setInvalidAddress(true);
    } else {
      fetchRaffleNFTWinnings();
    }
  }, [address]);

  if (invalidAddress) {
    return (
      <MainWrapper>
        <Typography variant="h6">Invalid Address</Typography>
      </MainWrapper>
    );
  }

  return (
    <MainWrapper>
      <Box mb={4}>
        <Typography variant="h6" color="primary" component="span" mr={2}>
          User
        </Typography>
        <Typography variant="h6" component="span" fontFamily="monospace">
          {address}
        </Typography>
      </Box>

      <Box mt={4}>
        <Typography variant="h6" lineHeight={1} mb={2}>
          Raffle NFTs User Won
        </Typography>

        {raffleNfts.loading ? (
          <Typography variant="h6">Loading...</Typography>
        ) : (
          <NFTWinningsTable list={raffleNfts.data} />
        )}
      </Box>
    </MainWrapper>
  );
}

/* ------------------------------------------------------------------
  getServerSideProps
------------------------------------------------------------------ */
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const param = context.params!.address;
  let address = Array.isArray(param) ? param[0] : param;

  // Validate address
  if (ethers.utils.isAddress(address.toLowerCase())) {
    address = ethers.utils.getAddress(address.toLowerCase());
  } else {
    address = "Invalid Address";
  }

  const title = `Raffle NFT User(${address}) Won | Cosmic Signature`;
  const description = `Raffle NFT User(${address}) Won`;

  const openGraphData = [
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: logoImgUrl },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: logoImgUrl },
  ];

  return {
    props: { title, description, openGraphData, address },
  };
}

export default UserRaffleNFT;
