import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import CurrentRoundPage from './CurrentRoundPage';

export const metadata: Metadata = createMetadata(
  'Current Round | Cosmic Signature',
  'Full details for the current round: bid history, leaderboards, donations, and fund distribution.',
  undefined,
  '/current-round',
);

export default function Page() {
  return <CurrentRoundPage />;
}
