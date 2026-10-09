import type { AnchorAction } from '@/services/api/types';

import { checkA11y, render, screen } from '@/test-utils';

import { AnchorTimeline } from '../AnchorTimeline';

const record = (overrides: Partial<AnchorAction> = {}): AnchorAction => ({
  EvtLogId: 18890,
  BlockNum: 1,
  TxId: 1,
  TxHash: '0xanchor',
  TimeStamp: 1_781_506_867,
  DateTime: '',
  ActionId: 1,
  ActionType: 0,
  TokenAddr: '0x0',
  TokenId: 0,
  StakerAddr: '0xA169574D0d353E3010997A3E64846b7D1B2a63B6',
  NumStakedNFTs: 33,
  ...overrides,
});

describe('AnchorTimeline', () => {
  it('shows an anchor still in place and what it is doing now', () => {
    render(<AnchorTimeline collection="cosmicSignature" anchor={record()} release={null} />);
    expect(screen.getByText('anchoring.anchorActionDetail.timeline.anchored')).toBeInTheDocument();
    expect(
      screen.getByText('anchoring.anchorActionDetail.timeline.anchoredCount(count=33)'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('anchoring.anchorActionDetail.timeline.stillAnchored'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('anchoring.anchorActionDetail.timeline.stillAnchoredCosmicSignature'),
    ).toBeInTheDocument();
    // The anchoring transaction is proven on the explorer.
    expect(document.querySelector('a[href*="0xanchor"]')).toHaveAttribute('target', '_blank');
  });

  it('describes a Random Walk anchor by its Stellar Selection', () => {
    render(<AnchorTimeline collection="randomWalk" anchor={record()} release={null} />);
    expect(
      screen.getByText('anchoring.anchorActionDetail.timeline.stillAnchoredRandomWalk'),
    ).toBeInTheDocument();
  });

  it('ends with the release and the ETH it retrieved', () => {
    render(
      <AnchorTimeline
        collection="cosmicSignature"
        anchor={record()}
        release={record({ EvtLogId: 20000, TxHash: '0xrelease', RewardAmountEth: 0.1562 })}
      />,
    );
    expect(screen.getByText('anchoring.anchorActionDetail.timeline.released')).toBeInTheDocument();
    expect(
      screen.getByText(/anchoring\.anchorActionDetail\.timeline\.retrieved\(amount=0\.1562/),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('anchoring.anchorActionDetail.timeline.stillAnchored'),
    ).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <AnchorTimeline collection="cosmicSignature" anchor={record()} release={null} />,
    );
    await checkA11y(container);
  });
});
