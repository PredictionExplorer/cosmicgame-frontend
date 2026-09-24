import { checkA11y, render, screen } from '@/test-utils';

import { AnchorDistributionsTable } from '../AnchorDistributionsTable';

const ADDRESS = '0x1234567890abcdef1234567890abcdef12345678';

describe('AnchorDistributionsTable', () => {
  it('shows what each NFT has retrieved and has left to retrieve', () => {
    render(
      <AnchorDistributionsTable
        list={[{ TokenId: 9, RewardCollectedEth: 0.25, RewardToCollectEth: 0.1562 }]}
        address={ADDRESS}
      />,
    );
    expect(
      screen.getByText('anchoring.tables.tokenDistributions.columns.retrievedEth'),
    ).toBeInTheDocument();
    expect(screen.getByText('0.2500')).toBeInTheDocument();
    expect(screen.getByText('0.1562')).toBeInTheDocument();
  });

  it('leads each NFT to its deposit-by-deposit record', () => {
    render(<AnchorDistributionsTable list={[{ TokenId: 9 }]} address={ADDRESS} />);
    expect(
      screen.getByRole('link', { name: 'anchoring.distributionsByToken.title(tokenId=9)' }),
    ).toHaveAttribute('href', `/distributions-by-token/${ADDRESS}/9`);
  });

  it('explains an empty list', () => {
    render(<AnchorDistributionsTable list={[]} address={ADDRESS} />);
    expect(
      screen.getByRole('heading', { name: 'anchoring.common.empty.distributions.title' }),
    ).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <AnchorDistributionsTable
        list={[{ TokenId: 9, RewardToCollectEth: 0.1 }]}
        address={ADDRESS}
      />,
    );
    await checkA11y(container);
  });
});
