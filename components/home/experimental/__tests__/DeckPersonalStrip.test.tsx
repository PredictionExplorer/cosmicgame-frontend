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

type StripProps = Parameters<typeof DeckPersonalStrip>[0];

/** A strip over a complete feed of `mine + others` Gestures, unless overridden. */
function renderStrip(mine: number, others: number, props: Partial<StripProps> = {}) {
  return render(
    <DeckPersonalStrip
      account={ACCOUNT}
      gestures={gestures(mine, others)}
      totalGestures={mine + others}
      feedStatus="ready"
      {...props}
    />,
  );
}

beforeEach(() => {
  mockUseApiData.mockReturnValue(makeApiData());
});

describe('DeckPersonalStrip', () => {
  it('counts the wallet’s Gestures this cycle and their plain share of the entries', () => {
    renderStrip(3, 97);

    expect(screen.getByTestId('personal-gesture-count')).toHaveTextContent(
      'home.deck.personal.gestures(count=3)',
    );
    // k of N: 3 of 100 entries, never a compounded chance.
    expect(screen.getByTestId('personal-entry-share')).toHaveTextContent(
      'home.deck.personal.entryShare(share=3%)',
    );
  });

  it('takes N from the cycle’s Gesture count, not from the rows the feed holds', () => {
    renderStrip(1, 3, { totalGestures: 8 });

    expect(screen.getByTestId('personal-entry-share')).toHaveTextContent(
      'home.deck.personal.entryShare(share=12.5%)',
    );
  });

  it('waits for the whole feed before it counts, never reading the seed as the cycle', () => {
    // The server seed: one row, the wallet's own latest Gesture.
    renderStrip(1, 0, { totalGestures: 40, feedStatus: 'loading' });

    expect(screen.queryByTestId('personal-gesture-count')).not.toBeInTheDocument();
    expect(screen.queryByTestId('personal-entry-share')).not.toBeInTheDocument();
    expect(screen.getByTestId('personal-gesture-count-pending')).toHaveTextContent(
      'tables.status.loading',
    );
  });

  it('leaves the count and share out when the feed cannot be read', () => {
    renderStrip(1, 0, { totalGestures: 40, feedStatus: 'error' });

    expect(screen.queryByTestId('personal-gesture-count')).not.toBeInTheDocument();
    expect(screen.queryByTestId('personal-gesture-count-pending')).not.toBeInTheDocument();
    expect(screen.queryByTestId('personal-entry-share')).not.toBeInTheDocument();
    // The way to the wallet's allocations stays.
    expect(screen.getByTestId('personal-allocations-link')).toBeInTheDocument();
  });

  it('leaves the share out before the wallet has a Gesture this cycle', () => {
    renderStrip(0, 12);

    expect(screen.getByTestId('personal-gesture-count')).toHaveTextContent(
      'home.deck.personal.gestures(count=0)',
    );
    expect(screen.queryByTestId('personal-entry-share')).not.toBeInTheDocument();
  });

  it('turns into a retrieve action when an allocation is waiting', () => {
    mockUseApiData.mockReturnValue(makeApiData({ ETHRaffleToClaim: 0.0123 }));
    renderStrip(1, 1);

    const retrieve = screen.getByTestId('personal-retrieve');
    expect(retrieve).toHaveAttribute('href', '/my-allocations');
    expect(retrieve).toHaveTextContent('home.deck.personal.retrieve');
    expect(retrieve).toHaveTextContent('0.0123 ETH');
  });

  it('links quietly to the allocations page when nothing is waiting', () => {
    renderStrip(1, 1);

    expect(screen.getByTestId('personal-allocations-link')).toHaveAttribute(
      'href',
      '/my-allocations',
    );
    expect(screen.queryByTestId('personal-retrieve')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderStrip(2, 8);
    await checkA11y(container);
  });

  it('has no accessibility violations while the feed loads', async () => {
    const { container } = renderStrip(1, 0, { feedStatus: 'loading' });
    await checkA11y(container);
  });
});
