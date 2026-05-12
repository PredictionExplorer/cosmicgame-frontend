import { useEffect, useState, type FC } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { Tr } from 'react-super-responsive-table';

import { getExplorerUrl, convertTimestampToDateTime, shortenHex } from '@/utils';

import {
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from '@/components/styled';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import NFTImage from '@/components/nft/NFTImage';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import { CustomPagination } from '@/components/common/CustomPagination';
import { reportError } from '@/utils/errors';

export interface NFTRecord {
  RecordId: string | number;
  TxHash: string;
  TimeStamp: number;
  DonorAddr: string;
  RoundNum: number;
  TokenAddr: string;
  TokenId?: string | number;
  NFTTokenId?: string | number;
  NFTTokenURI?: string;
  WinnerAddr?: string;
  Index: number;
}

interface NFTRowProps {
  nft: NFTRecord;
  handleClaim?: (tokenIndex: number) => void | Promise<void>;
  claimingTokens: number[];
}

interface DonatedNFTTableProps {
  list: NFTRecord[];
  handleClaim?: (tokenIndex: number) => void | Promise<void>;
  claimingTokens: number[];
}

const NFTRow: FC<NFTRowProps> = ({ nft, handleClaim, claimingTokens }) => {
  const [tokenURI, setTokenURI] = useState<{ image?: string; external_url?: string } | null>(null);

  useEffect(() => {
    const fetchTokenMetadata = async () => {
      try {
        const { data } = await axios.get(nft.NFTTokenURI!);
        setTokenURI(data);
      } catch (error) {
        reportError(error, 'fetch attached NFT token URI');
      }
    };

    if (nft.NFTTokenURI) {
      fetchTokenMetadata();
    }
  }, [nft.NFTTokenURI]);

  if (!nft) return <TablePrimaryRow />;

  const isClaiming = claimingTokens.includes(nft.Index);

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        <a
          className="text-inherit text-[inherit]"
          href={getExplorerUrl('tx', nft.TxHash)}
          target="_blank"
          rel="noopener noreferrer"
        >
          {convertTimestampToDateTime(nft.TimeStamp)}
        </a>
      </TablePrimaryCell>

      <TablePrimaryCell>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href={`/user/${nft.DonorAddr}`}
              className="text-inherit text-[inherit] font-mono"
              target="_blank"
              rel="noopener noreferrer"
            >
              {shortenHex(nft.DonorAddr, 6)}
            </Link>
          </TooltipTrigger>
          <TooltipContent>{nft.DonorAddr}</TooltipContent>
        </Tooltip>
      </TablePrimaryCell>

      <TablePrimaryCell align="center">
        <Link
          href={`/allocation/${nft.RoundNum}`}
          className="text-inherit text-[inherit]"
          target="_blank"
          rel="noopener noreferrer"
        >
          {nft.RoundNum}
        </Link>
      </TablePrimaryCell>

      <TablePrimaryCell>
        <Tooltip>
          <TooltipTrigger asChild>
            <a
              href={getExplorerUrl('address', nft.TokenAddr)}
              className="text-inherit text-[inherit] font-mono"
              target="_blank"
              rel="noopener noreferrer"
            >
              {shortenHex(nft.TokenAddr, 6)}
            </a>
          </TooltipTrigger>
          <TooltipContent>{nft.TokenAddr}</TooltipContent>
        </Tooltip>
      </TablePrimaryCell>

      <TablePrimaryCell align="center">
        {tokenURI?.external_url ? (
          <a
            href={tokenURI.external_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-inherit text-[inherit]"
          >
            {nft.NFTTokenId || nft.TokenId}
          </a>
        ) : (
          nft.NFTTokenId || nft.TokenId
        )}
      </TablePrimaryCell>

      <TablePrimaryCell className="w-[130px]">
        {tokenURI?.image ? (
          <a href={tokenURI.external_url} target="_blank" rel="noopener noreferrer">
            <NFTImage src={tokenURI.image} />
          </a>
        ) : (
          <span className="text-sm text-muted-foreground">Image not available</span>
        )}
      </TablePrimaryCell>

      {handleClaim && (
        <TablePrimaryCell>
          {!nft.WinnerAddr && (
            <Button
              onClick={() => handleClaim(nft.Index)}
              disabled={isClaiming}
              data-testid="Claim Button"
            >
              {isClaiming ? 'Claiming...' : 'Claim'}
            </Button>
          )}
        </TablePrimaryCell>
      )}
    </TablePrimaryRow>
  );
};

const DonatedNFTTable: FC<DonatedNFTTableProps> = ({ list, handleClaim, claimingTokens }) => {
  const perPage = 5;
  const [page, setPage] = useState<number>(1);

  if (!list || list.length === 0) {
    return <p>No attached NFTs yet.</p>;
  }

  const pageSlice = list.slice((page - 1) * perPage, page * perPage);

  return (
    <>
      <div className="print:hidden">
        <TablePrimaryContainer>
          <TablePrimary>
            <TablePrimaryHead>
              <Tr>
                <TablePrimaryHeadCell align="left">Datetime</TablePrimaryHeadCell>
                <TablePrimaryHeadCell align="left">Contributor Address</TablePrimaryHeadCell>
                <TablePrimaryHeadCell>Round #</TablePrimaryHeadCell>
                <TablePrimaryHeadCell align="left">Token Address</TablePrimaryHeadCell>
                <TablePrimaryHeadCell>Token ID</TablePrimaryHeadCell>
                <TablePrimaryHeadCell>Token Image</TablePrimaryHeadCell>
                {handleClaim && (
                  <TablePrimaryHeadCell>
                    <span className="sr-only">Actions</span>
                  </TablePrimaryHeadCell>
                )}
              </Tr>
            </TablePrimaryHead>
            <tbody>
              {pageSlice.map((nft, i) => (
                <NFTRow
                  key={page * perPage + i}
                  nft={nft}
                  handleClaim={handleClaim}
                  claimingTokens={claimingTokens}
                />
              ))}
            </tbody>
          </TablePrimary>
        </TablePrimaryContainer>

        <CustomPagination page={page} setPage={setPage} totalLength={list.length} perPage={perPage} />
      </div>
      <AttachedNFTPrintFallback list={list} />
    </>
  );
};

/** Plain table for Save as PDF (Skia often drops responsive-table output). */
function AttachedNFTPrintFallback({ list }: { list: NFTRecord[] }) {
  return (
    <div
      aria-hidden="true"
      className="hidden rounded-md border-2 border-foreground/40 bg-background p-4 text-sm text-foreground shadow-none [print-color-adjust:exact] print:block"
      data-attached-nft-print
    >
      <table className="w-full border-collapse border border-foreground/25 text-xs">
        <thead>
          <tr>
            <th scope="col" className="border border-foreground/20 p-2 text-left font-semibold">
              Datetime
            </th>
            <th scope="col" className="border border-foreground/20 p-2 text-left font-semibold">
              Contributor Address
            </th>
            <th scope="col" className="border border-foreground/20 p-2 text-center font-semibold">
              Round #
            </th>
            <th scope="col" className="border border-foreground/20 p-2 text-left font-semibold">
              Token Address
            </th>
            <th scope="col" className="border border-foreground/20 p-2 text-center font-semibold">
              Token ID
            </th>
            <th scope="col" className="border border-foreground/20 p-2 text-left font-semibold">
              Token URI
            </th>
          </tr>
        </thead>
        <tbody>
          {list.map((nft) => (
            <tr key={String(nft.RecordId)}>
              <td className="border border-foreground/15 p-2">
                {convertTimestampToDateTime(nft.TimeStamp)}
              </td>
              <td className="border border-foreground/15 p-2 font-mono break-all">{nft.DonorAddr}</td>
              <td className="border border-foreground/15 p-2 text-center">{nft.RoundNum}</td>
              <td className="border border-foreground/15 p-2 font-mono break-all">{nft.TokenAddr}</td>
              <td className="border border-foreground/15 p-2 text-center">
                {String(nft.NFTTokenId ?? nft.TokenId ?? '—')}
              </td>
              <td className="border border-foreground/15 p-2 break-all">
                {nft.NFTTokenURI ?? '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DonatedNFTTable;
