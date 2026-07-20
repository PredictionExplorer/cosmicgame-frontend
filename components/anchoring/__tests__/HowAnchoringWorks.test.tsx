import { checkA11y, render, screen, fireEvent } from '@/test-utils';

import { HowAnchoringWorks } from '../HowAnchoringWorks';

describe('HowAnchoringWorks', () => {
  it('renders the section title', () => {
    render(<HowAnchoringWorks />);
    expect(screen.getByText('anchoring.howItWorks.title')).toBeInTheDocument();
  });

  it('renders the introductory description', () => {
    render(<HowAnchoringWorks />);
    expect(screen.getByText('anchoring.howItWorks.intro')).toBeInTheDocument();
  });

  it('renders all accordion trigger labels', () => {
    render(<HowAnchoringWorks />);
    expect(
      screen.getByText('anchoring.howItWorks.items.whatIsAnchoring.question'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('anchoring.howItWorks.items.cosmicSignature.question'),
    ).toBeInTheDocument();
    expect(screen.getByText('anchoring.howItWorks.items.randomWalk.question')).toBeInTheDocument();
    expect(screen.getByText('anchoring.howItWorks.items.calculation.question')).toBeInTheDocument();
    expect(screen.getByText('anchoring.howItWorks.items.anchorOnce.question')).toBeInTheDocument();
  });

  it('explains the once-only anchoring rule (usedNfts) when expanded', () => {
    render(<HowAnchoringWorks />);
    fireEvent.click(screen.getByText('anchoring.howItWorks.items.whatIsAnchoring.question'));
    expect(screen.getByText('anchoring.howItWorks.items.whatIsAnchoring.answer')).toBeVisible();
  });

  it('explains that releasing is permanent per NFT', () => {
    render(<HowAnchoringWorks />);
    fireEvent.click(screen.getByText('anchoring.howItWorks.items.anchorOnce.question'));
    expect(screen.getByText('anchoring.howItWorks.items.anchorOnce.answer')).toBeVisible();
  });

  it('explains payout-at-release and the zero-anchor rollover for CS NFT anchoring', () => {
    render(<HowAnchoringWorks />);
    fireEvent.click(screen.getByText('anchoring.howItWorks.items.cosmicSignature.question'));
    expect(screen.getByText('anchoring.howItWorks.items.cosmicSignature.answer')).toBeVisible();
  });

  it('states that RandomWalk anchors receive no ETH', () => {
    render(<HowAnchoringWorks />);
    fireEvent.click(screen.getByText('anchoring.howItWorks.items.randomWalk.question'));
    expect(screen.getByText('anchoring.howItWorks.items.randomWalk.answer')).toBeVisible();
  });

  it('does not show content before expanding', () => {
    render(<HowAnchoringWorks />);
    expect(
      screen.queryByText('anchoring.howItWorks.items.whatIsAnchoring.answer'),
    ).not.toBeInTheDocument();
  });

  it('shows content after clicking a trigger', () => {
    render(<HowAnchoringWorks />);
    fireEvent.click(screen.getByText('anchoring.howItWorks.items.whatIsAnchoring.question'));
    expect(screen.getByText('anchoring.howItWorks.items.whatIsAnchoring.answer')).toBeVisible();
  });

  it('collapses previously open item when another is clicked', () => {
    render(<HowAnchoringWorks />);
    fireEvent.click(screen.getByText('anchoring.howItWorks.items.whatIsAnchoring.question'));
    expect(screen.getByText('anchoring.howItWorks.items.whatIsAnchoring.answer')).toBeVisible();

    fireEvent.click(screen.getByText('anchoring.howItWorks.items.cosmicSignature.question'));
    expect(screen.getByText('anchoring.howItWorks.items.cosmicSignature.answer')).toBeVisible();
  });

  it('applies custom className', () => {
    const { container } = render(<HowAnchoringWorks className="mb-10" />);
    expect(container.firstChild).toHaveClass('mb-10');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<HowAnchoringWorks />);
    await checkA11y(container);
  });

  it('has no accessibility violations with expanded item', async () => {
    const { container } = render(<HowAnchoringWorks />);
    fireEvent.click(screen.getByText('anchoring.howItWorks.items.whatIsAnchoring.question'));
    await checkA11y(container);
  });
});
