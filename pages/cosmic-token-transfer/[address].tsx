import React, { useEffect, useState } from "react";
import { Link, TableBody, Typography } from "@mui/material";
import {
  MainWrapper,
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from "../../components/styled";
import api from "../../services/api";
import { convertTimestampToDateTime } from "../../utils";
import { ethers } from "ethers";
import { GetServerSidePropsContext } from "next";
import { Tr } from "react-super-responsive-table";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import { CustomPagination } from "../../components/CustomPagination";

const CosmicTokenTransferRow = ({ row }) => {
  if (!row) {
    return <TablePrimaryRow />;
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

const CosmicTokenTransfersTable = ({ list }) => {
  const perPage = 10;
  const [page, setPage] = useState(1);
  if (list.length === 0) {
    return <Typography variant="h6">No transfers yet.</Typography>;
  }
  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">Datetime</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>From</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>To</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Value (ETH)</TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <TableBody>
            {list.slice((page - 1) * perPage, page * perPage).map((row) => (
              <CosmicTokenTransferRow row={row} key={row.EvtLogId} />
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
  const title = `Cosmic Token Transfer History for ${address} | Cosmic Signature`;
  const description = `Cosmic Token Transfer History for ${address}`;
  const imageUrl = "https://cosmic-game2.s3.us-east-2.amazonaws.com/logo.png";

  const openGraphData = [
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: imageUrl },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: imageUrl },
  ];

  return { props: { title, description, openGraphData, address } };
}

export default CosmicTokenTransfers;
