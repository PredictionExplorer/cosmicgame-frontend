import { render, screen, checkA11y } from '@/test-utils';

import AdminSettingsPage from '../AdminSettingsPage';

const mockUseDashboardInfo = jest.fn().mockReturnValue({
  data: undefined,
  isLoading: false,
  error: null,
});

jest.mock('../../../../hooks/useApiQuery', () => ({
  useDashboardInfo: (...args: unknown[]) => mockUseDashboardInfo(...args),
}));

jest.mock('../../../../components/ui/button', () => ({
  Button: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <button {...props}>{children}</button>
  ),
}));

jest.mock('../../../../components/ui/input', () => ({
  Input: (props: Record<string, unknown>) => <input {...props} />,
}));

jest.mock('../../../../components/ui/select', () => ({
  Select: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  SelectContent: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  SelectItem: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  SelectTrigger: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  SelectValue: () => <span />,
}));

beforeEach(() => jest.clearAllMocks());

describe('AdminSettingsPage', () => {
  it('shows loading state when query is loading', () => {
    mockUseDashboardInfo.mockReturnValue({ data: undefined, isLoading: true, error: null });
    render(<AdminSettingsPage />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows loading when data is not available', () => {
    mockUseDashboardInfo.mockReturnValue({ data: undefined, isLoading: false, error: null });
    render(<AdminSettingsPage />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders settings form with data', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: {
        ContractAddrs: {
          CosmicSignatureAddr: '0xCST',
          CosmicTokenAddr: '0xCT',
          CharityWalletAddr: '0xCharity',
          RandomWalkAddr: '0xRWLK',
          RaffleWalletAddr: '0xRaffle',
          StakingWalletAddr: '0xStaking',
          MarketingWalletAddr: '0xMarketing',
          BusinessLogicAddr: '0xBL',
        },
        NumRaffleEthWinners: 5,
        NumRaffleNFTWinners: 3,
        NumHolderNFTWinners: 2,
        PrizePercentage: 25,
        CharityPercentage: 10,
        RafflePercentage: 15,
        StakingPercentage: 20,
        TimeIncrease: 300,
        PriceIncrease: 10,
        NanosecondsExtra: 5000000,
      },
      isLoading: false,
      error: null,
    });
    render(<AdminSettingsPage />);
    expect(screen.getByText('Cosmic Game Contract')).toBeInTheDocument();
    expect(screen.getByDisplayValue('0xCST')).toBeInTheDocument();
    expect(screen.getByDisplayValue('5')).toBeInTheDocument();
  });

  it('renders the page title', () => {
    mockUseDashboardInfo.mockReturnValue({ data: null, isLoading: false, error: null });
    render(<AdminSettingsPage />);
    expect(screen.getByText('Administrative methods')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    mockUseDashboardInfo.mockReturnValue({ data: [], isLoading: false, error: null });
    const { container } = render(<AdminSettingsPage />);
    await checkA11y(container);
  });
});
