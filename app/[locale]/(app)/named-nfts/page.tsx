import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { createMetadata } from '@/utils/seo';

import { PublicDataRouteSeoSummary } from '../PublicDataRouteSeoSummary';

import NamedNFTsPage from './NamedNFTsPage';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return createMetadata(
    t('namedNfts.title'),
    t('namedNfts.description'),
    undefined,
    '/named-nfts',
    {
      locale,
    },
  );
}

export const revalidate = 300;

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <PublicDataRouteSeoSummary route="named-nfts" />
      <NamedNFTsPage />
    </>
  );
}
