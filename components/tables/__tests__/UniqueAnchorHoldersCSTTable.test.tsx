import '@testing-library/jest-dom';

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

  it('names each column once, the same on the header and in a phone record', () => {
    const { container } = render(<UniqueAnchorHoldersCSTTable list={[createAnchorHolder()]} />);
    // The sorted header's arrow is joined to its label by U+2060.
    const headers = screen
      .getAllByRole('columnheader')
      .map((header) => header.textContent?.replace(/\u2060/g, ''));
    expect(headers).toEqual([
      'tables.columns.anchorHolder',
      'tables.uniqueAnchorHolders.anchors',
      'tables.uniqueAnchorHolders.releases',
      'tables.uniqueAnchorHolders.imprinted',
      'tables.uniqueAnchorHolders.anchored',
      'tables.uniqueAnchorHolders.distributedEth',
      'tables.uniqueAnchorHolders.unretrievedEth',
    ]);
    const labels = [...container.querySelectorAll('tbody tr:first-child td')].map((cell) =>
      cell.getAttribute('data-label'),
    );
    expect(labels).toEqual(headers);
    // No explanation on a column whose header says what it holds.
    expect(
      screen.queryAllByRole('button', { name: /^tables\.tableHeaderHelp\.explainColumn/ }),
    ).toHaveLength(0);
  });

  it('lists the most anchored first, whatever order the API sends', () => {
    const { container } = render(
      <UniqueAnchorHoldersCSTTable
        list={[
          createAnchorHolder({
            StakerAid: 1,
            StakerAddr: `0x${'1'.repeat(40)}`,
            TotalTokensStaked: 9,
          }),
          createAnchorHolder({
            StakerAid: 2,
            StakerAddr: `0x${'2'.repeat(40)}`,
            TotalTokensStaked: 16,
          }),
          createAnchorHolder({
            StakerAid: 3,
            StakerAddr: `0x${'3'.repeat(40)}`,
            TotalTokensStaked: 1,
          }),
        ]}
      />,
    );
    const anchored = [...container.querySelectorAll('tbody tr')].map(
      (row) => row.querySelectorAll('td')[4]?.textContent,
    );
    expect(anchored).toEqual(['16', '9', '1']);
    expect(
      screen.getByRole('columnheader', { name: 'tables.uniqueAnchorHolders.anchored' }),
    ).toHaveAttribute('aria-sort', 'descending');
  });

  it('keeps four decimals for a zero distribution, so the column lines up', () => {
    render(
      <UniqueAnchorHoldersCSTTable
        list={[createAnchorHolder({ TotalRewardEth: 0, UnclaimedRewardEth: 0.1562 })]}
      />,
    );
    expect(screen.getByText('0.0000')).toBeInTheDocument();
    expect(screen.getByText('0.1562')).toBeInTheDocument();
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
