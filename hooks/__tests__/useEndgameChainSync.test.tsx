import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';

import {
  CONFIRMATION_GRACE_MS,
  ENDGAME_TAIL_MS,
  useEndgameChainSync,
} from '@/hooks/useEndgameChainSync';
import { useNow } from '@/hooks/useNow';
import { fetchEndgameChainSample } from '@/lib/rpcRace';

jest.mock('@/hooks/useNow', () => ({ useNow: jest.fn() }));
jest.mock('@/lib/rpcRace', () => ({ fetchEndgameChainSample: jest.fn() }));
jest.mock('@/lib/uxCycleScenarios', () => ({ useUxScenarioSnapshot: () => null }));
jest.mock('@/utils/errors', () => ({
  ...jest.requireActual('@/utils/errors'),
  reportError: jest.fn(),
}));
jest.mock('@/contexts/ContractAddressesContext', () => ({
  useContractAddresses: () => ({ cosmicGame: '0x00000000000000000000000000000000000000c6' }),
}));

const mockUseNow = useNow as jest.MockedFunction<typeof useNow>;
const mockSample = fetchEndgameChainSample as jest.MockedFunction<typeof fetchEndgameChainSample>;

const DEADLINE_MS = 1_790_000_000_000;

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('useEndgameChainSync', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Every read fails: nothing can confirm the zero-cross on-chain.
    mockSample.mockRejectedValue(new Error('rpc down'));
  });

  it('opens a long-finished cycle as ready, never on a stale "Confirming" state', () => {
    // Regression (F112): a deadline 11 days in the past latched the zero-cross
    // on the first render and held "Verifying on-chain" (and no Finalize
    // button) for the whole grace period, although no sample was ever taken.
    mockUseNow.mockReturnValue(DEADLINE_MS + 11 * 86_400_000);
    const { result } = renderHook(() => useEndgameChainSync({ targetMs: DEADLINE_MS }), {
      wrapper,
    });
    expect(result.current.isConfirmationPending).toBe(false);
    expect(mockSample).not.toHaveBeenCalled();
  });

  it('treats a deadline just past the endgame tail as proven by the server clock', () => {
    mockUseNow.mockReturnValue(DEADLINE_MS + ENDGAME_TAIL_MS + 1_000);
    const { result } = renderHook(() => useEndgameChainSync({ targetMs: DEADLINE_MS }), {
      wrapper,
    });
    expect(result.current.isConfirmationPending).toBe(false);
  });

  it('waits for chain proof when the zero-cross happens while the page is open', async () => {
    mockUseNow.mockReturnValue(DEADLINE_MS - 1_000);
    const { result, rerender } = renderHook(() => useEndgameChainSync({ targetMs: DEADLINE_MS }), {
      wrapper,
    });
    expect(result.current.isConfirmationPending).toBe(false);

    mockUseNow.mockReturnValue(DEADLINE_MS + 500);
    await act(async () => rerender());
    expect(result.current.isConfirmationPending).toBe(true);

    // With every read failing, the grace period ends in the ready state.
    mockUseNow.mockReturnValue(DEADLINE_MS + 500 + CONFIRMATION_GRACE_MS);
    await act(async () => rerender());
    expect(result.current.isConfirmationPending).toBe(false);
  });
});
