import type { GestureInfo } from '@/services/api';

import { checkA11y, render, screen } from '@/test-utils';

import { DeckPersonalStrip } from '../DeckPersonalStrip';

const mockUseApiData = jest.fn();
jest.mock('../../../../contexts/ApiDataContext', () => ({
  useApiData: () => mockUseApiData(),
}));

const ACCOUNT = '0x1111111111111111111111111111111111111111';
const OTHER = '0x2222222222222222222222222222222222222222';

function makeApiData(overrides: Partial<Record<string, number>> = {}) {
  return {
    apiData: {
      ETHRaffleToClaim: 0,
      ETHRaffleToClaimWei: 0,
      NumDonatedNFTToClaim: 0,
      UnretrievedAnchorDistribution: 0,
      ...overrides,
    },
  };
}

function gestures(mine: number, others: number): GestureInfo[] {
  return [
    ...Array.from({ length: mine }, () => ({ BidderAddr: ACCOUNT.toUpperCase() })),
    ...Array.from({ length: others }, () => ({ BidderAddr: OTHER })),
  ] as GestureInfo[];
}

beforeEach(() => {
  mockUseApiData.mockReturnValue(makeApiData());
});

describe('DeckPersonalStrip', () => {
  it('counts the wallet’s Gestures this cycle and their plain share of the entries', () => {
    render(<DeckPersonalStrip account={ACCOUNT} gestures={gestures(3, 97)} />);

    expect(screen.getByTestId('personal-gesture-count')).toHaveTextContent(
      'home.deck.personal.gestures(count=3)',
    );
    // k of N: 3 of 100 entries, never a compounded chance.
    expect(screen.getByTestId('personal-entry-share')).toHaveTextContent(
      'home.deck.personal.entryShare(share=3%)',
    );
  });

  it('leaves the share out before the wallet has a Gesture this cycle', () => {
    render(<DeckPersonalStrip account={ACCOUNT} gestures={gestures(0, 12)} />);

    expect(screen.getByTestId('personal-gesture-count')).toHaveTextContent(
      'home.deck.personal.gestures(count=0)',
    );
    expect(screen.queryByTestId('personal-entry-share')).not.toBeInTheDocument();
  });

  it('turns into a retrieve action when an allocation is waiting', () => {
    mockUseApiData.mockReturnValue(makeApiData({ ETHRaffleToClaim: 0.0123 }));
    render(<DeckPersonalStrip account={ACCOUNT} gestures={gestures(1, 1)} />);

    const retrieve = screen.getByTestId('personal-retrieve');
    expect(retrieve).toHaveAttribute('href', '/my-allocations');
    expect(retrieve).toHaveTextContent('home.deck.personal.retrieve');
    expect(retrieve).toHaveTextContent('0.0123 ETH');
  });

  it('links quietly to the allocations page when nothing is waiting', () => {
    render(<DeckPersonalStrip account={ACCOUNT} gestures={gestures(1, 1)} />);

    expect(screen.getByTestId('personal-allocations-link')).toHaveAttribute(
      'href',
      '/my-allocations',
    );
    expect(screen.queryByTestId('personal-retrieve')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<DeckPersonalStrip account={ACCOUNT} gestures={gestures(2, 8)} />);
    await checkA11y(container);
  });
});
