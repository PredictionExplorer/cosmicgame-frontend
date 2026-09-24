import type { Metadata, ResolvingMetadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getSecurityCopy } from '@/content/legal';
import { getLegalDocumentLabels } from '@/content/legal/labels';
import { OFFICIAL_CONTRACTS, type OfficialContractId } from '@/content/legal/officialAddresses';
import { SecurityContent } from '@/content/legal/SecurityContent';

import { APP_ORIGIN, localeHref } from '@/lib/hostRouting';
import { JsonLd, breadcrumbJsonLd, jsonLdInLanguage, webPageJsonLd } from '@/utils/jsonLd';
import { createPageMetadata } from '@/utils/seo';

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
    t('security.title'),
    t('security.description'),
    undefined,
    '/security',
    { locale },
  );
}

export default async function SecurityPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, legal, contracts, labels] = await Promise.all([
    getTranslations({ locale, namespace: 'meta' }),
    getTranslations({ locale, namespace: 'legal' }),
    getTranslations({ locale, namespace: 'contracts' }),
    getLegalDocumentLabels(locale),
  ]);
  const contractNames = Object.fromEntries(
    OFFICIAL_CONTRACTS.map(({ id }) => [id, contracts(`entries.${id}.name`)]),
  ) as Record<OfficialContractId, string>;
  const inLanguage = jsonLdInLanguage(locale);
  const pageUrl = localeHref(APP_ORIGIN, '/security', locale);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: t('security.title'),
            description: t('security.description'),
            url: pageUrl,
            inLanguage,
          }),
          breadcrumbJsonLd(
            [
              {
                name: legal('breadcrumbs.home'),
                path: '/',
              },
              {
                name: legal('breadcrumbs.security'),
                path: '/security',
              },
            ],
            localeHref(APP_ORIGIN, '/', locale),
          ),
        ]}
      />
      <SecurityContent
        copy={getSecurityCopy(locale)}
        locale={locale}
        labels={labels}
        contractNames={contractNames}
      />
    </>
  );
}
