import { event } from '@/utils/analytics';

/**
 * Which UI surface triggered a gameplay action. The observatory keeps exactly
 * one gesture panel, so the surface distinguishes its mounts (in-page card vs
 * mobile sheet) plus the clock's finalize action.
 */
export type GestureSurface = 'panel' | 'sheet' | 'clock';

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

export function trackGestureSheetOpened(): void {
  event({ action: 'gesture_sheet_opened', category: 'gameplay', label: 'action-dock' });
}
