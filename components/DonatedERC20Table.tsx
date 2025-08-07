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
import {
  convertTimestampToDateTime,
  formatSeconds,
  shortenHex,
} from "../utils";
import { Tr } from "react-super-responsive-table";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import { CustomPagination } from "./CustomPagination";
import useRaffleWalletContract from "../hooks/useRaffleWalletContract";
import api from "../services/api";

const TokenRow = ({ currentTime, token, handleClaim }) => {
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

      <TablePrimaryCell align="center">
        {token.AmountEth.toFixed(2)}
      </TablePrimaryCell>

      {/* Winner Address */}
      <TablePrimaryCell>
        <Tooltip title={token.WinnerAddr}>
          <Link
            href={`/user/${token.WinnerAddr}`}
            style={{
              color: "inherit",
              fontSize: "inherit",
              fontFamily: "monospace",
            }}
            target="_blank"
          >
            {shortenHex(token.WinnerAddr, 6)}
          </Link>
        </Tooltip>
      </TablePrimaryCell>

      <TablePrimaryCell align="center">
        {token.Claimed ? "Yes" : "No"}
      </TablePrimaryCell>

      <TablePrimaryCell align="center">
        {convertTimestampToDateTime(roundTimeoutTimesToWithdrawPrizes)}{" "}
        {roundTimeoutTimesToWithdrawPrizes < currentTime
          ? "(Expired)"
          : `(${formatSeconds(
              roundTimeoutTimesToWithdrawPrizes - currentTime
            )} left)`}
      </TablePrimaryCell>

      {/* Claim Button */}
      {handleClaim && roundTimeoutTimesToWithdrawPrizes < currentTime && (
        <TablePrimaryCell>
          {!token.WinnerAddr && (
            <Button
              variant="contained"
              onClick={() =>
                handleClaim(token.RoundNum, token.TokenAddr, token.AmountEth)
              }
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
const DonatedERC20Table = ({ list, handleClaim }) => {
  const perPage = 5;
  const [page, setPage] = useState<number>(1);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(async () => {
      const currentTime = await api.get_current_time();
      setCurrentTime(currentTime);
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

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
              <TablePrimaryHeadCell>Amount</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Winner</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Claimed</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Expiration Date</TablePrimaryHeadCell>
              {handleClaim && <TablePrimaryHeadCell></TablePrimaryHeadCell>}
            </Tr>
          </TablePrimaryHead>
          <TableBody>
            {list.slice((page - 1) * perPage, page * perPage).map((token) => (
              <TokenRow
                key={token.RecordId}
                currentTime={currentTime}
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
