import '@testing-library/jest-dom';

import { render, screen } from '@/test-utils';

import { LandingNav } from '../LandingNav';
import { HeroSection } from '../HeroSection';
import { CTASection } from '../CTASection';
import { Stars } from '../Stars';
import { HowItWorks } from '../HowItWorks';
import { StatsBar } from '../StatsBar';
import { EthFlow } from '../EthFlow';
import { PrizeCategories } from '../PrizeCategories';
import { WhyDifferent } from '../WhyDifferent';
import { GameFeatures } from '../GameFeatures';
import { ArtShowcase } from '../ArtShowcase';
import { PublicGoods } from '../PublicGoods';
import { LandingFooter } from '../LandingFooter';
import { FadeIn } from '../FadeIn';

describe('Landing page components', () => {
  it('LandingNav renders logo and Launch App link', () => {
    render(<LandingNav />);
    expect(screen.getByLabelText('Cosmic Signature')).toBeInTheDocument();
    expect(screen.getByText('Launch App')).toBeInTheDocument();
  });

  it('HeroSection renders headline', () => {
    render(<HeroSection />);
    expect(screen.getByText('The Last Bidder Wins.')).toBeInTheDocument();
    expect(screen.getByText('But So Does Everyone Else.')).toBeInTheDocument();
  });

  it('CTASection renders countdown and email form', () => {
    render(<CTASection />);
    expect(screen.getByText('Genesis Round Countdown')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('your@email.com')).toBeInTheDocument();
    expect(screen.getByText('Notify Me')).toBeInTheDocument();
    expect(screen.getAllByText('May 7, 2026', { exact: false }).length).toBeGreaterThan(0);
  });

  it('Stars renders a container div', () => {
    const { container } = render(<Stars />);
    const starContainer = container.querySelector('[aria-hidden="true"]');
    expect(starContainer).toBeInTheDocument();
  });

  it('HowItWorks renders section heading', () => {
    render(<HowItWorks />);
    expect(screen.getByText('A Strategic Game in Four Phases')).toBeInTheDocument();
  });

  it('StatsBar renders stat values', () => {
    render(<StatsBar />);
    expect(screen.getByText('10+')).toBeInTheDocument();
    expect(screen.getByText('7%')).toBeInTheDocument();
  });

  it('EthFlow renders section heading', () => {
    render(<EthFlow />);
    expect(screen.getByText('Where Every ETH Goes')).toBeInTheDocument();
  });

  it('PrizeCategories renders all 9 prize cards', () => {
    render(<PrizeCategories />);
    expect(screen.getByText('Main Prize (Last Bidder)')).toBeInTheDocument();
    expect(screen.getByText('Chrono-Warrior')).toBeInTheDocument();
    expect(screen.getByText('Per-Bid CST Reward')).toBeInTheDocument();
  });

  it('WhyDifferent renders comparison heading', () => {
    render(<WhyDifferent />);
    expect(screen.getByText('Value Flows to You, Not Creators')).toBeInTheDocument();
  });

  it('GameFeatures renders all 6 feature cards', () => {
    render(<GameFeatures />);
    expect(screen.getByText('Built for Strategic Depth')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Dual Dutch Auctions/ })).toBeInTheDocument();
  });

  it('ArtShowcase renders art section', () => {
    render(<ArtShowcase />);
    expect(screen.getByText('Powered by Physics')).toBeInTheDocument();
    expect(screen.getAllByText('No AI.', { exact: false }).length).toBeGreaterThan(0);
  });

  it('PublicGoods renders 7% and Protocol Guild', () => {
    render(<PublicGoods />);
    expect(screen.getByText('7%')).toBeInTheDocument();
    expect(screen.getByText("Every Round Funds Ethereum's Future")).toBeInTheDocument();
  });

  it('LandingFooter renders logo and links', () => {
    render(<LandingFooter />);
    expect(screen.getByText('GitHub')).toBeInTheDocument();
    expect(screen.getByText('Discord')).toBeInTheDocument();
  });

  it('FadeIn renders children', () => {
    render(<FadeIn>Hello world</FadeIn>);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });
});
