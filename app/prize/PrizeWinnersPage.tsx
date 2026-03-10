'use client';

import { useMemo } from 'react';

import { MainWrapper } from '@/components/styled';
import { PrizeTable } from '@/components/tables/PrizeTable';
import { useRoundList } from '@/hooks/useApiQuery';

const PrizeWinnersPage = () => {
  const { data: rawPrizeClaims = [], isLoading: loading } = useRoundList();
  const prizeClaims = useMemo(
    () => [...rawPrizeClaims].sort((a, b) => b.TimeStamp - a.TimeStamp),
    [rawPrizeClaims],
  );

  return (
    <MainWrapper>
      <h4 className="text-2xl font-bold text-primary text-center mb-2">Main Prize Winnings</h4>
      <div className="mt-12">
        <PrizeTable list={prizeClaims} loading={loading} />
      </div>
    </MainWrapper>
  );
};

export default PrizeWinnersPage;
