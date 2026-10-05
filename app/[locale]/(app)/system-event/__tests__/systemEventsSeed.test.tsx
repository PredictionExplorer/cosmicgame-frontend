import { get_system_events } from '@/services/api/system';
import { useSystemEvents } from '@/hooks/useApiQuery';

import { renderWithQuery, screen } from '@/test-utils';

import { QuerySeed } from '../../QuerySeed';
import { readSystemEventsSeed } from '../[round]/[start]/[end]/systemEventsSeed';

// The real cache: the shared test mock stubs the client this test reads.
jest.mock('@tanstack/react-query', () => jest.requireActual('@tanstack/react-query'));
jest.mock('../../publicDataReads', () => ({ readDashboard: jest.fn() }));
jest.mock('@/services/api/system', () => ({
  ...jest.requireActual('@/services/api/system'),
  get_system_events: jest.fn(),
}));

const mockRead = get_system_events as jest.Mock;
const ROWS = [
  { EvtLogId: 100, RecordType: 2, TimeStamp: 1_704_164_645, TxHash: '0xa' },
  { EvtLogId: 101, RecordType: 1, TimeStamp: 1_704_164_700, TxHash: '0xb' },
];

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
  const { data, isLoading } = useSystemEvents(100, 200);
  return <p>{isLoading ? 'loading' : `changes: ${data?.length ?? 'none'}`}</p>;
}

describe('readSystemEventsSeed', () => {
  it("seeds the window's changes under the page query's own key, so they render without a read", async () => {
    mockRead.mockResolvedValue(ROWS);
    const seeds = await readSystemEventsSeed({ round: 1, start: 100, end: 200 });
    expect(mockRead).toHaveBeenCalledWith(100, 200);
    mockRead.mockClear();

    renderWithQuery(
      <QuerySeed seeds={seeds}>
        <Probe />
      </QuerySeed>,
    );
    expect(screen.getByText('changes: 2')).toBeInTheDocument();
    expect(mockRead).not.toHaveBeenCalled();
  });

  it('seeds nothing from a failed read, an invalid window or under the e2e harness', async () => {
    mockRead.mockRejectedValue(new Error('Network response was not OK'));
    await expect(readSystemEventsSeed({ round: 1, start: 100, end: 200 })).resolves.toEqual([]);

    mockRead.mockClear();
    await expect(readSystemEventsSeed({ round: 1, start: 200, end: 100 })).resolves.toEqual([]);
    await expect(readSystemEventsSeed({ round: -1, start: 0, end: 100 })).resolves.toEqual([]);
    process.env.PLAYWRIGHT = '1';
    await expect(readSystemEventsSeed({ round: 1, start: 100, end: 200 })).resolves.toEqual([]);
    expect(mockRead).not.toHaveBeenCalled();
  });
});
