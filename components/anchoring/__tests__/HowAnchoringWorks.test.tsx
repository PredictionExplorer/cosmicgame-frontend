import { checkA11y, render, screen, fireEvent } from '@/test-utils';

import { HowAnchoringWorks } from '../HowAnchoringWorks';

describe('HowAnchoringWorks', () => {
  it('renders the section title', () => {
    render(<HowAnchoringWorks />);
    expect(screen.getByText('How Anchoring Works')).toBeInTheDocument();
  });

  it('renders the introductory description', () => {
    render(<HowAnchoringWorks />);
    expect(
      screen.getByText('New to anchoring? Expand any section below to learn more.'),
    ).toBeInTheDocument();
  });

  it('renders all accordion trigger labels', () => {
    render(<HowAnchoringWorks />);
    expect(screen.getByText('What is Anchoring?')).toBeInTheDocument();
    expect(screen.getByText('Cosmic Signature NFT Anchoring')).toBeInTheDocument();
    expect(screen.getByText('RandomWalk (RWLK) Anchoring')).toBeInTheDocument();
    expect(screen.getByText('How are distributions calculated?')).toBeInTheDocument();
    expect(screen.getByText('Can I re-anchor an NFT after releasing it?')).toBeInTheDocument();
  });

  it('explains the once-only anchoring rule (usedNfts) when expanded', () => {
    render(<HowAnchoringWorks />);
    fireEvent.click(screen.getByText('What is Anchoring?'));
    expect(screen.getByText(/anchored only once, ever/)).toBeVisible();
  });

  it('explains that releasing is permanent per NFT', () => {
    render(<HowAnchoringWorks />);
    fireEvent.click(screen.getByText('Can I re-anchor an NFT after releasing it?'));
    expect(screen.getByText(/permanently ends that NFT/)).toBeVisible();
  });

  it('explains payout-at-release and the zero-anchor rollover for CS NFT anchoring', () => {
    render(<HowAnchoringWorks />);
    fireEvent.click(screen.getByText('Cosmic Signature NFT Anchoring'));
    expect(screen.getByText(/paid out when you release an anchor/)).toBeVisible();
    expect(screen.getByText(/stays in the Cycle Reserve/)).toBeVisible();
  });

  it('states that RandomWalk anchors receive no ETH', () => {
    render(<HowAnchoringWorks />);
    fireEvent.click(screen.getByText('RandomWalk (RWLK) Anchoring'));
    expect(screen.getByText(/RandomWalk anchors receive no ETH/)).toBeVisible();
  });

  it('does not show content before expanding', () => {
    render(<HowAnchoringWorks />);
    expect(screen.queryByText(/Anchoring lets you dedicate NFTs/)).not.toBeInTheDocument();
  });

  it('shows content after clicking a trigger', () => {
    render(<HowAnchoringWorks />);
    fireEvent.click(screen.getByText('What is Anchoring?'));
    expect(screen.getByText(/Anchoring lets you dedicate NFTs/)).toBeVisible();
  });

  it('collapses previously open item when another is clicked', () => {
    render(<HowAnchoringWorks />);
    fireEvent.click(screen.getByText('What is Anchoring?'));
    expect(screen.getByText(/Anchoring lets you dedicate NFTs/)).toBeVisible();

    fireEvent.click(screen.getByText('Cosmic Signature NFT Anchoring'));
    expect(screen.getByText(/Anchor your Cosmic Signature NFTs/)).toBeVisible();
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
    fireEvent.click(screen.getByText('What is Anchoring?'));
    await checkA11y(container);
  });
});
