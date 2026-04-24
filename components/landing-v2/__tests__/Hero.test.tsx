import { render, screen } from '@testing-library/react';

import { Hero } from '@/components/landing-v2/Hero';

// HeroCanvas uses dynamic() + ssr:false, which renders a loading state on
// the server and first client render. We don't need to assert the WebGL;
// we just need the section chrome to render.
jest.mock('next/dynamic', () => () => {
  const Stub = () => <div data-testid="hero-canvas-stub" />;
  Stub.displayName = 'HeroCanvasStub';
  return Stub;
});

describe('<Hero />', () => {
  it('renders the lexicon-safe headline', () => {
    render(<Hero />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent(/Every Gesture Shapes the/i);
    expect(heading).toHaveTextContent(/Signature/i);
  });

  it('renders the primary CTA linking to the app subdomain', () => {
    render(<Hero />);
    const primaryCta = screen.getByRole('link', { name: /open the app/i });
    expect(primaryCta).toHaveAttribute('href', 'https://app.cosmicsignature.com');
    expect(primaryCta).toHaveAttribute('rel', 'noopener');
  });

  it('renders the secondary CTA anchoring to the cycle section', () => {
    render(<Hero />);
    const secondaryCta = screen.getByRole('link', { name: /explore the cycle/i });
    expect(secondaryCta).toHaveAttribute('href', '#cycle');
  });

  it('renders the scroll-to-cycle chevron with an accessible label', () => {
    render(<Hero />);
    const chevron = screen.getByRole('link', { name: /scroll to the cycle section/i });
    expect(chevron).toHaveAttribute('href', '#cycle');
  });

  it('renders the marquee credibility chips', () => {
    render(<Hero />);
    expect(screen.getByText('CC0')).toBeInTheDocument();
    expect(screen.getByText('Formally Verified')).toBeInTheDocument();
    expect(screen.getByText('7% to Protocol Guild')).toBeInTheDocument();
  });

  it('contains no banned lexicon terms in the rendered DOM', () => {
    const { container } = render(<Hero />);
    const text = container.textContent ?? '';
    expect(text).not.toMatch(/\bbid(?:ding|der|s)?\b/i);
    expect(text).not.toMatch(/\bprize(?:s|d)?\b/i);
    expect(text).not.toMatch(/\braffle(?:s)?\b/i);
    expect(text).not.toMatch(/\bwinner(?:s)?\b/i);
  });

  it('renders the hero canvas mount point (dynamic import)', () => {
    render(<Hero />);
    expect(screen.getByTestId('hero-canvas-stub')).toBeInTheDocument();
  });
});
