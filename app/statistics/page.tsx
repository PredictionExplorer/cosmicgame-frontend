import type { Metadata } from 'next';

import { PageShell } from '@/components/ui/page-shell';
import { createMetadata } from '@/utils/seo';

import { StatisticsSeoSummary } from './StatisticsSeoSummary';
import StatisticsLoader from './StatisticsLoader';

export const metadata: Metadata = createMetadata(
  'Cosmic Signature Statistics | Performance Cycle, Gestures, NFTs, and CST',
  'View Cosmic Signature protocol statistics on Arbitrum, including Performance Cycle status, gestures, NFT activity, CST, anchoring, reserves, and allocation data.',
  undefined,
  '/statistics',
);

export default function Page() {
  return (
    <PageShell variant="data" backdrop="signature">
      <StatisticsSeoSummary />
      <StatisticsLoader />
    </PageShell>
  );
}
