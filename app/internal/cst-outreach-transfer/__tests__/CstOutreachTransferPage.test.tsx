import {
  TEST_APP_CONTRACT_ADDRESSES,
  TEST_MARKETING_WALLET,
} from '@/test-utils/contractAddressesFixture';

import { render, screen } from '@/test-utils';

import CstOutreachTransferPage from '../CstOutreachTransferPage';

const OTHER_ACCOUNT = '0x1111111111111111111111111111111111111111';

let mockAccount: string | null = TEST_MARKETING_WALLET;
let mockActive = true;
let mockContractAddresses = TEST_APP_CONTRACT_ADDRESSES;

jest.mock('../../../../hooks/web3', () => ({
  useActiveWeb3React: () => ({
    account: mockAccount,
    active: mockActive,
  }),
}));

jest.mock('../../../../contexts/ContractAddressesContext', () => ({
  useContractAddresses: () => mockContractAddresses,
}));

jest.mock('../../../../components/tokens/CstTransferForm', () => ({
  CstTransferForm: ({
    sourceAddress,
    historyHref,
  }: {
    sourceAddress: string;
    historyHref: string;
  }) => (
    <div data-testid="cst-transfer-form" data-source={sourceAddress} data-history={historyHref}>
      Marketing transfer form
    </div>
  ),
}));

describe('CstOutreachTransferPage', () => {
  beforeEach(() => {
    mockAccount = TEST_MARKETING_WALLET;
    mockActive = true;
    mockContractAddresses = TEST_APP_CONTRACT_ADDRESSES;
  });

  it('shows a wallet-required empty state when disconnected', () => {
    mockAccount = null;
    mockActive = false;

    render(<CstOutreachTransferPage />);

    expect(screen.getByText('Wallet not connected')).toBeInTheDocument();
    expect(screen.queryByTestId('cst-transfer-form')).not.toBeInTheDocument();
  });

  it('shows a config error when the marketing wallet address is unavailable', () => {
    mockContractAddresses = { ...TEST_APP_CONTRACT_ADDRESSES, marketing: '' };

    render(<CstOutreachTransferPage />);

    expect(screen.getByText('Marketing wallet unavailable')).toBeInTheDocument();
    expect(screen.queryByTestId('cst-transfer-form')).not.toBeInTheDocument();
  });

  it('restricts access when a different wallet is connected', () => {
    mockAccount = OTHER_ACCOUNT;

    render(<CstOutreachTransferPage />);

    expect(screen.getByText('Access restricted')).toBeInTheDocument();
    expect(screen.getByText(/configured marketing wallet or multisig/i)).toBeInTheDocument();
    expect(screen.queryByTestId('cst-transfer-form')).not.toBeInTheDocument();
  });

  it('renders the transfer form for the marketing wallet signer', () => {
    render(<CstOutreachTransferPage />);

    const form = screen.getByTestId('cst-transfer-form');
    expect(form).toHaveAttribute('data-source', TEST_MARKETING_WALLET);
    expect(form).toHaveAttribute('data-history', `/cosmic-token-transfer/${TEST_MARKETING_WALLET}`);
  });

  it('accepts the marketing wallet match case-insensitively', () => {
    mockAccount = TEST_MARKETING_WALLET.toUpperCase();

    render(<CstOutreachTransferPage />);

    expect(screen.getByTestId('cst-transfer-form')).toBeInTheDocument();
  });
});
