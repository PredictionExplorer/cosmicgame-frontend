import type { Metadata } from 'next';
import { Suspense } from 'react';
import axios from 'axios';

import { cosmicGameBaseUrl } from '@/services/api';
import { createMetadata } from '@/utils/seo';

import HomePageLoader from './HomePageLoader';

export async function generateMetadata(): Promise<Metadata> {
  let prizeAmountStr = '';
  try {
    const { data } = await axios.get(cosmicGameBaseUrl + 'statistics/dashboard');
    const prize = data?.PrizeAmountEth ?? 0;
    prizeAmountStr = `${prize.toFixed(4)}ETH `;
  } catch {
    // fallback
  }
  const description = `Cosmic Signature is a procedural on-chain art protocol on Arbitrum. Participants make gestures across a Performance Cycle; the Signature Allocation track includes about ${prizeAmountStr}ETH plus COSMIC NFTs when the cycle finalizes.`;
  return createMetadata('Cosmic Signature', description, undefined, '/');
}

export default function Page() {
  return (
    <Suspense>
      <HomePageLoader />
    </Suspense>
  );
}
