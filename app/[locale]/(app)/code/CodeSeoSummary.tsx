import { getLocale, getTranslations } from 'next-intl/server';

import { PageHeader } from '@/components/layout/PageHeader';

/**
 * The /code page header, rendered on the server: H1, lede and related pages.
 * The IPFS artifact and the GitHub organisation are linked once, where they
 * are evidence: under the viewer and in the repository list.
 */
export async function CodeSeoSummary() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'code' });
  return (
    <PageHeader
      section="trust"
      title={t('seo.heading')}
      titleId="code-heading"
      subtitle={t('seo.description')}
      related={[
        { href: '/contracts', label: t('seo.links.contracts') },
        { href: '/security', label: t('seo.links.security') },
        { href: '/gallery', label: t('seo.links.gallery') },
      ]}
      relatedLabel={t('seo.relatedAria')}
    />
  );
}
