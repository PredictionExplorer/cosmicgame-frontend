'use client';

import { useTranslations } from 'next-intl';

import { PageHeader } from '@/components/layout/PageHeader';
import { PageShell } from '@/components/ui/page-shell';
import {
  CharityDepositTable,
  type PublicGoodsContributionEntry,
} from '@/components/tables/CharityDepositTable';
import { useCharityCGDeposits } from '@/hooks/useApiQuery';

const CharityCGDeposits = () => {
  const t = useTranslations('publicGoods');
  const { data: charityCGDeposits = [], isLoading: loading } = useCharityCGDeposits();

  return (
    <PageShell variant="data" backdrop="signature">
      <PageHeader title={t('protocol.title')} titleLevel={2} subtitle={t('protocol.subtitle')} />
      <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-3xl">
        {t('protocol.description')}
      </p>
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
