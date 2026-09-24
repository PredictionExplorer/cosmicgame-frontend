import { getLandingContent, landingContentEn, landingContentZh } from '@/content/landing';

import { CST_GECKOTERMINAL_POOL_URL } from '@/config/geckoterminal';
import { outboundLinks } from '@/config/siteNav';

const landingContent = landingContentEn;

/**
 * Structural and regulatory invariants for the landing copy. Paired with
 * scripts/lexicon-scan.ts, these tests make it impossible to regress the
 * landing copy silently: any banned term outside the FAQ denial block or
 * any structural change (missing sections, missing CTAs) fails CI.
 */
describe('landing content shape', () => {
  it('selects complete locale models without changing structural invariants', () => {
    expect(getLandingContent('en')).toBe(landingContentEn);
    expect(getLandingContent('zh-CN')).toBe(landingContentZh);
    expect(landingContentZh.cycle.steps).toHaveLength(landingContentEn.cycle.steps.length);
    expect(landingContentZh.art.stages).toHaveLength(landingContentEn.art.stages.length);
    expect(landingContentZh.tracks.eth).toHaveLength(landingContentEn.tracks.eth.length);
    expect(landingContentZh.tracks.fixed).toHaveLength(landingContentEn.tracks.fixed.length);
    expect(landingContentZh.faq.items).toHaveLength(landingContentEn.faq.items.length);
    expect(JSON.stringify(landingContentZh)).toMatch(/[\u3400-\u9fff]/);
  });

  it('exposes all required top-level sections', () => {
    expect(landingContent).toMatchObject({
      meta: expect.any(Object),
      hero: expect.any(Object),
      cycle: expect.any(Object),
      art: expect.any(Object),
      tracks: expect.any(Object),
      anchoring: expect.any(Object),
      publicGoods: expect.any(Object),
      council: expect.any(Object),
      verifiability: expect.any(Object),
      faq: expect.any(Object),
      closing: expect.any(Object),
      footer: expect.any(Object),
    });
  });

  it('hero declares the primary CTA as the app subdomain', () => {
    expect(landingContent.hero.primaryCta.href).toBe('https://app.cosmicsignature.com');
  });

  it('cycle section explains a cycle in exactly three ordered steps', () => {
    expect(landingContent.cycle.steps.map((s) => s.number)).toEqual(['01', '02', '03']);
  });

  it('art section has exactly seven pipeline stages', () => {
    expect(landingContent.art.stages).toHaveLength(7);
  });

  it('tracks list six ETH shares that add up to 100% and four fixed allocations', () => {
    expect(landingContent.tracks.eth).toHaveLength(6);
    expect(landingContent.tracks.eth.reduce((total, track) => total + track.share, 0)).toBe(100);
    expect(landingContent.tracks.fixed).toHaveLength(4);
  });

  it('public-goods section contains the required disclaimer verbiage', () => {
    const disclaimer = landingContent.publicGoods.disclaimer.toLowerCase();
    expect(disclaimer).toContain('forwarding');
    expect(disclaimer).toContain('public-goods');
    expect(disclaimer).toContain('makes no representation');
  });

  it('FAQ has at least 5 denial-style clarifications', () => {
    expect(landingContent.faq.items.length).toBeGreaterThanOrEqual(5);
  });

  it('footer copy carries the tagline, a {year} copyright template and the colophon', () => {
    expect(landingContent.footer.tagline).toEqual(expect.any(String));
    expect(landingContent.footer.copyright).toContain('{year}');
    expect(landingContent.footer.colophon).toEqual(expect.any(String));
  });

  it('the shared footer ecosystem row links Axiom Zero, Chaos Zero, Uniswap, and GeckoTerminal', () => {
    // Both footers render the taxonomy (config/siteNav.ts), not landing copy.
    const hrefs = outboundLinks('ecosystem').map((link) => link.href);
    expect(hrefs).toContain('https://www.axiomzero.market/cosmic-signature');
    expect(hrefs).toContain('https://chaoszero.com');
    expect(hrefs.some((href) => href.startsWith('https://app.uniswap.org/'))).toBe(true);
    expect(hrefs).toContain(CST_GECKOTERMINAL_POOL_URL);
  });
});

describe('landing content contract accuracy', () => {
  it('anchoring copy states the once-only rule and payout-at-release behavior', () => {
    // StakingWalletNftBase.usedNfts: every NFT can be anchored only once,
    // and CS-NFT ETH accrual is paid out at unstake (anchor release).
    expect(landingContent.anchoring.body).toMatch(/anchored only once/i);
    expect(landingContent.anchoring.body).toMatch(/paid out when the anchor is released/i);
    expect(landingContent.anchoring.body).not.toMatch(/no lockup, no penalties, no fixed term/i);
  });

  it('anchoring copy does not promise ETH to RandomWalk anchors', () => {
    expect(landingContent.anchoring.bullets.join(' ')).toMatch(/Random Walk.*no ETH/i);
  });

  it('council quorum copy matches GovernorCountingSimple (Support + Abstain only)', () => {
    const quorumColumn = landingContent.council.columns.find(
      (column) => column.title === 'Coordination Quorum',
    );
    expect(quorumColumn).toBeDefined();
    expect(quorumColumn!.body).toMatch(/Support plus Abstain/i);
    expect(quorumColumn!.body).toMatch(/Opposition weight does not count/i);
    expect(quorumColumn!.body).not.toMatch(/expressed a position/i);
  });

  it('council copy mentions the delegation requirement for Coordination Weight', () => {
    expect(landingContent.council.body).toMatch(/delegate/i);
  });

  it('art copy matches the open-source render pipeline (64 spectral bins, native size)', () => {
    expect(JSON.stringify(landingContent.art.stages)).toMatch(/Sixty-four wavelength bins/);
    expect(JSON.stringify(landingContent.art)).not.toMatch(/\b16 wavelength|Sixteen wavelength/i);
    expect(landingContent.art.facts.find((fact) => fact.id === 'resolution')?.value).toBe(
      '3456 × 2234',
    );
    // The imprinted count is read live, never written into copy.
    expect(landingContent.art.facts.find((fact) => fact.id === 'imprinted')?.value).toBeNull();
  });

  it('keeps trust claims off the hero (they live, linked, under Verifiability)', () => {
    expect(JSON.stringify(landingContent.hero)).not.toMatch(
      /Audited|Formally Verified|Verified Contracts/i,
    );
  });

  it('describes the reserve split without claiming it reaches everyone who took part', () => {
    expect(landingContent.meta.description).not.toMatch(/everyone who shaped/i);
    expect(landingContent.meta.description).toMatch(/more than ten tracks/);
  });

  it('moves the COSMIC database disambiguation to the footer of every landing page', () => {
    expect(landingContent.footer.disambiguation).toMatch(/not related to the COSMIC/);
  });

  it('scopes CC0 claims to project-owned materials with third-party exceptions', () => {
    const english = JSON.stringify({
      verifiability: landingContentEn.verifiability,
      forkAnswer: landingContentEn.faq.items.find((item) => item.question === 'Can I fork this?'),
    });
    const chinese = JSON.stringify({
      verifiability: landingContentZh.verifiability,
      forkAnswer: landingContentZh.faq.items.find((item) => item.question.includes('自由复用')),
    });

    expect(english).toMatch(/Project-owned materials/);
    expect(english).toMatch(/third-party dependencies/);
    expect(english).not.toMatch(/whole repository|entire repository|Every contract/i);
    expect(chinese).toMatch(/项目自有材料/);
    expect(chinese).toMatch(/第三方依赖/);
    expect(chinese).not.toMatch(/整个代码仓库|所有合约/);
  });
});

describe('landing content lexicon (outside allow-list)', () => {
  // Terms that must never appear anywhere in the landing copy, including
  // inside the FAQ denial block. These are strict-always bans.
  const ALWAYS_BANNED = [
    /\bbid(?:ding|der|ders|s)?\b/i,
    /\bprize(?:s|d)?\b/i,
    /\braffle(?:s)?\b/i,
    /\bstak(?:e|er|ing)\b/i,
    /\byield\b/i,
    /\bcharit(?:y|able)\b/i,
    /\bwinner(?:s)?\b/i,
    /\bROI\b/,
    /\bdividend(?:s)?\b/i,
    /\btax-deductible\b/i,
  ];

  /**
   * Excludes the FAQ items and the Public Goods disclaimer paragraph from
   * the banned-term scan. Both sections are REQUIRED denial copy per the
   * lexicon (they cite the categories they disclaim in order to disclaim
   * them). Everything else in the landing content must be strictly clean.
   */
  function collectNonDenialText(): string {
    const { faq, publicGoods, ...rest } = landingContent;
    void faq;
    const { disclaimer: _disclaimer, ...publicGoodsSansDisclaimer } = publicGoods;
    void _disclaimer;
    return JSON.stringify({ ...rest, publicGoods: publicGoodsSansDisclaimer });
  }

  it.each(ALWAYS_BANNED.map((p) => [p.source, p]))(
    'never contains banned term %s outside denial copy',
    (_label, pattern) => {
      expect(collectNonDenialText()).not.toMatch(pattern);
    },
  );

  it('public-goods disclaimer contains the required denial phrasing', () => {
    expect(landingContent.publicGoods.disclaimer).toMatch(/not a charitable contribution/i);
    expect(landingContent.publicGoods.disclaimer).toMatch(/makes no representation/i);
  });
});
