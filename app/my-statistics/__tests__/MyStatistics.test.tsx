import { render, screen } from '@/test-utils';

import MyStatistics from '../MyStatistics';

const mockUseActiveWeb3React = jest.fn();

jest.mock('../../../hooks/web3', () => ({
  useActiveWeb3React: () => mockUseActiveWeb3React(),
}));

jest.mock('../../../components/UserStatisticsView', () => ({
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

  it('passes null when no account connected', () => {
    mockUseActiveWeb3React.mockReturnValue({ account: undefined });
    render(<MyStatistics />);
    expect(screen.getByTestId('user-stats')).toHaveTextContent('address=null');
  });

  it('passes isOwnProfile=true to UserStatisticsView', () => {
    mockUseActiveWeb3React.mockReturnValue({ account: '0xDEADBEEF' });
    render(<MyStatistics />);
    expect(screen.getByTestId('user-stats')).toHaveTextContent('own=true');
  });
});
