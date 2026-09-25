import { readSystemModes } from '../../publicDataReads';
import { checkSystemEventWindow } from '../[round]/[start]/[end]/systemEventLink';

jest.mock('../../publicDataReads', () => ({ readSystemModes: jest.fn() }));

const mockReadSystemModes = readSystemModes as jest.MockedFunction<typeof readSystemModes>;

/** Cycle 1 opened after events 100–200, cycle 2 after 200–350. */
const MODES = [
  { RoundNum: 1, EvtLogId: 100, NextEvtLogId: 200 },
  { RoundNum: 2, EvtLogId: 200, NextEvtLogId: 350 },
] as unknown as NonNullable<Awaited<ReturnType<typeof readSystemModes>>['data']>;

describe('checkSystemEventWindow', () => {
  const previous = process.env.PLAYWRIGHT;
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.PLAYWRIGHT;
    mockReadSystemModes.mockResolvedValue({ data: MODES, at: 0 });
  });
  afterAll(() => {
    if (previous === undefined) delete process.env.PLAYWRIGHT;
    else process.env.PLAYWRIGHT = previous;
  });

  it('takes a link that names its cycle’s own window', async () => {
    await expect(checkSystemEventWindow(2, 200, 350)).resolves.toEqual({ status: 'canonical' });
  });

  it('moves a link with other ids to the cycle’s window', async () => {
    await expect(checkSystemEventWindow(2, 1, 9)).resolves.toEqual({
      status: 'moved',
      window: { round: 2, start: 200, end: 350 },
    });
  });

  it('finds no window for a cycle the list does not hold', async () => {
    await expect(checkSystemEventWindow(99, 1, 2)).resolves.toEqual({ status: 'missing' });
  });

  // The list has no entry for the first setup, which always starts at the first event.
  it('takes the first setup’s window, whose end the list cannot check', async () => {
    await expect(checkSystemEventWindow(0, -1, 99)).resolves.toEqual({ status: 'canonical' });
  });

  it('takes the link as it is when the list cannot be read', async () => {
    mockReadSystemModes.mockResolvedValue({ data: null, at: 0 });
    await expect(checkSystemEventWindow(99, 1, 2)).resolves.toEqual({ status: 'unchecked' });
  });

  it('reads nothing under the e2e harness, whose browser mocks the list', async () => {
    process.env.PLAYWRIGHT = '1';
    await expect(checkSystemEventWindow(99, 1, 2)).resolves.toEqual({ status: 'unchecked' });
    expect(mockReadSystemModes).not.toHaveBeenCalled();
  });
});
