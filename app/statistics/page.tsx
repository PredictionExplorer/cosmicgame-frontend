import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import StatisticsLoader from './StatisticsLoader';

export const metadata: Metadata = createMetadata(
  'Statistics | Cosmic Signature',
  'Explore comprehensive statistics on Cosmic Signature. Access data on market trends, token performance, user activity, and more. Stay informed with real-time insights into our blockchain ecosystem.',
);

export default function Page() {
  return <StatisticsLoader />;
}
