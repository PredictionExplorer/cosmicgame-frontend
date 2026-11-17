import {
  fetchChainSpecialAllocationSnapshot,
  hasApiV2SpecialAllocationData,
  isHarnessChainSnapshotPreferred,
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

describe('harness role-source selection', () => {
  const originalHarness = process.env.NEXT_PUBLIC_HARNESS;
  const originalNetwork = process.env.NEXT_PUBLIC_NETWORK;

  afterEach(() => {
    if (originalHarness === undefined) delete process.env.NEXT_PUBLIC_HARNESS;
    else process.env.NEXT_PUBLIC_HARNESS = originalHarness;
    if (originalNetwork === undefined) delete process.env.NEXT_PUBLIC_NETWORK;
    else process.env.NEXT_PUBLIC_NETWORK = originalNetwork;
  });

  it('uses direct contract state only in the local full-stack harness', () => {
    process.env.NEXT_PUBLIC_HARNESS = '1';
    process.env.NEXT_PUBLIC_NETWORK = 'local';
    expect(isHarnessChainSnapshotPreferred()).toBe(true);

    process.env.NEXT_PUBLIC_NETWORK = 'mainnet';
    expect(isHarnessChainSnapshotPreferred()).toBe(false);
  });
});

/**
 * Chain state at block timestamp 1000: stored endurance champion 0x1111
 * (start 700, duration 100, prev 0), stored chrono record 50. With the
 * default lastBidTimeStamp of 800 the last bidder 0x3333 has held for 200s,
 * out-holding the stored record of 100 — a live overtake, during which the
 * storage anchor getters are stale until the next bid commits.
 */
function mockPublicClient(returnedChronoDuration: bigint, lastBidTimeStamp: bigint = 800n) {
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
          return Promise.resolve([0n, 0n, lastBidTimeStamp]);
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
    for (const [request] of client.readContract.mock.calls) {
      expect(request).toEqual(expect.objectContaining({ blockNumber: 12_345n }));
    }
  });

  it('rebases the endurance anchor during a live overtake, as the contract and the Go API do', async () => {
    // Last bid at 800, block at 1000: the 200s hold out-held the stored
    // record of 100, so the live chrono segment starts at the crossover
    // (800 + 100 = 900) and is 100s long. The exported anchor must be the
    // rebased one, not the stale storage getters (start 700, prev 0).
    const snapshot = await fetchChainSpecialAllocationSnapshot({
      publicClient: mockPublicClient(100n) as never,
      cosmicGameAddress: gameAddress,
    });

    expect(snapshot?.data.EnduranceChampionStartTimeStamp).toBe(800);
    expect(snapshot?.data.PrevEnduranceChampionDuration).toBe(100);
    expect(snapshot?.data.ChronoWarriorIsLive).toBe(true);
  });

  it('marks chain chrono live only when the rebased segment matches the returned duration', async () => {
    // Overtake in progress (see mockPublicClient): correct live segment is
    // 1000 - (800 + 100) = 100.
    const coherentClient = mockPublicClient(100n);
    // 300 is what the STALE storage anchor would derive (1000 - 700): the
    // pre-fix code treated it as live. It must not match anymore.
    const staleAnchorClient = mockPublicClient(300n);

    await expect(
      fetchChainSpecialAllocationSnapshot({
        publicClient: coherentClient as never,
        cosmicGameAddress: gameAddress,
      }),
    ).resolves.toMatchObject({
      data: {
        ChronoWarriorDuration: 100,
        ChronoWarriorIsLive: true,
      },
    });

    await expect(
      fetchChainSpecialAllocationSnapshot({
        publicClient: staleAnchorClient as never,
        cosmicGameAddress: gameAddress,
      }),
    ).resolves.toMatchObject({
      data: {
        ChronoWarriorDuration: 300,
        ChronoWarriorIsLive: false,
      },
    });
  });

  it('keeps the stored anchor when no overtake is in progress', async () => {
    // Last bid at 950: a 50s hold does not beat the stored record of 100,
    // so the storage anchor (start 700, prev 0) is current and the open
    // segment is 1000 - 700 = 300.
    const snapshot = await fetchChainSpecialAllocationSnapshot({
      publicClient: mockPublicClient(300n, 950n) as never,
      cosmicGameAddress: gameAddress,
    });

    expect(snapshot?.data.EnduranceChampionStartTimeStamp).toBe(700);
    expect(snapshot?.data.PrevEnduranceChampionDuration).toBe(0);
    expect(snapshot?.data.ChronoWarriorIsLive).toBe(true);
  });
});
