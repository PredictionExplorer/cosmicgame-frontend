import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Link,
  Pagination,
  Snackbar,
  TableBody,
  Typography,
} from "@mui/material";
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

const StakedTokensRow = ({
  current,
  offset,
  row,
  handleUnstake,
  isItemSelected,
  handleClick,
}) => {
  if (!row) {
    return <TablePrimaryRow></TablePrimaryRow>;
  }
  return (
    <TablePrimaryRow
      hover="true"
      role="checkbox"
      aria-checked={isItemSelected}
      tabIndex={-1}
      key={row.id}
      selected={isItemSelected}
      onClick={() => handleClick(row.TokenInfo.StakeActionId)}
      sx={{
        cursor: "pointer",
        pointerEvents: row.UnstakeTimeStamp > current ? "none" : "auto",
      }}
    >
      <TablePrimaryCell padding="checkbox">
        <Checkbox
          color="primary"
          checked={isItemSelected}
          disabled={row.UnstakeTimeStamp > current}
          size="small"
        />
      </TablePrimaryCell>
      <TablePrimaryCell>
        {convertTimestampToDateTime(row.StakeTimeStamp - offset)}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <Link
          href={`/detail/${row.TokenInfo.TokenId}`}
          sx={{
            color: "inherit",
            fontSize: "inherit",
          }}
          target="_blank"
        >
          {row.TokenInfo.TokenId}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {row.TokenInfo.StakeActionId}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {convertTimestampToDateTime(row.UnstakeTimeStamp - offset)}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {row.UnstakeTimeStamp <= current && (
          <Button
            size="small"
            sx={{ mr: 1 }}
            onClick={(e) => {
              e.stopPropagation();
              handleUnstake(row.TokenInfo.StakeActionId);
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
  const [current, setCurrent] = useState(Infinity);
  const [offset, setOffset] = useState(0);
  const filtered = list.filter((x) => x.UnstakeTimeStamp <= current);
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
  const onSelectAllClick = (e) => {
    if (e.target.checked) {
      const newSelected = filtered.map((n) => n.TokenInfo.StakeActionId);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };
  const onUnstakeMany = async () => {
    await handleUnstakeMany(selected);
    setNotification({
      visible: true,
      text: "The selected tokens were unstaked successfully!",
      type: "success",
    });
  };
  const onUnstake = async (id: number) => {
    setSelected([id]);
    await handleUnstake(id);
    setNotification({
      visible: true,
      text: "The token was unstaked successfully!",
      type: "success",
    });
  };
  useEffect(() => {
    const fetchData = async () => {
      const current = await api.get_current_time();
      const offset = current - Date.now() / 1000;
      setCurrent(current);
      setOffset(offset);
    };
    fetchData();
    setSelected([]);
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
        onClose={() =>
          setNotification({ text: "", type: "success", visible: false })
        }
      >
        <Alert severity={notification.type} variant="filled">
          {notification.text}
        </Alert>
      </Snackbar>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell padding="checkbox" align="left">
                <Checkbox
                  color="info"
                  indeterminate={
                    selected.length > 0 && selected.length < filtered.length
                  }
                  checked={
                    filtered.length > 0 && selected.length === filtered.length
                  }
                  onChange={onSelectAllClick}
                  inputProps={{
                    "aria-label": "select all desserts",
                  }}
                  size="small"
                  sx={{
                    display: {
                      md: "inline-flex",
                      sm: "inline-flex",
                      xs: "none",
                    },
                  }}
                />
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="left">
                Stake Datetime
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Token ID</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Stake Action ID</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Unstake Datetime</TablePrimaryHeadCell>
              <TablePrimaryHeadCell></TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <TableBody>
            {list
              .slice((page - 1) * perPage, page * perPage)
              .map((row, index) => (
                <StakedTokensRow
                  key={index}
                  current={current}
                  offset={offset}
                  row={row}
                  handleUnstake={onUnstake}
                  isItemSelected={isSelected(row.TokenInfo.StakeActionId)}
                  handleClick={handleClick}
                />
              ))}
          </TableBody>
        </TablePrimary>
      </TablePrimaryContainer>
      {selected.length > 0 && (
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
