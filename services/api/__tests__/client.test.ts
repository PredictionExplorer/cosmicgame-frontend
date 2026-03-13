import { AxiosError } from 'axios';

import {
  flattenTx,
  flattenTxArray,
  flattenRoundInfo,
  normalizeFieldNames,
  normalizeFieldNamesArray,
  getAPIUrl,
  getMainAPIUrl,
  proxyUrl,
  cosmicGameBaseUrl,
  baseUrl,
  apiCall,
  apiPost,
  assertApiEnvelope,
} from '@/services/api/client';

import { reportError } from '../../../utils/errors';

jest.mock('../../../utils/errors', () => ({
  reportError: jest.fn(),
}));

const mockReportError = reportError as jest.MockedFunction<typeof reportError>;

beforeEach(() => {
  mockReportError.mockClear();
});

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

const makeAxios403 = (): AxiosError => {
  const err = new AxiosError('Forbidden', 'ERR_BAD_REQUEST', undefined, undefined, {
    status: 403,
    statusText: 'Forbidden',
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

  it('returns [] fallback on Axios 403', async () => {
    const result = await apiCall(async () => {
      throw makeAxios403();
    }, [] as number[]);
    expect(result).toEqual([]);
  });

  it('returns null fallback on Axios 403', async () => {
    const result = await apiCall(async (): Promise<string | null> => {
      throw makeAxios403();
    }, null);
    expect(result).toBeNull();
  });

  it('does not report 403 errors to Sentry', async () => {
    await apiCall(async () => {
      throw makeAxios403();
    }, []);
    expect(mockReportError).not.toHaveBeenCalled();
  });

  it('throws for non-Axios errors and reports to Sentry', async () => {
    const original = new Error('random failure');
    await expect(
      apiCall(async () => {
        throw original;
      }, []),
    ).rejects.toThrow('Network response was not OK');
    expect(mockReportError).toHaveBeenCalledWith(original, 'apiCall');
  });

  it('throws for Axios 500 errors and reports to Sentry', async () => {
    const original = makeAxios500();
    await expect(
      apiCall(async () => {
        throw original;
      }, []),
    ).rejects.toThrow('Network response was not OK');
    expect(mockReportError).toHaveBeenCalledWith(original, 'apiCall');
  });

  it('throws for Axios errors with no response', async () => {
    const original = makeAxiosNoResponse();
    await expect(
      apiCall(async () => {
        throw original;
      }, []),
    ).rejects.toThrow('Network response was not OK');
    expect(mockReportError).toHaveBeenCalledWith(original, 'apiCall');
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
    expect(mockReportError).toHaveBeenCalledWith(err, 'apiCall');
  });

  it('preserves the shape of the returned data', async () => {
    const result = await apiCall(async () => ({ id: 1, name: 'test' }), null);
    expect(result).toEqual({ id: 1, name: 'test' });
    expect(mockReportError).not.toHaveBeenCalled();
  });

  it('does not swallow non-Error throwables', async () => {
    await expect(
      apiCall(async () => {
        throw 'string error';
      }, []),
    ).rejects.toThrow('Network response was not OK');
    expect(mockReportError).toHaveBeenCalledWith('string error', 'apiCall');
  });

  it('does not report 400 errors to Sentry', async () => {
    await apiCall(async () => {
      throw makeAxios400();
    }, []);
    expect(mockReportError).not.toHaveBeenCalled();
  });
});

describe('apiPost', () => {
  it('returns fn() result on success', async () => {
    const result = await apiPost(async () => ({ task_id: 42 }));
    expect(result).toEqual({ task_id: 42 });
    expect(mockReportError).not.toHaveBeenCalled();
  });

  it('throws on Axios 400 and reports to Sentry', async () => {
    const original = makeAxios400();
    await expect(
      apiPost(async () => {
        throw original;
      }),
    ).rejects.toThrow('Network response was not OK');
    expect(mockReportError).toHaveBeenCalledWith(original, 'apiPost');
  });

  it('throws on network error and reports to Sentry', async () => {
    const original = new Error('Network Error');
    await expect(
      apiPost(async () => {
        throw original;
      }),
    ).rejects.toThrow('Network response was not OK');
    expect(mockReportError).toHaveBeenCalledWith(original, 'apiPost');
  });

  it('throws with exact error message', async () => {
    const original = new Error('something');
    try {
      await apiPost(async () => {
        throw original;
      });
      fail('should have thrown');
    } catch (err) {
      expect((err as Error).message).toBe('Network response was not OK');
    }
    expect(mockReportError).toHaveBeenCalledWith(original, 'apiPost');
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

  describe('getAPIUrl', () => {
    it('returns proxy URL with encoded cosmicGame base + path', () => {
      const result = getAPIUrl('rounds/list/0/100');

      expect(result).toContain(proxyUrl);
      expect(result).toContain(encodeURIComponent(cosmicGameBaseUrl + 'rounds/list/0/100'));
    });

    it('encodes special characters in the path', () => {
      const result = getAPIUrl('search?q=hello world&limit=10');

      expect(decodeURIComponent(result.replace(proxyUrl, ''))).toBe(
        cosmicGameBaseUrl + 'search?q=hello world&limit=10',
      );
    });

    it('handles empty path', () => {
      const result = getAPIUrl('');

      expect(result).toBe(`${proxyUrl}${encodeURIComponent(cosmicGameBaseUrl)}`);
    });
  });

  describe('getMainAPIUrl', () => {
    it('returns proxy URL with encoded main base + path', () => {
      const result = getMainAPIUrl('get_banned_bids');

      expect(result).toContain(proxyUrl);
      expect(result).toContain(encodeURIComponent(baseUrl + 'get_banned_bids'));
    });

    it('encodes special characters in the path', () => {
      const result = getMainAPIUrl('action?id=42&type=ban');

      expect(decodeURIComponent(result.replace(proxyUrl, ''))).toBe(
        baseUrl + 'action?id=42&type=ban',
      );
    });

    it('handles empty path', () => {
      const result = getMainAPIUrl('');

      expect(result).toBe(`${proxyUrl}${encodeURIComponent(baseUrl)}`);
    });
  });

  describe('flattenRoundInfo', () => {
    const fullRound = {
      RoundNum: 5,
      ClaimPrizeTx: {
        Tx: {
          EvtLogId: 10,
          BlockNum: 200,
          TxId: 10,
          TxHash: '0xclaimhash',
          TimeStamp: 1700000000,
          DateTime: '2023-11-14',
        },
      },
      MainPrize: {
        WinnerAddr: '0xwinner',
        EthAmountEth: 1.5,
        NftTokenId: 42,
        CstAmountEth: 10,
      },
      CharityDeposit: {
        CharityAddress: '0xcharity',
        CharityAmountETH: 0.5,
      },
      StakingDeposit: {
        StakingDepositAmountEth: 0.3,
        StakingPerTokenEth: 0.01,
        StakingNumStakedTokens: 30,
      },
      EnduranceChampion: {
        WinnerAddr: '0xendurance',
        NftTokenId: 7,
        CstAmountEth: 5,
      },
      LastCstBidder: {
        WinnerAddr: '0xlast',
        NftTokenId: 8,
        CstAmountEth: 3,
      },
      ChronoWarrior: {
        WinnerAddr: '0xchrono',
        EthAmountEth: 0.2,
        CstAmountEth: 1,
        NftTokenId: 9,
      },
      RoundStats: { TotalBids: 100 },
      RaffleNFTWinners: [{ Addr: '0xr1' }],
      StakingNFTWinners: [{ Addr: '0xs1' }],
      RaffleETHDeposits: [{ Amount: 0.1 }],
      AllPrizes: [{ PrizeType: 'main' }],
    };

    it('flattens a complete round with all nested objects', () => {
      const result = flattenRoundInfo(fullRound) as Record<string, unknown>;

      expect(result).toHaveProperty('RoundNum', 5);
      expect(result).toHaveProperty('TxHash', '0xclaimhash');
      expect(result).toHaveProperty('EvtLogId', 10);
      expect(result).toHaveProperty('BlockNum', 200);
      expect(result).toHaveProperty('WinnerAddr', '0xwinner');
      expect(result).toHaveProperty('AmountEth', 1.5);
      expect(result).toHaveProperty('TokenId', 42);
      expect(result).toHaveProperty('CharityAddress', '0xcharity');
      expect(result).toHaveProperty('CharityAmountETH', 0.5);
      expect(result).toHaveProperty('StakingDepositAmountEth', 0.3);
      expect(result).toHaveProperty('EnduranceWinnerAddr', '0xendurance');
      expect(result).toHaveProperty('LastCstBidderAddr', '0xlast');
      expect(result).toHaveProperty('ChronoWarriorAddr', '0xchrono');
      expect(result.RoundStats).toEqual({ TotalBids: 100 });
      expect(result.RaffleNFTWinners).toEqual([{ Addr: '0xr1' }]);
    });

    it('returns null for null input', () => {
      expect(flattenRoundInfo(null)).toBeNull();
    });

    it('returns null for undefined input', () => {
      expect(flattenRoundInfo(undefined)).toBeNull();
    });

    it('returns null for non-object input', () => {
      expect(flattenRoundInfo('string')).toBeNull();
      expect(flattenRoundInfo(42)).toBeNull();
    });

    it('defaults missing nested objects to empty values', () => {
      const result = flattenRoundInfo({ RoundNum: 1 }) as Record<string, unknown>;

      expect(result).toHaveProperty('WinnerAddr', '');
      expect(result).toHaveProperty('AmountEth', 0);
      expect(result).toHaveProperty('TokenId', -1);
      expect(result).toHaveProperty('CharityAddress', '');
      expect(result).toHaveProperty('StakingDepositAmountEth', 0);
      expect(result).toHaveProperty('EnduranceWinnerAddr', '');
      expect(result).toHaveProperty('LastCstBidderAddr', '');
      expect(result).toHaveProperty('ChronoWarriorAddr', '');
      expect(result.RoundStats).toEqual({});
      expect(result.RaffleNFTWinners).toEqual([]);
      expect(result.StakingNFTWinners).toEqual([]);
      expect(result.RaffleETHDeposits).toEqual([]);
      expect(result.AllPrizes).toEqual([]);
    });

    it('handles ClaimPrizeTx without nested Tx', () => {
      const result = flattenRoundInfo({
        RoundNum: 2,
        ClaimPrizeTx: { SomeField: 'value' },
      }) as Record<string, unknown>;

      expect(result.EvtLogId).toBeUndefined();
      expect(result.TxHash).toBeUndefined();
    });

    it('uses NftTokenId ?? -1 so 0 is preserved', () => {
      const result = flattenRoundInfo({
        MainPrize: { NftTokenId: 0 },
      }) as Record<string, unknown>;

      expect(result).toHaveProperty('TokenId', 0);
    });
  });
});

describe('assertApiEnvelope', () => {
  const wrap = (data: unknown) => ({ data }) as import('axios').AxiosResponse;

  it('passes through when status is 1 (success)', () => {
    expect(() => assertApiEnvelope(wrap({ status: 1, error: '' }))).not.toThrow();
  });

  it('throws with backend message when status is 0', () => {
    expect(() => assertApiEnvelope(wrap({ status: 0, error: 'bad input' }))).toThrow('bad input');
  });

  it('throws generic message when status is 0 and error is empty', () => {
    expect(() => assertApiEnvelope(wrap({ status: 0, error: '' }))).toThrow(
      'API returned an error',
    );
  });

  it('throws when error field is present without status field', () => {
    expect(() => assertApiEnvelope(wrap({ error: 'something went wrong' }))).toThrow(
      'something went wrong',
    );
  });

  it('does not throw for empty error string without status', () => {
    expect(() => assertApiEnvelope(wrap({ error: '' }))).not.toThrow();
  });

  it('passes through array responses', () => {
    expect(() => assertApiEnvelope(wrap([1, 2, 3]))).not.toThrow();
  });

  it('passes through null data', () => {
    expect(() => assertApiEnvelope(wrap(null))).not.toThrow();
  });

  it('passes through string data', () => {
    expect(() => assertApiEnvelope(wrap('ok'))).not.toThrow();
  });

  it('passes through objects without status or error fields', () => {
    expect(() => assertApiEnvelope(wrap({ data: [1, 2] }))).not.toThrow();
  });

  it('throws for non-1 numeric status (e.g. 2)', () => {
    expect(() => assertApiEnvelope(wrap({ status: 2 }))).toThrow('API returned an error');
  });
});
