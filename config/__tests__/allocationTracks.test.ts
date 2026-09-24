import { protocolFacts } from '@/content/protocol-facts';
import contractsMessages from '@/messages/en/contracts.json';

import {
  ALLOCATION_TRACK_COLORS,
  ALLOCATION_TRACK_COPY_KEYS,
  ALLOCATION_TRACK_IDS,
  withNextCycleShare,
} from '../allocationTracks';

describe('allocation tracks', () => {
  it('names a label and tooltip in the catalog for every track', () => {
    const segments: Record<string, { label?: string; tooltip?: string }> =
      contractsMessages.funds.segments;
    for (const id of ALLOCATION_TRACK_IDS) {
      const copy = segments[ALLOCATION_TRACK_COPY_KEYS[id]];
      expect(copy?.label).toBeTruthy();
      expect(copy?.tooltip).toBeTruthy();
    }
  });

  it('gives every track its own palette-token color', () => {
    const colors = ALLOCATION_TRACK_IDS.map((id) => ALLOCATION_TRACK_COLORS[id]);
    expect(new Set(colors).size).toBe(ALLOCATION_TRACK_IDS.length);
    for (const color of colors) expect(color).not.toMatch(/#[0-9a-f]{3,8}/i);
  });

  it('completes the distributed shares with the next-cycle remainder', () => {
    const shares = withNextCycleShare([
      { id: 'signature', percent: protocolFacts.mainEthPercentage },
      { id: 'chrono', percent: protocolFacts.chronoWarriorEthPercentage },
      { id: 'stellar', percent: protocolFacts.stellarSelectionEthPercentage },
      { id: 'anchor', percent: protocolFacts.anchorDistributionPercentage },
      { id: 'publicGoods', percent: protocolFacts.publicGoodsPercentage },
    ]);

    expect(shares.at(-1)).toEqual({
      id: 'nextCycle',
      percent: protocolFacts.compoundingReservePercentage,
    });
    expect(shares.reduce((total, share) => total + (share.percent ?? 0), 0)).toBe(100);
  });

  it('leaves the remainder unknown when any share is unknown', () => {
    const shares = withNextCycleShare([
      { id: 'signature', percent: 25 },
      { id: 'chrono', percent: null },
    ]);
    expect(shares.at(-1)?.percent).toBeNull();
  });

  it('never reports a negative remainder', () => {
    expect(withNextCycleShare([{ id: 'signature', percent: 120 }]).at(-1)?.percent).toBe(0);
  });
});
