import { get_staked_cst_tokens, get_staked_rwalk_tokens } from '@/services/api/anchoring';
import { get_unique_cst_stakers, get_unique_rwalk_stakers } from '@/services/api/users';

import {
  readAnchorCstActions,
  readAnchorRwalkActions,
  readDashboard,
} from '../../../publicDataReads';
import { readAnchoringStatistics } from '../anchoringStatisticsReads';

jest.mock('@/services/api/anchoring', () => ({
  get_staked_cst_tokens: jest.fn(),
  get_staked_rwalk_tokens: jest.fn(),
}));
jest.mock('@/services/api/users', () => ({
  get_unique_cst_stakers: jest.fn(),
  get_unique_rwalk_stakers: jest.fn(),
}));
jest.mock('../../../publicDataReads', () => ({
  readDashboard: jest.fn(),
  readAnchorCstActions: jest.fn(),
  readAnchorRwalkActions: jest.fn(),
}));

const mocked = <T extends (...args: never[]) => unknown>(fn: T) =>
  fn as unknown as jest.MockedFunction<(...args: unknown[]) => Promise<unknown>>;

describe('readAnchoringStatistics', () => {
  const previous = process.env.PLAYWRIGHT;
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.PLAYWRIGHT;
    mocked(readDashboard).mockResolvedValue({ data: { CurRoundNum: 3 }, at: 10 });
    mocked(readAnchorCstActions).mockResolvedValue({ data: [{ ActionId: 1 }], at: 20 });
    mocked(readAnchorRwalkActions).mockResolvedValue({ data: [], at: 30 });
    mocked(get_staked_cst_tokens).mockResolvedValue([{ TokenId: 4 }]);
    mocked(get_staked_rwalk_tokens).mockResolvedValue([]);
    mocked(get_unique_cst_stakers).mockResolvedValue([{ StakerAddr: '0x1' }]);
    mocked(get_unique_rwalk_stakers).mockResolvedValue([]);
  });
  afterAll(() => {
    if (previous === undefined) delete process.env.PLAYWRIGHT;
    else process.env.PLAYWRIGHT = previous;
  });

  it('seeds every ledger the page shows, keyed like its client hook', async () => {
    const read = await readAnchoringStatistics();
    expect(read.dashboard.data).toEqual({ CurRoundNum: 3 });
    expect(read.seeds.map((seed) => seed.queryKey)).toEqual([
      ['cstAnchorActions'],
      ['rwlkAnchorActions'],
      ['stakedCSTTokensGlobal'],
      ['stakedRWLKTokensGlobal'],
      ['uniqueCSTAnchorHolders'],
      ['uniqueRWLKAnchorHolders'],
    ]);
    expect(read.seeds[2]).toMatchObject({ data: [{ TokenId: 4 }] });
    // The stamp dates the newest read.
    expect(read.at).toBeGreaterThanOrEqual(30);
  });

  it('seeds nothing for a read that failed, so the browser reads it', async () => {
    mocked(get_unique_cst_stakers).mockRejectedValue(new Error('Network response was not OK'));
    const read = await readAnchoringStatistics();
    const holders = read.seeds.find((seed) => seed.queryKey[0] === 'uniqueCSTAnchorHolders');
    expect(holders?.data).toBeNull();
  });

  it('has no stamp when nothing could be read', async () => {
    mocked(readDashboard).mockResolvedValue({ data: null, at: 10 });
    mocked(readAnchorCstActions).mockResolvedValue({ data: null, at: 20 });
    mocked(readAnchorRwalkActions).mockResolvedValue({ data: null, at: 30 });
    for (const read of [
      get_staked_cst_tokens,
      get_staked_rwalk_tokens,
      get_unique_cst_stakers,
      get_unique_rwalk_stakers,
    ]) {
      mocked(read).mockRejectedValue(new Error('down'));
    }
    expect((await readAnchoringStatistics()).at).toBeNull();
  });

  it('seeds nothing under the e2e harness, which mocks the API in the browser', async () => {
    process.env.PLAYWRIGHT = '1';
    const read = await readAnchoringStatistics();
    expect(read.seeds).toEqual([]);
    expect(read.dashboard.data).toBeNull();
    expect(read.at).toBeNull();
    expect(readDashboard).not.toHaveBeenCalled();
    expect(get_staked_cst_tokens).not.toHaveBeenCalled();
  });
});
