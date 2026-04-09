'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { MainWrapper } from '@/components/styled';
import {
  CharityDepositTable,
  type CharityDepositDonation,
} from '@/components/tables/CharityDepositTable';
import { useCharityVoluntary } from '@/hooks/useApiQuery';

const CharityDepositsVoluntary = () => {
  const { data: voluntaryDeposits = [], isLoading: loading } = useCharityVoluntary();

  return (
    <MainWrapper>
      <PageHeader
        title="Voluntary Donations"
        subtitle="Community members' voluntary contributions to charity"
      />
      <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-3xl">
        Beyond automatic game contributions, community members can make voluntary donations to the
        charity pool. These contributions reflect the Cosmic Signature community&apos;s commitment
        to supporting meaningful causes through blockchain technology.
      </p>
      {loading ? (
        <h6 className="text-lg font-semibold">Loading...</h6>
      ) : (
        <CharityDepositTable list={voluntaryDeposits as CharityDepositDonation[]} />
      )}
    </MainWrapper>
  );
};

export default CharityDepositsVoluntary;
