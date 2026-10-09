import { getClientBuildInfo, isVercelProductionDeploy } from '@/lib/buildInfo';

import { SiteFooter } from './SiteFooter';

/**
 * The app footer: the shared site footer (the full directory of both hosts,
 * grouped by the navigation taxonomy) plus the build commit on previews.
 * The header's Explore and Learn panels are client-only, so this footer is
 * the server-rendered crawl path for their routes (guarded by
 * app/[locale]/(app)/__tests__/crawl-paths.test.tsx).
 *
 * A server component: the app root layout renders it and hands it to the
 * client `Providers` as their `footer` slot, so only the footer's small
 * islands (the phone folds, the links, the language directory) hydrate.
 * On the site map, which is that directory, SiteFooter hides its own copy
 * (see `SITE_MAP_MARKER`).
 */
const Footer = () => {
  const build = getClientBuildInfo();
  const showBuild =
    build && (!isVercelProductionDeploy() || process.env.NEXT_PUBLIC_SHOW_BUILD_COMMIT === '1');

  return (
    <SiteFooter
      host="app"
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
