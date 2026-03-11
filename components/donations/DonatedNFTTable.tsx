import { useEffect, useState, type FC } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { Tr } from 'react-super-responsive-table';

import { getExplorerUrl, convertTimestampToDateTime, formatSeconds, shortenHex } from '@/utils';

import {
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from '@/components/styled';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import NFTImage from '@/components/nft/NFTImage';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import { CustomPagination } from '@/components/common/CustomPagination';
import useRaffleWalletContract from '@/hooks/useRaffleWalletContract';
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

  const [roundTimeoutTimesToWithdrawPrizes, setRoundTimeoutTimesToWithdrawPrizes] = useState(0);
  const raffleWalletContract = useRaffleWalletContract();

  useEffect(() => {
    if (!raffleWalletContract) return;
    const fetchRoundTimeoutTimesToWithdrawPrizes = async () => {
      const roundTimeoutTimesToWithdrawPrizes =
        await raffleWalletContract.read.roundTimeoutTimesToWithdrawPrizes?.([nft.RoundNum]);
      setRoundTimeoutTimesToWithdrawPrizes(Number(roundTimeoutTimesToWithdrawPrizes ?? 0));
    };
    fetchRoundTimeoutTimesToWithdrawPrizes();
  }, [raffleWalletContract, nft.RoundNum]);

  useEffect(() => {
    const fetchTokenMetadata = async () => {
      try {
        const { data } = await axios.get(nft.NFTTokenURI!);
        setTokenURI(data);
      } catch (error) {
        reportError(error, 'fetch donated NFT token URI');
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
        <TooltipProvider>
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
        </TooltipProvider>
      </TablePrimaryCell>

      <TablePrimaryCell align="center">
        <Link
          href={`/prize/${nft.RoundNum}`}
          className="text-inherit text-[inherit]"
          target="_blank"
          rel="noopener noreferrer"
        >
          {nft.RoundNum}
        </Link>
      </TablePrimaryCell>

      <TablePrimaryCell>
        <TooltipProvider>
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
        </TooltipProvider>
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

      {/* eslint-disable react-hooks/purity */}
      <TablePrimaryCell align="center">
        {convertTimestampToDateTime(roundTimeoutTimesToWithdrawPrizes)}{' '}
        {roundTimeoutTimesToWithdrawPrizes < Date.now() / 1000
          ? '(Expired)'
          : `(${formatSeconds(roundTimeoutTimesToWithdrawPrizes - Math.ceil(Date.now() / 1000))})`}
      </TablePrimaryCell>
      {/* eslint-enable react-hooks/purity */}

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
    return <p>No donated NFTs yet.</p>;
  }

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">Datetime</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="left">Donor Address</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Round #</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="left">Token Address</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Token ID</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Expiration Date</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Token Image</TablePrimaryHeadCell>
              {handleClaim && <TablePrimaryHeadCell></TablePrimaryHeadCell>}
            </Tr>
          </TablePrimaryHead>
          <tbody>
            {list.slice((page - 1) * perPage, page * perPage).map((nft, i) => (
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
    </>
  );
};

export default DonatedNFTTable;
