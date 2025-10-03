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
import { Tr } from "react-super-responsive-table";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import { CustomPagination } from "../../components/CustomPagination";
import { AddressLink } from "../../components/AddressLink";

/* ------------------------------------------------------------------
  Sub-Component: CosmicTokenTransferRow
  Renders a single row in the transfer table, showing:
    • The transfer date/time (links to Arbiscan)
    • "From" address
    • "To" address
    • Amount/value transferred (in ETH)
  If row.TransferType > 0, a subtle background highlight is applied.
------------------------------------------------------------------ */
const CosmicTokenTransferRow = ({ row }) => {
  // If no row data, return an empty row to avoid errors
  if (!row) {
    return <TablePrimaryRow />;
  }

  // Conditionally style the row if TransferType > 0
  const rowStyle =
    row.TransferType > 0 ? { background: "rgba(255, 255, 255, 0.06)" } : {};

  return (
    <TablePrimaryRow sx={rowStyle}>
      {/* Transfer Date/Time -> Links to Arbiscan transaction page */}
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

      {/* "From" address: checks if it's a wallet address for styling/tooltip */}
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

      {/* "To" address: same logic as "From" address */}
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

      {/* Transfer amount/value in ETH, to 2 decimal places */}
      <TablePrimaryCell align="center">
        {row.ValueFloat.toFixed(2)}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

/* ------------------------------------------------------------------
  Sub-Component: CosmicTokenTransfersTable
  Displays a paginated table of Cosmic Token transfers.
    • Shows "No transfers yet." if the list is empty.
    • Slices the data based on the current page.
    • Renders CustomPagination controls at the bottom.
------------------------------------------------------------------ */
const CosmicTokenTransfersTable = ({ list }) => {
  // Number of rows to display per page
  const perPage = 10;

  // Current page in pagination
  const [page, setPage] = useState(1);

  // If no transfers, provide a fallback message
  if (list.length === 0) {
    return <Typography variant="h6">No transfers yet.</Typography>;
  }

  // Slice the list to only the transfers for the current page
  const currentPageData = list.slice((page - 1) * perPage, page * perPage);

  return (
    <>
      {/* Table container + table */}
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
            {currentPageData.map((row) => (
              // Use a unique key (EvtLogId) for each row
              <CosmicTokenTransferRow key={row.EvtLogId} row={row} />
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
  Main Page Component: CosmicTokenTransfers
  - Fetches transfer data for a given address (from server props).
  - Displays them in a table with pagination.
  - Shows a loading state while data is being fetched.
------------------------------------------------------------------ */
const CosmicTokenTransfers = ({ address }) => {
  // Loading flag for data fetch
  const [loading, setLoading] = useState(true);

  // State holding all fetched transfers
  const [cosmicTokenTransfers, setCosmicTokenTransfers] = useState([]);

  /* 
    useEffect: On component mount, fetch the transfers from the API.
    If an error occurs, log it, but ensure loading is set to false.
  */
  useEffect(() => {
    const fetchTransfers = async () => {
      try {
        setLoading(true);
        const transfers = await api.get_ct_transfers(address);
        setCosmicTokenTransfers(transfers);
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
      {/* Page title */}
      <Typography variant="h4" color="primary" textAlign="center" mb={4}>
        Cosmic Signature Token Transfers
      </Typography>

      {/* Conditionally render a loading message or the transfers table */}
      {loading ? (
        <Typography variant="h6">Loading...</Typography>
      ) : (
        <CosmicTokenTransfersTable list={cosmicTokenTransfers} />
      )}
    </MainWrapper>
  );
};

/* ------------------------------------------------------------------
  getServerSideProps:
  - Extracts the 'address' parameter from the URL path.
  - Validates the address with ethers.utils. If invalid, sets it to "Invalid Address".
  - Returns the page meta (title, description, etc.) for SEO and social sharing.
  - Passes 'address' as a prop to the component.
------------------------------------------------------------------ */
export async function getServerSideProps(context: GetServerSidePropsContext) {
  // Retrieve the 'address' parameter from the URL
  const params = context.params!.address;
  let address = Array.isArray(params) ? params[0] : params;

  // Validate and normalize the address if valid; otherwise, label as invalid
  if (ethers.utils.isAddress(address.toLowerCase())) {
    address = ethers.utils.getAddress(address.toLowerCase());
  } else {
    address = "Invalid Address";
  }

  // Build page title/description dynamically with the address
  const title = `Cosmic Signature Token Transfer History for ${address} | Cosmic Signature`;
  const description = `Cosmic Signature Token Transfer History for ${address}`;

  // Set Open Graph and Twitter meta tags
  const openGraphData = [
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: logoImgUrl },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: logoImgUrl },
  ];

  return { props: { title, description, openGraphData, address } };
}

export default CosmicTokenTransfers;
