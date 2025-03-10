import React, { useEffect, useState } from "react";
import { Link, TableBody, Tooltip, Typography } from "@mui/material";
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
import {
  convertTimestampToDateTime,
  isWalletAddress,
  logoImgUrl,
} from "../../utils";
import { ethers } from "ethers";
import { GetServerSidePropsContext } from "next";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import { Tr } from "react-super-responsive-table";
import { CustomPagination } from "../../components/CustomPagination";
import { AddressLink } from "../../components/AddressLink";

/* ------------------------------------------------------------------
  Sub-Component: CosmicSignatureTransferRow
  Renders a single row for a Cosmic Signature Token (CST) transfer,
  showing:
    - Timestamp -> Link to Arbiscan transaction,
    - "From" address,
    - "To" address,
    - Token ID.
  If row.TransferType > 0, adds a background highlight (e.g., stake?).
------------------------------------------------------------------ */
const CosmicSignatureTransferRow = ({ row }) => {
  // If no row data, render an empty row to avoid errors.
  if (!row) {
    return <TablePrimaryRow />;
  }

  // Conditional styling based on 'TransferType'
  const rowStyle =
    row.TransferType > 0 ? { background: "rgba(255, 255, 255, 0.06)" } : {};

  return (
    <TablePrimaryRow sx={rowStyle}>
      {/* Transaction link to Arbiscan, with formatted datetime */}
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

      {/* "From" address - If 'isWalletAddress()' returns a string, show tooltip + link, else use AddressLink */}
      <TablePrimaryCell align="center">
        {isWalletAddress(row.FromAddr) !== "" ? (
          <Tooltip title={row.FromAddr}>
            <Link
              color="inherit"
              fontSize="inherit"
              fontFamily="monospace"
              href={`/user/${row.FromAddr}`}
              target="__blank"
            >
              {isWalletAddress(row.FromAddr)}
            </Link>
          </Tooltip>
        ) : (
          <AddressLink address={row.FromAddr} url={`/user/${row.FromAddr}`} />
        )}
      </TablePrimaryCell>

      {/* "To" address - Same logic as "From" address */}
      <TablePrimaryCell align="center">
        {isWalletAddress(row.ToAddr) !== "" ? (
          <Tooltip title={row.ToAddr}>
            <Link
              color="inherit"
              fontSize="inherit"
              fontFamily="monospace"
              href={`/user/${row.ToAddr}`}
              target="__blank"
            >
              {isWalletAddress(row.ToAddr)}
            </Link>
          </Tooltip>
        ) : (
          <AddressLink address={row.ToAddr} url={`/user/${row.ToAddr}`} />
        )}
      </TablePrimaryCell>

      {/* Token ID - link to token detail page */}
      <TablePrimaryCell align="center">
        <Link
          color="inherit"
          fontSize="inherit"
          href={`/detail/${row.TokenId}`}
          target="__blank"
        >
          {row.TokenId}
        </Link>
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

/* ------------------------------------------------------------------
  Sub-Component: CosmicTokenTransfersTable
  Displays a paginated table of CST transfers. Each page shows 10 rows.
  Shows a "No transfers yet." message if the list is empty.
------------------------------------------------------------------ */
const CosmicTokenTransfersTable = ({ list }) => {
  const perPage = 10; // Number of transfers per page
  const [page, setPage] = useState(1);

  // If there's nothing to display, show a "No transfers yet." message.
  if (list.length === 0) {
    return <Typography variant="h6">No transfers yet.</Typography>;
  }

  // Slice the list for the current page.
  const currentPageList = list.slice((page - 1) * perPage, page * perPage);

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">Datetime</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>From</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>To</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Token ID</TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <TableBody>
            {currentPageList.map((row) => (
              // Use EvtLogId as key to uniquely identify each transfer
              <CosmicSignatureTransferRow key={row.EvtLogId} row={row} />
            ))}
          </TableBody>
        </TablePrimary>
      </TablePrimaryContainer>

      {/* Pagination controls */}
      <CustomPagination
        page={page}
        setPage={setPage}
        totalLength={list.length}
        perPage={perPage}
      />
    </>
  );
};

/* ------------------------------------------------------------------
  Main Page Component: CosmicSignatureTransfers
  - Displays the transfer history of Cosmic Signature Tokens (CST)
    for a given address (from server-side props).
  - Fetches data from an API on mount, shows a loading state, 
    and then renders the table or a fallback if no data is found.
------------------------------------------------------------------ */
const CosmicSignatureTransfers = ({ address }) => {
  // Loading state for asynchronous data fetch
  const [loading, setLoading] = useState(true);

  // CST transfer data
  const [cosmicSignatureTransfers, setCosmicSignatureTransfers] = useState([]);

  /**
   * Fetch transfers for the provided address on component mount.
   * If there's an error, log it and turn off loading state.
   */
  useEffect(() => {
    const fetchTransfers = async () => {
      try {
        setLoading(true);
        const transfers = await api.get_cst_transfers(address);
        setCosmicSignatureTransfers(transfers);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransfers();
  }, [address]);

  return (
    <MainWrapper>
      <Typography variant="h4" color="primary" textAlign="center" mb={4}>
        Cosmic Signature Transfers
      </Typography>

      {loading ? (
        // Loading message
        <Typography variant="h6">Loading...</Typography>
      ) : (
        // Renders the table if not loading
        <CosmicTokenTransfersTable list={cosmicSignatureTransfers} />
      )}
    </MainWrapper>
  );
};

/* ------------------------------------------------------------------
  getServerSideProps:
  - Retrieves an 'address' from the URL (params).
  - Validates the address using ethers.utils.
  - Returns server-side rendered meta tags for SEO.
  - Passes the processed address as a prop to the page component.
------------------------------------------------------------------ */
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const params = context.params!.address;
  let address = Array.isArray(params) ? params[0] : params;

  // Validate address; if valid, normalize, otherwise mark as "Invalid Address".
  if (ethers.utils.isAddress(address.toLowerCase())) {
    address = ethers.utils.getAddress(address.toLowerCase());
  } else {
    address = "Invalid Address";
  }

  // Construct dynamic page title and description
  const title = `Cosmic Signature Token Transfer History for ${address} | Cosmic Signature`;
  const description = `Cosmic Signature Token Transfer History for ${address}`;

  const openGraphData = [
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: logoImgUrl },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: logoImgUrl },
  ];

  // Return the updated props to the component
  return { props: { title, description, openGraphData, address } };
}

export default CosmicSignatureTransfers;
