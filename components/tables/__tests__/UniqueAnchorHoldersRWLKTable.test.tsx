import '@testing-library/jest-dom';

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

  it('names each column once, the same on the header and in a phone record', () => {
    const { container } = render(<UniqueAnchorHoldersRWLKTable list={[createAnchorHolder()]} />);
    // The sorted header's arrow is joined to its label by U+2060.
    const headers = screen
      .getAllByRole('columnheader')
      .map((header) => header.textContent?.replace(/\u2060/g, ''));
    expect(headers).toEqual([
      'tables.columns.anchorHolder',
      'tables.uniqueAnchorHolders.anchors',
      'tables.uniqueAnchorHolders.releases',
      'tables.uniqueAnchorHolders.anchored',
      'tables.uniqueAnchorHolders.imprinted',
    ]);
    const labels = [...container.querySelectorAll('tbody tr:first-child td')].map((cell) =>
      cell.getAttribute('data-label'),
    );
    expect(labels).toEqual(headers);
    expect(
      screen.queryAllByRole('button', { name: /^tables\.tableHeaderHelp\.explainColumn/ }),
    ).toHaveLength(0);
  });

  it('lists the most anchored first', () => {
    const { container } = render(
      <UniqueAnchorHoldersRWLKTable
        list={[
          createAnchorHolder({
            StakerAid: 1,
            StakerAddr: `0x${'1'.repeat(40)}`,
            TotalTokensStaked: 1,
          }),
          createAnchorHolder({
            StakerAid: 2,
            StakerAddr: `0x${'2'.repeat(40)}`,
            TotalTokensStaked: 14,
          }),
        ]}
      />,
    );
    const anchored = [...container.querySelectorAll('tbody tr')].map(
      (row) => row.querySelectorAll('td')[3]?.textContent,
    );
    expect(anchored).toEqual(['14', '1']);
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
