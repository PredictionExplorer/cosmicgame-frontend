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

const NamedNFTRow = ({ nft }) => {
  if (!nft) {
    return <TablePrimaryRow></TablePrimaryRow>;
  }
  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        {convertTimestampToDateTime(nft.MintTimeStamp)}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <Link
          sx={{ color: "inherit", fontSize: "inherit" }}
          href={`/detail/${nft.TokenId}`}
        >
          {nft.TokenId}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell>{nft.TokenName}</TablePrimaryCell>
    </TablePrimaryRow>
  );
};

const NamedNFTsTable = ({ list }) => {
  return (
    <TablePrimaryContainer>
      <Table>
        <colgroup>
          <col width="15%" />
          <col width="35%" />
          <col width="50%" />
        </colgroup>
        <TablePrimaryHead>
          <TableRow>
            <TableCell>DateTime</TableCell>
            <TableCell align="center">Token Id</TableCell>
            <TableCell>Token Name</TableCell>
          </TableRow>
        </TablePrimaryHead>
        <TableBody>
          {list.map((nft, i) => (
            <NamedNFTRow key={i} nft={nft} />
          ))}
        </TableBody>
      </Table>
    </TablePrimaryContainer>
  );
};

const NamedNFTs = () => {
  const [curPage, setCurPage] = useState(1);
  const perPage = 5;
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState([]);

  useEffect(() => {
    const fetchNamedNFTs = async () => {
      try {
        setLoading(true);
        let nfts = await api.get_named_nfts();
        setList(nfts);
        setLoading(false);
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    };
    fetchNamedNFTs();
  }, []);

  return (
    <>
      <Head>
        <title>Named Cosmic Signature Tokens | Cosmic Signature</title>
        <meta name="description" content="" />
      </Head>
      <MainWrapper>
        <Typography
          variant="h4"
          color="primary"
          gutterBottom
          textAlign="center"
        >
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

export default NamedNFTs;
