import React, { useEffect, useState } from "react";
import { Button, Link, TableBody, Tooltip, Typography } from "@mui/material";
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
import { CustomPagination } from "./CustomPagination";

const NFTRow = ({ nft, handleClaim, claimingTokens }) => {
  const [tokenURI, setTokenURI] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(nft.NFTTokenURI);
        setTokenURI(data);
      } catch (error) {
        console.error("Error fetching token URI:", error);
      }
    };
    if (nft.NFTTokenURI) {
      fetchData();
    }
  }, [nft.NFTTokenURI]);

  if (!nft) {
    return <TablePrimaryRow />;
  }

  const isClaiming = claimingTokens.includes(nft.Index);

  return (
    <TablePrimaryRow>
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
      <TablePrimaryCell align="center">
        {tokenURI?.external_url ? (
          <Link
            href={tokenURI.external_url}
            target="_blank"
            sx={{ fontSize: "inherit", color: "inherit" }}
          >
            {nft.NFTTokenId || nft.TokenId}
          </Link>
        ) : (
          nft.NFTTokenId || nft.TokenId
        )}
      </TablePrimaryCell>
      <TablePrimaryCell sx={{ width: "130px" }}>
        {tokenURI?.image ? (
          <Link href={tokenURI.external_url} target="_blank">
            <NFTImage src={tokenURI.image} />
          </Link>
        ) : (
          <Typography variant="body2">Image not available</Typography>
        )}
      </TablePrimaryCell>
      {handleClaim && (
        <TablePrimaryCell>
          {!nft.WinnerAddr && (
            <Button
              variant="contained"
              onClick={() => handleClaim(nft.Index)}
              disabled={isClaiming}
              data-testid="Claim Button"
            >
              {isClaiming ? "Claiming..." : "Claim"}
            </Button>
          )}
        </TablePrimaryCell>
      )}
    </TablePrimaryRow>
  );
};

const DonatedNFTTable = ({ list, handleClaim, claimingTokens }) => {
  const perPage = 5;
  const [page, setPage] = useState(1);

  if (!list || list.length === 0) {
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
              <TablePrimaryHeadCell>Token ID</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Token Image</TablePrimaryHeadCell>
              {handleClaim && <TablePrimaryHeadCell></TablePrimaryHeadCell>}
            </Tr>
          </TablePrimaryHead>
          <TableBody>
            {list.slice((page - 1) * perPage, page * perPage).map((nft) => (
              <NFTRow
                nft={nft}
                key={nft.RecordId}
                handleClaim={handleClaim}
                claimingTokens={claimingTokens}
              />
            ))}
          </TableBody>
        </TablePrimary>
      </TablePrimaryContainer>
      <CustomPagination
        page={page}
        setPage={setPage}
        totalLength={list.length}
        perPage={perPage}
      />
    </>
  );
};

export default DonatedNFTTable;
