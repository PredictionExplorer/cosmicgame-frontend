import { documentTitleOf, resolvingMetadata } from '@/test-utils/metadata';

import {
  getCstInfoSeed,
  getCurrentSpecialRecipientsSeed,
  getDashboardInfoSeed,
  getHomeTimingSeed,
  getLatestGestureSeed,
} from '@/services/api/server';

import { render, screen } from '@/test-utils';

import Page, { generateMetadata } from '../page';

jest.mock('@/services/api/server', () => ({
  getDashboardInfoSeed: jest.fn(),
  getCstInfoSeed: jest.fn(),
  getHomeTimingSeed: jest.fn(),
  getLatestGestureSeed: jest.fn(),
  getCurrentSpecialRecipientsSeed: jest.fn(),
  getServerRenderTimeMs: () => 1_700_000_000_000,
}));

jest.mock('../ExperimentalHomePage', () => ({
  __esModule: true,
  default: ({
    initialDashboardData,
    initialBannerToken,
    initialLatestGesture,
    initialSpecialRecipients,
    initialTimingSample,
    initialRenderAtMs,
  }: {
    initialDashboardData?: { CurRoundNum?: number } | null;
    initialBannerToken?: { id: number; info: { Seed?: string } } | null;
    initialLatestGesture?: { EvtLogId?: number } | null;
    initialSpecialRecipients?: unknown;
    initialTimingSample?: { sampledAtMs?: number } | null;
    initialRenderAtMs?: number;
  }) => (
    <div
      data-testid="experimental-home"
      data-cycle={initialDashboardData?.CurRoundNum ?? ''}
      data-banner-id={initialBannerToken?.id ?? ''}
      data-banner-seed={initialBannerToken?.info.Seed ?? ''}
      data-latest-gesture={initialLatestGesture?.EvtLogId ?? ''}
      data-has-recipients={String(initialSpecialRecipients != null)}
      data-timing={initialTimingSample?.sampledAtMs ?? ''}
      data-render-at={initialRenderAtMs ?? ''}
    />
  ),
}));

const mockGetDashboardInfoSeed = getDashboardInfoSeed as jest.MockedFunction<
  typeof getDashboardInfoSeed
>;
const mockGetCstInfoSeed = getCstInfoSeed as jest.MockedFunction<typeof getCstInfoSeed>;
const mockGetHomeTimingSeed = getHomeTimingSeed as jest.MockedFunction<typeof getHomeTimingSeed>;
const mockGetLatestGestureSeed = getLatestGestureSeed as jest.MockedFunction<
  typeof getLatestGestureSeed
>;
const mockGetSpecialRecipientsSeed = getCurrentSpecialRecipientsSeed as jest.MockedFunction<
  typeof getCurrentSpecialRecipientsSeed
>;

const englishProps = { params: Promise.resolve({ locale: 'en' }) };

function dashboardSeed(imprintedCount = 4) {
  return {
    CurRoundNum: 42,
    MainStats: { NumCSTokenMints: imprintedCount },
  } as never;
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGetDashboardInfoSeed.mockResolvedValue(dashboardSeed());
  mockGetCstInfoSeed.mockResolvedValue({ Seed: 'abc123' } as never);
  mockGetHomeTimingSeed.mockResolvedValue({
    targetServerTimeSec: 1_700_000_600,
    currentServerTimeSec: 1_700_000_000,
    sampledAtMs: 1_700_000_000_500,
    cycleNumber: 42,
  });
  mockGetLatestGestureSeed.mockResolvedValue({ EvtLogId: 1135, RoundNum: 42 } as never);
  mockGetSpecialRecipientsSeed.mockResolvedValue({} as never);
});

describe('experimental UI server page', () => {
  it('hydrates the alternate UI with the shared live seed shape', async () => {
    render(await Page(englishProps));

    const home = screen.getByTestId('experimental-home');
    expect(home).toHaveAttribute('data-cycle', '42');
    expect(Number(home.getAttribute('data-banner-id'))).toBeGreaterThanOrEqual(0);
    expect(Number(home.getAttribute('data-banner-id'))).toBeLessThan(4);
    expect(home).toHaveAttribute('data-banner-seed', 'abc123');
  });

  it('seeds the clock, the latest Gesture and the standings like the Observatory', async () => {
    render(await Page(englishProps));

    const home = screen.getByTestId('experimental-home');
    expect(mockGetLatestGestureSeed).toHaveBeenCalledWith(42);
    expect(home).toHaveAttribute('data-latest-gesture', '1135');
    expect(home).toHaveAttribute('data-has-recipients', 'true');
    expect(home).toHaveAttribute('data-timing', '1700000000500');
    expect(home).toHaveAttribute('data-render-at', '1700000000000');
  });

  it('does not request artwork metadata before any Signature is imprinted', async () => {
    mockGetDashboardInfoSeed.mockResolvedValue(dashboardSeed(0));

    render(await Page(englishProps));

    expect(mockGetCstInfoSeed).not.toHaveBeenCalled();
    expect(screen.getByTestId('experimental-home')).toHaveAttribute('data-banner-id', '');
  });

  it('emits a WebPage and localized breadcrumb contract', async () => {
    const { container } = render(await Page(englishProps));
    const blocks = [...container.querySelectorAll('script[type="application/ld+json"]')].flatMap(
      (script) => {
        const parsed = JSON.parse(script.textContent ?? '{}') as
          | Record<string, unknown>
          | Record<string, unknown>[];
        return Array.isArray(parsed) ? parsed : [parsed];
      },
    );

    expect(blocks.some((block) => block['@type'] === 'WebPage')).toBe(true);
    const breadcrumbs = blocks.find((block) => block['@type'] === 'BreadcrumbList');
    expect(breadcrumbs).toBeDefined();
    expect(JSON.stringify(breadcrumbs)).toContain('/experimental-ui');
  });
});

describe('experimental UI metadata', () => {
  it('is self-canonical and excluded from search indexes', async () => {
    const metadata = await generateMetadata(englishProps, resolvingMetadata());

    expect(documentTitleOf(metadata)).toBe('Observatory art view · Cosmic Signature');
    expect(metadata.robots).toEqual(
      expect.objectContaining({
        index: false,
        follow: true,
      }),
    );
    expect(String(metadata.alternates?.canonical)).toMatch(/\/experimental-ui$/);
  });

  it('localizes the Chinese title and canonical path', async () => {
    const metadata = await generateMetadata(
      { params: Promise.resolve({ locale: 'zh' }) },
      resolvingMetadata(),
    );

    expect(documentTitleOf(metadata)).toBe('观测台艺术视图 · Cosmic Signature');
    expect(String(metadata.alternates?.canonical)).toMatch(/\/zh\/experimental-ui$/);
  });
});
