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
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import { Tr } from "react-super-responsive-table";

const CSTokensRow = ({ row, handleStake, isItemSelected, handleClick }) => {
  if (!row) {
    return <TablePrimaryRow></TablePrimaryRow>;
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
        <Checkbox color="primary" checked={isItemSelected} />
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
            variant="text"
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
      const newSelected = list.map((n) => n.TokenId);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };
  const onStakeMany = async () => {
    await handleStakeMany(selected);
  };
  const onStake = async (id: number) => {
    setSelected([id]);
    await handleStake(id);
  };

  useEffect(() => {
    setSelected([]);
  }, [list]);

  if (list.length === 0) {
    return <Typography>No available tokens.</Typography>;
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
                    selected.length > 0 && selected.length < list.length
                  }
                  checked={list.length > 0 && selected.length === list.length}
                  onChange={onSelectAllClick}
                  inputProps={{
                    "aria-label": "select all desserts",
                  }}
                />
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="left">
                Mint Datetime
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Token ID</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Round</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Winner Address</TablePrimaryHeadCell>
              <TablePrimaryHeadCell></TablePrimaryHeadCell>
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
      {selected.length > 0 && (
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
