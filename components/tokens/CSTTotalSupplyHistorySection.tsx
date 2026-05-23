'use client';

import type { FC } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { CSTTotalSupplyHistoryByBidChart } from './CSTTotalSupplyHistoryByBidChart';
import { CSTTotalSupplyHistoryChart } from './CSTTotalSupplyHistoryChart';

/** Tabbed CST total supply charts: by date (with range) and by bid. */
export const CSTTotalSupplyHistorySection: FC = () => {
  return (
    <Tabs defaultValue="date" className="w-full" data-testid="cst-total-supply-history-section">
      <TabsList className="grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="date">By date</TabsTrigger>
        <TabsTrigger value="gesture">By gesture</TabsTrigger>
      </TabsList>
      <TabsContent value="date" className="mt-6">
        <CSTTotalSupplyHistoryChart />
      </TabsContent>
      <TabsContent value="gesture" className="mt-6">
        <CSTTotalSupplyHistoryByBidChart />
      </TabsContent>
    </Tabs>
  );
};
