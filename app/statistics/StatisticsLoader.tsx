'use client';

import dynamic from 'next/dynamic';

const Statistics = dynamic(() => import('./Statistics'), { ssr: false });

export default function StatisticsLoader() {
  return <Statistics />;
}
