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
      screen.getAllByRole('link', {
        name: 'anchoring.anchorActionDetail.breadcrumbs.action(id=6)',
      })[0],
    ).toHaveAttribute('href', '/anchor-action/0/6');
    expect(document.querySelector(`a[href="/user/${HOLDER}"]`)).toBeInTheDocument();
  });

  it('lists the newest anchored first, sortable by date and NFT, with no info button', () => {
    const older = { ...cstRow, StakeEvtLogId: 1, StakeActionId: 1, TokenInfo: { TokenId: 0 } };
    const newer = { ...cstRow, StakeEvtLogId: 2, StakeActionId: 9, StakeTimeStamp: 1_790_000_000 };
    render(<GlobalAnchoredTokensTable list={[older, newer]} IsRWLK={false} />);
    const numbers = screen.getAllByRole('link', { name: /^#0000/ }).map((link) => link.textContent);
    expect(numbers).toEqual(['#000002', '#000000']);
    expect(screen.queryAllByRole('button', { name: /explainColumn/ })).toHaveLength(0);
    for (const header of ['tokenId', 'anchorDatetime']) {
      expect(
        screen.getByRole('button', {
          name: new RegExp(`globalAnchoredTokens\\.headers\\.${header}\\.desktop`),
        }),
      ).toBeInTheDocument();
    }
  });

  it('heads a phone record with the art, with no column label stacked above it', () => {
    const { container } = render(<GlobalAnchoredTokensTable list={[cstRow]} IsRWLK={false} />);
    const tokenCell = container.querySelector('td[data-label=""]');
    expect(tokenCell).toHaveAttribute('data-stack', 'true');
    expect(tokenCell?.querySelector('[data-testid="art-frame"]')).not.toBeNull();
  });

  it('orders NFTs anchored at the same moment by their action, newest first', () => {
    // One transaction anchors several NFTs: the API lists them oldest action first.
    const rows = [26, 27, 28].map((action) => ({
      ...cstRow,
      StakeEvtLogId: action,
      StakeActionId: action,
      TokenInfo: { TokenId: action },
    }));
    render(<GlobalAnchoredTokensTable list={rows} IsRWLK={false} />);
    const numbers = screen.getAllByRole('link', { name: /^#0000/ }).map((link) => link.textContent);
    expect(numbers).toEqual(['#000028', '#000027', '#000026']);
  });

  it('shows a Random Walk NFT by its render and links it to its own site', () => {
    render(<GlobalAnchoredTokensTable list={[rwlkRow]} IsRWLK />);
    expect(screen.getByTestId('art-frame')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /#001826/ })).toHaveAttribute(
      'href',
      'https://www.randomwalknft.com/detail/1826',
    );
    expect(
      screen.getAllByRole('link', {
        name: 'anchoring.anchorActionDetail.breadcrumbs.action(id=33)',
      })[0],
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
