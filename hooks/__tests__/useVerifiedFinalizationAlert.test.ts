import { renderHook } from '@testing-library/react';

import { useVerifiedFinalizationAlert } from '../useVerifiedFinalizationAlert';

type NotificationArgs = Parameters<
  typeof import('../useAllocationNotification').useAllocationNotification
>[0];
const mockNotification = jest.fn<void, [NotificationArgs]>();
jest.mock('../useAllocationNotification', () => ({
  useAllocationNotification: (args: NotificationArgs) => mockNotification(args),
}));

const mockSetQueryData = jest.fn();
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQueryClient: () => ({ setQueryData: mockSetQueryData }),
}));

let mockCosmicGame = '0x0000000000000000000000000000000000000c05';
jest.mock('@/contexts/ContractAddressesContext', () => ({
  useContractAddresses: () => ({ cosmicGame: mockCosmicGame }),
}));

const mockFetchSample = jest.fn();
jest.mock('@/lib/rpcRace', () => ({
  fetchEndgameChainSample: (...args: unknown[]) => mockFetchSample(...args),
}));

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: Record<string, unknown>) =>
    values ? `${key}(${JSON.stringify(values)})` : key,
}));

function verify(): () => Promise<number | null> {
  const args = mockNotification.mock.lastCall?.[0];
  if (!args?.verifyRemainingMs) throw new Error('the alert was wired without a chain check');
  return args.verifyRemainingMs;
}

beforeEach(() => {
  jest.clearAllMocks();
  mockCosmicGame = '0x0000000000000000000000000000000000000c05';
});

describe('useVerifiedFinalizationAlert', () => {
  it('wires the opt-in alert with its copy, its deadline and a chain check', () => {
    renderHook(() => useVerifiedFinalizationAlert({ allocationTime: 1_000, cycleNumber: 7 }));

    expect(mockNotification).toHaveBeenLastCalledWith(
      expect.objectContaining({
        allocationTime: 1_000,
        cycleNumber: 7,
        notificationTitle: 'notifications.finalizationSoonTitle',
        verifyRemainingMs: expect.any(Function),
      }),
    );
    expect(mockNotification.mock.lastCall?.[0].notificationBody).toEqual(expect.any(Function));
  });

  it('re-reads the time left from the chain and stores the fresh deadline', async () => {
    mockFetchSample.mockResolvedValue({
      roundNum: 7,
      mainPrizeTimeSec: 10_600,
      blockTimestampSec: 10_000,
    });
    renderHook(() => useVerifiedFinalizationAlert({ allocationTime: 1_000, cycleNumber: 7 }));

    await expect(verify()()).resolves.toBe(600_000);
    expect(mockFetchSample).toHaveBeenCalledWith(mockCosmicGame);
    expect(mockSetQueryData).toHaveBeenCalledWith(['allocationTime'], 10_600);
    expect(mockSetQueryData).toHaveBeenCalledWith(['currentTime'], 10_000);
  });

  it('has nothing to warn about once the chain is on another cycle', async () => {
    mockFetchSample.mockResolvedValue({
      roundNum: 8,
      mainPrizeTimeSec: 10_600,
      blockTimestampSec: 10_000,
    });
    renderHook(() => useVerifiedFinalizationAlert({ allocationTime: 1_000, cycleNumber: 7 }));

    await expect(verify()()).resolves.toBe(0);
    expect(mockSetQueryData).not.toHaveBeenCalled();
  });

  it('cannot check without a contract address, and says so', async () => {
    mockCosmicGame = '';
    renderHook(() => useVerifiedFinalizationAlert({ allocationTime: 1_000, cycleNumber: 7 }));

    await expect(verify()()).resolves.toBeNull();
    expect(mockFetchSample).not.toHaveBeenCalled();
  });
});
