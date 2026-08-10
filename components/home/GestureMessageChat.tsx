'use client';

import { useMemo, useState } from 'react';
import { Check, Copy, Info, MessageCircle, Radio } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { formatTableAmount, getRelativeTime, resolveGestureTypeCode, shortenHex } from '@/utils';

import { Link } from '@/i18n/navigation';
import { useHydrationSafeDateTime } from '@/components/common/HydrationSafeDateTime';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { LinkifiedText } from '@/components/ui/linkified-text';
import { Surface } from '@/components/ui/surface';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useBannedGestures } from '@/hooks/useApiQuery';
import { useLivePulse } from '@/hooks/useLivePulse';
import { useNow } from '@/hooks/useNow';
import { cn } from '@/lib/utils';
import { TOUCH_TARGET_ICON_CLASS, TOUCH_TARGET_TEXT_LINK_CLASS } from '@/lib/touch-target';
import type { GestureInfo } from '@/services/api';

interface GestureMessageChatProps {
  gestures: GestureInfo[];
  cycleNumber?: number;
  className?: string;
  pulseKey?: number;
  /** When provided, the empty state offers a "Make a Gesture" call to action. */
  onJoinCta?: () => void;
}

interface GestureChatMessage {
  gesture: GestureInfo;
  message: string;
}

function formatGestureMessageTimestamp(timestamp: number, display: string) {
  const [date = display, time = ''] = display.split(', ');

  return {
    date,
    time,
    absolute: time ? `${date}, ${time}` : date,
    iso: Number.isFinite(timestamp) ? new Date(timestamp * 1000).toISOString() : undefined,
  };
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
  const display = useHydrationSafeDateTime(timestamp, true, locale);
  const formatted = formatGestureMessageTimestamp(timestamp, display);
  const relativeLabel =
    nowMs > 0 ? getRelativeTime(timestamp, Math.floor(nowMs / 1000), locale) : formatted.absolute;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <time dateTime={formatted.iso} className="mt-2 block w-fit text-xs text-muted-foreground">
          {relativeLabel}
        </time>
      </TooltipTrigger>
      <TooltipContent>{formatted.absolute}</TooltipContent>
    </Tooltip>
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

/** Displays current-cycle gesture messages as a moderated, newest-first chat feed. */
export function GestureMessageChat({
  gestures,
  cycleNumber,
  className,
  pulseKey = 0,
  onJoinCta,
}: GestureMessageChatProps) {
  const t = useTranslations('home');
  const locale = useLocale();
  const { data: bannedGestures } = useBannedGestures();
  const bannedGestureIds = useMemo(
    () => new Set((bannedGestures ?? []).map((gesture) => gesture.bid_id)),
    [bannedGestures],
  );
  const messages = useMemo(
    () => getGestureChatMessages(gestures, bannedGestureIds),
    [gestures, bannedGestureIds],
  );
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
          <div className="border-b border-white/[0.07] p-4 sm:p-5 xl:p-4">
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
                  {' \u00b7 '}
                  {t('chat.messageCount', { count: messages.length })}
                </p>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/12 text-primary max-sm:hidden">
                <MessageCircle className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div
            data-testid="gesture-message-chat-scroll"
            role="region"
            aria-labelledby="gesture-message-chat-title"
            tabIndex={0}
            // Phones stay in the document flow. Tablet-sized feeds and the
            // deliberately capped desktop panel scroll here instead.
            className="relative z-[1] min-h-0 flex-1 overflow-y-visible p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/60 sm:p-4 lg:max-h-[calc(100vh-13rem)] lg:overflow-y-auto xl:max-h-none xl:overflow-y-auto xl:p-4 xl:[scrollbar-gutter:stable] print:max-h-none print:overflow-visible print:[scrollbar-gutter:auto]"
          >
            {messages.length > 0 ? (
              <ol className="space-y-2.5 sm:space-y-3 xl:space-y-2.5" aria-live="polite">
                {messages.map(({ gesture, message }, index) => {
                  const isNewest = index === 0;
                  const gestureId = Number.isFinite(gesture.EvtLogId) ? gesture.EvtLogId : null;
                  const gesturePosition =
                    typeof gesture.BidPosition === 'number' ? gesture.BidPosition : null;
                  const listItemKey =
                    gestureId ?? `${gesture.BidderAddr}-${gesture.TimeStamp}-${index}`;
                  const badge = getGestureMethodBadge(gesture, locale);

                  return (
                    <li key={listItemKey}>
                      <article
                        className={cn(
                          'rounded-xl border p-3 transition-colors sm:rounded-2xl sm:p-4 xl:p-3.5 2xl:p-4',
                          isNewest
                            ? 'border-primary/25 bg-primary/[0.075] shadow-[0_18px_70px_-54px_rgb(var(--aurora-cyan-rgb)/0.9)]'
                            : 'border-white/[0.06] bg-white/[0.03]',
                        )}
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
                          className="flex items-start justify-between gap-3 max-sm:flex-col max-sm:items-start max-sm:gap-2"
                        >
                          <div
                            data-testid="gesture-message-participant"
                            className="flex min-w-0 items-center gap-1"
                          >
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Link
                                  href={`/user/${gesture.BidderAddr}`}
                                  className={cn(
                                    'min-w-0 font-mono text-sm font-semibold text-white underline-offset-4 hover:text-primary hover:underline',
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
                            className="flex shrink-0 flex-wrap items-center justify-end gap-1.5 max-sm:justify-start"
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

                        <GestureMessageTimestamp
                          timestamp={gesture.TimeStamp}
                          locale={locale}
                          nowMs={nowMs}
                        />

                        <p className="mt-2.5 whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground/95">
                          <LinkifiedText text={message} />
                        </p>
                      </article>
                    </li>
                  );
                })}
              </ol>
            ) : (
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
            )}
          </div>
        </div>
      </aside>
    </Surface>
  );
}
