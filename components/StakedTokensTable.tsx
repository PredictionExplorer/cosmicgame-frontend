import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Link,
  Menu,
  MenuItem,
  Pagination,
  Snackbar,
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

const StakedTokensRow = ({
  offset,
  row,
  handleUnstake,
  isItemSelected,
  handleClick,
  IsRwalk,
}) => {
  const [tokenName, setTokenName] = useState("");
  const getTokenImageURL = () => {
    const fileName = (IsRwalk ? row.StakedTokenId : row.TokenInfo.TokenId)
      .toString()
      .padStart(6, "0");
    if (IsRwalk) {
      return `https://randomwalknft.s3.us-east-2.amazonaws.com/${fileName}_black_thumb.jpg`;
    }
    return `https://cosmic-game2.s3.us-east-2.amazonaws.com/${fileName}.png`;
  };
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
      key={row.id}
      selected={isItemSelected}
      onClick={() =>
        handleClick(IsRwalk ? row.StakeActionId : row.TokenInfo.StakeActionId)
      }
      sx={{
        cursor: "pointer",
        pointerEvents:
          row.UnstakeTimeStamp > Date.now() / 1000 + offset ? "none" : "auto",
      }}
    >
      <TablePrimaryCell padding="checkbox">
        <Checkbox
          color="primary"
          checked={isItemSelected}
          disabled={row.UnstakeTimeStamp > Date.now() / 1000 + offset}
          size="small"
        />
      </TablePrimaryCell>
      <TablePrimaryCell sx={{ width: "120px" }}>
        <NFTImage src={getTokenImageURL()} />
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
        {convertTimestampToDateTime(row.UnstakeTimeStamp)}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {row.UnstakeTimeStamp <= Date.now() / 1000 + offset && (
          <Button
            size="small"
            sx={{ mr: 1 }}
            onClick={(e) => {
              e.stopPropagation();
              handleUnstake(
                IsRwalk ? row.StakeActionId : row.TokenInfo.StakeActionId,
                IsRwalk ? row.StakedTokenId : row.TokenInfo.TokenId
              );
            }}
          >
            Unstake
          </Button>
        )}
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
  const [notification, setNotification] = useState<{
    text: string;
    type: "success" | "info" | "warning" | "error";
    visible: boolean;
  }>({
    visible: false,
    text: "",
    type: "success",
  });
  const [offset, setOffset] = useState(0);
  const filtered = list.filter(
    (x) => x.UnstakeTimeStamp <= Date.now() / 1000 + offset
  );
  const [page, setPage] = useState(1);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selected, setSelected] = useState([]);
  const isSelected = (id: number) => selected.indexOf(id) !== -1;
  const handleClick = (id: number) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };
  const onSelectAllClick = () => {
    const newSelected = filtered.map((n) =>
      IsRwalk ? n.StakeActionId : n.TokenInfo.StakeActionId
    );
    setSelected(newSelected);
    setAnchorEl(null);
  };
  const onSelectCurPgClick = () => {
    const newSelected = filtered
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
    const res = await handleUnstakeMany(selected, IsRwalk);
    if (!res.code) {
      setNotification({
        visible: true,
        text: "The selected tokens were unstaked successfully!",
        type: "success",
      });
    }
  };
  const onUnstake = async (actionId: number, tokenId: number) => {
    setSelected([actionId]);
    const res = await handleUnstake(actionId, IsRwalk);
    if (!res.code) {
      setNotification({
        visible: true,
        text: `You have successfully unstaked token ${tokenId}!`,
        type: "success",
      });
    }
  };
  const handleNotificationClose = () => {
    setNotification({ ...notification, visible: false });
  };
  useEffect(() => {
    const fetchData = async () => {
      const current = await api.get_current_time();
      const offset = current - Date.now() / 1000;
      setOffset(offset);
    };
    fetchData();
    setSelected([]);
    setPage(1);
  }, [list]);

  if (list.length === 0) {
    return <Typography>No tokens yet.</Typography>;
  }
  return (
    <>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        autoHideDuration={10000}
        open={notification.visible}
        onClose={handleNotificationClose}
      >
        <Alert
          severity={notification.type}
          variant="filled"
          onClose={handleNotificationClose}
        >
          {notification.text}
        </Alert>
      </Snackbar>
      <TablePrimaryContainer>
        <TablePrimary>
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
              <TablePrimaryHeadCell>Unstake Datetime</TablePrimaryHeadCell>
              <TablePrimaryHeadCell />
            </Tr>
          </TablePrimaryHead>
          <TableBody>
            {list
              .sort((a, b) => a.StakeTimeStamp - b.StakeTimeStamp)
              .slice((page - 1) * perPage, page * perPage)
              .map((row, index) => (
                <StakedTokensRow
                  key={(page - 1) * perPage + index}
                  offset={offset}
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
      <Box display="flex" justifyContent="center" mt={4}>
        <Pagination
          color="primary"
          page={page}
          onChange={(_e, page) => setPage(page)}
          count={Math.ceil(list.length / perPage)}
          hideNextButton
          hidePrevButton
          shape="rounded"
        />
      </Box>
    </>
  );
};
