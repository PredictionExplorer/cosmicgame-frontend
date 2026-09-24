import { getLocale, getTranslations } from 'next-intl/server';

import { GITHUB_ORGANIZATION_URL, IMAGE_GENERATION_IPFS_URL } from '@/content/code/structure';

import { PageHeader } from '@/components/layout/PageHeader';

/** The /code page header, rendered on the server: H1, lede and related sources. */
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
        { href: IMAGE_GENERATION_IPFS_URL, label: t('seo.links.ipfs') },
        { href: GITHUB_ORGANIZATION_URL, label: t('seo.links.github') },
        { href: '/contracts', label: t('seo.links.contracts') },
        { href: '/security', label: t('seo.links.security') },
        { href: '/gallery', label: t('seo.links.gallery') },
      ]}
      relatedLabel={t('seo.relatedAria')}
    />
  );
}
