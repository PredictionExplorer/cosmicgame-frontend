import { AxiosError } from 'axios';

import {
  flattenTx,
  flattenTxArray,
  normalizeFieldNames,
  normalizeFieldNamesArray,
  apiCall,
  apiPost,
} from '@/services/api/client';

const makeAxios400 = (): AxiosError => {
  const err = new AxiosError('Bad Request', 'ERR_BAD_REQUEST', undefined, undefined, {
    status: 400,
    statusText: 'Bad Request',
    headers: {},
    config: {} as never,
    data: {},
  });
  return err;
};

const makeAxios500 = (): AxiosError => {
  const err = new AxiosError('Server Error', 'ERR_BAD_RESPONSE', undefined, undefined, {
    status: 500,
    statusText: 'Internal Server Error',
    headers: {},
    config: {} as never,
    data: {},
  });
  return err;
};

const makeAxiosNoResponse = (): AxiosError => {
  return new AxiosError('Network Error', 'ERR_NETWORK');
};

describe('apiCall', () => {
  it('returns fn() result on success', async () => {
    const result = await apiCall(async () => [1, 2, 3], []);
    expect(result).toEqual([1, 2, 3]);
  });

  it('returns [] fallback on Axios 400', async () => {
    const result = await apiCall(async () => {
      throw makeAxios400();
    }, [] as number[]);
    expect(result).toEqual([]);
  });

  it('returns null fallback on Axios 400', async () => {
    const result = await apiCall(async (): Promise<string | null> => {
      throw makeAxios400();
    }, null);
    expect(result).toBeNull();
  });

  it('returns 0 fallback on Axios 400', async () => {
    const result = await apiCall(async () => {
      throw makeAxios400();
    }, 0);
    expect(result).toBe(0);
  });

  it('throws for non-Axios errors', async () => {
    await expect(
      apiCall(async () => {
        throw new Error('random failure');
      }, []),
    ).rejects.toThrow('Network response was not OK');
  });

  it('throws for Axios 500 errors', async () => {
    await expect(
      apiCall(async () => {
        throw makeAxios500();
      }, []),
    ).rejects.toThrow('Network response was not OK');
  });

  it('throws for Axios errors with no response', async () => {
    await expect(
      apiCall(async () => {
        throw makeAxiosNoResponse();
      }, []),
    ).rejects.toThrow('Network response was not OK');
  });

  it('throws for non-400 Axios status codes', async () => {
    const err = new AxiosError('Not Found', 'ERR_BAD_REQUEST', undefined, undefined, {
      status: 404,
      statusText: 'Not Found',
      headers: {},
      config: {} as never,
      data: {},
    });
    await expect(
      apiCall(async () => {
        throw err;
      }, []),
    ).rejects.toThrow('Network response was not OK');
  });

  it('preserves the shape of the returned data', async () => {
    const result = await apiCall(async () => ({ id: 1, name: 'test' }), null);
    expect(result).toEqual({ id: 1, name: 'test' });
  });

  it('does not swallow non-Error throwables', async () => {
    await expect(
      apiCall(async () => {
        throw 'string error';
      }, []),
    ).rejects.toThrow('Network response was not OK');
  });
});

describe('apiPost', () => {
  it('returns fn() result on success', async () => {
    const result = await apiPost(async () => ({ task_id: 42 }));
    expect(result).toEqual({ task_id: 42 });
  });

  it('throws on Axios 400 (does not fallback)', async () => {
    await expect(
      apiPost(async () => {
        throw makeAxios400();
      }),
    ).rejects.toThrow('Network response was not OK');
  });

  it('throws on network error', async () => {
    await expect(
      apiPost(async () => {
        throw new Error('Network Error');
      }),
    ).rejects.toThrow('Network response was not OK');
  });

  it('throws with exact error message', async () => {
    try {
      await apiPost(async () => {
        throw new Error('something');
      });
      fail('should have thrown');
    } catch (err) {
      expect((err as Error).message).toBe('Network response was not OK');
    }
  });
});

describe('client helper functions', () => {
  describe('flattenTx', () => {
    it('flattens object with Tx field', () => {
      const input = {
        EvtLogId: 1,
        BidderAddr: '0x123',
        Tx: {
          EvtLogId: 1,
          BlockNum: 100,
          TxId: 1,
          TxHash: '0xabc',
          TimeStamp: 1234567890,
          DateTime: '2023-01-01',
        },
      };
      const result = flattenTx(input);

      expect(result).toHaveProperty('EvtLogId', 1);
      expect(result).toHaveProperty('BlockNum', 100);
      expect(result).toHaveProperty('TxHash', '0xabc');
      expect(result).toHaveProperty('BidderAddr', '0x123');
      expect(result).not.toHaveProperty('Tx');
    });

    it('returns item unchanged when no Tx field', () => {
      const input = { EvtLogId: 1, BidderAddr: '0x123' };
      const result = flattenTx(input);

      expect(result).toEqual(input);
    });

    it('returns item when Tx is not an object', () => {
      const input = { EvtLogId: 1, Tx: 'not-an-object' };
      const result = flattenTx(input);

      expect(result).toEqual(input);
    });

    it('returns null for null input', () => {
      expect(flattenTx(null)).toBeNull();
    });

    it('returns undefined for undefined input', () => {
      expect(flattenTx(undefined)).toBeUndefined();
    });

    it('returns primitive unchanged', () => {
      expect(flattenTx(42)).toBe(42);
      expect(flattenTx('string')).toBe('string');
    });
  });

  describe('flattenTxArray', () => {
    it('flattens array of objects with Tx', () => {
      const input = [
        {
          EvtLogId: 1,
          Tx: {
            EvtLogId: 1,
            TxHash: '0xabc',
            BlockNum: 100,
            TxId: 1,
            TimeStamp: 123,
            DateTime: '2023-01-01',
          },
        },
      ];
      const result = flattenTxArray(input);

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('TxHash', '0xabc');
      expect(result[0]).not.toHaveProperty('Tx');
    });

    it('returns empty array for null', () => {
      expect(flattenTxArray(null)).toEqual([]);
    });

    it('returns empty array for undefined', () => {
      expect(flattenTxArray(undefined)).toEqual([]);
    });

    it('returns empty array for non-array', () => {
      expect(flattenTxArray({})).toEqual([]);
      expect(flattenTxArray('string')).toEqual([]);
    });

    it('returns empty array for empty array', () => {
      expect(flattenTxArray([])).toEqual([]);
    });

    it('handles mixed array with and without Tx', () => {
      const input = [
        {
          EvtLogId: 1,
          Tx: { EvtLogId: 1, TxHash: '0xa', BlockNum: 1, TxId: 1, TimeStamp: 1, DateTime: '' },
        },
        { EvtLogId: 2 },
      ];
      const result = flattenTxArray(input);

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('TxHash', '0xa');
      expect(result[1]).toEqual({ EvtLogId: 2 });
    });
  });

  describe('normalizeFieldNames', () => {
    it('adds TokenAddr when TokenAddress exists and TokenAddr is absent', () => {
      const input = { TokenAddress: '0x123', Other: 'value' };
      const result = normalizeFieldNames(input);

      expect(result).toHaveProperty('TokenAddr', '0x123');
      expect(result).toHaveProperty('TokenAddress', '0x123');
    });

    it('does not overwrite TokenAddr when it already exists', () => {
      const input = { TokenAddress: '0x123', TokenAddr: '0x456' };
      const result = normalizeFieldNames(input);

      expect(result).toHaveProperty('TokenAddr', '0x456');
    });

    it('returns item unchanged when no TokenAddress', () => {
      const input = { EvtLogId: 1, BidderAddr: '0x123' };
      const result = normalizeFieldNames(input);

      expect(result).toEqual(input);
    });

    it('returns null for null input', () => {
      expect(normalizeFieldNames(null)).toBeNull();
    });

    it('returns undefined for undefined input', () => {
      expect(normalizeFieldNames(undefined)).toBeUndefined();
    });

    it('returns primitive unchanged', () => {
      expect(normalizeFieldNames(42)).toBe(42);
    });
  });

  describe('normalizeFieldNamesArray', () => {
    it('normalizes each item in array', () => {
      const input = [{ TokenAddress: '0x1' }, { TokenAddress: '0x2' }];
      const result = normalizeFieldNamesArray(input) as Array<{ TokenAddr: string }>;

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('TokenAddr', '0x1');
      expect(result[1]).toHaveProperty('TokenAddr', '0x2');
    });

    it('returns items unchanged when not array', () => {
      expect(normalizeFieldNamesArray(null)).toBeNull();
      expect(normalizeFieldNamesArray(undefined)).toBeUndefined();
      expect(normalizeFieldNamesArray({})).toEqual({});
    });

    it('returns empty array for empty array', () => {
      expect(normalizeFieldNamesArray([])).toEqual([]);
    });
  });
});
