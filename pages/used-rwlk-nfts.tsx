import React, { useEffect, useState } from "react";
import { Box, Link, TableBody, Typography } from "@mui/material";
import {
  MainWrapper,
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from "../components/styled";
import { convertTimestampToDateTime, logoImgUrl } from "../utils";
import api from "../services/api";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import { Tr } from "react-super-responsive-table";
import { CustomPagination } from "../components/CustomPagination";
import { GetServerSideProps } from "next";

/* ------------------------------------------------------------------
  Sub-Component: UsedRwlkNftRow
  Renders a single row with NFT information, including:
    - Datetime (links to Arbiscan for transaction),
    - Bidder Address (links to user page),
    - Round Number (links to a 'prize' detail page),
    - RWalk Token ID.
------------------------------------------------------------------ */
const UsedRwlkNftRow = ({ nft }) => {
  // If nft is null/undefined, render an empty row to avoid errors.
  if (!nft) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow>
      {/* Datetime -> Arbiscan link */}
      <TablePrimaryCell>
        <Link
          color="inherit"
          fontSize="inherit"
          href={`https://arbiscan.io/tx/${nft.TxHash}`}
          target="__blank"
        >
          {convertTimestampToDateTime(nft.TimeStamp)}
        </Link>
      </TablePrimaryCell>

      {/* Bidder Address -> User detail page */}
      <TablePrimaryCell align="center">
        <Link
          sx={{
            color: "inherit",
            fontSize: "inherit",
            fontFamily: "monospace",
          }}
          href={`/user/${nft.BidderAddr}`}
        >
          {nft.BidderAddr}
        </Link>
      </TablePrimaryCell>

      {/* Round Number -> Prize detail page */}
      <TablePrimaryCell align="center">
        <Link
          sx={{ color: "inherit", fontSize: "inherit" }}
          href={`/prize/${nft.RoundNum}`}
        >
          {nft.RoundNum}
        </Link>
      </TablePrimaryCell>

      {/* RandomWalk Token ID */}
      <TablePrimaryCell align="center">{nft.RWalkTokenId}</TablePrimaryCell>
    </TablePrimaryRow>
  );
};

/* ------------------------------------------------------------------
  Sub-Component: UsedRwlkNftsTable
  A table wrapper that maps over a list of NFT objects and displays
  each in a UsedRwlkNftRow.
------------------------------------------------------------------ */
const UsedRwlkNftsTable = ({ list }) => {
  return (
    <TablePrimaryContainer>
      <TablePrimary>
        <TablePrimaryHead>
          <Tr>
            <TablePrimaryHeadCell align="left">DateTime</TablePrimaryHeadCell>
            <TablePrimaryHeadCell>Bidder Address</TablePrimaryHeadCell>
            <TablePrimaryHeadCell>Round</TablePrimaryHeadCell>
            <TablePrimaryHeadCell>Token Id</TablePrimaryHeadCell>
          </Tr>
        </TablePrimaryHead>
        <TableBody>
          {list.map((nft, i) => (
            <UsedRwlkNftRow key={i} nft={nft} />
          ))}
        </TableBody>
      </TablePrimary>
    </TablePrimaryContainer>
  );
};

/* ------------------------------------------------------------------
  Main Page Component: UsedRwlkNfts
  - Fetches the list of used RandomWalk NFTs on mount.
  - Displays them in a paginated table.
  - Renders appropriate messages for loading or empty states.
------------------------------------------------------------------ */
const UsedRwlkNfts = () => {
  // Number of items to show per page.
  const perPage = 5;

  // Current page in pagination.
  const [curPage, setCurPage] = useState(1);

  // Loading state to handle asynchronous fetch.
  const [loading, setLoading] = useState(true);

  // The complete list of used RandomWalk NFTs.
  const [list, setList] = useState([]);

  // Fetch the used RandomWalk NFTs from the API upon component mount.
  useEffect(() => {
    const fetchUsedRwlkNFTs = async () => {
      try {
        setLoading(true);
        const nfts = await api.get_used_rwlk_nfts();
        setList(nfts);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchUsedRwlkNFTs();
  }, []);

  // Rendering Logic:
  // 1) Display loading message if data is still being fetched.
  // 2) If no data exists, show "No NFTs yet."
  // 3) Otherwise, slice the list for the current page and pass it to the table.
  return (
    <MainWrapper>
      <Typography variant="h4" color="primary" gutterBottom textAlign="center">
        Used RandomWalk NFTs
      </Typography>

      <Box mt={6}>
        {loading ? (
          <Typography variant="h6">Loading...</Typography>
        ) : list.length > 0 ? (
          <>
            <UsedRwlkNftsTable
              list={list.slice((curPage - 1) * perPage, curPage * perPage)}
            />
            {/* Pagination Controls */}
            <CustomPagination
              page={curPage}
              setPage={setCurPage}
              totalLength={list.length}
              perPage={perPage}
            />
          </>
        ) : (
          <Typography variant="h6">No NFTs yet.</Typography>
        )}
      </Box>
    </MainWrapper>
  );
};

/* ------------------------------------------------------------------
  getServerSideProps:
  Returns server-side rendered meta tags for SEO (title, description, 
  and Open Graph data). This ensures social media previews are set 
  up correctly.
------------------------------------------------------------------ */
export const getServerSideProps: GetServerSideProps = async () => {
  const title = "Used RandomWalk NFTs for Bid | Cosmic Signature";
  const description = "Used RandomWalk NFTs for Bid";

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

export default UsedRwlkNfts;
