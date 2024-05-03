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
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import { Tr } from "react-super-responsive-table";
import api from "../services/api";

const RWLKNFTRow = ({ tokenId, handleStake, isItemSelected, handleClick }) => {
  const [tokenInfo, setTokenInfo] = useState(null);
  useEffect(() => {
    const fetchTokenData = async () => {
      const res = await api.get_info(tokenId);
      setTokenInfo(res);
    };
    fetchTokenData();
  }, []);
  return (
    <TablePrimaryRow
      hover="true"
      role="checkbox"
      tabIndex={-1}
      key={tokenId}
      selected={isItemSelected}
      onClick={() => handleClick(tokenId)}
      sx={{ cursor: "pointer" }}
    >
      <TablePrimaryCell padding="checkbox">
        <Checkbox color="primary" checked={isItemSelected} size="small" />
      </TablePrimaryCell>
      <TablePrimaryCell>
        <Link
          href={`/user/${tokenInfo?.CurOwnerAddr}`}
          sx={{ color: "inherit", fontSize: "inherit" }}
        >
          {tokenInfo?.CurOwnerAddr}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">{tokenId}</TablePrimaryCell>
      <TablePrimaryCell align="center">
        <Button
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            handleStake(tokenId);
          }}
        >
          Stake
        </Button>
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

export const RWLKNFTTable = ({ list, handleStake, handleStakeMany }) => {
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
      setSelected(list);
      return;
    }
    setSelected([]);
  };
  const onStakeMany = async () => {
    const res = await handleStakeMany(
      selected,
      new Array(selected.length).fill(true)
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
    const res = await handleStake(id, true);
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
                Owner Address
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Token ID</TablePrimaryHeadCell>
              <TablePrimaryHeadCell />
            </Tr>
          </TablePrimaryHead>
          <TableBody>
            {list
              .slice((page - 1) * perPage, page * perPage)
              .map((tokenId, index) => (
                <RWLKNFTRow
                  key={index}
                  tokenId={tokenId}
                  handleStake={onStake}
                  isItemSelected={isSelected(tokenId)}
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