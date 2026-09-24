import { get_donations_both_by_round } from '@/services/api/donations';
import { useDonationsBothByRound } from '@/hooks/useApiQuery';

import { renderWithQuery, screen } from '@/test-utils';

import { QuerySeed } from '../../../QuerySeed';
import { readCycleContributionsSeed } from '../[round]/cycleContributionsSeed';

// The real cache: the shared test mock stubs the client this test reads.
jest.mock('@tanstack/react-query', () => jest.requireActual('@tanstack/react-query'));
jest.mock('../../../publicDataReads', () => ({ readDashboard: jest.fn() }));
jest.mock('@/services/api/donations', () => ({
  ...jest.requireActual('@/services/api/donations'),
  get_donations_both_by_round: jest.fn(),
}));

const mockRead = get_donations_both_by_round as jest.Mock;
const ROWS = [{ EvtLogId: 1, DonorAddr: '0xAA', AmountEth: 1.5, RoundNum: 1 }];

const previous = process.env.PLAYWRIGHT;

beforeEach(() => {
  jest.clearAllMocks();
  delete process.env.PLAYWRIGHT;
});

afterAll(() => {
  if (previous === undefined) delete process.env.PLAYWRIGHT;
  else process.env.PLAYWRIGHT = previous;
});

function Probe() {
  const { data, isLoading } = useDonationsBothByRound(1);
  return <p>{isLoading ? 'loading' : `rows: ${data?.length ?? 'none'}`}</p>;
}

describe('readCycleContributionsSeed', () => {
  it("seeds the cycle's contributions under the page query's own key, so they render without a read", async () => {
    mockRead.mockResolvedValue(ROWS);
    const seeds = await readCycleContributionsSeed(1);
    expect(mockRead).toHaveBeenCalledWith(1);
    mockRead.mockClear();

    renderWithQuery(
      <QuerySeed seeds={seeds}>
        <Probe />
      </QuerySeed>,
    );
    expect(screen.getByText('rows: 1')).toBeInTheDocument();
    expect(mockRead).not.toHaveBeenCalled();
  });

  it('seeds an empty cycle too, so its empty state is in the HTML', async () => {
    mockRead.mockResolvedValue([]);
    await expect(readCycleContributionsSeed(3)).resolves.toEqual([
      { queryKey: ['donationsBothByRound', 3], data: [], at: expect.any(Number) },
    ]);
  });

  it('seeds nothing from a failed read, an invalid cycle or under the e2e harness', async () => {
    mockRead.mockRejectedValue(new Error('Network response was not OK'));
    await expect(readCycleContributionsSeed(1)).resolves.toEqual([]);

    mockRead.mockClear();
    await expect(readCycleContributionsSeed(-1)).resolves.toEqual([]);
    await expect(readCycleContributionsSeed(Number.NaN)).resolves.toEqual([]);
    process.env.PLAYWRIGHT = '1';
    await expect(readCycleContributionsSeed(1)).resolves.toEqual([]);
    expect(mockRead).not.toHaveBeenCalled();
  });
});
