'use client';

import { useState } from 'react';
import Link from 'next/link';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
      <TablePrimaryCell className="w-[120px]">
        <Link href={`/detail/${nft.TokenId}`} className="text-inherit">
          <NFTImage src={getTokenImageURL()} />
        </Link>
      </TablePrimaryCell>

      <TablePrimaryCell>
        <a
          className="text-inherit"
          href={getExplorerUrl('tx', nft.TxHash)}
          target="_blank"
          rel="noopener noreferrer"
        >
          {convertTimestampToDateTime(nft.TimeStamp)}
        </a>
      </TablePrimaryCell>

      <TablePrimaryCell align="center">
        <Link href={`/detail/${nft.TokenId}`} className="text-inherit">
          {nft.TokenId}
        </Link>
      </TablePrimaryCell>

      <TablePrimaryCell align="center">{nft.TokenName || ' '}</TablePrimaryCell>

      <TablePrimaryCell align="center">
        <Link href={`/prize/${nft.RoundNum}`} className="text-inherit">
          {nft.RoundNum}
        </Link>
      </TablePrimaryCell>

      <TablePrimaryCell align="center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href={`/user/${nft.WinnerAddr}`} className="text-inherit font-mono">
                {shortenHex(nft.WinnerAddr, 6)}
              </Link>
            </TooltipTrigger>
            <TooltipContent>{nft.WinnerAddr}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TablePrimaryCell>

      <TablePrimaryCell align="center">{nft.Staked ? 'Yes' : 'No'}</TablePrimaryCell>

      <TablePrimaryCell align="center">{nft.WasUnstaked ? 'Yes' : 'No'}</TablePrimaryCell>

      <TablePrimaryCell align="right">
        {nft.RecordType === 1 ? (
          'Raffle NFT Token'
        ) : nft.RecordType === 2 ? (
          'Staking RandomWalk NFT'
        ) : nft.RecordType === 3 ? (
          <Link href={`/prize/${nft.RoundNum}`} className="text-inherit">
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
  const [currentPage, setCurrentPage] = useState(1);
  const PER_PAGE = 5;

  if (list.length === 0) {
    return <p>No tokens yet.</p>;
  }

  const startIndex = (currentPage - 1) * PER_PAGE;
  const endIndex = currentPage * PER_PAGE;
  const currentItems = list.slice(startIndex, endIndex);

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
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
          <tbody>
            {currentItems.map((nft) => (
              <CSTRow key={nft.EvtLogId} nft={nft} />
            ))}
          </tbody>
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
