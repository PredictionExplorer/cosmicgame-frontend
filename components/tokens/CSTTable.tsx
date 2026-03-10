'use client';

import { useState } from 'react';
import { Link, TableBody, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import { Tr } from 'react-super-responsive-table';

import { getExplorerUrl, convertTimestampToDateTime, getAssetsUrl, shortenHex } from '@/utils';
import NFTImage from '@/components/nft/NFTImage';
import { CustomPagination } from '@/components/common/CustomPagination';
import {
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from '@/components/styled';

import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

export interface CSTToken {
  EvtLogId: number;
  TxHash: string;
  TimeStamp: number;
  Seed: string;
  TokenId: number;
  TokenName: string | null;
  RoundNum: number;
  WinnerAddr: string;
  Staked: boolean;
  WasUnstaked: boolean;
  RecordType: number;
}

function CSTRow({ nft }: { nft: CSTToken }) {
  const getTokenImageURL = () => getAssetsUrl(`cosmicsignature/0x${nft.Seed}.png`);

  if (!nft) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow>
      <TablePrimaryCell sx={{ width: '120px' }}>
        <Link href={`/detail/${nft.TokenId}`} style={{ color: 'inherit', fontSize: 'inherit' }}>
          <NFTImage src={getTokenImageURL()} />
        </Link>
      </TablePrimaryCell>

      <TablePrimaryCell>
        <Link
          color="inherit"
          fontSize="inherit"
          href={getExplorerUrl('tx', nft.TxHash)}
          target="_blank"
        >
          {convertTimestampToDateTime(nft.TimeStamp)}
        </Link>
      </TablePrimaryCell>

      <TablePrimaryCell align="center">
        <Link href={`/detail/${nft.TokenId}`} style={{ color: 'inherit', fontSize: 'inherit' }}>
          {nft.TokenId}
        </Link>
      </TablePrimaryCell>

      <TablePrimaryCell align="center">{nft.TokenName || ' '}</TablePrimaryCell>

      <TablePrimaryCell align="center">
        <Link href={`/prize/${nft.RoundNum}`} style={{ color: 'inherit', fontSize: 'inherit' }}>
          {nft.RoundNum}
        </Link>
      </TablePrimaryCell>

      <TablePrimaryCell align="center">
        <Tooltip title={nft.WinnerAddr}>
          <Link
            href={`/user/${nft.WinnerAddr}`}
            style={{
              color: 'inherit',
              fontSize: 'inherit',
              fontFamily: 'monospace',
            }}
          >
            {shortenHex(nft.WinnerAddr, 6)}
          </Link>
        </Tooltip>
      </TablePrimaryCell>

      <TablePrimaryCell align="center">{nft.Staked ? 'Yes' : 'No'}</TablePrimaryCell>

      <TablePrimaryCell align="center">{nft.WasUnstaked ? 'Yes' : 'No'}</TablePrimaryCell>

      <TablePrimaryCell align="right">
        {nft.RecordType === 1 ? (
          'Raffle NFT Token'
        ) : nft.RecordType === 2 ? (
          'Staking RandomWalk NFT'
        ) : nft.RecordType === 3 ? (
          <Link href={`/prize/${nft.RoundNum}`} style={{ color: 'inherit', fontSize: 'inherit' }}>
            Main Prize Winner (#{nft.RoundNum})
          </Link>
        ) : nft.RecordType === 4 ? (
          'Endurance Champion'
        ) : nft.RecordType === 5 ? (
          'Last CST Bidder'
        ) : (
          ''
        )}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
}

export function CSTTable({ list }: { list: CSTToken[] }) {
  const theme = useTheme();
  const isMobileView = useMediaQuery(theme.breakpoints.down('sm'));
  const [currentPage, setCurrentPage] = useState(1);
  const PER_PAGE = 5;

  if (list.length === 0) {
    return <Typography>No tokens yet.</Typography>;
  }

  const startIndex = (currentPage - 1) * PER_PAGE;
  const endIndex = currentPage * PER_PAGE;
  const currentItems = list.slice(startIndex, endIndex);

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          {!isMobileView && (
            <colgroup>
              <col width="10%" />
              <col width="15%" />
              <col width="9%" />
              <col width="10%" />
              <col width="8%" />
              <col width="16%" />
              <col width="8%" />
              <col width="8%" />
              <col width="16%" />
            </colgroup>
          )}
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell />
              <TablePrimaryHeadCell align="left">Datetime</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Token ID</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Token Name</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Round</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Winner Address</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Currently Staked?</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Staked Once?</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">Prize Type</TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <TableBody>
            {currentItems.map((nft) => (
              <CSTRow key={nft.EvtLogId} nft={nft} />
            ))}
          </TableBody>
        </TablePrimary>
      </TablePrimaryContainer>

      <CustomPagination
        page={currentPage}
        setPage={setCurrentPage}
        totalLength={list.length}
        perPage={PER_PAGE}
      />
    </>
  );
}
