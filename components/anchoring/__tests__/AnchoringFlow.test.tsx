import { checkA11y, render, screen } from '@/test-utils';

import { AnchoringFlow, type AnchoringFlowProps } from '../AnchoringFlow';

function renderFlow(props: Partial<AnchoringFlowProps> = {}) {
  return render(
    <AnchoringFlow
      poolEth={1.9376}
      anchoredCosmicSignature={33}
      perNft={{ status: 'available', perNftEth: 0.058716 }}
      anchoredRandomWalk={33}
      activeHolders={11}
      {...props}
    />,
  );
}

describe('AnchoringFlow', () => {
  it('shows how the pool divides among the anchored Cosmic Signature NFTs', () => {
    const { container } = renderFlow();
    expect(container).toHaveTextContent('1.9376');
    expect(container).toHaveTextContent('0.0587');
    expect(screen.getByText('anchoring.flow.dividedBy')).toBeInTheDocument();
    expect(screen.getByText('anchoring.flow.equals')).toBeInTheDocument();
    // The pool's share of the Cycle Reserve comes from protocol-facts.
    expect(
      screen.getByText('anchoring.flow.cosmicSignature.pool.caption(percentage=6)'),
    ).toBeInTheDocument();
  });

  it('shows what each Stellar Selection of an anchored Random Walk NFT receives', () => {
    const { container } = renderFlow();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(container).toHaveTextContent('1,000');
    expect(screen.getByText('anchoring.flow.randomWalk.allocation.caption')).toBeInTheDocument();
    expect(screen.getByText('11')).toBeInTheDocument();
  });

  it('explains every live figure on its label', () => {
    renderFlow();
    for (const label of [
      'anchoring.flow.cosmicSignature.pool.label',
      'anchoring.flow.cosmicSignature.anchored.label',
      'anchoring.flow.cosmicSignature.perNft.label',
      'anchoring.flow.randomWalk.anchored.label',
      'anchoring.flow.holders.label',
    ]) {
      expect(
        screen.getByRole('button', { name: `More information about ${label}` }),
      ).toBeInTheDocument();
    }
  });

  it('shows unread figures as unavailable, never as zero', () => {
    renderFlow({
      poolEth: null,
      anchoredCosmicSignature: null,
      perNft: { status: 'unavailable' },
      anchoredRandomWalk: null,
      activeHolders: null,
    });
    expect(screen.getAllByText('anchoring.flow.unavailable').length).toBeGreaterThanOrEqual(5);
  });

  it('says when no Cosmic Signature NFT is anchored instead of dividing by zero', () => {
    renderFlow({ perNft: { status: 'noneAnchored' } });
    expect(
      screen.getByText('anchoring.flow.cosmicSignature.perNft.noneAnchored'),
    ).toBeInTheDocument();
  });

  it('holds the layout with skeletons while the figures load', () => {
    const { container } = renderFlow({ loading: true });
    expect(container).not.toHaveTextContent('1.9376');
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('has no accessibility violations', async () => {
    const { container } = renderFlow();
    await checkA11y(container);
  });
});
