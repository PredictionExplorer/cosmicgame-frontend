import React, { useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Link,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import {
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryRow,
} from "./styled";
import { convertTimestampToDateTime } from "../utils";

const StakedTokensRow = ({
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
      hover
      role="checkbox"
      aria-checked={isItemSelected}
      tabIndex={-1}
      key={row.id}
      selected={isItemSelected}
      onClick={() => handleClick(row.TokenInfo.StakeActionId)}
      sx={{
        cursor: "pointer",
        pointerEvents:
          row.UnstakeTimeStamp * 1000 > new Date().getTime() ? "none" : "auto",
      }}
    >
      <TablePrimaryCell padding="checkbox">
        <Checkbox
          color="primary"
          checked={isItemSelected}
          disabled={row.UnstakeTimeStamp * 1000 > new Date().getTime()}
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
        {row.UnstakeTimeStamp * 1000 <= new Date().getTime() && (
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
  const filtered = list.filter(
    (x) => x.UnstakeTimeStamp * 1000 <= new Date().getTime()
  );
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
    setTimeout(() => {
      setSelected([]);
    }, 3000);
  };
  const onUnstake = async (id: number) => {
    await handleUnstake(id);
    setTimeout(() => {
      setSelected([]);
    }, 3000);
  };
  if (list.length === 0) {
    return <Typography>No tokens yet.</Typography>;
  }
  return (
    <>
      <TablePrimaryContainer>
        <Table>
          <colgroup>
            <col width="1%" />
            <col width="19%" />
            <col width="20%" />
            <col width="20%" />
            <col width="20%" />
            <col width="20%" />
          </colgroup>
          <TablePrimaryHead>
            <TableRow>
              <TableCell padding="checkbox">
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
              </TableCell>
              <TableCell>Stake Datetime</TableCell>
              <TableCell align="center">Token ID</TableCell>
              <TableCell align="center">Stake Action ID</TableCell>
              <TableCell align="center">Unstake Datetime</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TablePrimaryHead>
          <TableBody>
            {list
              .slice((page - 1) * perPage, page * perPage)
              .map((row, index) => (
                <StakedTokensRow
                  key={index}
                  row={row}
                  handleUnstake={onUnstake}
                  isItemSelected={isSelected(row.TokenInfo.StakeActionId)}
                  handleClick={handleClick}
                />
              ))}
          </TableBody>
        </Table>
      </TablePrimaryContainer>{" "}
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
