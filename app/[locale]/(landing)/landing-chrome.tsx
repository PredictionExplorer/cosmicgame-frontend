import type { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

import { getLandingContent } from '@/content/landing';

import { LandingFooter } from '@/components/landing-v2/LandingFooter';
import type { AppLocale } from '@/i18n/routing';
import { LANDING_CHROME_NAMESPACES, pickMessages } from '@/lib/i18n/clientMessages';

import { LandingShell } from './landing-shell';

/**
 * The landing host's chrome around a page, for the (landing) root layout:
 * the chrome-scoped messages, the light client shell with the landing
 * header, and the server-rendered footer, handed to it as a slot.
 */
export async function LandingChrome({
  locale,
  children,
}: {
  locale: AppLocale;
  children: ReactNode;
}) {
  const { cycle, art, tracks } = getLandingContent(locale);
  // The home page's section names, linked from the header on every landing page.
  const sections = { cycle: cycle.eyebrow, art: art.eyebrow, tracks: tracks.eyebrow };
  // The landing's page copy lives in content/** modules, so client
  // components here only reach the small chrome set — scoping keeps the
  // full ~300 KB catalog out of the marketing HTML.
  const chromeMessages = pickMessages(await getMessages({ locale }), LANDING_CHROME_NAMESPACES);
  return (
    <NextIntlClientProvider messages={chromeMessages}>
      <LandingShell footer={<LandingFooter />} sections={sections}>
        {children}
      </LandingShell>
    </NextIntlClientProvider>
  );
}
