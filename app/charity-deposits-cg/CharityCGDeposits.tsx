'use client';

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
      <h4 className="text-2xl font-bold text-primary text-center mb-8">
        Cosmic Game Charity Deposits
      </h4>
      {loading ? (
        <h6 className="text-lg font-semibold">Loading...</h6>
      ) : (
        <CharityDepositTable list={charityCGDeposits as CharityDepositDonation[]} />
      )}
    </MainWrapper>
  );
};

export default CharityCGDeposits;
