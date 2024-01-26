import React, { useEffect, useState } from "react";
import {
  Box,
  Link,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import Head from "next/head";
import {
  MainWrapper,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryRow,
} from "../components/styled";
import api from "../services/api";
import { convertTimestampToDateTime } from "../utils";

const DonationRow = ({ donation }) => {
  if (!donation) {
    return <TablePrimaryRow></TablePrimaryRow>;
  }

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        <Link
          color="inherit"
          fontSize="inherit"
          href={`https://arbiscan.io/tx/${donation.TxHash}`}
          target="__blank"
        >
          {convertTimestampToDateTime(donation.TimeStamp)}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">{donation.RoundNum + 1}</TablePrimaryCell>
      <TablePrimaryCell align="center">
        <Link
          color="inherit"
          fontSize="inherit"
          fontFamily="monospace"
          href={`/user/${donation.DonorAddr}`}
        >
          {donation.DonorAddr}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell align="right" sx={{ fontFamily: "monospace" }}>
        {donation.AmountEth.toFixed(6)}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

export const CharityDepositTable = ({ list }) => {
  const perPage = 5;
  const [page, setPage] = useState(1);
  if (list.length === 0) {
    return <Typography>No deposits yet.</Typography>;
  }
  return (
    <>
      <TablePrimaryContainer>
        <Table>
          <colgroup>
            <col width="20%" />
            <col width="15%" />
            <col width="40%" />
            <col width="25%" />
          </colgroup>
          <TablePrimaryHead>
            <TableRow>
              <TableCell>Datetime</TableCell>
              <TableCell align="center">Round</TableCell>
              <TableCell align="center">Donor Address</TableCell>
              <TableCell align="right">Donation amount (ETH)</TableCell>
            </TableRow>
          </TablePrimaryHead>
          <TableBody>
            {list
              .slice((page - 1) * perPage, page * perPage)
              .map((donation) => (
                <DonationRow donation={donation} key={donation.EvtLogId} />
              ))}
          </TableBody>
        </Table>
      </TablePrimaryContainer>
      <Box display="flex" justifyContent="center" mt={4}>
        <Pagination
          color="primary"
          page={page}
          onChange={(_e, page) => setPage(page)}
          count={Math.ceil(list.length / perPage)}
          hideNextButton
          hidePrevButton
          shape="rounded"
        />
      </Box>
    </>
  );
};

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
