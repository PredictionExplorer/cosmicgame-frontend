import { event } from '@/utils/analytics';

/**
 * Which UI surface triggered a gameplay action. The Deck redesign exists to
 * move the message-attach rate, so every gesture records where it started.
 */
export type GestureSurface = 'console' | 'monument' | 'composer' | 'mini-bar' | 'sheet';

export function trackGestureSubmitted({
  source,
  method,
  hasMessage,
}: {
  source: GestureSurface;
  method: string;
  hasMessage: boolean;
}): void {
  event({
    action: 'gesture_submitted',
    category: 'gameplay',
    label: `${source}:${method}:${hasMessage ? 'with-message' : 'no-message'}`,
  });
}

export function trackFinalizeSubmitted(source: GestureSurface): void {
  event({ action: 'finalize_submitted', category: 'gameplay', label: source });
}

export function trackChatJoinCtaClicked(): void {
  event({ action: 'chat_join_cta_clicked', category: 'gameplay', label: 'chat-empty-state' });
}

export function trackComposerSheetOpened(): void {
  event({ action: 'composer_sheet_opened', category: 'gameplay', label: 'mobile-fab' });
}
