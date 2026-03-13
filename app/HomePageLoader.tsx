'use client';

import dynamic from 'next/dynamic';

import { Spinner } from '@/components/ui/spinner';

const HomePage = dynamic(() => import('./HomePage'), {
  loading: () => (
    <div className="flex min-h-[400px] items-center justify-center">
      <Spinner size="lg" />
    </div>
  ),
});

export default function HomePageLoader() {
  return <HomePage />;
}
