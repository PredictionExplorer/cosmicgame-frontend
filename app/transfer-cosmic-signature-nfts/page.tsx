import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import TransferCosmicSignatureNftsPage from './TransferCosmicSignatureNftsPage';

export const metadata: Metadata = createMetadata(
  'Transfer Cosmic Signature NFTs | Cosmic Signature',
  'Send your Cosmic Signature NFTs to another wallet address.',
  undefined,
  '/transfer-cosmic-signature-nfts',
  { index: false },
);

export default function Page() {
  return <TransferCosmicSignatureNftsPage />;
}
