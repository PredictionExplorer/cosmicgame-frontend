import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { getAboutContent } from '../content/about';
import { getFaqContent } from '../content/faq';
import { getLandingContent } from '../content/landing';
import { protocolFacts } from '../content/protocol-facts';
import { getWhitePaperContent } from '../content/white-paper';
import { COSMIC_SIGNATURE_MARKETPLACE_URL } from '../config/marketplace';
import { CHAOS_ZERO_PREDICTIONS_URL } from '../config/predictions';
import type { LocaleRecord } from '../i18n/locale';
import { routing } from '../i18n/routing';

const SECTION_NAMES: LocaleRecord<string> = {
  en: 'English',
  zh: '中文概览',
  'zh-TW': '繁體中文（台灣）概覽',
  'zh-HK': '繁體中文（香港）概覽',
  uk: 'Українська: огляд',
  ko: '한국어 개요',
  ja: '日本語の概要',
  vi: 'Tiếng Việt: tổng quan',
};

const LANDING_PATHS = ['', '/about', '/white-paper', '/learn', '/quiz'];
const APP_PATHS = [
  '',
  '/current-cycle',
  '/how-it-works',
  '/faq',
  '/gallery',
  '/statistics',
  '/anchoring',
  '/allocation',
  '/contracts',
  '/code',
  '/security',
  '/audits',
  '/risk-disclosures',
  '/terms',
  '/privacy',
  '/marketing',
  '/imprint',
  '/my-tokens',
  '/my-anchors',
  '/my-allocations',
  '/my-statistics',
];

/** Plain-text documentation shares the site's edited, locale-owned explanations. */
export function buildLlmsDocs(full: boolean): string {
  const p = protocolFacts;
  const cst = (value: number) => value.toLocaleString('en-US');
  const intro = [
    '# Cosmic Signature',
    getAboutContent('en').body.lede,
    'Cosmic Signature is not related to the COSMIC cancer mutation database or COSMIC mutational signatures in biology.',
    '## Current contract mechanics',
    `The checked Arbitrum One deployment uses V3 at ${p.contractAddresses.implementation}, behind proxy ${p.contractAddresses.proxy}. Parameters can change; read the contracts before acting.`,
    `The Signature Allocation receives ${p.mainEthPercentage}% of the ETH reserve, ${cst(p.specialAllocationCst)} CST in total and ${p.mainPrizeNftsPerCycle} sequential NFTs. Chrono-Warrior receives ${p.chronoWarriorEthPercentage}%; participant ETH Stellar Selection shares ${p.stellarSelectionEthPercentage}%; Anchor Distribution receives ${p.anchorDistributionPercentage}%; Public Goods receives ${p.publicGoodsPercentage}%. Approximately half remains, with rounding and omitted-transfer exceptions.`,
    `With every track present, finalization creates ${p.typicalNftsPerCycle} Cosmic Signature NFTs and ${cst(p.typicalCstImprintsPerCycle)} fixed CST, including ${cst(p.outreachReserveCst)} CST for the Outreach Reserve. The Final CST Gesture and anchored Random Walk tracks are conditional. Three main NFTs do not create three separate CST allocations.`,
    'Participation CST is linear and credited to the previous participant when the next gesture executes. The first gesture creates no dynamic CST; finalization does not settle the last participant’s pending amount. Both participant ETH and NFT selections use the concurrent undiscounted, premium-free ETH base cost as weight, including CST gestures. Repeated recipients are possible.',
    'V3 changes the CST price-decline rate, not a stored window duration. ETH attempts to increase the rate subject to a minimum-window guard; CST decreases the rate and resets its ceiling. Late prices can reach approximately five times the base cost; the premium does not increase selection weight or the following base price.',
    `The Final Gesture participant has a ${p.finalGestureExclusivityHours}-hour exclusive finalization window after the deadline; afterwards anyone may finalize and the finalizer receives the Signature Allocation. Gestures remain possible until finalization. Each later gesture extends the stored deadline; the increment grows ${p.cycleTimeIncrementIncreasePercentPerCycle}% per finalized cycle.`,
    `Secondary ETH and attached assets have a ${p.secondaryRetrievalTimeoutWeeks}-week retrieval timeout; afterwards anyone may retrieve unretrieved allocations for themselves. Each NFT can be anchored only once. For the ETH cost reduction, each Random Walk NFT can be used once.`,
    'Public Goods ETH first goes to the configured vault. A separate permissionless transaction forwards its balance to the current beneficiary, presently Protocol Guild. The owner can change that beneficiary. A failed transfer can leave the share in the reserve.',
    'Artwork reproduction requires its seed, renderer revision, configuration and compatible toolchain. Image-reference checks are currently manual. Historical audit reports describe their reviewed revisions; the V3 implementation is not currently verified on Sourcify. Ownership powers remain and have no automatic sunset.',
    '## Ecosystem and media',
    `[Axiom Zero](${COSMIC_SIGNATURE_MARKETPLACE_URL}) is the zero-fee NFT marketplace for Cosmic Signature and Random Walk NFTs.`,
    `[Chaos Zero](${CHAOS_ZERO_PREDICTIONS_URL}) is the prediction market about whether a cycle has more gestures than the previous one.`,
    `[CST on Uniswap](https://app.uniswap.org/swap?chain=arbitrum&inputCurrency=NATIVE&outputCurrency=${p.contractAddresses.cstToken})`,
    '[Artwork pages](https://app.cosmicsignature.com/detail/{tokenId}) · [Image sitemap](https://app.cosmicsignature.com/sitemap-nfts.xml)',
    '[Source code](https://github.com/PredictionExplorer/Cosmic-Signature) · [Renderer](https://github.com/PredictionExplorer/CS-Image-Generation) · [X](https://x.com/CosmicSignature) · [Discord](https://discord.gg/bGnPn96Qwt)',
    '[Full documentation](https://cosmicsignature.com/llms-full.txt)',
  ];
  const sections = routing.locales.map((locale) => {
    const prefix = locale === routing.defaultLocale ? '' : `/${locale}`;
    const footer = JSON.parse(
      readFileSync(join(process.cwd(), 'messages', locale, 'footer.json'), 'utf8'),
    ) as { disambiguation: string };
    const about = getAboutContent(locale);
    const paper = getWhitePaperContent(locale);
    const faq = getFaqContent(locale);
    const categories = faq.categories.slice(0, full ? 5 : 3);
    const paths = [
      ...LANDING_PATHS.map((path) => `https://cosmicsignature.com${prefix}${path || '/'}`),
      ...APP_PATHS.map((path) => `https://app.cosmicsignature.com${prefix}${path || '/'}`),
    ];
    return [
      `## ${SECTION_NAMES[locale]}`,
      about.body.lede,
      footer.disambiguation,
      paths.map((url) => `- [${new URL(url).pathname}](${url})`).join('\n'),
      `[${paper.hero.versionLabel} — ${paper.hero.dateLabel}](https://cosmicsignature.com${prefix}/white-paper)`,
      getLandingContent(locale).art.description,
      ...categories.flatMap((category) => [
        `### ${category.title}`,
        ...category.items.flatMap((item) => [`#### ${item.question}`, item.answer]),
      ]),
    ].join('\n\n');
  });
  return [...intro, ...sections].join('\n\n').normalize('NFC') + '\n';
}
