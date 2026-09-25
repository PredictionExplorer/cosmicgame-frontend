import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { formatAddress } from '@/utils/format';
import { createMetadata } from '@/utils/seo';
import { PageMessages } from '@/components/i18n/PageMessages';

import UserPage from './UserPage';
import { profileAddress } from './profileAddress';

interface PageProps {
  params: Promise<{ locale: string; address: string }>;
}

/**
 * The tab names the participant by the short address the page's H1 shows,
 * and the description carries the whole one. Built from the URL alone: no
 * read of the participant's record, so a slow or failing API never titles a
 * valid participant "Invalid address", and the page can be cached.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, address: rawAddress } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  const address = profileAddress(rawAddress);

  const title = address
    ? t('userProfile.title', { address: formatAddress(address) })
    : t('userProfile.invalidAddress');
  const description = address
    ? t('userProfile.description', { address })
    : t('userProfile.invalidDescription');

  return createMetadata(title, description, undefined, '/user/' + rawAddress, {
    index: false,
    locale,
  });
}

/**
 * No profile renders at build time: each one renders on its first visit and
 * is then served from the cache, refreshed every five minutes. The page shell
 * reads nothing on the server (the profile's ledgers load in the browser), so
 * the cached HTML never holds stale figures, and it is the profile's own
 * loading state (its header, contents rail and body placeholders).
 *
 * The route has no loading boundary: a `loading.tsx` gets no params, so any
 * translated copy in it reads the locale from the request headers, and a
 * route rendered on demand for the cache cannot read headers (every profile
 * answered 500). See `record-route-caching.test.ts`.
 */
export function generateStaticParams() {
  return [];
}

export const revalidate = 300;

export default async function Page({ params }: PageProps) {
  const { locale, address: rawAddress } = await params;
  setRequestLocale(locale);

  return (
    <PageMessages namespaces={['anchoring', 'detail', 'marketing', 'myPages', 'tables', 'traits']}>
      <UserPage address={profileAddress(rawAddress)} />
    </PageMessages>
  );
}
