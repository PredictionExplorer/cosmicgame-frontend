import type { ReactNode } from 'react';

import type { TxStage } from '@/lib/txStage';
import type { AnchoredTokenInfo, CSTTokenInfo } from '@/services/api';

import { render, screen } from '@/test-utils';

import { sumAccruedEth, type AnchorGridItem, type AnchorTokenGridProps } from '../AnchorTokenGrid';
import { CSTAnchoringPanel, CST_GRIDS } from '../CSTAnchoringPanel';

const grids: Record<string, AnchorTokenGridProps> = {};
jest.mock('../AnchorTokenGrid', () => ({
  ...jest.requireActual('../AnchorTokenGrid'),
  AnchorTokenGrid: (props: AnchorTokenGridProps) => {
    grids[props.id] = props;
    return <section data-testid={props.id}>{props.title}</section>;
  },
}));
jest.mock('../AnchorDistributionsTable', () => ({
  AnchorDistributionsTable: ({ address }: { address: string }) => (
    <div data-testid="distributions">{address}</div>
  ),
}));
jest.mock('../AnchorActionsTable', () => ({
  __esModule: true,
  default: ({ list }: { list: unknown[] }) => <div data-testid="history">{list.length}</div>,
}));

const ACCOUNT = '0x1234567890abcdef1234567890abcdef12345678';
const IDLE: TxStage = { status: 'idle' };

const anchored = (tokenId: number, actionId: number, at: number, name = ''): AnchoredTokenInfo =>
  ({
    StakeActionId: actionId,
    StakedTokenId: 0,
    StakeTimeStamp: at,
    TokenInfo: { TokenId: tokenId, Seed: 0xa0 + tokenId, StakeActionId: actionId, TokenName: name },
  }) as AnchoredTokenInfo;

const available = (tokenId: number, round: number): CSTTokenInfo =>
  ({ TokenId: tokenId, Seed: `seed${tokenId}`, RoundNum: round, TokenName: '' }) as CSTTokenInfo;

function renderPanel(overrides: Partial<Parameters<typeof CSTAnchoringPanel>[0]> = {}) {
  const props = {
    account: ACCOUNT,
    anchoredTokens: [anchored(9, 16, 2000, 'Twisted Mind'), anchored(4, 3, 1000)],
    availableTokens: [available(47, 2)],
    anchorDistributions: [{ TokenId: 9, RewardToCollectEth: 0.1562 }],
    actions: [],
    onAnchor: jest.fn(),
    onRelease: jest.fn(),
    stageFor: () => IDLE,
    walletBusy: false,
    ...overrides,
  };
  render(<CSTAnchoringPanel {...props} />);
  return props;
}

const keys = (items: readonly AnchorGridItem[]) => items.map((item) => item.key);

describe('CSTAnchoringPanel', () => {
  it('lists anchored NFTs oldest first, released by their anchor action', () => {
    renderPanel();
    const grid = grids[CST_GRIDS.anchored]!;
    expect(grid.mode).toBe('release');
    expect(keys(grid.items)).toEqual([3, 16]);
    expect(grid.items[1]).toMatchObject({ tokenId: 9, name: 'Twisted Mind', accruedEth: 0.1562 });
  });

  it('releases an anchored NFT with no summary row for 0 ETH', () => {
    // Regression: the summary lists only NFTs that have received a deposit, so
    // an NFT anchored since the last one has no row. Reading that as unknown
    // made the release dialog say "Unavailable" for any selection including it.
    renderPanel();
    const [unpaid, paid] = grids[CST_GRIDS.anchored]!.items;
    expect(unpaid).toMatchObject({ tokenId: 4, accruedEth: 0 });
    expect(unpaid!.detail).toBe('anchoring.picker.accrued(amount=0\u00a0ETH)');
    expect(sumAccruedEth([unpaid!, paid!])).toBeCloseTo(0.1562);
  });

  it('reads accrued ETH as unknown while the summary is unread or failed', () => {
    renderPanel({ anchorDistributions: null });
    for (const item of grids[CST_GRIDS.anchored]!.items) {
      expect(item.accruedEth).toBeNull();
      expect(item.detail).toBeNull();
    }
  });

  it('offers the wallet’s NFTs to anchor by token id, with their cycle', () => {
    renderPanel();
    const grid = grids[CST_GRIDS.available]!;
    expect(grid.mode).toBe('anchor');
    expect(grid.items).toEqual([
      expect.objectContaining({
        key: 47,
        tokenId: 47,
        seed: 'seed47',
        meta: ['anchoring.picker.cycle(cycle=2)'],
      }),
    ]);
  });

  it('wires the grids to their own actions and stages', () => {
    const running: TxStage = { status: 'pending', hash: '0x1' };
    const stageFor = jest.fn((id: string) => (id === CST_GRIDS.anchored ? running : IDLE));
    const props = renderPanel({ stageFor });
    expect(grids[CST_GRIDS.anchored]!.onCommit).toBe(props.onRelease);
    expect(grids[CST_GRIDS.available]!.onCommit).toBe(props.onAnchor);
    expect(grids[CST_GRIDS.anchored]!.stage).toBe(running);
    expect(grids[CST_GRIDS.available]!.stage).toBe(IDLE);
  });

  it('shows the per-NFT distributions and the history under their headings', () => {
    renderPanel();
    expect(
      screen.getByRole('heading', { name: 'anchoring.panels.cosmicSignature.distributions' }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('distributions')).toHaveTextContent(ACCOUNT);
    expect(
      screen.getByRole('heading', { name: 'anchoring.panels.shared.history' }),
    ).toBeInTheDocument();
  });

  it('points an empty wallet at the gallery', () => {
    renderPanel({ availableTokens: [] });
    const action = grids[CST_GRIDS.available]!.emptyAction as ReactNode;
    render(<>{action}</>);
    expect(
      screen.getByRole('link', { name: 'anchoring.panels.cosmicSignature.availableEmpty.action' }),
    ).toHaveAttribute('href', '/gallery');
  });
});
