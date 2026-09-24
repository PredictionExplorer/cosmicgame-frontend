'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import { PageHeader } from '@/components/layout/PageHeader';
import { AddressChip } from '@/components/ui/address-chip';
import { PageShell } from '@/components/ui/page-shell';
import {
  CharityDepositTable,
  type PublicGoodsContributionEntry,
} from '@/components/tables/CharityDepositTable';
import { useCharityVoluntary } from '@/hooks/useApiQuery';
import { useContractAddresses } from '@/contexts/ContractAddressesContext';

const CharityDepositsVoluntary = ({ seoSummary }: { seoSummary?: ReactNode }) => {
  const t = useTranslations('publicGoods');
  const tTables = useTranslations('tables');
  const { charity } = useContractAddresses();
  const { data: voluntaryDeposits = [], isLoading: loading } = useCharityVoluntary();

  return (
    <PageShell variant="data" backdrop="signature">
      {seoSummary}
      {!seoSummary && (
        <PageHeader
          title={t('voluntary.title')}
          titleLevel={2}
          subtitle={t('voluntary.subtitle')}
        />
      )}
      <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-3xl">
        {t('voluntary.description')}
      </p>
      <CharityDepositTable
        list={voluntaryDeposits as PublicGoodsContributionEntry[]}
        loading={loading}
        title={tTables('names.publicGoodsContributions')}
        emptyDescription={tTables('publicGoods.voluntaryEmpty')}
        emptyAction={charity ? <AddressChip address={charity} label={false} href={false} /> : null}
      />
    </PageShell>
  );
};

export default CharityDepositsVoluntary;
