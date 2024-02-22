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
import { convertTimestampToDateTime } from "../utils";
import api from "../services/api";

const UsedRwlkNftRow = ({ nft }) => {
  if (!nft) {
    return <TablePrimaryRow></TablePrimaryRow>;
  }
  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        {convertTimestampToDateTime(nft.TimeStamp)}
      </TablePrimaryCell>
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
      <TablePrimaryCell align="center">
        <Link
          sx={{ color: "inherit", fontSize: "inherit" }}
          href={`/prize/${nft.RoundNum}`}
        >
          {nft.RoundNum}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">{nft.RWalkTokenId}</TablePrimaryCell>
    </TablePrimaryRow>
  );
};

const UsedRwlkNftsTable = ({ list }) => {
  return (
    <TablePrimaryContainer>
      <Table>
        <colgroup>
          <col width="15%" />
          <col width="55%" />
          <col width="15%" />
          <col width="15%" />
        </colgroup>
        <TablePrimaryHead>
          <TableRow>
            <TableCell>DateTime</TableCell>
            <TableCell align="center">Bidder Address</TableCell>
            <TableCell align="center">Round</TableCell>
            <TableCell align="center">Token Id</TableCell>
          </TableRow>
        </TablePrimaryHead>
        <TableBody>
          {list.map((nft, i) => (
            <UsedRwlkNftRow key={i} nft={nft} />
          ))}
        </TableBody>
      </Table>
    </TablePrimaryContainer>
  );
};

const UsedRwlkNfts = () => {
  const [curPage, setCurPage] = useState(1);
  const perPage = 5;
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState([]);

  useEffect(() => {
    const fetchUsedRwlkNFTs = async () => {
      try {
        setLoading(true);
        let nfts = await api.get_used_rwlk_nfts();
        setList(nfts);
        setLoading(false);
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    };
    fetchUsedRwlkNFTs();
  }, []);

  return (
    <>
      <Head>
        <title>Used RandomWalk NFTs | Cosmic Signature</title>
        <meta name="description" content="" />
      </Head>
      <MainWrapper>
        <Typography
          variant="h4"
          color="primary"
          gutterBottom
          textAlign="center"
        >
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
              <Box display="flex" justifyContent="center" mt={4}>
                <Pagination
                  color="primary"
                  page={curPage}
                  onChange={(_e, page) => setCurPage(page)}
                  count={Math.ceil(list.length / perPage)}
                  hideNextButton
                  hidePrevButton
                  shape="rounded"
                />
              </Box>
            </>
          ) : (
            <Typography variant="h6">No NFTs yet.</Typography>
          )}
        </Box>
      </MainWrapper>
    </>
  );
};

export default UsedRwlkNfts;
