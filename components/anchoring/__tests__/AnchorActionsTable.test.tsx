import type { AnchorAction } from '@/services/api';

import { checkA11y, render, screen } from '@/test-utils';

import AnchorActionsTable from '../AnchorActionsTable';

const action = (overrides: Partial<AnchorAction> = {}): AnchorAction => ({
  EvtLogId: 1,
  BlockNum: 1,
  TxId: 1,
  TxHash: '0xtx',
  TimeStamp: 1_781_506_867,
  DateTime: '',
  ActionId: 5,
  ActionType: 0,
  TokenAddr: '0x0',
  TokenId: 10,
  StakerAddr: '0x1234567890abcdef1234567890abcdef12345678',
  NumStakedNFTs: 3,
  ...overrides,
});

describe('AnchorActionsTable', () => {
  it('lists each action with its type, token and the collection total after it', () => {
    render(
      <AnchorActionsTable
        list={[action(), action({ EvtLogId: 2, ActionId: 6, ActionType: 1, TokenId: 11 })]}
        IsRwalk={false}
      />,
    );
    expect(screen.getByText('anchoring.common.anchor')).toBeInTheDocument();
    expect(screen.getByText('anchoring.common.release')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '#000010' })).toHaveAttribute('href', '/detail/10');
    expect(screen.getAllByText('3').length).toBeGreaterThanOrEqual(1);
  });

  it('leads each row to its anchor-action record', () => {
    render(<AnchorActionsTable list={[action()]} IsRwalk />);
    // The row link reads its visible date first, then where it leads (WCAG 2.5.3).
    expect(
      screen.getByRole('link', {
        name: /\S anchoring\.anchorActionDetail\.breadcrumbs\.action\(id=5\)$/,
      }),
    ).toHaveAttribute('href', '/anchor-action/1/5');
  });

  it('links a Random Walk token to its own site in a new tab', () => {
    render(<AnchorActionsTable list={[action({ TokenId: 1826 })]} IsRwalk />);
    const link = screen.getByRole('link', { name: /#001826/ });
    expect(link).toHaveAttribute('href', 'https://randomwalknft.com/detail/1826');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('explains an empty history', () => {
    render(<AnchorActionsTable list={[]} IsRwalk={false} />);
    expect(
      screen.getByRole('heading', { name: 'anchoring.common.empty.actions.title' }),
    ).toBeInTheDocument();
    expect(screen.getByText('anchoring.common.empty.actions.description')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<AnchorActionsTable list={[action()]} IsRwalk={false} />);
    await checkA11y(container);
  });
});
