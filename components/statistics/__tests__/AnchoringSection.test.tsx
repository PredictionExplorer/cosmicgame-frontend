import userEvent from '@testing-library/user-event';

import { fireEvent, render, screen, checkA11y, within } from '@/test-utils';

import {
  AnchoringSection,
  type AnchoringDataState,
  type AnchoringSectionProps,
} from '../AnchoringSection';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, prefetch: jest.fn() }),
}));
jest.mock('../../anchoring/GlobalAnchoredTokensTable', () => ({
  GlobalAnchoredTokensTable: ({ IsRWLK }: { IsRWLK: boolean }) => (
    <div data-testid="global-staked-tokens">IsRWLK={String(IsRWLK)}</div>
  ),
}));
jest.mock('../../tables/UniqueAnchorHoldersCSTTable', () => ({
  UniqueAnchorHoldersCSTTable: () => <div data-testid="unique-cst-anchorHolders" />,
}));
jest.mock('../../tables/UniqueAnchorHoldersRWLKTable', () => ({
  UniqueAnchorHoldersRWLKTable: () => <div data-testid="unique-rwlk-anchorHolders" />,
}));
function dataState<T>(data: T[] = [], overrides: Partial<AnchoringDataState<T>> = {}) {
  return { data, isLoading: false, isError: false, onRetry: jest.fn(), ...overrides };
}

const defaultProps: AnchoringSectionProps = {
  cstStats: {
    NumActiveStakers: 10,
    NumDeposits: 5,
    TotalRewardEth: 1.5,
    UnclaimedRewardEth: 0.3,
  },
  rwlkStats: {
    NumActiveStakers: 3,
    TotalTokensMinted: 20,
  },
  cstAnchorActions: dataState(),
  rwlkAnchorActions: dataState(),
  anchoredCSTokens: dataState(),
  anchoredRWLKTokens: dataState(),
  uniqueCSTAnchorHolders: dataState(),
  uniqueRWLKAnchorHolders: dataState(),
};

type AnchorActionRecord = NonNullable<AnchoringSectionProps['cstAnchorActions']['data']>[number];

/** The figure values of a tab's overview row (its first description list). */
function overviewValues(panel: HTMLElement) {
  const row = panel.querySelector('dl')!;
  return within(row)
    .getAllByRole('definition')
    .map((figure) => figure.textContent);
}

const createAnchorAction = (overrides = {}): AnchorActionRecord =>
  ({
    EvtLogId: 1,
    ActionId: 10,
    TimeStamp: 1701346718,
    ActionType: 0,
    TokenId: 42,
    StakerAddr: '0x1234567890abcdef1234567890abcdef12345678',
    NumStakedNFTs: 5,
    ...overrides,
  }) as AnchorActionRecord;

beforeEach(() => jest.clearAllMocks());

describe('AnchoringSection', () => {
  it('shows the Cosmic Signature overview as one figure row, grouped', () => {
    render(<AnchoringSection {...defaultProps} />);
    const panel = screen.getByRole('tabpanel', { name: 'Cosmic Signature NFT' });
    // The anchored counts of both collections lead the page above the tabs.
    expect(overviewValues(panel)).toEqual([
      '10',
      '5',
      expect.stringContaining('1.5'),
      expect.stringContaining('0.3'),
    ]);
  });

  it('shows an unread figure as unavailable, never as 0', () => {
    render(<AnchoringSection {...defaultProps} cstStats={{ NumActiveStakers: 10 }} />);
    const panel = screen.getByRole('tabpanel', { name: 'Cosmic Signature NFT' });
    // Deposits and both amounts were not read: the unknown dash, not a zero.
    expect(overviewValues(panel)).toEqual([
      '10',
      '—common.status.unavailable',
      '—common.status.unavailable',
      '—common.status.unavailable',
    ]);
  });

  it('holds skeletons while the dashboard loads, never confident zeros', () => {
    render(
      <AnchoringSection
        {...defaultProps}
        cstStats={undefined}
        rwlkStats={undefined}
        statsLoading
      />,
    );
    const panel = screen.getByRole('tabpanel', { name: 'Cosmic Signature NFT' });
    for (const value of overviewValues(panel)) expect(value).not.toMatch(/\d|—/);
    expect(panel.querySelector('dl [data-slot="skeleton"]')).not.toBeNull();
  });

  it('shows a dashboard that failed as unavailable figures, not zeros', () => {
    render(<AnchoringSection {...defaultProps} cstStats={null} rwlkStats={null} />);
    const panel = screen.getByRole('tabpanel', { name: 'Cosmic Signature NFT' });
    expect(overviewValues(panel)).toEqual(
      Array.from({ length: 4 }, () => '—common.status.unavailable'),
    );
  });

  it('explains each figure by its own label, the one definition mechanism', () => {
    render(<AnchoringSection {...defaultProps} />);
    const panel = screen.getByRole('tabpanel', { name: 'Cosmic Signature NFT' });
    // No separate Definitions disclosure: each label is its own explained term.
    expect(panel.querySelector('details')).toBeNull();
    const terms = within(panel.querySelector('dl')!).getAllByRole('button', {
      name: /more information about/i,
    });
    expect(terms).toHaveLength(4);
  });

  it('switches collections with a segmented control, not a second underline row', () => {
    render(<AnchoringSection {...defaultProps} />);
    // The Statistics sub-navigation is the page's one underline row.
    expect(screen.getByRole('tablist', { name: 'NFT collection' })).not.toHaveClass('border-b');
    expect(screen.getByRole('tablist', { name: 'NFT collection' })).toHaveClass(
      'bg-surface-sunken',
    );
  });

  it('gives each ledger its own H2 section', () => {
    render(<AnchoringSection {...defaultProps} />);
    const panel = screen.getByRole('tabpanel', { name: 'Cosmic Signature NFT' });
    expect(
      within(panel)
        .getAllByRole('heading', { level: 2 })
        .map((heading) => heading.textContent),
    ).toEqual(['Anchor / release actions', 'Anchored NFTs', 'Unique anchor-holders']);
  });

  it('renders anchor-action table for CST', () => {
    render(
      <AnchoringSection {...defaultProps} cstAnchorActions={dataState([createAnchorAction()])} />,
    );
    expect(
      screen.getAllByRole('link', {
        name: 'anchoring.anchorActionDetail.breadcrumbs.action(id=10)',
      }).length,
    ).toBeGreaterThanOrEqual(1);
  });

  it('shows a loading skeleton while anchor actions load', () => {
    render(
      <AnchoringSection {...defaultProps} cstAnchorActions={dataState([], { isLoading: true })} />,
    );
    const section = screen
      .getByRole('heading', { name: 'Anchor / release actions' })
      .closest('section');
    expect(section).toHaveAttribute('aria-busy', 'true');
  });

  it('shows an error state with retry when anchor actions fail', () => {
    const onRetry = jest.fn();
    render(
      <AnchoringSection
        {...defaultProps}
        cstAnchorActions={dataState([], { isError: true, onRetry })}
      />,
    );
    expect(screen.getByText('This section did not load')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(onRetry).toHaveBeenCalled();
  });

  it('shows an empty state when there are no anchor actions', () => {
    render(<AnchoringSection {...defaultProps} />);
    expect(screen.getAllByText('No anchor actions yet').length).toBeGreaterThan(0);
  });

  it('switches collections with named tabs', async () => {
    const user = userEvent.setup();
    render(<AnchoringSection {...defaultProps} />);
    expect(screen.getByRole('tablist', { name: 'NFT collection' })).toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: 'Random Walk NFT' }));
    const panel = screen.getByRole('tabpanel', { name: 'Random Walk NFT' });
    expect(overviewValues(panel)).toEqual(['3', '20']);
  });

  it('explains imprinted-token anchoring counters', async () => {
    const user = userEvent.setup();
    render(<AnchoringSection {...defaultProps} />);
    await user.click(screen.getByRole('tab', { name: 'Random Walk NFT' }));
    expect(
      screen.getByText(
        'Total Cosmic Signature NFTs and paired CST imprinted for Random Walk NFT anchor-holders through Anchored-NFT Stellar Selection.',
      ),
    ).toBeInTheDocument();
  });

  it('explains the ledgers once each, beside their titles', () => {
    render(<AnchoringSection {...defaultProps} />);
    expect(
      screen.getByRole('button', { name: /more information about anchor \/ release actions/i }),
    ).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<AnchoringSection {...defaultProps} />);
    await checkA11y(container);
  });
});
