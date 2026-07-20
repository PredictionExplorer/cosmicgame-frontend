'use client';

import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

import { useState } from 'react';
import { Tr } from 'react-super-responsive-table';
import { useLocale, useTranslations } from 'next-intl';

import { getExplorerUrl } from '@/utils';

import { Link } from '@/i18n/navigation';
import { HydrationSafeDateTime } from '@/components/common/HydrationSafeDateTime';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageShell } from '@/components/ui/page-shell';
import { SectionEyebrow } from '@/components/ui/section-eyebrow';
import {
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from '@/components/styled';
import { useUsedRWLKNFTs } from '@/hooks/useApiQuery';
import { CustomPagination } from '@/components/common/CustomPagination';

interface UsedRwlkNftRecord {
  RWalkTokenId: number;
  BidderAddr: string;
  RoundNum: number;
  TxHash: string;
  TimeStamp: number;
  [key: string]: unknown;
}

const UsedRwlkNftRow = ({ nft }: { nft: UsedRwlkNftRecord }) => {
  const locale = useLocale();
  if (!nft) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow>
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
        <Link href={`/user/${nft.BidderAddr}`} className="font-mono text-inherit">
          {nft.BidderAddr}
        </Link>
      </TablePrimaryCell>

      <TablePrimaryCell align="center">
        <Link href={`/allocation/${nft.RoundNum}`} className="text-inherit">
          {nft.RoundNum}
        </Link>
      </TablePrimaryCell>

      <TablePrimaryCell align="center">{nft.RWalkTokenId}</TablePrimaryCell>
    </TablePrimaryRow>
  );
};

const UsedRwlkNftsTable = ({ list }: { list: UsedRwlkNftRecord[] }) => {
  const t = useTranslations('tables');
  return (
    <TablePrimaryContainer>
      <TablePrimary>
        <TablePrimaryHead>
          <Tr>
            <TablePrimaryHeadCell align="left">{t('columns.dateTimeCompact')}</TablePrimaryHeadCell>
            <TablePrimaryHeadCell>{t('columns.participantAddress')}</TablePrimaryHeadCell>
            <TablePrimaryHeadCell>{t('columns.cycle')}</TablePrimaryHeadCell>
            <TablePrimaryHeadCell>{t('statisticsColumns.namedNftTokenId')}</TablePrimaryHeadCell>
          </Tr>
        </TablePrimaryHead>
        <tbody>
          {list.map((nft, i: number) => (
            <UsedRwlkNftRow key={i} nft={nft} />
          ))}
        </tbody>
      </TablePrimary>
    </TablePrimaryContainer>
  );
};

const UsedRwlkNftsPage = () => {
  const t = useTranslations('statistics');
  const locale = useLocale();
  const perPage = 5;
  const [curPage, setCurPage] = useState(1);
  const { data: list = [], isLoading: loading } = useUsedRWLKNFTs();

  return (
    <PageShell variant="data" backdrop="signature">
      <PageHeader
        align="left"
        eyebrow={
          <SectionEyebrow tone="nebula">
            {t('usedRwlkNfts.eyebrow', { count: list.length.toLocaleString(locale) })}
          </SectionEyebrow>
        }
        title={t('usedRwlkNfts.title')}
        titleLevel={2}
        gradientTitle="signature"
        subtitle={t('usedRwlkNfts.subtitle')}
      />
      <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-3xl">
        {t('usedRwlkNfts.description')}
      </p>

      <div className="mt-12">
        {loading ? (
          <p className="text-lg font-semibold">{t('usedRwlkNfts.loading')}</p>
        ) : list.length > 0 ? (
          <>
            <UsedRwlkNftsTable
              list={list.slice((curPage - 1) * perPage, curPage * perPage) as UsedRwlkNftRecord[]}
            />
            <CustomPagination
              page={curPage}
              setPage={setCurPage}
              totalLength={list.length}
              perPage={perPage}
            />
          </>
        ) : (
          <p className="text-lg font-semibold">{t('usedRwlkNfts.empty')}</p>
        )}
      </div>
    </PageShell>
  );
};

export default UsedRwlkNftsPage;
