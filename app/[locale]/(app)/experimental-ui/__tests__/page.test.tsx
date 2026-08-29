import { getCstInfoSeed, getDashboardInfoSeed } from '@/services/api/server';

import { render, screen } from '@/test-utils';

import Page, { generateMetadata } from '../page';

jest.mock('@/services/api/server', () => ({
  getDashboardInfoSeed: jest.fn(),
  getCstInfoSeed: jest.fn(),
}));

jest.mock('../ExperimentalHomePage', () => ({
  __esModule: true,
  default: ({
    initialDashboardData,
    initialBannerToken,
  }: {
    initialDashboardData?: { CurRoundNum?: number } | null;
    initialBannerToken?: { id: number; info: { Seed?: string } } | null;
  }) => (
    <div
      data-testid="experimental-home"
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
    const metadata = await generateMetadata(englishProps);

    expect(metadata.title).toBe('Experimental UI | Cosmic Signature');
    expect(metadata.robots).toEqual(
      expect.objectContaining({
        index: false,
        follow: true,
      }),
    );
    expect(String(metadata.alternates?.canonical)).toMatch(/\/experimental-ui$/);
  });

  it('localizes the Chinese title and canonical path', async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: 'zh' }),
    });

    expect(metadata.title).toBe('实验界面 · Cosmic Signature');
    expect(String(metadata.alternates?.canonical)).toMatch(/\/zh\/experimental-ui$/);
  });
});
