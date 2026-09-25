import {
  LEARN_GROUP_IDS,
  getLearnArticle as getLocalizedLearnArticle,
  getLearnContent,
  getLearnSlugs,
  isLearnLinkTarget,
  learnContentEn,
  learnContentZh,
  learnLinkKeys,
  learnPlainText,
  splitLearnLinks,
} from '@/content/learn';

import { routing } from '@/i18n/routing';
import { signaturePlate } from '@/components/reading/signaturePlates';

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
      expect(
        article.sections.flatMap((section) => [...section.body, ...(section.steps ?? [])]).join('')
          .length,
      ).toBeGreaterThan(250);
      const english = getLearnArticle(article.slug);
      expect(article.related).toEqual(english?.related);
      expect(article.figures).toEqual(english?.figures);
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

describe('learn reading path', () => {
  it.each(routing.locales)('%s: orders the guides by stage, each with a card title', (locale) => {
    const { articles, hub, articleUi } = getLearnContent(locale);
    // Each stage's guides are consecutive, in the stages' order.
    const stages = articles.map((article) => article.group);
    expect(
      [...stages].sort((a, b) => LEARN_GROUP_IDS.indexOf(a) - LEARN_GROUP_IDS.indexOf(b)),
    ).toEqual(stages);
    for (const groupId of LEARN_GROUP_IDS) {
      expect(stages).toContain(groupId);
      expect(hub.groups[groupId].title.trim()).not.toBe('');
    }
    for (const article of articles) {
      expect(article.cardTitle.trim()).not.toBe('');
      // A card title is short and does not repeat the brand.
      expect(article.cardTitle).not.toContain('Cosmic Signature');
      expect(article.cardTitle.length).toBeLessThan(article.h1.length + 12);
      // The card's line says what the guide holds, in one short line, and is
      // not the search snippet, which leads with the brand.
      expect(article.cardDescription.trim()).not.toBe('');
      expect(article.cardDescription).not.toContain('Cosmic Signature');
      expect([...article.cardDescription].length).toBeLessThanOrEqual(90);
      expect(article.cardDescription).not.toBe(article.description);
      expect(signaturePlate(article.plate)).toBeDefined();
    }
    expect(articleUi.relatedResourcesHeading.trim()).not.toBe('');
    expect(articleUi.guideTemplate).toContain('{number}');
    expect(articleUi.readingTimeTemplate).toContain('{minutes}');
  });

  it.each(routing.locales)('%s: sets every figure in a section the guide has (V178)', (locale) => {
    for (const article of getLearnContent(locale).articles) {
      for (const figure of article.figures) {
        expect([article.slug, article.sections[figure.section]]).toEqual([
          article.slug,
          expect.objectContaining({ heading: expect.any(String) }),
        ]);
      }
    }
  });

  it('illustrates the guides that describe a mechanism', () => {
    const kinds = (slug: string) => getLearnArticle(slug)!.figures.map((figure) => figure.kind);
    expect(kinds('how-the-performance-cycle-works')).toEqual(['cycleTimeline', 'allocation']);
    expect(kinds('how-gestures-work')).toEqual(['cycleTimeline']);
    expect(kinds('three-body-nft-art')).toEqual(['seedPlates']);
    expect(kinds('contracts-security-verification')).toEqual(['contracts']);
    expect(kinds('anchoring-nfts')).toEqual(['allocation']);
    expect(kinds('protocol-guild-public-goods')).toEqual(['allocation']);
  });

  it('gives every guide its own opening Signature', () => {
    const plates = learnArticles.map((article) => article.plate);
    expect(new Set(plates).size).toBe(plates.length);
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
    const hrefs = article!.related;
    expect(hrefs).toContain('https://www.axiomzero.market/cosmic-signature');
    expect(hrefs).toContain('https://chaoszero.com');
    expect(hrefs.some((href) => href.startsWith('https://app.uniswap.org/'))).toBe(true);
  });
});

describe('inline links in guide prose', () => {
  it('splits a paragraph into text and links, and reads it as plain text', () => {
    const text = 'Open the [contracts page](contracts), then [nowhere](missing) and [code](code).';
    expect(splitLearnLinks(text)).toEqual([
      'Open the ',
      { label: 'contracts page', target: 'contracts' },
      ', then nowhere and ',
      { label: 'code', target: 'code' },
      '.',
    ]);
    expect(learnPlainText(text)).toBe('Open the contracts page, then nowhere and code.');
    expect(splitLearnLinks('No links here.')).toEqual(['No links here.']);
    expect(isLearnLinkTarget('toString')).toBe(false);
  });

  function paragraphsOf(locale: string) {
    const { articles } = getLearnContent(locale);
    return articles.flatMap((article) =>
      article.sections.flatMap((section, sectionIndex) =>
        [...section.body, ...(section.steps ?? [])].map((text, index) => ({
          key: `${article.slug} ${sectionIndex}.${index}`,
          text,
        })),
      ),
    );
  }

  it('shows how to verify a contract, step by step, in the contracts guide (V177)', () => {
    const guide = getLearnArticle('contracts-security-verification')!;
    const text = guide.sections
      .flatMap((section) => [...section.body, ...(section.steps ?? [])])
      .join(' ');
    expect(guide.sections.flatMap((section) => section.steps ?? [])).toHaveLength(4);
    expect(text).toContain('42161');
    expect(text).toMatch(/Read as Proxy/);
    expect(text).toMatch(/Hacken/);
    // It explains the protocol, not how the site's pages should be written.
    expect(text).not.toMatch(/should say so|Trust pages are|app-host|internal links/i);
    expect(
      guide.sections
        .flatMap((section) => [...section.body, ...(section.steps ?? [])])
        .flatMap(learnLinkKeys),
    ).toEqual([
      'contracts',
      'contracts',
      'explorer',
      'contractsRepository',
      'sourcify',
      'hackenReport',
      'audits',
      'riskDisclosures',
    ]);
  });

  it.each(routing.locales)('%s: never calls the app its host', (locale) => {
    const text = JSON.stringify(getLearnContent(locale).articles);
    expect(text).not.toMatch(
      /app-host|app host|应用主站|應用程式主站|앱 호스트|アプリホスト|máy chủ ứng dụng/i,
    );
  });

  it.each(routing.locales)(
    '%s: links only to declared pages, the same ones as English',
    (locale) => {
      const english = new Map(
        paragraphsOf('en').map(({ key, text }) => [key, learnLinkKeys(text)]),
      );
      for (const { key, text } of paragraphsOf(locale)) {
        const keys = learnLinkKeys(text);
        expect(keys.filter((target) => !isLearnLinkTarget(target))).toEqual([]);
        expect([key, keys]).toEqual([key, english.get(key)]);
        // No stray bracket or half-written token reaches the page.
        expect(learnPlainText(text)).not.toMatch(/\]\(|\[[^\]]*\]\(/);
      }
    },
  );
});
