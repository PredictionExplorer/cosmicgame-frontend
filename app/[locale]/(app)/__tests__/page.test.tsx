import { headers } from 'next/headers';

import { render, screen } from '@/test-utils';

// lexicon-allow-start: test imports mirror sealed API module filenames.
import { get_dashboard_info } from '../../../../services/api/rounds';
// lexicon-allow-end
import Page from '../page';

jest.mock('next/headers', () => ({
  headers: jest.fn(),
}));

// lexicon-allow-start: test mocks mirror sealed API module filenames.
jest.mock('../../../../services/api/rounds', () => ({
  get_dashboard_info: jest.fn(),
}));
// lexicon-allow-end

jest.mock('../HomePage', () => ({
  __esModule: true,
  default: ({
    initialDashboardData,
    initialHostname,
  }: {
    initialDashboardData?: { CurRoundNum?: number } | null;
    initialHostname?: string | null;
  }) => (
    <div
      data-testid="home-page"
      data-host={initialHostname ?? ''}
      data-cycle={initialDashboardData?.CurRoundNum ?? ''}
    />
  ),
}));

const mockHeaders = headers as jest.MockedFunction<typeof headers>;
const mockGetDashboardInfo = get_dashboard_info as jest.MockedFunction<typeof get_dashboard_info>;

beforeEach(() => {
  jest.clearAllMocks();
  mockHeaders.mockResolvedValue(new Headers({ host: 'app.cosmicsignature.com:443' }) as never);
  mockGetDashboardInfo.mockResolvedValue({ CurRoundNum: 9 } as never);
});

describe('app home page (server shell)', () => {
  it('feeds server-fetched dashboard data and hostname into HomePage', async () => {
    render(await Page());

    const home = screen.getByTestId('home-page');
    expect(home).toHaveAttribute('data-cycle', '9');
    expect(home).toHaveAttribute('data-host', 'app.cosmicsignature.com');
  });

  it('falls back to a null dashboard when the API is unavailable', async () => {
    mockGetDashboardInfo.mockRejectedValue(new Error('backend down'));

    render(await Page());

    expect(screen.getByTestId('home-page')).toHaveAttribute('data-cycle', '');
  });

  it('passes a null hostname when no host header is present', async () => {
    mockHeaders.mockResolvedValue(new Headers() as never);

    render(await Page());

    expect(screen.getByTestId('home-page')).toHaveAttribute('data-host', '');
  });
});
