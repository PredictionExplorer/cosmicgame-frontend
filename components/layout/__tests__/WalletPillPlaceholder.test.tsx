import '@testing-library/jest-dom';

import type { ComponentType } from 'react';

import Header from '@/components/layout/Header';
import { WALLET_PILL_ADDRESS_CLASS, WALLET_PILL_CLASS } from '@/components/wallet/walletPill';

import { render, screen } from '@/test-utils';

jest.mock('@rainbow-me/rainbowkit');
jest.mock('wagmi');
// Every code-split part stays in its loading state: the chunk never lands.
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: (_loader: unknown, options?: { loading?: ComponentType }) =>
    options?.loading ?? (() => null),
}));

const ACCOUNT = '0x1234567890abcdef1234567890abcdef12345678';

jest.mock('../../../hooks/web3', () => ({
  useActiveWeb3React: () => ({ account: ACCOUNT, chainId: 421614, active: true }),
}));
jest.mock('../../../contexts/SystemModeContext', () => ({
  useSystemMode: () => ({ data: 0, fetchData: jest.fn() }),
}));

describe('the header wallet pill before its chunk arrives', () => {
  it('holds the pill’s place at its own size: box, short address and chevron', () => {
    render(<Header />);
    const placeholder = screen.getByTestId('wallet-pill-placeholder');
    expect(placeholder).toHaveAttribute('aria-hidden', 'true');
    // The pill's own box classes (ConnectWalletButton's WalletPill uses them too).
    expect(placeholder).toHaveClass(...WALLET_PILL_CLASS.split(' '));
    // The address is what widens the pill; it shows where the pill shows it.
    const address = placeholder.querySelector('.type-mono')!;
    expect(address).toHaveClass(...WALLET_PILL_ADDRESS_CLASS.split(' '));
    expect(address.textContent).toMatch(/^0x1234.+5678$/);
    expect(placeholder.querySelector('svg.md\\:inline')).not.toBeNull();
    expect(screen.queryByTestId('connect-wallet-button')).toBeNull();
  });
});
