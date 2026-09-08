'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import {
  CHAT_PAGE_SIZE,
  ChatApiUnavailableError,
  ChatFeedResetError,
  getChatApiBase,
  getChatContext,
  getChatLegacyGestures,
  getChatMessages,
  type ChatRequestOptions,
} from '@/services/api/chat';
import type { GestureInfo } from '@/services/api';
import { useUxScenarioSnapshot } from '@/lib/uxCycleScenarios';

const LEGACY_REPROBE_MS = 5 * 60_000;
// A busy cycle may need more than one update page. Bound a polling pass,
// retaining the last completed cursor so the next pass continues without gaps.
const MAX_SYNC_PAGES = 20;
const EMPTY_GESTURES: GestureInfo[] = [];

export interface HomeFeedSnapshot {
  mode: 'legacy' | 'paged';
  gestures: GestureInfo[];
  latestGesture: GestureInfo | null;
  chatGestures: GestureInfo[];
  legacyMessages?: GestureInfo[];
  visibleCount: number;
  nextCursor?: string;
  syncCursor?: string;
  revision: string;
  checkedAt: number;
  invalidated?: boolean;
}

function newestFirst(left: GestureInfo, right: GestureInfo): number {
  return right.TimeStamp - left.TimeStamp || right.EvtLogId - left.EvtLogId;
}

function messagesFrom(gestures: GestureInfo[]): GestureInfo[] {
  return gestures.filter((row) => row.Message?.trim()).sort(newestFirst);
}

function mergeMessages(previous: GestureInfo[], next: GestureInfo[]): GestureInfo[] {
  const unique = new Map(previous.map((row) => [row.EvtLogId, row]));
  for (const row of next) unique.set(row.EvtLogId, row);
  return [...unique.values()].sort(newestFirst);
}

function legacySnapshot(
  gestures: GestureInfo[],
  visibleCount: number,
  checkedAt: number,
): HomeFeedSnapshot {
  const legacyMessages = messagesFrom(gestures);
  return {
    mode: 'legacy',
    gestures,
    latestGesture: [...gestures].sort(newestFirst)[0] ?? null,
    chatGestures: legacyMessages.slice(0, visibleCount),
    legacyMessages,
    visibleCount,
    revision: 'legacy',
    checkedAt,
  };
}

async function initialPaged(cycle: number, options: ChatRequestOptions): Promise<HomeFeedSnapshot> {
  const page = await getChatMessages(cycle, options);
  const [context, latest] = await Promise.all([
    getChatContext(cycle, options),
    getChatLegacyGestures(cycle, options, 1),
  ]);
  if (context.revision !== page.meta.revision) throw new ChatFeedResetError('Chat history changed');
  return {
    mode: 'paged',
    gestures: context.gestures,
    latestGesture: latest[0] ?? null,
    chatGestures: page.gestures,
    visibleCount: CHAT_PAGE_SIZE,
    nextCursor: page.meta.nextCursor,
    syncCursor: page.meta.syncCursor,
    revision: page.meta.revision,
    checkedAt: Date.now(),
  };
}

async function refreshPaged(
  cycle: number,
  options: ChatRequestOptions,
  previous: HomeFeedSnapshot,
): Promise<HomeFeedSnapshot> {
  const [context, latest] = await Promise.all([
    getChatContext(cycle, options),
    getChatLegacyGestures(cycle, options, 1),
  ]);
  if (context.revision !== previous.revision) throw new ChatFeedResetError('Chat history changed');
  let syncCursor = previous.syncCursor;
  let chatGestures = previous.chatGestures;
  for (let pass = 0; pass < MAX_SYNC_PAGES; pass++) {
    const page = await getChatMessages(cycle, { ...options, after: syncCursor });
    if (page.meta.revision !== previous.revision)
      throw new ChatFeedResetError('Chat history changed');
    chatGestures = mergeMessages(chatGestures, page.gestures);
    syncCursor = page.meta.syncCursor;
    if (!page.meta.hasMore) break;
  }
  return {
    ...previous,
    gestures: context.gestures,
    latestGesture: latest[0] ?? null,
    chatGestures,
    syncCursor,
  };
}

/** Loads one coherent feed snapshot; unsupported endpoints alone permit fallback. */
export async function fetchHomeGestureFeed(
  cycle: number,
  options: ChatRequestOptions,
  previous?: HomeFeedSnapshot,
  onReset?: () => void,
): Promise<HomeFeedSnapshot> {
  if (previous?.mode === 'legacy' && Date.now() - previous.checkedAt < LEGACY_REPROBE_MS) {
    return legacySnapshot(
      await getChatLegacyGestures(cycle, options),
      previous.visibleCount,
      previous.checkedAt,
    );
  }
  try {
    if (previous?.mode === 'paged') return await refreshPaged(cycle, options, previous);
    return await initialPaged(cycle, options);
  } catch (error) {
    if (error instanceof ChatApiUnavailableError) {
      return legacySnapshot(
        await getChatLegacyGestures(cycle, options),
        previous?.visibleCount ?? CHAT_PAGE_SIZE,
        Date.now(),
      );
    }
    if (error instanceof ChatFeedResetError) {
      onReset?.();
      // One bounded restart also covers moderation changing between first
      // page and context reads. A further race surfaces for normal retry.
      return initialPaged(cycle, options);
    }
    throw error;
  }
}

export function useHomeGestureFeed(cycle: number, initialGestures?: GestureInfo[]) {
  const queryClient = useQueryClient();
  const scenario = useUxScenarioSnapshot();
  const base = getChatApiBase();
  const queryKey = useMemo(() => ['homeGestureFeed', base, cycle] as const, [base, cycle]);
  const scope = `${base}:${cycle}`;
  const olderRequest = useRef<AbortController | null>(null);
  const [olderState, setOlderState] = useState<{ scope: string; pending: boolean; error: unknown }>(
    { scope, pending: false, error: null },
  );

  const invalidateCachedFeed = useCallback(() => {
    queryClient.setQueryData<HomeFeedSnapshot>(queryKey, (cached) =>
      cached
        ? {
            ...cached,
            gestures: EMPTY_GESTURES,
            latestGesture: null,
            chatGestures: EMPTY_GESTURES,
            legacyMessages: undefined,
            nextCursor: undefined,
            syncCursor: undefined,
            revision: `invalidated:${cached.revision}`,
            invalidated: true,
          }
        : cached,
    );
  }, [queryClient, queryKey]);

  useEffect(
    () => () => {
      olderRequest.current?.abort();
      olderRequest.current = null;
    },
    [scope],
  );

  const query = useQuery({
    queryKey,
    queryFn: async ({ signal }) => {
      const previous = queryClient.getQueryData<HomeFeedSnapshot>(queryKey);
      const next = await fetchHomeGestureFeed(
        cycle,
        { base, signal },
        previous,
        invalidateCachedFeed,
      );
      const concurrent = queryClient.getQueryData<HomeFeedSnapshot>(queryKey);
      // A manual history request may have completed while a live refresh
      // was running. Preserve its older pages and its continuation boundary.
      if (
        next.mode === 'paged' &&
        concurrent?.mode === 'paged' &&
        next.revision === concurrent.revision &&
        concurrent !== previous
      ) {
        return {
          ...next,
          chatGestures: mergeMessages(concurrent.chatGestures, next.chatGestures),
          nextCursor: concurrent.nextCursor,
          visibleCount: concurrent.visibleCount,
        };
      }
      if (
        next.mode === 'legacy' &&
        concurrent?.mode === 'legacy' &&
        concurrent.visibleCount > next.visibleCount
      ) {
        return legacySnapshot(next.gestures, concurrent.visibleCount, next.checkedAt);
      }
      return next;
    },
    enabled: cycle >= 0 && !scenario,
    staleTime: 5_000,
    refetchInterval: olderState.scope === scope && olderState.pending ? false : 10_000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  const loadOlder = useCallback(async () => {
    if (olderRequest.current) return;
    const controller = new AbortController();
    olderRequest.current = controller;
    setOlderState({ scope, pending: true, error: null });
    try {
      await queryClient.cancelQueries({ queryKey, exact: true });
      const current = queryClient.getQueryData<HomeFeedSnapshot>(queryKey);
      if (!current || controller.signal.aborted) return;
      if (current.mode === 'legacy') {
        queryClient.setQueryData(
          queryKey,
          legacySnapshot(
            current.gestures,
            current.visibleCount + CHAT_PAGE_SIZE,
            current.checkedAt,
          ),
        );
        return;
      }
      if (!current.nextCursor) return;
      const page = await getChatMessages(cycle, {
        base,
        signal: controller.signal,
        cursor: current.nextCursor,
      });
      if (controller.signal.aborted) return;
      if (page.meta.revision !== current.revision)
        throw new ChatFeedResetError('Chat history changed');
      queryClient.setQueryData<HomeFeedSnapshot>(queryKey, (cached) => {
        if (!cached || cached.mode !== 'paged' || cached.revision !== page.meta.revision)
          return cached;
        return {
          ...cached,
          chatGestures: mergeMessages(cached.chatGestures, page.gestures),
          nextCursor: page.meta.nextCursor,
          visibleCount: cached.visibleCount + CHAT_PAGE_SIZE,
        };
      });
    } catch (error) {
      if (controller.signal.aborted) return;
      if (error instanceof ChatFeedResetError || error instanceof ChatApiUnavailableError) {
        if (error instanceof ChatFeedResetError) invalidateCachedFeed();
        try {
          const replacement = await fetchHomeGestureFeed(cycle, {
            base,
            signal: controller.signal,
          });
          if (!controller.signal.aborted) queryClient.setQueryData(queryKey, replacement);
        } catch (recoveryError) {
          if (!controller.signal.aborted)
            setOlderState({ scope, pending: false, error: recoveryError });
        }
      } else {
        setOlderState({ scope, pending: false, error });
      }
    } finally {
      if (olderRequest.current === controller) {
        olderRequest.current = null;
        setOlderState((current) =>
          current.scope === scope ? { ...current, pending: false } : current,
        );
      }
    }
  }, [base, cycle, queryClient, queryKey, scope, invalidateCachedFeed]);

  const seed = useMemo(
    () => (initialGestures ?? EMPTY_GESTURES).filter((row) => row.RoundNum === cycle),
    [initialGestures, cycle],
  );
  const sample = useMemo(
    () => (scenario ? legacySnapshot(scenario.gestures, CHAT_PAGE_SIZE, 0) : undefined),
    [scenario],
  );
  const snapshot = sample ?? query.data;
  const chatGestures = useMemo(
    () => snapshot?.chatGestures ?? messagesFrom(seed).slice(0, CHAT_PAGE_SIZE),
    [snapshot, seed],
  );
  const { refetch } = query;
  const retry = useCallback(() => {
    void refetch();
  }, [refetch]);
  return {
    gestures: snapshot?.gestures ?? seed,
    latestGesture: snapshot ? snapshot.latestGesture : (seed[0] ?? null),
    chatGestures,
    mode: snapshot?.mode,
    isLoading: !sample && (query.isLoading || Boolean(snapshot?.invalidated && query.isFetching)),
    error: sample ? null : query.error,
    hasMore:
      snapshot?.mode === 'paged'
        ? !!snapshot.nextCursor
        : (snapshot?.legacyMessages?.length ?? 0) > (snapshot?.visibleCount ?? CHAT_PAGE_SIZE),
    isLoadingOlder: olderState.scope === scope && olderState.pending,
    olderError: olderState.scope === scope ? olderState.error : null,
    loadOlder,
    retry,
    resetKey: `${scope}:${snapshot?.revision ?? 'pending'}`,
  };
}
