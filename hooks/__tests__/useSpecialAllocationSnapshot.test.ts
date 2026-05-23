import {
  hasApiV2SpecialAllocationData,
  normalizeSpecialAllocationSnapshot,
} from '@/hooks/useSpecialAllocationSnapshot';
import type { SpecialRecipients } from '@/services/api/types';

const apiV1: SpecialRecipients = {
  EnduranceChampionAddress: '0x1111111111111111111111111111111111111111',
  EnduranceChampionDuration: 100,
  ChronoWarriorAddress: '0x1111111111111111111111111111111111111111',
  ChronoWarriorDuration: 50,
  LastBidderAddress: '0x1111111111111111111111111111111111111111',
  LastBidderLastBidTime: 900,
  LastCstBidderAddress: '0x2222222222222222222222222222222222222222',
};

const apiV2: SpecialRecipients = {
  ...apiV1,
  EnduranceChampionStartTimeStamp: 800,
  PrevEnduranceChampionDuration: 100,
  ChronoWarriorIsLive: false,
  SourceBlockTimeStamp: 1_000,
};

describe('special allocation snapshot normalization', () => {
  it('detects complete API V2 payloads', () => {
    expect(hasApiV2SpecialAllocationData(apiV2)).toBe(true);
    expect(hasApiV2SpecialAllocationData(apiV1)).toBe(false);
  });

  it('prefers complete API V2 data over chain fallback', () => {
    const snapshot = normalizeSpecialAllocationSnapshot({
      apiData: apiV2,
      chainData: {
        data: {
          ChronoWarriorDuration: 999,
          SourceBlockTimeStamp: 2_000,
        },
      },
      apiReceivedAtMs: 10_000,
      chainReceivedAtMs: 20_000,
    });

    expect(snapshot?.source).toBe('api-v2');
    expect(snapshot?.ChronoWarriorDuration).toBe(apiV2.ChronoWarriorDuration);
    expect(snapshot?.receivedAtMs).toBe(10_000);
    expect(snapshot?.hasChronoSegmentData).toBe(true);
  });

  it('enriches API V1 with chain segment data when V2 fields are missing', () => {
    const snapshot = normalizeSpecialAllocationSnapshot({
      apiData: apiV1,
      chainData: {
        data: {
          EnduranceChampionStartTimeStamp: 800,
          PrevEnduranceChampionDuration: 100,
          ChronoWarriorDuration: 60,
          StoredChronoWarriorDuration: 50,
          ChronoWarriorIsLive: true,
          SourceBlockTimeStamp: 1_000,
        },
      },
      apiReceivedAtMs: 10_000,
      chainReceivedAtMs: 12_000,
    });

    expect(snapshot?.source).toBe('api-v1+chain');
    expect(snapshot?.ChronoWarriorDuration).toBe(60);
    expect(snapshot?.StoredChronoWarriorDuration).toBe(50);
    expect(snapshot?.receivedAtMs).toBe(12_000);
    expect(snapshot?.hasChronoSegmentData).toBe(true);
  });

  it('falls back to snapshot-only API V1 when chain data is unavailable', () => {
    const snapshot = normalizeSpecialAllocationSnapshot({
      apiData: apiV1,
      chainData: null,
      apiReceivedAtMs: 10_000,
    });

    expect(snapshot?.source).toBe('api-v1');
    expect(snapshot?.ChronoWarriorDuration).toBe(apiV1.ChronoWarriorDuration);
    expect(snapshot?.hasChronoSegmentData).toBe(false);
  });
});
