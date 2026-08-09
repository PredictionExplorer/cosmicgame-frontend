import type { Metadata } from 'next';
import { Suspense } from 'react';
import axios from 'axios';
import { headers } from 'next/headers';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getAPIUrl } from '@/services/api';
import { get_dashboard_info } from '@/services/api/rounds';
import { createMetadata } from '@/utils/seo';
import { formatFixed } from '@/utils/format';

import HomePage from './HomePage';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });

  let reserve: number | null = null;
  try {
    const { data } = await axios.get(getAPIUrl('statistics/dashboard'));
    reserve = data?.PrizeAmountEth ?? 0;
  } catch {
    // fallback
  }
  const description =
    reserve != null
      ? t('home.descriptionWithReserve', { reserve: `${formatFixed(reserve, 4)} ETH` })
      : t('home.description');
  return createMetadata(t('home.title'), description, undefined, '/', { locale });
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

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
