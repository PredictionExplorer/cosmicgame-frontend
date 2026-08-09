'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { getExplorerUrl, getAssetsUrl, getThumbUrl, shortenHex } from '@/utils';

import { Link } from '@/i18n/navigation';
import { HydrationSafeDateTime } from '@/components/common/HydrationSafeDateTime';
import NFTImage from '@/components/nft/NFTImage';
import { CustomPagination } from '@/components/common/CustomPagination';
import {
  TablePrimary,
  TablePrimaryBody,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from '@/components/styled';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { CSTTokenInfo } from '@/services/api';

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
      <TablePrimaryCell label={t('tokens.table.details')}>
        <Link href={`/detail/${nft.TokenId}`} className="text-inherit">
          <NFTImage src={thumbURL} fallbackSrc={fullURL} />
        </Link>
      </TablePrimaryCell>

      <TablePrimaryCell label={t('tokens.table.datetime')}>
        <a
          className="text-inherit"
          href={getExplorerUrl('tx', nft.TxHash)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <HydrationSafeDateTime timestamp={nft.TimeStamp} locale={locale} />
        </a>
      </TablePrimaryCell>

      <TablePrimaryCell label={t('tokens.table.tokenId')} align="center">
        <Link href={`/detail/${nft.TokenId}`} className="text-inherit">
          {nft.TokenId}
        </Link>
      </TablePrimaryCell>

      <TablePrimaryCell label={t('tokens.table.tokenName')} align="center">
        {nft.TokenName || ' '}
      </TablePrimaryCell>

      <TablePrimaryCell label={t('tokens.table.cycle')} align="center">
        <Link href={`/allocation/${nft.RoundNum}`} className="text-inherit">
          {nft.RoundNum}
        </Link>
      </TablePrimaryCell>

      <TablePrimaryCell
        label={t('tokens.table.recipientAddress')}
        align="center"
        priority="secondary"
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={`/user/${nft.WinnerAddr}`} className="text-inherit font-mono break-all">
              {shortenHex(nft.WinnerAddr ?? '', 6)}
            </Link>
          </TooltipTrigger>
          <TooltipContent>{nft.WinnerAddr}</TooltipContent>
        </Tooltip>
      </TablePrimaryCell>

      <TablePrimaryCell label={t('tokens.table.currentlyAnchored')} align="center">
        {nft.Staked ? t('shared.yes') : t('shared.no')}
      </TablePrimaryCell>

      <TablePrimaryCell label={t('tokens.table.anchoredOnce')} align="center" priority="secondary">
        {nft.WasUnstaked ? t('shared.yes') : t('shared.no')}
      </TablePrimaryCell>

      <TablePrimaryCell label={t('tokens.table.allocationType')} align="right">
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
          <TablePrimaryHead>
            <tr>
              <TablePrimaryHeadCell className="w-[120px]">
                <span className="sr-only">{t('tokens.table.details')}</span>
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="left">{t('tokens.table.datetime')}</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>{t('tokens.table.tokenId')}</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>{t('tokens.table.tokenName')}</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>{t('tokens.table.cycle')}</TablePrimaryHeadCell>
              <TablePrimaryHeadCell priority="secondary">
                {t('tokens.table.recipientAddress')}
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>{t('tokens.table.currentlyAnchored')}</TablePrimaryHeadCell>
              <TablePrimaryHeadCell priority="secondary">
                {t('tokens.table.anchoredOnce')}
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                {t('tokens.table.allocationType')}
              </TablePrimaryHeadCell>
            </tr>
          </TablePrimaryHead>
          <TablePrimaryBody>
            {currentItems.map((nft) => (
              <CSTRow key={nft.EvtLogId} nft={nft} />
            ))}
          </TablePrimaryBody>
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
