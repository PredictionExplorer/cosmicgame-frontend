/**
 * Canonical Sprint 8 inventory for every page under app/[locale].
 *
 * `pageFile` is checked against the filesystem by a Jest guard (the 404 is
 * app/global-not-found.tsx, outside app/[locale], and an alias is answered
 * by proxy.ts). `publicPath`
 * documents the real route shape, while `fixturePath` supplies deterministic
 * values for every dynamic segment.
 */

/**
 * The 404 for every URL no route matches, relative to app/[locale] like the
 * page files: app/global-not-found.tsx renders the whole document.
 */
export const GLOBAL_NOT_FOUND_FILE = '../global-not-found.tsx';

/**
 * The source of every alias route, relative to app/[locale] like the page
 * files: an alias has no page, and proxy.ts redirects it to the page it names
 * (PAGE_ALIASES in lib/paramRoutes.ts).
 */
export const PROXY_ALIAS_FILE = '../../proxy.ts';

export type ZhRouteHost = 'app' | 'landing';
export type ZhRouteCluster =
  | 'global'
  | 'landing'
  | 'core'
  | 'transactions'
  | 'statistics'
  | 'trust'
  | 'long-tail';

export interface ZhRouteInventoryEntry {
  id: string;
  pageFile: string;
  publicPath: string;
  fixturePath: string;
  host: ZhRouteHost;
  cluster: ZhRouteCluster;
  expectedText: string;
  /** Redirecting aliases are validated at their final localized destination. */
  redirectsTo?: string;
  /** A few pages intentionally use a brand-only title; descriptions remain Chinese. */
  allowBrandOnlyTitle?: boolean;
  /** Embeds and compact data views can intentionally omit heading elements. */
  allowNoHeading?: boolean;
}

export const ZH_ROUTE_FIXTURES = {
  address: '0x1111111111111111111111111111111111111111',
  cycle: 42,
  actionId: 73,
  tokenId: 420,
  gestureId: 9101,
  contributionId: 7,
  learnSlug: 'what-is-cosmic-signature',
} as const;

const { address, cycle, actionId, tokenId, gestureId, contributionId, learnSlug } =
  ZH_ROUTE_FIXTURES;

export const ZH_ROUTE_INVENTORY: readonly ZhRouteInventoryEntry[] = [
  // Sprint 1 — global chrome and utility routes.
  {
    id: 'app-not-found',
    // Any URL no route matches: the whole-document 404 at the app root.
    pageFile: GLOBAL_NOT_FOUND_FILE,
    publicPath: '/[...notFound]',
    fixturePath: '/quality-assurance-route-not-found',
    host: 'app',
    cluster: 'global',
    expectedText: '找不到页面',
  },
  {
    id: 'site-map',
    pageFile: '(app)/site-map/page.tsx',
    publicPath: '/site-map',
    fixturePath: '/site-map',
    host: 'app',
    cluster: 'global',
    expectedText: '网站地图',
  },

  // Sprint 2 — landing and Learn.
  {
    id: 'landing-home',
    pageFile: '(landing)/landing-site/page.tsx',
    publicPath: '/',
    fixturePath: '/',
    host: 'landing',
    cluster: 'landing',
    expectedText: '程序化链上艺术',
  },
  {
    id: 'about',
    pageFile: '(landing)/about/page.tsx',
    publicPath: '/about',
    fixturePath: '/about',
    host: 'landing',
    cluster: 'landing',
    expectedText: '关于 Cosmic Signature',
  },
  {
    id: 'learn',
    pageFile: '(landing)/learn/page.tsx',
    publicPath: '/learn',
    fixturePath: '/learn',
    host: 'landing',
    cluster: 'landing',
    expectedText: '了解 Cosmic Signature',
  },
  {
    id: 'learn-article',
    pageFile: '(landing)/learn/[slug]/page.tsx',
    publicPath: '/learn/[slug]',
    fixturePath: `/learn/${learnSlug}`,
    host: 'landing',
    cluster: 'landing',
    expectedText: '什么是 Cosmic Signature？',
  },
  {
    id: 'white-paper',
    pageFile: '(landing)/white-paper/page.tsx',
    publicPath: '/white-paper',
    fixturePath: '/white-paper',
    host: 'landing',
    cluster: 'landing',
    expectedText: 'Arbitrum 上的程序化链上艺术协议',
  },
  {
    id: 'quiz-hub',
    pageFile: '(landing)/quiz/page.tsx',
    publicPath: '/quiz',
    fixturePath: '/quiz',
    host: 'landing',
    cluster: 'landing',
    expectedText: '你对 Cosmic Signature 了解多少？',
  },
  {
    id: 'quiz-tier',
    pageFile: '(landing)/quiz/[tier]/page.tsx',
    publicPath: '/quiz/[tier]',
    fixturePath: '/quiz/basic',
    host: 'landing',
    cluster: 'landing',
    expectedText: '二十五道基础题',
  },

  // Sprint 3 — core dApp journey.
  {
    id: 'app-home',
    pageFile: '(app)/page.tsx',
    publicPath: '/',
    fixturePath: '/',
    host: 'app',
    cluster: 'core',
    expectedText: '落笔塑造艺术',
    allowBrandOnlyTitle: true,
  },
  {
    id: 'experimental-ui',
    pageFile: '(app)/experimental-ui/page.tsx',
    publicPath: '/experimental-ui',
    fixturePath: '/experimental-ui',
    host: 'app',
    cluster: 'core',
    expectedText: '观测台艺术视图',
  },
  {
    id: 'current-cycle',
    pageFile: '(app)/current-cycle/page.tsx',
    publicPath: '/current-cycle',
    fixturePath: '/current-cycle',
    host: 'app',
    cluster: 'core',
    expectedText: '落笔总次数',
  },
  {
    id: 'gallery',
    pageFile: '(app)/gallery/page.tsx',
    publicPath: '/gallery',
    fixturePath: '/gallery',
    host: 'app',
    cluster: 'core',
    expectedText: 'Cosmic Signature 画廊',
  },
  {
    id: 'detail',
    pageFile: '(app)/detail/[id]/page.tsx',
    publicPath: '/detail/[id]',
    fixturePath: `/detail/${tokenId}`,
    host: 'app',
    cluster: 'core',
    expectedText: '铭刻时间',
    allowBrandOnlyTitle: true,
  },
  {
    id: 'gesture-detail',
    pageFile: '(app)/gesture/[id]/page.tsx',
    publicPath: '/gesture/[id]',
    fixturePath: `/gesture/${gestureId}`,
    host: 'app',
    cluster: 'core',
    // A header figure label: it renders only once the gesture has loaded.
    expectedText: '落笔价格',
  },
  {
    id: 'how-it-works',
    pageFile: '(app)/how-it-works/page.tsx',
    publicPath: '/how-it-works',
    fixturePath: '/how-it-works',
    host: 'app',
    cluster: 'core',
    expectedText: '运作原理',
  },

  // Sprint 4 — transactions and holdings.
  {
    id: 'allocation',
    pageFile: '(app)/allocation/page.tsx',
    publicPath: '/allocation',
    fixturePath: '/allocation',
    host: 'app',
    cluster: 'transactions',
    expectedText: '分配名录',
  },
  {
    id: 'allocation-detail',
    pageFile: '(app)/allocation/[id]/page.tsx',
    publicPath: '/allocation/[id]',
    fixturePath: `/allocation/${cycle}`,
    host: 'app',
    cluster: 'transactions',
    expectedText: `第 ${cycle} 个周期`,
  },
  {
    id: 'allocation-finalized',
    pageFile: '(app)/allocation-finalized/page.tsx',
    publicPath: '/allocation-finalized',
    fixturePath: `/allocation-finalized?cycle=${cycle}`,
    host: 'app',
    cluster: 'transactions',
    expectedText: `第 ${cycle} 个周期的签名分配`,
  },
  {
    id: 'anchoring',
    pageFile: '(app)/anchoring/page.tsx',
    publicPath: '/anchoring',
    fixturePath: '/anchoring',
    host: 'app',
    cluster: 'transactions',
    expectedText: '锚定派发',
  },
  {
    id: 'anchor-action',
    pageFile: '(app)/anchor-action/[IsRwalk]/[actionId]/page.tsx',
    publicPath: '/anchor-action/[IsRwalk]/[actionId]',
    fixturePath: `/anchor-action/0/${actionId}`,
    host: 'app',
    cluster: 'transactions',
    expectedText: '锚定操作',
  },
  {
    id: 'my-allocations',
    pageFile: '(app)/my-allocations/page.tsx',
    publicPath: '/my-allocations',
    fixturePath: '/my-allocations',
    host: 'app',
    cluster: 'transactions',
    expectedText: '我的分配',
  },
  {
    id: 'my-anchors',
    pageFile: '(app)/my-anchors/page.tsx',
    publicPath: '/my-anchors',
    fixturePath: '/my-anchors',
    host: 'app',
    cluster: 'transactions',
    expectedText: '我的锚定',
  },
  {
    id: 'my-statistics',
    pageFile: '(app)/my-statistics/page.tsx',
    publicPath: '/my-statistics',
    fixturePath: '/my-statistics',
    host: 'app',
    cluster: 'transactions',
    expectedText: '我的统计',
  },
  {
    id: 'my-tokens',
    pageFile: '(app)/my-tokens/page.tsx',
    publicPath: '/my-tokens',
    fixturePath: '/my-tokens',
    host: 'app',
    cluster: 'transactions',
    expectedText: '我的 NFT',
  },
  {
    id: 'transfer-cst',
    pageFile: '(app)/transfer-cst/page.tsx',
    publicPath: '/transfer-cst',
    fixturePath: '/transfer-cst',
    host: 'app',
    cluster: 'transactions',
    expectedText: '转账 CST',
  },
  {
    id: 'signature-transfer-history',
    pageFile: '(app)/cosmic-signature-transfer/[address]/page.tsx',
    publicPath: '/cosmic-signature-transfer/[address]',
    fixturePath: `/cosmic-signature-transfer/${address}`,
    host: 'app',
    cluster: 'transactions',
    expectedText: 'NFT 转移记录',
  },
  {
    id: 'cst-transfer-history',
    pageFile: '(app)/cosmic-token-transfer/[address]/page.tsx',
    publicPath: '/cosmic-token-transfer/[address]',
    fixturePath: `/cosmic-token-transfer/${address}`,
    host: 'app',
    cluster: 'transactions',
    expectedText: 'CST 转账记录',
  },
  {
    id: 'token-distributions',
    pageFile: '(app)/distributions-by-token/[address]/[tokenId]/page.tsx',
    publicPath: '/distributions-by-token/[address]/[tokenId]',
    fixturePath: `/distributions-by-token/${address}/${tokenId}`,
    host: 'app',
    cluster: 'transactions',
    expectedText: `Cosmic Signature #${String(tokenId).padStart(6, '0')} 的锚定派发`,
  },

  // Sprint 5 — statistics and public data tables.
  {
    id: 'statistics',
    pageFile: '(app)/statistics/page.tsx',
    publicPath: '/statistics',
    fixturePath: '/statistics',
    host: 'app',
    cluster: 'statistics',
    expectedText: '协议统计',
  },
  {
    id: 'statistics-activity',
    pageFile: '(app)/statistics/activity/page.tsx',
    publicPath: '/statistics/activity',
    fixturePath: '/statistics/activity',
    host: 'app',
    cluster: 'statistics',
    expectedText: '落笔活动统计',
  },
  {
    id: 'statistics-anchoring',
    pageFile: '(app)/statistics/anchoring/page.tsx',
    publicPath: '/statistics/anchoring',
    fixturePath: '/statistics/anchoring',
    host: 'app',
    cluster: 'statistics',
    expectedText: '锚定统计',
  },
  {
    id: 'statistics-participation',
    pageFile: '(app)/statistics/participation/page.tsx',
    publicPath: '/statistics/participation',
    fixturePath: '/statistics/participation',
    host: 'app',
    cluster: 'statistics',
    expectedText: '参与统计',
  },
  {
    id: 'statistics-performance',
    pageFile: '(app)/statistics/performance/page.tsx',
    publicPath: '/statistics/performance',
    fixturePath: '/statistics/performance',
    host: 'app',
    cluster: 'statistics',
    expectedText: '参与者结果',
  },
  {
    id: 'statistics-tokens',
    pageFile: '(app)/statistics/tokens/page.tsx',
    publicPath: '/statistics/tokens',
    fixturePath: '/statistics/tokens',
    host: 'app',
    cluster: 'statistics',
    expectedText: '代币分布统计',
  },
  {
    id: 'recipient-history',
    pageFile: '(app)/recipient-history/page.tsx',
    publicPath: '/recipient-history',
    fixturePath: '/recipient-history',
    host: 'app',
    cluster: 'statistics',
    expectedText: '我的分配历史',
  },
  {
    id: 'named-nfts',
    pageFile: '(app)/named-nfts/page.tsx',
    publicPath: '/named-nfts',
    fixturePath: '/named-nfts',
    host: 'app',
    cluster: 'statistics',
    expectedText: '已命名 Cosmic Signature NFT',
  },
  {
    id: 'attached-nfts',
    pageFile: '(app)/attached-nfts/page.tsx',
    publicPath: '/attached-nfts',
    fixturePath: '/attached-nfts',
    host: 'app',
    cluster: 'statistics',
    expectedText: '已附加 NFT 贡献',
  },
  {
    id: 'used-rwlk-nfts',
    pageFile: '(app)/used-rwlk-nfts/page.tsx',
    publicPath: '/used-rwlk-nfts',
    fixturePath: '/used-rwlk-nfts',
    host: 'app',
    cluster: 'statistics',
    expectedText: '已使用的 Random Walk NFT',
  },
  {
    id: 'user',
    pageFile: '(app)/user/[address]/page.tsx',
    publicPath: '/user/[address]',
    fixturePath: `/user/${address}`,
    host: 'app',
    cluster: 'statistics',
    expectedText: '落笔花费',
  },
  {
    id: 'user-stellar-eth',
    pageFile: '(app)/user/stellar-selection-eth/[address]/page.tsx',
    publicPath: '/user/stellar-selection-eth/[address]',
    fixturePath: `/user/stellar-selection-eth/${address}`,
    host: 'app',
    cluster: 'statistics',
    expectedText: '星选 · ETH',
    allowNoHeading: true,
  },
  {
    id: 'user-stellar-nft',
    pageFile: '(app)/user/stellar-selection-nft/[address]/page.tsx',
    publicPath: '/user/stellar-selection-nft/[address]',
    fixturePath: `/user/stellar-selection-nft/${address}`,
    host: 'app',
    cluster: 'statistics',
    expectedText: '星选 · NFT',
    allowNoHeading: true,
  },
  {
    id: 'system-event',
    pageFile: '(app)/system-event/[round]/[start]/[end]/page.tsx',
    publicPath: '/system-event/[round]/[start]/[end]',
    fixturePath: `/system-event/${cycle}/100/200`,
    host: 'app',
    cluster: 'statistics',
    expectedText: `第 ${cycle} 个周期前的协调变更`,
  },

  // Sprint 6 — FAQ, legal, trust, contracts, and source.
  {
    id: 'faq',
    pageFile: '(app)/faq/page.tsx',
    publicPath: '/faq',
    fixturePath: '/faq',
    host: 'app',
    cluster: 'trust',
    expectedText: 'Cosmic Signature 常见问题',
  },
  {
    id: 'terms',
    pageFile: '(app)/terms/page.tsx',
    publicPath: '/terms',
    fixturePath: '/terms',
    host: 'app',
    cluster: 'trust',
    expectedText: '服务条款',
  },
  {
    id: 'privacy',
    pageFile: '(app)/privacy/page.tsx',
    publicPath: '/privacy',
    fixturePath: '/privacy',
    host: 'app',
    cluster: 'trust',
    expectedText: '隐私政策',
  },
  {
    id: 'risk-disclosures',
    pageFile: '(app)/risk-disclosures/page.tsx',
    publicPath: '/risk-disclosures',
    fixturePath: '/risk-disclosures',
    host: 'app',
    cluster: 'trust',
    expectedText: '风险披露',
  },
  {
    id: 'security',
    pageFile: '(app)/security/page.tsx',
    publicPath: '/security',
    fixturePath: '/security',
    host: 'app',
    cluster: 'trust',
    expectedText: '安全',
  },
  {
    id: 'audits',
    pageFile: '(app)/audits/page.tsx',
    publicPath: '/audits',
    fixturePath: '/audits',
    host: 'app',
    cluster: 'trust',
    expectedText: '审计',
  },
  {
    id: 'imprint',
    pageFile: '(app)/imprint/page.tsx',
    publicPath: '/imprint',
    fixturePath: '/imprint',
    host: 'app',
    cluster: 'trust',
    expectedText: '铭刻 Random Walk NFT',
  },
  {
    id: 'contracts',
    pageFile: '(app)/contracts/page.tsx',
    publicPath: '/contracts',
    fixturePath: '/contracts',
    host: 'app',
    cluster: 'trust',
    expectedText: '核心合约',
  },
  {
    id: 'code',
    pageFile: '(app)/code/page.tsx',
    publicPath: '/code',
    fixturePath: '/code',
    host: 'app',
    cluster: 'trust',
    expectedText: '代码查看器',
  },
  {
    id: 'source-code-alias',
    pageFile: PROXY_ALIAS_FILE,
    publicPath: '/source-code',
    fixturePath: '/source-code',
    host: 'app',
    cluster: 'trust',
    expectedText: '代码查看器',
    redirectsTo: '/code',
  },

  // Sprint 7 — contribution, outreach, coordination, and restricted tools.
  {
    id: 'eth-contribution',
    pageFile: '(app)/eth-contribution/page.tsx',
    publicPath: '/eth-contribution',
    fixturePath: '/eth-contribution',
    host: 'app',
    cluster: 'long-tail',
    expectedText: 'ETH 贡献',
  },
  {
    id: 'eth-contribution-detail',
    pageFile: '(app)/eth-contribution/detail/[id]/page.tsx',
    publicPath: '/eth-contribution/detail/[id]',
    fixturePath: `/eth-contribution/detail/${contributionId}`,
    host: 'app',
    cluster: 'long-tail',
    expectedText: `贡献 #${contributionId}`,
  },
  {
    id: 'eth-contribution-cycle',
    pageFile: '(app)/eth-contribution/round/[round]/page.tsx',
    publicPath: '/eth-contribution/round/[round]',
    fixturePath: `/eth-contribution/round/${contributionId}`,
    host: 'app',
    cluster: 'long-tail',
    expectedText: `第 ${contributionId} 个周期的贡献`,
  },
  {
    id: 'public-goods-cg',
    pageFile: '(app)/public-goods-contributions-cg/page.tsx',
    publicPath: '/public-goods-contributions-cg',
    fixturePath: '/public-goods-contributions-cg',
    host: 'app',
    cluster: 'long-tail',
    expectedText: '协议公共物品资助',
  },
  {
    id: 'public-goods-voluntary',
    pageFile: '(app)/public-goods-contributions-voluntary/page.tsx',
    publicPath: '/public-goods-contributions-voluntary',
    fixturePath: '/public-goods-contributions-voluntary',
    host: 'app',
    cluster: 'long-tail',
    expectedText: '自愿公共物品资助',
  },
  {
    id: 'public-goods-retrievals',
    pageFile: '(app)/public-goods-retrievals/page.tsx',
    publicPath: '/public-goods-retrievals',
    fixturePath: '/public-goods-retrievals',
    host: 'app',
    cluster: 'long-tail',
    expectedText: '公共物品取回',
  },
  {
    id: 'outreach',
    pageFile: '(app)/marketing/page.tsx',
    publicPath: '/marketing',
    fixturePath: '/marketing',
    host: 'app',
    cluster: 'long-tail',
    expectedText: '推广分配',
  },
  {
    id: 'outreach-address',
    pageFile: '(app)/marketing/[address]/page.tsx',
    publicPath: '/marketing/[address]',
    fixturePath: `/marketing/${address}`,
    host: 'app',
    cluster: 'long-tail',
    expectedText: '获得的推广分配',
  },
  {
    id: 'coordination-changes',
    pageFile: '(app)/coordination-changes/page.tsx',
    publicPath: '/coordination-changes',
    fixturePath: '/coordination-changes',
    host: 'app',
    cluster: 'long-tail',
    expectedText: '协调变更',
  },
  {
    id: 'admin',
    pageFile: '(app)/admin/page.tsx',
    publicPath: '/admin',
    fixturePath: '/admin',
    host: 'app',
    cluster: 'long-tail',
    expectedText: '落笔留言审核',
  },
  {
    id: 'admin-settings',
    pageFile: '(app)/admin/admin/page.tsx',
    publicPath: '/admin/admin',
    fixturePath: '/admin/admin',
    host: 'app',
    cluster: 'long-tail',
    expectedText: '合约设置',
  },
  {
    id: 'internal-outreach-transfer',
    pageFile: '(app)/internal/cst-outreach-transfer/page.tsx',
    publicPath: '/internal/cst-outreach-transfer',
    fixturePath: '/internal/cst-outreach-transfer',
    host: 'app',
    cluster: 'long-tail',
    expectedText: 'CST 推广转账',
  },
  {
    id: 'endurance-embed',
    pageFile: '(embed)/embed/endurance/[round]/page.tsx',
    publicPath: '/embed/endurance/[round]',
    fixturePath: `/embed/endurance/${contributionId}`,
    host: 'app',
    cluster: 'long-tail',
    expectedText: '此周期暂无领先记录',
    allowNoHeading: true,
  },
] as const;

export function toZhPath(path: string): string {
  if (path === '/') return '/zh';
  return `/zh${path}`;
}
