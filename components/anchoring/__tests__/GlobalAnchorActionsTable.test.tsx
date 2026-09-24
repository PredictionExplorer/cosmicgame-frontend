import { checkA11y, render, screen } from '@/test-utils';

import { GlobalAnchorActionsTable } from '../GlobalAnchorActionsTable';

const HOLDER = '0x1234567890abcdef1234567890abcdef12345678';

const action = (overrides = {}) => ({
  EvtLogId: 1,
  ActionId: 10,
  TimeStamp: 1_790_207_903,
  TxHash: '0xactiontx',
  ActionType: 0,
  TokenId: 47,
  StakerAddr: HOLDER,
  NumStakedNFTs: 33,
  ...overrides,
});

describe('GlobalAnchorActionsTable', () => {
  it('lists anchors and releases with the token, the anchor-holder and the total', () => {
    render(
      <GlobalAnchorActionsTable
        list={[action(), action({ EvtLogId: 2, ActionId: 11, ActionType: 1 })]}
        IsRWLK={false}
      />,
    );
    expect(screen.getByText('anchoring.common.anchor')).toBeInTheDocument();
    expect(screen.getByText('anchoring.common.release')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: '#000047' })[0]).toHaveAttribute(
      'href',
      '/detail/47',
    );
    expect(document.querySelector(`a[href="/user/${HOLDER}"]`)).toBeInTheDocument();
    expect(screen.getAllByText('33')).toHaveLength(2);
  });

  it('says where each link goes: the action to its record, the date to its transaction', () => {
    render(<GlobalAnchorActionsTable list={[action()]} IsRWLK />);
    expect(
      screen.getByRole('link', { name: 'anchoring.anchorActionDetail.breadcrumbs.action(id=10)' }),
    ).toHaveAttribute('href', '/anchor-action/1/10');
    const proof = document.querySelector('a[href*="0xactiontx"]');
    expect(proof).toHaveAttribute('target', '_blank');
    expect(proof?.closest('td')).toHaveAttribute(
      'data-label',
      'anchoring.tables.globalAnchorActions.headers.anchorDatetime.mobile',
    );
  });

  it('defines only the column that does not explain itself: the running total', () => {
    render(<GlobalAnchorActionsTable list={[action()]} IsRWLK={false} />);
    const explanations = screen.getAllByRole('button', { name: /explainColumn/ });
    expect(explanations).toHaveLength(1);
    expect(explanations[0]).toHaveAccessibleName(
      /explainColumn\(column=anchoring\.tables\.globalAnchorActions\.headers\.nftCount\.desktop\)/,
    );
  });

  it('explains an empty list', () => {
    render(<GlobalAnchorActionsTable list={[]} IsRWLK={false} />);
    expect(
      screen.getByRole('heading', { name: 'anchoring.common.empty.actions.title' }),
    ).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<GlobalAnchorActionsTable list={[action()]} IsRWLK={false} />);
    await checkA11y(container);
  });
});
