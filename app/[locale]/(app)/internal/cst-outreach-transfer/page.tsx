import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { createMetadata } from '@/utils/seo';
import { PageMessages } from '@/components/i18n/PageMessages';

import CstOutreachTransferPage from './CstOutreachTransferPage';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return createMetadata(
    t('internalCstOutreachTransfer.title'),
    t('internalCstOutreachTransfer.description'),
    undefined,
    '/internal/cst-outreach-transfer',
    { index: false, locale },
  );
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <PageMessages namespaces={['admin', 'marketing']}>
      <CstOutreachTransferPage />
    </PageMessages>
  );
}
