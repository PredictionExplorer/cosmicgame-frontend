'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { PageShell } from '@/components/ui/page-shell';
import {
  CharityDepositTable,
  type PublicGoodsContributionEntry,
} from '@/components/tables/CharityDepositTable';
import { useCharityVoluntary } from '@/hooks/useApiQuery';

const CharityDepositsVoluntary = () => {
  const { data: voluntaryDeposits = [], isLoading: loading } = useCharityVoluntary();

  return (
    <PageShell variant="data" backdrop="signature">
      <PageHeader
        title="Voluntary Public-Goods Contributions"
        subtitle="Community members' voluntary contributions to the Public Goods Vault"
      />
      <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-3xl">
        Beyond automatic protocol forwards, community members can make voluntary contributions to
        the Public Goods Vault. These contributions reflect the Cosmic Signature community&apos;s
        commitment to supporting public-goods initiatives through on-chain coordination.
      </p>
      {loading ? (
        <h6 className="text-lg font-semibold">Loading...</h6>
      ) : (
        <CharityDepositTable list={voluntaryDeposits as PublicGoodsContributionEntry[]} />
      )}
    </PageShell>
  );
};

export default CharityDepositsVoluntary;
