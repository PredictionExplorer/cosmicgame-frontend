import type { LandingContent } from '@/content/landing';

import { SiteFooter } from '@/components/layout/SiteFooter';

import { OpenAppLink } from './OpenAppLink';

/**
 * The landing footer: the same directory as the app footer (both render
 * `SiteFooter` from the navigation taxonomy), with the landing's own
 * tagline and colophon and a way into the app. Links to the app go out in
 * the same tab; the FAQ resolves to the app's FAQ on every landing page.
 *
 * A server component: the landing layout renders it and hands it to the
 * client shell as its `footer` slot, so only the footer's small islands
 * (the phone folds, the links, the language directory) ship as client code.
 */
export function LandingFooter({ footer }: { footer: LandingContent['footer'] }) {
  return (
    <SiteFooter
      host="landing"
      tagline={footer.tagline}
      copyright={footer.copyright}
      colophon={footer.colophon}
      action={<OpenAppLink size="lg" />}
    />
  );
}
