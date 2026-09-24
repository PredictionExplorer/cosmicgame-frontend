import type { Metadata, ResolvingMetadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { createPageMetadata } from '@/utils/seo';
import { PageMessages } from '@/components/i18n/PageMessages';

import AnchorActionDetailPage from './AnchorActionDetailPage';

interface PageProps {
  params: Promise<{ locale: string; IsRwalk: string; actionId: string }>;
}

export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { locale, IsRwalk, actionId } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return createPageMetadata(
    parent,
    t('anchorAction.title'),
    t('anchorAction.description'),
    undefined,
    `/anchor-action/${IsRwalk}/${actionId}`,
    { index: false, locale },
  );
}

// Dynamic-param pages render on demand; revalidate keeps live protocol data
// fresh instead of freezing the first render forever (see route-group refactor).
export const revalidate = 300;

export default async function Page({ params }: PageProps) {
  const { locale, IsRwalk, actionId } = await params;
  setRequestLocale(locale);
  return (
    <PageMessages namespaces={['anchoring', 'detail']}>
      <AnchorActionDetailPage IsRwalk={Number(IsRwalk)} actionId={Number(actionId)} />
    </PageMessages>
  );
}
