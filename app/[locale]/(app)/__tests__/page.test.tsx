import { expectedLanguageAlternates } from '@/test-utils/i18n';
import { documentTitleOf } from '@/test-utils/metadata';

import {
  getCurrentSpecialRecipientsSeed,
  getDashboardInfoSeed,
  getHomeTimingSeed,
  getLatestGestureSeed,
  getLatestSignaturesSeed,
  getServerRenderTimeMs,
} from '@/services/api/server';

import { render, screen } from '@/test-utils';

import Page, { generateMetadata } from '../page';

jest.mock('@/services/api/server', () => ({
  getDashboardInfoSeed: jest.fn(),
  getLatestSignaturesSeed: jest.fn(),
  getLatestGestureSeed: jest.fn(),
  getCurrentSpecialRecipientsSeed: jest.fn(),
  getHomeTimingSeed: jest.fn(),
  getServerRenderTimeMs: jest.fn(),
}));

jest.mock('../HomePage', () => ({
  __esModule: true,
  default: ({
    initialDashboardData,
    initialLatestSignatures,
    initialLatestGesture,
    initialSpecialRecipients,
    initialTimingSample,
    initialRenderAtMs,
  }: {
    initialDashboardData?: { CurRoundNum?: number } | null;
    initialLatestSignatures?: { TokenId: number; Seed?: string }[] | null;
    initialLatestGesture?: { EvtLogId?: number } | null;
    initialSpecialRecipients?: { ChronoWarriorAddress?: string } | null;
    initialTimingSample?: { targetServerTimeSec?: number } | null;
    initialRenderAtMs?: number;
  }) => (
    <div
      data-testid="home-page"
      data-cycle={initialDashboardData?.CurRoundNum ?? ''}
      data-signature-ids={(initialLatestSignatures ?? []).map((token) => token.TokenId).join(',')}
      data-latest-gesture-id={initialLatestGesture?.EvtLogId ?? ''}
      data-chrono-address={initialSpecialRecipients?.ChronoWarriorAddress ?? ''}
      data-finalization-time={initialTimingSample?.targetServerTimeSec ?? ''}
      data-rendered-at={initialRenderAtMs ?? ''}
    />
  ),
}));

const mockGetDashboardInfoSeed = getDashboardInfoSeed as jest.MockedFunction<
  typeof getDashboardInfoSeed
>;
const mockGetLatestSignaturesSeed = getLatestSignaturesSeed as jest.MockedFunction<
  typeof getLatestSignaturesSeed
>;
const mockGetLatestGestureSeed = getLatestGestureSeed as jest.MockedFunction<
  typeof getLatestGestureSeed
>;
const mockGetCurrentSpecialRecipientsSeed = getCurrentSpecialRecipientsSeed as jest.MockedFunction<
  typeof getCurrentSpecialRecipientsSeed
>;
const mockGetHomeTimingSeed = getHomeTimingSeed as jest.MockedFunction<typeof getHomeTimingSeed>;
const mockGetServerRenderTimeMs = getServerRenderTimeMs as jest.MockedFunction<
  typeof getServerRenderTimeMs
>;

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
  mockGetLatestSignaturesSeed.mockResolvedValue([
    { TokenId: 3, Seed: 'abc123' },
    { TokenId: 2, Seed: 'def456' },
  ] as never);
  mockGetLatestGestureSeed.mockResolvedValue({ EvtLogId: 77 } as never);
  mockGetCurrentSpecialRecipientsSeed.mockResolvedValue({
    ChronoWarriorAddress: '0xChrono',
  } as never);
  mockGetHomeTimingSeed.mockResolvedValue({
    targetServerTimeSec: 1_700_000_600,
    currentServerTimeSec: 1_700_000_000,
    cycleNumber: 9,
    sampledAtMs: 50_000,
  });
  mockGetServerRenderTimeMs.mockReturnValue(49_000);
});

describe('app home page (server shell)', () => {
  it('feeds the seed dashboard snapshot into HomePage', async () => {
    render(await Page(pageProps));

    expect(screen.getByTestId('home-page')).toHaveAttribute('data-cycle', '9');
    expect(
      Number(screen.getByTestId('home-page').getAttribute('data-rendered-at')),
    ).toBeGreaterThan(0);
  });

  it('seeds the latest gesture and special recipients into the first paint', async () => {
    render(await Page(pageProps));

    expect(mockGetLatestGestureSeed).toHaveBeenCalledWith(9);
    expect(mockGetCurrentSpecialRecipientsSeed).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('home-page')).toHaveAttribute('data-latest-gesture-id', '77');
    expect(screen.getByTestId('home-page')).toHaveAttribute('data-chrono-address', '0xChrono');
    expect(screen.getByTestId('home-page')).toHaveAttribute('data-finalization-time', '1700000600');
  });

  it('seeds the newest imprinted Signatures so the plate is in the first paint', async () => {
    render(await Page(pageProps));

    expect(mockGetLatestSignaturesSeed).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('home-page')).toHaveAttribute('data-signature-ids', '3,2');
  });

  it('renders with a null dashboard when the seed read is unavailable', async () => {
    mockGetDashboardInfoSeed.mockResolvedValue(null);

    render(await Page(pageProps));

    expect(screen.getByTestId('home-page')).toHaveAttribute('data-cycle', '');
    expect(mockGetLatestGestureSeed).not.toHaveBeenCalled();
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

    const types = [...container.querySelectorAll('script[type="application/ld+json"]')].map(
      (script) => (JSON.parse(script.textContent ?? '{}') as Record<string, unknown>)['@type'],
    );
    expect(types).not.toContain('Event');
  });

  it('embeds licensed VisualArtwork JSON-LD for the newest Signature', async () => {
    const { container } = render(await Page(pageProps));

    const artwork = [...container.querySelectorAll('script[type="application/ld+json"]')]
      .map((script) => JSON.parse(script.textContent ?? '{}') as Record<string, unknown>)
      .find((data) => data['@type'] === 'VisualArtwork');

    expect(artwork).toBeDefined();
    expect(String(artwork?.url)).toMatch(/\/detail\/3$/);
    const image = artwork?.image as Record<string, string>;
    expect(image.contentUrl).toContain('0xabc123.png');
    expect(image.license).toContain('creativecommons.org/publicdomain/zero');
  });

  it('omits the VisualArtwork JSON-LD when no artwork resolves', async () => {
    mockGetLatestSignaturesSeed.mockResolvedValue(null);

    const { container } = render(await Page(pageProps));

    const types = [...container.querySelectorAll('script[type="application/ld+json"]')].map(
      (script) => (JSON.parse(script.textContent ?? '{}') as Record<string, unknown>)['@type'],
    );
    expect(types).not.toContain('VisualArtwork');
  });
});

describe('generateMetadata', () => {
  it('names the Cycle Reserve with the contract balance, not the Signature Allocation', async () => {
    // Regression (F026): the copy says "the {reserve} Cycle Reserve", but it
    // was fed PrizeAmountEth, the Signature Allocation, about a quarter of it.
    mockGetDashboardInfoSeed.mockResolvedValue(
      dashboardSeed({ PrizeAmountEth: 8.0735, CosmicGameBalanceEth: 32.29386 }),
    );

    const metadata = await generateMetadata(pageProps);

    expect(documentTitleOf(metadata)).toBe('Cosmic Signature');
    expect(metadata.description).toContain('32.2939\u00a0ETH Cycle Reserve');
    expect(metadata.description).not.toContain('8.0735');
    expect(metadata.openGraph).toEqual(expect.objectContaining({ locale: 'en_US' }));
  });

  it('keeps the reserve-free description when the balance is missing or empty', async () => {
    for (const balance of [undefined, 0, Number.NaN]) {
      mockGetDashboardInfoSeed.mockResolvedValue(dashboardSeed({ CosmicGameBalanceEth: balance }));

      const metadata = await generateMetadata(pageProps);

      expect(metadata.description).toContain('procedural on-chain art protocol on Arbitrum');
      expect(metadata.description).not.toMatch(/\d ETH/);
    }
  });

  it('falls back to the reserve-free description when the seed read fails', async () => {
    mockGetDashboardInfoSeed.mockResolvedValue(null);

    const metadata = await generateMetadata(pageProps);

    expect(metadata.description).toContain('procedural on-chain art protocol on Arbitrum');
    expect(metadata.alternates).toEqual({
      canonical: 'https://app.cosmicsignature.com',
      languages: expectedLanguageAlternates('https://app.cosmicsignature.com', '/'),
    });
  });
});
