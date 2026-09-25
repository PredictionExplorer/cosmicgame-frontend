/**
 * A wallet the indexer has not seen yet, end to end: the production payloads for such a wallet
 * run through the real API mappers, React Query hooks and ApiDataProvider into My Allocations.
 * Regression: the notice's `Winnings: []` read as a failed Anchor Distribution read, so every
 * new wallet saw a permanent "could not be loaded" error instead of "Nothing waiting".
 */
import axios from 'axios';

import { ApiDataProvider } from '@/contexts/ApiDataContext';

import { renderWithQuery, screen } from '@/test-utils';

import MyWinnings from '../MyWinnings';

const NEW_WALLET = '0x1234567890123456789012345678901234567890';

// The real cache: the shared test mock stubs the client this test reads.
jest.mock('@tanstack/react-query', () => jest.requireActual('@tanstack/react-query'));

jest.mock('axios', () => {
  const actual = jest.requireActual<typeof import('axios')>('axios');
  return {
    __esModule: true,
    default: {
      get: jest.fn(),
      post: jest.fn(),
      interceptors: {
        request: { use: jest.fn(), eject: jest.fn(), clear: jest.fn() },
        response: { use: jest.fn(), eject: jest.fn(), clear: jest.fn() },
      },
      defaults: {},
    },
    isAxiosError: actual.isAxiosError,
  };
});
const mockedGet = axios.get as jest.MockedFunction<typeof axios.get>;

jest.mock('../../../../../utils/errors', () => ({ reportError: jest.fn() }));

jest.mock('../../../../../hooks/web3', () => ({
  useActiveWeb3React: () => ({ account: '0x1234567890123456789012345678901234567890' }),
}));

jest.mock('../../../../../contexts/AnchoredTokenContext', () => ({
  useAnchoredToken: () => ({ cstokens: [], rwlktokens: [], fetchData: jest.fn() }),
}));

jest.mock('../../../../../hooks/useClaimAllocations', () => ({
  useClaimAllocations: () => ({
    isClaiming: { everything: false, raffleETH: false, donatedNFT: false, donatedERC20: false },
    claimingDonatedNFTs: [],
    claimingDonatedTokens: [],
    txStage: { status: 'idle' },
    retrieveEverything: jest.fn(),
    retrieveAllStellarSelectionETH: jest.fn(),
    claimDonatedNFT: jest.fn(),
    claimAllDonatedNFTs: jest.fn(),
    claimDonatedERC20: jest.fn(),
    claimAllDonatedERC20: jest.fn(),
  }),
}));

jest.mock('../../../../../components/winnings/useRetrievalDeadlines', () => ({
  useRetrievalDeadlines: () => ({ deadlines: {}, isLoading: false }),
}));

jest.mock('../../../../../components/anchoring/UnretrievedCSTAnchorDistributionsTable', () => ({
  UnretrievedCSTAnchorDistributionsTable: () => <div data-testid="anchor-distributions" />,
}));

/** What the production indexer answers for a wallet it has not seen (`UserAid: 0`). */
const envelope = (fields: Record<string, unknown>) => ({
  data: { ...fields, UserAddr: NEW_WALLET, UserAid: 0, error: '', status: 1 },
});
const NEW_WALLET_PAYLOADS: [route: string, fields: Record<string, unknown>][] = [
  ['user/notif_red_box/', { Winnings: [] }],
  ['staking/cst/rewards/to_claim/by_user/', { UnclaimedEthDeposits: [] }],
  ['donations/nft/unclaimed/by_user/', { UnclaimedDonatedNFTs: [] }],
  ['prizes/eth/unclaimed/by_user/', { UnclaimedDeposits: [] }],
  ['donations/erc20/by_user/', { DonatedPrizesERC20ByWinner: [] }],
];

beforeEach(() => {
  mockedGet.mockReset();
  mockedGet.mockImplementation((url: string) => {
    const match = NEW_WALLET_PAYLOADS.find(([route]) => url.includes(route));
    return match
      ? Promise.resolve(envelope(match[1]))
      : Promise.reject(new Error(`unexpected read: ${url}`));
  });
});

describe('MyWinnings for a wallet the indexer has not seen yet', () => {
  it('says "Nothing waiting", never that the Anchor Distributions could not be loaded', async () => {
    renderWithQuery(
      <ApiDataProvider>
        <MyWinnings />
      </ApiDataProvider>,
    );

    expect(
      await screen.findByRole('heading', { level: 2, name: 'myPages.allocations.nothing.title' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('myPages.allocations.anchorLoadError.title')).not.toBeInTheDocument();
    expect(screen.queryByTestId('retrieval-summary')).not.toBeInTheDocument();
    expect(mockedGet).toHaveBeenCalledWith(
      expect.stringContaining(`user/notif_red_box/${NEW_WALLET}`),
      expect.anything(),
    );
  });
});
