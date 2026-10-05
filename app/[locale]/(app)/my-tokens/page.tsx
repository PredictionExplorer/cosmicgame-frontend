import { Suspense } from 'react';
import type { Metadata, ResolvingMetadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getLatestSignaturesSeed } from '@/services/api/server';
import { createPageMetadata } from '@/utils/seo';
import { PageMessages } from '@/components/i18n/PageMessages';

import MyTokens, { MyTokensRoute, type NewestPlate } from './MyTokens';

interface PageProps {
  params: Promise<{ locale: string }>;
}

/** Plates the disconnected state hangs: the collection's newest three. */
const NEWEST_PLATES = 3;

/**
 * The newest imprints (number and seed) for the disconnected state. The
 * read is fail-safe: without it the state shows the wallet icon instead.
 */
async function loadNewestPlates(): Promise<NewestPlate[]> {
  const latest = await getLatestSignaturesSeed();
  return (latest ?? [])
    .flatMap((token) => (token.Seed ? [{ tokenId: token.TokenId, seed: token.Seed }] : []))
    .slice(0, NEWEST_PLATES);
}

export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return createPageMetadata(
    parent,
    t('myTokens.title'),
    t('myTokens.description'),
    undefined,
    '/my-tokens',
    {
      index: false,
      locale,
    },
  );
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const newest = await loadNewestPlates();
  return (
    <PageMessages namespaces={['detail', 'myPages', 'tables', 'traits']}>
      {/* The page number lives in the URL; the first page is the fallback. */}
      <Suspense fallback={<MyTokens newest={newest} />}>
        <MyTokensRoute newest={newest} />
      </Suspense>
    </PageMessages>
  );
}
