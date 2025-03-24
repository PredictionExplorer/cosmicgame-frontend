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
import { convertTimestampToDateTime, getAssetsUrl } from "../utils";
import { Tr } from "react-super-responsive-table";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import { CustomPagination } from "./CustomPagination";
import { isMobile } from "react-device-detect";
import api from "../services/api";
import NFTImage from "./NFTImage";

/* ------------------------------------------------------------------
  Types (TypeScript) - adjust or remove if not using TypeScript
------------------------------------------------------------------ */

interface RandomWalkRow {
  StakeActionId: number;
  StakedTokenId: number;
  StakeTimeStamp: number;
}

interface CosmicSignatureTokenInfo {
  TokenId: number;
  Seed: number;
  StakeActionId: number;
}

interface CosmicSignatureRow {
  TokenInfo: CosmicSignatureTokenInfo;
  StakeTimeStamp: number;
}

type StakedRow = RandomWalkRow | CosmicSignatureRow;

/* ------------------------------------------------------------------
  Custom Hook: useTokenName
  Fetches the token name from your API if available.
------------------------------------------------------------------ */
function useTokenName(
  isRandomWalk: boolean,
  randomWalkId?: number,
  cosmicSignatureInfo?: CosmicSignatureTokenInfo
) {
  const [tokenName, setTokenName] = useState<string>("");

  useEffect(() => {
    const fetchName = async () => {
      try {
        if (isRandomWalk && typeof randomWalkId === "number") {
          const res = await api.get_info(randomWalkId);
          setTokenName(res?.CurName || "");
        } else if (!isRandomWalk && cosmicSignatureInfo?.TokenId) {
          const names = await api.get_name_history(cosmicSignatureInfo.TokenId);
          if (names.length > 0) {
            setTokenName(names[names.length - 1].TokenName);
          }
        }
      } catch (err) {
        console.error("Error fetching token name:", err);
      }
    };
    fetchName();
  }, [isRandomWalk, randomWalkId, cosmicSignatureInfo]);

  return tokenName;
}

/* ------------------------------------------------------------------
  StakedTokenRow - Renders a single row in the table
------------------------------------------------------------------ */
interface StakedTokenRowProps {
  row: StakedRow;
  isRandomWalk: boolean;
  isItemSelected: boolean;
  onRowClick: (id: number) => void;
  onUnstakeSingle: (id: number) => void;
}

const StakedTokenRow: React.FC<StakedTokenRowProps> = ({
  row,
  isRandomWalk,
  isItemSelected,
  onRowClick,
  onUnstakeSingle,
}) => {
  // Extract IDs
  const stakeActionId = isRandomWalk
    ? (row as RandomWalkRow).StakeActionId
    : (row as CosmicSignatureRow).TokenInfo.StakeActionId;
  const tokenId = isRandomWalk
    ? (row as RandomWalkRow).StakedTokenId
    : (row as CosmicSignatureRow).TokenInfo.TokenId;

  // Grab the correct "seed" or "StakedTokenId" for generating the image
  const seedOrRandomId = isRandomWalk
    ? (row as RandomWalkRow).StakedTokenId
    : (row as CosmicSignatureRow).TokenInfo.Seed;

  const stakeTimeStamp = isRandomWalk
    ? (row as RandomWalkRow).StakeTimeStamp
    : (row as CosmicSignatureRow).StakeTimeStamp;

  // Hook for token name
  const tokenName = useTokenName(
    isRandomWalk,
    isRandomWalk ? tokenId : undefined,
    !isRandomWalk ? (row as CosmicSignatureRow).TokenInfo : undefined
  );

  // Build the image URL
  const tokenImageURL = useMemo(() => {
    const fileName = seedOrRandomId.toString().padStart(6, "0");
    return isRandomWalk
      ? getAssetsUrl(`randomwalk/${fileName}_black_thumb.jpg`)
      : getAssetsUrl(`cosmicsignature/0x${fileName}.png`);
  }, [isRandomWalk, seedOrRandomId]);

  if (!row) return null;

  return (
    <TablePrimaryRow
      role="checkbox"
      aria-checked={isItemSelected}
      tabIndex={-1}
      key={stakeActionId}
      selected={isItemSelected}
      onClick={() => onRowClick(stakeActionId)}
      sx={{ cursor: "pointer" }}
    >
      <TablePrimaryCell padding="checkbox">
        <Checkbox color="primary" checked={isItemSelected} size="small" />
      </TablePrimaryCell>

      {/* Token Image + Name */}
      <TablePrimaryCell sx={{ width: "120px" }}>
        <NFTImage src={tokenImageURL} />
        <Typography variant="caption" mt={1} display="block">
          {tokenName}
        </Typography>
      </TablePrimaryCell>

      {/* Token ID */}
      <TablePrimaryCell align="center">
        <Link
          href={
            isRandomWalk
              ? `https://randomwalknft.com/detail/${tokenId}`
              : `/detail/${tokenId}`
          }
          sx={{ color: "inherit", fontSize: "inherit" }}
          target="_blank"
        >
          {tokenId}
        </Link>
      </TablePrimaryCell>

      {/* Stake Action ID */}
      <TablePrimaryCell align="center">
        <Link
          href={`/staking-action/${isRandomWalk ? 1 : 0}/${stakeActionId}`}
          sx={{ color: "inherit", fontSize: "inherit" }}
          target="_blank"
        >
          {stakeActionId}
        </Link>
      </TablePrimaryCell>

      {/* Stake Time */}
      <TablePrimaryCell align="center">
        {convertTimestampToDateTime(stakeTimeStamp)}
      </TablePrimaryCell>

      {/* Unstake Button */}
      <TablePrimaryCell align="center">
        <Button
          size="small"
          sx={{ mr: 1 }}
          onClick={(e) => {
            e.stopPropagation();
            onUnstakeSingle(stakeActionId);
          }}
        >
          Unstake
        </Button>
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

/* ------------------------------------------------------------------
  StakedTokensTable - Renders the table of staked tokens
------------------------------------------------------------------ */
interface StakedTokensTableProps {
  list: StakedRow[];
  handleUnstake: (id: number, isRandomWalk?: boolean) => Promise<void>;
  handleUnstakeMany: (ids: number[], isRandomWalk?: boolean) => Promise<void>;
  IsRwalk: boolean;
}

export const StakedTokensTable: React.FC<StakedTokensTableProps> = ({
  list,
  handleUnstake,
  handleUnstakeMany,
  IsRwalk,
}) => {
  const perPage = 5;
  const [page, setPage] = useState<number>(1);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Sort by timestamp ascending
  const sortedList = useMemo(() => {
    return [...list].sort((a, b) => {
      const aTime = IsRwalk
        ? (a as RandomWalkRow).StakeTimeStamp
        : (a as CosmicSignatureRow).StakeTimeStamp;
      const bTime = IsRwalk
        ? (b as RandomWalkRow).StakeTimeStamp
        : (b as CosmicSignatureRow).StakeTimeStamp;
      return aTime - bTime;
    });
  }, [list, IsRwalk]);

  // Check if ID is in selected array
  const isSelected = (id: number) => selectedIds.includes(id);

  // Toggle selection for single row
  const handleRowClick = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  // "Select All"
  const onSelectAllClick = () => {
    const newSelected = list.map((row) =>
      IsRwalk
        ? (row as RandomWalkRow).StakeActionId
        : (row as CosmicSignatureRow).TokenInfo.StakeActionId
    );
    setSelectedIds(newSelected);
    setAnchorEl(null);
  };

  // "Select Current Page"
  const onSelectCurPgClick = () => {
    const newSelected = sortedList
      .slice((page - 1) * perPage, page * perPage)
      .map((row) =>
        IsRwalk
          ? (row as RandomWalkRow).StakeActionId
          : (row as CosmicSignatureRow).TokenInfo.StakeActionId
      );
    setSelectedIds(newSelected);
    setAnchorEl(null);
  };

  // "Select None"
  const onSelectNoneClick = () => {
    setSelectedIds([]);
    setAnchorEl(null);
  };

  // Unstake multiple tokens
  const onUnstakeManyClick = async () => {
    await handleUnstakeMany(selectedIds, IsRwalk);
  };

  // Unstake a single token
  const onUnstakeSingle = async (actionId: number) => {
    // Temporarily set this as the only selected ID
    setSelectedIds([actionId]);
    await handleUnstake(actionId, IsRwalk);
  };

  // If there's no staked tokens
  if (list.length === 0) {
    return <Typography>No tokens yet.</Typography>;
  }

  /* ------------------------------------------------------------------
    Render
  ------------------------------------------------------------------ */
  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          {/* Optional column widths for non-mobile */}
          {!isMobile && (
            <colgroup>
              <col width="5%" />
              <col width="15%" />
              <col width="20%" />
              <col width="20%" />
              <col width="20%" />
              <col width="20%" />
            </colgroup>
          )}

          <TablePrimaryHead>
            <Tr>
              {/* Select All / Select Current Page / Select None */}
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
                      selectedIds.length > 0 && selectedIds.length < list.length
                    }
                    checked={
                      list.length > 0 && selectedIds.length === list.length
                    }
                  />
                  {anchorEl ? <ExpandLess /> : <ExpandMore />}
                </Box>
                <Menu
                  elevation={0}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                  }}
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "center",
                  }}
                  anchorEl={anchorEl}
                  keepMounted
                  open={Boolean(anchorEl)}
                  onClose={() => setAnchorEl(null)}
                >
                  <MenuItem
                    style={{ minWidth: 166 }}
                    onClick={onSelectAllClick}
                  >
                    <Typography>Select All</Typography>
                  </MenuItem>
                  <MenuItem
                    style={{ minWidth: 166 }}
                    onClick={onSelectCurPgClick}
                  >
                    <Typography>Select Current Page</Typography>
                  </MenuItem>
                  <MenuItem
                    style={{ minWidth: 166 }}
                    onClick={onSelectNoneClick}
                  >
                    <Typography>Select None</Typography>
                  </MenuItem>
                </Menu>
              </TablePrimaryHeadCell>

              <TablePrimaryHeadCell>Token Image</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Token ID</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Stake Action ID</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Stake Datetime</TablePrimaryHeadCell>
              <TablePrimaryHeadCell />
            </Tr>
          </TablePrimaryHead>

          {/* Table Body */}
          <TableBody>
            {sortedList
              .slice((page - 1) * perPage, page * perPage)
              .map((row) => {
                const stakeActionId = IsRwalk
                  ? (row as RandomWalkRow).StakeActionId
                  : (row as CosmicSignatureRow).TokenInfo.StakeActionId;

                return (
                  <StakedTokenRow
                    key={stakeActionId}
                    row={row}
                    isRandomWalk={IsRwalk}
                    isItemSelected={isSelected(stakeActionId)}
                    onRowClick={handleRowClick}
                    onUnstakeSingle={onUnstakeSingle}
                  />
                );
              })}
          </TableBody>
        </TablePrimary>
      </TablePrimaryContainer>

      {/* Unstake Many Button */}
      {selectedIds.length > 1 && (
        <Box display="flex" justifyContent="end" mt={2}>
          <Button variant="text" onClick={onUnstakeManyClick}>
            Unstake Many
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

// get numEthDepositsToEvaluateMaxLimit_ from smart contract for calling eth_call
