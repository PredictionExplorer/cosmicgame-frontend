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
interface TokenRecord {
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

interface TokenRowProps {
  token: TokenRecord;
  handleClaim?: (tokenIndex: number) => void;
}

interface DonatedNFTTableProps {
  list: TokenRecord[];
  handleClaim?: (tokenIndex: number) => void;
}

// ----------------------------
// NFT Row Component
// ----------------------------
const TokenRow: FC<TokenRowProps> = ({ token, handleClaim }) => {
  const [tokenURI, setTokenURI] = useState<any>(null);

  const [
    roundTimeoutTimesToWithdrawPrizes,
    setRoundTimeoutTimesToWithdrawPrizes,
  ] = useState(0);
  const raffleWalletContract = useRaffleWalletContract();

  useEffect(() => {
    const fetchRoundTimeoutTimesToWithdrawPrizes = async () => {
      const roundTimeoutTimesToWithdrawPrizes = await raffleWalletContract.roundTimeoutTimesToWithdrawPrizes(
        token.RoundNum
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
        const { data } = await axios.get(token.NFTTokenURI!);
        setTokenURI(data);
      } catch (error) {
        console.error("Error fetching token URI:", error);
      }
    };

    if (token.NFTTokenURI) {
      fetchTokenMetadata();
    }
  }, [token.NFTTokenURI]);

  if (!token) return <TablePrimaryRow />;

  return (
    <TablePrimaryRow>
      {/* Timestamp */}
      <TablePrimaryCell>
        <Link
          color="inherit"
          fontSize="inherit"
          href={`https://arbiscan.io/tx/${token.TxHash}`}
          target="_blank"
        >
          {convertTimestampToDateTime(token.TimeStamp)}
        </Link>
      </TablePrimaryCell>

      {/* Donor Address */}
      <TablePrimaryCell>
        <Tooltip title={token.DonorAddr}>
          <Link
            href={`/user/${token.DonorAddr}`}
            style={{
              color: "inherit",
              fontSize: "inherit",
              fontFamily: "monospace",
            }}
            target="_blank"
          >
            {shortenHex(token.DonorAddr, 6)}
          </Link>
        </Tooltip>
      </TablePrimaryCell>

      {/* Round Number */}
      <TablePrimaryCell align="center">
        <Link
          href={`/prize/${token.RoundNum}`}
          style={{ color: "inherit", fontSize: "inherit" }}
          target="_blank"
        >
          {token.RoundNum}
        </Link>
      </TablePrimaryCell>

      {/* Token Address */}
      <TablePrimaryCell>
        <Tooltip title={token.TokenAddr}>
          <Link
            href={`https://arbiscan.io/address/${token.TokenAddr}`}
            style={{
              color: "inherit",
              fontSize: "inherit",
              fontFamily: "monospace",
            }}
            target="_blank"
          >
            {shortenHex(token.TokenAddr, 6)}
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
            {token.NFTTokenId || token.TokenId}
          </Link>
        ) : (
          token.NFTTokenId || token.TokenId
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
          {!token.WinnerAddr && (
            <Button
              variant="contained"
              onClick={() => handleClaim(token.Index)}
              data-testid="Claim Button"
            >
              Claim
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
const DonatedERC20Table: FC<DonatedNFTTableProps> = ({ list, handleClaim }) => {
  const perPage = 5;
  const [page, setPage] = useState<number>(1);

  if (!list || list.length === 0) {
    return <Typography>No donated ERC20 tokens yet.</Typography>;
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
            {list.slice((page - 1) * perPage, page * perPage).map((token) => (
              <TokenRow
                key={token.RecordId}
                token={token}
                handleClaim={handleClaim}
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

export default DonatedERC20Table;
