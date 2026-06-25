import { useMemo } from 'react';
import Link from 'next/link';
import { Info, MessageCircle, Radio } from 'lucide-react';

import { convertTimestampToDateTime, shortenHex } from '@/utils';

import { EmptyState } from '@/components/ui/empty-state';
import { Surface } from '@/components/ui/surface';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useBannedGestures } from '@/hooks/useApiQuery';
import { useLivePulse } from '@/hooks/useLivePulse';
import { cn } from '@/lib/utils';
import type { GestureInfo } from '@/services/api';

interface GestureMessageChatProps {
  gestures: GestureInfo[];
  cycleNumber?: number;
  className?: string;
  pulseKey?: number;
}

interface GestureChatMessage {
  gesture: GestureInfo;
  message: string;
}

function formatGestureMessageTimestamp(timestamp: number) {
  const display = convertTimestampToDateTime(timestamp, true);
  const [date = display, time = ''] = display.split(', ');

  return {
    date,
    time,
    iso: Number.isFinite(timestamp) ? new Date(timestamp * 1000).toISOString() : undefined,
  };
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
}: GestureMessageChatProps) {
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

  return (
    <Surface
      asChild
      variant="glass-bordered"
      radius="xl"
      padding="none"
      className={cn('print:break-inside-avoid', isPulsing && 'animate-live-flash', className)}
    >
      <aside aria-labelledby="gesture-message-chat-title" data-testid="gesture-message-chat">
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-12 bottom-0 h-36 w-36 rounded-full bg-[rgb(var(--nebula-violet-rgb)/0.18)] blur-3xl" />

        <div className="relative z-[1] flex h-full min-h-0 flex-col">
          <div className="border-b border-white/[0.07] p-5 xl:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-live-dot rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-300" />
                  </span>
                  Live Feed
                </div>
                <div className="flex items-center gap-2">
                  <h2
                    id="gesture-message-chat-title"
                    className="font-display text-xl font-bold tracking-tight"
                  >
                    Gesture Chat
                  </h2>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        aria-label="How to join Gesture Chat"
                        className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-muted-foreground transition-colors hover:border-primary/25 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      >
                        <Info className="h-3.5 w-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-[240px]">
                        Want to join the chat? Make a gesture and leave an optional message.
                        Messages attached to gestures appear here.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {cycleNumber != null ? `Cycle #${cycleNumber}` : 'Current cycle'} messages from
                  gestures.
                </p>
              </div>
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/12 text-primary">
                <MessageCircle className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div
            data-testid="gesture-message-chat-scroll"
            className="relative z-[1] flex-1 overflow-y-auto p-4 lg:max-h-[calc(100vh-13rem)] xl:p-5 xl:max-h-[calc(100vh-14rem)] 2xl:max-h-[calc(100vh-15rem)]"
          >
            {messages.length > 0 ? (
              <ol className="space-y-3" aria-live="polite">
                {messages.map(({ gesture, message }, index) => {
                  const timestamp = formatGestureMessageTimestamp(gesture.TimeStamp);
                  const isNewest = index === 0;
                  const gestureId = Number.isFinite(gesture.EvtLogId) ? gesture.EvtLogId : null;
                  const gesturePosition =
                    typeof gesture.BidPosition === 'number' ? gesture.BidPosition : null;
                  const messageKey =
                    gestureId ?? `${gesture.BidderAddr}-${gesture.TimeStamp}-${index}`;

                  return (
                    <li key={messageKey}>
                      <article
                        className={cn(
                          'rounded-2xl border p-4 transition-colors 2xl:p-5',
                          isNewest
                            ? 'border-primary/25 bg-primary/[0.075] shadow-[0_18px_70px_-54px_rgb(var(--aurora-cyan-rgb)/0.9)]'
                            : 'border-white/[0.06] bg-white/[0.03]',
                        )}
                        aria-label={`Gesture message from ${gesture.BidderAddr}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Link
                                href={`/user/${gesture.BidderAddr}`}
                                className="min-w-0 font-mono text-sm font-semibold text-white underline-offset-4 hover:text-primary hover:underline"
                                title={gesture.BidderAddr}
                              >
                                {shortenHex(gesture.BidderAddr, 6)}
                              </Link>
                            </TooltipTrigger>
                            <TooltipContent>{gesture.BidderAddr}</TooltipContent>
                          </Tooltip>
                          {gestureId != null ? (
                            <Link
                              href={`/gesture/${gestureId}`}
                              className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.035] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:border-primary/25 hover:text-primary"
                              aria-label={`Open gesture position ${gesturePosition ?? gestureId}`}
                            >
                              <Radio className="h-3 w-3" />#{gesturePosition ?? gestureId}
                            </Link>
                          ) : null}
                        </div>

                        <time
                          dateTime={timestamp.iso}
                          className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-xs text-muted-foreground"
                        >
                          <span>{timestamp.date}</span>
                          {timestamp.time ? (
                            <>
                              <span aria-hidden>•</span>
                              <span>{timestamp.time}</span>
                            </>
                          ) : null}
                        </time>

                        <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground/95">
                          {message}
                        </p>
                      </article>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <EmptyState
                icon={<MessageCircle className="h-8 w-8 text-muted-foreground/50" />}
                title="No gesture messages yet"
                description="Messages attached to current-cycle gestures will appear here, newest first."
                className="min-h-[20rem] py-10"
              />
            )}
          </div>
        </div>
      </aside>
    </Surface>
  );
}
