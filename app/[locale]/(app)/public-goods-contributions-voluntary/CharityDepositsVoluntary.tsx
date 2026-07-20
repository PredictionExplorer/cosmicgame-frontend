'use client';

import { useTranslations } from 'next-intl';

import { PageHeader } from '@/components/layout/PageHeader';
import { PageShell } from '@/components/ui/page-shell';
import {
  CharityDepositTable,
  type PublicGoodsContributionEntry,
} from '@/components/tables/CharityDepositTable';
import { useCharityVoluntary } from '@/hooks/useApiQuery';

const CharityDepositsVoluntary = () => {
  const t = useTranslations('publicGoods');
  const { data: voluntaryDeposits = [], isLoading: loading } = useCharityVoluntary();

  return (
    <PageShell variant="data" backdrop="signature">
      <PageHeader title={t('voluntary.title')} titleLevel={2} subtitle={t('voluntary.subtitle')} />
      <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-3xl">
        {t('voluntary.description')}
      </p>
      {loading ? (
        <p className="text-lg font-semibold" role="status">
          {t('loading')}
        </p>
      ) : (
        <CharityDepositTable list={voluntaryDeposits as PublicGoodsContributionEntry[]} />
      )}
    </PageShell>
  );
};

export default CharityDepositsVoluntary;
