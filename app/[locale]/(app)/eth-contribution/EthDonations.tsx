'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import { LedgerPage } from '@/components/ledger/LedgerPage';
import { EthContributionForm } from '@/components/contributions/EthContributionForm';
import EthDonationTable, { type EthDonation } from '@/components/tables/EthDonationTable';
import { useDonationsBoth } from '@/hooks/useApiQuery';

/**
 * Direct ETH contributions: the ledger of every contribution to the Cycle
 * Reserve, and beside it (below it on phones) the form to add one, open to
 * every visitor. `header` is the server-rendered page header with the
 * ledger's figures.
 */
const EthDonations = ({
  header,
  formId,
}: {
  header: ReactNode;
  /** The form's anchor id, which the header's phone action jumps to. */
  formId: string;
}) => {
  const t = useTranslations('ethContribution');
  const { data, isLoading, isError, refetch } = useDonationsBoth();

  return (
    <LedgerPage
      header={header}
      aside={<EthContributionForm id={formId} onSuccess={() => refetch()} />}
    >
      <EthDonationTable
        list={(data as EthDonation[] | undefined) ?? []}
        loading={isLoading}
        error={isError ? t('page.historyError') : undefined}
        onRetry={() => void refetch()}
        title={t('page.historyTitle')}
        emptyDescription={t('page.historyEmpty')}
      />
    </LedgerPage>
  );
};

export default EthDonations;
