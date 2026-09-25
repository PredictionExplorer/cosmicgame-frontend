import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { formatAddress } from '@/utils/format';
import { capCacheWindow } from '@/lib/cacheWindow';
import { createMetadata } from '@/utils/seo';
import { PageMessages } from '@/components/i18n/PageMessages';

import { DashboardQuerySeed, QuerySeed } from '../../QuerySeed';

import UserPage from './UserPage';
import { profileAddress } from './profileAddress';
import { readProfile } from './profileReads';

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
 * is then served from the cache for five minutes (`CACHE_WINDOW.live`), or a
 * minute when one of its reads failed. The server reads the whole profile
 * (`readProfile`), so its figures, NFTs and ledgers are the first HTML; the
 * browser refreshes any read older than its hook allows right after
 * hydration, so a cached page never shows old figures for long.
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
  const address = profileAddress(rawAddress);
  // A malformed address reads nothing: its page says so, and that never changes.
  const { seeds, cacheWindow } = address
    ? await readProfile(address)
    : { seeds: [], cacheWindow: 'live' as const };
  await capCacheWindow(cacheWindow);

  return (
    <PageMessages namespaces={['anchoring', 'detail', 'marketing', 'myPages', 'tables', 'traits']}>
      <DashboardQuerySeed>
        <QuerySeed seeds={seeds}>
          <UserPage address={address} />
        </QuerySeed>
      </DashboardQuerySeed>
    </PageMessages>
  );
}
