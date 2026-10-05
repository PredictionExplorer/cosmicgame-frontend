import { getLocale, getTranslations } from 'next-intl/server';

import { getTrustCenterTabLabels } from '@/content/legal/labels';
import { LEGAL_LINKS } from '@/content/legal/links';
import { TrustCenterTabs } from '@/content/legal/TrustCenterTabs';

import { PageHeader } from '@/components/layout/PageHeader';
import { SiteLink } from '@/components/layout/SiteLink';

/**
 * The /code page header, rendered on the server: the Trust Center's reading
 * header (the tab's name as the H1, one reader-facing lede, and a meta row
 * like its siblings': the licence the project's code and artwork are
 * dedicated under) with its tabs. The branded name stays in the document
 * title and JSON-LD. The IPFS artifact and the GitHub organization are
 * linked once, where they are evidence: under the viewer and in the
 * repository list.
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
      title={tabs.code}
      titleId="code-heading"
      subtitle={t('page.lede')}
      meta={
        <SiteLink
          href={LEGAL_LINKS.license.href}
          kind="external"
          className="link-quiet inline-flex min-h-6 items-center gap-1 transition-colors duration-[var(--duration-fast)] hover:text-foreground"
        >
          {t('page.license')}
        </SiteLink>
      }
      tabs={<TrustCenterTabs current="code" labels={tabs} />}
    />
  );
}
