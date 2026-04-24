import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import StatisticsLoader from './StatisticsLoader';

export const metadata: Metadata = createMetadata(
  'Statistics | Cosmic Signature',
  'Protocol statistics for Cosmic Signature \u2014 cycle history, gesture activity, allocation distribution, anchoring metrics, and participant data.',
  undefined,
  '/statistics',
);

export default function Page() {
  return <StatisticsLoader />;
}
