import React, { useEffect, useState } from "react";
import { Box, Link, Pagination, TableBody, Typography } from "@mui/material";
import Head from "next/head";
import {
  MainWrapper,
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from "../components/styled";
import { convertTimestampToDateTime } from "../utils";
import api from "../services/api";
import { Tr } from "react-super-responsive-table";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";

const NamedNFTRow = ({ nft }) => {
  if (!nft) {
    return <TablePrimaryRow />;
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
