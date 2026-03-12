'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { MainWrapper } from '@/components/styled';
import CharityWithdrawalTable, {
  type CharityWithdrawal,
} from '@/components/tables/CharityWithdrawalTable';
import { useCharityWithdrawals } from '@/hooks/useApiQuery';

const CharityWithdrawals = () => {
  const { data: charityWithdrawals = [], isLoading: loading } = useCharityWithdrawals();

  return (
    <MainWrapper>
      <PageHeader title="Charity Withdrawals" subtitle="Funds withdrawn from the charity wallet" />
      {loading ? (
        <h6 className="text-lg font-semibold">Loading...</h6>
      ) : (
        <CharityWithdrawalTable list={charityWithdrawals as CharityWithdrawal[]} />
      )}
    </MainWrapper>
  );
};

export default CharityWithdrawals;
