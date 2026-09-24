import type { AnchoredTokenInfo } from '@/services/api';

import { checkA11y, render, screen } from '@/test-utils';

import { GlobalAnchoredTokensTable } from '../GlobalAnchoredTokensTable';

const HOLDER = '0x1234567890abcdef1234567890abcdef12345678';

const cstRow: AnchoredTokenInfo = {
  StakeActionId: 6,
  StakedTokenId: 0,
  StakeTimeStamp: 1_781_506_867,
  StakeEvtLogId: 100,
  UserAddr: HOLDER,
  TokenInfo: { TokenId: 2, Seed: 0xabc },
};

const rwlkRow: AnchoredTokenInfo = {
  StakeActionId: 33,
  StakedTokenId: 1826,
  StakeTimeStamp: 1_786_367_704,
  StakeEvtLogId: 200,
  UserAddr: HOLDER,
};

describe('GlobalAnchoredTokensTable', () => {
  it('shows each anchored Cosmic Signature by its artwork, action and anchor-holder', () => {
    render(<GlobalAnchoredTokensTable list={[cstRow]} IsRWLK={false} />);
    expect(screen.getByTestId('art-frame')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '#000002' })).toHaveAttribute('href', '/detail/2');
    expect(
      screen.getByRole('link', { name: 'anchoring.anchorActionDetail.breadcrumbs.action(id=6)' }),
    ).toHaveAttribute('href', '/anchor-action/0/6');
    expect(document.querySelector(`a[href="/user/${HOLDER}"]`)).toBeInTheDocument();
  });

  it('shows a Random Walk NFT by its render and links it to its own site', () => {
    render(<GlobalAnchoredTokensTable list={[rwlkRow]} IsRWLK />);
    expect(screen.getByTestId('art-frame')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /#001826/ })).toHaveAttribute(
      'href',
      'https://randomwalknft.com/detail/1826',
    );
    expect(
      screen.getByRole('link', { name: 'anchoring.anchorActionDetail.breadcrumbs.action(id=33)' }),
    ).toHaveAttribute('href', '/anchor-action/1/33');
  });

  it('explains an empty list', () => {
    render(<GlobalAnchoredTokensTable list={[]} IsRWLK={false} />);
    expect(
      screen.getByRole('heading', { name: 'anchoring.common.empty.tokens.title' }),
    ).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<GlobalAnchoredTokensTable list={[cstRow]} IsRWLK={false} />);
    await checkA11y(container);
  });
});
