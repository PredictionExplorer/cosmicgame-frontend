import { Link, TableBody } from "@mui/material";
import { convertTimestampToDateTime } from "../utils";
import {
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from "./styled";
import { Tr } from "react-super-responsive-table";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";

/* ------------------------------------------------------------------
  Types
------------------------------------------------------------------ */
interface RaffleWinning {
  EvtLogId: number;
  TxHash: string;
  TimeStamp: number;
  RoundNum: number;
  Amount: number;
}

/** Table Row for a single raffle winning */
function RaffleWinningRow({ winning }: { winning: RaffleWinning }) {
  if (!winning) return <TablePrimaryRow />;

  const { TxHash, TimeStamp, RoundNum, Amount } = winning;

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        <Link
          color="inherit"
          fontSize="inherit"
          href={`https://arbiscan.io/tx/${TxHash}`}
          target="_blank"
        >
          {convertTimestampToDateTime(TimeStamp)}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <Link
          href={`/prize/${RoundNum}`}
          style={{ color: "inherit", fontSize: "inherit" }}
          target="_blank"
        >
          {RoundNum}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell align="right">{Amount.toFixed(7)}</TablePrimaryCell>
    </TablePrimaryRow>
  );
}

/** Table layout for raffle winnings */
export function RaffleWinningsTable({ list }: { list: RaffleWinning[] }) {
  return (
    <TablePrimaryContainer>
      <TablePrimary>
        <TablePrimaryHead>
          <Tr>
            <TablePrimaryHeadCell align="left">Datetime</TablePrimaryHeadCell>
            <TablePrimaryHeadCell>Round</TablePrimaryHeadCell>
            <TablePrimaryHeadCell align="right">
              Amount (ETH)
            </TablePrimaryHeadCell>
          </Tr>
        </TablePrimaryHead>
        <TableBody>
          {list.map((winning) => (
            <RaffleWinningRow key={winning.EvtLogId} winning={winning} />
          ))}
        </TableBody>
      </TablePrimary>
    </TablePrimaryContainer>
  );
}
