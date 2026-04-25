import { render, screen, checkA11y } from '@/test-utils';

import { RWLKAnchoringPanel, type RWLKAnchoringPanelProps } from '../RWLKAnchoringPanel';

jest.mock('../AnchorActionsTable', () => ({
  __esModule: true,
  default: ({ IsRwalk }: { IsRwalk: boolean }) => (
    <div data-testid="anchor-actions-table">IsRwalk={String(IsRwalk)}</div>
  ),
}));
jest.mock('../RwalkAnchorDistributionImprintsTable', () => ({
  RwalkAnchorDistributionImprintsTable: () => <div data-testid="rwlk-mints-table" />,
}));
jest.mock('../AnchoredTokensTable', () => ({
  AnchoredTokensTable: ({ IsRwalk }: { IsRwalk: boolean }) => (
    <div data-testid="staked-tokens-table">IsRwalk={String(IsRwalk)}</div>
  ),
}));
jest.mock('../../tokens/RWLKNFTTable', () => ({
  RWLKNFTTable: ({ ownerAddress }: { ownerAddress: string }) => (
    <div data-testid="rwlk-nft-table">owner={ownerAddress}</div>
  ),
}));

const noop = async () => {};

const defaultProps: RWLKAnchoringPanelProps = {
  account: '0xUser',
  stakingActions: [],
  rwlkImprints: [],
  userTokens: [],
  anchoredTokens: [],
  handleStake: noop,
  handleStakeMany: noop,
  handleUnstake: noop,
  handleUnstakeMany: noop,
};

describe('RWLKAnchoringPanel', () => {
  it('renders all four section headers', () => {
    render(<RWLKAnchoringPanel {...defaultProps} />);
    expect(screen.getByText('Anchored Tokens')).toBeInTheDocument();
    expect(screen.getByText('Available for Anchoring')).toBeInTheDocument();
    expect(screen.getByText('Anchor Allocation Tokens')).toBeInTheDocument();
    expect(screen.getByText('Anchor / Release History')).toBeInTheDocument();
  });

  it('renders Anchored Tokens section first', () => {
    render(<RWLKAnchoringPanel {...defaultProps} />);
    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings[0]).toHaveTextContent('Anchored Tokens');
  });

  it('renders Available for Anchoring section second', () => {
    render(<RWLKAnchoringPanel {...defaultProps} />);
    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings[1]).toHaveTextContent('Available for Anchoring');
  });

  it('renders Anchor Allocation Tokens section third', () => {
    render(<RWLKAnchoringPanel {...defaultProps} />);
    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings[2]).toHaveTextContent('Anchor Allocation Tokens');
  });

  it('renders Anchor / Release History section last', () => {
    render(<RWLKAnchoringPanel {...defaultProps} />);
    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings[3]).toHaveTextContent('Anchor / Release History');
  });

  it('passes account to RWLKNFTTable as ownerAddress', () => {
    render(<RWLKAnchoringPanel {...defaultProps} account="0xDEF" />);
    expect(screen.getByTestId('rwlk-nft-table')).toHaveTextContent('owner=0xDEF');
  });

  it('sets IsRwalk=true on child tables', () => {
    render(<RWLKAnchoringPanel {...defaultProps} />);
    expect(screen.getByTestId('anchor-actions-table')).toHaveTextContent('IsRwalk=true');
    expect(screen.getByTestId('staked-tokens-table')).toHaveTextContent('IsRwalk=true');
  });

  it('renders RwalkAnchorDistributionImprintsTable', () => {
    render(<RWLKAnchoringPanel {...defaultProps} />);
    expect(screen.getByTestId('rwlk-mints-table')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<RWLKAnchoringPanel {...defaultProps} />);
    await checkA11y(container);
  });
});
