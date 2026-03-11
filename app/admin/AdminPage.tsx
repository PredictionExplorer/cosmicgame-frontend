'use client';

import { useMemo } from 'react';

import { MainWrapper } from '@/components/styled';
import { useBidList } from '@/hooks/useApiQuery';
import BanBidTable from '@/components/tables/BanBidTable';

const AdminPage = () => {
  const { data: bidListRaw, isLoading } = useBidList();

  const bidList = useMemo(() => bidListRaw?.filter((x) => x.Message !== '') ?? null, [bidListRaw]);

  return (
    <MainWrapper>
      <h4 className="text-2xl font-bold text-primary text-center mb-8">Administrative methods</h4>
      <div>
        <h5 className="text-xl font-semibold mb-4">Bid List</h5>
        {isLoading || bidList === null ? (
          <h6 className="text-lg font-semibold">Loading...</h6>
        ) : (
          <BanBidTable biddingHistory={bidList} />
        )}
      </div>
    </MainWrapper>
  );
};

export default AdminPage;
