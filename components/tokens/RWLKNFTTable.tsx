import { useEffect, useState, useMemo, type MouseEvent } from 'react';
import { Box, Button, Checkbox, Menu, MenuItem, TableBody, Typography } from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

import {
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from '@/components/styled';

import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import { Tr } from 'react-super-responsive-table';

import { CustomPagination } from '@/components/common/CustomPagination';
import { AddressLink } from '@/components/common/AddressLink';

// Reuse this constant to avoid re-declaring on each render
const ITEMS_PER_PAGE = 5;

interface RWLKRowProps {
  tokenId: number;
  ownerAddress: string;
  onSelectToggle: (id: number) => void;
  isSelected: boolean;
  onStake: (tokenId: number) => void;
}

/* ------------------------------------------------------------------
  Single Row Component: RWLKRow
------------------------------------------------------------------ */
const RWLKRow = ({ tokenId, ownerAddress, onSelectToggle, isSelected, onStake }: RWLKRowProps) => {
  // Handlers
  const handleRowClick = () => onSelectToggle(tokenId);

  const handleStakeClick = (e: MouseEvent) => {
    e.stopPropagation();
    onStake(tokenId);
  };

  return (
    <TablePrimaryRow
      role="checkbox"
      tabIndex={-1}
      selected={isSelected}
      onClick={handleRowClick}
      sx={{ cursor: 'pointer' }}
    >
      {/* Checkbox */}
      <TablePrimaryCell padding="checkbox">
        <Checkbox color="primary" checked={isSelected} size="small" />
      </TablePrimaryCell>

      {/* Owner Address */}
      <TablePrimaryCell>
        <AddressLink address={ownerAddress} url={`/user/${ownerAddress}`} />
      </TablePrimaryCell>

      {/* Token ID */}
      <TablePrimaryCell align="center">{tokenId}</TablePrimaryCell>

      {/* Stake Action */}
      <TablePrimaryCell align="center">
        <Button size="small" onClick={handleStakeClick}>
          Stake
        </Button>
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

interface RWLKNFTTableProps {
  list: number[];
  ownerAddress: string;
  handleStake: (tokenId: number, isRwlk: boolean) => Promise<void>;
  handleStakeMany: (tokenIds: number[], isRwlkFlags: boolean[]) => Promise<void>;
}

/* ------------------------------------------------------------------
  Main Table Component: RWLKNFTTable
------------------------------------------------------------------ */
export const RWLKNFTTable = ({
  list,
  ownerAddress,
  handleStake,
  handleStakeMany,
}: RWLKNFTTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Menu anchor for "Select All / Current Page / None"
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  // Keep track of selected token IDs
  const [selectedTokenIds, setSelectedTokenIds] = useState<number[]>([]);

  // Reset state when the list changes
  useEffect(() => {
    setSelectedTokenIds([]);
    setCurrentPage(1);
  }, [list]);

  // Sliced data for the current page
  const currentPageData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = currentPage * ITEMS_PER_PAGE;
    return list.slice(startIndex, endIndex);
  }, [list, currentPage]);

  // Selection Logic
  const isSelected = (id: number) => selectedTokenIds.includes(id);

  const handleSelectToggle = (id: number) => {
    setSelectedTokenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  // "Select All" tokens
  const handleSelectAll = () => {
    setSelectedTokenIds([...list]);
    setAnchorEl(null);
  };

  // "Select Current Page"
  const handleSelectCurrentPage = () => {
    setSelectedTokenIds([...currentPageData]);
    setAnchorEl(null);
  };

  // "Select None"
  const handleSelectNone = () => {
    setSelectedTokenIds([]);
    setAnchorEl(null);
  };

  // Single Stake
  const handleSingleStake = async (tokenId: number) => {
    await handleStake(tokenId, true); // 'true' indicates RWLK
  };

  // Many Stake
  const handleManyStake = async () => {
    // Create an array of booleans for the second argument if needed
    await handleStakeMany(selectedTokenIds, Array(selectedTokenIds.length).fill(true));
  };

  // If no tokens are in the list, show a message
  if (list.length === 0) {
    return <Typography>No available tokens.</Typography>;
  }

  /* ------------------------------------------------------------------
    Render
  ------------------------------------------------------------------ */
  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <colgroup>
            <col width="5%" />
            <col width="50%" />
            <col width="25%" />
            <col width="20%" />
          </colgroup>

          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell padding="checkbox" align="left">
                <Box
                  sx={{
                    display: { md: 'flex', sm: 'flex', xs: 'none' },
                    alignItems: 'center',
                    cursor: 'pointer',
                  }}
                  onClick={(e: MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget)}
                >
                  <Checkbox
                    color="info"
                    size="small"
                    indeterminate={
                      selectedTokenIds.length > 0 && selectedTokenIds.length < list.length
                    }
                    checked={list.length > 0 && selectedTokenIds.length === list.length}
                  />
                  {anchorEl ? <ExpandLess /> : <ExpandMore />}
                </Box>
                <Menu
                  elevation={0}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'center' }}
                  anchorEl={anchorEl}
                  keepMounted
                  open={Boolean(anchorEl)}
                  onClose={() => setAnchorEl(null)}
                >
                  <MenuItem style={{ minWidth: 166 }} onClick={handleSelectAll}>
                    <Typography>Select All</Typography>
                  </MenuItem>
                  <MenuItem style={{ minWidth: 166 }} onClick={handleSelectCurrentPage}>
                    <Typography>Select Current Page</Typography>
                  </MenuItem>
                  <MenuItem style={{ minWidth: 166 }} onClick={handleSelectNone}>
                    <Typography>Select None</Typography>
                  </MenuItem>
                </Menu>
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="left">Owner Address</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Token ID</TablePrimaryHeadCell>
              <TablePrimaryHeadCell />
            </Tr>
          </TablePrimaryHead>

          {/* Table Body */}
          <TableBody>
            {currentPageData.map((tokenId) => (
              <RWLKRow
                key={tokenId}
                tokenId={tokenId}
                ownerAddress={ownerAddress}
                onSelectToggle={handleSelectToggle}
                isSelected={isSelected(tokenId)}
                onStake={handleSingleStake}
              />
            ))}
          </TableBody>
        </TablePrimary>
      </TablePrimaryContainer>

      {/* Stake Many Button */}
      {selectedTokenIds.length > 1 && (
        <Box display="flex" justifyContent="flex-end" mt={2}>
          <Button variant="text" onClick={handleManyStake}>
            Stake Many
          </Button>
        </Box>
      )}

      {/* Pagination */}
      <CustomPagination
        page={currentPage}
        setPage={setCurrentPage}
        totalLength={list.length}
        perPage={ITEMS_PER_PAGE}
      />
    </>
  );
};
