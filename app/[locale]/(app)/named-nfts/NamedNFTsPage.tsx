'use client';

import { useState } from 'react';
import { Tr, Tbody } from 'react-super-responsive-table';
import { useLocale, useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { HydrationSafeDateTime } from '@/components/common/HydrationSafeDateTime';
import {
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from '@/components/styled';
import { useNamedNFTs } from '@/hooks/useApiQuery';
import type { CSTTokenInfo } from '@/services/api';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import { CustomPagination } from '@/components/common/CustomPagination';
import { Spinner } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageShell } from '@/components/ui/page-shell';
import { SectionEyebrow } from '@/components/ui/section-eyebrow';

const NamedNFTRow = ({ nft }: { nft: CSTTokenInfo }) => {
  const locale = useLocale();
  if (!nft) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        <HydrationSafeDateTime timestamp={nft.MintTimeStamp ?? nft.TimeStamp} locale={locale} />
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <Link href={`/detail/${nft.TokenId}`} className="text-inherit text-[inherit]">
          {nft.TokenId}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell>{nft.TokenName ?? ''}</TablePrimaryCell>
    </TablePrimaryRow>
  );
};

const NamedNFTsTable = ({ list }: { list: CSTTokenInfo[] }) => {
  const t = useTranslations('tables');
  return (
    <TablePrimaryContainer>
      <TablePrimary>
        <TablePrimaryHead>
          <Tr>
            <TablePrimaryHeadCell align="left">{t('columns.dateTimeCompact')}</TablePrimaryHeadCell>
            <TablePrimaryHeadCell>{t('statisticsColumns.namedNftTokenId')}</TablePrimaryHeadCell>
            <TablePrimaryHeadCell align="left">{t('columns.tokenName')}</TablePrimaryHeadCell>
          </Tr>
        </TablePrimaryHead>
        <Tbody>
          {list.map((nft, i: number) => (
            <NamedNFTRow key={i} nft={nft} />
          ))}
        </Tbody>
      </TablePrimary>
    </TablePrimaryContainer>
  );
};

const NamedNFTsPage = () => {
  const t = useTranslations('statistics');
  const locale = useLocale();
  const [curPage, setCurPage] = useState(1);
  const perPage = 5;
  const { data: list = [], isLoading: loading } = useNamedNFTs();

  return (
    <PageShell variant="data" backdrop="signature">
      <PageHeader
        align="left"
        eyebrow={
          <SectionEyebrow tone="aurora">
            {t('namedNfts.eyebrow', { count: list.length.toLocaleString(locale) })}
          </SectionEyebrow>
        }
        title={t('namedNfts.title')}
        titleLevel={2}
        gradientTitle="signature"
        subtitle={t('namedNfts.subtitle')}
      />
      <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-3xl">
        {t('namedNfts.description')}
      </p>

      <div className="mt-12">
        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : list.length > 0 ? (
          <>
            <NamedNFTsTable list={list.slice((curPage - 1) * perPage, curPage * perPage)} />
            <CustomPagination
              page={curPage}
              setPage={setCurPage}
              totalLength={list.length}
              perPage={perPage}
            />
          </>
        ) : (
          <EmptyState
            title={t('namedNfts.emptyTitle')}
            description={t('namedNfts.emptyDescription')}
          />
        )}
      </div>
    </PageShell>
  );
};

export default NamedNFTsPage;
