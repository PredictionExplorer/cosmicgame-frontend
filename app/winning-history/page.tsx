import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import WinningHistory from './WinningHistory';

export const metadata: Metadata = createMetadata(
  'History of My Winnings | Cosmic Signature',
  'History of My Winnings',
);

export default function Page() {
  return <WinningHistory />;
}
