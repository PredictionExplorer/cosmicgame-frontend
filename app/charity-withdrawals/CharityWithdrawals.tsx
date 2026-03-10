'use client';

import { MainWrapper } from '@/components/styled';
import CharityWithdrawalTable, {
  type CharityWithdrawal,
} from '@/components/tables/CharityWithdrawalTable';
import { useCharityWithdrawals } from '@/hooks/useApiQuery';

const CharityWithdrawals = () => {
  const { data: charityWithdrawals = [], isLoading: loading } = useCharityWithdrawals();

  return (
    <MainWrapper>
      <h4 className="text-2xl font-bold text-primary text-center mb-8">
        Withdrawals from Charity Wallet
      </h4>
      {loading ? (
        <h6 className="text-lg font-semibold">Loading...</h6>
      ) : (
        <CharityWithdrawalTable list={charityWithdrawals as CharityWithdrawal[]} />
      )}
    </MainWrapper>
  );
};

export default CharityWithdrawals;
