import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Link,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryRow,
} from "./styled";
import { convertTimestampToDateTime, shortenHex } from "../utils";
import axios from "axios";
import NFTImage from "./NFTImage";

const NFTRow = ({ nft, handleClaim }) => {
  const [tokenURI, setTokenURI] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await axios.get(nft.NFTTokenURI);
      setTokenURI(data);
    };
    if (nft.NFTTokenURI) {
      fetchData();
    }
  }, []);

  if (!nft) {
    return <TablePrimaryRow></TablePrimaryRow>;
  }

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        {convertTimestampToDateTime(nft.TimeStamp)}
      </TablePrimaryCell>
      <TablePrimaryCell>
        <Tooltip title={nft.DonorAddr}>
          <Link
            href={`/user/${nft.DonorAddr}`}
            style={{ color: "rgba(255, 255, 255, 0.68)", fontSize: "inherit" }}
          >
            {shortenHex(nft.DonorAddr, 6)}
          </Link>
        </Tooltip>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">{nft.RoundNum}</TablePrimaryCell>
      <TablePrimaryCell>
        <Tooltip title={nft.TokenAddr}>
          <Link
            href={`https://arbiscan.io/address/${nft.TokenAddr}`}
            style={{ color: "rgba(255, 255, 255, 0.68)", fontSize: "inherit" }}
          >
            {shortenHex(nft.TokenAddr, 6)}
          </Link>
        </Tooltip>
      </TablePrimaryCell>
      <TablePrimaryCell align="right">
        <Link
          href={tokenURI?.external_url}
          target="_blank"
          sx={{ fontSize: "inherit", color: "inherit" }}
        >
          {nft.NFTTokenId || nft.TokenId}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell>
        <Link href={tokenURI?.external_url} target="_blank">
          <NFTImage src={tokenURI?.image} />
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell>
        {!nft.WinnerAddr && (
          <Button
            variant="contained"
            onClick={(e) => handleClaim(e, nft.Index)}
          >
            Claim
          </Button>
        )}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

export const DonatedNFTTable = ({ list, handleClaim }) => {
  const perPage = 5;
  const [page, setPage] = useState(1);
  if (list.length === 0) {
    return <Typography>No NFTs yet.</Typography>;
  }
  return (
    <>
      <TablePrimaryContainer>
        <Table>
          <colgroup>
            <col width="15%" />
            <col width="20%" />
            <col width="10%" />
            <col width="20%" />
            <col width="10%" />
            <col width="25%" />
            <col width="5%" />
          </colgroup>
          <TablePrimaryHead>
            <TableRow>
              <TableCell>Datetime</TableCell>
              <TableCell>Donor Address</TableCell>
              <TableCell align="center">Round #</TableCell>
              <TableCell>Token Address</TableCell>
              <TableCell align="right">Token ID</TableCell>
              <TableCell>Token Image</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TablePrimaryHead>
          <TableBody>
            {list.slice((page - 1) * perPage, page * perPage).map((nft) => (
              <NFTRow nft={nft} key={nft.RecordId} handleClaim={handleClaim} />
            ))}
          </TableBody>
        </Table>
      </TablePrimaryContainer>
      <Box display="flex" justifyContent="center" mt={4}>
        <Pagination
          color="primary"
          page={page}
          onChange={(e, page) => setPage(page)}
          count={Math.ceil(list.length / perPage)}
          hideNextButton
          hidePrevButton
          shape="rounded"
        />
      </Box>
    </>
  );
};
