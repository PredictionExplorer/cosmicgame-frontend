import type { Metadata, ResolvingMetadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { formatId } from '@/utils/format/ids';
import { createPageMetadata } from '@/utils/seo';
import { PageMessages } from '@/components/i18n/PageMessages';

import { QuerySeed } from '../../../QuerySeed';

import RewardsByTokenPage from './RewardsByTokenPage';
import { readTokenDistributionSeeds } from './tokenDistributionReads';

interface PageProps {
  params: Promise<{ locale: string; address: string; tokenId: string }>;
}

export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { locale, address, tokenId } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  const tAnchoring = await getTranslations({ locale, namespace: 'anchoring' });
  const id = Number(tokenId);
  return createPageMetadata(
    parent,
    // Titled like its H1 ("Anchor Distributions for Cosmic Signature #000045").
    Number.isSafeInteger(id) && id >= 0
      ? tAnchoring('distributionsByToken.title', { id: formatId(id) })
      : tAnchoring('overview.title'),
    t('distributionsByToken.description'),
    undefined,
    `/distributions-by-token/${address}/${tokenId}`,
    { index: false, locale },
  );
}

// Dynamic-param pages render on demand; revalidate keeps live protocol data
// fresh instead of freezing the first render forever (see route-group refactor).
export const revalidate = 300;

/**
 * The server reads the NFT's deposits and the NFT, so the first HTML is the
 * page with its data: an NFT with no deposit yet renders without the figure
 * strip from the start, instead of dropping it (and moving everything under
 * it) once the browser has read it.
 */
export default async function Page({ params }: PageProps) {
  const { locale, address, tokenId } = await params;
  setRequestLocale(locale);
  const id = Number(tokenId);
  return (
    <PageMessages namespaces={['anchoring', 'tables']}>
      <QuerySeed seeds={await readTokenDistributionSeeds(address, id)}>
        <RewardsByTokenPage address={address} tokenId={id} />
      </QuerySeed>
    </PageMessages>
  );
}
