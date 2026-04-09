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
      <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-3xl">
        Each round, a percentage of the prize pool is automatically deposited to the charity wallet.
        The Cosmic DAO governs which charitable causes receive these funds, creating a direct link
        between gameplay and social impact.
      </p>
      {loading ? (
        <h6 className="text-lg font-semibold">Loading...</h6>
      ) : (
        <CharityDepositTable list={charityCGDeposits as CharityDepositDonation[]} />
      )}
    </MainWrapper>
  );
};

export default CharityCGDeposits;
