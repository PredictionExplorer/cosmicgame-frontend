import type { Metadata, ResolvingMetadata } from 'next';
import { Suspense } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { createPageMetadata } from '@/utils/seo';
import { PageMessages } from '@/components/i18n/PageMessages';

import { PublicDataRouteSeoSummary } from '../PublicDataRouteSeoSummary';

import AllocationFinalizedPage from './AllocationFinalizedPage';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return createPageMetadata(
    parent,
    t('allocationRetrieved.title'),
    t('allocationRetrieved.description'),
    undefined,
    '/allocation-finalized',
    { locale },
  );
}

export const revalidate = 300;

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <PageMessages namespaces={['allocation']}>
      <Suspense>
        <AllocationFinalizedPage
          seoSummary={<PublicDataRouteSeoSummary route="allocation-finalized" />}
        />
      </Suspense>
    </PageMessages>
  );
}
