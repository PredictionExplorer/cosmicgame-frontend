import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import Contracts from './Contracts';

export const metadata: Metadata = createMetadata(
  'Contracts | Cosmic Signature',
  "Get detailed information on Cosmic Signature's smart contracts, including addresses, default initial values, and more.",
);

export default function Page() {
  return <Contracts />;
}
