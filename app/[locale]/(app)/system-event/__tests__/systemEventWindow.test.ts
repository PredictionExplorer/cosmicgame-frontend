import {
  canonicalWindow,
  historyRange,
  isValidWindow,
  windowRange,
} from '../[round]/[start]/[end]/systemEventWindow';

/** The mode change list as the API returns it (newest first); the first setup starts at -1. */
const MODES = [
  { RoundNum: 2, EvtLogId: 26005, NextEvtLogId: 26011 },
  { RoundNum: 1, EvtLogId: 18886, NextEvtLogId: 19007 },
  { RoundNum: 0, EvtLogId: -1, NextEvtLogId: 16681 },
];

describe('system-event windows', () => {
  // Regression: the first setup's window starts at -1, and its own link was refused.
  it('accepts the first setup’s window, which starts before the first event', () => {
    expect(isValidWindow({ round: 0, start: -1, end: 16681 })).toBe(true);
    expect(windowRange({ round: 0, start: -1, end: 16681 })).toEqual({ start: 0, end: 16681 });
    expect(isValidWindow({ round: 0, start: -2, end: 16681 })).toBe(false);
    expect(isValidWindow({ round: 1, start: 200, end: 100 })).toBe(false);
  });

  it('reads every change before a window, so each row can say what it replaced', () => {
    expect(historyRange({ round: 1, start: 18886, end: 19007 })).toEqual({ start: 0, end: 18885 });
    expect(historyRange({ round: 0, start: -1, end: 16681 })).toBeNull();
  });

  it('finds a cycle’s canonical window in the mode change list', () => {
    expect(canonicalWindow(MODES, 1)).toEqual({ round: 1, start: 18886, end: 19007 });
    expect(canonicalWindow(MODES, 0)).toEqual({ round: 0, start: -1, end: 16681 });
    // A cycle the list has no window for: the page is a 404, never a confident claim.
    expect(canonicalWindow(MODES, 7)).toBeNull();
    expect(canonicalWindow([{ RoundNum: 3, EvtLogId: 5 }], 3)).toBeNull();
  });
});
