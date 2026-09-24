import { cache } from 'react';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import api from '@/services/api';
import type { GestureInfo } from '@/services/api/types';
import { createMetadata } from '@/utils/seo';
import { PageMessages } from '@/components/i18n/PageMessages';

import { DashboardQuerySeed, QuerySeed, seedsDisabled } from '../../QuerySeed';

import GesturePage from './GesturePage';

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

/** The route's event-log id, or null when it is not a whole number. */
function parseGestureId(id: string): number | null {
  if (!/^\d+$/.test(id)) return null;
  const value = Number(id);
  return Number.isSafeInteger(value) ? value : null;
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
    } catch {
      return { data: undefined, at: Date.now() };
    }
  },
);

/** "Gesture #1135 · Cycle #2" once the record names its place; "Gesture record 29434" until then. */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  const gestureId = parseGestureId(id);
  const gesture = gestureId === null ? undefined : (await readGesture(gestureId)).data;
  const position = gesture?.BidPosition;
  const cycle = gesture?.RoundNum;
  const title =
    typeof position === 'number' && position > 0 && typeof cycle === 'number' && cycle >= 0
      ? t('gestureDetail.titleFor', { position: String(position), cycle: String(cycle) })
      : t('gestureDetail.titleForId', { id });
  return createMetadata(title, t('gestureDetail.description'), undefined, `/gesture/${id}`, {
    index: false,
    locale,
  });
}

// A gesture record never changes once indexed; the window only bounds how
// long a record requested before the indexer caught up stays "not found".
export const revalidate = 300;

export default async function Page({ params }: PageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const gestureId = parseInt(id, 10);
  const gesture = Number.isFinite(gestureId) ? await readGesture(gestureId) : null;
  return (
    <PageMessages namespaces={['detail', 'gesture', 'tables']}>
      {/* The live cycle decides the record's trail and cycle link; the record is its own seed. */}
      <DashboardQuerySeed>
        <QuerySeed
          seeds={[
            {
              queryKey: ['gestureInfo', gestureId],
              data: gesture?.data ?? null,
              at: gesture?.at ?? 0,
            },
          ]}
        >
          <GesturePage gestureId={gestureId} />
        </QuerySeed>
      </DashboardQuerySeed>
    </PageMessages>
  );
}
