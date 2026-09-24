import { getLocale, getTranslations } from 'next-intl/server';

import { getTrustCenterTabLabels } from '@/content/legal/labels';
import { TrustCenterTabs } from '@/content/legal/TrustCenterTabs';

import { PageHeader } from '@/components/layout/PageHeader';

/**
 * The /code page header, rendered on the server: the Trust Center's reading
 * header (H1 and lede) with its tabs. The IPFS artifact and the GitHub
 * organization are linked once, where they are evidence: under the viewer
 * and in the repository list.
 */
export async function CodeSeoSummary() {
  const locale = await getLocale();
  const [t, tabs] = await Promise.all([
    getTranslations({ locale, namespace: 'code' }),
    getTrustCenterTabLabels(locale),
  ]);
  return (
    <PageHeader
      variant="reading"
      section="trust"
      title={t('seo.heading')}
      titleId="code-heading"
      subtitle={t('seo.description')}
      tabs={<TrustCenterTabs current="code" labels={tabs} />}
    />
  );
}
