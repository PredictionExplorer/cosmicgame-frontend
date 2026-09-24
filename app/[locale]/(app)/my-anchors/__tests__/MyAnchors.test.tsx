import userEvent from '@testing-library/user-event';

import type { CSTAnchoringPanelProps } from '@/components/anchoring/CSTAnchoringPanel';
import type { RWLKAnchoringPanelProps } from '@/components/anchoring/RWLKAnchoringPanel';
import type { TxStage } from '@/lib/txStage';

import { act, render, screen, waitFor } from '@/test-utils';

import MyAnchors from '../MyAnchors';

const ACCOUNT = '0x1234567890abcdef1234567890abcdef12345678';
let mockAccount: string | null = ACCOUNT;
let mockStage: TxStage = { status: 'idle' };
const mockAnchor = jest.fn();
const mockRelease = jest.fn();
const mockWalletOfOwner = jest.fn();
// The real hook hands out a stable contract and error handler; so does the mock, or the
// wallet read would re-run on every render.
const mockRwalkContract = { read: { walletOfOwner: mockWalletOfOwner } };
const mockHandleError = jest.fn();
const mockQueries: Record<string, { data?: unknown; isLoading: boolean }> = {};

jest.mock('@/hooks/web3', () => ({
  useActiveWeb3React: () => ({ account: mockAccount }),
}));
jest.mock('@/hooks/useAnchorActions', () => ({
  useAnchorActions: () => ({
    anchor: mockAnchor,
    release: mockRelease,
    handleError: mockHandleError,
    rwalkContract: mockRwalkContract,
    txStage: mockStage,
  }),
}));
jest.mock('@/hooks/useApiQuery', () => ({
  useDashboardInfo: () => mockQueries.dashboard,
  useCSTAnchorActionsByUser: () => mockQueries.cstActions,
  useCSTTokensByUser: () => mockQueries.cstTokens,
  useAnchorDistributionsByUser: () => mockQueries.distributions,
  useRWLKAnchorActionsByUser: () => mockQueries.rwlkActions,
  useRWLKAnchorImprintsByUser: () => mockQueries.imprints,
}));
const mockAnchored = {
  cstokens: [{ StakeActionId: 3, StakedTokenId: 0, StakeTimeStamp: 1, TokenInfo: { TokenId: 9 } }],
  rwlktokens: [
    { StakeActionId: 30, StakedTokenId: 1826, StakeTimeStamp: 1 },
    { StakeActionId: 31, StakedTokenId: 1827, StakeTimeStamp: 2 },
  ],
  isLoading: false,
};
jest.mock('@/contexts/AnchoredTokenContext', () => ({
  useAnchoredToken: () => mockAnchored,
}));
jest.mock('@/components/wallet/WalletRequiredState', () => ({
  WalletRequiredState: ({ title }: { title: string }) => (
    <div data-testid="wallet-required">{title}</div>
  ),
}));

let cstProps: CSTAnchoringPanelProps | null = null;
let rwlkProps: RWLKAnchoringPanelProps | null = null;
jest.mock('@/components/anchoring/CSTAnchoringPanel', () => ({
  CST_GRIDS: { anchored: 'cst-anchored', available: 'cst-available' },
  CSTAnchoringPanel: (props: CSTAnchoringPanelProps) => {
    cstProps = props;
    return <div data-testid="cst-panel" />;
  },
}));
jest.mock('@/components/anchoring/RWLKAnchoringPanel', () => ({
  RWLK_GRIDS: { anchored: 'rwlk-anchored', available: 'rwlk-available' },
  RWLKAnchoringPanel: (props: RWLKAnchoringPanelProps) => {
    rwlkProps = props;
    return <div data-testid="rwlk-panel" />;
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockAccount = ACCOUNT;
  mockStage = { status: 'idle' };
  cstProps = null;
  rwlkProps = null;
  mockWalletOfOwner.mockResolvedValue([BigInt(1826), BigInt(1900), BigInt(12)]);
  Object.assign(mockQueries, {
    dashboard: {
      data: {
        StakingAmountEth: 1.9376,
        MainStats: { StakeStatisticsCST: { TotalTokensStaked: 33 } },
      },
      isLoading: false,
    },
    cstActions: { data: [], isLoading: false },
    cstTokens: {
      data: [
        { TokenId: 47, WasUnstaked: false },
        { TokenId: 5, WasUnstaked: true },
      ],
      isLoading: false,
    },
    distributions: {
      data: [
        { TokenId: 9, RewardToCollectEth: 0.5 },
        { TokenId: 4, RewardToCollectEth: 0.25 },
      ],
      isLoading: false,
    },
    rwlkActions: { data: [{ TokenId: 1827, ActionType: 0 }], isLoading: false },
    imprints: { data: [], isLoading: false },
  });
});

describe('MyAnchors', () => {
  it('asks a visitor to connect, with a way to the public anchoring pages', () => {
    mockAccount = null;
    render(<MyAnchors />);
    expect(screen.getByTestId('wallet-required')).toHaveTextContent(
      'wallet.required.anchors.title',
    );
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
  });

  it('puts the anchor-holder’s figures in the header, with the permanence caption', () => {
    const { container } = render(<MyAnchors />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'myPages.anchors.title' }),
    ).toBeInTheDocument();
    expect(screen.getByText('myPages.anchors.stats.unretrieved.label')).toBeInTheDocument();
    expect(screen.getByText('myPages.anchors.stats.unretrieved.caption')).toBeInTheDocument();
    // 0.5 + 0.25 ETH still to retrieve, and 1.9376 / 33 per anchored NFT.
    expect(container).toHaveTextContent('0.7500');
    expect(container).toHaveTextContent('0.0587');
  });

  it('switches collections with short tabs that carry their counts', async () => {
    const user = userEvent.setup();
    render(<MyAnchors />);
    const cst = screen.getByRole('tab', { name: /myPages\.anchors\.tabs\.cosmicSignature/ });
    const rwlk = screen.getByRole('tab', { name: /myPages\.anchors\.tabs\.randomWalk/ });
    expect(cst).toHaveTextContent('1');
    expect(rwlk).toHaveTextContent('2');
    await user.click(rwlk);
    expect(screen.getByTestId('rwlk-panel')).toBeInTheDocument();
  });

  it('offers only NFTs that were never released for anchoring', () => {
    render(<MyAnchors />);
    expect(cstProps?.availableTokens.map((token) => token.TokenId)).toEqual([47]);
    expect(cstProps?.anchoredTokens).toBe(mockAnchored.cstokens);
  });

  it('offers only Random Walk NFTs that were never anchored', async () => {
    const user = userEvent.setup();
    render(<MyAnchors />);
    await user.click(screen.getByRole('tab', { name: /randomWalk/ }));
    await waitFor(() => expect(rwlkProps?.availableTokenIds).toEqual([12, 1900]));
    expect(mockWalletOfOwner).toHaveBeenCalledWith([ACCOUNT]);
  });

  it('routes each grid’s action to the anchoring hook and gives it the stage it started', async () => {
    mockAnchor.mockResolvedValue({ status: 'confirmed' });
    mockRelease.mockResolvedValue({ status: 'confirmed' });
    const { rerender } = render(<MyAnchors />);
    await act(async () => {
      await cstProps!.onRelease([3]);
    });
    expect(mockRelease).toHaveBeenCalledWith([3], false);
    mockStage = { status: 'pending', hash: '0x1' };
    rerender(<MyAnchors />);
    expect(cstProps!.stageFor('cst-anchored')).toBe(mockStage);
    expect(cstProps!.stageFor('cst-available')).toEqual({ status: 'idle' });
    expect(cstProps!.walletBusy).toBe(true);

    await act(async () => {
      await cstProps!.onAnchor([47]);
    });
    expect(mockAnchor).toHaveBeenCalledWith([47], false);
  });
});
