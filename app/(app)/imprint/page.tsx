import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import { PublicDataRouteSeoSummary } from '../PublicDataRouteSeoSummary';

import Imprint from './Imprint';

export const metadata: Metadata = createMetadata(
  'Imprint RandomWalk NFT | Cosmic Signature',
  'Imprint a RandomWalk NFT on Cosmic Signature. Each unused RandomWalk NFT can be attached to one ETH gesture for a 50% Gesture-Cost discount.',
  undefined,
  '/imprint',
);

export const revalidate = 300;

export default function Page() {
  return (
    <>
      <PublicDataRouteSeoSummary route="imprint" />
      <Imprint />
    </>
  );
}
