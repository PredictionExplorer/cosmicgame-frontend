'use client';

import { useTranslations } from 'next-intl';

import { PageHeader } from '@/components/layout/PageHeader';
import { PageShell } from '@/components/ui/page-shell';
import {
  CharityDepositTable,
  type PublicGoodsContributionEntry,
} from '@/components/tables/CharityDepositTable';
import { PublicGoodsImpactCard } from '@/components/home/PublicGoodsImpactCard';
import { useCharityCGDeposits, useDashboardInfo } from '@/hooks/useApiQuery';

const CharityCGDeposits = () => {
  const t = useTranslations('publicGoods');
  const { data: charityCGDeposits = [], isLoading: loading } = useCharityCGDeposits();
  const { data: dashboard = null } = useDashboardInfo();

  return (
    <PageShell variant="data" backdrop="signature">
      <PageHeader title={t('protocol.title')} titleLevel={2} subtitle={t('protocol.subtitle')} />
      <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-3xl">
        {t('protocol.description')}
      </p>
      {/* Moved off the home page, where Public Goods is now one tile in the
          Allocation Breakdown. The lifetime/vault/retrieved stats and the legal
          disclaimer live here, next to the contribution ledger they describe. */}
      <PublicGoodsImpactCard data={dashboard} className="mb-8" showContributionsLink={false} />
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
