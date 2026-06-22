import { render, screen } from '@/test-utils';

import TransferCstPage from '../TransferCstPage';

const ACCOUNT = '0x1111111111111111111111111111111111111111';

let mockAccount: string | null = ACCOUNT;
let mockActive = true;

jest.mock('../../../hooks/web3', () => ({
  useActiveWeb3React: () => ({
    account: mockAccount,
    active: mockActive,
  }),
}));

jest.mock('../../../components/tokens/CstTransferForm', () => ({
  CstTransferForm: ({
    sourceAddress,
    historyHref,
  }: {
    sourceAddress: string;
    historyHref: string;
  }) => (
    <div data-testid="cst-transfer-form" data-source={sourceAddress} data-history={historyHref}>
      Transfer form
    </div>
  ),
}));

describe('TransferCstPage', () => {
  beforeEach(() => {
    mockAccount = ACCOUNT;
    mockActive = true;
  });

  it('shows a wallet-required empty state when disconnected', () => {
    mockAccount = null;
    mockActive = false;

    render(<TransferCstPage />);

    expect(screen.getByText('Wallet not connected')).toBeInTheDocument();
    expect(screen.queryByTestId('cst-transfer-form')).not.toBeInTheDocument();
  });

  it('renders the transfer form for the connected wallet', () => {
    render(<TransferCstPage />);

    const form = screen.getByTestId('cst-transfer-form');
    expect(form).toHaveAttribute('data-source', ACCOUNT);
    expect(form).toHaveAttribute('data-history', `/cosmic-token-transfer/${ACCOUNT}`);
  });
});
