import '@testing-library/jest-dom';

import { formatAddress } from '@/utils';

import { AnchorHoldersTable } from '@/components/tables/AnchorHoldersTable';
import type { UniqueAnchorHolderCST, UniqueAnchorHolderRWLK } from '@/services/api/types';

import { checkA11y, render, screen } from '@/test-utils';

const cstHolder = (overrides: Partial<UniqueAnchorHolderCST> = {}): UniqueAnchorHolderCST => ({
  StakerAid: 1,
  StakerAddr: '0x1234567890abcdef1234567890abcdef12345678',
  NumStakeActions: 10,
  NumUnstakeActions: 3,
  TotalTokensStaked: 7,
  TotalRewardEth: 2.5,
  UnclaimedRewardEth: 0.75,
  ...overrides,
});

const rwlkHolder = (overrides: Partial<UniqueAnchorHolderRWLK> = {}): UniqueAnchorHolderRWLK => ({
  StakerAid: 1,
  StakerAddr: '0x1234567890abcdef1234567890abcdef12345678',
  NumStakeActions: 10,
  NumUnstakeActions: 3,
  TotalTokensStaked: 7,
  TotalTokensMinted: 12,
  ...overrides,
});

/** Header texts in order; a sorted header's arrow is joined to its label by U+2060. */
const headers = () =>
  screen.getAllByRole('columnheader').map((header) => header.textContent?.replace(/⁠/g, ''));

const firstRowLabels = (container: HTMLElement) =>
  [...container.querySelectorAll('tbody tr:first-child td')].map((cell) =>
    cell.getAttribute('data-label'),
  );

describe('AnchorHoldersTable', () => {
  it('shows the empty state for either collection', () => {
    const { rerender } = render(<AnchorHoldersTable collection="cosmicSignature" list={[]} />);
    expect(screen.getByText('tables.empty.anchorHolders')).toBeInTheDocument();
    rerender(<AnchorHoldersTable collection="randomWalk" list={[]} />);
    expect(screen.getByText('tables.empty.anchorHolders')).toBeInTheDocument();
  });

  it('names each table after its collection', () => {
    const { rerender } = render(
      <AnchorHoldersTable collection="cosmicSignature" list={[cstHolder()]} />,
    );
    expect(
      screen.getByRole('table', { name: 'tables.names.cstAnchorHolders' }),
    ).toBeInTheDocument();
    rerender(<AnchorHoldersTable collection="randomWalk" list={[rwlkHolder()]} />);
    expect(
      screen.getByRole('table', { name: 'tables.names.rwlkAnchorHolders' }),
    ).toBeInTheDocument();
  });

  it('gives a Cosmic Signature holder its Anchor Distribution columns, named once', () => {
    const { container } = render(
      <AnchorHoldersTable collection="cosmicSignature" list={[cstHolder()]} />,
    );
    expect(headers()).toEqual([
      'tables.columns.anchorHolder',
      'tables.uniqueAnchorHolders.anchors',
      'tables.uniqueAnchorHolders.releases',
      'tables.uniqueAnchorHolders.anchored',
      'tables.uniqueAnchorHolders.distributedEth',
      'tables.uniqueAnchorHolders.unretrievedEth',
    ]);
    // The same words label each value in a phone record.
    expect(firstRowLabels(container)).toEqual(headers());
    // No explanation on a column whose header says what it holds.
    expect(
      screen.queryAllByRole('button', { name: /^tables\.tableHeaderHelp\.explainColumn/ }),
    ).toHaveLength(0);
  });

  it('gives a Random Walk holder its imprinted column instead', () => {
    const { container } = render(
      <AnchorHoldersTable collection="randomWalk" list={[rwlkHolder()]} />,
    );
    expect(headers()).toEqual([
      'tables.columns.anchorHolder',
      'tables.uniqueAnchorHolders.anchors',
      'tables.uniqueAnchorHolders.releases',
      'tables.uniqueAnchorHolders.anchored',
      'tables.uniqueAnchorHolders.imprinted',
    ]);
    expect(firstRowLabels(container)).toEqual(headers());
  });

  it('keeps a phone record to the holder, what it anchors now and what it has received', () => {
    // V289: the action counts and the amount still to retrieve, mostly zeros, stay on wide screens.
    const { container } = render(
      <AnchorHoldersTable collection="cosmicSignature" list={[cstHolder()]} />,
    );
    const cells = [...container.querySelectorAll('tbody tr:first-child td')];
    const onPhone = cells
      .filter((cell) => cell.getAttribute('data-priority') !== 'secondary')
      .map((cell) => cell.getAttribute('data-label'));
    expect(onPhone).toEqual([
      'tables.columns.anchorHolder',
      'tables.uniqueAnchorHolders.anchored',
      'tables.uniqueAnchorHolders.distributedEth',
    ]);
    expect(cells[0]).toHaveAttribute('data-phone', 'title');
  });

  it('lists the most anchored first, whatever order the API sends', () => {
    const { container } = render(
      <AnchorHoldersTable
        collection="cosmicSignature"
        list={[
          cstHolder({ StakerAid: 1, StakerAddr: `0x${'1'.repeat(40)}`, TotalTokensStaked: 9 }),
          cstHolder({ StakerAid: 2, StakerAddr: `0x${'2'.repeat(40)}`, TotalTokensStaked: 16 }),
          cstHolder({ StakerAid: 3, StakerAddr: `0x${'3'.repeat(40)}`, TotalTokensStaked: 1 }),
        ]}
      />,
    );
    const anchored = [...container.querySelectorAll('tbody tr')].map(
      (row) => row.querySelectorAll('td')[3]?.textContent,
    );
    expect(anchored).toEqual(['16', '9', '1']);
    expect(
      screen.getByRole('columnheader', { name: 'tables.uniqueAnchorHolders.anchored' }),
    ).toHaveAttribute('aria-sort', 'descending');
  });

  it('shows each holder’s counts', () => {
    render(<AnchorHoldersTable collection="randomWalk" list={[rwlkHolder()]} />);
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('keeps four decimals in the ETH columns, zero included, so they line up', () => {
    render(
      <AnchorHoldersTable
        collection="cosmicSignature"
        list={[cstHolder({ TotalRewardEth: 0, UnclaimedRewardEth: 0.3 })]}
      />,
    );
    expect(screen.getByText('0.0000')).toBeInTheDocument();
    expect(screen.getByText('0.3000')).toBeInTheDocument();
  });

  it('links each holder, by its shortened address, to its participant page', () => {
    const addr = '0xaabbccddee112233445566778899aabbccddeeff';
    render(
      <AnchorHoldersTable collection="randomWalk" list={[rwlkHolder({ StakerAddr: addr })]} />,
    );
    expect(screen.getByText(formatAddress(addr))).toBeInTheDocument();
    const userLink = screen
      .getAllByRole('link')
      .find((link) => link.getAttribute('href')?.startsWith('/user/'));
    expect(userLink).toHaveAttribute('href', `/user/${addr}`);
  });

  it('shows 20 rows a page with the row range', () => {
    const list = Array.from({ length: 25 }, (_, i) =>
      cstHolder({ StakerAid: i, NumStakeActions: 100 + i }),
    );
    const { container } = render(<AnchorHoldersTable collection="cosmicSignature" list={list} />);
    expect(container.querySelectorAll('tbody tr')).toHaveLength(20);
    expect(screen.getByText('tables.pagination.range(from=1,to=20,total=25)')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <AnchorHoldersTable collection="cosmicSignature" list={[cstHolder()]} />,
    );
    await checkA11y(container);
  });
});
