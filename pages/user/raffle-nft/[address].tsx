import React, { useEffect, useState } from "react";
import { Box, Link, TableBody, Tooltip, Typography } from "@mui/material";
import Head from "next/head";
import { GetServerSidePropsContext } from "next";
import { ethers } from "ethers";
import { useActiveWeb3React } from "../../../hooks/web3";
import api from "../../../services/api";
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
import { convertTimestampToDateTime, shortenHex } from "../../../utils";
import { CustomPagination } from "../../../components/CustomPagination";

const NFTWinningsRow = ({ row }) => {
  if (!row) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        <Link
          color="inherit"
          fontSize="inherit"
          href={`https://arbiscan.io/tx/${row.TxHash}`}
          target="__blank"
        >
          {convertTimestampToDateTime(row.TimeStamp)}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <Tooltip title={row.WinnerAddr}>
          <Link
            href={`/user/${row.WinnerAddr}`}
            style={{
              color: "inherit",
              fontSize: "inherit",
              fontFamily: "monospace",
            }}
          >
            {shortenHex(row.WinnerAddr, 6)}
          </Link>
        </Tooltip>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <Link
          href={`/prize/${row.RoundNum}`}
          style={{
            color: "inherit",
            fontSize: "inherit",
            fontFamily: "monospace",
          }}
        >
          {row.RoundNum}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {row.IsRWalk ? "Yes" : "No"}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {row.IsStaker ? "Yes" : "No"}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <Link
          href={`/detail/${row.TokenId}`}
          style={{
            color: "inherit",
            fontSize: "inherit",
            fontFamily: "monospace",
          }}
        >
          {row.TokenId}
        </Link>
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

const NFTWinningsTable = ({ list }) => {
  const perPage = 5;
  const [page, setPage] = useState(1);
  if (list.length === 0) {
    return <Typography>No NFT winnings yet.</Typography>;
  }
  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">Datetime</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Winner</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Round</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Is RandomWalk</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Is Staker</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Token Id</TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <TableBody>
            {list.slice((page - 1) * perPage, page * perPage).map((row, i) => (
              <NFTWinningsRow key={row.EvtLogId} row={row} />
            ))}
          </TableBody>
        </TablePrimary>
      </TablePrimaryContainer>
      <CustomPagination
        page={page}
        setPage={setPage}
        totalLength={list.length}
        perPage={perPage}
      />
    </>
  );
};
const UserRaffleETH = ({ address }) => {
  const { account } = useActiveWeb3React();
  const [raffleNfts, setRaffleNfts] = useState({
    data: [],
    loading: false,
  });
  const [invalidAddress, setInvalidAddress] = useState(false);

  const fetchRaffleETHDeposits = async () => {
    setRaffleNfts((prev) => ({ ...prev, loading: true }));
    let winnings = await api.get_raffle_nft_winnings_by_user(account);
    winnings = winnings.sort((a, b) => b.TimeStamp - a.TimeStamp);
    setRaffleNfts({ data: winnings, loading: false });
  };

  useEffect(() => {
    if (address) {
      if (address !== "Invalid Address") {
        fetchRaffleETHDeposits();
      } else {
        setInvalidAddress(true);
      }
    }
  }, [address]);

  return (
    <>
      <Head>
        <title>Raffle ETH User Won | Cosmic Signature</title>
        <meta name="description" content="" />
      </Head>
      <MainWrapper>
        {invalidAddress ? (
          <Typography variant="h6">Invalid Address</Typography>
        ) : (
          <>
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
          </>
        )}
      </MainWrapper>
    </>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const params = context.params!.address;
  let address = Array.isArray(params) ? params[0] : params;
  if (ethers.utils.isAddress(address.toLowerCase())) {
    address = ethers.utils.getAddress(address.toLowerCase());
  } else {
    address = "Invalid Address";
  }
  return { props: { address } };
}

export default UserRaffleETH;
