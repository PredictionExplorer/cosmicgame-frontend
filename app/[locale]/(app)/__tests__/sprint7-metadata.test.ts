import zhMeta from '@/messages/zh/meta.json';
import { expectedLanguageAlternates } from '@/test-utils/i18n';
import { documentTitleOf, resolvingMetadata } from '@/test-utils/metadata';

import { APP_ORIGIN } from '@/lib/hostRouting';

import { generateMetadata as generateAdminSettingsMetadata } from '../admin/admin/page';
import { generateMetadata as generateAdminMetadata } from '../admin/page';
import AllocationDetailPage, {
  generateMetadata as generateAllocationDetailMetadata,
} from '../allocation/[id]/page';
import { generateMetadata as generateCoordinationMetadata } from '../coordination-changes/page';
import { generateMetadata as generateEmbedEnduranceMetadata } from '../../(embed)/embed/endurance/[round]/page';
import { generateMetadata as generateEthContributionDetailMetadata } from '../eth-contribution/detail/[id]/page';
import { generateMetadata as generateEthContributionMetadata } from '../eth-contribution/page';
import { generateMetadata as generateEthContributionCycleMetadata } from '../eth-contribution/round/[round]/page';
import { generateMetadata as generateInternalTransferMetadata } from '../internal/cst-outreach-transfer/page';
import { generateMetadata as generateOutreachAddressMetadata } from '../marketing/[address]/page';
import { generateMetadata as generateOutreachMetadata } from '../marketing/page';
import { generateMetadata as generatePublicGoodsCgMetadata } from '../public-goods-contributions-cg/page';
import { generateMetadata as generatePublicGoodsVoluntaryMetadata } from '../public-goods-contributions-voluntary/page';
import { generateMetadata as generatePublicGoodsRetrievalsMetadata } from '../public-goods-retrievals/page';

jest.mock('../PublicDataRouteSeoSummary', () => ({ PublicDataRouteSeoSummary: () => null }));
jest.mock('../allocation/[id]/AllocationInfoPage', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('../eth-contribution/EthDonations', () => ({ __esModule: true, default: () => null }));
jest.mock('../eth-contribution/detail/[id]/EthDonationDetailPage', () => ({
  __esModule: true,
  default: () => null,
}));
// The record page reads its record on the server; the tab titles follow what it found.
const mockReadContribution = jest.fn();
jest.mock('../eth-contribution/detail/[id]/contributionRecord', () => ({
  readContribution: (...args: unknown[]) => mockReadContribution(...args),
  contributionSeeds: () => [],
}));
jest.mock('../eth-contribution/round/[round]/EthDonationByRoundPage', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('../public-goods-contributions-cg/CharityCGDeposits', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('../public-goods-contributions-voluntary/CharityDepositsVoluntary', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('../public-goods-retrievals/CharityWithdrawals', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('../marketing/MarketingRewards', () => ({ __esModule: true, default: () => null }));
jest.mock('../marketing/[address]/MarketingRewardsPage', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('../coordination-changes/ChangedParameters', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('../admin/AdminPage', () => ({ __esModule: true, default: () => null }));
jest.mock('../admin/admin/AdminSettingsPage', () => ({ __esModule: true, default: () => null }));
jest.mock('../internal/cst-outreach-transfer/CstOutreachTransferPage', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('../../(embed)/embed/endurance/[round]/EmbedEnduranceChart', () => ({
  __esModule: true,
  default: () => null,
}));

const localizedRoutes = [
  { path: '/eth-contribution', build: generateEthContributionMetadata },
  { path: '/eth-contribution/detail/7', build: generateEthContributionDetailMetadata },
  { path: '/eth-contribution/round/7', build: generateEthContributionCycleMetadata },
  { path: '/public-goods-contributions-cg', build: generatePublicGoodsCgMetadata },
  { path: '/public-goods-contributions-voluntary', build: generatePublicGoodsVoluntaryMetadata },
  { path: '/public-goods-retrievals', build: generatePublicGoodsRetrievalsMetadata },
  { path: '/marketing', build: generateOutreachMetadata },
  { path: '/marketing/0x1234', build: generateOutreachAddressMetadata },
  { path: '/coordination-changes', build: generateCoordinationMetadata },
  { path: '/admin', build: generateAdminMetadata },
  { path: '/admin/admin', build: generateAdminSettingsMetadata },
  { path: '/internal/cst-outreach-transfer', build: generateInternalTransferMetadata },
  { path: '/embed/endurance/7', build: generateEmbedEnduranceMetadata },
] as const;

const zhParams = () =>
  Promise.resolve({
    locale: 'zh',
    id: '7',
    round: '7',
    address: '0x1234',
  });

describe('Sprint 7 route metadata', () => {
  beforeEach(() => {
    mockReadContribution.mockReset();
    mockReadContribution.mockResolvedValue({ status: 'unknown' });
  });

  it.each(localizedRoutes)(
    '$path emits zh canonical, hreflang, and OG locale',
    async ({ path, build }) => {
      const metadata = await build({ params: zhParams() }, resolvingMetadata());
      expect(metadata.alternates).toEqual({
        canonical: `${APP_ORIGIN}/zh${path}`,
        languages: expectedLanguageAlternates(APP_ORIGIN, path),
      });
      expect(metadata.openGraph).toEqual(expect.objectContaining({ locale: 'zh_CN' }));
    },
  );

  it('preserves noindex on private and thin routes', async () => {
    const noindexRoutes = localizedRoutes.filter(({ path }) =>
      [
        '/eth-contribution/detail/7',
        '/eth-contribution/round/7',
        '/marketing/0x1234',
        '/admin',
        '/admin/admin',
        '/internal/cst-outreach-transfer',
        '/embed/endurance/7',
      ].includes(path),
    );

    for (const { build } of noindexRoutes) {
      const metadata = await build({ params: zhParams() }, resolvingMetadata());
      expect(metadata.robots).toEqual(expect.objectContaining({ index: false }));
    }
  });

  it('preserves nofollow on the standalone endurance embed', async () => {
    const metadata = await generateEmbedEnduranceMetadata({
      params: Promise.resolve({ locale: 'zh', round: '7' }),
    });
    expect(metadata.robots).toEqual(expect.objectContaining({ index: false, follow: false }));
  });

  it('contains complete Chinese titles for every Sprint 7 metadata key', () => {
    expect(zhMeta.ethContribution.title).toContain('ETH 贡献');
    expect(zhMeta.publicGoodsCgContributions.title).toContain('公共物品');
    expect(zhMeta.publicGoodsVoluntary.title).toContain('自愿');
    expect(zhMeta.publicGoodsRetrievals.title).toContain('取回');
    expect(zhMeta.outreach.title).toContain('推广分配');
    expect(zhMeta.coordinationChanges.title).toContain('协调变更');
    expect(zhMeta.admin.title).toContain('留言审核');
    expect(zhMeta.adminSettings.title).toContain('合约设置');
    expect(zhMeta.internalCstOutreachTransfer.title).toContain('推广转账');
    expect(zhMeta.embedEndurance.title).toContain('坚守');
  });

  it('names the record in the tab title of every record page, as its H1 does', async () => {
    // Every contribution, cycle and outreach record shared one static title, so
    // two tabs could not be told apart.
    const params = (extra: Record<string, string>) =>
      Promise.resolve({ locale: 'zh', id: '7', round: '7', address: '0x1234', ...extra });
    const titleOf = async (
      build: (typeof localizedRoutes)[number]['build'],
      extra: Record<string, string> = {},
    ) => documentTitleOf(await build({ params: params(extra) }, resolvingMetadata()));

    expect(await titleOf(generateEthContributionDetailMetadata)).toMatch(/^贡献 #7/);
    // A record the server read found missing is not titled as if it existed,
    // matching the H1 (regression: tab "Contribution #7" over "Contribution not found").
    mockReadContribution.mockResolvedValue({ status: 'missing' });
    expect(await titleOf(generateEthContributionDetailMetadata)).toMatch(/^未找到该贡献/);
    expect(mockReadContribution).toHaveBeenLastCalledWith(7);
    expect(await titleOf(generateEthContributionCycleMetadata)).toMatch(/^第 7 个周期的贡献/);
    expect(
      await titleOf(generateOutreachAddressMetadata, {
        address: '0xa169574d0d353e3010997a3e64846b7d1b2a63b6',
      }),
    ).toMatch(/^推广分配 · 0xA169…\u206063B6/);
  });

  it('emits unique, indexable allocation-detail metadata in both locales', async () => {
    const en = await generateAllocationDetailMetadata({
      params: Promise.resolve({ locale: 'en', id: '42' }),
    });
    const zh = await generateAllocationDetailMetadata({
      params: Promise.resolve({ locale: 'zh', id: '42' }),
    });

    expect(documentTitleOf(en)).toBe('Cycle #42 Allocation Information · Cosmic Signature');
    expect(en.description).toContain('cycle #42');
    expect(en.alternates?.canonical).toBe(`${APP_ORIGIN}/allocation/42`);
    expect(en.robots).toEqual(expect.objectContaining({ index: true }));

    expect(documentTitleOf(zh)).toBe('第 42 个周期分配详情 · Cosmic Signature');
    expect(zh.description).toContain('第 42 个');
    expect(zh.alternates).toEqual({
      canonical: `${APP_ORIGIN}/zh/allocation/42`,
      languages: expectedLanguageAlternates(APP_ORIGIN, '/allocation/42'),
    });
    expect(zh.robots).toEqual(expect.objectContaining({ index: true }));
  });

  it.each(['-1', '12abc', '01', '1.5', String(Number.MAX_SAFE_INTEGER + 1)])(
    '404s non-canonical allocation cycle ID %j in metadata and page rendering',
    async (id) => {
      const metadataProps = { params: Promise.resolve({ locale: 'en', id }) };
      const pageProps = { params: Promise.resolve({ locale: 'en', id }) };

      await expect(generateAllocationDetailMetadata(metadataProps)).rejects.toThrow(
        'NEXT_NOT_FOUND',
      );
      await expect(AllocationDetailPage(pageProps)).rejects.toThrow('NEXT_NOT_FOUND');
    },
  );
});
