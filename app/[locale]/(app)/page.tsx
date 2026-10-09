import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { formatId, getAssetsUrl } from '@/utils';

import {
  getCurrentSpecialRecipientsSeed,
  getDashboardInfoSeed,
  getHomeTimingSeed,
  getLatestGestureSeed,
  getLatestSignaturesSeed,
  getServerRenderTimeMs,
} from '@/services/api/server';
import { createMetadata } from '@/utils/seo';
import { formatAmount } from '@/utils/format';
import { toFiniteNumber } from '@/utils/finiteNumber';
import { JsonLd, jsonLdInLanguage, liveCycleJsonLd, visualArtworkJsonLd } from '@/utils/jsonLd';
import type { GestureInfo, SpecialRecipients } from '@/services/api';
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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });

  // Shares the page's seed read via React cache() — one upstream call per
  // regeneration instead of the two separate axios calls this route made
  // per request historically.
  const dashboard = await getDashboardInfoSeed();
  // The copy names the Cycle Reserve, which is the contract's balance (the
  // base of every allocation track, lib/allocationTracks) — not the
  // Signature Allocation, one quarter of it.
  const reserve = toFiniteNumber(dashboard?.CosmicGameBalanceEth);
  const description =
    reserve != null && reserve > 0
      ? t('home.descriptionWithReserve', {
          reserve: formatAmount(reserve, { unit: 'ETH', locale, context: 'card' }),
        })
      : t('home.description');
  return createMetadata(t('home.title'), description, undefined, '/', { locale });
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const initialRenderAtMs = getServerRenderTimeMs();

  const [initialDashboardData, initialTimingSample] = await Promise.all([
    getDashboardInfoSeed(),
    getHomeTimingSeed(),
  ]);
  const [initialLatestSignatures, initialLatestGesture, initialSpecialRecipients] =
    await Promise.all([
      getLatestSignaturesSeed(),
      initialDashboardData
        ? getLatestGestureSeed(initialDashboardData.CurRoundNum)
        : Promise.resolve<GestureInfo | null>(null),
      getCurrentSpecialRecipientsSeed() as Promise<SpecialRecipients | null>,
    ]);
  const liveCycleStartTs = initialDashboardData?.TsRoundStart ?? 0;
  const liveCycleNumber = initialDashboardData?.CurRoundNum ?? 0;
  const tArtwork = await getTranslations({ locale, namespace: 'detail' });
  const newestSignature = initialLatestSignatures?.[0] ?? null;

  // Deliberately NO Suspense wrapper: HomePage must render fully on the
  // server (it holds the LCP text). A future hook that suspends or bails to
  // client rendering during prerender should fail the build loudly here,
  // not silently swap the page for an empty fallback.
  return (
    <PageMessages
      namespaces={['currentCycle', 'detail', 'glossary', 'home', 'statistics', 'tables']}
    >
      {/* Structured data for the running cycle, from the same ISR seed as the
          page itself (no request-state reads; ±15s staleness is fine). */}
      {liveCycleStartTs > 0 && (
        <JsonLd
          data={liveCycleJsonLd({
            cycleNumber: liveCycleNumber,
            startTsSeconds: liveCycleStartTs,
            inLanguage: jsonLdInLanguage(locale),
          })}
        />
      )}
      {/* The newest Signature hangs on the desk; give crawlers and AI engines
          the same fact as a licensed VisualArtwork node. */}
      {newestSignature?.Seed && (
        <JsonLd
          data={visualArtworkJsonLd({
            tokenId: newestSignature.TokenId,
            name: `Cosmic Signature ${formatId(newestSignature.TokenId)}`,
            description: tArtwork('jsonLd.productDescription'),
            imageUrl: getAssetsUrl(`cosmicsignature/0x${String(newestSignature.Seed)}.png`),
            inLanguage: jsonLdInLanguage(locale),
          })}
        />
      )}
      <HomePage
        initialDashboardData={initialDashboardData}
        initialLatestSignatures={initialLatestSignatures}
        initialLatestGesture={initialLatestGesture}
        initialSpecialRecipients={initialSpecialRecipients}
        initialTimingSample={initialTimingSample}
        initialRenderAtMs={initialRenderAtMs}
      />
    </PageMessages>
  );
}
