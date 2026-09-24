'use client';

import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import {
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
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { tabsListVariants, tabsTriggerVariants } from '@/components/ui/tabs';
import { TxExplorerLink } from '@/components/ui/tx-status';
import type { GestureFeedSystemEvent } from '@/components/home/deck/feedSystemEvents';
import { useBannedGestures } from '@/hooks/useApiQuery';
import { useLivePulse } from '@/hooks/useLivePulse';
import { TOUCH_TARGET_EXTENDED_CLASS } from '@/lib/touch-target';
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

/** The loading feed: three message rows whose text runs to different lengths. */
const CHAT_SKELETON_ROWS = ['72%', '88%', '56%'] as const;

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
/** Messages a phone shows before "Show more"; the feed never scrolls inside the page. */
const PHONE_MESSAGES = 6;
const PHONE_MESSAGES_STEP = 10;
/** Height of the fade at an edge of the desktop feed with more to scroll that way. */
const SCROLL_FADE = '3rem';
/** An event-only feed is limited by rows instead. */
const PHONE_EVENT_ROWS = 8;

/**
 * How many leading rows a phone shows: every row up to and including the
 * `messageLimit`-th message (pending rows count as messages), so messages
 * lead and the events between them come along; an event-only feed shows its
 * first rows.
 */
export function phoneVisibleRows(
  rows: readonly { type: string }[],
  pendingCount: number,
  messageLimit: number,
): number {
  if (pendingCount >= messageLimit) return pendingCount;
  let messages = pendingCount;
  for (let index = 0; index < rows.length; index += 1) {
    if (rows[index]!.type !== 'message') continue;
    messages += 1;
    if (messages === messageLimit) return pendingCount + index + 1;
  }
  const total = pendingCount + rows.length;
  // Fewer messages than the limit: all of it, unless the feed is events alone,
  // which grows by rows as "Show more" raises the limit.
  return messages > 0 ? total : Math.min(total, PHONE_EVENT_ROWS + messageLimit - PHONE_MESSAGES);
}

interface GestureChatMessage {
  gesture: GestureInfo;
  message: string;
}

type FeedItem =
  | { type: 'message'; timestamp: number; entry: GestureChatMessage }
  | { type: 'system'; timestamp: number; event: GestureFeedSystemEvent };

type FeedRow =
  | { type: 'message'; key: string; entry: GestureChatMessage }
  | { type: 'event'; key: string; event: GestureFeedSystemEvent };

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
 * The "Messages" view lists participants' messages only, as its name says;
 * "All activity" lists every cycle event between them, each as one compact
 * row.
 */
export function buildFeedRows(items: FeedItem[], view: ChatView): FeedRow[] {
  const rows: FeedRow[] = [];
  items.forEach((item, index) => {
    if (item.type === 'system') {
      if (view === 'all') {
        rows.push({ type: 'event', key: `event:${item.event.id}`, event: item.event });
      }
      return;
    }
    rows.push({
      type: 'message',
      key: `message:${messageKey(item.entry.gesture, index)}`,
      entry: item.entry,
    });
  });
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
        className="flex min-w-0 items-center justify-between gap-3"
      >
        <span className="flex min-w-0 items-center gap-2">
          {/* Authorship recedes so the message leads, as the ledger sets addresses. */}
          <AddressChip
            address={gesture.BidderAddr}
            variant="plain"
            label={false}
            className="type-hash text-muted-foreground"
          />
          {isOwn && (
            <Badge tone="accent" size="sm">
              {t('chat.you')}
            </Badge>
          )}
        </span>
        <DateTime
          timestamp={gesture.TimeStamp}
          variant="relative"
          className="type-caption shrink-0 text-subtle"
        />
      </div>
      <p className="type-body-sm mt-1.5 whitespace-pre-wrap text-foreground [overflow-wrap:anywhere]">
        <LinkifiedText text={message} />
      </p>
      {/* How the Gesture was made: the method and cost, and its place in the cycle. */}
      <p className="type-caption mt-1.5 flex flex-wrap items-center gap-x-2 text-subtle">
        <span data-testid="gesture-method-badge">{methodTag}</span>
        {gestureId != null && (
          <>
            <span aria-hidden>·</span>
            <Link
              href={`/gesture/${gestureId}`}
              data-touch-target="extended"
              className={cn(
                'link-quiet tabular-nums text-subtle hover:text-foreground',
                // A 44px hit area on phones without growing the line.
                TOUCH_TARGET_EXTENDED_CLASS,
              )}
              aria-label={t('chat.openPositionAria', { position: String(position ?? gestureId) })}
            >
              #{position ?? gestureId}
            </Link>
          </>
        )}
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
        <AddressChip
          address={pending.address}
          variant="plain"
          label={false}
          className="type-hash text-muted-foreground"
        />
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
 * The cycle's Gesture Chat: participants' messages, newest first, as ruled
 * rows on the page ground under one hairline (no box, like the ledger beside
 * it). "Messages" lists only messages; "All activity" adds every cycle
 * event, each as one compact row. On phones the feed is part of the page
 * (the newest rows, then "Show more"); from 1024px it scrolls inside its
 * region, fading at an edge with more to read. Its freshness stamp says when the feed last updated and
 * turns to "Reconnecting" or "Updates delayed" when refreshes fail, while
 * the history already on screen stays.
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
  const [phoneWindow, setPhoneWindow] = useState({ key: resetKey, messages: PHONE_MESSAGES });
  const phoneMessages = phoneWindow.key === resetKey ? phoneWindow.messages : PHONE_MESSAGES;
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
  // The view switch stays while anything is on record, so an events-only
  // cycle can still open "All activity" from an empty "Messages" view.
  const hasAnyContent = hasFeedContent || visibleEvents.length > 0;
  const noMessagesYet = view === 'messages' && messages.length === 0 && pending.length === 0;
  const knownEvents = systemEvents?.length ?? 0;
  // Events are paged on the client and only "All activity" lists them, so in
  // "Messages" only older messages from the server are older content: "Load
  // older" never shows there without something to add.
  const hasMoreEvents = view === 'all' && knownEvents > eventLimit;
  const hasOlderContent = hasMoreEvents || Boolean(pagination?.hasMore);
  // "Messages" windows no event rows, so it counts every event on record.
  const countedEvents = view === 'all' ? visibleEvents.length : knownEvents;
  const phoneRows = phoneVisibleRows(rows, pending.length, phoneMessages);
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

  // From 1024px the feed scrolls inside its frame: each edge fades while there
  // is more to read that way, so the last visible row never ends at a hard cut.
  const [scrollEdges, setScrollEdges] = useState({ top: false, bottom: false });
  const measureScrollEdges = useCallback(() => {
    const scroll = scrollRef.current;
    if (!scroll) return;
    const max = scroll.scrollHeight - scroll.clientHeight;
    const next = { top: scroll.scrollTop > 1, bottom: max - scroll.scrollTop > 1 };
    setScrollEdges((current) =>
      current.top === next.top && current.bottom === next.bottom ? current : next,
    );
  }, []);
  useEffect(() => {
    const scroll = scrollRef.current;
    if (!scroll || typeof ResizeObserver === 'undefined') return undefined;
    const resize = new ResizeObserver(measureScrollEdges);
    resize.observe(scroll);
    return () => resize.disconnect();
  }, [measureScrollEdges]);
  const handleScroll = useCallback(() => {
    rememberReadingPosition();
    measureScrollEdges();
  }, [measureScrollEdges, rememberReadingPosition]);

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
    measureScrollEdges();
  }, [rows, pendingMessages, isPrinting, resetKey, rememberReadingPosition, measureScrollEdges]);

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
    // Only in "All activity", the one view that lists events.
    if (hasMoreEvents && !pagination?.error) {
      setEventWindow({ key: resetKey, limit: eventLimit + SYSTEM_EVENTS_PER_PAGE });
    }
    if (pagination?.hasMore || pagination?.error) void pagination.onLoadMore();
  };
  const showMoreOnPhones = () =>
    setPhoneWindow({ key: resetKey, messages: phoneMessages + PHONE_MESSAGES_STEP });

  const scrollMask =
    !isPrinting && (scrollEdges.top || scrollEdges.bottom)
      ? `linear-gradient(to bottom, transparent 0, #000 ${scrollEdges.top ? SCROLL_FADE : '0px'}, #000 calc(100% - ${scrollEdges.bottom ? SCROLL_FADE : '0px'}), transparent 100%)`
      : undefined;

  const summary =
    cycleNumber != null
      ? t('chat.cycleNumber', { number: String(cycleNumber) })
      : t('chat.currentCycle');
  const counts =
    isLoading || error
      ? null
      : hasOlderContent
        ? t('chat.history.showing', { messages: messages.length, events: countedEvents })
        : [
            t('chat.messageCount', { count: messages.length }),
            t('chat.eventCount', { count: countedEvents }),
          ].join(' · ');

  return (
    // One landmark only: the history region below, named by the title. The
    // frame itself is a plain container, so the two never share a name.
    <div
      data-testid="gesture-message-chat"
      className={cn(
        'flex min-w-0 flex-col border-t border-rule print:h-auto print:break-inside-avoid',
        className,
      )}
    >
      <header className="flex shrink-0 flex-wrap items-start justify-between gap-x-4 gap-y-1 border-b border-rule-faint pb-3 pt-4">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h2 id={titleId} className="type-heading-3 text-foreground">
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
          // Its own line on phones, whatever the count line's length, so the
          // header keeps one shape as the history grows.
          className="mt-1 max-sm:w-full print:hidden"
        />
      </header>

      {hasAnyContent && !isLoading && !error && (
        <div className="shrink-0 border-b border-rule-faint py-2.5 print:hidden">
          <div
            role="group"
            aria-label={t('chat.viewLabel')}
            className={tabsListVariants({ variant: 'segmented' })}
          >
            {(['messages', 'all'] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={view === option}
                data-state={view === option ? 'active' : 'inactive'}
                onClick={() => setView(option)}
                className={tabsTriggerVariants({ variant: 'segmented' })}
              >
                {t(`chat.view.${option}`)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* From 1024px the feed scrolls inside its region; below it is part of the page. */}
      <div className="relative min-h-0 lg:min-h-[24rem] lg:flex-1 print:min-h-0">
        <div
          ref={scrollRef}
          data-testid="gesture-message-chat-scroll"
          role="region"
          aria-labelledby={titleId}
          tabIndex={0}
          onScroll={isPrinting ? undefined : handleScroll}
          data-overflow-top={(!isPrinting && scrollEdges.top) || undefined}
          data-overflow-bottom={(!isPrinting && scrollEdges.bottom) || undefined}
          // From 1024px the region starts 0.75rem before the text column, so
          // the newest message's settle rule is not clipped by the scroller.
          className="focus-ring-inset lg:absolute lg:inset-y-0 lg:-start-3 lg:end-0 lg:overflow-y-auto lg:overscroll-y-contain lg:ps-3 lg:[scrollbar-gutter:stable] print:static print:overflow-visible"
          style={scrollMask ? { maskImage: scrollMask, WebkitMaskImage: scrollMask } : undefined}
        >
          {isLoading ? (
            // The feed's own shape waits: message rows in skeleton, so nothing
            // jumps when the history lands. The status is spoken once.
            <div
              role="status"
              data-testid="chat-loading"
              className="divide-y divide-rule-faint print:hidden"
            >
              <span className="sr-only">{t('chat.history.loading')}</span>
              {CHAT_SKELETON_ROWS.map((width) => (
                <div key={width} aria-hidden className="py-3.5">
                  <Skeleton className="h-3.5 w-28" />
                  <Skeleton className="mt-2.5 h-4" style={{ width }} />
                  <Skeleton className="mt-2.5 h-3 w-20" />
                </div>
              ))}
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

          {!isLoading && !error && hasAnyContent && noMessagesYet ? (
            <div
              data-testid="chat-no-messages"
              className={cn(
                'flex flex-wrap items-center justify-between gap-3 py-3',
                hasFeedContent && 'border-b border-rule-faint',
              )}
            >
              <p className="type-body-sm text-muted-foreground">{t('chat.empty.messagesFirst')}</p>
              {onJoinCta ? (
                <Button variant="secondary" size="sm" onClick={onJoinCta}>
                  {t('chat.empty.cta')}
                </Button>
              ) : null}
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
                  ) : (
                    <SystemEventRow event={row.event} />
                  )}
                </li>
              ))}
            </ol>
          ) : !isLoading && !error && !hasAnyContent ? (
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
            // A gap, not a margin: a button hidden at this width leaves no space.
            <div className="flex flex-col gap-2 border-t border-rule-faint py-4 print:hidden">
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
