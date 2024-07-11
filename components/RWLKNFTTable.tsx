import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
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
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import { Tr } from "react-super-responsive-table";
import api from "../services/api";
import { CustomPagination } from "./CustomPagination";
import { AddressLink } from "./AddressLink";

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
        <AddressLink
          address={tokenInfo?.CurOwnerAddr}
          url={`/user/${tokenInfo?.CurOwnerAddr}`}
        />
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
  const [anchorEl, setAnchorEl] = useState(null);
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
    setSelected(list);
    setAnchorEl(null);
  };
  const onSelectCurPgClick = () => {
    const newSelected = list.slice((page - 1) * perPage, page * perPage);
    setSelected(newSelected);
    setAnchorEl(null);
  };
  const onSelectNoneClick = () => {
    setSelected([]);
    setAnchorEl(null);
  };
  const onStakeMany = async () => {
    await handleStakeMany(selected, new Array(selected.length).fill(true));
  };
  const onStake = async (id: number) => {
    setSelected([id]);
    await handleStake(id, true);
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
      <CustomPagination
        page={page}
        setPage={setPage}
        totalLength={list.length}
        perPage={perPage}
      />
    </>
  );
};
