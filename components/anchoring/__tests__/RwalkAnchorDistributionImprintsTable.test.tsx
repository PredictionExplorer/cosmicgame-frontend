import type { AnchorDistributionImprint } from '@/services/api';

import { checkA11y, render, screen } from '@/test-utils';

import { RwalkAnchorDistributionImprintsTable } from '../RwalkAnchorDistributionImprintsTable';

const mockUseCSTInfo = jest.fn();
jest.mock('@/hooks/useApiQuery', () => ({
  useCSTInfo: (tokenId: number | null) => mockUseCSTInfo(tokenId),
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
  mockUseCSTInfo.mockImplementation((tokenId: number | null) => ({
    data: tokenId === null ? undefined : { TokenId: tokenId, Seed: 'abc' },
    isLoading: false,
  }));
});

describe('RwalkAnchorDistributionImprintsTable', () => {
  it('shows each imprint by its artwork, recipient, cycle and transaction', () => {
    render(<RwalkAnchorDistributionImprintsTable list={[imprint()]} />);
    expect(screen.getByTestId('art-frame')).toBeInTheDocument();
    expect(mockUseCSTInfo).toHaveBeenCalledWith(38);
    expect(screen.getByRole('link', { name: '#000038' })).toHaveAttribute('href', '/detail/38');
    expect(document.querySelector(`a[href="/user/${RECIPIENT}"]`)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '1' })).toHaveAttribute('href', '/allocation/1');
    expect(document.querySelector('a[href*="0ximprint"]')).toHaveAttribute('target', '_blank');
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
