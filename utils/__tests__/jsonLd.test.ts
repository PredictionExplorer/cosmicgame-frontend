import {
  websiteJsonLd,
  organizationJsonLd,
  webApplicationJsonLd,
  faqPageJsonLd,
  breadcrumbJsonLd,
  nftProductJsonLd,
} from '@/utils/jsonLd';

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
      expect(result.logo).toContain('logo.png');
    });

    it('includes social media profiles', () => {
      expect(result.sameAs).toEqual(
        expect.arrayContaining([
          expect.stringContaining('x.com'),
          expect.stringContaining('discord.gg'),
        ]),
      );
    });
  });

  describe('webApplicationJsonLd', () => {
    const result = webApplicationJsonLd();

    it('returns WebApplication schema type', () => {
      expect(result['@context']).toBe('https://schema.org');
      expect(result['@type']).toBe('WebApplication');
    });

    it('has GameApplication category', () => {
      expect(result.applicationCategory).toBe('GameApplication');
    });

    it('includes an offer', () => {
      expect(result.offers).toBeDefined();
      expect(result.offers['@type']).toBe('Offer');
    });
  });

  describe('faqPageJsonLd', () => {
    const items = [
      { id: '1', question: 'What is this?', answer: 'A game.' },
      { id: '2', question: 'How to play?', answer: 'Place bids.' },
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
      expect(first.acceptedAnswer.text).toBe('A game.');
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

    it('includes URL with token ID', () => {
      expect(result.url).toBe('https://www.cosmicsignature.com/detail/42');
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
