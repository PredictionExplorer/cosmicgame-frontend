'use client';

import dynamic from 'next/dynamic';

import { Spinner } from '@/components/ui/spinner';

const Statistics = dynamic(() => import('./Statistics'), {
  loading: () => (
    <div className="flex min-h-[400px] items-center justify-center">
      <Spinner size="lg" />
    </div>
  ),
});

export default function StatisticsLoader() {
  return <Statistics />;
}
