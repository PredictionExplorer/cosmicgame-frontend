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
import api from "../services/api";
import NFTImage from "./NFTImage";
import { CustomPagination } from "./CustomPagination";
import { isMobile } from "react-device-detect";

const StakedTokensRow = ({
  row,
  handleUnstake,
  isItemSelected,
  handleClick,
  IsRwalk,
}) => {
  const [tokenName, setTokenName] = useState("");

  const tokenImageURL = useMemo(() => {
    const fileName = (IsRwalk ? row.StakedTokenId : row.TokenInfo.Seed)
      .toString()
      .padStart(6, "0");
    return IsRwalk
      ? `https://randomwalknft.s3.us-east-2.amazonaws.com/${fileName}_black_thumb.jpg`
      : `https://cosmic-game2.s3.us-east-2.amazonaws.com/0x${fileName}.png`;
  }, [IsRwalk, row]);

  useEffect(() => {
    const getTokenName = async () => {
      if (IsRwalk) {
        const res = await api.get_info(row.StakedTokenId);
        setTokenName(res.CurName);
      } else {
        const names = await api.get_name_history(row.TokenInfo.TokenId);
        if (names.length > 0) {
          setTokenName(names[names.length - 1].TokenName);
        }
      }
    };
    getTokenName();
  }, []);

  if (!row) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow
      hover="true"
      role="checkbox"
      aria-checked={isItemSelected}
      tabIndex={-1}
      key={IsRwalk ? row.StakeActionId : row.TokenInfo.StakeActionId}
      selected={isItemSelected}
      onClick={() =>
        handleClick(IsRwalk ? row.StakeActionId : row.TokenInfo.StakeActionId)
      }
      sx={{ cursor: "pointer" }}
    >
      <TablePrimaryCell padding="checkbox">
        <Checkbox color="primary" checked={isItemSelected} size="small" />
      </TablePrimaryCell>
      <TablePrimaryCell sx={{ width: "120px" }}>
        <NFTImage src={tokenImageURL} />
        <Typography variant="caption" mt={1}>
          {tokenName}
        </Typography>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <Link
          href={
            IsRwalk
              ? `https://randomwalknft.com/detail/${row.StakedTokenId}`
              : `/detail/${row.TokenInfo.TokenId}`
          }
          sx={{
            color: "inherit",
            fontSize: "inherit",
          }}
          target="_blank"
        >
          {IsRwalk ? row.StakedTokenId : row.TokenInfo.TokenId}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <Link
          href={`/staking-action/${IsRwalk ? 1 : 0}/${
            IsRwalk ? row.StakeActionId : row.TokenInfo.StakeActionId
          }`}
          sx={{
            color: "inherit",
            fontSize: "inherit",
          }}
          target="_blank"
        >
          {IsRwalk ? row.StakeActionId : row.TokenInfo.StakeActionId}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {convertTimestampToDateTime(row.StakeTimeStamp)}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <Button
          size="small"
          sx={{ mr: 1 }}
          onClick={(e) => {
            e.stopPropagation();
            handleUnstake(
              IsRwalk ? row.StakeActionId : row.TokenInfo.StakeActionId
            );
          }}
        >
          Unstake
        </Button>
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

export const StakedTokensTable = ({
  list,
  handleUnstake,
  handleUnstakeMany,
  IsRwalk,
}) => {
  const perPage = 5;
  const [page, setPage] = useState(1);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selected, setSelected] = useState([]);

  const sortedList = useMemo(() => {
    return [...list].sort((a, b) => a.StakeTimeStamp - b.StakeTimeStamp);
  }, [list]);

  const isSelected = (id: number) => selected.includes(id);

  const handleClick = (id: number) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = [...selected, id];
    } else {
      newSelected = selected.filter((itemId) => itemId !== id);
    }

    setSelected(newSelected);
  };

  const onSelectAllClick = () => {
    const newSelected = list.map((n) =>
      IsRwalk ? n.StakeActionId : n.TokenInfo.StakeActionId
    );
    setSelected(newSelected);
    setAnchorEl(null);
  };

  const onSelectCurPgClick = () => {
    const newSelected = sortedList
      .slice((page - 1) * perPage, page * perPage)
      .map((n) => (IsRwalk ? n.StakeActionId : n.TokenInfo.StakeActionId));
    setSelected(newSelected);
    setAnchorEl(null);
  };

  const onSelectNoneClick = () => {
    setSelected([]);
    setAnchorEl(null);
  };

  const onUnstakeMany = async () => {
    await handleUnstakeMany(selected, IsRwalk);
  };

  const onUnstake = async (actionId: number) => {
    setSelected([actionId]);
    await handleUnstake(actionId, IsRwalk);
  };

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
              <col width="20%" />
              <col width="20%" />
              <col width="20%" />
            </colgroup>
          )}
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell padding="checkbox" align="left">
                <Box
                  sx={{
                    display: {
                      md: "flex",
                      sm: "flex",
                      xs: "none",
                    },
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                >
                  <Checkbox
                    color="info"
                    size="small"
                    indeterminate={
                      selected.length > 0 && selected.length < list.length
                    }
                    checked={list.length > 0 && selected.length === list.length}
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
          <TableBody>
            {sortedList
              .slice((page - 1) * perPage, page * perPage)
              .map((row) => (
                <StakedTokensRow
                  key={
                    IsRwalk ? row.StakeActionId : row.TokenInfo.StakeActionId
                  }
                  row={row}
                  handleUnstake={onUnstake}
                  isItemSelected={isSelected(
                    IsRwalk ? row.StakeActionId : row.TokenInfo.StakeActionId
                  )}
                  handleClick={handleClick}
                  IsRwalk={IsRwalk}
                />
              ))}
          </TableBody>
        </TablePrimary>
      </TablePrimaryContainer>
      {selected.length > 1 && (
        <Box display="flex" justifyContent="end" mt={2}>
          <Button variant="text" onClick={onUnstakeMany}>
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
