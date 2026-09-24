import type { AnchoringFlowProps } from '@/components/anchoring/AnchoringFlow';
import { AnchoringQuestions } from '@/components/anchoring/AnchoringQuestions';
import { AnchoringSteps } from '@/components/anchoring/AnchoringSteps';

import { checkA11y, render, screen } from '@/test-utils';

import AnchoringPage from '../AnchoringPage';

const mockQueries: Record<string, unknown> = {};
jest.mock('@/hooks/useApiQuery', () => ({
  useCSTAnchorDistributions: () => mockQueries.distributions,
  useGlobalRWLKAnchorImprints: () => mockQueries.imprints,
  useDashboardInfo: () => mockQueries.dashboard,
  useUniqueCSTAnchorHolders: () => mockQueries.cstHolders,
  useUniqueRWLKAnchorHolders: () => mockQueries.rwlkHolders,
}));

let flowProps: AnchoringFlowProps | null = null;
jest.mock('@/components/anchoring/AnchoringFlow', () => ({
  AnchoringFlow: (props: AnchoringFlowProps) => {
    flowProps = props;
    return <figure data-testid="anchoring-flow" />;
  },
}));
jest.mock('@/components/anchoring/GlobalAnchorDistributionsTable', () => ({
  GlobalAnchorDistributionsTable: ({
    list,
    title,
    error,
  }: {
    list: unknown[];
    title: string;
    error?: string;
  }) => (
    <section>
      <h2>{title}</h2>
      <p data-testid="distributions">{error ?? `rows: ${list.length}`}</p>
    </section>
  ),
}));
jest.mock('@/components/anchoring/RwalkAnchorDistributionImprintsTable', () => ({
  RwalkAnchorDistributionImprintsTable: ({
    list,
    title,
    pageSize,
  }: {
    list: unknown[];
    title: string;
    pageSize?: number;
  }) => (
    <section>
      <h2>{title}</h2>
      <p data-testid="imprints">
        rows: {list.length}, page size: {pageSize}
      </p>
    </section>
  ),
}));

const ok = (data: unknown) => ({ data, isLoading: false, error: null, refetch: jest.fn() });

beforeEach(() => {
  flowProps = null;
  Object.assign(mockQueries, {
    distributions: ok([{}, {}]),
    imprints: ok([{}, {}, {}]),
    dashboard: ok({
      StakingAmountEth: 2,
      MainStats: {
        StakeStatisticsCST: { TotalTokensStaked: 4 },
        StakeStatisticsRWalk: { TotalTokensStaked: 25 },
      },
    }),
    cstHolders: ok([
      { StakerAddr: '0x1', TotalTokensStaked: 2 },
      { StakerAddr: '0x2', TotalTokensStaked: 1 },
    ]),
    rwlkHolders: ok([
      { StakerAddr: '0x2', TotalTokensStaked: 3 },
      { StakerAddr: '0x3', TotalTokensStaked: 0 },
    ]),
  });
});

// page.tsx renders the static explanations on the server and passes them in.
const slots = { steps: <AnchoringSteps />, questions: <AnchoringQuestions /> };

describe('AnchoringPage', () => {
  it('explains anchoring before the ledgers: steps, the live flow and the questions', () => {
    render(<AnchoringPage {...slots} />);
    const headings = screen.getAllByRole('heading', { level: 2 }).map((node) => node.textContent);
    expect(headings).toEqual([
      'anchoring.overview.howItWorks.title',
      'anchoring.questions.title',
      'anchoring.ledgers.distributions.title',
      'anchoring.ledgers.imprints.title',
    ]);
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(3);
    expect(screen.getByTestId('anchoring-flow')).toBeInTheDocument();
  });

  it('feeds the flow the live figures with one holder count for both collections', () => {
    render(<AnchoringPage {...slots} />);
    expect(flowProps).toMatchObject({
      poolEth: 2,
      anchoredCosmicSignature: 4,
      perNft: { status: 'available', perNftEth: 0.5 },
      anchoredRandomWalk: 25,
      // 0x1 and 0x2 anchor now (0x2 in both collections); 0x3 released everything.
      activeHolders: 2,
      loading: false,
    });
  });

  it('shows unread figures as unknown instead of zero', () => {
    mockQueries.dashboard = { data: undefined, isLoading: false, error: new Error('x') };
    render(<AnchoringPage {...slots} />);
    expect(flowProps).toMatchObject({
      poolEth: null,
      anchoredCosmicSignature: null,
      perNft: { status: 'unavailable' },
      anchoredRandomWalk: null,
    });
  });

  it('keeps each ledger’s failure to its own section', () => {
    mockQueries.distributions = {
      data: undefined,
      isLoading: false,
      error: new Error('x'),
      refetch: jest.fn(),
    };
    render(<AnchoringPage {...slots} />);
    expect(screen.getByTestId('distributions')).toHaveTextContent(
      'anchoring.overview.errorMessage',
    );
    expect(screen.getByTestId('imprints')).toHaveTextContent('rows: 3, page size: 10');
  });

  it('renders the server header when one is passed', () => {
    render(<AnchoringPage {...slots} seoSummary={<h1>Server header</h1>} />);
    expect(screen.getByRole('heading', { level: 1, name: 'Server header' })).toBeInTheDocument();
    expect(screen.queryByText('anchoring.overview.subtitle')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<AnchoringPage {...slots} />);
    await checkA11y(container);
  });
});
