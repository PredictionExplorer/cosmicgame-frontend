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
        {convertTimestampToDateTime(donation.TimeStamp)}
      </TablePrimaryCell>
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
      <TablePrimaryCell align="right">
        {donation.AmountEth.toFixed(6)}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

const CharityDepositTable = ({ list }) => {
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
            <col width="25%" />
            <col width="50%" />
            <col width="25%" />
          </colgroup>
          <TablePrimaryHead>
            <TableRow>
              <TableCell>Datetime</TableCell>
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

const CharityDepositsVoluntary = () => {
  const [loading, setLoading] = useState(true);
  const [voluntary, setVoluntary] = useState([]);

  useEffect(() => {
    const fetchCharityDeposits = async () => {
      try {
        setLoading(true);
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
          Voluntary Deposits
        </Typography>
        {loading ? (
          <Typography variant="h6">Loading...</Typography>
        ) : (
          <CharityDepositTable list={voluntary} />
        )}
      </MainWrapper>
    </>
  );
};

export default CharityDepositsVoluntary;
