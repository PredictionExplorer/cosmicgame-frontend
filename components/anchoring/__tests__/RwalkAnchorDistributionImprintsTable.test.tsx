import type { AnchorDistributionImprint } from '@/services/api';

import { checkA11y, render, screen } from '@/test-utils';

import { RwalkAnchorDistributionImprintsTable } from '../RwalkAnchorDistributionImprintsTable';

const mockUseCSTInfo = jest.fn();
const mockUseCSTList = jest.fn();
jest.mock('@/hooks/useApiQuery', () => ({
  useCSTInfo: (tokenId: number | null) => mockUseCSTInfo(tokenId),
  useCSTList: (options: { enabled?: boolean }) => mockUseCSTList(options),
}));

const RECIPIENT = '0x95d2bA09182101f577Fb21D080FD9Bc0D916011C';

const imprint = (
  overrides: Partial<AnchorDistributionImprint> = {},
): AnchorDistributionImprint => ({
  EvtLogId: 25991,
  TxHash: '0ximprint',
  TimeStamp: 1_786_491_506,
  WinnerAddr: RECIPIENT,
  RoundNum: 1,
  TokenId: 38,
  ...overrides,
});

beforeEach(() => {
  mockUseCSTList.mockReturnValue({
    data: [
      { TokenId: 38, Seed: 'seed38' },
      { TokenId: 39, Seed: 'seed39' },
    ],
    isLoading: false,
  });
  mockUseCSTInfo.mockImplementation((tokenId: number | null) => ({
    data: tokenId === null ? undefined : { TokenId: tokenId, Seed: 'abc' },
    isLoading: false,
  }));
});

describe('RwalkAnchorDistributionImprintsTable', () => {
  it('shows each imprint by its artwork, recipient, cycle and transaction', () => {
    render(<RwalkAnchorDistributionImprintsTable list={[imprint()]} />);
    expect(screen.getByTestId('art-frame')).toBeInTheDocument();
    // The plate leads to the token too, as a pointer shortcut: the number is the one named link.
    expect(screen.getByRole('link', { name: '#000038' })).toHaveAttribute('href', '/detail/38');
    expect(document.querySelectorAll('a[href="/detail/38"]')).toHaveLength(2);
    expect(document.querySelector('a[href="/detail/38"][aria-hidden="true"]')).toHaveAttribute(
      'tabindex',
      '-1',
    );
    expect(document.querySelector(`a[href="/user/${RECIPIENT}"]`)).toBeInTheDocument();
    // A cycle reads as a word-sized link, never a bare "1".
    expect(
      screen.getAllByRole('link', { name: 'common.pageHeader.crumbs.cycle(cycle=1)' })[0],
    ).toHaveAttribute('href', '/allocation/1');
    expect(document.querySelector('a[href*="0ximprint"]')).toHaveAttribute('target', '_blank');
  });

  it('reads as one media object on a phone: the caption carries the cycle and the proof', () => {
    const { container } = render(<RwalkAnchorDistributionImprintsTable list={[imprint()]} />);
    // The art heads the record with no column label stacked above it.
    const tokenCell = container.querySelector('td[data-label=""]');
    expect(tokenCell).toHaveAttribute('data-stack', 'true');
    expect(tokenCell?.querySelector('[data-testid="art-frame"]')).not.toBeNull();
    const caption = tokenCell?.querySelector('.sm\\:hidden');
    expect(caption?.querySelector('a[href="/allocation/1"]')).not.toBeNull();
    expect(caption?.querySelector('a[href*="0ximprint"]')).not.toBeNull();
    // The columns the caption repeats drop out of the phone record.
    for (const label of ['cycle', 'datetime']) {
      expect(
        container.querySelector(
          `td[data-label="anchoring.tables.randomWalkImprints.columns.${label}"]`,
        ),
      ).toHaveAttribute('data-priority', 'secondary');
    }
  });

  it('reads every thumbnail’s seed from one collection read, not a lookup per row', () => {
    render(
      <RwalkAnchorDistributionImprintsTable
        list={[imprint(), imprint({ EvtLogId: 25990, TokenId: 39 })]}
      />,
    );
    expect(screen.getAllByTestId('art-frame')).toHaveLength(2);
    expect(mockUseCSTList).toHaveBeenCalledWith({ enabled: true });
    expect(mockUseCSTInfo).not.toHaveBeenCalledWith(38);
    expect(mockUseCSTInfo).not.toHaveBeenCalledWith(39);
  });

  it('waits for the collection read instead of looking each token up', () => {
    mockUseCSTList.mockReturnValue({ data: undefined, isLoading: true });
    render(<RwalkAnchorDistributionImprintsTable list={[imprint()]} />);
    expect(screen.queryByTestId('art-frame')).not.toBeInTheDocument();
    expect(mockUseCSTInfo).not.toHaveBeenCalledWith(38);
  });

  it('looks up a token the collection read does not have', () => {
    render(<RwalkAnchorDistributionImprintsTable list={[imprint({ TokenId: 51 })]} />);
    expect(mockUseCSTInfo).toHaveBeenCalledWith(51);
  });

  it('skips the collection read for an empty ledger', () => {
    render(<RwalkAnchorDistributionImprintsTable list={[]} />);
    expect(mockUseCSTList).toHaveBeenCalledWith({ enabled: false });
  });

  it('drops the recipient column on a page about one address', () => {
    render(<RwalkAnchorDistributionImprintsTable list={[imprint()]} showRecipient={false} />);
    expect(
      screen.queryByText('anchoring.tables.randomWalkImprints.columns.recipient'),
    ).not.toBeInTheDocument();
  });

  it('names the empty state after Stellar Selection imprints, not allocations', () => {
    render(<RwalkAnchorDistributionImprintsTable list={[]} />);
    expect(
      screen.getByRole('heading', { name: 'anchoring.common.empty.imprints.title' }),
    ).toBeInTheDocument();
  });

  it('takes a page-specific empty title', () => {
    render(<RwalkAnchorDistributionImprintsTable list={[]} emptyTitle="No selections yet" />);
    expect(screen.getByRole('heading', { name: 'No selections yet' })).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<RwalkAnchorDistributionImprintsTable list={[imprint()]} />);
    await checkA11y(container);
  });
});
