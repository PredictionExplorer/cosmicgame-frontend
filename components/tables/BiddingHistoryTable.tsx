import React, { useEffect, useState } from 'react';
import { Box, TableBody, Typography, Tooltip, Link } from '@mui/material';
import router from 'next/router';
import { Tr } from 'react-super-responsive-table';
import { usePublicClient } from 'wagmi';
import { formatUnits } from 'viem';

import {
  TablePrimaryContainer,
  TablePrimaryCell,
  TablePrimaryHead,
  TablePrimaryRow,
  TablePrimaryHeadCell,
  TablePrimary,
} from '../styled';
import {
  shortenHex,
  convertTimestampToDateTime,
  formatSeconds,
  getAssetsUrl,
  getRWLKImageUrl,
  getExplorerUrl,
} from '../../utils';

import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import { CustomPagination } from '../common/CustomPagination';
import ERC20_ABI from '../../contracts/CosmicToken.json';
import { useBannedBids } from '../../hooks/useApiQuery';

//------------------------------------------------------------------------------
// Types & Interfaces
//------------------------------------------------------------------------------
interface BidHistory {
  EvtLogId: number;
  TimeStamp: number;
  BidderAddr: string;
  EthPriceEth?: number;
  CstPriceEth?: number;
  BidType: number;
  RoundNum?: number;
  RWalkNFTId?: number;
  NFTDonationTokenAddr?: string;
  NFTDonationTokenId?: number;
  DonatedERC20TokenAddr?: string;
  DonatedERC20TokenAmount?: string;
  Message?: string;
}

interface HistoryRowProps {
  history: BidHistory;
  isBanned: boolean;
  showRound: boolean;
  bidDuration: number;
}

interface HistoryTableProps {
  biddingHistory: BidHistory[];
  perPage: number;
  curPage: number;
  showRound: boolean;
}

interface BiddingHistoryTableProps {
  biddingHistory: BidHistory[];
  showRound?: boolean;
}

//------------------------------------------------------------------------------
// Constants
//------------------------------------------------------------------------------
// Colors for row backgrounds depending on the bid type.
const bidTypeStyles: Record<number, string> = {
  2: 'rgba(0,128,128, 0.1)', // CST Bid
  1: 'rgba(128,128,128, 0.1)', // RWLK Token Bid
  0: 'rgba(0,0,0, 0.1)', // ETH Bid
};

// Labels for displaying the bid type.
const bidTypeLabels: Record<number, string> = {
  2: 'CST Bid',
  1: 'RWLK Token Bid',
  0: 'ETH Bid',
};

//------------------------------------------------------------------------------
// Components
//------------------------------------------------------------------------------

/**
 * HistoryRow
 * Renders a single row within the bidding history table.
 * Includes information about bidder, bid price, timestamp, etc.
 */
const HistoryRow: React.FC<HistoryRowProps> = ({ history, isBanned, showRound, bidDuration }) => {
  const publicClient = usePublicClient();
  const [symbol, setSymbol] = useState('');
  const [decimals, setDecimals] = useState(18);

  useEffect(() => {
    const getSymbol = async () => {
      if (!publicClient) return;
      const tokenAddr = history.DonatedERC20TokenAddr! as `0x${string}`;
      const [sym, dec] = await Promise.all([
        publicClient.readContract({
          address: tokenAddr,
          abi: ERC20_ABI,
          functionName: 'symbol',
        }),
        publicClient.readContract({
          address: tokenAddr,
          abi: ERC20_ABI,
          functionName: 'decimals',
        }),
      ]);
      setSymbol(sym as string);
      setDecimals(Number(dec));
    };

    if (!!history.DonatedERC20TokenAddr && publicClient) {
      getSymbol();
    }
  }, [history.DonatedERC20TokenAddr, publicClient]);

  /**
   * Redirect the user to a page with more details about the specific bid.
   */
  const handleRowClick = () => {
    router.push(`/bid/${history.EvtLogId}`);
  };

  // If the history object is undefined or null, render an empty row.
  if (!history) return <TablePrimaryRow />;

  // Determine the background color and label based on the bid type.
  const backgroundStyle = bidTypeStyles[history.BidType] || 'rgba(0,0,0,0.1)';
  const bidTypeLabel = bidTypeLabels[history.BidType] || 'Unknown Bid';

  // Determine how to display the price.
  const price =
    history.BidType === 2
      ? `${
          (history.CstPriceEth || 0) < 1
            ? (history.CstPriceEth || 0).toFixed(7)
            : (history.CstPriceEth || 0).toFixed(4)
        } CST`
      : `${
          (history.EthPriceEth || 0) < 1
            ? (history.EthPriceEth || 0).toFixed(7)
            : (history.EthPriceEth || 0).toFixed(4)
        } ETH`;

  return (
    <TablePrimaryRow
      sx={{
        cursor: 'pointer',
        background: backgroundStyle,
      }}
      onClick={handleRowClick}
    >
      {/* Timestamp */}
      <TablePrimaryCell sx={{ whiteSpace: 'nowrap' }}>
        {convertTimestampToDateTime(history.TimeStamp, true)}
      </TablePrimaryCell>

      {/* Bidder Address */}
      <TablePrimaryCell>
        <Tooltip title={history.BidderAddr}>
          <Typography sx={{ fontSize: 'inherit !important', fontFamily: 'monospace' }}>
            {shortenHex(history.BidderAddr, 6)}
          </Typography>
        </Tooltip>
      </TablePrimaryCell>

      {/* Price */}
      <TablePrimaryCell align="right">{price}</TablePrimaryCell>

      {/* Round Number (optional) */}
      {showRound && <TablePrimaryCell align="center">{history.RoundNum}</TablePrimaryCell>}

      {/* Bid Type Label */}
      <TablePrimaryCell align="center">{bidTypeLabel}</TablePrimaryCell>

      {/* Bid Duration */}
      <TablePrimaryCell align="center">{formatSeconds(bidDuration)}</TablePrimaryCell>

      {/* Additional Bid Info (NFT, etc.) */}
      <TablePrimaryCell>
        <Typography sx={{ wordBreak: 'break-all' }}>
          {/* If the bid is in RWLK tokens, show the ID and a thumbnail */}
          {history.BidType === 1 && history.RWalkNFTId && (
            <>
              {`Bid was made using RandomWalk Token (ID = ${history.RWalkNFTId})`}
              <img
                src={getRWLKImageUrl(history.RWalkNFTId.toString().padStart(6, '0'))}
                width="32px"
                style={{ verticalAlign: 'middle' }}
                alt="RWLK Token"
              />
            </>
          )}
          {/* If there was a donated token involved */}
          {(!!history.NFTDonationTokenAddr || !!history.DonatedERC20TokenAddr) && (
            <>
              {history.BidType === 2 && 'Bid was made using Cosmic Signature Tokens'}
              {history.BidType === 0 && 'Bid was made using ETH'}
              {!!history.NFTDonationTokenAddr &&
                ` and a token (${shortenHex(
                  history.NFTDonationTokenAddr,
                  6,
                )}) with ID ${history.NFTDonationTokenId} was donated`}
              {!!history.DonatedERC20TokenAddr && (
                <>
                  {` and ${formatUnits(BigInt(history.DonatedERC20TokenAmount || '0'), decimals)}`}{' '}
                  <Link
                    href={getExplorerUrl('token', history.DonatedERC20TokenAddr)}
                    target="_blank"
                    color="inherit"
                  >
                    {symbol}
                  </Link>
                  {' was donated'}
                </>
              )}
            </>
          )}{' '}
        </Typography>
      </TablePrimaryCell>

      {/* Message (hidden if banned) */}
      <TablePrimaryCell>
        {!isBanned && history.Message && (
          <Tooltip title={history.Message}>
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
        )}{' '}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

/**
 * HistoryTable
 * Responsible for rendering the table structure along with banned status.
 * Fetches the list of banned bids on mount.
 * @param biddingHistory Array of bid history objects to display.
 * @param perPage Number of entries per page.
 * @param curPage Current page number.
 * @param showRound Whether to display the round number column.
 */
const HistoryTable: React.FC<HistoryTableProps> = ({
  biddingHistory,
  perPage,
  curPage,
  showRound,
}) => {
  const { data: bannedBids } = useBannedBids();
  const bannedList = bannedBids?.map((x: { bid_id: number }) => x.bid_id) ?? [];

  // Slice the bidding history to show only the current page entries.
  const displayedBids = biddingHistory.slice((curPage - 1) * perPage, curPage * perPage);

  return (
    <TablePrimaryContainer>
      <TablePrimary>
        <colgroup>
          <col width="10%" />
          <col width="15%" />
          <col width="14%" />
          {showRound && <col width="8%" />}
          <col width="9%" />
          <col width="15%" />
          <col width="15%" />
          <col width="20%" />
        </colgroup>

        <TablePrimaryHead>
          <Tr>
            <TablePrimaryHeadCell align="left">Datetime</TablePrimaryHeadCell>
            <TablePrimaryHeadCell align="left">Bidder</TablePrimaryHeadCell>
            <TablePrimaryHeadCell align="right">Price</TablePrimaryHeadCell>
            {showRound && <TablePrimaryHeadCell>Round</TablePrimaryHeadCell>}
            <TablePrimaryHeadCell>Bid Type</TablePrimaryHeadCell>
            <TablePrimaryHeadCell align="center">Bid Duration</TablePrimaryHeadCell>
            <TablePrimaryHeadCell align="left">Bid Info</TablePrimaryHeadCell>
            <TablePrimaryHeadCell align="left">Message</TablePrimaryHeadCell>
          </Tr>
        </TablePrimaryHead>
        <TableBody>
          {displayedBids.map((history, index) => {
            // Calculate the difference between the current and the next (or now) timestamp.
            const bidDuration =
              (curPage - 1) * perPage + index === 0
                ? Date.now() / 1000 - history.TimeStamp
                : (biddingHistory[(curPage - 1) * perPage + index - 1]?.TimeStamp ??
                    history.TimeStamp) - history.TimeStamp;

            return (
              <HistoryRow
                history={history}
                key={history.EvtLogId}
                isBanned={bannedList.includes(history.EvtLogId)}
                showRound={showRound}
                bidDuration={bidDuration}
              />
            );
          })}
        </TableBody>
      </TablePrimary>
    </TablePrimaryContainer>
  );
};

/**
 * BiddingHistoryTable
 * Orchestrates displaying the bidding history, including pagination.
 * @param biddingHistory The complete list of bids.
 * @param showRound Whether to display the round column.
 */
const BiddingHistoryTable: React.FC<BiddingHistoryTableProps> = ({
  biddingHistory,
  showRound = true,
}) => {
  // Items to show per page.
  const perPage = 5;
  // Current pagination page.
  const [curPage, setCurrentPage] = useState(1);

  return (
    <Box mt={2}>
      {biddingHistory.length > 0 ? (
        <>
          <HistoryTable
            biddingHistory={biddingHistory}
            perPage={perPage}
            curPage={curPage}
            showRound={showRound}
          />
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

export default BiddingHistoryTable;
