'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import { PageHeader } from '@/components/layout/PageHeader';
import { RouteGroupNav } from '@/components/layout/RouteGroupNav';
import { PublicGoodsImpactCard } from '@/components/home/PublicGoodsImpactCard';
import { PageShell } from '@/components/ui/page-shell';
import {
  CharityDepositTable,
  type PublicGoodsContributionEntry,
} from '@/components/tables/CharityDepositTable';
import { useCharityCGDeposits, useDashboardInfo } from '@/hooks/useApiQuery';

/** `seoSummary` is the server-rendered page header, the page's only header. */
const CharityCGDeposits = ({ seoSummary }: { seoSummary?: ReactNode }) => {
  const t = useTranslations('publicGoods');
  const tTables = useTranslations('tables');
  const { data: charityCGDeposits = [], isLoading: loading } = useCharityCGDeposits();
  const { data: dashboardData } = useDashboardInfo(undefined, { poll: false });

  return (
    <PageShell variant="data" backdrop="signature">
      {seoSummary ?? (
        <PageHeader
          section="records"
          title={t('protocol.title')}
          subtitle={t('protocol.subtitle')}
        />
      )}
      <RouteGroupNav group="publicGoods" current="publicGoodsProtocol" />
      <PublicGoodsImpactCard data={dashboardData ?? null} variant="compact" className="mb-8" />
      <CharityDepositTable
        list={charityCGDeposits as PublicGoodsContributionEntry[]}
        loading={loading}
        title={tTables('names.publicGoodsContributions')}
      />
    </PageShell>
  );
};

export default CharityCGDeposits;
