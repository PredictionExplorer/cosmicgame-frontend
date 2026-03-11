'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { MainWrapper } from '@/components/styled';
import {
  CharityDepositTable,
  type CharityDepositDonation,
} from '@/components/tables/CharityDepositTable';
import { useCharityCGDeposits } from '@/hooks/useApiQuery';

const CharityCGDeposits = () => {
  const { data: charityCGDeposits = [], isLoading: loading } = useCharityCGDeposits();

  return (
    <MainWrapper>
      <PageHeader
        title="Charity Deposits"
        subtitle="Deposits made to charity from the Cosmic Game"
      />
      {loading ? (
        <h6 className="text-lg font-semibold">Loading...</h6>
      ) : (
        <CharityDepositTable list={charityCGDeposits as CharityDepositDonation[]} />
      )}
    </MainWrapper>
  );
};

export default CharityCGDeposits;
