'use client';

import { useState, useEffect } from 'react';

import { MainWrapper } from '@/components/styled';
import api from '@/services/api';
import type { BidInfo } from '@/services/api/types';
import BanBidTable from '@/components/tables/BanBidTable';

const AdminPage = () => {
  const [bidList, setBidList] = useState<BidInfo[] | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      let bidList = await api.get_bid_list();
      bidList = bidList.filter((x) => x.Message !== '');
      setBidList(bidList);
    };
    fetchData();
  }, []);

  return (
    <MainWrapper>
      <h4 className="text-2xl font-bold text-primary text-center mb-8">Administrative methods</h4>
      <div>
        <h5 className="text-xl font-semibold mb-4">Bid List</h5>
        {bidList === null ? (
          <h6 className="text-lg font-semibold">Loading...</h6>
        ) : (
          <BanBidTable biddingHistory={bidList} />
        )}
      </div>
    </MainWrapper>
  );
};

export default AdminPage;
