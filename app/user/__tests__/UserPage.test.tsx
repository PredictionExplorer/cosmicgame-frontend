import { render, screen } from '@/test-utils';

import UserPage from '../[address]/UserPage';

jest.mock('../../../components/UserStatisticsView', () => ({
  __esModule: true,
  default: ({ address, isOwnProfile }: { address: string; isOwnProfile: boolean }) => (
    <div data-testid="user-stats">
      address={address} own={String(isOwnProfile)}
    </div>
  ),
}));

describe('UserPage', () => {
  it('passes address to UserStatisticsView', () => {
    render(<UserPage address="0xABC123" />);
    expect(screen.getByTestId('user-stats')).toHaveTextContent('address=0xABC123');
  });

  it('passes isOwnProfile=false to UserStatisticsView', () => {
    render(<UserPage address="0xABC123" />);
    expect(screen.getByTestId('user-stats')).toHaveTextContent('own=false');
  });
});
