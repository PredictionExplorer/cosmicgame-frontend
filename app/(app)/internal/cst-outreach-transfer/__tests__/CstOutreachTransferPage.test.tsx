import {
  TEST_APP_CONTRACT_ADDRESSES,
  TEST_MARKETING_WALLET,
} from '@/test-utils/contractAddressesFixture';

import { render, screen } from '@/test-utils';

import CstOutreachTransferPage from '../CstOutreachTransferPage';

const OTHER_ACCOUNT = '0x1111111111111111111111111111111111111111';
const OWNER = '0x2222222222222222222222222222222222222222';
const TREASURER = '0x3333333333333333333333333333333333333333';

const mockReadContract = jest.fn();
const mockReportError = jest.fn();

let mockAccount: string | null = TREASURER;
let mockActive = true;
let mockContractAddresses = TEST_APP_CONTRACT_ADDRESSES;

jest.mock('wagmi', () => ({
  usePublicClient: () => ({
    readContract: (...args: unknown[]) => mockReadContract(...args),
  }),
}));

jest.mock('../../../../../hooks/web3', () => ({
  useActiveWeb3React: () => ({
    account: mockAccount,
    active: mockActive,
  }),
}));

jest.mock('../../../../../contexts/ContractAddressesContext', () => ({
  useContractAddresses: () => mockContractAddresses,
}));

jest.mock('../../../../../utils/errors', () => {
  const actual = jest.requireActual('../../../../../utils/errors');
  return {
    ...actual,
    reportError: (...args: unknown[]) => mockReportError(...args),
  };
});

jest.mock('../../../../../components/tokens/MarketingCstRewardForm', () => ({
  MarketingCstRewardForm: ({
    marketingWalletAddress,
    ownerAddress,
    treasurerAddress,
    historyHref,
  }: {
    marketingWalletAddress: string;
    ownerAddress: string;
    treasurerAddress: string;
    historyHref: string;
  }) => (
    <div
      data-testid="marketing-cst-reward-form"
      data-source={marketingWalletAddress}
      data-owner={ownerAddress}
      data-treasurer={treasurerAddress}
      data-history={historyHref}
    >
      Marketing transfer form
    </div>
  ),
}));

function setupRoleReads(owner = OWNER, treasurer = TREASURER) {
  mockReadContract.mockImplementation(({ functionName }: { functionName: string }) => {
    if (functionName === 'owner') return Promise.resolve(owner);
    if (functionName === 'treasurerAddress') return Promise.resolve(treasurer);
    return Promise.resolve(null);
  });
}

describe('CstOutreachTransferPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAccount = TREASURER;
    mockActive = true;
    mockContractAddresses = TEST_APP_CONTRACT_ADDRESSES;
    setupRoleReads();
  });

  it('shows a wallet-required empty state when disconnected', () => {
    mockAccount = null;
    mockActive = false;

    render(<CstOutreachTransferPage />);

    expect(screen.getByText('Wallet not connected')).toBeInTheDocument();
    expect(screen.queryByTestId('marketing-cst-reward-form')).not.toBeInTheDocument();
  });

  it('shows a config error when the marketing wallet address is unavailable', () => {
    mockContractAddresses = { ...TEST_APP_CONTRACT_ADDRESSES, marketing: '' };

    render(<CstOutreachTransferPage />);

    expect(screen.getByText('Marketing wallet unavailable')).toBeInTheDocument();
    expect(screen.queryByTestId('marketing-cst-reward-form')).not.toBeInTheDocument();
  });

  it('shows a loading state while reading owner and treasurer', async () => {
    mockReadContract.mockReturnValue(new Promise(() => {}));

    render(<CstOutreachTransferPage />);

    expect(await screen.findByText('Loading outreach reserve roles')).toBeInTheDocument();
    expect(screen.queryByTestId('marketing-cst-reward-form')).not.toBeInTheDocument();
  });

  it('shows an error state when owner or treasurer reads fail', async () => {
    const err = new Error('role read failed');
    mockReadContract.mockRejectedValue(err);

    render(<CstOutreachTransferPage />);

    expect(await screen.findByText('Unable to read outreach reserve roles')).toBeInTheDocument();
    expect(mockReportError).toHaveBeenCalledWith(err, 'MarketingWallet role read');
    expect(screen.queryByTestId('marketing-cst-reward-form')).not.toBeInTheDocument();
  });

  it('restricts access when a non-treasurer wallet is connected', async () => {
    mockAccount = OTHER_ACCOUNT;

    render(<CstOutreachTransferPage />);

    expect(await screen.findByText('Access restricted')).toBeInTheDocument();
    expect(screen.getByText(/current outreach reserve treasurer/i)).toBeInTheDocument();
    expect(screen.queryByTestId('marketing-cst-reward-form')).not.toBeInTheDocument();
  });

  it('restricts the owner when owner is not the current treasurer', async () => {
    mockAccount = OWNER;
    setupRoleReads(OWNER, TREASURER);

    render(<CstOutreachTransferPage />);

    expect(await screen.findByText('Access restricted')).toBeInTheDocument();
    expect(screen.queryByTestId('marketing-cst-reward-form')).not.toBeInTheDocument();
  });

  it('renders the reward form for the current treasurer', async () => {
    render(<CstOutreachTransferPage />);

    const form = await screen.findByTestId('marketing-cst-reward-form');
    expect(form).toHaveAttribute('data-source', TEST_MARKETING_WALLET);
    expect(form).toHaveAttribute('data-owner', OWNER);
    expect(form).toHaveAttribute('data-treasurer', TREASURER);
    expect(form).toHaveAttribute('data-history', `/cosmic-token-transfer/${TEST_MARKETING_WALLET}`);
  });

  it('accepts the treasurer match case-insensitively', async () => {
    mockAccount = TREASURER.toUpperCase();

    render(<CstOutreachTransferPage />);

    expect(await screen.findByTestId('marketing-cst-reward-form')).toBeInTheDocument();
  });
});
