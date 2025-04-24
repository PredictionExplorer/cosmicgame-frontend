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
import { useActiveWeb3React } from "../hooks/web3";

// Types
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

// Custom Hook: useTokenName
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

// StakedTokenRow
interface StakedTokenRowProps {
  row: StakedRow;
  isRandomWalk: boolean;
  isItemSelected: boolean;
  accumulatedRewards: number;
  onRowClick: (id: number) => void;
  onUnstakeSingle: (id: number) => void;
}

const StakedTokenRow: React.FC<StakedTokenRowProps> = ({
  row,
  isRandomWalk,
  isItemSelected,
  accumulatedRewards,
  onRowClick,
  onUnstakeSingle,
}) => {
  const stakeActionId = isRandomWalk
    ? (row as RandomWalkRow).StakeActionId
    : (row as CosmicSignatureRow).TokenInfo.StakeActionId;
  const tokenId = isRandomWalk
    ? (row as RandomWalkRow).StakedTokenId
    : (row as CosmicSignatureRow).TokenInfo.TokenId;

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

      <TablePrimaryCell sx={{ width: "120px" }}>
        <NFTImage src={tokenImageURL} />
        <Typography variant="caption" mt={1} display="block">
          {tokenName}
        </Typography>
      </TablePrimaryCell>

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

      <TablePrimaryCell align="center">
        <Link
          href={`/staking-action/${isRandomWalk ? 1 : 0}/${stakeActionId}`}
          sx={{ color: "inherit", fontSize: "inherit" }}
          target="_blank"
        >
          {stakeActionId}
        </Link>
      </TablePrimaryCell>

      <TablePrimaryCell align="center">
        {convertTimestampToDateTime(stakeTimeStamp)}
      </TablePrimaryCell>

      {!isRandomWalk && (
        <TablePrimaryCell align="center">
          {accumulatedRewards.toFixed(4)}
        </TablePrimaryCell>
      )}

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

// StakedTokensTable
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
  const { account } = useActiveWeb3React();
  const perPage = 5;
  const [page, setPage] = useState<number>(1);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const [accumulatedRewardsByToken, setAccumulatedRewardsByToken] = useState<
    any[]
  >([]);

  useEffect(() => {
    const fetchAccumulatedRewards = async () => {
      if (account) {
        const rewards = await api.get_staking_rewards_by_user(account);
        setAccumulatedRewardsByToken(rewards);
      }
    };

    fetchAccumulatedRewards();
  }, [account]);

  // Refresh selection and pagination when the list changes
  useEffect(() => {
    setSelectedIds([]);
    setPage(1);
  }, [list]);

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
    setSelectedIds([actionId]);
    await handleUnstake(actionId, IsRwalk);
  };

  // If there's no staked tokens
  if (list.length === 0) {
    return <Typography>No tokens yet.</Typography>;
  }

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          {!isMobile && (
            <colgroup>
              <col width="5%" />
              <col width="15%" />
              <col width="20%" />
              <col width="15%" />
              <col width="15%" />
              {!IsRwalk && <col width="15%" />}
              <col width="15%" />
            </colgroup>
          )}

          <TablePrimaryHead>
            <Tr>
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
              <TablePrimaryHeadCell>Accumulated Rewards</TablePrimaryHeadCell>
              <TablePrimaryHeadCell />
            </Tr>
          </TablePrimaryHead>

          <TableBody>
            {sortedList
              .slice((page - 1) * perPage, page * perPage)
              .map((row) => {
                const stakeActionId = IsRwalk
                  ? (row as RandomWalkRow).StakeActionId
                  : (row as CosmicSignatureRow).TokenInfo.StakeActionId;

                const accumulatedRewards = IsRwalk
                  ? 0
                  : accumulatedRewardsByToken.find(
                      (x) =>
                        x.TokenId ===
                        (row as CosmicSignatureRow).TokenInfo.TokenId
                    )?.RewardToCollectEth || 0;

                return (
                  <StakedTokenRow
                    key={stakeActionId}
                    row={row}
                    isRandomWalk={IsRwalk}
                    accumulatedRewards={accumulatedRewards}
                    isItemSelected={isSelected(stakeActionId)}
                    onRowClick={handleRowClick}
                    onUnstakeSingle={onUnstakeSingle}
                  />
                );
              })}
          </TableBody>
        </TablePrimary>
      </TablePrimaryContainer>

      {selectedIds.length > 1 && (
        <Box display="flex" justifyContent="end" mt={2}>
          <Button variant="text" onClick={onUnstakeManyClick}>
            Unstake Many
          </Button>
        </Box>
      )}

      <CustomPagination
        page={page}
        setPage={setPage}
        totalLength={list.length}
        perPage={perPage}
      />
    </>
  );
};
