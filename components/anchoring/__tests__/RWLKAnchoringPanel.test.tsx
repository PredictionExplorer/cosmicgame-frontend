import type { TxStage } from '@/lib/txStage';
import type { AnchoredTokenInfo } from '@/services/api';

import { render, screen } from '@/test-utils';

import type { AnchorTokenGridProps } from '../AnchorTokenGrid';
import { RWLKAnchoringPanel, RWLK_GRIDS } from '../RWLKAnchoringPanel';

const grids: Record<string, AnchorTokenGridProps> = {};
jest.mock('../AnchorTokenGrid', () => ({
  AnchorTokenGrid: (props: AnchorTokenGridProps) => {
    grids[props.id] = props;
    return <section data-testid={props.id}>{props.title}</section>;
  },
}));
jest.mock('../RwalkAnchorDistributionImprintsTable', () => ({
  RwalkAnchorDistributionImprintsTable: ({
    showRecipient,
    emptyTitle,
  }: {
    showRecipient?: boolean;
    emptyTitle?: string;
  }) => (
    <div data-testid="imprints">
      {String(showRecipient)} {emptyTitle}
    </div>
  ),
}));
jest.mock('../AnchorActionsTable', () => ({
  __esModule: true,
  default: ({ IsRwalk }: { IsRwalk: boolean }) => (
    <div data-testid="history">{String(IsRwalk)}</div>
  ),
}));

const IDLE: TxStage = { status: 'idle' };

const anchored = (tokenId: number, actionId: number, at: number): AnchoredTokenInfo => ({
  StakeActionId: actionId,
  StakedTokenId: tokenId,
  StakeTimeStamp: at,
});

function renderPanel(overrides: Partial<Parameters<typeof RWLKAnchoringPanel>[0]> = {}) {
  const props = {
    anchoredTokens: [anchored(1826, 33, 2000), anchored(4068, 27, 1000)],
    availableTokenIds: [12, 99],
    imprints: [],
    actions: [],
    onAnchor: jest.fn(),
    onRelease: jest.fn(),
    stageFor: () => IDLE,
    walletBusy: false,
    ...overrides,
  };
  render(<RWLKAnchoringPanel {...props} />);
  return props;
}

describe('RWLKAnchoringPanel', () => {
  it('lists anchored Random Walk NFTs oldest first, released by their anchor action', () => {
    renderPanel();
    const grid = grids[RWLK_GRIDS.anchored]!;
    expect(grid.collection).toBe('randomWalk');
    expect(grid.mode).toBe('release');
    expect(grid.items.map((item) => [item.key, item.tokenId])).toEqual([
      [27, 4068],
      [33, 1826],
    ]);
  });

  it('offers the wallet’s never-anchored Random Walk NFTs by token id', () => {
    const props = renderPanel();
    const grid = grids[RWLK_GRIDS.available]!;
    expect(grid.items.map((item) => item.key)).toEqual([12, 99]);
    expect(grid.onCommit).toBe(props.onAnchor);
    expect(grid.loading).toBe(false);
  });

  it('keeps the available grid loading until the wallet’s NFTs are read', () => {
    renderPanel({ availableTokenIds: null });
    expect(grids[RWLK_GRIDS.available]!.loading).toBe(true);
  });

  it('shows this wallet’s Stellar Selection imprints without a recipient column', () => {
    renderPanel();
    expect(
      screen.getByRole('heading', { name: 'anchoring.panels.randomWalk.selection' }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('imprints')).toHaveTextContent(
      'false anchoring.panels.randomWalk.selectionEmpty',
    );
    expect(screen.getByTestId('history')).toHaveTextContent('true');
  });
});
