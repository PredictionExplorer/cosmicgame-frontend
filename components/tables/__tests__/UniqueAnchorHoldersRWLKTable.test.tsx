import '@testing-library/jest-dom';

import { statisticsCopy } from '@/content/statistics-copy';

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

  it('adds help triggers to RandomWalk anchor-holder headers', () => {
    render(<UniqueAnchorHoldersRWLKTable list={[createAnchorHolder()]} />);
    expect(
      screen.getAllByRole('button', {
        name: /^tables\.tableHeaderHelp\.explainColumn/,
      }).length,
    ).toBeGreaterThanOrEqual(5);
    expect(statisticsCopy.tables.totalAnchoredTokens).toMatch(/anchored-token/);
  });

  it('renders anchor-holder data', () => {
    render(<UniqueAnchorHoldersRWLKTable list={[createAnchorHolder()]} />);
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('renders only first page of results (perPage=5)', () => {
    const list = Array.from({ length: 8 }, (_, i) =>
      createAnchorHolder({ StakerAid: i, NumStakeActions: 100 + i }),
    );
    render(<UniqueAnchorHoldersRWLKTable list={list} />);
    expect(screen.getByText('104')).toBeInTheDocument();
    expect(screen.queryByText('105')).not.toBeInTheDocument();
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
