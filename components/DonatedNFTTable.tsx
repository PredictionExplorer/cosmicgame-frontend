import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Link,
  Pagination,
  TableBody,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from "./styled";
import { convertTimestampToDateTime, shortenHex } from "../utils";
import axios from "axios";
import NFTImage from "./NFTImage";
import { Tr } from "react-super-responsive-table";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";

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
            style={{
              color: "inherit",
              fontSize: "inherit",
              fontFamily: "monospace",
            }}
            target="_blank"
          >
            {shortenHex(nft.DonorAddr, 6)}
          </Link>
        </Tooltip>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <Link
          href={`/prize/${nft.RoundNum}`}
          style={{
            color: "inherit",
            fontSize: "inherit",
          }}
          target="_blank"
        >
          {nft.RoundNum}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell>
        <Tooltip title={nft.TokenAddr}>
          <Link
            href={`https://arbiscan.io/address/${nft.TokenAddr}`}
            style={{
              color: "inherit",
              fontSize: "inherit",
              fontFamily: "monospace",
            }}
            target="_blank"
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
      {handleClaim && (
        <TablePrimaryCell>
          {!nft.WinnerAddr ? (
            <Button
              variant="contained"
              onClick={(e) => handleClaim(e, nft.Index)}
              data-testid="Claim Button"
            >
              Claim
            </Button>
          ) : (
            " "
          )}
        </TablePrimaryCell>
      )}
    </TablePrimaryRow>
  );
};

const DonatedNFTTable = ({ list, handleClaim }) => {
  const perPage = 5;
  const [page, setPage] = useState(1);
  if (list.length === 0) {
    return <Typography>No donated NFTs yet.</Typography>;
  }
  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">Datetime</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="left">
                Donor Address
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Round #</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="left">
                Token Address
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                Token ID
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Token Image</TablePrimaryHeadCell>
              {handleClaim && <TablePrimaryHeadCell></TablePrimaryHeadCell>}
            </Tr>
          </TablePrimaryHead>
          <TableBody>
            {list.slice((page - 1) * perPage, page * perPage).map((nft) => (
              <NFTRow nft={nft} key={nft.RecordId} handleClaim={handleClaim} />
            ))}
          </TableBody>
        </TablePrimary>
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

export default DonatedNFTTable;
