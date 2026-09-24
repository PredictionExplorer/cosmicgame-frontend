import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';

import api from '@/services/api';
import type { CSTTokenInfo } from '@/services/api';

import { useLatestSignatures } from '../useLatestSignatures';

jest.unmock('@tanstack/react-query');
jest.mock('@/services/api', () => ({
  __esModule: true,
  default: { get_cst_list: jest.fn() },
}));

const getCstList = api.get_cst_list as jest.Mock;

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

const token = (id: number, seed: string | undefined = `seed${id}`) =>
  ({ TokenId: id, Seed: seed }) as CSTTokenInfo;

beforeEach(() => getCstList.mockReset());

describe('useLatestSignatures', () => {
  it('paints the server seed when it describes the same newest imprint', () => {
    const seed = [token(47), token(46)];
    const { result } = renderHook(() => useLatestSignatures(48, seed), { wrapper });
    expect(result.current.signatures.map((t) => t.TokenId)).toEqual([47, 46]);
    expect(result.current.isLoading).toBe(false);
  });

  it('reads the newest imprints when the dashboard reports new ones', async () => {
    getCstList.mockResolvedValue([token(49), token(48)]);
    const { result } = renderHook(() => useLatestSignatures(50, [token(47)]), { wrapper });
    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.signatures[0]?.TokenId).toBe(49));
    expect(getCstList).toHaveBeenCalledWith(expect.objectContaining({ offset: 0, limit: 6 }));
  });

  it('drops tokens whose seed is not published yet', async () => {
    getCstList.mockResolvedValue([token(3, ''), token(2), token(1)]);
    const { result } = renderHook(() => useLatestSignatures(4), { wrapper });
    await waitFor(() => expect(result.current.signatures).toHaveLength(2));
    expect(result.current.signatures[0]?.TokenId).toBe(2);
  });

  it('asks for nothing before anything is imprinted', () => {
    const { result } = renderHook(() => useLatestSignatures(0), { wrapper });
    expect(getCstList).not.toHaveBeenCalled();
    expect(result.current.signatures).toEqual([]);
  });
});
