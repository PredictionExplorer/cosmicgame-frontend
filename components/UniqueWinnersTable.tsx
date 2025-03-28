import React, { useState } from "react";
import { TableBody, Typography } from "@mui/material";
import {
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from "./styled";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import { Tr } from "react-super-responsive-table";
import { CustomPagination } from "./CustomPagination";
import { AddressLink } from "./AddressLink";

// TypeScript types for better clarity and type-safety
interface Winner {
  WinnerAid: string;
  WinnerAddr: string;
  PrizesCount: number;
  MaxWinAmountEth: number;
  PrizesSum: number;
}

interface UniqueWinnersRowProps {
  winner?: Winner;
}

// Component rendering a single row of winner data
const UniqueWinnersRow: React.FC<UniqueWinnersRowProps> = ({ winner }) => {
  if (!winner) {
    // Return empty row when winner data isn't available
    return <TablePrimaryRow />;
  }

  // Render row with winner details
  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        <AddressLink
          address={winner.WinnerAddr}
          url={`/user/${winner.WinnerAddr}`}
        />
      </TablePrimaryCell>
      <TablePrimaryCell align="right">{winner.PrizesCount}</TablePrimaryCell>
      <TablePrimaryCell align="right">
        {winner.MaxWinAmountEth.toFixed(6)}
      </TablePrimaryCell>
      <TablePrimaryCell align="right">
        {winner.PrizesSum.toFixed(6)}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

interface UniqueWinnersTableProps {
  list: Winner[];
}

// Component rendering a paginated table of winners
export const UniqueWinnersTable: React.FC<UniqueWinnersTableProps> = ({
  list,
}) => {
  // Items per page constant
  const perPage = 5;

  // State for current page
  const [page, setPage] = useState(1);

  // Display message when there are no winners
  if (list.length === 0) {
    return <Typography>No winners yet.</Typography>;
  }

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">
                Winner Address
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                Prizes Taken
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                Max Prize (ETH)
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                Prizes Sum (ETH)
              </TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>

          <TableBody>
            {list.slice((page - 1) * perPage, page * perPage).map((winner) => (
              <UniqueWinnersRow winner={winner} key={winner.WinnerAid} />
            ))}
          </TableBody>
        </TablePrimary>
      </TablePrimaryContainer>

      {/* Pagination component to navigate between pages */}
      <CustomPagination
        page={page}
        setPage={setPage}
        totalLength={list.length}
        perPage={perPage}
      />
    </>
  );
};
