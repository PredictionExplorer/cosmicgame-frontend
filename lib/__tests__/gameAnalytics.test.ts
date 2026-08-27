import {
  trackChatJoinCtaClicked,
  trackFinalizeSubmitted,
  trackGestureSheetOpened,
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
    trackGestureSubmitted({ source: 'panel', method: 'ETH', hasMessage: true });
    expect(mockEvent).toHaveBeenCalledWith({
      action: 'gesture_submitted',
      category: 'gameplay',
      label: 'panel:ETH:with-message',
    });

    trackGestureSubmitted({ source: 'sheet', method: 'CST', hasMessage: false });
    expect(mockEvent).toHaveBeenCalledWith({
      action: 'gesture_submitted',
      category: 'gameplay',
      label: 'sheet:CST:no-message',
    });
  });

  it('tracks finalization, chat CTA, and sheet opens', () => {
    trackFinalizeSubmitted('clock');
    expect(mockEvent).toHaveBeenCalledWith({
      action: 'finalize_submitted',
      category: 'gameplay',
      label: 'clock',
    });

    trackChatJoinCtaClicked();
    expect(mockEvent).toHaveBeenCalledWith({
      action: 'chat_join_cta_clicked',
      category: 'gameplay',
      label: 'chat-empty-state',
    });

    trackGestureSheetOpened();
    expect(mockEvent).toHaveBeenCalledWith({
      action: 'gesture_sheet_opened',
      category: 'gameplay',
      label: 'action-dock',
    });
  });
});
