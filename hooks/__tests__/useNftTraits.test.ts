import { renderHook } from '@testing-library/react';
import { useQuery } from '@tanstack/react-query';

import {
  TOKEN_1_METADATA_V2,
  TOKEN_43_METADATA_V1,
  TOKEN_7_METADATA_V2,
} from '@/lib/nftMetadata/__fixtures__/metadata';
import {
  normalizeTraitEntry,
  parseCosmicSignatureMetadata,
  type CollectionTraitIndex,
} from '@/lib/nftMetadata';

import {
  COLLECTION_TRAIT_INDEX_PATH,
  deriveCollectionTraits,
  fetchCollectionTraitIndex,
  useCollectionTraitIndex,
  useCollectionTraits,
  useNftMetadata,
} from '../useNftTraits';

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(() => ({ data: undefined, isLoading: false, isError: false, error: null })),
}));

const mockUseQuery = useQuery as jest.Mock;

const index: CollectionTraitIndex = {
  version: 1,
  total: 3,
  indexed: 3,
  missing: 0,
  partial: false,
  generatedAt: '2026-09-01T00:00:00.000Z',
  entries: [TOKEN_1_METADATA_V2, TOKEN_7_METADATA_V2, TOKEN_43_METADATA_V1].map(
    (doc) => normalizeTraitEntry(parseCosmicSignatureMetadata(doc)!)!,
  ),
};

beforeEach(() => {
  jest.clearAllMocks();
  mockUseQuery.mockReturnValue({ data: undefined, isLoading: false, isError: false, error: null });
});

describe('useCollectionTraitIndex', () => {
  it('queries the same-origin index with a long stale time and no focus refetch', () => {
    renderHook(() => useCollectionTraitIndex());
    const options = mockUseQuery.mock.calls[0]![0] as {
      queryKey: unknown[];
      staleTime: number;
      refetchOnWindowFocus: boolean;
      refetchInterval: (query: { state: { data?: { partial: boolean } } }) => number | false;
    };
    expect(options.queryKey).toEqual(['collectionTraitIndex']);
    expect(options.staleTime).toBeGreaterThanOrEqual(60_000);
    expect(options.refetchOnWindowFocus).toBe(false);
  });

  it('keeps polling only while the server index is partial', () => {
    renderHook(() => useCollectionTraitIndex());
    const options = mockUseQuery.mock.calls[0]![0] as {
      refetchInterval: (query: { state: { data?: { partial: boolean } } }) => number | false;
    };
    expect(options.refetchInterval({ state: { data: { partial: true } } })).toBe(30_000);
    expect(options.refetchInterval({ state: { data: { partial: false } } })).toBe(false);
    expect(options.refetchInterval({ state: {} })).toBe(false);
  });
});

describe('fetchCollectionTraitIndex', () => {
  const originalFetch = global.fetch;
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('loads the route handler payload', async () => {
    global.fetch = jest.fn(async () => ({
      ok: true,
      json: async () => index,
    })) as unknown as typeof fetch;
    await expect(fetchCollectionTraitIndex()).resolves.toEqual(index);
    expect(global.fetch).toHaveBeenCalledWith(
      COLLECTION_TRAIT_INDEX_PATH,
      expect.objectContaining({ headers: { Accept: 'application/json' } }),
    );
  });

  it('rejects on a non-OK response', async () => {
    global.fetch = jest.fn(async () => ({ ok: false, status: 503 })) as unknown as typeof fetch;
    await expect(fetchCollectionTraitIndex()).rejects.toThrow('503');
  });
});

describe('useCollectionTraits', () => {
  it('derives facets, rarity, chaos bounds and a lookup map from the index', () => {
    mockUseQuery.mockReturnValue({
      data: index,
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });
    const { result } = renderHook(() => useCollectionTraits());
    const traits = result.current.traits!;
    expect(traits.byId.get(1)?.structure).toBe('Orbit Ribbons');
    expect(traits.rarity.total).toBe(2);
    expect(traits.chaos).toEqual({ min: 18, max: 22 });
    expect(traits.facets.fate.map((option) => option.value).sort()).toEqual([
      'Ejection',
      'Eternal Dance',
    ]);
    expect(traits.total).toBe(3);
    expect(traits.partial).toBe(false);
  });

  it('returns null traits while loading or after an error', () => {
    mockUseQuery.mockReturnValue({ data: undefined, isLoading: true, isError: false });
    expect(renderHook(() => useCollectionTraits()).result.current).toMatchObject({
      traits: null,
      isLoading: true,
    });
    mockUseQuery.mockReturnValue({ data: undefined, isLoading: false, isError: true });
    expect(renderHook(() => useCollectionTraits()).result.current).toMatchObject({
      traits: null,
      isError: true,
    });
  });

  it('memoizes the derived view per payload', () => {
    const derived = deriveCollectionTraits(index);
    expect(derived.entries).toBe(index.entries);
    expect(derived.byId.size).toBe(3);
  });
});

describe('useNftMetadata', () => {
  it('is disabled for invalid ids and enabled for a valid token id', () => {
    renderHook(() => useNftMetadata(null));
    renderHook(() => useNftMetadata(-1));
    renderHook(() => useNftMetadata(12));
    const [invalid, negative, valid] = mockUseQuery.mock.calls.map(
      (call) => call[0] as { enabled: boolean; queryKey: unknown[] },
    );
    expect(invalid!.enabled).toBe(false);
    expect(negative!.enabled).toBe(false);
    expect(valid!.enabled).toBe(true);
    expect(valid!.queryKey).toEqual(['nftMetadata', 12]);
  });

  it('honours the enabled flag and hydrates from server-rendered initial data', () => {
    const doc = parseCosmicSignatureMetadata(TOKEN_1_METADATA_V2)!;
    renderHook(() => useNftMetadata(1, { enabled: false, initialData: doc }));
    const options = mockUseQuery.mock.calls[0]![0] as {
      enabled: boolean;
      initialData?: unknown;
      initialDataUpdatedAt?: () => number;
    };
    expect(options.enabled).toBe(false);
    expect(options.initialData).toBe(doc);
    expect(typeof options.initialDataUpdatedAt?.()).toBe('number');
  });

  it('treats a null initial document as a known-missing token', () => {
    renderHook(() => useNftMetadata(1, { initialData: null }));
    const options = mockUseQuery.mock.calls[0]![0] as { initialData?: unknown };
    expect(options.initialData).toBeNull();
  });
});
