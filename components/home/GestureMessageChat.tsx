'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import {
  Check,
  CircleCheck,
  Clock3,
  Copy,
  Crown,
  Flag,
  Hourglass,
  Info,
  MessageCircle,
  Radio,
  Sparkles,
  Swords,
  TimerReset,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import {
  formatSeconds,
  formatTableAmount,
  getRelativeTime,
  resolveGestureTypeCode,
  shortenHex,
} from '@/utils';

import { Link } from '@/i18n/navigation';
import { getLocaleConfig } from '@/i18n/localeConfig';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { LinkifiedText } from '@/components/ui/linkified-text';
import { Spinner } from '@/components/ui/spinner';
import { Surface } from '@/components/ui/surface';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { GestureFeedSystemEvent } from '@/components/home/deck/feedSystemEvents';
import { useBannedGestures } from '@/hooks/useApiQuery';
import { useLivePulse } from '@/hooks/useLivePulse';
import { useNow } from '@/hooks/useNow';
import { cn } from '@/lib/utils';
import { TOUCH_TARGET_ICON_CLASS, TOUCH_TARGET_TEXT_LINK_CLASS } from '@/lib/touch-target';
import type { GestureInfo } from '@/services/api';

import styles from './GestureMessageChat.module.css';

type EventTone = 'endurance' | 'chrono' | 'clock' | 'cycle' | 'calibration' | 'community' | 'cst';

// Text labels and icon silhouettes carry the same distinctions as the color.
const EVENT_PRESENTATION = {
  cycleStart: { icon: Sparkles, tone: 'cycle' },
  cycleOpen: { icon: Flag, tone: 'cycle' },
  enduranceGrowing: { icon: Crown, tone: 'endurance' },
  enduranceRecord: { icon: Crown, tone: 'endurance' },
  chronoLead: { icon: Swords, tone: 'chrono' },
  chronoReignEnded: { icon: Swords, tone: 'chrono' },
  finalCstLeader: { icon: Flag, tone: 'cst' },
  newParticipant: { icon: Users, tone: 'community' },
  gestureMilestone: { icon: Radio, tone: 'community' },
  cstCalibrationReady: { icon: Hourglass, tone: 'calibration' },
  finalWindow: { icon: Clock3, tone: 'clock' },
  clockExtended: { icon: TimerReset, tone: 'clock' },
  clockReopened: { icon: TimerReset, tone: 'clock' },
  finalizationAvailable: { icon: CircleCheck, tone: 'cycle' },
  cycleFinalized: { icon: CircleCheck, tone: 'cycle' },
} satisfies Record<GestureFeedSystemEvent['kind'], { icon: LucideIcon; tone: EventTone }>;

/** A just-submitted message shown instantly while the indexer catches up. */
export interface PendingChatMessage {
  id: string;
  address: string;
  message: string;
  /** Submission time in Unix seconds, before its confirmed block time is known. */
  timestamp: number;
}

interface GestureMessageChatProps {
  gestures: GestureInfo[];
  cycleNumber?: number;
  className?: string;
  pulseKey?: number;
  /** When provided, the empty state offers a "Make a Gesture" call to action. */
  onJoinCta?: () => void;
  /**
   * Derived cycle moments interleaved with participant messages by timestamp.
   */
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
  error?: boolean;
  onRetry?: () => void;
  /** A new cycle or corrected history starts at the newest entries again. */
  resetKey?: string;
  /** Paged responses are already moderated against the backend's own row IDs. */
  serverModerated?: boolean;
}

const SYSTEM_EVENTS_PER_PAGE = 50;

interface GestureChatMessage {
  gesture: GestureInfo;
  message: string;
}

function GestureMessageTimestamp({
  timestamp,
  locale,
  nowMs,
}: {
  timestamp: number;
  locale: string;
  nowMs: number;
}) {
  // An explicit UTC zone makes the exact time unambiguous and identical during
  // server rendering and hydration, including dates spanning different years.
  const formatter = useMemo(
    () =>
      new Intl.DateTimeFormat(getLocaleConfig(locale).intlLocale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23',
        timeZone: 'UTC',
        timeZoneName: 'short',
      }),
    [locale],
  );
  const date = new Date(timestamp * 1000);
  const isValid = Number.isFinite(date.getTime());
  const absolute = isValid ? formatter.format(date) : '—';
  const relativeLabel =
    isValid && nowMs > 0 ? getRelativeTime(timestamp, Math.floor(nowMs / 1000), locale) : null;

  return (
    <time
      dateTime={isValid ? date.toISOString() : undefined}
      className={styles.timestamp}
      aria-live="off"
    >
      <span>{absolute}</span>
      {relativeLabel ? (
        <>
          <span aria-hidden="true">·</span>
          <span className={styles.relativeAge}>{relativeLabel}</span>
        </>
      ) : null}
    </time>
  );
}

/**
 * Compact method badge descriptor: cost + unit message when known
 * (e.g. "0.1 ETH + RWLK"), else just the method fallback message.
 */
function getGestureMethodBadge(
  gesture: GestureInfo,
  locale: string,
): {
  messageKey: 'eth' | 'ethFallback' | 'ethRwlk' | 'rwlkFallback' | 'cst' | 'cstFallback';
  amount?: string;
} {
  const typeCode = resolveGestureTypeCode(gesture);
  if (typeCode === 2) {
    const cost =
      typeof gesture.CstCost === 'number' && gesture.CstCost >= 0 ? gesture.CstCost : null;
    return cost != null
      ? { messageKey: 'cst', amount: formatTableAmount(cost, locale) }
      : { messageKey: 'cstFallback' };
  }
  const cost =
    typeof gesture.GestureCostEth === 'number' && gesture.GestureCostEth >= 0
      ? gesture.GestureCostEth
      : null;
  if (typeCode === 1) {
    return cost != null
      ? { messageKey: 'ethRwlk', amount: formatTableAmount(cost, locale) }
      : { messageKey: 'rwlkFallback' };
  }
  return cost != null
    ? { messageKey: 'eth', amount: formatTableAmount(cost, locale) }
    : { messageKey: 'ethFallback' };
}

function CopyAddressButton({ address }: { address: string }) {
  const t = useTranslations('common');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? t('actions.addressCopied') : t('actions.copyAddress')}
      className={cn(
        'inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground/50 transition-colors hover:bg-white/[0.06] hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        TOUCH_TARGET_ICON_CLASS,
      )}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-emerald-400" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

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

type FeedItem =
  | { type: 'message'; timestamp: number; entry: GestureChatMessage }
  | { type: 'system'; timestamp: number; event: GestureFeedSystemEvent };

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

function SystemEventRow({
  event,
  locale,
  nowMs,
}: {
  event: GestureFeedSystemEvent;
  locale: string;
  nowMs: number;
}) {
  const t = useTranslations('home');
  const { icon: Icon, tone } = EVENT_PRESENTATION[event.kind];
  const text = t(`chat.system.${event.kind}`, {
    ...(event.cycleNumber != null ? { number: String(event.cycleNumber) } : {}),
    ...(event.address ? { address: shortenHex(event.address, 4) } : {}),
    ...(event.durationSeconds != null
      ? { duration: formatSeconds(event.durationSeconds, locale) }
      : {}),
    ...(event.count != null ? { count: String(event.count) } : {}),
  });

  return (
    <div
      data-testid="chat-system-event"
      data-kind={event.kind}
      data-tone={tone}
      className={styles.eventCard}
    >
      <span className={styles.eventIcon} aria-hidden="true">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className={styles.eventTitle}>{t(`chat.eventTitles.${event.kind}`)}</h3>
        <p className={styles.eventDescription}>{text}</p>
        <GestureMessageTimestamp timestamp={event.timestamp} locale={locale} nowMs={nowMs} />
      </div>
    </div>
  );
}

function PendingMessageRow({
  pending,
  locale,
  nowMs,
}: {
  pending: PendingChatMessage;
  locale: string;
  nowMs: number;
}) {
  const t = useTranslations('home');

  return (
    <article
      data-testid="chat-pending-message"
      className={cn(styles.messageCard, styles.pendingCard)}
      aria-label={t('chat.pending.aria')}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="min-w-0 truncate font-mono text-sm font-semibold text-white/80">
          {shortenHex(pending.address, 6)}
        </span>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-primary/25 bg-primary/[0.08] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
          <Spinner size="sm" className="h-3 w-3" />
          {t('chat.pending.label')}
        </span>
      </div>
      <GestureMessageTimestamp timestamp={pending.timestamp} locale={locale} nowMs={nowMs} />
      <p className="mt-2.5 whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground/80">
        {pending.message}
      </p>
    </article>
  );
}

/** Displays current-cycle gesture messages as a moderated, newest-first chat feed. */
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
}: GestureMessageChatProps) {
  const t = useTranslations('home');
  const locale = useLocale();
  const { data: bannedGestures } = useBannedGestures();
  const bannedGestureIds = useMemo(
    () => new Set(serverModerated ? [] : (bannedGestures ?? []).map((gesture) => gesture.bid_id)),
    [bannedGestures, serverModerated],
  );
  const messages = useMemo(
    () => getGestureChatMessages(gestures, bannedGestureIds),
    [gestures, bannedGestureIds],
  );
  const [eventWindow, setEventWindow] = useState({ key: resetKey, limit: SYSTEM_EVENTS_PER_PAGE });
  const eventLimit = eventWindow.key === resetKey ? eventWindow.limit : SYSTEM_EVENTS_PER_PAGE;
  const [isPrinting, setIsPrinting] = useState(false);
  const visibleEvents = useMemo(() => {
    const newestFirst = [...(systemEvents ?? [])].sort((a, b) => b.timestamp - a.timestamp);
    return isPrinting ? newestFirst : newestFirst.slice(0, eventLimit);
  }, [systemEvents, eventLimit, isPrinting]);
  const feedItems = useMemo(
    () => mergeFeedItems(messages, visibleEvents),
    [messages, visibleEvents],
  );
  const pending = pendingMessages ?? [];
  const hasFeedContent = feedItems.length > 0 || pending.length > 0;
  const hasMoreEvents = (systemEvents?.length ?? 0) > eventLimit;
  const hasOlderContent = hasMoreEvents || pagination?.hasMore;
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
  }, [feedItems, pendingMessages, isPrinting, resetKey, rememberReadingPosition]);

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
  const isPulsing = useLivePulse(pulseKey);
  // 30s tick keeps minute-level relative timestamps fresh; 0 during SSR.
  const nowMs = useNow(30_000);

  return (
    <Surface
      asChild
      variant="glass-bordered"
      radius="xl"
      padding="none"
      className={cn(
        'min-w-0 print:h-auto print:overflow-visible print:break-inside-avoid',
        isPulsing && 'animate-live-flash',
        className,
      )}
    >
      <aside aria-labelledby="gesture-message-chat-title" data-testid="gesture-message-chat">
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-12 bottom-0 h-36 w-36 rounded-full bg-[rgb(var(--nebula-violet-rgb)/0.18)] blur-3xl" />

        <div className="relative z-[1] flex h-full min-h-0 flex-col">
          <div className="shrink-0 border-b border-white/[0.07] p-4 sm:p-5 xl:p-4">
            <div className="flex items-start justify-between gap-2.5">
              <div className="min-w-0">
                <div className="mb-1.5 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-live-dot rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-300" />
                  </span>
                  {t('chat.liveFeed')}
                </div>
                <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
                  <h2
                    id="gesture-message-chat-title"
                    className="font-display text-lg font-bold tracking-tight sm:text-xl xl:text-lg"
                  >
                    {t('chat.title')}
                  </h2>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        aria-label={t('chat.joinTooltipAria')}
                        className={cn(
                          'inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-muted-foreground transition-colors hover:border-primary/25 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
                          TOUCH_TARGET_ICON_CLASS,
                        )}
                      >
                        <Info className="h-3.5 w-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-[240px]">{t('chat.joinTooltip')}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {cycleNumber != null
                    ? t('chat.cycleNumber', { number: String(cycleNumber) })
                    : t('chat.currentCycle')}
                  {messages.length > 0 || (!isLoading && !error) ? (
                    <>
                      {' \u00b7 '}
                      {t('chat.messageCount', { count: messages.length })}
                    </>
                  ) : null}
                  {visibleEvents.length > 0 || (!isLoading && !error) ? (
                    <>
                      {' \u00b7 '}
                      {t('chat.eventCount', { count: visibleEvents.length })}
                    </>
                  ) : null}
                </p>
                {(pagination || hasMoreEvents) && !isLoading && !error ? (
                  <p className="mt-1 text-xs text-muted-foreground print:hidden">
                    {t('chat.history.shown')}
                  </p>
                ) : null}
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/12 text-primary max-sm:hidden">
                <MessageCircle className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div
            ref={scrollRef}
            data-testid="gesture-message-chat-scroll"
            role="region"
            aria-labelledby="gesture-message-chat-title"
            tabIndex={0}
            onScroll={isPrinting ? undefined : rememberReadingPosition}
            // Keep history within a viewport-sized reading area on phones.
            // svh stays stable as browser chrome opens/closes; desktop fills
            // the sized panel. Native scrolling preserves touch and keyboard access.
            className="relative z-[1] max-h-[min(28rem,55svh)] min-h-0 flex-1 overflow-y-auto overscroll-y-contain p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/60 sm:p-4 lg:max-h-[calc(100vh-13rem)] xl:max-h-none xl:p-4 xl:[scrollbar-gutter:stable] print:max-h-none print:overflow-visible print:[scrollbar-gutter:auto]"
          >
            {isLoading ? (
              <div
                role="status"
                className="flex items-center gap-2 p-3 text-sm text-muted-foreground print:hidden"
              >
                <Spinner className="h-4 w-4" aria-hidden="true" />
                {t('chat.history.loading')}
              </div>
            ) : error ? (
              <div className="space-y-3 p-3 print:hidden">
                <p role="alert" className="text-sm text-muted-foreground">
                  {t('chat.history.error')}
                </p>
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
              <div className="mb-3">
                <Button variant="secondary" size="sm" onClick={onJoinCta}>
                  {t('chat.empty.cta')}
                </Button>
              </div>
            ) : null}
            {hasFeedContent ? (
              <ol className="space-y-2.5 sm:space-y-3 xl:space-y-2.5" aria-live="polite">
                {pending.map((entry) => (
                  <li key={entry.id} data-chat-row={`pending:${entry.id}`}>
                    <PendingMessageRow pending={entry} locale={locale} nowMs={nowMs} />
                  </li>
                ))}
                {feedItems.map((item, index) => {
                  if (item.type === 'system') {
                    return (
                      <li key={item.event.id} data-chat-row={`event:${item.event.id}`}>
                        <SystemEventRow event={item.event} locale={locale} nowMs={nowMs} />
                      </li>
                    );
                  }
                  const { gesture, message } = item.entry;
                  const isNewest = item.entry === messages[0];
                  const gestureId = Number.isFinite(gesture.EvtLogId) ? gesture.EvtLogId : null;
                  const gesturePosition =
                    typeof gesture.BidPosition === 'number' ? gesture.BidPosition : null;
                  const listItemKey =
                    gestureId ?? `${gesture.BidderAddr}-${gesture.TimeStamp}-${index}`;
                  const badge = getGestureMethodBadge(gesture, locale);

                  return (
                    <li key={listItemKey} data-chat-row={`message:${listItemKey}`}>
                      <article
                        className={styles.messageCard}
                        data-newest={isNewest}
                        aria-label={t('chat.messageAria', { address: gesture.BidderAddr })}
                      >
                        {/*
                          Stacked on phones: the badge cluster is `shrink-0`
                          while the address is `min-w-0` over `font-mono`
                          (`overflow-wrap: anywhere`), so on one row the badges
                          took their full width and squeezed the address to a
                          single character column ~5px wide and 360px tall.
                        */}
                        <div
                          data-testid="gesture-message-meta"
                          className={cn(
                            styles.messageMeta,
                            'flex items-start justify-between gap-3 max-sm:flex-col max-sm:items-start max-sm:gap-2',
                          )}
                        >
                          <div
                            data-testid="gesture-message-participant"
                            className="flex min-w-0 items-center gap-1"
                          >
                            <span className={styles.messageIcon} aria-hidden="true">
                              <MessageCircle className="h-4 w-4" />
                            </span>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Link
                                  href={`/user/${gesture.BidderAddr}`}
                                  className={cn(
                                    'min-w-0 truncate font-mono text-sm font-semibold text-white underline-offset-4 hover:text-primary hover:underline',
                                    TOUCH_TARGET_TEXT_LINK_CLASS,
                                  )}
                                  title={gesture.BidderAddr}
                                >
                                  {shortenHex(gesture.BidderAddr, 6)}
                                </Link>
                              </TooltipTrigger>
                              <TooltipContent>{gesture.BidderAddr}</TooltipContent>
                            </Tooltip>
                            <CopyAddressButton address={gesture.BidderAddr} />
                          </div>
                          <div
                            data-testid="gesture-message-badges"
                            className={cn(
                              styles.messageBadges,
                              'flex shrink-0 flex-wrap items-center justify-end gap-1.5 max-sm:justify-start',
                            )}
                          >
                            <span
                              data-testid="gesture-method-badge"
                              className="inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.035] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground"
                            >
                              {badge.amount != null
                                ? t(`chat.badge.${badge.messageKey}`, { amount: badge.amount })
                                : t(`chat.badge.${badge.messageKey}`)}
                            </span>
                            {gestureId != null ? (
                              <Link
                                href={`/gesture/${gestureId}`}
                                className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.035] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:border-primary/25 hover:text-primary"
                                aria-label={t('chat.openPositionAria', {
                                  position: String(gesturePosition ?? gestureId),
                                })}
                              >
                                <Radio className="h-3 w-3" />#{gesturePosition ?? gestureId}
                              </Link>
                            ) : null}
                          </div>
                        </div>

                        <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground/95">
                          <LinkifiedText text={message} />
                        </p>
                        <GestureMessageTimestamp
                          timestamp={gesture.TimeStamp}
                          locale={locale}
                          nowMs={nowMs}
                        />
                      </article>
                    </li>
                  );
                })}
              </ol>
            ) : !isLoading && !error ? (
              <EmptyState
                icon={<MessageCircle className="h-8 w-8 text-muted-foreground/50" />}
                title={t('chat.empty.title')}
                description={t('chat.empty.description')}
                action={
                  onJoinCta ? (
                    <Button variant="secondary" size="sm" onClick={onJoinCta}>
                      {t('chat.empty.cta')}
                    </Button>
                  ) : undefined
                }
                className="min-h-[14rem] py-8 sm:min-h-[16rem] xl:h-full xl:min-h-0 xl:py-6"
              />
            ) : null}
            {!isLoading &&
            !error &&
            (hasOlderContent || pagination?.error || pagination?.isLoading) ? (
              <div className="mt-4 space-y-2 border-t border-white/[0.07] pt-3 print:hidden">
                {pagination?.error ? (
                  <p role="alert" className="text-sm text-muted-foreground">
                    {t('chat.history.olderError')}
                  </p>
                ) : null}
                <Button
                  type="button"
                  variant="secondary"
                  className="min-h-11 w-full whitespace-normal"
                  disabled={pagination?.isLoading}
                  onClick={loadOlder}
                >
                  {pagination?.isLoading ? (
                    <span role="status" className="flex items-center justify-center gap-2">
                      <Spinner className="h-4 w-4" aria-hidden="true" />
                      {t('chat.history.loadingOlder')}
                    </span>
                  ) : pagination?.error ? (
                    t('chat.history.retry')
                  ) : (
                    t('chat.history.loadOlder')
                  )}
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </aside>
    </Surface>
  );
}
