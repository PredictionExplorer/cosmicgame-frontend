import { TOKEN_1_METADATA_V2, TOKEN_7_METADATA_V2 } from '../__fixtures__/metadata';
import { buildCollectionTraitIndex, COLLECTION_TRAIT_INDEX_VERSION } from '../collectionIndex';
import { parseCosmicSignatureMetadata, type CosmicSignatureMetadata } from '../types';

const docs: Record<number, CosmicSignatureMetadata> = {
  1: parseCosmicSignatureMetadata(TOKEN_1_METADATA_V2)!,
  7: parseCosmicSignatureMetadata(TOKEN_7_METADATA_V2)!,
};

describe('buildCollectionTraitIndex', () => {
  it('walks every id, sorts entries, and counts confirmed-missing tokens', async () => {
    const load = jest.fn(async (id: number) => docs[id] ?? null);
    const index = await buildCollectionTraitIndex({ total: 8, load, concurrency: 3 });

    expect(load).toHaveBeenCalledTimes(8);
    expect(index.version).toBe(COLLECTION_TRAIT_INDEX_VERSION);
    expect(index.total).toBe(8);
    expect(index.indexed).toBe(2);
    expect(index.missing).toBe(6);
    expect(index.partial).toBe(false);
    expect(index.entries.map((entry) => entry.id)).toEqual([1, 7]);
    expect(index.entries[0]!.structure).toBe('Orbit Ribbons');
  });

  it('marks the index partial when a read fails but keeps going', async () => {
    const load = jest.fn(async (id: number) => {
      if (id === 3) throw new Error('boom');
      return docs[id] ?? null;
    });
    const index = await buildCollectionTraitIndex({ total: 8, load, concurrency: 2 });

    expect(load).toHaveBeenCalledTimes(8);
    expect(index.partial).toBe(true);
    expect(index.indexed).toBe(2);
  });

  it('stops after too many consecutive failures', async () => {
    const load = jest.fn(async () => {
      throw new Error('origin down');
    });
    const index = await buildCollectionTraitIndex({
      total: 100,
      load,
      concurrency: 1,
      maxConsecutiveFailures: 3,
    });

    expect(load).toHaveBeenCalledTimes(3);
    expect(index.partial).toBe(true);
    expect(index.indexed).toBe(0);
  });

  it('stops when the time budget is exhausted', async () => {
    let clock = 0;
    const load = jest.fn(async (id: number) => {
      clock += 10;
      return docs[id] ?? null;
    });
    const index = await buildCollectionTraitIndex({
      total: 50,
      load,
      concurrency: 1,
      timeBudgetMs: 25,
      now: () => clock,
    });

    expect(load.mock.calls.length).toBeLessThan(50);
    expect(index.partial).toBe(true);
  });

  it('handles an empty collection without loading anything', async () => {
    const load = jest.fn();
    const index = await buildCollectionTraitIndex({ total: 0, load });
    expect(load).not.toHaveBeenCalled();
    expect(index.entries).toEqual([]);
    expect(index.partial).toBe(false);
  });
});
