'use client';

import { useMemo } from 'react';

import { PageHeader } from '@/components/layout/PageHeader';
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
      <PageHeader
        title="Prize Winners"
        subtitle="Browse the history of main prize winners across all rounds"
      />
      <div className="mt-12">
        <PrizeTable list={prizeClaims} loading={loading} />
      </div>
    </MainWrapper>
  );
};

export default PrizeWinnersPage;
