import { checkA11y, fireEvent, render, screen, within } from '@/test-utils';

import { AddressTransferHistory } from '../AddressTransferHistory';

const ME = '0xa169574d0d353e3010997a3e64846b7d1b2a63b6';
const OTHER = '0x1ec14adaf61e27ab339bc590ba4bf2356dd7e990';
const ZERO = '0x0000000000000000000000000000000000000000';
const MOCK_ANCHOR_WALLET = '0xb7f13a14f9eb5f1f1afb1a1a0fad6dc1a5b2e0c4';
const WEI = 1_000_000_000_000_000_000n;

const mockUseCTTransfers = jest.fn();
const mockUseCSTTransfers = jest.fn();
const mockRefetch = jest.fn();

jest.mock('@/hooks/useApiQuery', () => ({
  useCTTransfers: (...args: unknown[]) => mockUseCTTransfers(...args),
  useCSTTransfers: (...args: unknown[]) => mockUseCSTTransfers(...args),
}));

jest.mock('@/contexts/ContractAddressesContext', () => ({
  useContractAddresses: () => ({ stakingCst: MOCK_ANCHOR_WALLET, stakingRwalk: '' }),
}));

function query(
  data: unknown[] | undefined,
  state: Partial<{ isLoading: boolean; isError: boolean }> = {},
) {
  return { data, isLoading: false, isError: false, refetch: mockRefetch, ...state };
}

const CST_ROWS = [
  {
    EvtLogId: 4,
    TxHash: '0x4',
    TimeStamp: 1_790_175_928,
    FromAddr: ZERO,
    ToAddr: ME,
    Value: (176n * WEI).toString(),
  },
  {
    EvtLogId: 3,
    TxHash: '0x3',
    TimeStamp: 1_790_175_900,
    FromAddr: ME,
    ToAddr: ZERO,
    Value: (200n * WEI).toString(),
  },
  {
    EvtLogId: 2,
    TxHash: '0x2',
    TimeStamp: 1_790_100_000,
    FromAddr: OTHER,
    ToAddr: ME,
    Value: (50n * WEI).toString(),
  },
  {
    EvtLogId: 1,
    TxHash: '0x1',
    TimeStamp: 1_790_000_000,
    FromAddr: ME,
    ToAddr: OTHER,
    Value: (6n * WEI).toString(),
  },
];

const NFT_ROWS = [
  {
    EvtLogId: 3,
    TxHash: '0xc',
    TimeStamp: 1_786_804_555,
    TokenId: 24,
    FromAddr: ME,
    ToAddr: OTHER,
  },
  { EvtLogId: 2, TxHash: '0xb', TimeStamp: 1_786_491_506, TokenId: 25, FromAddr: ZERO, ToAddr: ME },
  { EvtLogId: 1, TxHash: '0xa', TimeStamp: 1_786_491_506, TokenId: 24, FromAddr: ZERO, ToAddr: ME },
];

const table = () => screen.getByRole('table');

beforeEach(() => {
  jest.clearAllMocks();
  mockUseCTTransfers.mockReturnValue(query(CST_ROWS));
  mockUseCSTTransfers.mockReturnValue(query(NFT_ROWS));
});

describe('AddressTransferHistory — CST', () => {
  it('leads with the totals: received, sent and the signed net change', () => {
    render(<AddressTransferHistory asset="cst" address={ME} />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'myPages.transferHistory.cst.title',
    );
    const received = document.querySelector('[data-figure="received"]');
    const sent = document.querySelector('[data-figure="sent"]');
    const net = document.querySelector('[data-figure="net"]');
    expect(received).toHaveTextContent('226 CST');
    expect(received).toHaveTextContent('imprintedCaption(amount=176 CST)');
    expect(sent).toHaveTextContent('206 CST');
    expect(sent).toHaveTextContent('consumedCaption(amount=200 CST)');
    expect(net).toHaveTextContent('+20 CST');
  });

  it('says what each row meant, signs the amount, and never shows the zero address', () => {
    render(<AddressTransferHistory asset="cst" address={ME} />);

    const rows = within(table()).getAllByRole('row').slice(1);
    expect(rows[0]).toHaveTextContent('myPages.transferHistory.activity.imprinted');
    expect(rows[0]).toHaveTextContent('+176.00');
    expect(rows[1]).toHaveTextContent('myPages.transferHistory.activity.consumed');
    expect(rows[1]).toHaveTextContent('-200.00');
    expect(rows[3]).toHaveTextContent('myPages.transferHistory.activity.sent');
    expect(table()).not.toHaveTextContent(/0x0000/);
    expect(within(table()).queryByRole('link', { name: /0x0000/ })).not.toBeInTheDocument();
  });

  it('filters to incoming or outgoing transfers with one single-choice group', () => {
    render(<AddressTransferHistory asset="cst" address={ME} />);

    const group = screen.getByRole('radiogroup', { name: 'myPages.transferHistory.filter.label' });
    fireEvent.click(
      within(group).getByRole('radio', { name: 'myPages.transferHistory.filter.out' }),
    );
    expect(
      within(group).getByRole('radio', { name: 'myPages.transferHistory.filter.out' }),
    ).toBeChecked();
    const rows = within(table()).getAllByRole('row').slice(1);
    expect(rows).toHaveLength(2);
    expect(screen.getByText('myPages.transferHistory.count(count=2)')).toBeInTheDocument();
  });

  it('keeps the loaded layout while loading: caption lines, the filter bar and a page of rows (regression)', () => {
    // The captions and the filter bar used to mount only with the data, and
    // five skeleton rows stood in for twenty: the ledger jumped on load.
    mockUseCTTransfers.mockReturnValue(query(undefined, { isLoading: true }));
    render(<AddressTransferHistory asset="cst" address={ME} />);

    for (const id of ['received', 'sent']) {
      const figure = document.querySelector(`[data-figure="${id}"]`);
      expect(figure?.querySelectorAll('dd')).toHaveLength(2);
    }
    expect(
      screen.getByRole('radiogroup', { name: 'myPages.transferHistory.filter.label' }),
    ).toBeInTheDocument();
    expect(document.querySelectorAll('tbody tr')).toHaveLength(20);
  });

  it('identifies the address with a copy button and its explorer page, and links the NFT history', () => {
    render(<AddressTransferHistory asset="cst" address={ME} />);

    // Whose history it is reads directly under the title, before the figures.
    const identity = document.querySelector('[data-slot="page-header-identity"]');
    expect(identity).toHaveTextContent('0xA169574D0d353E3010997A3E64846b7D1B2a63B6');
    expect(identity?.compareDocumentPosition(document.querySelector('dl')!)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );

    expect(screen.getByRole('button', { name: 'common.actions.copyAddress' })).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /myPages\.transferHistory\.viewOnExplorer/ }),
    ).toHaveAttribute('href', expect.stringContaining(`/address/${ME}`));
    const switcher = screen.getByRole('navigation', {
      name: 'myPages.transferHistory.switcherLabel',
    });
    expect(
      within(switcher).getByRole('link', { name: 'myPages.transferHistory.cst.title' }),
    ).toHaveAttribute('aria-current', 'page');
    expect(
      within(switcher).getByRole('link', { name: 'myPages.transferHistory.nft.title' }),
    ).toHaveAttribute('href', `/cosmic-signature-transfer/${ME}`);
  });

  it('offers a retry when the history cannot be read, and shows the totals as unknown', () => {
    mockUseCTTransfers.mockReturnValue(query(undefined, { isError: true }));
    render(<AddressTransferHistory asset="cst" address={ME} />);

    fireEvent.click(screen.getByRole('button', { name: /try again|retry/i }));
    expect(mockRefetch).toHaveBeenCalledTimes(1);
    expect(document.querySelector('[data-figure="net"]')).toHaveTextContent(
      'common.status.unavailable',
    );
  });

  it('explains an empty history', () => {
    mockUseCTTransfers.mockReturnValue(query([]));
    render(<AddressTransferHistory asset="cst" address={ME} />);

    expect(screen.getByText('myPages.transferHistory.cst.empty')).toBeInTheDocument();
    expect(screen.getByText('myPages.transferHistory.cst.emptyDescription')).toBeInTheDocument();
  });

  it('refuses an invalid address without querying, and offers a way on', () => {
    render(<AddressTransferHistory asset="cst" address="not-an-address" />);

    expect(screen.getByText('myPages.transferHistory.invalidAddress.title')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'myPages.transferHistory.invalidAddress.action' }),
    ).toHaveAttribute('href', '/statistics/participation');
    expect(mockUseCTTransfers).toHaveBeenCalledWith(null);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<AddressTransferHistory asset="cst" address={ME} />);
    await checkA11y(container);
  });
});

describe('AddressTransferHistory — NFT', () => {
  it('counts imprinted, received and sent NFTs and links each token', () => {
    render(<AddressTransferHistory asset="nft" address={ME} />);

    expect(document.querySelector('[data-figure="imprinted"]')).toHaveTextContent('2');
    expect(document.querySelector('[data-figure="received"]')).toHaveTextContent('0');
    expect(document.querySelector('[data-figure="sent"]')).toHaveTextContent('1');
    expect(within(table()).getAllByRole('link', { name: '#000024' })[0]).toHaveAttribute(
      'href',
      '/detail/24',
    );
    expect(mockUseCSTTransfers).toHaveBeenCalledWith(ME);
    expect(mockUseCTTransfers).toHaveBeenCalledWith(null);
  });

  it('reads an NFT moved into the anchoring wallet as anchored, not sent (regression)', () => {
    mockUseCSTTransfers.mockReturnValue(
      query([
        {
          EvtLogId: 5,
          TxHash: '0xe',
          TimeStamp: 1_786_900_000,
          TokenId: 25,
          FromAddr: ME,
          ToAddr: MOCK_ANCHOR_WALLET,
        },
        ...NFT_ROWS,
      ]),
    );
    render(<AddressTransferHistory asset="nft" address={ME} />);

    const rows = within(table()).getAllByRole('row').slice(1);
    expect(rows[0]).toHaveTextContent('myPages.transferHistory.activity.anchored');
    // Still one sent: the anchored NFT stays the address's own.
    expect(document.querySelector('[data-figure="sent"]')).toHaveTextContent('1');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<AddressTransferHistory asset="nft" address={ME} />);
    await checkA11y(container);
  });
});
