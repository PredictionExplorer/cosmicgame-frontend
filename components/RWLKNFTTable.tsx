import React, { useEffect, useState, useMemo } from "react";
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
import { isMobile } from "react-device-detect";

// Moved perPage outside the component to avoid re-declaration on every render
const perPage = 5;

// Memoized RWLKNFTRow to prevent unnecessary re-renders
const RWLKNFTRow = ({
  tokenId,
  tokenInfo,
  handleStake,
  isItemSelected,
  handleClick,
}) => {
  if (!tokenInfo) {
    // Display a placeholder or loading state if tokenInfo is not yet available
    return null;
  }

  const onRowClick = () => handleClick(tokenId);

  const onStakeClick = (e) => {
    e.stopPropagation();
    handleStake(tokenId);
  };

  return (
    <TablePrimaryRow
      hover="true"
      role="checkbox"
      tabIndex={-1}
      key={tokenId}
      selected={isItemSelected}
      onClick={onRowClick}
      sx={{ cursor: "pointer" }}
    >
      <TablePrimaryCell padding="checkbox">
        <Checkbox color="primary" checked={isItemSelected} size="small" />
      </TablePrimaryCell>
      <TablePrimaryCell>
        <AddressLink
          address={tokenInfo.CurOwnerAddr}
          url={`/user/${tokenInfo.CurOwnerAddr}`}
        />
      </TablePrimaryCell>
      <TablePrimaryCell align="center">{tokenId}</TablePrimaryCell>
      <TablePrimaryCell align="center">
        <Button size="small" onClick={onStakeClick}>
          Stake
        </Button>
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

export const RWLKNFTTable = ({ list, handleStake, handleStakeMany }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<number[]>([]);
  const [tokenData, setTokenData] = useState<{ [key: number]: any }>({});

  // Memoized functions to prevent unnecessary re-creations
  const isSelected = (id: number) => selected.includes(id);

  const handleClick = (id: number) => {
    setSelected((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((selectedId) => selectedId !== id)
        : [...prevSelected, id]
    );
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
    await handleStakeMany(selected, Array(selected.length).fill(true));
  };

  const onStake = async (id: number) => {
    await handleStake(id, true);
  };

  useEffect(() => {
    setSelected([]);
    setPage(1);
  }, [list]);

  // Fetch all token data in a single batch to optimize API calls
  useEffect(() => {
    const fetchTokenData = async () => {
      const data = await Promise.all(
        list.map((tokenId) => api.get_info(tokenId))
      );
      const tokenDataMap = list.reduce((acc, tokenId, index) => {
        acc[tokenId] = data[index];
        return acc;
      }, {});
      setTokenData(tokenDataMap);
    };
    if (list.length > 0) {
      fetchTokenData();
    }
  }, [list]);

  const paginatedList = useMemo(
    () => list.slice((page - 1) * perPage, page * perPage),
    [list, page]
  );

  if (list.length === 0) {
    return <Typography>No available tokens.</Typography>;
  }

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          {!isMobile && (
            <colgroup>
              <col width="5%" />
              <col width="50%" />
              <col width="30%" />
              <col width="10%" />
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
              <TablePrimaryHeadCell align="left">
                Owner Address
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Token ID</TablePrimaryHeadCell>
              <TablePrimaryHeadCell />
            </Tr>
          </TablePrimaryHead>
          <TableBody>
            {paginatedList.map((tokenId) => (
              <RWLKNFTRow
                key={tokenId}
                tokenId={tokenId}
                tokenInfo={tokenData[tokenId]}
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
