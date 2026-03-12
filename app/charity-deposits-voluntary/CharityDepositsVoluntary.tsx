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
      {loading ? (
        <h6 className="text-lg font-semibold">Loading...</h6>
      ) : (
        <CharityDepositTable list={voluntaryDeposits as CharityDepositDonation[]} />
      )}
    </MainWrapper>
  );
};

export default CharityDepositsVoluntary;
