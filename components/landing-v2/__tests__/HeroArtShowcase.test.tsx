import { act, fireEvent, render, screen } from '@testing-library/react';

import { landingContentEn, landingContentZh } from '@/content/landing';

import { FEATURED_LANDING_ART } from '@/components/landing-v2/featured-art';
import { HeroArtShowcase } from '@/components/landing-v2/HeroArtShowcase';
import { useLandingShowcaseTokens } from '@/components/landing-v2/useLandingShowcaseTokens';

jest.mock('@/components/landing-v2/useLandingShowcaseTokens', () => ({
  useLandingShowcaseTokens: jest.fn(() => []),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    const { priority: _priority, unoptimized: _unoptimized, ...rest } = props;
    return <img {...rest} />;
  },
}));

const mockUseLandingShowcaseTokens = useLandingShowcaseTokens as jest.Mock;
const nextArtwork = () =>
  fireEvent.click(screen.getByRole('button', { name: 'landing.artwork.next' }));
const previousArtwork = () =>
  fireEvent.click(screen.getByRole('button', { name: 'landing.artwork.previous' }));

function expectArtwork(tokenId: number, src: string) {
  const tokenLabel = `#${String(tokenId).padStart(6, '0')}`;
  const link = screen.getByTestId('hero-art-link');
  expect(link).toHaveAttribute('href', `https://app.cosmicsignature.com/detail/${tokenId}`);
  expect(link).toHaveAccessibleName(expect.stringContaining(tokenLabel));
  const image = screen.getByRole('img', { name: new RegExp(tokenLabel) });
  expect(image).toHaveAttribute('src', expect.stringContaining(src));
  expect(screen.getByText(tokenLabel)).toBeInTheDocument();
}

describe('<HeroArtShowcase />', () => {
  beforeEach(() => {
    mockUseLandingShowcaseTokens.mockReturnValue([]);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows bundled, verified artwork on first paint without waiting for the collection', () => {
    render(<HeroArtShowcase art={landingContentEn.hero.art} />);

    expect(screen.getByTestId('hero-art-showcase')).toBeInTheDocument();
    expectArtwork(23, FEATURED_LANDING_ART[0].imageSrc);
    expect(screen.getByRole('img')).toHaveAttribute('loading', 'eager');
    expect(screen.queryByText(landingContentEn.hero.art.formingBody)).not.toBeInTheDocument();
  });

  it('keeps the displayed artwork stable when live tokens arrive and appends them to manual navigation', () => {
    const { rerender } = render(<HeroArtShowcase art={landingContentEn.hero.art} />);
    expectArtwork(23, FEATURED_LANDING_ART[0].imageSrc);

    mockUseLandingShowcaseTokens.mockReturnValue([
      { TokenId: 23, Seed: FEATURED_LANDING_ART[0].Seed },
      { TokenId: 42, Seed: 'feedbeef' },
    ]);
    rerender(<HeroArtShowcase art={landingContentEn.hero.art} />);
    expectArtwork(23, FEATURED_LANDING_ART[0].imageSrc);

    nextArtwork();
    expectArtwork(24, FEATURED_LANDING_ART[1].imageSrc);
    nextArtwork();
    expectArtwork(42, '/0xfeedbeef/thumb_card.webp');
    // Duplicated featured tokens in the API do not create duplicated slides.
    nextArtwork();
    expectArtwork(23, FEATURED_LANDING_ART[0].imageSrc);
    previousArtwork();
    expectArtwork(42, '/0xfeedbeef/thumb_card.webp');
  });

  it('does not change the image or link target as time passes', () => {
    jest.useFakeTimers();
    mockUseLandingShowcaseTokens.mockReturnValue([{ TokenId: 42, Seed: 'feedbeef' }]);
    render(<HeroArtShowcase art={landingContentEn.hero.art} />);

    act(() => jest.advanceTimersByTime(120_000));
    expectArtwork(23, FEATURED_LANDING_ART[0].imageSrc);
    nextArtwork();
    act(() => jest.advanceTimersByTime(120_000));
    expectArtwork(24, FEATURED_LANDING_ART[1].imageSrc);
  });

  it('falls back from a failed live thumbnail and recovers when another artwork is selected', () => {
    mockUseLandingShowcaseTokens.mockReturnValue([{ TokenId: 42, Seed: 'feedbeef' }]);
    render(<HeroArtShowcase art={landingContentEn.hero.art} />);
    nextArtwork();
    nextArtwork();

    fireEvent.error(screen.getByRole('img'));
    expectArtwork(42, '/cosmicsignature/0xfeedbeef.png');
    fireEvent.error(screen.getByRole('img'));
    expect(screen.getByText(landingContentEn.hero.art.formingLabel)).toBeInTheDocument();
    expect(screen.getByTestId('hero-art-link')).toHaveAttribute(
      'href',
      'https://app.cosmicsignature.com/detail/42',
    );
    previousArtwork();
    expectArtwork(24, FEATURED_LANDING_ART[1].imageSrc);
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
    const { container } = render(<HeroArtShowcase art={landingContentEn.hero.art} />);
    const text = container.textContent ?? '';
    expect(text).not.toMatch(/\bbid(?:ding|der|s)?\b/i);
    expect(text).not.toMatch(/\bmint(?:ing|ed|s)?\b/i);
    expect(text).not.toMatch(/\bprize(?:s|d)?\b/i);
  });
});
