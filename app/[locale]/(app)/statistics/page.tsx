import type { Metadata } from 'next';

import { APP_ORIGIN } from '@/lib/hostRouting';
import { JsonLd, datasetJsonLd, webPageJsonLd } from '@/utils/jsonLd';
import { createMetadata } from '@/utils/seo';

import { StatisticsSeoSummary } from './StatisticsSeoSummary';
import StatisticsHubPanel from './StatisticsHubPanel';

export const metadata: Metadata = createMetadata(
  'Cosmic Signature Statistics | Performance Cycle, Gestures, NFTs, and CST',
  'View Cosmic Signature protocol statistics on Arbitrum, including Performance Cycle status, gestures, NFT activity, CST, anchoring, reserves, and allocation data.',
  undefined,
  '/statistics',
);

export const revalidate = 300;

export default function Page() {
  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: 'Cosmic Signature Protocol Statistics',
            description:
              'Public Cosmic Signature protocol statistics on Arbitrum, including Performance Cycle status, gestures, NFTs, CST, anchoring, reserves, and allocation data.',
            url: `${APP_ORIGIN}/statistics`,
          }),
          datasetJsonLd({
            name: 'Cosmic Signature Protocol Statistics Snapshot',
            description:
              'A crawlable summary of public Cosmic Signature protocol activity indexed from Arbitrum smart contracts and the Cosmic Signature API.',
            url: `${APP_ORIGIN}/statistics`,
            dateModified: new Date().toISOString(),
          }),
        ]}
      />
      <StatisticsSeoSummary />
      <StatisticsHubPanel />
    </>
  );
}
