import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import { shortenHex } from '@/utils';

import { UniqueAnchorHoldersCSTTable } from '@/components/tables/UniqueAnchorHoldersCSTTable';

import { checkA11y, render, screen } from '@/test-utils';

const createAnchorHolder = (overrides = {}) => ({
  StakerAid: 1,
  StakerAddr: '0x1234567890abcdef1234567890abcdef12345678',
  NumStakeActions: 10,
  NumUnstakeActions: 3,
  TotalTokensMinted: 15,
  TotalTokensStaked: 7,
  TotalRewardEth: 2.5,
  UnclaimedRewardEth: 0.75,
  ...overrides,
});

describe('UniqueAnchorHoldersCSTTable', () => {
  it('renders empty state when list is empty', () => {
    render(<UniqueAnchorHoldersCSTTable list={[]} />);
    expect(screen.getByText('tables.empty.anchorHolders')).toBeInTheDocument();
  });

  it('renders table headers', () => {
    render(<UniqueAnchorHoldersCSTTable list={[createAnchorHolder()]} />);
    expect(screen.getAllByText('tables.columns.anchorHolderAddress').length).toBeGreaterThanOrEqual(
      1,
    );
    expect(
      screen.getAllByText('tables.uniqueAnchorHolders.numAnchorActions').length,
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText('tables.uniqueAnchorHolders.numReleaseActions').length,
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText('tables.uniqueAnchorHolders.totalImprintedTokens').length,
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText('tables.uniqueAnchorHolders.totalAnchoredTokens').length,
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText('tables.uniqueAnchorHolders.totalDistributionEth').length,
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText('tables.uniqueAnchorHolders.unretrievedDistributionEth').length,
    ).toBeGreaterThanOrEqual(1);
  });

  it('explains only the columns that do not explain themselves', async () => {
    const user = userEvent.setup();
    render(<UniqueAnchorHoldersCSTTable list={[createAnchorHolder()]} />);
    const triggers = screen.getAllByRole('button', {
      name: /^tables\.tableHeaderHelp\.explainColumn/,
    });
    // The address and the anchor and release counts need no definition.
    expect(triggers).toHaveLength(4);
    await user.hover(triggers[0]!);
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'tables.statisticsTooltips.totalImprintedTokens',
    );
  });

  it('renders anchor-holder data', () => {
    render(<UniqueAnchorHoldersCSTTable list={[createAnchorHolder()]} />);
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('formats ETH values to 4 fixed decimal places so the column lines up', () => {
    render(
      <UniqueAnchorHoldersCSTTable
        list={[createAnchorHolder({ TotalRewardEth: 1.5, UnclaimedRewardEth: 0.3 })]}
      />,
    );
    expect(screen.getByText('1.5000')).toBeInTheDocument();
    expect(screen.getByText('0.3000')).toBeInTheDocument();
  });

  it('renders shortened address with link', () => {
    const addr = '0x1234567890abcdef1234567890abcdef12345678';
    render(<UniqueAnchorHoldersCSTTable list={[createAnchorHolder({ StakerAddr: addr })]} />);
    expect(screen.getByText(shortenHex(addr, 6))).toBeInTheDocument();
    const links = screen.getAllByRole('link');
    const userLink = links.find((l) => l.getAttribute('href')?.startsWith('/user/'));
    expect(userLink).toHaveAttribute('href', `/user/${addr}`);
  });

  it('shows 20 rows a page with the row range', () => {
    const list = Array.from({ length: 25 }, (_, i) =>
      createAnchorHolder({ StakerAid: i, NumStakeActions: 100 + i }),
    );
    const { container } = render(<UniqueAnchorHoldersCSTTable list={list} />);
    expect(container.querySelectorAll('tbody tr')).toHaveLength(20);
    expect(screen.getByText('tables.pagination.range(from=1,to=20,total=25)')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<UniqueAnchorHoldersCSTTable list={[]} />);
    await checkA11y(container);
  });
});
