import { cache } from 'react';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { capCacheWindow, type CacheWindow } from '@/lib/cacheWindow';
import api from '@/services/api';
import { isRecordNotFound } from '@/services/api/readError';
import type { BannedGesture, GestureInfo } from '@/services/api/types';
import { parseGestureId } from '@/utils/routeParams';
import { createMetadata } from '@/utils/seo';
import { PageMessages } from '@/components/i18n/PageMessages';

import { DashboardQuerySeed, QuerySeed, seedsDisabled } from '../../QuerySeed';
import { readDashboard, readHiddenGestures } from '../../publicDataReads';

import GesturePage from './GesturePage';

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

/**
 * The gesture record, read once per request (React `cache()`) for the
 * metadata and the client's first paint. `data` is null for a record the
 * API does not have, undefined when the read failed or was skipped (the
 * e2e harness mocks the API in the browser, so the server reads nothing
 * there); the client then reads it itself.
 */
const readGesture = cache(
  async (id: number): Promise<{ data: GestureInfo | null | undefined; at: number }> => {
    if (id <= 0 || seedsDisabled()) return { data: undefined, at: Date.now() };
    try {
      return { data: await api.get_bid_info(id), at: Date.now() };
    } catch (error) {
      // The API answers 400 "record not found" for an id it does not hold.
      return { data: isRecordNotFound(error) ? null : undefined, at: Date.now() };
    }
  },
);

/**
 * "Gesture #1135 · Cycle 2" once the record names its place, "Gesture record
 * 29434" until then, and the page's own "Invalid gesture ID" for an id that
 * is not a whole number.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  const gestureId = parseGestureId(id);
  const gesture = gestureId === null ? undefined : (await readGesture(gestureId)).data;
  const position = gesture?.BidPosition;
  const cycle = gesture?.RoundNum;
  const title =
    gestureId === null
      ? (await getTranslations({ locale, namespace: 'gesture' }))('invalid.title')
      : typeof position === 'number' && position > 0 && typeof cycle === 'number' && cycle >= 0
        ? t('gestureDetail.titleFor', { position: String(position), cycle: String(cycle) })
        : t('gestureDetail.titleForId', { id: String(gestureId) });
  return createMetadata(title, t('gestureDetail.description'), undefined, `/gesture/${id}`, {
    index: false,
    locale,
  });
}

/**
 * No gesture renders at build time: each record renders on its first visit
 * and is then served from the cache. A gesture never changes once indexed,
 * and a gesture of a finalized cycle is final down to its trail, so its
 * render is kept for a day (`CACHE_WINDOW.final`). One of the live cycle
 * keeps five minutes (its trail leads to the live cycle until it
 * finalizes), and a record the API does not hold yet, or could not be read,
 * a minute. A record that carries a message keeps at most five minutes,
 * so a message moderation hides later leaves the cached HTML within them,
 * and a minute when the hidden list could not be read.
 */
export function generateStaticParams() {
  return [];
}

export const revalidate = 86400;

/** Whether the record carries a message at all. */
function carriesMessage(gesture: GestureInfo | null | undefined): boolean {
  return typeof gesture?.Message === 'string' && gesture.Message.trim() !== '';
}

/**
 * The record as the server may seed it. Moderation fails closed, as on
 * every public ledger (`useGestureModeration`): a message moderation hid,
 * or one the server could not check because the hidden list did not load,
 * is left out of the seed, so it never reaches the HTML. The client reads
 * the list itself and shows the message once it is cleared.
 */
function moderatedRecord(
  gesture: GestureInfo | null | undefined,
  hidden: readonly BannedGesture[] | null | undefined,
): { data: GestureInfo | null | undefined; unchecked: boolean } {
  if (!gesture || !carriesMessage(gesture)) return { data: gesture, unchecked: false };
  if (!hidden) return { data: { ...gesture, Message: '' }, unchecked: true };
  const isHidden = hidden.some((entry) => entry.bid_id === gesture.EvtLogId);
  return { data: isHidden ? { ...gesture, Message: '' } : gesture, unchecked: false };
}

/** How long this render may be served, from what it shows. */
function gestureCacheWindow(
  gesture: GestureInfo | null | undefined,
  liveCycle: number | null | undefined,
  messageUnchecked: boolean,
): CacheWindow {
  if (!gesture || messageUnchecked) return 'pending';
  const cycle = gesture.RoundNum;
  if (typeof liveCycle !== 'number' || typeof cycle !== 'number') return 'live';
  if (carriesMessage(gesture)) return 'live';
  return cycle < liveCycle ? 'final' : 'live';
}

export default async function Page({ params }: PageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  // The same strict parse as the metadata: "12abc" is an invalid id, never gesture 12.
  const gestureId = parseGestureId(id) ?? -1;
  const [gesture, dashboard, hidden] = await Promise.all([
    gestureId >= 0 ? readGesture(gestureId) : null,
    seedsDisabled() ? null : readDashboard(),
    seedsDisabled() ? null : readHiddenGestures(),
  ]);
  const record = moderatedRecord(gesture?.data, hidden?.data);
  await capCacheWindow(
    gestureCacheWindow(gesture?.data, dashboard?.data?.CurRoundNum, record.unchecked),
  );
  return (
    <PageMessages namespaces={['detail', 'gesture', 'tables']}>
      {/* The live cycle decides the record's trail and cycle link; the record is its own seed. */}
      <DashboardQuerySeed>
        <QuerySeed
          seeds={[
            {
              queryKey: ['gestureInfo', gestureId],
              data: record.data ?? null,
              // A record seeded without its unchecked message is dated stale,
              // so the client reads it again and moderation decides.
              at: record.unchecked ? 0 : (gesture?.at ?? 0),
              // A record the API does not hold is seeded as absent, so the
              // server HTML opens on the not-found state, not a skeleton.
              absent: gesture?.data === null,
            },
            // The list the record's message was checked against, so the
            // client's moderation agrees with the server HTML at once.
            { queryKey: ['bannedBids'], data: hidden?.data ?? null, at: hidden?.at ?? 0 },
          ]}
        >
          <GesturePage
            gestureId={gestureId}
            serverLiveCycle={dashboard?.data?.CurRoundNum ?? null}
          />
        </QuerySeed>
      </DashboardQuerySeed>
    </PageMessages>
  );
}
