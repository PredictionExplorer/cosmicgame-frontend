import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import { UniqueAnchorHoldersRWLKTable } from '@/components/tables/UniqueAnchorHoldersRWLKTable';

import { checkA11y, render, screen } from '@/test-utils';

const createAnchorHolder = (overrides = {}) => ({
  StakerAid: 1,
  StakerAddr: '0x1234567890abcdef1234567890abcdef12345678',
  NumStakeActions: 10,
  NumUnstakeActions: 3,
  TotalTokensStaked: 7,
  TotalTokensMinted: 12,
  ...overrides,
});

describe('UniqueAnchorHoldersRWLKTable', () => {
  it('renders empty state when list is empty', () => {
    render(<UniqueAnchorHoldersRWLKTable list={[]} />);
    expect(screen.getByText('tables.empty.anchorHolders')).toBeInTheDocument();
  });

  it('renders table headers', () => {
    render(<UniqueAnchorHoldersRWLKTable list={[createAnchorHolder()]} />);
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
      screen.getAllByText('tables.uniqueAnchorHolders.totalAnchoredTokens').length,
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText('tables.uniqueAnchorHolders.totalImprintedTokens').length,
    ).toBeGreaterThanOrEqual(1);
  });

  it('explains only the columns that do not explain themselves', async () => {
    const user = userEvent.setup();
    render(<UniqueAnchorHoldersRWLKTable list={[createAnchorHolder()]} />);
    const triggers = screen.getAllByRole('button', {
      name: /^tables\.tableHeaderHelp\.explainColumn/,
    });
    // The address and the anchor and release counts need no definition.
    expect(triggers).toHaveLength(2);
    await user.hover(triggers[0]!);
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'tables.statisticsTooltips.totalAnchoredTokens',
    );
  });

  it('renders anchor-holder data', () => {
    render(<UniqueAnchorHoldersRWLKTable list={[createAnchorHolder()]} />);
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('shows 20 rows a page with the row range', () => {
    const list = Array.from({ length: 25 }, (_, i) =>
      createAnchorHolder({ StakerAid: i, NumStakeActions: 100 + i }),
    );
    const { container } = render(<UniqueAnchorHoldersRWLKTable list={list} />);
    expect(container.querySelectorAll('tbody tr')).toHaveLength(20);
    expect(screen.getByText('tables.pagination.range(from=1,to=20,total=25)')).toBeInTheDocument();
  });

  it('renders address as link to user page', () => {
    const addr = '0xaabbccddee112233445566778899aabbccddeeff';
    render(<UniqueAnchorHoldersRWLKTable list={[createAnchorHolder({ StakerAddr: addr })]} />);
    const links = screen.getAllByRole('link');
    const userLink = links.find((l) => l.getAttribute('href')?.startsWith('/user/'));
    expect(userLink).toHaveAttribute('href', `/user/${addr}`);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<UniqueAnchorHoldersRWLKTable list={[]} />);
    await checkA11y(container);
  });
});
