import { checkA11y, render, screen, within } from '@/test-utils';

import { CSTokenDistributionTable } from '../CSTokenDistributionTable';

const holders = [
  { OwnerAddr: '0x1111111111111111111111111111111111111111', OwnerAid: 1, NumTokens: 3 },
  { OwnerAddr: '0x2222222222222222222222222222222222222222', OwnerAid: 2, NumTokens: 12 },
  { OwnerAddr: '0x3333333333333333333333333333333333333333', OwnerAid: 3, NumTokens: 1 },
];

describe('CSTokenDistributionTable', () => {
  it('lists holders by how many NFTs they hold, most first, as a named table', () => {
    render(<CSTokenDistributionTable list={holders} />);
    const table = screen.getByRole('table', { name: 'Cosmic Signature NFT (ERC-721)' });
    const rows = within(table).getAllByRole('row').slice(1);
    expect(rows.map((row) => within(row).getAllByRole('cell').at(-1)?.textContent)).toEqual([
      '12',
      '3',
      '1',
    ]);
  });

  it('links each holder to their profile', () => {
    render(<CSTokenDistributionTable list={holders} />);
    const links = screen.getAllByRole('link');
    expect(links.map((link) => link.getAttribute('href'))).toContain(
      '/user/0x2222222222222222222222222222222222222222',
    );
  });

  it('pages at the shared ledger size, so seven holders fit on one page (regression)', () => {
    // It paged five at a time: "1–5 of 7" where every other ledger shows 20.
    const seven = Array.from({ length: 7 }, (_, index) => ({
      OwnerAddr: `0x${String(index + 1).padStart(40, '0')}`,
      OwnerAid: index,
      NumTokens: index + 1,
    }));
    render(<CSTokenDistributionTable list={seven} />);
    expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(8);
  });

  it('says so when nobody holds one yet', () => {
    render(<CSTokenDistributionTable list={[]} />);
    expect(screen.getByText('tables.empty.tokens')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<CSTokenDistributionTable list={holders} />);
    await checkA11y(container);
  });
});
