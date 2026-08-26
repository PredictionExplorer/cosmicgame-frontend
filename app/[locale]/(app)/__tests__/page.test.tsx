import { getCstInfoSeed, getDashboardInfoSeed } from '@/services/api/server';

import { render, screen } from '@/test-utils';

import Page, { generateMetadata } from '../page';

jest.mock('@/services/api/server', () => ({
  getDashboardInfoSeed: jest.fn(),
  getCstInfoSeed: jest.fn(),
}));

jest.mock('../HomePage', () => ({
  __esModule: true,
  default: ({
    initialDashboardData,
    initialBannerToken,
  }: {
    initialDashboardData?: { CurRoundNum?: number } | null;
    initialBannerToken?: { id: number; info: { Seed?: string } } | null;
  }) => (
    <div
      data-testid="home-page"
      data-cycle={initialDashboardData?.CurRoundNum ?? ''}
      data-banner-id={initialBannerToken?.id ?? ''}
      data-banner-seed={initialBannerToken?.info.Seed ?? ''}
    />
  ),
}));

const mockGetDashboardInfoSeed = getDashboardInfoSeed as jest.MockedFunction<
  typeof getDashboardInfoSeed
>;
const mockGetCstInfoSeed = getCstInfoSeed as jest.MockedFunction<typeof getCstInfoSeed>;

const pageProps = { params: Promise.resolve({ locale: 'en' }) };

function dashboardSeed(overrides: Record<string, unknown> = {}) {
  return {
    CurRoundNum: 9,
    PrizeAmountEth: 2.5,
    MainStats: { NumCSTokenMints: 4 },
    ...overrides,
  } as never;
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGetDashboardInfoSeed.mockResolvedValue(dashboardSeed());
  mockGetCstInfoSeed.mockResolvedValue({ Seed: 'abc123' } as never);
});

describe('app home page (server shell)', () => {
  it('feeds the seed dashboard snapshot into HomePage', async () => {
    render(await Page(pageProps));

    expect(screen.getByTestId('home-page')).toHaveAttribute('data-cycle', '9');
  });

  it('server-picks a hero banner token within the imprinted range', async () => {
    render(await Page(pageProps));

    const requestedId = mockGetCstInfoSeed.mock.calls[0]?.[0];
    expect(requestedId).toBeGreaterThanOrEqual(0);
    expect(requestedId).toBeLessThan(4);

    const home = screen.getByTestId('home-page');
    expect(home).toHaveAttribute('data-banner-id', String(requestedId));
    expect(home).toHaveAttribute('data-banner-seed', 'abc123');
  });

  it('omits the banner seed when no tokens have been imprinted yet', async () => {
    mockGetDashboardInfoSeed.mockResolvedValue(
      dashboardSeed({ MainStats: { NumCSTokenMints: 0 } }),
    );

    render(await Page(pageProps));

    expect(mockGetCstInfoSeed).not.toHaveBeenCalled();
    expect(screen.getByTestId('home-page')).toHaveAttribute('data-banner-id', '');
  });

  it('omits the banner seed when the token read has no Seed', async () => {
    mockGetCstInfoSeed.mockResolvedValue({ Seed: '' } as never);

    render(await Page(pageProps));

    expect(screen.getByTestId('home-page')).toHaveAttribute('data-banner-seed', '');
  });

  it('renders with a null dashboard when the seed read is unavailable', async () => {
    mockGetDashboardInfoSeed.mockResolvedValue(null);

    render(await Page(pageProps));

    expect(screen.getByTestId('home-page')).toHaveAttribute('data-cycle', '');
    expect(mockGetCstInfoSeed).not.toHaveBeenCalled();
  });

  it('embeds live-cycle Event JSON-LD once the cycle has started', async () => {
    mockGetDashboardInfoSeed.mockResolvedValue(
      dashboardSeed({ TsRoundStart: 1_700_000_000, CurRoundNum: 9 }),
    );

    const { container } = render(await Page(pageProps));

    const scripts = [...container.querySelectorAll('script[type="application/ld+json"]')];
    const eventBlock = scripts
      .map((script) => JSON.parse(script.textContent ?? '{}') as Record<string, unknown>)
      .find((data) => data['@type'] === 'Event');
    expect(eventBlock).toBeDefined();
    expect(eventBlock?.name).toBe('Cosmic Signature Performance Cycle #9');
    expect(eventBlock?.startDate).toBe('2023-11-14T22:13:20.000Z');
  });

  it('omits the Event JSON-LD while the cycle awaits its first gesture', async () => {
    mockGetDashboardInfoSeed.mockResolvedValue(dashboardSeed({ TsRoundStart: 0 }));

    const { container } = render(await Page(pageProps));

    expect(container.querySelectorAll('script[type="application/ld+json"]')).toHaveLength(0);
  });
});

describe('generateMetadata', () => {
  it('uses the reserve description variant when the seed read succeeds', async () => {
    mockGetDashboardInfoSeed.mockResolvedValue(dashboardSeed({ PrizeAmountEth: 0.625 }));

    const metadata = await generateMetadata(pageProps);

    expect(metadata.title).toBe('Cosmic Signature');
    expect(metadata.description).toContain('0.6250 ETH Cycle Reserve');
    expect(metadata.openGraph).toEqual(expect.objectContaining({ locale: 'en_US' }));
  });

  it('formats a zero reserve like the historical description', async () => {
    mockGetDashboardInfoSeed.mockResolvedValue(dashboardSeed({ PrizeAmountEth: 0 }));

    const metadata = await generateMetadata(pageProps);

    expect(metadata.description).toContain('0.0000 ETH Cycle Reserve');
  });

  it('falls back to the normalized reserve field when the wire field is absent', async () => {
    mockGetDashboardInfoSeed.mockResolvedValue(
      dashboardSeed({ PrizeAmountEth: undefined, CurPrizeAmountEth: 1.25 }),
    );

    const metadata = await generateMetadata(pageProps);

    expect(metadata.description).toContain('1.2500 ETH Cycle Reserve');
  });

  it('falls back to the reserve-free description when the seed read fails', async () => {
    mockGetDashboardInfoSeed.mockResolvedValue(null);

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
