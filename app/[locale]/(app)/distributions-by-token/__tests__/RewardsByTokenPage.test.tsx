import userEvent from '@testing-library/user-event';

import { checkA11y, render, screen } from '@/test-utils';

import RewardsByTokenPage, { depositsFromDetails } from '../[address]/[tokenId]/RewardsByTokenPage';

const mockDetails = jest.fn();
const mockCstInfo = jest.fn();

jest.mock('@/hooks/useApiQuery', () => ({
  useAnchorDistributionsByUserByTokenDetails: (address: string, tokenId: number) =>
    mockDetails(address, tokenId),
  useCSTInfo: (tokenId: number | null) => mockCstInfo(tokenId),
}));
jest.mock('@/components/layout/participantTrail', () => ({
  useParticipantTrail: (address: string) => [{ label: address, href: `/user/${address}` }],
}));

const HOLDER = '0xA169574D0d353E3010997A3E64846b7D1B2a63B6';

const deposit = (overrides = {}) => ({
  DepositId: 18,
  DepositTimeStamp: 1_786_491_506,
  RoundNum: 1,
  RewardEth: 0.1562,
  Claimed: false,
  Stake: {
    ActionId: 1,
    EvtLogId: 18890,
    TxHash: '0xanchor',
    TimeStamp: 1_781_506_867,
    NumStakedNFTs: 1,
  },
  Unstake: { EvtLogId: 0, TxHash: '', TimeStamp: 0, NumStakedNFTs: 0, RewardAmountEth: 0 },
  ...overrides,
});

const details = (...rows: unknown[]) =>
  Object.fromEntries(rows.map((row, index) => [String(index), row]));

beforeEach(() => {
  jest.clearAllMocks();
  mockCstInfo.mockReturnValue({ data: { TokenId: 0, Seed: 'abc', RoundNum: 0 }, isLoading: false });
  mockDetails.mockReturnValue({
    data: details(
      deposit(),
      deposit({ DepositId: 19, RoundNum: 2, RewardEth: 0.25, Claimed: true }),
    ),
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
  });
});

describe('depositsFromDetails', () => {
  it('reads the numbered deposits of the payload and skips everything else', () => {
    expect(depositsFromDetails({ '0': deposit(), '1': null, TokenId: 0 })).toHaveLength(1);
    expect(depositsFromDetails(null)).toEqual([]);
  });
});

describe('RewardsByTokenPage', () => {
  it('heads the page with the deposit count, the total and what is unretrieved', () => {
    const { container } = render(<RewardsByTokenPage address={HOLDER} tokenId={0} />);
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'anchoring.distributionsByToken.title(tokenId=0)',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('anchoring.distributionsByToken.figures.unretrievedCaption'),
    ).toBeInTheDocument();
    // 0.1562 + 0.25 distributed; 0.1562 still unretrieved.
    expect(container).toHaveTextContent('0.4062');
    expect(container).toHaveTextContent('0.1562');
  });

  it('shows the artwork and its anchor-holder', () => {
    render(<RewardsByTokenPage address={HOLDER} tokenId={0} />);
    expect(screen.getByTestId('art-frame')).toBeInTheDocument();
    expect(document.querySelectorAll(`a[href="/user/${HOLDER}"]`).length).toBeGreaterThan(0);
  });

  it('opens a deposit onto the anchor behind it', async () => {
    const user = userEvent.setup();
    render(<RewardsByTokenPage address={HOLDER} tokenId={0} />);
    const [toggle] = screen.getAllByRole('button', {
      name: 'anchoring.distributionsByToken.details.show',
    });
    await user.click(toggle!);
    expect(
      screen.getByRole('link', { name: 'anchoring.anchorActionDetail.breadcrumbs.action(id=1)' }),
    ).toHaveAttribute('href', '/anchor-action/0/1');
    expect(
      screen.getByText('anchoring.distributionsByToken.details.stillAnchored'),
    ).toBeInTheDocument();
  });

  it('explains an empty record and leads back to the ledger', () => {
    mockDetails.mockReturnValue({ data: {}, isLoading: false, isError: false, refetch: jest.fn() });
    render(<RewardsByTokenPage address={HOLDER} tokenId={0} />);
    expect(
      screen.getByRole('heading', { name: 'anchoring.distributionsByToken.empty.title' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'anchoring.distributionsByToken.empty.action' }),
    ).toHaveAttribute('href', '/anchoring');
  });

  it('offers a retry when the record cannot be read', async () => {
    const user = userEvent.setup();
    const refetch = jest.fn();
    mockDetails.mockReturnValue({ data: undefined, isLoading: false, isError: true, refetch });
    render(<RewardsByTokenPage address={HOLDER} tokenId={0} />);
    expect(screen.getByText('anchoring.distributionsByToken.error')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /try again/i }));
    expect(refetch).toHaveBeenCalled();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<RewardsByTokenPage address={HOLDER} tokenId={0} />);
    await checkA11y(container);
  });
});
