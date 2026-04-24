'use client';

import { useMemo } from 'react';

import { PageHeader } from '@/components/layout/PageHeader';
import { MainWrapper } from '@/components/styled';
import { useBidList } from '@/hooks/useApiQuery';
import BanBidTable from '@/components/tables/BanBidTable';

const AdminPage = () => {
  const { data: bidListRaw, isLoading } = useBidList();

  const bidList = useMemo(() => bidListRaw?.filter((x) => x.Message !== '') ?? null, [bidListRaw]);

  return (
    <MainWrapper>
      <PageHeader title="Admin" subtitle="Manage gestures and system administration" />
      <div>
        <h2 className="text-xl font-semibold mb-4">Gesture List</h2>
        {isLoading || bidList === null ? (
          <p className="text-lg font-semibold" role="status">
            Loading...
          </p>
        ) : (
          <BanBidTable biddingHistory={bidList} />
        )}
      </div>
    </MainWrapper>
  );
};

export default AdminPage;
