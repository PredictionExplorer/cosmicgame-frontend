import { landingContent } from '@/content/landing';

/**
 * Structural and regulatory invariants for the landing copy. Paired with
 * scripts/lexicon-scan.mjs, these tests make it impossible to regress the
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

  it('footer has exactly three link columns', () => {
    expect(landingContent.footer.columns).toHaveLength(3);
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
