import { render, screen, checkA11y } from '@/test-utils';

import { CSTAnchoringPanel, type CSTAnchoringPanelProps } from '../CSTAnchoringPanel';

jest.mock('../AnchorActionsTable', () => ({
  __esModule: true,
  default: ({ IsRwalk }: { IsRwalk: boolean }) => (
    <div data-testid="anchor-actions-table">IsRwalk={String(IsRwalk)}</div>
  ),
}));
jest.mock('../AnchorDistributionsTable', () => ({
  AnchorDistributionsTable: ({ address }: { address: string }) => (
    <div data-testid="anchor-distributions-table">address={address}</div>
  ),
}));
jest.mock('../AnchoredTokensTable', () => ({
  AnchoredTokensTable: ({ IsRwalk }: { IsRwalk: boolean }) => (
    <div data-testid="staked-tokens-table">IsRwalk={String(IsRwalk)}</div>
  ),
}));
jest.mock('../../tokens/CSTokensTable', () => ({
  CSTokensTable: () => <div data-testid="cs-tokens-table" />,
}));

const noop = async () => {};

const defaultProps: CSTAnchoringPanelProps = {
  account: '0xUser',
  stakingActions: [],
  userTokens: [],
  anchoredTokens: [],
  anchorDistributions: [],
  handleStake: noop,
  handleStakeMany: noop,
  handleUnstake: noop,
  handleUnstakeMany: noop,
};

describe('CSTAnchoringPanel', () => {
  it('renders all four section headers', () => {
    render(<CSTAnchoringPanel {...defaultProps} />);
    expect(screen.getByText('Anchored Tokens')).toBeInTheDocument();
    expect(screen.getByText('Available for Anchoring')).toBeInTheDocument();
    expect(screen.getByText('Anchor Distributions')).toBeInTheDocument();
    expect(screen.getByText('Anchor / Release History')).toBeInTheDocument();
  });

  it('renders Anchored Tokens section first', () => {
    render(<CSTAnchoringPanel {...defaultProps} />);
    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings[0]).toHaveTextContent('Anchored Tokens');
  });

  it('renders Available for Anchoring section second', () => {
    render(<CSTAnchoringPanel {...defaultProps} />);
    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings[1]).toHaveTextContent('Available for Anchoring');
  });

  it('renders Anchor Distributions section third', () => {
    render(<CSTAnchoringPanel {...defaultProps} />);
    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings[2]).toHaveTextContent('Anchor Distributions');
  });

  it('renders Anchor / Release History section last', () => {
    render(<CSTAnchoringPanel {...defaultProps} />);
    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings[3]).toHaveTextContent('Anchor / Release History');
  });

  it('passes account to AnchorDistributionsTable', () => {
    render(<CSTAnchoringPanel {...defaultProps} account="0xABC" />);
    expect(screen.getByTestId('anchor-distributions-table')).toHaveTextContent('address=0xABC');
  });

  it('sets IsRwalk=false on child tables', () => {
    render(<CSTAnchoringPanel {...defaultProps} />);
    expect(screen.getByTestId('anchor-actions-table')).toHaveTextContent('IsRwalk=false');
    expect(screen.getByTestId('staked-tokens-table')).toHaveTextContent('IsRwalk=false');
  });

  it('renders CSTokensTable', () => {
    render(<CSTAnchoringPanel {...defaultProps} />);
    expect(screen.getByTestId('cs-tokens-table')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<CSTAnchoringPanel {...defaultProps} />);
    await checkA11y(container);
  });
});
