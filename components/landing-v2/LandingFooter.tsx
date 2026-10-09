import { SiteFooter } from '@/components/layout/SiteFooter';

import { OpenAppLink } from './OpenAppLink';

/**
 * The landing footer: the same footer as the app (both render `SiteFooter`,
 * with the same directory from the navigation taxonomy and the same copy
 * from the `footer` catalog), plus a way into the app. Links to the app go
 * out in the same tab; the FAQ resolves to the app's FAQ on every landing
 * page.
 *
 * A server component: the landing layout renders it and hands it to the
 * client shell as its `footer` slot, so only the footer's small islands
 * (the phone folds, the links, the language directory) ship as client code.
 */
export function LandingFooter() {
  return <SiteFooter host="landing" action={<OpenAppLink size="lg" />} />;
}
