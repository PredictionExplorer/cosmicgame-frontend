import {
  TEST_APP_CONTRACT_ADDRESSES,
  TEST_MARKETING_WALLET,
} from '@/test-utils/contractAddressesFixture';

import { renderWithQuery as render, screen } from '@/test-utils';

import CstOutreachTransferPage from '../CstOutreachTransferPage';

const OTHER_ACCOUNT = '0x1111111111111111111111111111111111111111';
const OWNER = '0x2222222222222222222222222222222222222222';
const TREASURER = '0x3333333333333333333333333333333333333333';

const mockReadContract = jest.fn();
const mockReportError = jest.fn();

let mockAccount: string | null = TREASURER;
let mockActive = true;
let mockContractAddresses = TEST_APP_CONTRACT_ADDRESSES;

// The page reads its roles through React Query: use the real one, not the empty stub.
jest.mock('@tanstack/react-query', () => jest.requireActual('@tanstack/react-query'));

jest.mock('wagmi', () => ({
  useConnection: () => ({ status: 'connected' }),
  usePublicClient: () => ({
    readContract: (...args: unknown[]) => mockReadContract(...args),
  }),
}));

jest.mock('../../../../../../hooks/web3', () => ({
  useActiveWeb3React: () => ({
    account: mockAccount,
    active: mockActive,
  }),
}));

jest.mock('../../../../../../contexts/ContractAddressesContext', () => ({
  useContractAddresses: () => mockContractAddresses,
}));

jest.mock('../../../../../../utils/errors', () => {
  const actual = jest.requireActual('../../../../../../utils/errors');
  return {
    ...actual,
    reportError: (...args: unknown[]) => mockReportError(...args),
  };
});

jest.mock('../../../../../../components/tokens/MarketingCstRewardForm', () => ({
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

  it('asks for the treasurer wallet when none is connected', () => {
    mockAccount = null;
    mockActive = false;

    render(<CstOutreachTransferPage />);

    expect(
      screen.getByRole('heading', { level: 2, name: 'Connect the treasurer wallet to send CST' }),
    ).toBeInTheDocument();
    expect(mockReadContract).not.toHaveBeenCalledWith(
      expect.objectContaining({ functionName: 'payReward' }),
    );
    expect(screen.queryByTestId('marketing-cst-reward-form')).not.toBeInTheDocument();
  });

  it('says so when the Outreach Reserve address is not known yet', () => {
    mockContractAddresses = { ...TEST_APP_CONTRACT_ADDRESSES, marketing: '' };

    render(<CstOutreachTransferPage />);

    expect(screen.getByText('Outreach Reserve address unavailable')).toBeInTheDocument();
    expect(screen.queryByTestId('marketing-cst-reward-form')).not.toBeInTheDocument();
  });

  it('shows placeholder rows while the roles are read', () => {
    mockReadContract.mockReturnValue(new Promise(() => {}));

    render(<CstOutreachTransferPage />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByTestId('marketing-cst-reward-form')).not.toBeInTheDocument();
  });

  it('reports a failed role read and offers a retry', async () => {
    const err = new Error('role read failed');
    mockReadContract.mockRejectedValue(err);

    render(<CstOutreachTransferPage />);

    // One retry first (useOutreachRoleHolders), so allow for its delay.
    expect(
      await screen.findByText('The Outreach Reserve’s roles could not be read', undefined, {
        timeout: 4_000,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
    expect(mockReportError).toHaveBeenCalledWith(err, 'MarketingWallet role read');
    expect(screen.queryByTestId('marketing-cst-reward-form')).not.toBeInTheDocument();
  });

  it('tells any other wallet whose wallet the tool needs', async () => {
    mockAccount = OTHER_ACCOUNT;

    render(<CstOutreachTransferPage />);

    expect(await screen.findByText('This wallet is not the treasurer')).toBeInTheDocument();
    expect(screen.getByText('Treasurer')).toBeInTheDocument();
    expect(screen.getByTitle(TREASURER)).toBeInTheDocument();
    expect(screen.queryByTestId('marketing-cst-reward-form')).not.toBeInTheDocument();
  });

  it('does not let the owner send when the owner is not the treasurer', async () => {
    mockAccount = OWNER;
    setupRoleReads(OWNER, TREASURER);

    render(<CstOutreachTransferPage />);

    expect(await screen.findByText('This wallet is not the treasurer')).toBeInTheDocument();
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
