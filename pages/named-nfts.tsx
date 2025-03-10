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
import { Tr } from "react-super-responsive-table";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import { CustomPagination } from "../components/CustomPagination";
import { GetServerSideProps } from "next";

/* ------------------------------------------------------------------
  Sub-Component: NamedNFTRow
  Renders a single row in the table, showing:
    - DateTime (formatted),
    - Token ID (link to token detail page),
    - Token Name.
------------------------------------------------------------------ */
const NamedNFTRow = ({ nft }) => {
  // If there's no data for nft, return an empty row.
  if (!nft) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow>
      {/* NFT's minting datetime */}
      <TablePrimaryCell>
        {convertTimestampToDateTime(nft.MintTimeStamp)}
      </TablePrimaryCell>

      {/* Token ID, linking to a detail page */}
      <TablePrimaryCell align="center">
        <Link
          sx={{ color: "inherit", fontSize: "inherit" }}
          href={`/detail/${nft.TokenId}`}
        >
          {nft.TokenId}
        </Link>
      </TablePrimaryCell>

      {/* Token's custom name */}
      <TablePrimaryCell>{nft.TokenName}</TablePrimaryCell>
    </TablePrimaryRow>
  );
};

/* ------------------------------------------------------------------
  Sub-Component: NamedNFTsTable
  Receives a list of NFT objects and renders them in a styled table.
------------------------------------------------------------------ */
const NamedNFTsTable = ({ list }) => {
  return (
    <TablePrimaryContainer>
      <TablePrimary>
        <TablePrimaryHead>
          <Tr>
            <TablePrimaryHeadCell align="left">DateTime</TablePrimaryHeadCell>
            <TablePrimaryHeadCell>Token Id</TablePrimaryHeadCell>
            <TablePrimaryHeadCell align="left">Token Name</TablePrimaryHeadCell>
          </Tr>
        </TablePrimaryHead>
        <TableBody>
          {list.map((nft, i) => (
            <NamedNFTRow key={i} nft={nft} />
          ))}
        </TableBody>
      </TablePrimary>
    </TablePrimaryContainer>
  );
};

/* ------------------------------------------------------------------
  Main Page Component: NamedNFTs
  - Fetches named NFT data from an API on mount.
  - Displays them in a paginated table with 5 rows per page.
  - Shows loading and empty states.
------------------------------------------------------------------ */
const NamedNFTs = () => {
  // Current page in the pagination
  const [curPage, setCurPage] = useState(1);

  // Number of items to show per page
  const perPage = 5;

  // Loading state to display progress while fetching data
  const [loading, setLoading] = useState(true);

  // List of named NFTs fetched from the API
  const [list, setList] = useState([]);

  // Fetch named NFTs from the API upon component mount
  useEffect(() => {
    const fetchNamedNFTs = async () => {
      try {
        setLoading(true);
        const nfts = await api.get_named_nfts();
        setList(nfts);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchNamedNFTs();
  }, []);

  // Rendering logic:
  //  - If we're loading, show loading text
  //  - If no NFTs, show a "No NFTs yet." message
  //  - Otherwise, slice the data for the current page and show the table + pagination
  return (
    <MainWrapper>
      <Typography variant="h4" color="primary" gutterBottom textAlign="center">
        Named Cosmic Signature Tokens
      </Typography>

      <Box mt={6}>
        {loading ? (
          <Typography variant="h6">Loading...</Typography>
        ) : list.length > 0 ? (
          <>
            <NamedNFTsTable
              list={list.slice((curPage - 1) * perPage, curPage * perPage)}
            />
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
  Provides server-side rendered meta tags for SEO (title, description, 
  and Open Graph data). This ensures correct social media previews.
------------------------------------------------------------------ */
export const getServerSideProps: GetServerSideProps = async () => {
  const title = "Named Cosmic Signature Tokens | Cosmic Signature";
  const description = "Named Cosmic Signature Tokens";

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

export default NamedNFTs;
