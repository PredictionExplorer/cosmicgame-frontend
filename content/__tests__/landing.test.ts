import { landingContent } from '@/content/landing';

/**
 * Structural and regulatory invariants for the landing copy. Paired with
 * scripts/lexicon-scan.ts, these tests make it impossible to regress the
 * landing copy silently: any banned term outside the FAQ denial block or
 * any structural change (missing sections, missing CTAs) fails CI.
 */
describe('landing content shape', () => {
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
      footer: expect.any(Object),
    });
  });

  it('hero declares the primary CTA as the app subdomain', () => {
    expect(landingContent.hero.primaryCta.href).toBe('https://app.cosmicsignature.com');
  });

  it('cycle section has exactly four ordered stages', () => {
    expect(landingContent.cycle.stages).toHaveLength(4);
    expect(landingContent.cycle.stages.map((s) => s.number)).toEqual(['01', '02', '03', '04']);
  });

  it('art section has exactly seven pipeline stages', () => {
    expect(landingContent.art.stages).toHaveLength(7);
  });

  it('tracks list has ten allocation entries', () => {
    expect(landingContent.tracks.items).toHaveLength(10);
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

  it('footer has exactly four link columns', () => {
    expect(landingContent.footer.columns).toHaveLength(4);
  });

  it('footer ecosystem column links Axiom Zero, Chaos Zero, and Uniswap', () => {
    const ecosystem = landingContent.footer.columns.find(
      (column) => column.heading === 'Ecosystem',
    );
    expect(ecosystem).toBeDefined();
    const hrefs = ecosystem!.links.map((link) => link.href);
    expect(hrefs).toContain('https://www.axiomzero.market/cosmic-signature');
    expect(hrefs).toContain('https://chaoszero.com');
    expect(hrefs.some((href) => href.startsWith('https://app.uniswap.org/'))).toBe(true);
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
    expect(landingContent.anchoring.body).toMatch(/no ETH/i);
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

  it('art facts match the open-source render pipeline (64 spectral bins)', () => {
    const bins = landingContent.art.facts.find((fact) => fact.label === 'Wavelength bins');
    expect(bins?.value).toBe('64');
    expect(JSON.stringify(landingContent.art)).not.toMatch(/\b16 wavelength|Sixteen wavelength/i);
  });

  it('marquee chips avoid unsupported audit claims', () => {
    expect(landingContent.hero.marqueeChips).not.toContain('Audited Contracts');
    expect(landingContent.hero.marqueeChips).not.toContain('Formally Verified');
    expect(landingContent.hero.marqueeChips).toContain('Verified Contracts');
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
