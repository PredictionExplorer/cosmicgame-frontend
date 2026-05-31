import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import { PublicDataRouteSeoSummary } from '../PublicDataRouteSeoSummary';

import NamedNFTsPage from './NamedNFTsPage';

export const metadata: Metadata = createMetadata(
  'Named Cosmic Signature Tokens | Cosmic Signature',
  'Browse COSMIC NFTs that have been given custom names by their owners. Each named token carries a unique identity within the collection.',
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
