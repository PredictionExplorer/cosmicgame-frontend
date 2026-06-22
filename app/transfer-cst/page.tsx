import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import TransferCstPage from './TransferCstPage';

export const metadata: Metadata = createMetadata(
  'Transfer CST | Cosmic Signature',
  'Send your Cosmic Signature CST tokens to another wallet address.',
  undefined,
  '/transfer-cst',
  { index: false },
);

export default function Page() {
  return <TransferCstPage />;
}
