import type { Metadata } from 'next';
import { Suspense } from 'react';
import axios from 'axios';
import { headers } from 'next/headers';

import { cosmicGameBaseUrl } from '@/services/api';
import { get_dashboard_info } from '@/services/api/rounds';
import { createMetadata } from '@/utils/seo';

import HomePage from './HomePage';

export async function generateMetadata(): Promise<Metadata> {
  let reserveStr = '';
  try {
    const { data } = await axios.get(cosmicGameBaseUrl + 'statistics/dashboard');
    const reserve = data?.PrizeAmountEth ?? 0;
    reserveStr = `${reserve.toFixed(4)} ETH `;
  } catch {
    // fallback
  }
  const description = `Cosmic Signature is a procedural on-chain art protocol on Arbitrum. Make a gesture during the Performance Cycle; when it finalizes, the ${reserveStr}Cycle Reserve distributes across allocation tracks — including Protocol Guild.`;
  return createMetadata('Cosmic Signature', description, undefined, '/');
}

export default async function Page() {
  const [initialDashboardData, requestHeaders] = await Promise.all([
    get_dashboard_info().catch(() => null),
    headers(),
  ]);
  const initialHostname = requestHeaders.get('host')?.split(':')[0] ?? null;

  return (
    <Suspense>
      <HomePage initialDashboardData={initialDashboardData} initialHostname={initialHostname} />
    </Suspense>
  );
}
