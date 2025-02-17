import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Button,
  Checkbox,
  Link,
  Menu,
  MenuItem,
  TableBody,
  Typography,
} from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import {
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from "./styled";
import { convertTimestampToDateTime } from "../utils";
import { Tr } from "react-super-responsive-table";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import { CustomPagination } from "./CustomPagination";
import { AddressLink } from "./AddressLink";
import { isMobile } from "react-device-detect";

/* ------------------------------------------------------------------
  Sub-Component: CSTokenRow
  Renders a single row (CSToken).
------------------------------------------------------------------ */
const CSTokenRow = ({ row, onSelectToggle, onStakeSingle, isItemSelected }) => {
  if (!row) return null;

  const {
    TokenId,
    TxHash,
    TimeStamp,
    TokenName,
    RoundNum,
    WinnerAddr,
    Staked,
  } = row;

  // Row-level click handlers
  const handleRowClick = () => onSelectToggle(TokenId);

  const handleStakeClick = (e) => {
    e.stopPropagation();
    onStakeSingle(TokenId);
  };

  return (
    <TablePrimaryRow
      hover
      role="checkbox"
      tabIndex={-1}
      selected={isItemSelected}
      onClick={handleRowClick}
      sx={{ cursor: "pointer" }}
    >
      {/* Checkbox */}
      <TablePrimaryCell padding="checkbox">
        <Checkbox color="primary" checked={isItemSelected} size="small" />
      </TablePrimaryCell>

      {/* Mint Datetime */}
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

      {/* Token ID */}
      <TablePrimaryCell align="center">
        <Link
          href={`/detail/${TokenId}`}
          sx={{ color: "inherit", fontSize: "inherit" }}
          target="_blank"
        >
          {TokenId}
        </Link>
      </TablePrimaryCell>

      {/* Token Name */}
      <TablePrimaryCell align="center">{TokenName || " "}</TablePrimaryCell>

      {/* Round Number */}
      <TablePrimaryCell align="center">
        <Link
          href={`/prize/${RoundNum}`}
          style={{ color: "inherit", fontSize: "inherit" }}
          target="_blank"
        >
          {RoundNum}
        </Link>
      </TablePrimaryCell>

      {/* Winner Address */}
      <TablePrimaryCell align="center">
        <AddressLink address={WinnerAddr} url={`/user/${WinnerAddr}`} />
      </TablePrimaryCell>

      {/* Stake Button */}
      <TablePrimaryCell align="center">
        {!Staked && (
          <Button size="small" onClick={handleStakeClick}>
            Stake
          </Button>
        )}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

/* ------------------------------------------------------------------
  Main Component: CSTokensTable
  Renders a paginated table of CSTokens with "stake" functionality.
------------------------------------------------------------------ */
export const CSTokensTable = ({ list, handleStake, handleStakeMany }) => {
  const perPage = 5;

  // Pagination
  const [page, setPage] = useState(1);

  // Menu anchor (for "Select All / Current Page / None")
  const [anchorEl, setAnchorEl] = useState(null);

  // Track selected Token IDs
  const [selectedTokenIds, setSelectedTokenIds] = useState([]);

  // Refresh selection and pagination when the list changes
  useEffect(() => {
    setSelectedTokenIds([]);
    setPage(1);
  }, [list]);

  // Slice the data for the current page
  const pageItems = useMemo(() => {
    const startIndex = (page - 1) * perPage;
    const endIndex = page * perPage;
    return list.slice(startIndex, endIndex);
  }, [list, page]);

  // Check if a token is selected
  const isSelected = (id) => selectedTokenIds.includes(id);

  // Toggle selection of a single row
  const handleSelectToggle = (id) => {
    setSelectedTokenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Close the select menu
  const handleCloseMenu = () => setAnchorEl(null);

  // "Select All" from the entire list
  const handleSelectAll = () => {
    setSelectedTokenIds(list.map((row) => row.TokenId));
    handleCloseMenu();
  };

  // "Select Current Page" only
  const handleSelectCurrentPage = () => {
    setSelectedTokenIds(pageItems.map((row) => row.TokenId));
    handleCloseMenu();
  };

  // "Select None"
  const handleSelectNone = () => {
    setSelectedTokenIds([]);
    handleCloseMenu();
  };

  // Single-stake
  const handleStakeSingle = async (id) => {
    // Temporarily set only this ID as selected
    setSelectedTokenIds([id]);
    await handleStake(id, false);
  };

  // Stake many tokens
  const handleStakeManySelected = async () => {
    await handleStakeMany(selectedTokenIds, false);
  };

  // If the list is empty
  if (list.length === 0) {
    return <Typography>No available tokens.</Typography>;
  }

  /* ------------------------------------------------------------------
    Render
  ------------------------------------------------------------------ */
  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          {/* (Optional) Column widths for non-mobile devices */}
          {!isMobile && (
            <colgroup>
              <col width="3%" />
              <col width="25%" />
              <col width="10%" />
              <col width="15%" />
              <col width="10%" />
              <col width="25%" />
              <col width="12%" />
            </colgroup>
          )}

          <TablePrimaryHead>
            <Tr>
              {/* Checkbox + Select Menu */}
              <TablePrimaryHeadCell padding="checkbox" align="left">
                <Box
                  sx={{
                    display: { md: "flex", sm: "flex", xs: "none" },
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                >
                  <Checkbox
                    color="info"
                    size="small"
                    indeterminate={
                      selectedTokenIds.length > 0 &&
                      selectedTokenIds.length < list.length
                    }
                    checked={
                      list.length > 0 && selectedTokenIds.length === list.length
                    }
                  />
                  {Boolean(anchorEl) ? <ExpandLess /> : <ExpandMore />}
                </Box>
                <Menu
                  elevation={0}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  transformOrigin={{ vertical: "top", horizontal: "center" }}
                  anchorEl={anchorEl}
                  keepMounted
                  open={Boolean(anchorEl)}
                  onClose={handleCloseMenu}
                >
                  <MenuItem style={{ minWidth: 166 }} onClick={handleSelectAll}>
                    <Typography>Select All</Typography>
                  </MenuItem>
                  <MenuItem
                    style={{ minWidth: 166 }}
                    onClick={handleSelectCurrentPage}
                  >
                    <Typography>Select Current Page</Typography>
                  </MenuItem>
                  <MenuItem
                    style={{ minWidth: 166 }}
                    onClick={handleSelectNone}
                  >
                    <Typography>Select None</Typography>
                  </MenuItem>
                </Menu>
              </TablePrimaryHeadCell>

              <TablePrimaryHeadCell align="left">
                Mint Datetime
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Token ID</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Token Name</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Round</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Winner Address</TablePrimaryHeadCell>
              <TablePrimaryHeadCell />
            </Tr>
          </TablePrimaryHead>

          {/* Table Body */}
          <TableBody>
            {pageItems.map((row) => (
              <CSTokenRow
                key={row.EvtLogId}
                row={row}
                isItemSelected={isSelected(row.TokenId)}
                onSelectToggle={handleSelectToggle}
                onStakeSingle={handleStakeSingle}
              />
            ))}
          </TableBody>
        </TablePrimary>
      </TablePrimaryContainer>

      {/* Stake Many button */}
      {selectedTokenIds.length > 1 && (
        <Box display="flex" justifyContent="end" mt={2}>
          <Button variant="text" onClick={handleStakeManySelected}>
            Stake Many
          </Button>
        </Box>
      )}

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
