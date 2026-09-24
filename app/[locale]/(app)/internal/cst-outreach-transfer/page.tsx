import type { Metadata, ResolvingMetadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { createPageMetadata } from '@/utils/seo';
import { OperatorHeader } from '@/components/admin/OperatorHeader';
import { PageMessages } from '@/components/i18n/PageMessages';
import { PageShell } from '@/components/ui/page-shell';

import CstOutreachTransferPage from './CstOutreachTransferPage';

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
  const t = await getTranslations({ locale, namespace: 'admin' });
  return (
    <PageMessages namespaces={['admin', 'tables']}>
      <PageShell variant="data">
        <OperatorHeader
          tool="outreachTransfer"
          title={t('outreachTransfer.title')}
          subtitle={t('outreachTransfer.subtitle')}
        />
        <CstOutreachTransferPage />
      </PageShell>
    </PageMessages>
  );
}
