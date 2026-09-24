'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import { PageHeader } from '@/components/layout/PageHeader';
import { PageShell } from '@/components/ui/page-shell';
import CharityWithdrawalTable, {
  type CharityWithdrawal,
} from '@/components/tables/CharityWithdrawalTable';
import { useCharityWithdrawals } from '@/hooks/useApiQuery';

const CharityWithdrawals = ({ seoSummary }: { seoSummary?: ReactNode }) => {
  const t = useTranslations('publicGoods');
  const tTables = useTranslations('tables');
  const { data: charityWithdrawals = [], isLoading: loading } = useCharityWithdrawals();

  return (
    <PageShell variant="data" backdrop="signature">
      {seoSummary}
      {!seoSummary && (
        <PageHeader
          title={t('retrievals.title')}
          titleLevel={2}
          subtitle={t('retrievals.subtitle')}
        />
      )}
      <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-3xl">
        {t('retrievals.description')}
      </p>
      <CharityWithdrawalTable
        list={charityWithdrawals as CharityWithdrawal[]}
        loading={loading}
        title={tTables('names.publicGoodsRetrievals')}
      />
    </PageShell>
  );
};

export default CharityWithdrawals;
