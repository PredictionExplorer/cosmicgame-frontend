import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Link,
  Pagination,
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
        />
      </TablePrimaryCell>
      <TablePrimaryCell>
        {convertTimestampToDateTime(row.StakeTimeStamp)}
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
        {convertTimestampToDateTime(row.UnstakeTimeStamp)}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {row.UnstakeTimeStamp <= current && (
          <Button
            variant="text"
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
  const [current, setCurrent] = useState(Infinity);
  const filtered = list.filter((x) => x.UnstakeTimeStamp <= Date.now());
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
  };
  const onUnstake = async (id: number) => {
    setSelected([id]);
    await handleUnstake(id);
  };
  useEffect(() => {
    const fetchData = async () => {
      const current = await api.get_current_time();
      setCurrent(current);
    };
    fetchData();
    setSelected([]);
  }, [list]);

  if (list.length === 0) {
    return <Typography>No tokens yet.</Typography>;
  }
  return (
    <>
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
