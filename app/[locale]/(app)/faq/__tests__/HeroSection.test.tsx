import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { routing } from '@/i18n/routing';

import { render, screen, checkA11y } from '@/test-utils';

import { HeroSection } from '../components/HeroSection';

const faqTitle = (locale: string): string =>
  (
    JSON.parse(readFileSync(join(process.cwd(), 'messages', locale, 'faq.json'), 'utf8')) as {
      hero: { title: string };
    }
  ).hero.title;

jest.mock('../components/FAQSearch', () => ({
  FAQSearch: (props: Record<string, unknown>) => (
    <div data-testid="faq-search" data-value={props.value} />
  ),
}));

describe('HeroSection', () => {
  const defaultProps = {
    searchValue: '',
    onSearchChange: jest.fn(),
    resultCount: 0,
    totalCount: 50,
    categoryCount: 8,
  };

  it('renders the H1 as one plain string, in the reading size', () => {
    render(<HeroSection {...defaultProps} />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent(/^Cosmic Signature FAQ$/);
    // One string, with the brand held whole on its line (V425): no other markup.
    expect(heading.textContent).toBe('Cosmic Signature FAQ');
    expect([...heading.querySelectorAll('*')].map((node) => node.textContent)).toEqual([
      'Cosmic Signature',
    ]);
    expect(heading).toHaveClass('type-display-md');
  });

  it('writes the title as one plain string in every locale, with no space beside Japanese (F152)', () => {
    for (const locale of routing.locales) {
      expect(faqTitle(locale)).not.toMatch(/<\/?accent>/);
    }
    // Regression: the halves were joined with a JSX space, giving "Cosmic Signature よくある質問".
    expect(faqTitle('ja')).toBe('Cosmic Signatureのよくある質問');
  });

  it('names the Learn section in the eyebrow, linked to its hub', () => {
    render(<HeroSection {...defaultProps} />);
    expect(screen.getByRole('link', { name: 'nav.sections.learn' })).toHaveAttribute(
      'href',
      '/how-it-works',
    );
  });

  it('renders the subtitle', () => {
    render(<HeroSection {...defaultProps} />);
    expect(
      screen.getByText(/Everything you need to know about Cosmic Signature/),
    ).toBeInTheDocument();
  });

  it('says exactly how many answers and categories there are', () => {
    render(<HeroSection {...defaultProps} />);
    expect(screen.getByText(/50 answers/)).toHaveTextContent('50 answers · 8 categories');
    expect(screen.queryByText(/\+/)).not.toBeInTheDocument();
    expect(screen.queryByText('Always Updated')).not.toBeInTheDocument();
  });

  it('passes search props through to FAQSearch', () => {
    render(<HeroSection {...defaultProps} searchValue="wallet" />);
    expect(screen.getByTestId('faq-search')).toHaveAttribute('data-value', 'wallet');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<HeroSection {...defaultProps} />);
    await checkA11y(container);
  });
});
