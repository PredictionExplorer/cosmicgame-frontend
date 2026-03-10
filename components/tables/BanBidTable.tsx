// BanBidTable.tsx
// This component file contains three main parts:
// 1. BanBidTable: The top-level component handling pagination and rendering the HistoryTable.
// 2. HistoryTable: Responsible for displaying a paginated list of bidding history entries.
// 3. HistoryRow: A row component for each bid entry, which includes Ban/Unban functionality.
//
// Usage:
// <BanBidTable biddingHistory={data} />
//
// Dependencies:
// - Material UI for UI components (Box, Table, Button, Tooltip, etc.).
// - React Super Responsive Table for responsive table layout.
// - CustomPagination for paginated displays.
// - Utility functions and API calls for retrieving and updating banned bids.

import React, { useCallback, useEffect, useState } from 'react';
import { Box, TableBody, Link, Typography, Tooltip, Button } from '@mui/material';
import { Tr } from 'react-super-responsive-table';

import {
  TablePrimaryContainer,
  TablePrimaryCell,
  TablePrimaryHead,
  TablePrimaryRow,
  TablePrimaryHeadCell,
  TablePrimary,
} from '../styled';
import { getExplorerUrl, convertTimestampToDateTime } from '../../utils';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import { CustomPagination } from '../common/CustomPagination';
import { AddressLink } from '../common/AddressLink';
import api from '../../services/api';
import { useActiveWeb3React } from '../../hooks/web3';
import { useNotification } from '../../contexts/NotificationContext';
import getErrorMessage from '../../utils/alert';
import { reportError, getEthErrorMessage } from '../../utils/errors';

//------------------------------------------------------------------------------
// TypeScript Interfaces
//------------------------------------------------------------------------------

/**
 * Represents a single bidding history record.
 */
interface BidHistory {
  EvtLogId: number;
  TxHash: string;
  TimeStamp: number;
  RoundNum: number;
  BidType: number;
  BidderAddr: string;
  Message?: string;
}

/**
 * Props for the HistoryRow component.
 */
interface HistoryRowProps {
  history: BidHistory;
  isBanned: boolean;
  updateBannedList: () => Promise<void> | void;
}

/**
 * Props for the HistoryTable component.
 */
interface HistoryTableProps {
  biddingHistory: BidHistory[];
  perPage: number;
  curPage: number;
}

/**
 * Props for the BanBidTable top-level component.
 */
interface BanBidTableProps {
  biddingHistory: BidHistory[];
}

//------------------------------------------------------------------------------
// Components
//------------------------------------------------------------------------------

/**
 * HistoryRow
 * Renders a single bid record in the table, including Ban/Unban functionality.
 */
const HistoryRow: React.FC<HistoryRowProps> = ({ history, isBanned, updateBannedList }) => {
  const { account } = useActiveWeb3React(); // Returns the current user’s connected wallet info.
  const { setNotification } = useNotification(); // For showing success/error messages.

  /**
   * Ban a bid by calling the API, then refresh the banned list.
   */
  const handleBan = async () => {
    try {
      await api.ban_bid(history.EvtLogId, account as string);
      updateBannedList();
      setNotification({
        visible: true,
        type: 'success',
        text: 'Bid was banned successfully!',
      });
    } catch (e) {
      reportError(e, 'ban bid');
      const rawMsg = getEthErrorMessage(e, 'An error occurred');
      if (rawMsg) {
        const msg = getErrorMessage(rawMsg) || rawMsg;
        setNotification({ visible: true, text: msg, type: 'error' });
      }
    }
  };

  /**
   * Unban a bid by calling the API, then refresh the banned list.
   */
  const handleUnban = async () => {
    try {
      await api.unban_bid(history.EvtLogId);
      updateBannedList();
      setNotification({
        visible: true,
        type: 'success',
        text: 'Bid was unbanned successfully!',
      });
    } catch (e) {
      reportError(e, 'unban bid');
      const rawMsg = getEthErrorMessage(e, 'An error occurred');
      if (rawMsg) {
        const msg = getErrorMessage(rawMsg) || rawMsg;
        setNotification({ visible: true, text: msg, type: 'error' });
      }
    }
  };

  // Fallback: If there's no data for this row, return an empty row.
  if (!history) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow
      sx={{
        background:
          history.BidType === 2
            ? 'rgba(0,128,128, 0.1)' // CST Bid
            : history.BidType === 1
              ? 'rgba(128,128,128, 0.1)' // RWLK Token Bid
              : 'rgba(0,0,0, 0.1)', // ETH Bid
      }}
    >
      {/* Date & Tx Link */}
      <TablePrimaryCell>
        <Link
          color="inherit"
          fontSize="inherit"
          href={getExplorerUrl('tx', history.TxHash)}
          target="_blank"
          rel="noopener noreferrer"
        >
          {convertTimestampToDateTime(history.TimeStamp)}
        </Link>
      </TablePrimaryCell>

      {/* Bidder Address Link */}
      <TablePrimaryCell align="center">
        <AddressLink address={history.BidderAddr} url={`/user/${history.BidderAddr}`} />
      </TablePrimaryCell>

      {/* Round Number Link */}
      <TablePrimaryCell align="center">
        <Link
          color="inherit"
          fontSize="inherit"
          href={`/prize/${history.RoundNum}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {history.RoundNum}
        </Link>
      </TablePrimaryCell>

      {/* Bid Type Label */}
      <TablePrimaryCell align="center">
        {history.BidType === 2 ? 'CST Bid' : history.BidType === 1 ? 'RWLK Token Bid' : 'ETH Bid'}
      </TablePrimaryCell>

      {/* Bid Message (truncated with ellipsis if long) */}
      <TablePrimaryCell>
        <Tooltip title={history.Message || ''}>
          <Typography
            sx={{
              fontSize: 'inherit !important',
              maxWidth: '180px',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              display: 'inline-block',
              textOverflow: 'ellipsis',
              lineHeight: 1,
            }}
          >
            {history.Message}
          </Typography>
        </Tooltip>
      </TablePrimaryCell>

      {/* Ban/Unban Button */}
      <TablePrimaryCell align="center">
        {isBanned ? (
          <Button size="small" onClick={handleUnban}>
            Unban
          </Button>
        ) : (
          <Button size="small" onClick={handleBan}>
            Ban
          </Button>
        )}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

/**
 * HistoryTable
 * Displays a table of bidding history items with pagination and ban status.
 */
const HistoryTable: React.FC<HistoryTableProps> = ({ biddingHistory, perPage, curPage }) => {
  // Tracks which bids are banned, fetched from the API.
  const [bannedList, setBannedList] = useState<number[]>([]);

  /**
   * Fetch and store the list of banned bids on component mount.
   */
  const getBannedList = useCallback(async () => {
    const bids = await api.get_banned_bids();
    setBannedList(bids.map((x: { bid_id: number }) => x.bid_id));
  }, []);

  useEffect(() => {
    getBannedList();
  }, [getBannedList]);

  // Render only the subset of items for the current page.
  const displayedBids = biddingHistory.slice((curPage - 1) * perPage, curPage * perPage);

  return (
    <TablePrimaryContainer>
      <TablePrimary>
        <TablePrimaryHead>
          <Tr>
            <TablePrimaryHeadCell align="left">Date</TablePrimaryHeadCell>
            <TablePrimaryHeadCell>Bidder</TablePrimaryHeadCell>
            <TablePrimaryHeadCell>Round</TablePrimaryHeadCell>
            <TablePrimaryHeadCell>Bid Type</TablePrimaryHeadCell>
            <TablePrimaryHeadCell align="left">Message</TablePrimaryHeadCell>
            <TablePrimaryHeadCell />
          </Tr>
        </TablePrimaryHead>
        <TableBody>
          {displayedBids.map((history) => (
            <HistoryRow
              key={history.EvtLogId}
              history={history}
              isBanned={bannedList.includes(history.EvtLogId)}
              updateBannedList={getBannedList}
            />
          ))}
        </TableBody>
      </TablePrimary>
    </TablePrimaryContainer>
  );
};

/**
 * BanBidTable
 * The main component that provides pagination for the bidding history.
 * @param biddingHistory The array of bid entries to display.
 */
const BanBidTable: React.FC<BanBidTableProps> = ({ biddingHistory }) => {
  // Show 200 items per page.
  const perPage = 200;
  // Current page state.
  const [curPage, setCurrentPage] = useState(1);

  return (
    <Box mt={2}>
      {biddingHistory.length > 0 ? (
        <>
          <HistoryTable biddingHistory={biddingHistory} perPage={perPage} curPage={curPage} />
          <CustomPagination
            page={curPage}
            setPage={setCurrentPage}
            totalLength={biddingHistory.length}
            perPage={perPage}
          />
        </>
      ) : (
        <Typography>No bid history yet.</Typography>
      )}
    </Box>
  );
};

export default BanBidTable;
