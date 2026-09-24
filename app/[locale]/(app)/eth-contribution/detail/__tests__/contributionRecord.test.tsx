import { get_donations_with_info_by_id } from '@/services/api/donations';
import type { ETHDonation } from '@/services/api/types';
import { useDonationsWithInfoById } from '@/hooks/useApiQuery';

import { renderWithQuery, screen } from '@/test-utils';

import { QuerySeed } from '../../../QuerySeed';
import { contributionSeeds, readContribution } from '../[id]/contributionRecord';

// The real cache: the shared test mock stubs the client this test reads.
jest.mock('@tanstack/react-query', () => jest.requireActual('@tanstack/react-query'));
jest.mock('../../../publicDataReads', () => ({ readDashboard: jest.fn() }));
jest.mock('@/services/api/donations', () => ({
  ...jest.requireActual('@/services/api/donations'),
  get_donations_with_info_by_id: jest.fn(),
}));

const mockRead = get_donations_with_info_by_id as jest.Mock;

const RECORD: ETHDonation = {
  EvtLogId: 18955,
  BlockNum: 1,
  TxId: 1,
  TxHash: '0x7545',
  TimeStamp: 1_782_078_578,
  DateTime: '2026-06-21T21:49:38Z',
  DonorAddr: '0x4D3949CD8980E942eb9Dd24d4eCc27584a8D71fA',
  RoundNum: 3,
  AmountEth: 20,
  CGRecordId: 7,
  DataJson: '',
};

const previous = process.env.PLAYWRIGHT;

beforeEach(() => {
  jest.clearAllMocks();
  delete process.env.PLAYWRIGHT;
});

afterAll(() => {
  if (previous === undefined) delete process.env.PLAYWRIGHT;
  else process.env.PLAYWRIGHT = previous;
});

describe('readContribution', () => {
  it('finds a record the API returns', async () => {
    mockRead.mockResolvedValue(RECORD);
    await expect(readContribution(7)).resolves.toMatchObject({ status: 'found', record: RECORD });
    expect(mockRead).toHaveBeenCalledWith(7);
  });

  it('knows a record is missing when the API says there is none', async () => {
    mockRead.mockResolvedValue(null);
    await expect(readContribution(7)).resolves.toEqual({ status: 'missing' });
  });

  it('leaves a failed read to the client, never calling it missing', async () => {
    mockRead.mockRejectedValue(new Error('Network response was not OK'));
    await expect(readContribution(7)).resolves.toEqual({ status: 'unknown' });
  });

  it.each([
    ['an invalid id', Number.NaN],
    ['a negative id', -1],
  ])('reads nothing for %s', async (_, id) => {
    await expect(readContribution(id)).resolves.toEqual({ status: 'unknown' });
    expect(mockRead).not.toHaveBeenCalled();
  });

  it('reads nothing under the e2e harness, whose specs mock the API in the browser', async () => {
    process.env.PLAYWRIGHT = '1';
    await expect(readContribution(7)).resolves.toEqual({ status: 'unknown' });
    expect(mockRead).not.toHaveBeenCalled();
  });
});

describe('contributionSeeds', () => {
  function Probe() {
    const { data, isLoading } = useDonationsWithInfoById(7);
    return <p>{isLoading ? 'loading' : (data?.TxHash ?? 'none')}</p>;
  }

  it("seeds a found record under the page query's own key, so it renders without a read", () => {
    renderWithQuery(
      <QuerySeed seeds={contributionSeeds(7, { status: 'found', record: RECORD, at: Date.now() })}>
        <Probe />
      </QuerySeed>,
    );
    expect(screen.getByText('0x7545')).toBeInTheDocument();
    expect(mockRead).not.toHaveBeenCalled();
  });

  it('seeds nothing for a missing or unread record', () => {
    expect(contributionSeeds(7, { status: 'missing' })).toEqual([]);
    expect(contributionSeeds(7, { status: 'unknown' })).toEqual([]);
  });
});
