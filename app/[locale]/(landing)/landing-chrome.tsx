import type { ComponentType, ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

import { getLandingContent } from '@/content/landing';

import { LandingFooter } from '@/components/landing-v2/LandingFooter';
import type { LandingSectionLabels } from '@/components/landing-v2/LandingHeader';
import type { AppLocale } from '@/i18n/routing';
import { LANDING_CHROME_NAMESPACES, pickMessages } from '@/lib/i18n/clientMessages';

/** The client shell the chrome wraps a page in: `LandingShell`, or a lazy stand-in for it. */
export type LandingShellComponent = ComponentType<{
  footer: ReactNode;
  sections?: LandingSectionLabels;
  children: ReactNode;
}>;

/**
 * The landing host's chrome around a page: the chrome-scoped messages, the
 * light client shell with the landing header, and the server-rendered
 * footer. The (landing) root layout renders it with `LandingShell`; the
 * global 404 (app/global-not-found.tsx) with a lazily loaded `LandingShell`,
 * so an unknown URL on cosmicsignature.com gets the landing's own header and
 * footer, and never the app's wallet stack. The shell is passed in rather
 * than imported, so this module adds no client code of its own.
 */
export async function LandingChrome({
  locale,
  shell: Shell,
  children,
}: {
  locale: AppLocale;
  shell: LandingShellComponent;
  children: ReactNode;
}) {
  const { footer, cycle, art, tracks } = getLandingContent(locale);
  // The home page's section names, linked from the header on every landing page.
  const sections = { cycle: cycle.eyebrow, art: art.eyebrow, tracks: tracks.eyebrow };
  // The landing's page copy lives in content/** modules, so client
  // components here only reach the small chrome set — scoping keeps the
  // full ~300 KB catalog out of the marketing HTML.
  const chromeMessages = pickMessages(await getMessages({ locale }), LANDING_CHROME_NAMESPACES);
  return (
    <NextIntlClientProvider messages={chromeMessages}>
      <Shell footer={<LandingFooter footer={footer} />} sections={sections}>
        {children}
      </Shell>
    </NextIntlClientProvider>
  );
}
