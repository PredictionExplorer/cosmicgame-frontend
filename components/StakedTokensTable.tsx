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
import NFTImage from "./NFTImage";

const StakedTokensRow = ({
  offset,
  row,
  handleUnstake,
  isItemSelected,
  handleClick,
}) => {
  const getTokenImageURL = () => {
    const fileName = row.TokenInfo.TokenId.toString().padStart(6, "0");
    if (row.StakedIsRandomWalk) {
      return `https://randomwalknft.s3.us-east-2.amazonaws.com/${fileName}_black_thumb.jpg`;
    }
    return `https://cosmic-game2.s3.us-east-2.amazonaws.com/${fileName}.png`;
  };
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
      onClick={() => handleClick(row.TokenInfo.StakeActionId)}
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
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <Link
          href={
            row.StakedIsRandomWalk
              ? `https://randomwalknft.com/detail/${row.TokenInfo.TokenId}`
              : `/detail/${row.TokenInfo.TokenId}`
          }
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
        {row.StakedIsRandomWalk ? "Yes" : "No"}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <Link
          href={`/prize/${row.TokenInfo.RoundNum}`}
          sx={{
            color: "inherit",
            fontSize: "inherit",
          }}
          target="_blank"
        >
          {row.TokenInfo.RoundNum}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {row.TokenInfo.StakeActionId}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {convertTimestampToDateTime(row.StakeTimeStamp - offset)}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {convertTimestampToDateTime(row.UnstakeTimeStamp - offset)}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {row.UnstakeTimeStamp <= Date.now() / 1000 + offset && (
          <Button
            size="small"
            sx={{ mr: 1 }}
            onClick={(e) => {
              e.stopPropagation();
              handleUnstake(row.TokenInfo.StakeActionId, row.TokenInfo.TokenId);
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
  const [offset, setOffset] = useState(0);
  const filtered = list.filter(
    (x) => x.UnstakeTimeStamp <= Date.now() / 1000 + offset
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
    const res = await handleUnstakeMany(selected);
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
    const res = await handleUnstake(actionId);
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
              <TablePrimaryHeadCell>Token Image</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Token ID</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Is RandomWalk NFT?</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Round</TablePrimaryHeadCell>
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
                  key={index}
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
