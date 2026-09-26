import { UNISWAP_V4_POOL_MANAGER_ARBITRUM } from '@/config/uniswap';

import { checkA11y, render, screen, within } from '@/test-utils';

import { CstHoldersLedger, isUniswapLiquidity } from '../CstHoldersLedger';

const holders = [
  { OwnerAid: 1, OwnerAddr: '0xA1b2C3d4E5f60718293a4B5c6D7e8F9012345678', BalanceFloat: 607 },
  { OwnerAid: 2, OwnerAddr: '0xB1b2C3d4E5f60718293a4B5c6D7e8F9012345678', BalanceFloat: 10 },
  { OwnerAid: 3, OwnerAddr: '0xC1b2C3d4E5f60718293a4B5c6D7e8F9012345678', BalanceFloat: 12 },
];

describe('CstHoldersLedger', () => {
  it('lists holders largest first, every share with one decimal', () => {
    render(<CstHoldersLedger list={holders} supply={1_000} />);
    const table = screen.getByRole('table');
    const shares = within(table)
      .getAllByText(/%$/)
      .map((cell) => cell.textContent);
    // Regression: "1%" sat among "1.2%" rows.
    expect(shares).toEqual(['60.7%', '1.2%', '1.0%']);
  });

  it('starts every share bar at one x: the share sits in a fixed-width slot', () => {
    render(<CstHoldersLedger list={holders} supply={1_000} />);
    for (const share of within(screen.getByRole('table')).getAllByText(/%$/)) {
      expect(share).toHaveClass('min-w-[7ch]', 'text-right', 'tabular-nums');
    }
  });

  it('measures shares against the listed balances while the supply is unknown', () => {
    render(<CstHoldersLedger list={holders.slice(1)} supply={null} />);
    const shares = within(screen.getByRole('table'))
      .getAllByText(/%$/)
      .map((cell) => cell.textContent);
    expect(shares).toEqual(['54.5%', '45.5%']);
  });

  it('names Uniswap’s pool liquidity instead of printing its bare address', () => {
    // Regression: the largest balance (68.9% of supply) read as a bare
    // "0x360E…FB32", as though one participant held most of the CST.
    expect(isUniswapLiquidity(UNISWAP_V4_POOL_MANAGER_ARBITRUM.toLowerCase(), 42161)).toBe(true);
    expect(isUniswapLiquidity(holders[0]!.OwnerAddr, 42161)).toBe(false);
    // Only on Arbitrum One, where that contract is Uniswap's.
    expect(isUniswapLiquidity(UNISWAP_V4_POOL_MANAGER_ARBITRUM, 421614)).toBe(false);
  });

  it('has no axe violations', async () => {
    const { container } = render(<CstHoldersLedger list={holders} supply={1_000} />);
    await checkA11y(container);
  });
});
