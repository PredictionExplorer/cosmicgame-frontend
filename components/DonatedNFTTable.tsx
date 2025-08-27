import React, { useEffect, useState, FC } from "react";
import axios from "axios";
import { Button, Link, TableBody, Tooltip, Typography } from "@mui/material";
import {
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from "./styled";
import {
  convertTimestampToDateTime,
  formatSeconds,
  shortenHex,
} from "../utils";
import NFTImage from "./NFTImage";
import { Tr } from "react-super-responsive-table";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import { CustomPagination } from "./CustomPagination";
import useRaffleWalletContract from "../hooks/useRaffleWalletContract";

// ----------------------------
// Type Definitions
// ----------------------------
interface NFTRecord {
  RecordId: string;
  TxHash: string;
  TimeStamp: number;
  DonorAddr: string;
  RoundNum: number;
  TokenAddr: string;
  TokenId?: string;
  NFTTokenId?: string;
  NFTTokenURI?: string;
  WinnerAddr?: string;
  Index: number;
}

interface NFTRowProps {
  nft: NFTRecord;
  handleClaim?: (tokenIndex: number) => void;
  claimingTokens: number[];
}

interface DonatedNFTTableProps {
  list: NFTRecord[];
  handleClaim?: (tokenIndex: number) => void;
  claimingTokens: number[];
}

// ----------------------------
// NFT Row Component
// ----------------------------
const NFTRow: FC<NFTRowProps> = ({ nft, handleClaim, claimingTokens }) => {
  const [tokenURI, setTokenURI] = useState<any>(null);

  const [
    roundTimeoutTimesToWithdrawPrizes,
    setRoundTimeoutTimesToWithdrawPrizes,
  ] = useState(0);
  const raffleWalletContract = useRaffleWalletContract();

  useEffect(() => {
    const fetchRoundTimeoutTimesToWithdrawPrizes = async () => {
      const roundTimeoutTimesToWithdrawPrizes = await raffleWalletContract.roundTimeoutTimesToWithdrawPrizes(
        nft.RoundNum
      );
      setRoundTimeoutTimesToWithdrawPrizes(
        Number(roundTimeoutTimesToWithdrawPrizes)
      );
    };

    if (raffleWalletContract) {
      fetchRoundTimeoutTimesToWithdrawPrizes();
    }
  }, [raffleWalletContract]);

  useEffect(() => {
    const fetchTokenMetadata = async () => {
      try {
        const { data } = await axios.get(nft.NFTTokenURI!);
        setTokenURI(data);
      } catch (error) {
        console.error("Error fetching token URI:", error);
      }
    };

    if (nft.NFTTokenURI) {
      fetchTokenMetadata();
    }
  }, [nft.NFTTokenURI]);

  if (!nft) return <TablePrimaryRow />;

  const isClaiming = claimingTokens.includes(nft.Index);

  return (
    <TablePrimaryRow>
      {/* Timestamp */}
      <TablePrimaryCell>
        <Link
          color="inherit"
          fontSize="inherit"
          href={`https://arbiscan.io/tx/${nft.TxHash}`}
          target="_blank"
        >
          {convertTimestampToDateTime(nft.TimeStamp)}
        </Link>
      </TablePrimaryCell>

      {/* Donor Address */}
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

      {/* Round Number */}
      <TablePrimaryCell align="center">
        <Link
          href={`/prize/${nft.RoundNum}`}
          style={{ color: "inherit", fontSize: "inherit" }}
          target="_blank"
        >
          {nft.RoundNum}
        </Link>
      </TablePrimaryCell>

      {/* Token Address */}
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

      {/* Token ID */}
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
      <TablePrimaryCell align="center">
        {convertTimestampToDateTime(roundTimeoutTimesToWithdrawPrizes)}{" "}
        {roundTimeoutTimesToWithdrawPrizes < Date.now() / 1000
          ? "(Expired)"
          : `(${formatSeconds(
              roundTimeoutTimesToWithdrawPrizes - Math.ceil(Date.now() / 1000)
            )})`}
      </TablePrimaryCell>

      {/* Token Image */}
      <TablePrimaryCell sx={{ width: "130px" }}>
        {tokenURI?.image ? (
          <Link href={tokenURI.external_url} target="_blank">
            <NFTImage src={tokenURI.image} />
          </Link>
        ) : (
          <Typography variant="body2">Image not available</Typography>
        )}
      </TablePrimaryCell>

      {/* Claim Button */}
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

// ----------------------------
// Main Table Component
// ----------------------------
const DonatedNFTTable: FC<DonatedNFTTableProps> = ({
  list,
  handleClaim,
  claimingTokens,
}) => {
  const perPage = 5;
  const [page, setPage] = useState<number>(1);

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
              <TablePrimaryHeadCell>Expiration Date</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Token Image</TablePrimaryHeadCell>
              {handleClaim && <TablePrimaryHeadCell></TablePrimaryHeadCell>}
            </Tr>
          </TablePrimaryHead>
          <TableBody>
            {list.slice((page - 1) * perPage, page * perPage).map((nft, i) => (
              <NFTRow
                key={page * perPage + i}
                nft={nft}
                handleClaim={handleClaim}
                claimingTokens={claimingTokens}
              />
            ))}
          </TableBody>
        </TablePrimary>
      </TablePrimaryContainer>

      {/* Pagination */}
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
