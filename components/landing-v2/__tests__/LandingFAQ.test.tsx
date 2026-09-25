import { render, screen } from '@testing-library/react';

import { getLandingContent, landingContentEn } from '@/content/landing';

import { routing } from '@/i18n/routing';
import { LandingFAQ } from '@/components/landing-v2/LandingFAQ';

const faq = landingContentEn.faq;

describe('<LandingFAQ />', () => {
  it('renders the section heading with an id="faq" anchor', () => {
    const { container } = render(<LandingFAQ faq={faq} />);
    expect(container.querySelector('#faq')).toHaveAttribute(
      'aria-labelledby',
      'landing-faq-heading',
    );
  });

  it('puts every answer in the server HTML as a native disclosure, all closed', () => {
    const { container } = render(<LandingFAQ faq={faq} />);
    const disclosures = container.querySelectorAll('details');
    expect(disclosures).toHaveLength(faq.items.length);
    for (const [index, disclosure] of Array.from(disclosures).entries()) {
      expect(disclosure.open).toBe(false);
      expect(disclosure.getAttribute('name')).toBe('landing-faq');
      expect(disclosure.querySelector('summary')).toHaveTextContent(faq.items[index]!.question);
      expect(disclosure).toHaveTextContent(faq.items[index]!.answer);
    }
  });

  it('opens with what a participant does and what the art is, not with a denial', () => {
    // lexicon-allow-start: the denial questions are matched to assert their place.
    const denial = /lottery|casino|gambling|investment/i;
    // lexicon-allow-end
    for (const locale of routing.locales) {
      const items = getLandingContent(locale).faq.items;
      expect(items[0]!.question).not.toMatch(denial);
      expect(items[1]!.question).not.toMatch(denial);
    }
    expect(faq.items[0]!.question).toBe('What do I actually do as a participant?');
    expect(faq.items[1]!.question).toBe('What is the art, technically?');
  });

  it('keeps the same questions in the same order in every locale', () => {
    const count = faq.items.length;
    for (const locale of routing.locales) {
      expect(getLandingContent(locale).faq.items).toHaveLength(count);
    }
  });

  it('renders a FAQPage JSON-LD script in the same order', () => {
    const { container } = render(<LandingFAQ faq={faq} />);
    const script = container.querySelector('script[type="application/ld+json"]');
    const data = JSON.parse(script?.textContent ?? '{}') as {
      '@type'?: string;
      mainEntity?: { name?: string }[];
    };
    expect(data['@type']).toBe('FAQPage');
    expect(data.mainEntity?.map((entity) => entity.name)).toEqual(
      faq.items.map((item) => item.question),
    );
  });

  it('links to the full FAQ in the app, in the same tab', () => {
    render(<LandingFAQ faq={faq} />);
    for (const link of screen.getAllByRole('link', { name: faq.moreLabel })) {
      expect(link).toHaveAttribute('href', 'https://app.cosmicsignature.com/faq');
      expect(link).not.toHaveAttribute('target');
    }
  });

  it('puts the way to more answers after the questions below 64rem (V174)', () => {
    const { container } = render(<LandingFAQ faq={faq} />);
    const [beside, after] = screen.getAllByRole('link', { name: faq.moreLabel });
    // One beside the sticky intro from lg, one after the list on narrower screens.
    expect(beside).toHaveClass('max-lg:hidden');
    expect(after).toHaveClass('lg:hidden');
    const lastQuestion = container.querySelectorAll('details')[faq.items.length - 1]!;
    expect(
      lastQuestion.compareDocumentPosition(after!) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it('question text uses cosmic vocabulary (not banned terms, except denial copy)', () => {
    // lexicon-allow-start: denial-marker array must contain the banned words by design
    const denialMarkers = ['lottery', 'casino', 'gambling', 'investment'];
    // lexicon-allow-end
    for (const item of faq.items) {
      const isDenial = denialMarkers.some((m) => item.question.toLowerCase().includes(m));
      if (isDenial) continue;
      expect(item.question).not.toMatch(/\bbid(?:ding|s|der)?\b/i);
      expect(item.question).not.toMatch(/\bprize\b/i);
      expect(item.question).not.toMatch(/\braffle\b/i);
      expect(item.question).not.toMatch(/\bwinner\b/i);
    }
  });
});
