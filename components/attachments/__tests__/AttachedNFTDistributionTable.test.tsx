import userEvent from '@testing-library/user-event';

import { statisticsCopy } from '@/content/statistics-copy';

import { render, screen, checkA11y } from '@/test-utils';

import AttachedNFTDistributionTable from '../AttachedNFTDistributionTable';

const rows = [
  {
    TokenAddr: '0x1234567890abcdef1234567890abcdef12345678',
    NumDonations: 3,
  },
];

describe('AttachedNFTDistributionTable', () => {
  it('renders empty state', () => {
    render(<AttachedNFTDistributionTable list={[]} />);
    expect(screen.getByText('No attached tokens yet.')).toBeInTheDocument();
  });

  it('renders column help triggers', () => {
    render(<AttachedNFTDistributionTable list={rows} />);

    expect(
      screen.getAllByRole('button', { name: 'Explain column: Contract Address' }).length,
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByRole('button', { name: 'Explain column: Number of NFTs' }).length,
    ).toBeGreaterThanOrEqual(1);
  });

  it('opens attached NFT column help', async () => {
    const user = userEvent.setup();
    render(<AttachedNFTDistributionTable list={rows} />);

    await user.hover(
      screen.getAllByRole('button', { name: 'Explain column: Contract Address' })[0]!,
    );

    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      statisticsCopy.tables.attachedNftContractAddress,
    );
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<AttachedNFTDistributionTable list={rows} />);
    await checkA11y(container);
  });
});
