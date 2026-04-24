import { checkA11y, render, screen } from '@/test-utils';

import StakingActionDetailPage from '../[IsRwalk]/[actionId]/StakingActionDetailPage';

const mockUseStakingRWLKActionsInfo = jest.fn();
const mockUseStakingCSTActionsInfo = jest.fn();

jest.mock('../../../hooks/useApiQuery', () => ({
  useStakingRWLKActionsInfo: (...args: unknown[]) => mockUseStakingRWLKActionsInfo(...args),
  useStakingCSTActionsInfo: (...args: unknown[]) => mockUseStakingCSTActionsInfo(...args),
}));

jest.mock('../../../utils', () => ({
  getExplorerUrl: (type: string, hash: string) => `https://explorer/${type}/${hash}`,
  getAssetsUrl: (path: string) => `/assets/${path}`,
  getRWLKImageUrl: (id: string) => `/rwlk/${id}.png`,
  convertTimestampToDateTime: (ts: number) => `date-${ts}`,
}));

jest.mock('../../../components/nft/NFTImage', () => ({
  __esModule: true,
  default: ({ src, alt = 'NFT' }: { src: string; alt?: string }) => (
    <img data-testid="nft-image" src={src} alt={alt} />
  ),
}));

beforeEach(() => jest.clearAllMocks());

const noData = { data: null, isLoading: false, error: null };

const stakeData = {
  Stake: {
    TokenId: 10,
    Seed: 'abc123',
    StakerAddr: '0xStaker',
    TxHash: '0xStakeTx',
    TimeStamp: 2000,
    NumStakedNFTs: 3,
  },
  Unstake: {
    EvtLogId: 0,
    TxHash: '',
    TimeStamp: 0,
    NumStakedNFTs: 0,
  },
};

describe('StakingActionDetailPage', () => {
  it('renders RWLK heading when IsRwalk=1', () => {
    mockUseStakingRWLKActionsInfo.mockReturnValue(noData);
    mockUseStakingCSTActionsInfo.mockReturnValue(noData);
    render(<StakingActionDetailPage IsRwalk={1} actionId={5} />);
    expect(screen.getByText('Anchor Action for RandomWalk Token')).toBeInTheDocument();
  });

  it('renders CST heading when IsRwalk=0', () => {
    mockUseStakingRWLKActionsInfo.mockReturnValue(noData);
    mockUseStakingCSTActionsInfo.mockReturnValue(noData);
    render(<StakingActionDetailPage IsRwalk={0} actionId={5} />);
    expect(screen.getByText('Anchor Action for Cosmic Signature Token')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockUseStakingRWLKActionsInfo.mockReturnValue(noData);
    mockUseStakingCSTActionsInfo.mockReturnValue({ data: null, isLoading: true, error: null });
    render(<StakingActionDetailPage IsRwalk={0} actionId={5} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows error state', () => {
    mockUseStakingRWLKActionsInfo.mockReturnValue(noData);
    mockUseStakingCSTActionsInfo.mockReturnValue({
      data: null,
      isLoading: false,
      error: { message: 'Fetch failed' },
    });
    render(<StakingActionDetailPage IsRwalk={0} actionId={5} />);
    expect(screen.getByText('Fetch failed')).toBeInTheDocument();
  });

  it('shows "no data" when actionInfo is null', () => {
    mockUseStakingRWLKActionsInfo.mockReturnValue(noData);
    mockUseStakingCSTActionsInfo.mockReturnValue(noData);
    render(<StakingActionDetailPage IsRwalk={0} actionId={5} />);
    expect(screen.getByText('No data found for this anchor action.')).toBeInTheDocument();
  });

  it('renders stake info when data is available (CST)', () => {
    mockUseStakingRWLKActionsInfo.mockReturnValue(noData);
    mockUseStakingCSTActionsInfo.mockReturnValue({
      data: stakeData,
      isLoading: false,
      error: null,
    });
    render(<StakingActionDetailPage IsRwalk={0} actionId={5} />);
    expect(screen.getByText('Anchor')).toBeInTheDocument();
    expect(screen.getByText('0xStaker')).toBeInTheDocument();
  });

  it('uses RWLK hook when IsRwalk=1', () => {
    mockUseStakingRWLKActionsInfo.mockReturnValue({
      data: stakeData,
      isLoading: false,
      error: null,
    });
    mockUseStakingCSTActionsInfo.mockReturnValue(noData);
    render(<StakingActionDetailPage IsRwalk={1} actionId={7} />);
    expect(mockUseStakingRWLKActionsInfo).toHaveBeenCalledWith(7);
    expect(mockUseStakingCSTActionsInfo).toHaveBeenCalledWith(null);
  });

  it('uses CST hook when IsRwalk=0', () => {
    mockUseStakingRWLKActionsInfo.mockReturnValue(noData);
    mockUseStakingCSTActionsInfo.mockReturnValue(noData);
    render(<StakingActionDetailPage IsRwalk={0} actionId={7} />);
    expect(mockUseStakingRWLKActionsInfo).toHaveBeenCalledWith(null);
    expect(mockUseStakingCSTActionsInfo).toHaveBeenCalledWith(7);
  });

  it('has no accessibility violations', async () => {
    mockUseStakingRWLKActionsInfo.mockReturnValue(noData);
    mockUseStakingCSTActionsInfo.mockReturnValue(noData);
    const { container } = render(<StakingActionDetailPage IsRwalk={0} actionId={5} />);
    await checkA11y(container);
  });
});
