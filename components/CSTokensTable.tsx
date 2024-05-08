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
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import { Tr } from "react-super-responsive-table";

const CSTokensRow = ({ row, handleStake, isItemSelected, handleClick }) => {
  if (!row) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow
      hover="true"
      role="checkbox"
      tabIndex={-1}
      key={row.id}
      selected={isItemSelected}
      onClick={() => handleClick(row.TokenId)}
      sx={{ cursor: "pointer" }}
    >
      <TablePrimaryCell padding="checkbox">
        <Checkbox color="primary" checked={isItemSelected} size="small" />
      </TablePrimaryCell>
      <TablePrimaryCell>
        {convertTimestampToDateTime(row.TimeStamp)}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <Link
          href={`/detail/${row.TokenId}`}
          sx={{
            color: "inherit",
            fontSize: "inherit",
          }}
          target="_blank"
        >
          {row.TokenId}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <Link
          href={`/prize/${row.RoundNum}`}
          style={{
            color: "inherit",
            fontSize: "inherit",
          }}
          target="_blank"
        >
          {row.RoundNum}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <Link
          href={`/user/${row.WinnerAddr}`}
          sx={{
            color: "inherit",
            fontSize: "inherit",
          }}
          target="_blank"
        >
          {row.WinnerAddr}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {!row.Staked ? (
          <Button
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleStake(row.TokenId);
            }}
          >
            Stake
          </Button>
        ) : (
          " "
        )}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

export const CSTokensTable = ({ list, handleStake, handleStakeMany }) => {
  const perPage = 5;
  const [anchorEl, setAnchorEl] = useState(null);
  const [notification, setNotification] = useState<{
    text: string;
    type: "success" | "info" | "warning" | "error";
    visible: boolean;
  }>({
    visible: false,
    text: "",
    type: "success",
  });
  const [page, setPage] = useState(1);
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
    const newSelected = list.map((n) => n.TokenId);
    setSelected(newSelected);
    setAnchorEl(null);
  };
  const onSelectCurPgClick = () => {
    const newSelected = list
      .slice((page - 1) * perPage, page * perPage)
      .map((n) => n.TokenId);
    setSelected(newSelected);
    setAnchorEl(null);
  };
  const onSelectNoneClick = () => {
    setSelected([]);
    setAnchorEl(null);
  };
  const onStakeMany = async () => {
    const res = await handleStakeMany(
      selected,
      new Array(selected.length).fill(false)
    );
    if (!res.code) {
      setNotification({
        visible: true,
        text: "The selected tokens were staked successfully!",
        type: "success",
      });
    }
  };
  const onStake = async (id: number) => {
    setSelected([id]);
    const res = await handleStake(id, false);
    if (!res.code) {
      setNotification({
        visible: true,
        text: `You have successfully staked token ${id}!`,
        type: "success",
      });
    }
  };
  const handleClose = () => {
    setNotification({ ...notification, visible: false });
  };

  useEffect(() => {
    setSelected([]);
    setPage(1);
  }, [list]);

  if (list.length === 0) {
    return <Typography>No available tokens.</Typography>;
  }
  return (
    <>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        autoHideDuration={10000}
        open={notification.visible}
        onClose={handleClose}
      >
        <Alert
          severity={notification.type}
          variant="filled"
          onClose={handleClose}
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
              <TablePrimaryHeadCell align="left">
                Mint Datetime
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Token ID</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Round</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Winner Address</TablePrimaryHeadCell>
              <TablePrimaryHeadCell />
            </Tr>
          </TablePrimaryHead>
          <TableBody>
            {list
              .slice((page - 1) * perPage, page * perPage)
              .map((row, index) => (
                <CSTokensRow
                  key={index}
                  row={row}
                  handleStake={onStake}
                  isItemSelected={isSelected(row.TokenId)}
                  handleClick={handleClick}
                />
              ))}
          </TableBody>
        </TablePrimary>
      </TablePrimaryContainer>
      {selected.length > 1 && (
        <Box display="flex" justifyContent="end" mt={2}>
          <Button variant="text" onClick={onStakeMany}>
            Stake Many
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
