import { checkA11y, render, screen } from '@/test-utils';

import MyStatistics from '../MyStatistics';

const mockUseActiveWeb3React = jest.fn();

jest.mock('../../../../../hooks/web3', () => ({
  useActiveWeb3React: () => mockUseActiveWeb3React(),
}));

jest.mock('../../../../../components/UserStatisticsView', () => ({
  __esModule: true,
  default: ({ address, isOwnProfile }: { address: string | null; isOwnProfile: boolean }) => (
    <div data-testid="user-stats">
      address={String(address)} own={String(isOwnProfile)}
    </div>
  ),
}));

beforeEach(() => jest.clearAllMocks());

describe('MyStatistics', () => {
  it('passes account address to UserStatisticsView', () => {
    mockUseActiveWeb3React.mockReturnValue({ account: '0xDEADBEEF' });
    render(<MyStatistics />);
    expect(screen.getByTestId('user-stats')).toHaveTextContent('address=0xDEADBEEF');
  });

  it('asks to connect instead of reporting "no activity" when no wallet is connected', () => {
    mockUseActiveWeb3React.mockReturnValue({ account: undefined });
    render(<MyStatistics />);
    expect(screen.queryByTestId('user-stats')).not.toBeInTheDocument();
    expect(screen.getByText('myPages.statistics.page.ownTitle')).toBeInTheDocument();
    expect(screen.getByText('wallet.required.statistics.title')).toBeInTheDocument();
    expect(screen.getByTestId('connect-wallet-button')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /wallet\.required\.statistics\.publicLink/ }),
    ).toHaveAttribute('href', '/statistics/participation');
  });

  it('has no accessibility violations while disconnected', async () => {
    mockUseActiveWeb3React.mockReturnValue({ account: undefined });
    const { container } = render(<MyStatistics />);
    await checkA11y(container);
  });

  it('passes isOwnProfile=true to UserStatisticsView', () => {
    mockUseActiveWeb3React.mockReturnValue({ account: '0xDEADBEEF' });
    render(<MyStatistics />);
    expect(screen.getByTestId('user-stats')).toHaveTextContent('own=true');
  });

  it('has no accessibility violations', async () => {
    mockUseActiveWeb3React.mockReturnValue({ account: '0xDEADBEEF' });
    const { container } = render(<MyStatistics />);
    await checkA11y(container);
  });
});
