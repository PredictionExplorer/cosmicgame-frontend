import { checkA11y, render, screen } from '@/test-utils';

import { GlobalAnchorActionsTable } from '../GlobalAnchorActionsTable';

const HOLDER = '0x1234567890abcdef1234567890abcdef12345678';

const action = (overrides = {}) => ({
  EvtLogId: 1,
  ActionId: 10,
  TimeStamp: 1_790_207_903,
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

  it('explains each column and leads each row to its record', () => {
    render(<GlobalAnchorActionsTable list={[action()]} IsRWLK />);
    expect(
      screen.getByRole('button', {
        name: /explainColumn\(column=anchoring\.tables\.globalAnchorActions\.headers\.holderAddress\.desktop\)/,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: /\S anchoring\.anchorActionDetail\.breadcrumbs\.action\(id=10\)$/,
      }),
    ).toHaveAttribute('href', '/anchor-action/1/10');
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
