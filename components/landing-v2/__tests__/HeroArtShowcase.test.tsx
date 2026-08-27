import { render, screen } from '@testing-library/react';

import { landingContentEn, landingContentZh } from '@/content/landing';

import { HeroArtShowcase } from '@/components/landing-v2/HeroArtShowcase';
import { useLandingShowcaseTokens } from '@/components/landing-v2/useLandingShowcaseTokens';

jest.mock('@/components/landing-v2/useLandingShowcaseTokens', () => ({
  useLandingShowcaseTokens: jest.fn(() => []),
}));

jest.mock('@/hooks/useRotatingIndex', () => ({
  useRotatingIndex: jest.fn(() => 0),
}));

jest.mock('@/components/nft/NFTImage', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt?: string }) => (
    <img data-testid="nft-image" src={src} alt={alt} />
  ),
}));

const mockUseLandingShowcaseTokens = useLandingShowcaseTokens as jest.Mock;

describe('<HeroArtShowcase />', () => {
  beforeEach(() => {
    mockUseLandingShowcaseTokens.mockReturnValue([]);
  });

  it('renders a calm forming state before the collection responds', () => {
    render(<HeroArtShowcase art={landingContentEn.hero.art} />);

    expect(screen.getByTestId('hero-art-showcase')).toBeInTheDocument();
    expect(screen.getByText(landingContentEn.hero.art.formingLabel)).toBeInTheDocument();
    expect(screen.getByText(landingContentEn.hero.art.formingBody)).toBeInTheDocument();
    expect(screen.queryByTestId('hero-art-link')).not.toBeInTheDocument();
  });

  it('shows a real imprinted Signature linked into the app once tokens load', () => {
    mockUseLandingShowcaseTokens.mockReturnValue([{ TokenId: 42, Seed: 'feedbeef' }]);

    render(<HeroArtShowcase art={landingContentEn.hero.art} />);

    const link = screen.getByTestId('hero-art-link');
    expect(link).toHaveAttribute(
      'href',
      expect.stringContaining('app.cosmicsignature.com/detail/42'),
    );
    const image = screen.getByTestId('nft-image');
    expect(image).toHaveAttribute('src', expect.stringContaining('0xfeedbeef.png'));
    expect(image).toHaveAttribute('alt', expect.stringContaining('#000042'));
    // Descriptive, art-first alt text (SEO + accessibility).
    expect(image.getAttribute('alt')).toMatch(/three-body/i);
    expect(screen.getByText(landingContentEn.hero.art.caption)).toBeInTheDocument();
    expect(screen.getByText('#000042')).toBeInTheDocument();
  });

  it('keeps the CST pairing note and gallery link visible in both locales', () => {
    for (const content of [landingContentEn, landingContentZh]) {
      const { unmount } = render(<HeroArtShowcase art={content.hero.art} />);
      expect(screen.getByText(content.hero.art.cstNote)).toBeInTheDocument();
      expect(screen.getByText(content.hero.art.cstNote).textContent).toMatch(/1,000 CST/);
      expect(screen.getByRole('link', { name: content.hero.art.galleryCta })).toHaveAttribute(
        'href',
        expect.stringContaining('/gallery'),
      );
      unmount();
    }
  });

  it('contains no banned lexicon terms in the rendered DOM', () => {
    mockUseLandingShowcaseTokens.mockReturnValue([{ TokenId: 7, Seed: 'abc' }]);
    const { container } = render(<HeroArtShowcase art={landingContentEn.hero.art} />);
    const text = container.textContent ?? '';
    expect(text).not.toMatch(/\bbid(?:ding|der|s)?\b/i);
    expect(text).not.toMatch(/\bmint(?:ing|ed|s)?\b/i);
    expect(text).not.toMatch(/\bprize(?:s|d)?\b/i);
  });
});
