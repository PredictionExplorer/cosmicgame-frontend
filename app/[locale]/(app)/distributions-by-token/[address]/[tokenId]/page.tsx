import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { formatId } from '@/utils/format/ids';
import { capCacheWindow } from '@/lib/cacheWindow';
import { createPageMetadata } from '@/utils/seo';
import { PageMessages } from '@/components/i18n/PageMessages';

import { QuerySeed } from '../../../QuerySeed';

import { parseTokenDistributionParams } from './params';
import RewardsByTokenPage from './RewardsByTokenPage';
import { readTokenDistributionSeeds } from './tokenDistributionReads';

interface PageProps {
  params: Promise<{ locale: string; address: string; tokenId: string }>;
}

export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { locale, address: rawAddress, tokenId: rawTokenId } = await params;
  const parsed = parseTokenDistributionParams(rawAddress, rawTokenId);
  if (parsed === null) notFound();
  const { address, tokenId } = parsed;
  const t = await getTranslations({ locale, namespace: 'meta' });
  const tAnchoring = await getTranslations({ locale, namespace: 'anchoring' });
  return createPageMetadata(
    parent,
    // Titled like its H1 ("Anchor Distributions for Cosmic Signature #000045").
    tAnchoring('distributionsByToken.title', { id: formatId(tokenId) }),
    t('distributionsByToken.description'),
    undefined,
    `/distributions-by-token/${address}/${tokenId}`,
    { index: false, locale },
  );
}

/**
 * No token's page renders at build time: each renders on its first visit and is
 * then served from the cache for five minutes (`CACHE_WINDOW.live`: an anchored NFT gains a distribution each cycle),
 * or a minute when its reads failed.
 */
export function generateStaticParams() {
  return [];
}

export const revalidate = 300;

/**
 * The segments are validated first (the layout already answered a bad one
 * with a 404). The server then reads the NFT's deposits and the NFT with the
 * checksummed address, so the first HTML is the page with its data and the
 * client's query keys match the seeds exactly.
 */
export default async function Page({ params }: PageProps) {
  const { locale, address: rawAddress, tokenId: rawTokenId } = await params;
  setRequestLocale(locale);
  const parsed = parseTokenDistributionParams(rawAddress, rawTokenId);
  if (parsed === null) notFound();
  const { address, tokenId } = parsed;
  const seeds = await readTokenDistributionSeeds(address, tokenId);
  if (seeds.length === 0 || seeds.some((seed) => seed.data === null)) {
    await capCacheWindow('pending');
  }
  return (
    <PageMessages namespaces={['anchoring', 'tables']}>
      <QuerySeed seeds={seeds}>
        <RewardsByTokenPage address={address} tokenId={tokenId} />
      </QuerySeed>
    </PageMessages>
  );
}
