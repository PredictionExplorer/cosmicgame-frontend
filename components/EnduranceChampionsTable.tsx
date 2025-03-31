import React, { useState, useMemo } from "react";
import { TableBody, TableSortLabel, Typography } from "@mui/material";
import {
  TablePrimaryContainer,
  TablePrimaryCell,
  TablePrimaryHead,
  TablePrimaryRow,
  TablePrimary,
  TablePrimaryHeadCell,
} from "./styled";
import { Tr } from "react-super-responsive-table";
import { CustomPagination } from "./CustomPagination";
import { isMobile } from "react-device-detect";
import { AddressLink } from "./AddressLink";
import { formatSeconds } from "../utils";

interface ChampionRowProps {
  row: {
    bidder: string;
    championTime: number;
    chronoWarrior?: number;
  };
}

const EnduranceChampionsRow: React.FC<ChampionRowProps> = ({ row }) => {
  if (!row) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow>
      <TablePrimaryCell align="left">
        <AddressLink address={row.bidder} url={`/user/${row.bidder}`} />
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {formatSeconds(row.championTime)}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {formatSeconds(row.chronoWarrior || 0)}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

interface ChampionsTableProps {
  championList: ChampionRowProps["row"][] | null;
}

const EnduranceChampionsTable: React.FC<ChampionsTableProps> = ({
  championList,
}) => {
  const [sortField, setSortField] = useState<"championTime" | "chronoWarrior">(
    "championTime"
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState<number>(1);
  const perPage = 5;

  // Handle sorting logic
  const handleSort = (field: "championTime" | "chronoWarrior") => {
    if (field === sortField) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Memoized sorted and paginated data
  const paginatedList = useMemo(() => {
    if (!championList) return [];

    const sortedList = [...championList].sort((a, b) =>
      sortDirection === "asc"
        ? a[sortField] - b[sortField]
        : b[sortField] - a[sortField]
    );

    return sortedList.slice((page - 1) * perPage, page * perPage);
  }, [championList, sortField, sortDirection, page]);

  // Conditional rendering based on list status
  if (!championList) {
    return <Typography>Loading...</Typography>;
  }

  if (championList.length === 0) {
    return <Typography>No endurance champions yet.</Typography>;
  }

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          {!isMobile && (
            <colgroup>
              <col width="50%" />
              <col width="25%" />
              <col width="25%" />
            </colgroup>
          )}
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">
                User Address
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="center">
                <TableSortLabel
                  active={sortField === "championTime"}
                  direction={sortDirection}
                  onClick={() => handleSort("championTime")}
                >
                  Champion Time
                </TableSortLabel>
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="center">
                <TableSortLabel
                  active={sortField === "chronoWarrior"}
                  direction={sortDirection}
                  onClick={() => handleSort("chronoWarrior")}
                >
                  Chrono Warrior
                </TableSortLabel>
              </TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <TableBody>
            {paginatedList.map((row, index) => (
              <EnduranceChampionsRow
                key={`${row.bidder}-${index}-${page}`}
                row={row}
              />
            ))}
          </TableBody>
        </TablePrimary>
      </TablePrimaryContainer>
      {championList.length > perPage && (
        <CustomPagination
          page={page}
          setPage={setPage}
          totalLength={championList.length}
          perPage={perPage}
        />
      )}
    </>
  );
};

export default EnduranceChampionsTable;
