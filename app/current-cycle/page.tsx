import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import CurrentRoundPage from './CurrentRoundPage';

export const metadata: Metadata = createMetadata(
  'Current Cycle | Cosmic Signature',
  'Full details for the active Performance Cycle: gesture history, leaderboards, attached contributions, and allocation distribution.',
  undefined,
  '/current-cycle',
);

export default function Page() {
  return <CurrentRoundPage />;
}
