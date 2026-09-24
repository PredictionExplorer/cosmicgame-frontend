'use client';

import { useTranslations } from 'next-intl';

import { getSiteRoute } from '@/config/siteNav';
import { usePathname } from '@/i18n/navigation';
import { getClientBuildInfo, isVercelProductionDeploy } from '@/lib/buildInfo';

import { SiteFooter } from './SiteFooter';

/**
 * The app footer: the shared site footer (the full directory of both hosts,
 * grouped by the navigation taxonomy) plus the build commit on previews.
 * The header's Explore and Learn panels are client-only, so this footer is
 * the server-rendered crawl path for their routes (guarded by
 * app/[locale]/(app)/__tests__/crawl-paths.test.tsx). On the site map, which
 * is that directory, it leaves the directory out.
 */
const Footer = () => {
  const t = useTranslations('footer');
  const pathname = usePathname();
  const build = getClientBuildInfo();
  const showBuild =
    build && (!isVercelProductionDeploy() || process.env.NEXT_PUBLIC_SHOW_BUILD_COMMIT === '1');

  return (
    <SiteFooter
      host="app"
      tagline={t('tagline')}
      copyright={t('copyright', { year: String(new Date().getFullYear()) })}
      colophon={t('colophon')}
      directory={pathname !== getSiteRoute('siteMap').path}
      meta={
        showBuild ? (
          <p
            data-testid="build-commit"
            className="type-mono whitespace-normal text-subtle [overflow-wrap:anywhere]"
            title={`${build.fullSha}${build.ref ? ` (${build.ref})` : ''}`}
          >
            {build.shortSha}
            {build.ref ? ` · ${build.ref}` : ''}
          </p>
        ) : null
      }
    />
  );
};

export default Footer;
