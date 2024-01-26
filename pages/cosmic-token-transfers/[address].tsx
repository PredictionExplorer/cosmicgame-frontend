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
} from "../../components/styled";
import api from "../../services/api";
import { convertTimestampToDateTime } from "../../utils";
import { ethers } from "ethers";
import { GetServerSidePropsContext } from "next";

const CosmicTokenTransferRow = ({ row }) => {
  if (!row) {
    return <TablePrimaryRow></TablePrimaryRow>;
  }

  return (
    <TablePrimaryRow
      sx={row.TransferType > 0 && { background: "rgba(255, 255, 255, 0.06)" }}
    >
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
        <Link
          color="inherit"
          fontSize="inherit"
          fontFamily="monospace"
          href={`/user/${row.FromAddr}`}
          target="__blank"
        >
          {row.FromAddr}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <Link
          color="inherit"
          fontSize="inherit"
          fontFamily="monospace"
          href={`/user/${row.ToAddr}`}
          target="__blank"
        >
          {row.ToAddr}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {row.ValueFloat.toFixed(2)}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

export const CosmicTokenTransfersTable = ({ list }) => {
  const perPage = 5;
  const [page, setPage] = useState(1);
  if (list.length === 0) {
    return <Typography variant="h6">No transfers yet.</Typography>;
  }
  return (
    <>
      <TablePrimaryContainer>
        <Table>
          <colgroup>
            <col width="15%" />
            <col width="35%" />
            <col width="35%" />
            <col width="15%" />
          </colgroup>
          <TablePrimaryHead>
            <TableRow>
              <TableCell>Datetime</TableCell>
              <TableCell align="center">From</TableCell>
              <TableCell align="center">To</TableCell>
              <TableCell align="center">Value (ETH)</TableCell>
            </TableRow>
          </TablePrimaryHead>
          <TableBody>
            {list.slice((page - 1) * perPage, page * perPage).map((row) => (
              <CosmicTokenTransferRow row={row} key={row.EvtLogId} />
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

const CosmicTokenTransfers = ({ address }) => {
  const [loading, setLoading] = useState(true);
  const [cosmicTokenTransfers, setCosmicTokenTransfers] = useState([]);

  useEffect(() => {
    const fetchTransfers = async () => {
      try {
        setLoading(true);
        const transfers = await api.get_ct_transfers(address);
        setCosmicTokenTransfers(transfers);
        setLoading(false);
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    };
    fetchTransfers();
  }, []);

  return (
    <>
      <Head>
        <title>Cosmic Token Transfers | Cosmic Signature</title>
        <meta name="description" content="" />
      </Head>
      <MainWrapper>
        <Typography variant="h4" color="primary" textAlign="center" mb={4}>
          Cosmic Token Transfers
        </Typography>
        {loading ? (
          <Typography variant="h6">Loading...</Typography>
        ) : (
          <CosmicTokenTransfersTable list={cosmicTokenTransfers} />
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

export default CosmicTokenTransfers;
