'use client';

import { useTranslations } from 'next-intl';

import { PageHeader } from '@/components/layout/PageHeader';
import { PublicGoodsImpactCard } from '@/components/home/PublicGoodsImpactCard';
import { PageShell } from '@/components/ui/page-shell';
import {
  CharityDepositTable,
  type PublicGoodsContributionEntry,
} from '@/components/tables/CharityDepositTable';
import { useCharityCGDeposits, useDashboardInfo } from '@/hooks/useApiQuery';

const CharityCGDeposits = () => {
  const t = useTranslations('publicGoods');
  const { data: charityCGDeposits = [], isLoading: loading } = useCharityCGDeposits();
  const { data: dashboardData } = useDashboardInfo(undefined, { poll: false });

  return (
    <PageShell variant="data" backdrop="signature">
      <PageHeader title={t('protocol.title')} titleLevel={2} subtitle={t('protocol.subtitle')} />
      <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-3xl">
        {t('protocol.description')}
      </p>
      <PublicGoodsImpactCard data={dashboardData ?? null} variant="compact" className="mb-8" />
      {loading ? (
        <p className="text-lg font-semibold" role="status">
          {t('loading')}
        </p>
      ) : (
        <CharityDepositTable list={charityCGDeposits as PublicGoodsContributionEntry[]} />
      )}
    </PageShell>
  );
};

export default CharityCGDeposits;
