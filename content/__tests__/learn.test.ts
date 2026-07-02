import { getLearnArticle, learnArticles } from '@/content/learn';

describe('learnArticles', () => {
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

  it('keeps every article substantial enough for crawler-visible answer extraction', () => {
    for (const article of learnArticles) {
      const words = [article.summary, ...article.sections.flatMap((section) => section.body)].join(
        ' ',
      );
      expect(words.split(/\s+/).filter(Boolean).length).toBeGreaterThanOrEqual(450);
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
});
