import { checkA11y, fireEvent, render, screen } from '@/test-utils';

import EthDonationDetailPage from '../[id]/EthDonationDetailPage';

const mockUseDonationsWithInfoById = jest.fn();
const mockRefetch = jest.fn();
const mockFetch = jest.fn();

jest.mock('@/hooks/useApiQuery', () => ({
  useDonationsWithInfoById: (...args: unknown[]) => mockUseDonationsWithInfoById(...args),
}));

const DONOR = '0x4D3949CD8980E942eb9Dd24d4eCc27584a8D71fA';
const DONATION = {
  EvtLogId: 18955,
  TxHash: '0x7545e61f9ae02f59dc2b1951edf97549b258eab28a40927f78178c11fec384c5',
  TimeStamp: 1_782_078_578,
  DonorAddr: DONOR,
  RoundNum: 3,
  AmountEth: 20,
  CGRecordId: 7,
  DataJson: JSON.stringify({
    title: 'For the builders',
    message: 'Keep shipping.',
    url: 'https://example.org/post',
  }),
};

function withRecord(data: unknown, state: { isLoading?: boolean; isError?: boolean } = {}) {
  mockUseDonationsWithInfoById.mockReturnValue({
    data,
    isLoading: false,
    isError: false,
    refetch: mockRefetch,
    ...state,
  });
}

const originalFetch = global.fetch;

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = mockFetch as unknown as typeof fetch;
});

afterAll(() => {
  global.fetch = originalFetch;
});

describe('EthDonationDetailPage', () => {
  it('leads with the amount, the contributor, the cycle and the date', () => {
    withRecord(DONATION);
    render(<EthDonationDetailPage id={7} />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'ethContribution.detail.title(id=7)',
    );
    expect(document.querySelector('[data-figure="amount"]')).toHaveTextContent('20.0000 ETH');
    const from = document.querySelector('[data-figure="from"]');
    expect(from).toHaveTextContent('0x4D39');
    // The contributor sits in the figure's type, not in a 12px chip.
    expect(from?.querySelector('.text-xs')).toBeNull();
    // The link names where it leads, and its visible number is part of that name.
    const cycle = screen.getByRole('link', { name: 'ethContribution.detail.cycleLink(cycle=3)' });
    expect(cycle).toHaveAttribute('href', '/eth-contribution/round/3');
    expect(cycle).toHaveTextContent('3');
    expect(document.querySelector('[data-figure="date"] time')).toBeInTheDocument();
    for (const id of ['from', 'date']) {
      expect(document.querySelector(`[data-figure="${id}"] dd`)).not.toHaveClass(
        'lg:type-figure-lg',
      );
    }
  });

  it('says each fact once: the record holds only the transaction and its id', () => {
    withRecord(DONATION);
    render(<EthDonationDetailPage id={7} />);

    const record = screen
      .getByRole('heading', { name: 'ethContribution.detail.recordTitle' })
      .closest('section') as HTMLElement;
    expect(record.querySelectorAll('dt')).toHaveLength(2);
    expect(record.querySelector('time')).toBeNull();
    expect(record).not.toHaveTextContent('0x4D39');
    expect(document.querySelectorAll('a[href="/eth-contribution/round/3"]')).toHaveLength(1);
  });

  it("shows the contributor's note as a quote with its link, never fetching it", () => {
    withRecord(DONATION);
    render(<EthDonationDetailPage id={7} />);

    expect(
      screen.getByRole('heading', { name: 'ethContribution.detail.noteTitle' }),
    ).toBeInTheDocument();
    expect(screen.getByText('For the builders')).toBeInTheDocument();
    expect(screen.getByText('Keep shipping.').closest('blockquote')).not.toBeNull();
    const link = screen.getByRole('link', { name: /example\.org/ });
    expect(link).toHaveAttribute('href', 'https://example.org/post');
    expect(link).toHaveAttribute('rel', expect.stringContaining('nofollow'));
    // Regression: the page used to fetch the note's URL (and, with none, its own origin).
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('shows a note that is not the form JSON as stored', () => {
    withRecord({ ...DONATION, DataJson: 'gm, builders' });
    render(<EthDonationDetailPage id={7} />);

    expect(screen.getByText('gm, builders').tagName).toBe('PRE');
    expect(screen.getByText('ethContribution.detail.noteRawCaption')).toBeInTheDocument();
  });

  it('gives the transaction its own row, linked to the explorer', () => {
    withRecord(DONATION);
    render(<EthDonationDetailPage id={7} />);

    const transaction = screen.getByRole('link', { name: /0x7545/ });
    expect(transaction).toHaveAttribute('href', expect.stringContaining(DONATION.TxHash));
    expect(transaction).toHaveAttribute('target', '_blank');
  });

  it('explains a missing record and leads back to the list', () => {
    withRecord(null);
    render(<EthDonationDetailPage id={9} />);

    // The H1 no longer claims the record exists (regression: "Contribution #9"
    // above "There is no contribution #9").
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'ethContribution.detail.notFoundHeading',
    );
    expect(screen.getByText('ethContribution.detail.notFoundTitle(id=9)')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'ethContribution.detail.backToAll' })).toHaveAttribute(
      'href',
      '/eth-contribution',
    );
  });

  it('opens on the not-found state the server found, with no figures to drop (regression)', () => {
    // Every missing record drew four figure skeletons, then removed them when
    // the client read answered, shifting the page (desktop CLS 0.095).
    withRecord(undefined, { isLoading: true });
    render(<EthDonationDetailPage id={9} knownMissing />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'ethContribution.detail.notFoundHeading',
    );
    expect(document.querySelector('[data-figure]')).toBeNull();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByText('ethContribution.detail.notFoundTitle(id=9)')).toBeInTheDocument();
  });

  it('shows the record when the client read finds it after all', () => {
    withRecord(DONATION);
    render(<EthDonationDetailPage id={7} knownMissing />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'ethContribution.detail.title(id=7)',
    );
    expect(document.querySelector('[data-figure="amount"]')).toHaveTextContent('20.0000 ETH');
  });

  it('refuses an invalid id without querying', () => {
    withRecord(null);
    render(<EthDonationDetailPage id={-1} />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'ethContribution.detail.invalidId',
    );
    expect(mockUseDonationsWithInfoById).toHaveBeenCalledWith(null);
  });

  it('offers a retry when the record cannot be read', () => {
    withRecord(undefined, { isError: true });
    render(<EthDonationDetailPage id={7} />);

    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('keeps the heading and shows skeleton rows while loading', () => {
    withRecord(undefined, { isLoading: true });
    render(<EthDonationDetailPage id={7} />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'ethContribution.detail.title(id=7)',
    );
    expect(screen.getByRole('status', { name: 'tables.skeleton.loadingRows' })).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    withRecord(DONATION);
    const { container } = render(<EthDonationDetailPage id={7} />);
    await checkA11y(container);
  });
});
