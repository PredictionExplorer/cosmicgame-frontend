import userEvent from '@testing-library/user-event';

import { checkA11y, render, screen } from '@/test-utils';

import AnchorActionDetailPage from '../[IsRwalk]/[actionId]/AnchorActionDetailPage';

const mockRwlk = jest.fn();
const mockCst = jest.fn();
const mockCstInfo = jest.fn();

jest.mock('@/hooks/useApiQuery', () => ({
  useRWLKAnchorActionInfo: (id: number | null) => mockRwlk(id),
  useCSTAnchorActionInfo: (id: number | null) => mockCst(id),
  useCSTInfo: (id: number | null) => mockCstInfo(id),
}));

const HOLDER = '0xA169574D0d353E3010997A3E64846b7D1B2a63B6';
const idle = { data: undefined, isLoading: false, error: null, refetch: jest.fn() };

const anchor = {
  EvtLogId: 18890,
  TxHash: '0xanchor',
  TimeStamp: 1_781_506_867,
  ActionId: 1,
  ActionType: 0,
  TokenId: 9,
  NumStakedNFTs: 33,
  StakerAddr: HOLDER,
};
const noRelease = { EvtLogId: 0, TxHash: '', TimeStamp: 0, NumStakedNFTs: 0 };

beforeEach(() => {
  jest.clearAllMocks();
  mockRwlk.mockReturnValue(idle);
  mockCst.mockReturnValue(idle);
  mockCstInfo.mockReturnValue({
    data: { TokenId: 9, Seed: 'abc', TokenName: '', RoundNum: 1 },
    isLoading: false,
  });
});

describe('AnchorActionDetailPage', () => {
  it('reads the record of the collection in the route', () => {
    render(<AnchorActionDetailPage IsRwalk={1} actionId={33} />);
    expect(mockRwlk).toHaveBeenCalledWith(33);
    expect(mockCst).toHaveBeenCalledWith(null);
  });

  it('says its status right under the title, and records the holder and the transaction', () => {
    mockCst.mockReturnValue({ ...idle, data: { Stake: anchor, Unstake: noRelease } });
    render(<AnchorActionDetailPage IsRwalk={0} actionId={1} />);
    // One line under the H1, no lede repeating the title in words.
    expect(
      screen.getByTestId('anchor-status').closest('[data-slot="page-header-identity"]'),
    ).not.toBeNull();
    expect(screen.getByText('anchoring.anchorActionDetail.record.transaction')).toBeInTheDocument();
    expect(document.querySelector('a[href*="0xanchor"]')).toHaveAttribute('target', '_blank');
    // The plate's wall label names the token: the record does not repeat it.
    expect(screen.queryByText('anchoring.anchorActionDetail.record.token')).toBeNull();
  });

  it('shows the NFT, its anchor-holder, a status and a timeline for a record', () => {
    mockCst.mockReturnValue({ ...idle, data: { Stake: anchor, Unstake: noRelease } });
    render(<AnchorActionDetailPage IsRwalk={0} actionId={1} />);
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'anchoring.anchorActionDetail.title(id=1)',
      }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('anchor-status')).toHaveTextContent('anchoring.status.anchored');
    expect(screen.getByTestId('art-frame')).toBeInTheDocument();
    // The shared wall label: "Signature #000009", the number in the identifier face.
    expect(screen.getByRole('figure')).toHaveTextContent('common.signature.untitled(id=#000009)');
    expect(document.querySelector(`a[href="/user/${HOLDER}"]`)).toBeInTheDocument();
    expect(
      screen.getByText('anchoring.anchorActionDetail.timeline.stillAnchored'),
    ).toBeInTheDocument();
  });

  it('leads on to the NFT’s distributions, the artwork and every anchor action', () => {
    mockCst.mockReturnValue({ ...idle, data: { Stake: anchor, Unstake: noRelease } });
    render(<AnchorActionDetailPage IsRwalk={0} actionId={1} />);
    expect(
      screen.getByRole('link', { name: 'anchoring.anchorActionDetail.next.distributions' }),
    ).toHaveAttribute('href', `/distributions-by-token/${HOLDER}/9`);
    expect(
      screen.getByRole('link', { name: 'anchoring.anchorActionDetail.next.token' }),
    ).toHaveAttribute('href', '/detail/9');
    expect(
      screen.getByRole('link', { name: 'anchoring.anchorActionDetail.next.allActions' }),
    ).toHaveAttribute('href', '/statistics/anchoring');
  });

  it('marks a released anchor and shows the release', () => {
    mockCst.mockReturnValue({
      ...idle,
      data: {
        Stake: anchor,
        Unstake: { ...anchor, EvtLogId: 20000, TxHash: '0xrelease', RewardAmountEth: 0.1562 },
      },
    });
    render(<AnchorActionDetailPage IsRwalk={0} actionId={1} />);
    expect(screen.getByTestId('anchor-status')).toHaveTextContent('anchoring.status.released');
    expect(screen.getByText('anchoring.anchorActionDetail.timeline.released')).toBeInTheDocument();
  });

  it('offers no distributions link for a Random Walk anchor, which receives no ETH', () => {
    mockRwlk.mockReturnValue({
      ...idle,
      data: { Stake: { ...anchor, TokenId: 1826 }, Unstake: noRelease },
    });
    render(<AnchorActionDetailPage IsRwalk={1} actionId={33} />);
    expect(
      screen.queryByRole('link', { name: 'anchoring.anchorActionDetail.next.distributions' }),
    ).not.toBeInTheDocument();
    expect(mockCstInfo).toHaveBeenCalledWith(null);
  });

  it('holds the page shape while loading', () => {
    mockCst.mockReturnValue({ ...idle, isLoading: true });
    render(<AnchorActionDetailPage IsRwalk={0} actionId={1} />);
    expect(screen.getByRole('status', { name: 'common.status.loading' })).toBeInTheDocument();
  });

  it('turns a missing record into next steps instead of a dead end', () => {
    render(<AnchorActionDetailPage IsRwalk={0} actionId={23} />);
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'anchoring.anchorActionDetail.empty.title(id=23)',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'anchoring.anchorActionDetail.empty.browse' }),
    ).toHaveAttribute('href', '/anchoring');
    expect(
      screen.getByRole('link', { name: 'anchoring.anchorActionDetail.empty.statistics' }),
    ).toHaveAttribute('href', '/statistics/anchoring');
  });

  it('shows a translated error with a retry instead of the raw failure', async () => {
    const user = userEvent.setup();
    const refetch = jest.fn();
    mockCst.mockReturnValue({ ...idle, error: new Error('HTTP 500 Internal'), refetch });
    render(<AnchorActionDetailPage IsRwalk={0} actionId={1} />);
    expect(screen.getByText('anchoring.anchorActionDetail.error')).toBeInTheDocument();
    expect(screen.queryByText(/HTTP 500/)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /try again/i }));
    expect(refetch).toHaveBeenCalled();
  });

  it('has no accessibility violations', async () => {
    mockCst.mockReturnValue({ ...idle, data: { Stake: anchor, Unstake: noRelease } });
    const { container } = render(<AnchorActionDetailPage IsRwalk={0} actionId={1} />);
    await checkA11y(container);
  });
});
