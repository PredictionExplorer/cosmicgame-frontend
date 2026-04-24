import { render, screen } from '@testing-library/react';

import { landingContent } from '@/content/landing';

import { LandingFAQ } from '@/components/landing-v2/LandingFAQ';

describe('<LandingFAQ />', () => {
  it('renders the section heading with an id="faq" anchor', () => {
    const { container } = render(<LandingFAQ />);
    expect(container.querySelector('#faq')).not.toBeNull();
  });

  it('renders every question in the FAQ list', () => {
    render(<LandingFAQ />);
    for (const item of landingContent.faq.items) {
      expect(screen.getByText(item.question)).toBeInTheDocument();
    }
  });

  it('renders a FAQPage JSON-LD script for SEO', () => {
    const { container } = render(<LandingFAQ />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    const data = JSON.parse(script?.textContent ?? '{}') as {
      '@type'?: string;
      mainEntity?: unknown[];
    };
    expect(data['@type']).toBe('FAQPage');
    expect(Array.isArray(data.mainEntity)).toBe(true);
    expect(data.mainEntity?.length).toBe(landingContent.faq.items.length);
  });

  it('starts with all answers collapsed (Radix Accordion type=single)', () => {
    render(<LandingFAQ />);
    const triggers = screen.getAllByRole('button');
    for (const trigger of triggers) {
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    }
  });

  it('question text uses cosmic vocabulary (not banned terms, except denial copy)', () => {
    // Questions themselves may include banned words only in FAQ denial copy
    // ("Is this a lottery..."). Non-denial questions must be lexicon-safe.
    const denialMarkers = ['lottery', 'casino', 'gambling', 'investment'];
    for (const item of landingContent.faq.items) {
      const isDenial = denialMarkers.some((m) => item.question.toLowerCase().includes(m));
      if (isDenial) continue;
      expect(item.question).not.toMatch(/\bbid(?:ding|s|der)?\b/i);
      expect(item.question).not.toMatch(/\bprize\b/i);
      expect(item.question).not.toMatch(/\braffle\b/i);
      expect(item.question).not.toMatch(/\bwinner\b/i);
    }
  });
});
