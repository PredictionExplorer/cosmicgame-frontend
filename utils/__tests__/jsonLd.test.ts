import {
  artProtocolJsonLd,
  breadcrumbJsonLd,
  faqPageJsonLd,
  nftProductJsonLd,
  organizationJsonLd,
  webApplicationJsonLd,
  websiteJsonLd,
} from '@/utils/jsonLd';

const BANNED_TERMS = [
  /\bbid(?:der|ding|s)?\b/i,
  /\bprize(?:s|d)?\b/i,
  /\braffle(?:s)?\b/i,
  /\bwinner(?:s)?\b/i,
  /\bgambling\b/i,
  /\blottery\b/i,
  /\bstak(?:e|er|ers|ing)\b/i,
  /\bcharit(?:y|able)\b/i,
  /\byield\b/i,
  /\binvest(?:or|ors|ment|ments)\b/i,
];

function assertNoBannedTerms(text: unknown) {
  if (typeof text !== 'string') return;
  for (const pattern of BANNED_TERMS) {
    expect(text).not.toMatch(pattern);
  }
}

describe('JSON-LD generators', () => {
  describe('websiteJsonLd', () => {
    const result = websiteJsonLd();

    it('returns WebSite schema type', () => {
      expect(result['@context']).toBe('https://schema.org');
      expect(result['@type']).toBe('WebSite');
    });

    it('includes site name and URL', () => {
      expect(result.name).toBe('Cosmic Signature');
      expect(result.url).toBe('https://www.cosmicsignature.com');
    });

    it('includes a SearchAction', () => {
      expect(result.potentialAction).toBeDefined();
      expect(result.potentialAction['@type']).toBe('SearchAction');
      expect(result.potentialAction['query-input']).toContain('search_term_string');
    });

    it('has lexicon-safe description', () => {
      assertNoBannedTerms(result.description);
    });
  });

  describe('organizationJsonLd', () => {
    const result = organizationJsonLd();

    it('returns Organization schema type', () => {
      expect(result['@context']).toBe('https://schema.org');
      expect(result['@type']).toBe('Organization');
    });

    it('includes name, URL, and logo', () => {
      expect(result.name).toBe('Cosmic Signature');
      expect(result.url).toBe('https://www.cosmicsignature.com');
      expect(result.logo).toBe('https://www.cosmicsignature.com/images/logo.svg');
    });

    it('includes social media profiles', () => {
      expect(result.sameAs).toEqual(
        expect.arrayContaining([
          expect.stringContaining('x.com'),
          expect.stringContaining('discord.gg'),
        ]),
      );
    });

    it('has lexicon-safe description', () => {
      assertNoBannedTerms(result.description);
    });
  });

  describe('webApplicationJsonLd', () => {
    const result = webApplicationJsonLd();

    it('returns WebApplication schema type', () => {
      expect(result['@context']).toBe('https://schema.org');
      expect(result['@type']).toBe('WebApplication');
    });

    it('has EntertainmentApplication category (not GameApplication after lexicon migration)', () => {
      expect(result.applicationCategory).toBe('EntertainmentApplication');
    });

    it('includes an offer', () => {
      expect(result.offers).toBeDefined();
      expect(result.offers['@type']).toBe('Offer');
    });

    it('has lexicon-safe description', () => {
      assertNoBannedTerms(result.description);
    });
  });

  describe('artProtocolJsonLd', () => {
    const result = artProtocolJsonLd();

    it('returns CreativeWork schema type', () => {
      expect(result['@context']).toBe('https://schema.org');
      expect(result['@type']).toBe('CreativeWork');
    });

    it('includes CC0 license URL', () => {
      expect(result.license).toBe('https://creativecommons.org/publicdomain/zero/1.0/');
    });

    it('includes procedural-art keywords', () => {
      expect(result.keywords).toEqual(
        expect.arrayContaining(['procedural art', 'on-chain art', 'three-body problem', 'CC0']),
      );
    });

    it('includes genre Generative Art', () => {
      expect(result.genre).toBe('Generative Art');
    });

    it('has lexicon-safe description', () => {
      assertNoBannedTerms(result.description);
    });
  });

  describe('faqPageJsonLd', () => {
    const items = [
      { id: '1', question: 'What is this?', answer: 'A procedural art protocol.' },
      { id: '2', question: 'How do I participate?', answer: 'Make a gesture.' },
    ];
    const result = faqPageJsonLd(items);

    it('returns FAQPage schema type', () => {
      expect(result['@context']).toBe('https://schema.org');
      expect(result['@type']).toBe('FAQPage');
    });

    it('includes all Q&A pairs as mainEntity', () => {
      expect(result.mainEntity).toHaveLength(2);
    });

    it('formats each item as Question with Answer', () => {
      const first = result.mainEntity[0]!;
      expect(first['@type']).toBe('Question');
      expect(first.name).toBe('What is this?');
      expect(first.acceptedAnswer['@type']).toBe('Answer');
      expect(first.acceptedAnswer.text).toBe('A procedural art protocol.');
    });

    it('accepts items with only question and answer (no id required)', () => {
      const simpleItems = [{ question: 'Q1?', answer: 'A1.' }];
      const r = faqPageJsonLd(simpleItems);
      expect(r.mainEntity).toHaveLength(1);
      expect(r.mainEntity[0]!.name).toBe('Q1?');
    });

    it('returns empty mainEntity for empty input', () => {
      const r = faqPageJsonLd([]);
      expect(r.mainEntity).toEqual([]);
    });
  });

  describe('breadcrumbJsonLd', () => {
    const segments = [
      { name: 'Home', path: '/' },
      { name: 'Gallery', path: '/gallery' },
      { name: 'Token #42', path: '/detail/42' },
    ];
    const result = breadcrumbJsonLd(segments);

    it('returns BreadcrumbList schema type', () => {
      expect(result['@context']).toBe('https://schema.org');
      expect(result['@type']).toBe('BreadcrumbList');
    });

    it('includes correct number of items', () => {
      expect(result.itemListElement).toHaveLength(3);
    });

    it('uses 1-based position numbering', () => {
      expect(result.itemListElement[0]!.position).toBe(1);
      expect(result.itemListElement[2]!.position).toBe(3);
    });

    it('builds full URLs from paths', () => {
      expect(result.itemListElement[0]!.item).toBe('https://www.cosmicsignature.com/');
      expect(result.itemListElement[1]!.item).toBe('https://www.cosmicsignature.com/gallery');
    });

    it('preserves segment names verbatim', () => {
      expect(result.itemListElement[2]!.name).toBe('Token #42');
    });
  });

  describe('nftProductJsonLd', () => {
    const result = nftProductJsonLd({
      tokenId: 42,
      name: 'Cosmic Signature Token #42',
      description: 'A unique NFT',
      imageUrl: 'https://example.com/42.png',
    });

    it('returns Product schema type', () => {
      expect(result['@context']).toBe('https://schema.org');
      expect(result['@type']).toBe('Product');
    });

    it('includes token details', () => {
      expect(result.name).toBe('Cosmic Signature Token #42');
      expect(result.description).toBe('A unique NFT');
      expect(result.image).toBe('https://example.com/42.png');
    });

    it('points URLs at the app subdomain (not the landing host)', () => {
      expect(result.url).toBe('https://app.cosmicsignature.com/detail/42');
    });

    it('includes brand organization', () => {
      expect(result.brand['@type']).toBe('Organization');
      expect(result.brand.name).toBe('Cosmic Signature');
    });

    it('includes Digital Collectible category', () => {
      expect(result.category).toBe('Digital Collectible');
    });
  });
});
