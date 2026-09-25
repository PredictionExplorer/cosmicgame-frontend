import { CST_UNISWAP_SWAP_URL } from '@/config/uniswap';

import { checkA11y, render, screen } from '@/test-utils';

import TransferCstPage from '../TransferCstPage';

const ACCOUNT = '0x1111111111111111111111111111111111111111';

let mockAccount: string | null = ACCOUNT;
let mockActive = true;

jest.mock('@/hooks/web3', () => ({
  useActiveWeb3React: () => ({
    account: mockAccount,
    active: mockActive,
  }),
}));

jest.mock('@/components/tokens/CstTransferForm', () => ({
  CstTransferForm: ({ source }: { source: string }) => (
    <div data-testid="cst-transfer-form" data-source={source}>
      Transfer form
    </div>
  ),
}));

describe('TransferCstPage', () => {
  beforeEach(() => {
    mockAccount = ACCOUNT;
    mockActive = true;
  });

  it('shows what connecting unlocks when no wallet is connected', () => {
    mockAccount = null;
    mockActive = false;

    render(<TransferCstPage />);

    expect(screen.getByText('wallet.required.transferCst.title')).toBeInTheDocument();
    expect(screen.getByText('wallet.required.transferCst.description')).toBeInTheDocument();
    expect(screen.getByTestId('connect-wallet-button')).toBeInTheDocument();
    expect(screen.queryByTestId('cst-transfer-form')).not.toBeInTheDocument();
  });

  it('sends from the connected wallet, labelled by the page heading', () => {
    render(<TransferCstPage />);

    expect(screen.getByTestId('cst-transfer-form')).toHaveAttribute('data-source', ACCOUNT);
    expect(screen.getByRole('region', { name: 'myPages.transferCst.page.title' })).toContainElement(
      screen.getByTestId('cst-transfer-form'),
    );
  });

  it('shows the sending wallet, its CST history and what to check before sending', () => {
    render(<TransferCstPage />);

    expect(screen.getByText('myPages.transferCst.guide.from')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'myPages.transferCst.guide.history' })).toHaveAttribute(
      'href',
      `/cosmic-token-transfer/${ACCOUNT}`,
    );
    expect(screen.getByText('myPages.transferCst.guide.final')).toBeInTheDocument();
  });

  it('renders the Uniswap CST trade action in the page header', () => {
    render(<TransferCstPage />);

    expect(screen.getByRole('link', { name: 'nav.ecosystem.uniswap.ariaLabel' })).toHaveAttribute(
      'href',
      CST_UNISWAP_SWAP_URL,
    );
  });

  it('puts the checks before the form, in reading order', () => {
    render(<TransferCstPage />);
    const checks = screen.getByText('myPages.transferCst.guide.final');
    const form = screen.getByTestId('cst-transfer-form');
    expect(checks.compareDocumentPosition(form)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it('keeps Connect the one action when disconnected, with trading as a link under it', () => {
    mockAccount = null;
    mockActive = false;
    render(<TransferCstPage />);

    const state = screen.getByTestId('wallet-required-state');
    const trade = screen.getByRole('link', { name: /nav\.ecosystem\.uniswap\.defaultLabel/ });
    expect(state).toContainElement(trade);
    expect(trade).toHaveAttribute('href', CST_UNISWAP_SWAP_URL);
    expect(screen.getByTestId('connect-wallet-button').compareDocumentPosition(trade)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<TransferCstPage />);
    await checkA11y(container);
  });
});
