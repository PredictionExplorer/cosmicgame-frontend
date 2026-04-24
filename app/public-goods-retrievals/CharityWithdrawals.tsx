'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { PageShell } from '@/components/ui/page-shell';
import CharityWithdrawalTable, {
  type CharityWithdrawal,
} from '@/components/tables/CharityWithdrawalTable';
import { useCharityWithdrawals } from '@/hooks/useApiQuery';

const CharityWithdrawals = () => {
  const { data: charityWithdrawals = [], isLoading: loading } = useCharityWithdrawals();

  return (
    <PageShell variant="data" backdrop="signature">
      <PageHeader
        title="Public Goods Retrievals"
        subtitle="Funds retrieved from the Public Goods Vault"
      />
      <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-3xl">
        This page tracks all retrievals from the Cosmic Signature Public Goods Vault. Each retrieval
        represents public-goods funds being forwarded to beneficiaries selected through Cosmic
        Council coordination.
      </p>
      {loading ? (
        <h6 className="text-lg font-semibold">Loading...</h6>
      ) : (
        <CharityWithdrawalTable list={charityWithdrawals as CharityWithdrawal[]} />
      )}
    </PageShell>
  );
};

export default CharityWithdrawals;
