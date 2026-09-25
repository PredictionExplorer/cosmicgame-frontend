'use client';

import type { LandingContent } from '@/content/landing';

import { LandingFooter } from '@/components/landing-v2/LandingFooter';
import type { LandingSectionLabels } from '@/components/landing-v2/LandingHeader';
import { NotFoundView } from '@/components/layout/NotFoundView';

import { LandingShell } from './[locale]/(landing)/landing-shell';

/**
 * The global 404 on cosmicsignature.com: the landing's own header and footer
 * around the designed not-found page, and none of the app's wallet stack.
 * app/global-not-found.tsx loads this module on demand (see
 * app/not-found-shells.tsx); it renders on the server all the same.
 */
export default function LandingNotFoundPage({
  footer,
  sections,
}: {
  footer: LandingContent['footer'];
  sections: LandingSectionLabels;
}) {
  return (
    <LandingShell footer={<LandingFooter footer={footer} />} sections={sections}>
      <main id="main" tabIndex={-1} className="site-container relative">
        <NotFoundView host="landing" />
      </main>
    </LandingShell>
  );
}
