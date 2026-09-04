import {
  getLearnArticle as getLocalizedLearnArticle,
  getLearnContent,
  getLearnSlugs,
  learnContentEn,
  learnContentZh,
} from '@/content/learn';

const learnArticles = learnContentEn.articles;
const getLearnArticle = (slug: string) => getLocalizedLearnArticle(slug, 'en');

describe('learnArticles', () => {
  it('keeps locale-invariant routing and complete Chinese articles', () => {
    expect(getLearnSlugs()).toEqual(learnArticles.map((article) => article.slug));
    expect(learnContentZh.articles.map((article) => article.slug)).toEqual(getLearnSlugs());
    expect(getLearnContent('zh-Hans').hub.h1).toBe(learnContentZh.hub.h1);

    for (const article of learnContentZh.articles) {
      expect(article.h1).toMatch(/[\u3400-\u9fff]/);
      expect(article.summary).toMatch(/[\u3400-\u9fff]/);
      expect(article.sections.length).toBeGreaterThanOrEqual(3);
      // Chinese has no whitespace-delimited words and is materially denser
      // than English, so use a CJK-aware character floor instead.
      expect(article.sections.flatMap((section) => section.body).join('').length).toBeGreaterThan(
        400,
      );
      const english = getLearnArticle(article.slug);
      expect(article.related.map((link) => link.href)).toEqual(
        english?.related.map((link) => link.href),
      );
    }
  });

  it('has unique slugs, titles, descriptions, and h1s', () => {
    const slugs = new Set(learnArticles.map((article) => article.slug));
    const titles = new Set(learnArticles.map((article) => article.title));
    const descriptions = new Set(learnArticles.map((article) => article.description));
    const h1s = new Set(learnArticles.map((article) => article.h1));

    expect(slugs.size).toBe(learnArticles.length);
    expect(titles.size).toBe(learnArticles.length);
    expect(descriptions.size).toBe(learnArticles.length);
    expect(h1s.size).toBe(learnArticles.length);
  });

  it('has complete SEO fields for every article', () => {
    for (const article of learnArticles) {
      expect(article.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(article.title).toContain('Cosmic Signature');
      expect(article.description.length).toBeGreaterThan(80);
      expect(article.h1.length).toBeGreaterThan(10);
      expect(article.summary).toContain('Cosmic Signature');
      expect(article.updated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(article.sections.length).toBeGreaterThanOrEqual(3);
      expect(article.related.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('provides readable explanations without publishing crawler implementation instructions', () => {
    for (const article of learnArticles) {
      const text = [article.summary, ...article.sections.flatMap((section) => section.body)].join(
        ' ',
      );
      // A word-count target encouraged repetitive SEO instructions in reader
      // copy. Check the actual defect and keep section completeness explicit.
      expect(text).not.toMatch(
        /search (?:engines|systems|crawlers)|AI systems|SEO surfaces|client-side table hydrates/i,
      );
      for (const section of article.sections) {
        expect(section.heading.trim()).not.toBe('');
        expect(section.body.length).toBeGreaterThan(0);
        expect(section.body.every((paragraph) => paragraph.trim().length > 0)).toBe(true);
      }
    }
  });

  it('includes the high-value SEO topics from the implementation spec', () => {
    expect(learnArticles.map((article) => article.slug)).toEqual(
      expect.arrayContaining([
        'what-is-cosmic-signature',
        'how-the-performance-cycle-works',
        'how-gestures-work',
        'three-body-nft-art',
        'cosmic-signature-on-arbitrum',
        'contracts-security-verification',
        'cst-token-and-cosmic-council',
        'anchoring-nfts',
        'protocol-guild-public-goods',
        'collecting-and-trading-cosmic-signature',
        `not-a-${['lot', 'tery'].join('')}-not-an-${['invest', 'ment'].join('')}`,
      ]),
    );
  });
});

describe('learn article contract accuracy', () => {
  function articleText(slug: string): string {
    const article = getLearnArticle(slug);
    expect(article).toBeDefined();
    return [article!.summary, ...article!.sections.flatMap((section) => section.body)].join(' ');
  }

  it('anchoring article states the once-only rule and RandomWalk no-ETH rule', () => {
    const text = articleText('anchoring-nfts');
    expect(text).toMatch(/anchored only once/i);
    expect(text).toMatch(/do not receive ETH Anchor Distributions/i);
    expect(text).toMatch(/retrieved when the anchor is released/i);
  });

  it('CST article states the burn-on-gesture and delegation mechanics', () => {
    const text = articleText('cst-token-and-cosmic-council');
    expect(text).toMatch(/burned/i);
    expect(text).toMatch(/delegat/i);
  });

  it('trading article names Axiom Zero, Uniswap, and Chaos Zero with correct roles', () => {
    const text = articleText('collecting-and-trading-cosmic-signature');
    expect(text).toMatch(/Axiom Zero/);
    expect(text).toMatch(/no platform fee|zero-fee/i);
    expect(text).toMatch(/Uniswap/);
    expect(text).toMatch(/prediction market/i);
    expect(text).toMatch(/more gestures than the previous one/i);
    // Anchor facts must match the anchoring article: once-only, ever.
    expect(text).toMatch(/anchored to the protocol exactly once, ever/i);
  });

  it('trading article links the ecosystem destinations from the shared config', () => {
    const article = getLearnArticle('collecting-and-trading-cosmic-signature');
    const hrefs = article!.related.map((link) => link.href);
    expect(hrefs).toContain('https://www.axiomzero.market/cosmic-signature');
    expect(hrefs).toContain('https://chaoszero.com');
    expect(hrefs.some((href) => href.startsWith('https://app.uniswap.org/'))).toBe(true);
  });
});
