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
import { convertTimestampToDateTime, shortenHex } from "../utils";
import { useActiveWeb3React } from "../hooks/web3";
import { useApiData } from "../contexts/ApiDataContext";
import api from "../services/api";
import { Tr } from "react-super-responsive-table";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import NFTImage from "../components/NFTImage";
import { CustomPagination } from "../components/CustomPagination";
import { isMobile } from "react-device-detect";
import { GetServerSideProps } from "next";

const CSTRow = ({ nft }) => {
  const getTokenImageURL = () => {
    const fileName = nft.TokenId.toString().padStart(6, "0");
    return `https://cosmic-game2.s3.us-east-2.amazonaws.com/${fileName}.png`;
  };
  if (!nft) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow>
      <TablePrimaryCell sx={{ width: "120px" }}>
        <NFTImage src={getTokenImageURL()} />
      </TablePrimaryCell>
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
      <TablePrimaryCell align="center">
        <Link
          href={`/detail/${nft.TokenId}`}
          style={{ color: "inherit", fontSize: "inherit" }}
        >
          {nft.TokenId}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">{nft.TokenName || " "}</TablePrimaryCell>
      <TablePrimaryCell align="center">
        <Link
          href={`/prize/${nft.RoundNum}`}
          style={{ color: "inherit", fontSize: "inherit" }}
        >
          {nft.RoundNum}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <Link
          href={`/user/${nft.WinnerAddr}`}
          style={{
            color: "inherit",
            fontSize: "inherit",
            fontFamily: "monospace",
          }}
        >
          {shortenHex(nft.WinnerAddr, 6)}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {nft.Staked ? "Yes" : "No"}
      </TablePrimaryCell>
      <TablePrimaryCell align="right">
        {nft.RecordType === 3 ? (
          <Link
            href={`/prize/${nft.RoundNum}`}
            style={{ color: "inherit", fontSize: "inherit" }}
          >
            Prize Winner (#{nft.RoundNum})
          </Link>
        ) : nft.RecordType === 4 ? (
          "Random Walk Staking Raffle Token"
        ) : (
          "Raffle Winner"
        )}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

export const CSTTable = ({ list }) => {
  const perPage = 5;
  const [curPage, setCurPage] = useState(1);
  if (list.length === 0) {
    return <Typography>No tokens yet.</Typography>;
  }

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          {!isMobile && (
            <colgroup>
              <col width="11%" />
              <col width="16%" />
              <col width="10%" />
              <col width="12%" />
              <col width="8%" />
              <col width="17%" />
              <col width="9%" />
              <col width="17%" />
            </colgroup>
          )}
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell />
              <TablePrimaryHeadCell align="left">Date</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Token ID</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Token Name</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Round</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Winner Address</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Staked?</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                Prize Type
              </TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <TableBody>
            {list
              .slice((curPage - 1) * perPage, curPage * perPage)
              .map((nft) => (
                <CSTRow key={nft.EvtLogId} nft={nft} />
              ))}
          </TableBody>
        </TablePrimary>
      </TablePrimaryContainer>
      <CustomPagination
        page={curPage}
        setPage={setCurPage}
        totalLength={list.length}
        perPage={perPage}
      />
    </>
  );
};

const MyWallet = () => {
  const { account } = useActiveWeb3React();
  const { apiData: status } = useApiData();
  const [CSTList, setCSTList] = useState({
    data: [],
    loading: false,
  });
  const fetchCSTList = async (updateStatus) => {
    setCSTList((prev) => ({ ...prev, loading: updateStatus && true }));
    let cstList = await api.get_cst_tokens_by_user(account);
    setCSTList({ data: cstList, loading: false });
  };
  useEffect(() => {
    fetchCSTList(false);
  }, [status]);
  useEffect(() => {
    fetchCSTList(true);
  }, []);

  return (
    <>
      <MainWrapper>
        <Typography
          variant="h4"
          color="primary"
          gutterBottom
          textAlign="center"
        >
          My Cosmic Signature (ERC721) Tokens
        </Typography>
        {!account ? (
          <Typography variant="subtitle1">
            Please login to Metamask to see your tokens.
          </Typography>
        ) : (
          <>
            <Box mt={6}>
              <Typography variant="h6" mb={2}>
                Cosmic Signature Tokens I Own
              </Typography>
              {CSTList.loading ? (
                <Typography variant="h6">Loading...</Typography>
              ) : (
                <CSTTable list={CSTList.data} />
              )}
            </Box>
          </>
        )}
      </MainWrapper>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const title = "My Tokens | Cosmic Signature";
  const description =
    "Manage your digital assets on the My Tokens page at Cosmic Signature. View your token balance, transaction history, and ownership details. Keep track of your NFTs and tokens effortlessly.";
  const imageUrl = "https://cosmic-game2.s3.us-east-2.amazonaws.com/logo.png";

  const openGraphData = [
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: imageUrl },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: imageUrl },
  ];

  return { props: { title, description, openGraphData } };
};

export default MyWallet;
