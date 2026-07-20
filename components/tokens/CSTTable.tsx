'use client';

import { useState } from 'react';
import { Tr } from 'react-super-responsive-table';
import { useLocale, useTranslations } from 'next-intl';

import { getExplorerUrl, getAssetsUrl, getThumbUrl, shortenHex } from '@/utils';

import { Link } from '@/i18n/navigation';
import { HydrationSafeDateTime } from '@/components/common/HydrationSafeDateTime';
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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { CSTTokenInfo } from '@/services/api';

import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

function CSTRow({ nft }: { nft: CSTTokenInfo }) {
  const t = useTranslations('myPages');
  const locale = useLocale();
  const seed = nft?.Seed ?? '';
  const thumbURL = getThumbUrl(seed, 'micro');
  const fullURL = getAssetsUrl(`cosmicsignature/0x${seed}.png`);

  if (!nft) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow>
      <TablePrimaryCell className="w-[120px]">
        <Link href={`/detail/${nft.TokenId}`} className="text-inherit">
          <NFTImage src={thumbURL} fallbackSrc={fullURL} />
        </Link>
      </TablePrimaryCell>

      <TablePrimaryCell>
        <a
          className="text-inherit"
          href={getExplorerUrl('tx', nft.TxHash)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <HydrationSafeDateTime timestamp={nft.TimeStamp} locale={locale} />
        </a>
      </TablePrimaryCell>

      <TablePrimaryCell align="center">
        <Link href={`/detail/${nft.TokenId}`} className="text-inherit">
          {nft.TokenId}
        </Link>
      </TablePrimaryCell>

      <TablePrimaryCell align="center">{nft.TokenName || ' '}</TablePrimaryCell>

      <TablePrimaryCell align="center">
        <Link href={`/allocation/${nft.RoundNum}`} className="text-inherit">
          {nft.RoundNum}
        </Link>
      </TablePrimaryCell>

      <TablePrimaryCell align="center">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={`/user/${nft.WinnerAddr}`} className="text-inherit font-mono">
              {shortenHex(nft.WinnerAddr ?? '', 6)}
            </Link>
          </TooltipTrigger>
          <TooltipContent>{nft.WinnerAddr}</TooltipContent>
        </Tooltip>
      </TablePrimaryCell>

      <TablePrimaryCell align="center">
        {nft.Staked ? t('shared.yes') : t('shared.no')}
      </TablePrimaryCell>

      <TablePrimaryCell align="center">
        {nft.WasUnstaked ? t('shared.yes') : t('shared.no')}
      </TablePrimaryCell>

      <TablePrimaryCell align="right">
        {nft.RecordType === 1 ? (
          t('tokens.table.types.stellarSelection')
        ) : nft.RecordType === 2 ? (
          t('tokens.table.types.anchoredNftSelection')
        ) : nft.RecordType === 3 ? (
          <Link href={`/allocation/${nft.RoundNum}`} className="text-inherit">
            {t('tokens.table.types.signatureAllocation', { cycle: nft.RoundNum ?? '' })}
          </Link>
        ) : nft.RecordType === 4 ? (
          t('tokens.table.types.enduranceChampion')
        ) : nft.RecordType === 5 ? (
          t('tokens.table.types.lastCstParticipant')
        ) : (
          ''
        )}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
}

export function CSTTable({ list }: { list: CSTTokenInfo[] }) {
  const t = useTranslations('myPages');
  const [currentPage, setCurrentPage] = useState(1);
  const PER_PAGE = 5;

  if (list.length === 0) {
    return <p>{t('tokens.table.empty')}</p>;
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
              <TablePrimaryHeadCell>
                <span className="sr-only">{t('tokens.table.details')}</span>
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="left">{t('tokens.table.datetime')}</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>{t('tokens.table.tokenId')}</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>{t('tokens.table.tokenName')}</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>{t('tokens.table.cycle')}</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>{t('tokens.table.recipientAddress')}</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>{t('tokens.table.currentlyAnchored')}</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>{t('tokens.table.anchoredOnce')}</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                {t('tokens.table.allocationType')}
              </TablePrimaryHeadCell>
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
