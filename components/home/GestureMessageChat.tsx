'use client';

import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import {
  ChevronDown,
  CircleCheck,
  Clock3,
  MessageCircle,
  Radio,
  Sparkles,
  TimerReset,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { formatSeconds, resolveGestureTypeCode } from '@/utils';

import { Link } from '@/i18n/navigation';
import { AddressChip } from '@/components/ui/address-chip';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DateTime } from '@/components/ui/date-time';
import { EmptyState } from '@/components/ui/empty-state';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { LinkifiedText } from '@/components/ui/linkified-text';
import { LiveStatus } from '@/components/ui/live-status';
import { Spinner } from '@/components/ui/spinner';
import { TxExplorerLink } from '@/components/ui/tx-status';
import type { GestureFeedSystemEvent } from '@/components/home/deck/feedSystemEvents';
import { useBannedGestures } from '@/hooks/useApiQuery';
import { useLivePulse } from '@/hooks/useLivePulse';
import { cn } from '@/lib/utils';
import type { GestureInfo } from '@/services/api';
import { formatAddress, formatAmount, formatCount, sameAddress } from '@/utils/format';
import {
  CalibrationWindowIcon,
  ChronoWarriorIcon,
  CycleIcon,
  EnduranceChampionIcon,
  FinalCstGestureIcon,
} from '@/lib/conceptIcons';

/** One glyph per kind of cycle event; the sentence carries the meaning. */
const EVENT_ICON = {
  cycleStart: Sparkles,
  cycleOpen: CycleIcon,
  enduranceGrowing: EnduranceChampionIcon,
  enduranceRecord: EnduranceChampionIcon,
  chronoLead: ChronoWarriorIcon,
  chronoReignEnded: ChronoWarriorIcon,
  finalCstLeader: FinalCstGestureIcon,
  newParticipant: Users,
  gestureMilestone: Radio,
  cstCalibrationReady: CalibrationWindowIcon,
  finalWindow: Clock3,
  clockExtended: TimerReset,
  clockReopened: TimerReset,
  finalizationAvailable: CircleCheck,
  cycleFinalized: CircleCheck,
} satisfies Record<GestureFeedSystemEvent['kind'], LucideIcon>;

/** A just-submitted message shown instantly while the indexer catches up. */
export interface PendingChatMessage {
  id: string;
  address: string;
  message: string;
  /** Submission time in Unix seconds, before its confirmed block time is known. */
  timestamp: number;
  /** The confirmed Gesture's transaction, for its explorer link. */
  txHash?: string | null;
  /** The indexer has not echoed it for a while: say so and link the proof. */
  stale?: boolean;
}

export type ChatView = 'messages' | 'all';

interface GestureMessageChatProps {
  gestures: GestureInfo[];
  cycleNumber?: number;
  className?: string;
  /** Changes when a Gesture lands: the newest message settles in. */
  pulseKey?: number;
  /** When provided, the empty state offers a "Make a Gesture" call to action. */
  onJoinCta?: () => void;
  /** Derived cycle moments interleaved with participant messages by timestamp. */
  systemEvents?: GestureFeedSystemEvent[];
  /** Optimistic messages rendered on top of the feed until indexed. */
  pendingMessages?: PendingChatMessage[];
  pagination?: {
    hasMore: boolean;
    isLoading: boolean;
    error: boolean;
    onLoadMore: () => Promise<void>;
  };
  isLoading?: boolean;
  /** The first read failed and there is no history to show. */
  error?: boolean;
  onRetry?: () => void;
  /** A new cycle or corrected history starts at the newest entries again. */
  resetKey?: string;
  /** Paged responses are already moderated against the backend's own row IDs. */
  serverModerated?: boolean;
  /** The connected wallet: its own messages carry a "You" tag. */
  account?: string | null;
}

const SYSTEM_EVENTS_PER_PAGE = 50;
/** Rows a phone shows before "Show more"; it never scrolls inside the page. */
const PHONE_ROWS = 8;
const PHONE_ROWS_STEP = 12;

interface GestureChatMessage {
  gesture: GestureInfo;
  message: string;
}

type FeedItem =
  | { type: 'message'; timestamp: number; entry: GestureChatMessage }
  | { type: 'system'; timestamp: number; event: GestureFeedSystemEvent };

type FeedRow =
  | { type: 'message'; key: string; entry: GestureChatMessage }
  | { type: 'event'; key: string; event: GestureFeedSystemEvent }
  | { type: 'events'; key: string; events: GestureFeedSystemEvent[] };

function getGestureChatMessages(
  gestures: GestureInfo[],
  bannedGestureIds: Set<number>,
): GestureChatMessage[] {
  return gestures
    .map((gesture) => ({
      gesture,
      message: typeof gesture.Message === 'string' ? gesture.Message.trim() : '',
    }))
    .filter(({ gesture, message }) => message.length > 0 && !bannedGestureIds.has(gesture.EvtLogId))
    .sort((a, b) => {
      const timeDiff = (b.gesture.TimeStamp ?? 0) - (a.gesture.TimeStamp ?? 0);
      return timeDiff !== 0 ? timeDiff : (b.gesture.EvtLogId ?? 0) - (a.gesture.EvtLogId ?? 0);
    });
}

/** Newest first; a message and a same-second system event keep the message on top. */
function mergeFeedItems(
  messages: GestureChatMessage[],
  systemEvents: GestureFeedSystemEvent[],
): FeedItem[] {
  const items: FeedItem[] = [
    ...messages.map(
      (entry): FeedItem => ({ type: 'message', timestamp: entry.gesture.TimeStamp ?? 0, entry }),
    ),
    ...systemEvents.map(
      (event): FeedItem => ({ type: 'system', timestamp: event.timestamp, event }),
    ),
  ];
  return items.sort((a, b) => {
    const timeDiff = b.timestamp - a.timestamp;
    if (timeDiff !== 0) return timeDiff;
    if (a.type !== b.type) return a.type === 'message' ? -1 : 1;
    return 0;
  });
}

function messageKey(gesture: GestureInfo, index: number): string {
  return Number.isFinite(gesture.EvtLogId)
    ? String(gesture.EvtLogId)
    : `${gesture.BidderAddr}-${gesture.TimeStamp}-${index}`;
}

/**
 * Messages lead. Between two messages, the cycle events that happened in
 * between fold into one line ("3 cycle events") that opens in place; a lone
 * event stays a compact row. The "All activity" view lists every event.
 */
export function buildFeedRows(items: FeedItem[], view: ChatView): FeedRow[] {
  const rows: FeedRow[] = [];
  let run: GestureFeedSystemEvent[] = [];
  const flush = () => {
    if (run.length === 0) return;
    if (view === 'messages' && run.length > 1) {
      rows.push({ type: 'events', key: `events:${run[0]!.id}`, events: run });
    } else {
      for (const event of run) rows.push({ type: 'event', key: `event:${event.id}`, event });
    }
    run = [];
  };
  items.forEach((item, index) => {
    if (item.type === 'system') {
      run.push(item.event);
      return;
    }
    flush();
    rows.push({
      type: 'message',
      key: `message:${messageKey(item.entry.gesture, index)}`,
      entry: item.entry,
    });
  });
  flush();
  return rows;
}

/** The method and cost of a Gesture as one short tag ("0.1021 ETH + RWLK"). */
function useMethodTag() {
  const t = useTranslations('home');
  const locale = useLocale();
  return (gesture: GestureInfo): string => {
    const typeCode = resolveGestureTypeCode(gesture);
    if (typeCode === 2) {
      const cost =
        typeof gesture.CstCost === 'number' && gesture.CstCost >= 0 ? gesture.CstCost : null;
      return cost != null
        ? t('chat.badge.cst', {
            amount: formatAmount(cost, { unit: 'CST', locale, context: 'table', withUnit: false }),
          })
        : t('chat.badge.cstFallback');
    }
    const cost =
      typeof gesture.GestureCostEth === 'number' && gesture.GestureCostEth >= 0
        ? gesture.GestureCostEth
        : null;
    const amount =
      cost != null
        ? formatAmount(cost, { unit: 'ETH', locale, context: 'table', withUnit: false })
        : null;
    if (typeCode === 1) {
      return amount != null ? t('chat.badge.ethRwlk', { amount }) : t('chat.badge.rwlkFallback');
    }
    return amount != null ? t('chat.badge.eth', { amount }) : t('chat.badge.ethFallback');
  };
}

function EventSentence({ event }: { event: GestureFeedSystemEvent }) {
  const t = useTranslations('home');
  const locale = useLocale();
  return (
    <>
      {t(`chat.system.${event.kind}`, {
        ...(event.cycleNumber != null ? { number: String(event.cycleNumber) } : {}),
        ...(event.address ? { address: formatAddress(event.address) } : {}),
        ...(event.durationSeconds != null
          ? { duration: formatSeconds(event.durationSeconds, locale) }
          : {}),
        ...(event.count != null ? { count: formatCount(event.count, locale) } : {}),
      })}
    </>
  );
}

/** A cycle event as one compact line: glyph, sentence, when. Never a heading. */
function SystemEventRow({ event }: { event: GestureFeedSystemEvent }) {
  const Icon = EVENT_ICON[event.kind];
  return (
    <div
      data-testid="chat-system-event"
      data-kind={event.kind}
      className="flex min-w-0 items-start gap-3 py-2.5"
    >
      <Icon className="mt-0.5 size-4 shrink-0 text-subtle" aria-hidden />
      <p className="type-body-sm min-w-0 flex-1 text-muted-foreground [overflow-wrap:anywhere]">
        <EventSentence event={event} />
      </p>
      <DateTime
        timestamp={event.timestamp}
        variant="relative"
        className="type-caption mt-0.5 shrink-0 text-subtle"
      />
    </div>
  );
}

/** Several events between two messages: one line that opens in place. */
function EventGroupRow({ events }: { events: GestureFeedSystemEvent[] }) {
  const t = useTranslations('home');
  const newest = events[0]!;
  const Icon = EVENT_ICON[newest.kind];
  return (
    <details data-testid="chat-event-group" data-count={events.length} className="group/events">
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-3 py-1.5 [&::-webkit-details-marker]:hidden">
        <Icon className="size-4 shrink-0 text-subtle" aria-hidden />
        <span className="type-label min-w-0 flex-1 text-muted-foreground">
          {t('chat.eventGroup', { count: events.length })}
        </span>
        <DateTime
          timestamp={newest.timestamp}
          variant="relative"
          className="type-caption shrink-0 text-subtle"
        />
        <ChevronDown
          className="size-4 shrink-0 text-subtle transition-transform duration-[var(--duration-base)] group-open/events:rotate-180 motion-reduce:transition-none"
          aria-hidden
        />
      </summary>
      <ul role="list" className="ms-7 divide-y divide-rule-faint border-s border-rule-faint ps-3">
        {events.map((event) => (
          <li key={event.id}>
            <SystemEventRow event={event} />
          </li>
        ))}
      </ul>
    </details>
  );
}

function MessageRow({
  entry,
  isOwn,
  settling,
  methodTag,
}: {
  entry: GestureChatMessage;
  isOwn: boolean;
  settling: boolean;
  methodTag: string;
}) {
  const t = useTranslations('home');
  const { gesture, message } = entry;
  const gestureId = Number.isFinite(gesture.EvtLogId) ? gesture.EvtLogId : null;
  const position = typeof gesture.BidPosition === 'number' ? gesture.BidPosition : null;
  return (
    <article
      data-testid="chat-message"
      data-settling={settling || undefined}
      aria-label={t('chat.messageAria', { address: formatAddress(gesture.BidderAddr) })}
      className={cn(
        'relative py-3.5',
        // The newest message settles in with the live rule for 900ms.
        "before:absolute before:inset-y-3 before:-start-3 before:w-0.5 before:rounded-full before:bg-live before:opacity-0 before:transition-opacity before:duration-[var(--duration-settle)] before:content-['']",
        settling && 'before:opacity-100',
      )}
    >
      <div
        data-testid="gesture-message-meta"
        className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1"
      >
        <AddressChip address={gesture.BidderAddr} variant="plain" label={false} />
        {isOwn && (
          <Badge tone="accent" size="sm">
            {t('chat.you')}
          </Badge>
        )}
        <span data-testid="gesture-method-badge" className="type-caption text-subtle">
          {methodTag}
        </span>
        {gestureId != null && (
          <Link
            href={`/gesture/${gestureId}`}
            className="link-quiet type-caption tabular-nums text-subtle hover:text-foreground"
            aria-label={t('chat.openPositionAria', { position: String(position ?? gestureId) })}
          >
            #{position ?? gestureId}
          </Link>
        )}
        <DateTime
          timestamp={gesture.TimeStamp}
          variant="relative"
          className="type-caption ms-auto text-subtle"
        />
      </div>
      <p className="type-body-sm mt-1.5 whitespace-pre-wrap text-foreground [overflow-wrap:anywhere]">
        <LinkifiedText text={message} />
      </p>
    </article>
  );
}

function PendingMessageRow({ pending }: { pending: PendingChatMessage }) {
  const t = useTranslations('home');
  return (
    <article
      data-testid="chat-pending-message"
      data-stale={pending.stale || undefined}
      aria-label={t('chat.pending.aria')}
      className="py-3.5"
    >
      <div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1">
        <AddressChip address={pending.address} variant="plain" label={false} />
        <Badge
          tone="accent"
          size="sm"
          icon={pending.stale ? undefined : <Spinner size="sm" className="size-3" />}
        >
          {pending.stale ? t('chat.pending.stillIndexing') : t('chat.pending.label')}
        </Badge>
        {pending.txHash && (
          <TxExplorerLink
            hash={pending.txHash}
            label={t('chat.pending.viewTransaction')}
            className="type-caption ms-auto"
          />
        )}
      </div>
      <p className="type-body-sm mt-1.5 whitespace-pre-wrap text-foreground [overflow-wrap:anywhere]">
        {pending.message}
      </p>
    </article>
  );
}

/**
 * The cycle's Gesture Chat: participants' messages lead, newest first, as
 * ruled rows on one frame. Cycle events between two messages fold into one
 * line that opens in place; "All activity" lists every event. On phones the
 * feed is part of the page (the newest rows, then "Show more"); from 1024px
 * it scrolls inside its frame. Its freshness stamp says when the feed last
 * updated and turns to "Reconnecting" or "Updates delayed" when refreshes
 * fail, while the history already on screen stays.
 */
export function GestureMessageChat({
  gestures,
  cycleNumber,
  className,
  pulseKey = 0,
  onJoinCta,
  systemEvents,
  pendingMessages,
  pagination,
  isLoading = false,
  error = false,
  onRetry,
  resetKey,
  serverModerated = false,
  account = null,
}: GestureMessageChatProps) {
  const t = useTranslations('home');
  const titleId = useId();
  const methodTag = useMethodTag();
  const { data: bannedGestures } = useBannedGestures();
  const bannedGestureIds = useMemo(
    () => new Set(serverModerated ? [] : (bannedGestures ?? []).map((gesture) => gesture.bid_id)),
    [bannedGestures, serverModerated],
  );
  const messages = useMemo(
    () => getGestureChatMessages(gestures, bannedGestureIds),
    [gestures, bannedGestureIds],
  );
  const [view, setView] = useState<ChatView>('messages');
  const [eventWindow, setEventWindow] = useState({ key: resetKey, limit: SYSTEM_EVENTS_PER_PAGE });
  const eventLimit = eventWindow.key === resetKey ? eventWindow.limit : SYSTEM_EVENTS_PER_PAGE;
  const [phoneWindow, setPhoneWindow] = useState({ key: resetKey, rows: PHONE_ROWS });
  const phoneRows = phoneWindow.key === resetKey ? phoneWindow.rows : PHONE_ROWS;
  const [isPrinting, setIsPrinting] = useState(false);
  const visibleEvents = useMemo(() => {
    const newestFirst = [...(systemEvents ?? [])].sort((a, b) => b.timestamp - a.timestamp);
    return isPrinting ? newestFirst : newestFirst.slice(0, eventLimit);
  }, [systemEvents, eventLimit, isPrinting]);
  const rows = useMemo(
    () => buildFeedRows(mergeFeedItems(messages, visibleEvents), view),
    [messages, visibleEvents, view],
  );
  const pending = pendingMessages ?? [];
  const hasFeedContent = rows.length > 0 || pending.length > 0;
  const hasMoreEvents = (systemEvents?.length ?? 0) > eventLimit;
  const hasOlderContent = hasMoreEvents || Boolean(pagination?.hasMore);
  const hiddenOnPhones = !isPrinting && rows.length + pending.length > phoneRows;
  const newestMessage = messages[0] ?? null;
  const isSettling = useLivePulse(pulseKey);

  const scrollRef = useRef<HTMLDivElement>(null);
  const previousResetKey = useRef(resetKey);
  const readingAnchor = useRef<{ key: string | null; offset: number } | null>(null);
  const rememberReadingPosition = useCallback(() => {
    const scroll = scrollRef.current;
    if (!scroll) return;
    if (scroll.scrollTop <= 2) {
      readingAnchor.current = { key: null, offset: 0 };
      return;
    }
    const top = scroll.getBoundingClientRect().top;
    const row = Array.from(scroll.querySelectorAll<HTMLElement>('[data-chat-row]')).find(
      (element) => element.getBoundingClientRect().bottom > top,
    );
    if (row) {
      readingAnchor.current = {
        key: row.dataset.chatRow ?? null,
        offset: row.getBoundingClientRect().top - top,
      };
    }
  }, []);

  // Keep the row being read at the same position when fresh messages arrive or
  // older history is appended. This also covers browsers without scroll anchoring.
  useLayoutEffect(() => {
    const scroll = scrollRef.current;
    if (!scroll || isPrinting) return;
    const anchor = readingAnchor.current;
    if (previousResetKey.current !== resetKey || anchor?.key === null) {
      scroll.scrollTop = 0;
    } else if (anchor?.key) {
      const row = Array.from(scroll.querySelectorAll<HTMLElement>('[data-chat-row]')).find(
        (element) => element.dataset.chatRow === anchor.key,
      );
      if (row) {
        scroll.scrollTop +=
          row.getBoundingClientRect().top - scroll.getBoundingClientRect().top - anchor.offset;
      }
    }
    previousResetKey.current = resetKey;
    rememberReadingPosition();
  }, [rows, pendingMessages, isPrinting, resetKey, rememberReadingPosition]);

  // Printing renders known history only; it never starts a network request.
  useEffect(() => {
    const printMedia = window.matchMedia?.('print');
    const beforePrint = () => flushSync(() => setIsPrinting(true));
    const afterPrint = () => setIsPrinting(false);
    const mediaChanged = (event: MediaQueryListEvent) => setIsPrinting(event.matches);
    printMedia?.addEventListener('change', mediaChanged);
    window.addEventListener('beforeprint', beforePrint);
    window.addEventListener('afterprint', afterPrint);
    return () => {
      printMedia?.removeEventListener('change', mediaChanged);
      window.removeEventListener('beforeprint', beforePrint);
      window.removeEventListener('afterprint', afterPrint);
    };
  }, []);

  const loadOlder = () => {
    if (pagination?.isLoading) return;
    rememberReadingPosition();
    if (hasMoreEvents && !pagination?.error) {
      setEventWindow({ key: resetKey, limit: eventLimit + SYSTEM_EVENTS_PER_PAGE });
    }
    if (pagination?.hasMore || pagination?.error) void pagination.onLoadMore();
  };
  const showMoreOnPhones = () =>
    setPhoneWindow({ key: resetKey, rows: phoneRows + PHONE_ROWS_STEP });

  const summary =
    cycleNumber != null
      ? t('chat.cycleNumber', { number: String(cycleNumber) })
      : t('chat.currentCycle');
  const counts =
    isLoading || error
      ? null
      : hasOlderContent
        ? t('chat.history.showing', { messages: messages.length, events: visibleEvents.length })
        : [
            t('chat.messageCount', { count: messages.length }),
            t('chat.eventCount', { count: visibleEvents.length }),
          ].join(' · ');

  return (
    // One landmark only: the history region below, named by the title. The
    // frame itself is a plain container, so the two never share a name.
    <div
      data-testid="gesture-message-chat"
      className={cn(
        'flex min-w-0 flex-col rounded-surface border border-rule-faint bg-surface/60 print:h-auto print:break-inside-avoid',
        className,
      )}
    >
      <header className="flex shrink-0 flex-wrap items-start justify-between gap-x-4 gap-y-1 border-b border-rule-faint px-5 py-4 sm:px-6">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h2 id={titleId} className="type-title text-foreground">
              {t('chat.title')}
            </h2>
            <InfoTooltip content={t('chat.joinTooltip')} label={t('chat.title')} />
          </div>
          <p className="type-caption mt-0.5 text-subtle">
            {summary}
            {counts ? ` · ${counts}` : null}
          </p>
        </div>
        <LiveStatus
          variant="inline"
          still
          queryKeys={[['homeGestureFeed']]}
          className="mt-1 print:hidden"
        />
      </header>

      {hasFeedContent && !isLoading && !error && (
        <div
          role="group"
          aria-label={t('chat.viewLabel')}
          className="flex shrink-0 gap-1 border-b border-rule-faint px-5 py-2 sm:px-6 print:hidden"
        >
          {(['messages', 'all'] as const).map((option) => (
            <Button
              key={option}
              type="button"
              size="sm"
              variant={view === option ? 'secondary' : 'ghost'}
              aria-pressed={view === option}
              onClick={() => setView(option)}
              className={cn('h-8 min-h-8 px-3', view !== option && 'text-muted-foreground')}
            >
              {t(`chat.view.${option}`)}
            </Button>
          ))}
        </div>
      )}

      {/* From 1024px the feed scrolls inside the frame; below it is part of the page. */}
      <div className="relative min-h-0 lg:min-h-[24rem] lg:flex-1 print:min-h-0">
        <div
          ref={scrollRef}
          data-testid="gesture-message-chat-scroll"
          role="region"
          aria-labelledby={titleId}
          tabIndex={0}
          onScroll={isPrinting ? undefined : rememberReadingPosition}
          className="focus-ring-inset px-5 sm:px-6 lg:absolute lg:inset-0 lg:overflow-y-auto lg:overscroll-y-contain lg:[scrollbar-gutter:stable] print:static print:overflow-visible"
        >
          {isLoading ? (
            <div
              role="status"
              className="type-body-sm flex items-center gap-2 py-4 text-muted-foreground print:hidden"
            >
              <Spinner className="size-4" aria-hidden="true" />
              {t('chat.history.loading')}
            </div>
          ) : error ? (
            <div role="status" className="space-y-3 py-4 print:hidden">
              <p className="type-body-sm text-muted-foreground">{t('chat.history.error')}</p>
              {onRetry ? (
                <Button variant="secondary" size="sm" onClick={onRetry}>
                  {t('chat.history.retry')}
                </Button>
              ) : null}
            </div>
          ) : null}

          {!isLoading &&
          !error &&
          hasFeedContent &&
          messages.length === 0 &&
          pending.length === 0 &&
          onJoinCta ? (
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rule-faint py-3">
              <p className="type-body-sm text-muted-foreground">{t('chat.empty.messagesFirst')}</p>
              <Button variant="secondary" size="sm" onClick={onJoinCta}>
                {t('chat.empty.cta')}
              </Button>
            </div>
          ) : null}

          {hasFeedContent && !isLoading && !error ? (
            <ol role="list" className="divide-y divide-rule-faint">
              {pending.map((entry, index) => (
                <li
                  key={entry.id}
                  data-chat-row={`pending:${entry.id}`}
                  className={cn(!isPrinting && index >= phoneRows && 'max-lg:hidden')}
                >
                  <PendingMessageRow pending={entry} />
                </li>
              ))}
              {rows.map((row, index) => (
                <li
                  key={row.key}
                  data-chat-row={row.key}
                  className={cn(
                    !isPrinting && pending.length + index >= phoneRows && 'max-lg:hidden',
                  )}
                >
                  {row.type === 'message' ? (
                    <MessageRow
                      entry={row.entry}
                      isOwn={sameAddress(row.entry.gesture.BidderAddr, account)}
                      settling={isSettling && row.entry === newestMessage}
                      methodTag={methodTag(row.entry.gesture)}
                    />
                  ) : row.type === 'event' ? (
                    <SystemEventRow event={row.event} />
                  ) : (
                    <EventGroupRow events={row.events} />
                  )}
                </li>
              ))}
            </ol>
          ) : !isLoading && !error ? (
            <EmptyState
              variant="inline"
              headingLevel={3}
              icon={<MessageCircle className="size-6 text-subtle" aria-hidden />}
              title={t('chat.empty.title')}
              description={t('chat.empty.description')}
              action={
                onJoinCta ? (
                  <Button variant="secondary" size="sm" onClick={onJoinCta}>
                    {t('chat.empty.cta')}
                  </Button>
                ) : undefined
              }
              className="py-10"
            />
          ) : null}

          {!isLoading && !error && (hiddenOnPhones || hasOlderContent || pagination?.error) ? (
            <div className="space-y-2 border-t border-rule-faint py-4 print:hidden">
              {pagination?.error ? (
                <p role="status" className="type-body-sm text-muted-foreground">
                  {t('chat.history.olderError')}
                </p>
              ) : null}
              {hiddenOnPhones ? (
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full whitespace-normal lg:hidden"
                  onClick={showMoreOnPhones}
                >
                  {t('chat.history.showMore')}
                </Button>
              ) : null}
              {hasOlderContent || pagination?.error ? (
                <Button
                  type="button"
                  variant="secondary"
                  loading={pagination?.isLoading}
                  className={cn('w-full whitespace-normal', hiddenOnPhones && 'max-lg:hidden')}
                  onClick={loadOlder}
                >
                  {pagination?.isLoading
                    ? t('chat.history.loadingOlder')
                    : pagination?.error
                      ? t('chat.history.retry')
                      : t('chat.history.loadOlder')}
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
