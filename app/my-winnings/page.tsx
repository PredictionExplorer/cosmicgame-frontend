import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import MyWinnings from './MyWinnings';

export const metadata: Metadata = createMetadata(
  'Pending Winnings | Cosmic Signature',
  'Pending Winnings',
);

export default function Page() {
  return <MyWinnings />;
}
