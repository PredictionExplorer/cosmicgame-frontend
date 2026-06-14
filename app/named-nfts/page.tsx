import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import { PublicDataRouteSeoSummary } from '../PublicDataRouteSeoSummary';

import NamedNFTsPage from './NamedNFTsPage';

export const metadata: Metadata = createMetadata(
  'Named Cosmic Signature NFTs | Cosmic Signature',
  'Browse Cosmic Signature NFTs that have been given custom names by their owners. Each named NFT carries a unique identity within the collection.',
  undefined,
  '/named-nfts',
);

export default function Page() {
  return (
    <>
      <PublicDataRouteSeoSummary route="named-nfts" />
      <NamedNFTsPage />
    </>
  );
}
