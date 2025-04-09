import React, { FC, useMemo, useState } from "react";
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

/**
 * Defines the shape of a single champion data object.
 */
interface EnduranceChampion {
  bidder: string; // User address
  championTime: number; // Main duration/time for the champion
  chronoWarrior?: number; // Optional time for "Chrono Warrior"
}

/**
 * Props for a single row in the EnduranceChampions table.
 * This component expects an object of type EnduranceChampion.
 */
interface ChampionRowProps {
  row: EnduranceChampion;
}

/**
 * Displays a single row in the EnduranceChampions table.
 * Renders the bidder's address and their respective times.
 */
const EnduranceChampionsRow: FC<ChampionRowProps> = ({ row }) => {
  // If there's no data, return an empty row. You can omit this check
  // if you're certain 'row' will always be provided.
  if (!row) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow>
      {/* Bidder/User Address Cell */}
      <TablePrimaryCell align="left">
        <AddressLink address={row.bidder} url={`/user/${row.bidder}`} />
      </TablePrimaryCell>

      {/* Champion Time Cell */}
      <TablePrimaryCell align="center">
        {formatSeconds(row.championTime)}
      </TablePrimaryCell>

      {/* Chrono Warrior Time Cell (optional) */}
      <TablePrimaryCell align="center">
        {formatSeconds(row.chronoWarrior || 0)}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

/**
 * Props for the EnduranceChampionsTable.
 * Accepts an array of EnduranceChampion objects (or null while loading).
 */
interface ChampionsTableProps {
  championList: EnduranceChampion[] | null;
}

/**
 * Displays a table of EnduranceChampions with sorting and pagination.
 */
const EnduranceChampionsTable: FC<ChampionsTableProps> = ({ championList }) => {
  // Fields by which we can sort
  const [sortField, setSortField] = useState<"championTime" | "chronoWarrior">(
    "championTime"
  );

  // Current sort direction: ascending or descending
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Current page for pagination
  const [page, setPage] = useState<number>(1);

  // Number of items to display per page
  const perPage = 5;

  /**
   * Handles changing the sort field and toggling sort direction.
   * If the clicked field is the same as the current sort field, toggle direction.
   * Otherwise, set the new field and default direction to "desc".
   */
  const handleSort = (field: "championTime" | "chronoWarrior") => {
    if (field === sortField) {
      // Toggle between ascending and descending
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  /**
   * Sort and paginate the championList in a memoized way
   * to avoid unnecessary re-computations on re-renders.
   */
  const paginatedList = useMemo(() => {
    if (!championList) {
      return [];
    }

    // Sort the list based on the current field and direction
    const sortedList = [...championList].sort((a, b) => {
      return sortDirection === "asc"
        ? a[sortField] - b[sortField]
        : b[sortField] - a[sortField];
    });

    // Paginate the sorted list
    const startIndex = (page - 1) * perPage;
    return sortedList.slice(startIndex, startIndex + perPage);
  }, [championList, sortField, sortDirection, page, perPage]);

  // If data is not yet available, show a loading message
  if (!championList) {
    return <Typography>Loading...</Typography>;
  }

  // If the list is empty (and no longer loading), show a fallback message
  if (championList.length === 0) {
    return <Typography>No endurance champions yet.</Typography>;
  }

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          {/* The colgroup sets column widths for non-mobile devices */}
          {!isMobile && (
            <colgroup>
              <col width="50%" />
              <col width="25%" />
              <col width="25%" />
            </colgroup>
          )}

          {/* Table Headers */}
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">
                User Address
              </TablePrimaryHeadCell>

              <TablePrimaryHeadCell align="center">
                {/* Sortable header for ChampionTime */}
                <TableSortLabel
                  active={sortField === "championTime"}
                  direction={sortDirection}
                  onClick={() => handleSort("championTime")}
                >
                  Champion Time
                </TableSortLabel>
              </TablePrimaryHeadCell>

              <TablePrimaryHeadCell align="center">
                {/* Sortable header for ChronoWarrior */}
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

          {/* Table Body */}
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

      {/* Conditionally render pagination if total rows exceed perPage */}
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
