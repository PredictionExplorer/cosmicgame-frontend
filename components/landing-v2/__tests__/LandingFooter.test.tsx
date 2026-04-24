import { render, screen, within } from '@testing-library/react';

import { landingContent } from '@/content/landing';

import { LandingFooter } from '@/components/landing-v2/LandingFooter';

describe('<LandingFooter />', () => {
  it('renders the wordmark link back to the landing root', () => {
    render(<LandingFooter />);
    const home = screen.getByRole('link', { name: /cosmic signature/i });
    expect(home).toHaveAttribute('href', '/');
  });

  it('renders the protocol tagline', () => {
    render(<LandingFooter />);
    expect(screen.getByText(landingContent.footer.tagline)).toBeInTheDocument();
  });

  it('renders every link column heading', () => {
    render(<LandingFooter />);
    for (const col of landingContent.footer.columns) {
      expect(screen.getByText(col.heading)).toBeInTheDocument();
    }
  });

  it('renders every link with correct href', () => {
    render(<LandingFooter />);
    for (const col of landingContent.footer.columns) {
      for (const link of col.links) {
        const el = screen.getByRole('link', { name: link.label });
        expect(el).toHaveAttribute('href', link.href);
      }
    }
  });

  it('marks external links with target=_blank and rel=noopener', () => {
    render(<LandingFooter />);
    const nav = screen.getByRole('navigation', { name: /footer/i });
    const externalLinks = within(nav)
      .getAllByRole('link')
      .filter((a) => (a.getAttribute('href') ?? '').startsWith('http'));

    expect(externalLinks.length).toBeGreaterThan(0);
    for (const link of externalLinks) {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link.getAttribute('rel')).toContain('noopener');
    }
  });

  it('renders the CC0 colophon', () => {
    render(<LandingFooter />);
    expect(screen.getByText(landingContent.footer.colophon)).toBeInTheDocument();
  });

  it('renders the current year in the copyright', () => {
    const { container } = render(<LandingFooter />);
    const year = new Date().getFullYear().toString();
    // The copyright line is rendered as a <p> with the year inline.
    const copyright = Array.from(container.querySelectorAll('p')).find((p) =>
      (p.textContent ?? '').includes(`\u00a9 ${year}`),
    );
    expect(copyright).toBeDefined();
    expect(copyright?.textContent).toContain('Cosmic Signature');
  });

  it('contains no banned lexicon terms in the rendered DOM', () => {
    const { container } = render(<LandingFooter />);
    const text = container.textContent ?? '';
    expect(text).not.toMatch(/\bbid(?:ding|der|s)?\b/i);
    expect(text).not.toMatch(/\bprize(?:s|d)?\b/i);
    expect(text).not.toMatch(/\braffle(?:s)?\b/i);
    expect(text).not.toMatch(/\bstak(?:e|er|ing)\b/i);
    expect(text).not.toMatch(/\bcharit(?:y|able)\b/i);
  });
});
