import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { formatId, getAssetsUrl } from '@/utils';

import {
  getCstInfoSeed,
  getCurrentSpecialRecipientsSeed,
  getDashboardInfoSeed,
  getLatestGestureSeed,
} from '@/services/api/server';
import { createMetadata } from '@/utils/seo';
import { formatFixed } from '@/utils/format';
import { JsonLd, liveCycleJsonLd, visualArtworkJsonLd } from '@/utils/jsonLd';
import type { CSTTokenInfo, DashboardInfo, GestureInfo, SpecialRecipients } from '@/services/api';
import { PageMessages } from '@/components/i18n/PageMessages';

import HomePage from './HomePage';

/**
 * The app home is ISR, not dynamic: it is the single busiest route, and
 * rendering it per-request meant every visitor paid a serverless invocation
 * plus backend round trips before any HTML (2.5s+ TTFB on cold starts).
 * The page prerenders with a seed snapshot, serves from the CDN, and
 * regenerates in the background; live data takes over client-side right
 * after hydration, so the seed's staleness window only affects the first
 * paint. Reads no request state — a header or cookie read would silently
 * flip the route back to dynamic (guarded by home-rendering-policy tests).
 *
 * Next.js requires this to be a literal, so it cannot import
 * HOME_SEED_REVALIDATE_SECONDS; the rendering-policy test keeps the two
 * values in sync.
 */
export const revalidate = 15;

interface PageProps {
  params: Promise<{ locale: string }>;
}

export interface InitialBannerToken {
  id: number;
  info: CSTTokenInfo;
}

/**
 * Server-picks the hero artwork so its (priority) image URL is present in
 * the prerendered HTML. Before this, the artwork resolved through two
 * client-side queries after hydration, so the largest image on the page was
 * discovered seconds late. A fresh random token is chosen at each ISR
 * regeneration; the client rotation continues from it.
 */
async function pickInitialBannerToken(
  dashboard: DashboardInfo | null,
): Promise<InitialBannerToken | null> {
  const imprintedCount = dashboard?.MainStats?.NumCSTokenMints ?? 0;
  if (!Number.isFinite(imprintedCount) || imprintedCount <= 0) return null;
  const id = Math.floor(Math.random() * imprintedCount);
  const info = await getCstInfoSeed(id);
  if (!info?.Seed) return null;
  return { id, info };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });

  // Shares the page's seed read via React cache() — one upstream call per
  // regeneration instead of the two separate axios calls this route made
  // per request historically.
  const dashboard = await getDashboardInfoSeed();
  const reserve = dashboard?.PrizeAmountEth ?? dashboard?.CurPrizeAmountEth ?? null;
  const description =
    reserve != null
      ? t('home.descriptionWithReserve', { reserve: `${formatFixed(reserve, 4)} ETH` })
      : t('home.description');
  return createMetadata(t('home.title'), description, undefined, '/', { locale });
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const initialDashboardData = await getDashboardInfoSeed();
  const [initialBannerToken, initialLatestGesture, initialSpecialRecipients] = await Promise.all([
    pickInitialBannerToken(initialDashboardData),
    initialDashboardData
      ? getLatestGestureSeed(initialDashboardData.CurRoundNum)
      : Promise.resolve<GestureInfo | null>(null),
    getCurrentSpecialRecipientsSeed() as Promise<SpecialRecipients | null>,
  ]);
  const liveCycleStartTs = initialDashboardData?.TsRoundStart ?? 0;
  const liveCycleNumber = initialDashboardData?.CurRoundNum ?? 0;
  const tArtwork = await getTranslations({ locale, namespace: 'detail' });

  // Deliberately NO Suspense wrapper: HomePage must render fully on the
  // server (it holds the LCP text). A future hook that suspends or bails to
  // client rendering during prerender should fail the build loudly here,
  // not silently swap the page for an empty fallback.
  return (
    <PageMessages namespaces={['currentCycle', 'detail', 'home', 'statistics', 'tables']}>
      {/* Structured data for the running cycle, from the same ISR seed as the
          page itself (no request-state reads; ±15s staleness is fine). */}
      {liveCycleStartTs > 0 && (
        <JsonLd
          data={liveCycleJsonLd({
            cycleNumber: liveCycleNumber,
            startTsSeconds: liveCycleStartTs,
            inLanguage: locale === 'zh' ? 'zh-CN' : 'en',
          })}
        />
      )}
      {/* The featured artwork leads the page visually; give crawlers and AI
          engines the same fact as a licensed VisualArtwork node. */}
      {initialBannerToken?.info.Seed && (
        <JsonLd
          data={visualArtworkJsonLd({
            tokenId: initialBannerToken.id,
            name: `Cosmic Signature ${formatId(initialBannerToken.id)}`,
            description: tArtwork('jsonLd.productDescription'),
            imageUrl: getAssetsUrl(`cosmicsignature/0x${initialBannerToken.info.Seed}.png`),
            inLanguage: locale === 'zh' ? 'zh-CN' : 'en',
          })}
        />
      )}
      <HomePage
        initialDashboardData={initialDashboardData}
        initialBannerToken={initialBannerToken}
        initialLatestGesture={initialLatestGesture}
        initialSpecialRecipients={initialSpecialRecipients}
      />
    </PageMessages>
  );
}
