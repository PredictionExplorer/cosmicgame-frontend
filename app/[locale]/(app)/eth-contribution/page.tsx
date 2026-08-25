import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { createMetadata } from '@/utils/seo';
import { PageMessages } from '@/components/i18n/PageMessages';

import { PublicDataRouteSeoSummary } from '../PublicDataRouteSeoSummary';

import EthDonations from './EthDonations';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return createMetadata(
    t('ethContribution.title'),
    t('ethContribution.description'),
    undefined,
    '/eth-contribution',
    { locale },
  );
}

export const revalidate = 300;

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <PageMessages namespaces={['ethContribution', 'marketing', 'tables']}>
      <>
        <PublicDataRouteSeoSummary route="eth-contribution" />
        <EthDonations />
      </>
    </PageMessages>
  );
}
