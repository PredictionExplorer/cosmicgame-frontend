'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import { PageHeader } from '@/components/layout/PageHeader';
import { AddressChip } from '@/components/ui/address-chip';
import { RouteGroupNav } from '@/components/layout/RouteGroupNav';
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
  const tFormats = useTranslations('formats');
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
      <RouteGroupNav group="publicGoods" current="publicGoodsVoluntary" />
      <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-3xl">
        {t('voluntary.description')}
      </p>
      <CharityDepositTable
        list={voluntaryDeposits as PublicGoodsContributionEntry[]}
        loading={loading}
        title={tTables('names.publicGoodsContributions')}
        emptyDescription={tTables('publicGoods.voluntaryEmpty')}
        emptyAction={
          charity ? (
            // The vault by name, with its address to copy: a bare hex chip
            // gave no hint which address it was.
            <p className="flex flex-col items-center gap-1.5">
              <span className="type-label text-subtle">
                {tFormats('address.known.publicGoods')}
              </span>
              <AddressChip address={charity} label={false} href={false} display="responsive" />
            </p>
          ) : null
        }
      />
    </PageShell>
  );
};

export default CharityDepositsVoluntary;
