import userEvent from '@testing-library/user-event';

import { render, screen, checkA11y } from '@/test-utils';

import AttachedNFTDistributionTable from '../AttachedNFTDistributionTable';

const rows = [
  {
    ContractAddr: '0x1234567890abcdef1234567890abcdef12345678',
    NumDonatedTokens: 3,
  },
];

describe('AttachedNFTDistributionTable', () => {
  it('renders empty state', () => {
    render(<AttachedNFTDistributionTable list={[]} />);
    expect(screen.getByText('tables.empty.attachedTokens')).toBeInTheDocument();
  });

  it('renders column help triggers', () => {
    render(<AttachedNFTDistributionTable list={rows} />);

    expect(
      screen.getAllByRole('button', {
        name: /^tables\.tableHeaderHelp\.explainColumn/,
      }).length,
    ).toBeGreaterThanOrEqual(2);
  });

  it('opens attached NFT column help', async () => {
    const user = userEvent.setup();
    render(<AttachedNFTDistributionTable list={rows} />);

    await user.hover(
      screen.getAllByRole('button', {
        name: /^tables\.tableHeaderHelp\.explainColumn/,
      })[0]!,
    );

    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'tables.statisticsTooltips.attachedNftContractAddress',
    );
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<AttachedNFTDistributionTable list={rows} />);
    await checkA11y(container);
  });
});
