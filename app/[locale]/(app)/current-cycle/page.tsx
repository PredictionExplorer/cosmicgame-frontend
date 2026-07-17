import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import { CurrentCycleSeoSummary } from './CurrentCycleSeoSummary';
import CurrentRoundPage from './CurrentRoundPage';

export const metadata: Metadata = createMetadata(
  'Current Performance Cycle | Cosmic Signature',
  'Full details for the active Performance Cycle: gesture history, leaderboards, attached contributions, and allocation distribution.',
  undefined,
  '/current-cycle',
);

export const revalidate = 300;

export default function Page() {
  return (
    <>
      <CurrentCycleSeoSummary />
      <CurrentRoundPage />
    </>
  );
}
