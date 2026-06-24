import {
  fetchChainSpecialAllocationSnapshot,
  hasApiV2SpecialAllocationData,
  keepPreviousSpecialAllocationChainSnapshot,
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

const gameAddress = '0x9999999999999999999999999999999999999999';
const liveEndurance = '0x3333333333333333333333333333333333333333';
const storedEndurance = '0x1111111111111111111111111111111111111111';
const returnedChrono = '0x4444444444444444444444444444444444444444';
const lastCst = '0x2222222222222222222222222222222222222222';

function mockPublicClient(returnedChronoDuration: bigint) {
  return {
    getBlock: jest.fn().mockResolvedValue({ number: 12_345n, timestamp: 1_000n }),
    readContract: jest.fn(({ functionName }: { functionName: string }) => {
      switch (functionName) {
        case 'tryGetCurrentChampions':
          return Promise.resolve([liveEndurance, 200n, returnedChrono, returnedChronoDuration]);
        case 'enduranceChampionAddress':
          return Promise.resolve(storedEndurance);
        case 'enduranceChampionDuration':
          return Promise.resolve(100n);
        case 'enduranceChampionStartTimeStamp':
          return Promise.resolve(700n);
        case 'prevEnduranceChampionDuration':
          return Promise.resolve(0n);
        case 'chronoWarriorDuration':
          return Promise.resolve(50n);
        case 'lastBidderAddress':
          return Promise.resolve(liveEndurance);
        case 'lastCstBidderAddress':
          return Promise.resolve(lastCst);
        case 'roundNum':
          return Promise.resolve(1n);
        case 'biddersInfo':
          return Promise.resolve([0n, 0n, 800n]);
        default:
          throw new Error(`Unexpected read: ${functionName}`);
      }
    }),
  };
}

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

  it('keeps previous chain data available while a refreshed chain read is loading', () => {
    const previousChainData = {
      data: {
        EnduranceChampionStartTimeStamp: 800,
        PrevEnduranceChampionDuration: 100,
        ChronoWarriorDuration: 60,
        StoredChronoWarriorDuration: 50,
        ChronoWarriorIsLive: true,
        SourceBlockTimeStamp: 1_000,
      },
    };

    expect(keepPreviousSpecialAllocationChainSnapshot(previousChainData)).toBe(previousChainData);
  });

  it('preserves source-backed chrono details during an API refresh when previous chain data is reused', () => {
    const previousChainData = {
      data: {
        EnduranceChampionStartTimeStamp: 800,
        PrevEnduranceChampionDuration: 100,
        ChronoWarriorDuration: 60,
        StoredChronoWarriorDuration: 50,
        ChronoWarriorIsLive: true,
        SourceBlockTimeStamp: 1_000,
      },
    };

    const snapshot = normalizeSpecialAllocationSnapshot({
      apiData: { ...apiV1, ChronoWarriorDuration: 50 },
      chainData: keepPreviousSpecialAllocationChainSnapshot(previousChainData),
      apiReceivedAtMs: 40_000,
      chainReceivedAtMs: 12_000,
    });

    expect(snapshot?.source).toBe('api-v1+chain');
    expect(snapshot?.hasChronoSegmentData).toBe(true);
    expect(snapshot?.ChronoWarriorDuration).toBe(60);
    expect(snapshot?.StoredChronoWarriorDuration).toBe(50);
  });
});

describe('fetchChainSpecialAllocationSnapshot', () => {
  it('preserves stored endurance metadata alongside returned current champions', async () => {
    const client = mockPublicClient(300n);

    const snapshot = await fetchChainSpecialAllocationSnapshot({
      publicClient: client as never,
      cosmicGameAddress: gameAddress,
    });

    expect(snapshot?.data.EnduranceChampionAddress).toBe(liveEndurance);
    expect(snapshot?.data.StoredEnduranceChampionAddress).toBe(storedEndurance);
    expect(snapshot?.data.StoredEnduranceChampionDuration).toBe(100);
    expect(snapshot?.data.ChronoWarriorAddress).toBe(returnedChrono);
    expect(snapshot?.data.StoredChronoWarriorDuration).toBe(50);
    expect(snapshot?.data.LastBidderLastBidTime).toBe(800);
  });

  it('marks chain chrono live only when the source segment matches the returned duration', async () => {
    const coherentClient = mockPublicClient(300n);
    const mismatchedClient = mockPublicClient(250n);

    await expect(
      fetchChainSpecialAllocationSnapshot({
        publicClient: coherentClient as never,
        cosmicGameAddress: gameAddress,
      }),
    ).resolves.toMatchObject({
      data: {
        ChronoWarriorDuration: 300,
        ChronoWarriorIsLive: true,
      },
    });

    await expect(
      fetchChainSpecialAllocationSnapshot({
        publicClient: mismatchedClient as never,
        cosmicGameAddress: gameAddress,
      }),
    ).resolves.toMatchObject({
      data: {
        ChronoWarriorDuration: 250,
        ChronoWarriorIsLive: false,
      },
    });
  });
});
