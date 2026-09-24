import type { Metadata, ResolvingMetadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { createPageMetadata } from '@/utils/seo';
import { PageMessages } from '@/components/i18n/PageMessages';

import { PublicDataQuerySeed } from '../PublicDataQuerySeed';
import { PublicDataRouteSeoSummary } from '../PublicDataRouteSeoSummary';

import AllocationRecipientsPage, { AllocationScopeNote } from './AllocationRecipientsPage';

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
    t('allocations.title'),
    t('allocations.description'),
    undefined,
    '/allocation',
    { locale },
  );
}

export const revalidate = 300;

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <PageMessages namespaces={['allocation', 'tables']}>
      <PublicDataQuerySeed route="allocation">
        <AllocationRecipientsPage
          seoSummary={
            <PublicDataRouteSeoSummary route="allocation" note={<AllocationScopeNote />} />
          }
        />
      </PublicDataQuerySeed>
    </PageMessages>
  );
}
