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
    // Only the exception carries a tag: an anchor is what nearly every row records.
    expect(screen.queryByText('anchoring.common.anchor')).not.toBeInTheDocument();
    // The release's tag sits beside its action link: once in the column, once in the phone caption.
    expect(screen.getAllByText('anchoring.common.release')).toHaveLength(2);
    expect(screen.getAllByRole('link', { name: '#000047' })[0]).toHaveAttribute(
      'href',
      '/detail/47',
    );
    expect(document.querySelector(`a[href="/user/${HOLDER}"]`)).toBeInTheDocument();
    expect(screen.getAllByText('33')).toHaveLength(2);
  });

  it('says where each link goes: the action to its record, the date to its transaction', () => {
    render(<GlobalAnchorActionsTable list={[action()]} IsRWLK />);
    // The action link is in its column and in the phone caption (each shown at its own width).
    const actionLinks = screen.getAllByRole('link', {
      name: 'anchoring.anchorActionDetail.breadcrumbs.action(id=10)',
    });
    expect(actionLinks).toHaveLength(2);
    for (const link of actionLinks) expect(link).toHaveAttribute('href', '/anchor-action/1/10');
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

  it('keeps its many links quiet and heads each phone record with the artwork', () => {
    render(<GlobalAnchorActionsTable list={[action()]} IsRWLK={false} />);
    const table = screen.getByRole('table');
    expect(table).toHaveAttribute('data-links', 'quiet');
    expect(table).toHaveAttribute('data-layout', 'cards');
    // NFT, action, date, holder, running total: the action and the date move into the NFT's
    // phone caption, so a phone record reads the NFT, then its holder.
    expect(
      screen.getAllByRole('columnheader').map((header) => header.getAttribute('data-priority')),
    ).toEqual(['primary', 'secondary', 'secondary', 'primary', 'secondary']);
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
