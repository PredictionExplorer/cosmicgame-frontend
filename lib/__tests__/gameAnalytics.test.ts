import {
  trackChatJoinCtaClicked,
  trackComposerSheetOpened,
  trackFinalizeSubmitted,
  trackGestureSubmitted,
} from '../gameAnalytics';

const mockEvent = jest.fn();
jest.mock('../../utils/analytics', () => ({
  event: (...args: unknown[]) => mockEvent(...args),
}));

beforeEach(() => {
  mockEvent.mockClear();
});

describe('gameAnalytics', () => {
  it('labels gesture submissions with surface, method, and message state', () => {
    trackGestureSubmitted({ source: 'composer', method: 'ETH', hasMessage: true });
    expect(mockEvent).toHaveBeenCalledWith({
      action: 'gesture_submitted',
      category: 'gameplay',
      label: 'composer:ETH:with-message',
    });

    trackGestureSubmitted({ source: 'console', method: 'CST', hasMessage: false });
    expect(mockEvent).toHaveBeenCalledWith({
      action: 'gesture_submitted',
      category: 'gameplay',
      label: 'console:CST:no-message',
    });
  });

  it('tracks finalization, chat CTA, and sheet opens', () => {
    trackFinalizeSubmitted('monument');
    expect(mockEvent).toHaveBeenCalledWith({
      action: 'finalize_submitted',
      category: 'gameplay',
      label: 'monument',
    });

    trackChatJoinCtaClicked();
    expect(mockEvent).toHaveBeenCalledWith({
      action: 'chat_join_cta_clicked',
      category: 'gameplay',
      label: 'chat-empty-state',
    });

    trackComposerSheetOpened();
    expect(mockEvent).toHaveBeenCalledWith({
      action: 'composer_sheet_opened',
      category: 'gameplay',
      label: 'mobile-fab',
    });
  });
});
