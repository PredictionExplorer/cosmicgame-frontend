import axios from 'axios';
import { headers } from 'next/headers';

import { render, screen } from '@/test-utils';

// lexicon-allow-start: test imports mirror sealed API module filenames.
import { get_dashboard_info } from '../../../../services/api/rounds';
// lexicon-allow-end
import Page, { generateMetadata } from '../page';

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
let axiosGetSpy: jest.SpyInstance;

const pageProps = { params: Promise.resolve({ locale: 'en' }) };

beforeEach(() => {
  jest.clearAllMocks();
  axiosGetSpy = jest
    .spyOn(axios, 'get')
    .mockResolvedValue({ data: { PrizeAmountEth: 2.5 } } as never);
  mockHeaders.mockResolvedValue(new Headers({ host: 'app.cosmicsignature.com:443' }) as never);
  mockGetDashboardInfo.mockResolvedValue({ CurRoundNum: 9 } as never);
});

afterEach(() => {
  axiosGetSpy.mockRestore();
});

describe('app home page (server shell)', () => {
  it('feeds server-fetched dashboard data and hostname into HomePage', async () => {
    render(await Page(pageProps));

    const home = screen.getByTestId('home-page');
    expect(home).toHaveAttribute('data-cycle', '9');
    expect(home).toHaveAttribute('data-host', 'app.cosmicsignature.com');
  });

  it('falls back to a null dashboard when the API is unavailable', async () => {
    mockGetDashboardInfo.mockRejectedValue(new Error('backend down'));

    render(await Page(pageProps));

    expect(screen.getByTestId('home-page')).toHaveAttribute('data-cycle', '');
  });

  it('passes a null hostname when no host header is present', async () => {
    mockHeaders.mockResolvedValue(new Headers() as never);

    render(await Page(pageProps));

    expect(screen.getByTestId('home-page')).toHaveAttribute('data-host', '');
  });
});

describe('generateMetadata', () => {
  it('uses the reserve description variant when the dashboard fetch succeeds', async () => {
    axiosGetSpy.mockResolvedValue({ data: { PrizeAmountEth: 0.625 } } as never);

    const metadata = await generateMetadata(pageProps);

    expect(metadata.title).toBe('Cosmic Signature');
    expect(metadata.description).toContain('0.6250 ETH Cycle Reserve');
    expect(metadata.openGraph).toEqual(expect.objectContaining({ locale: 'en_US' }));
  });

  it('formats a zero reserve like the historical description', async () => {
    axiosGetSpy.mockResolvedValue({ data: {} } as never);

    const metadata = await generateMetadata(pageProps);

    expect(metadata.description).toContain('0.0000 ETH Cycle Reserve');
  });

  it('falls back to the reserve-free description when the dashboard fetch fails', async () => {
    axiosGetSpy.mockRejectedValue(new Error('backend down'));

    const metadata = await generateMetadata(pageProps);

    expect(metadata.description).toContain('procedural on-chain art protocol on Arbitrum');
    expect(metadata.alternates).toEqual({
      canonical: 'https://app.cosmicsignature.com',
      languages: {
        en: 'https://app.cosmicsignature.com',
        zh: 'https://app.cosmicsignature.com/zh',
        'x-default': 'https://app.cosmicsignature.com',
      },
    });
  });
});
