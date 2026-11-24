import type { SalonLot } from '@/hooks/useSalonLots';

import { salonLotPhase } from '../SalonLotCard';

/** A lot midway through its life; each case below flips one aspect. */
function lot(overrides: Partial<SalonLot> = {}): SalonLot {
  return {
    nftId: 7,
    cycle: 2,
    opensAt: 1_000,
    closesAt: 0,
    leadingPatron: '',
    leadingOffer: 0n,
    minimumNextOffer: 10n ** 15n,
    concluded: false,
    retrieved: false,
    ...overrides,
  };
}

describe('salonLotPhase', () => {
  it('is upcoming before the lot opens', () => {
    expect(salonLotPhase(lot(), 999)).toBe('upcoming');
  });

  it('awaits the first offer once open, for as long as nobody has offered', () => {
    // The closing clock only starts at the first offer, so an untouched lot
    // stays in this phase indefinitely.
    expect(salonLotPhase(lot(), 1_000)).toBe('awaitingFirstOffer');
    expect(salonLotPhase(lot(), 9_999_999)).toBe('awaitingFirstOffer');
  });

  it('is open from the first offer until the close', () => {
    const offered = lot({ closesAt: 5_000, leadingPatron: '0xabc', leadingOffer: 1n });
    expect(salonLotPhase(offered, 4_999)).toBe('open');
  });

  it('is concludable once the close passes', () => {
    const offered = lot({ closesAt: 5_000, leadingPatron: '0xabc', leadingOffer: 1n });
    expect(salonLotPhase(offered, 5_000)).toBe('concludable');
  });

  it('awaits retrieval after conclusion, then rests as retrieved', () => {
    const concluded = lot({ closesAt: 5_000, concluded: true });
    expect(salonLotPhase(concluded, 9_000)).toBe('awaitingRetrieval');
    expect(salonLotPhase(lot({ closesAt: 5_000, concluded: true, retrieved: true }), 9_000)).toBe(
      'retrieved',
    );
  });
});
