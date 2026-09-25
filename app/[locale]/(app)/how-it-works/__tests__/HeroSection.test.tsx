import { howItWorksContentEn } from '@/content/how-it-works';

import { render, screen, checkA11y } from '@/test-utils';

import { HeroSection } from '../components/HeroSection';

const hero = howItWorksContentEn.hero;

describe('HeroSection', () => {
  it('renders the H1 as one plain string, in the reading size', () => {
    render(<HeroSection hero={hero} />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent(/^How Cosmic Signature works$/);
    // One string: no markup but the span that holds the brand on one line (V425).
    expect([...heading.querySelectorAll('*')].map((node) => node.textContent)).toEqual([
      'Cosmic Signature',
    ]);
    expect(heading).toHaveClass('type-display-md');
    expect(heading).toHaveAttribute('id', 'hero-heading');
  });

  it('renders the lede', () => {
    render(<HeroSection hero={hero} />);
    expect(screen.getByText(hero.paragraph)).toBeInTheDocument();
  });

  it('names the Learn section in the eyebrow without linking the hub to itself', () => {
    render(<HeroSection hero={hero} />);
    expect(screen.getByText('nav.sections.learn')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'nav.sections.learn' })).toBeNull();
  });

  it('leads to the gesture form and to the live cycle', () => {
    render(<HeroSection hero={hero} />);
    expect(screen.getByRole('link', { name: 'Make a gesture' })).toHaveAttribute(
      'href',
      '/#make-gesture',
    );
    expect(screen.getByRole('link', { name: 'See the live cycle' })).toHaveAttribute(
      'href',
      '/current-cycle',
    );
    expect(screen.queryByRole('link', { name: 'Learn More' })).not.toBeInTheDocument();
  });

  it('gives both ways in the same arrow, as the live cycle’s commit button has (V242)', () => {
    render(<HeroSection hero={hero} />);
    for (const name of ['Make a gesture', 'See the live cycle']) {
      expect(screen.getByRole('link', { name }).querySelector('svg')).not.toBeNull();
    }
  });

  it('opens the lede with the mechanism, not the slogan (V242)', () => {
    expect(hero.paragraph.startsWith('Gesture. Endure.')).toBe(false);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<HeroSection hero={hero} />);
    await checkA11y(container);
  });
});
