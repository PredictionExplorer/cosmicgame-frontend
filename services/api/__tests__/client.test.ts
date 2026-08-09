// lexicon-allow-start: service test fixtures mirror the backend-sealed API surface

import { AxiosError } from 'axios';

import {
  axios as clientAxios,
  apiCallEmptyOn404,
  apiCallRequired,
  apiGet,
  flattenTx,
  flattenTxArray,
  normalizeGestureRecord,
  flattenGestureArray,
  flattenRoundInfo,
  normalizeFieldNames,
  normalizeFieldNamesArray,
  getAPIUrl,
  getMainAPIUrl,
  cosmicGameBaseUrl,
  baseUrl,
  apiCall,
  apiPost,
  assertApiEnvelope,
  pagedPath,
  DEFAULT_API_PAGE_LIMIT,
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

const makeAxios404 = (): AxiosError => {
  const err = new AxiosError('Not Found', 'ERR_BAD_REQUEST', undefined, undefined, {
    status: 404,
    statusText: 'Not Found',
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

  it('returns [] fallback on Axios 404', async () => {
    const result = await apiCall(async () => {
      throw makeAxios404();
    }, [] as number[]);
    expect(result).toEqual([]);
  });

  it('does not report 404 errors to Sentry', async () => {
    await apiCall(async () => {
      throw makeAxios404();
    }, []);
    expect(mockReportError).not.toHaveBeenCalled();
  });

  it('throws for Axios 401 errors and reports to Sentry', async () => {
    const err = new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', undefined, undefined, {
      status: 401,
      statusText: 'Unauthorized',
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

describe('apiCallRequired', () => {
  it('returns fn() result on success', async () => {
    expect(await apiCallRequired(async () => [1, 2, 3])).toEqual([1, 2, 3]);
    expect(mockReportError).not.toHaveBeenCalled();
  });

  it.each([
    ['400', makeAxios400],
    ['403', makeAxios403],
    ['404', makeAxios404],
    ['500', makeAxios500],
  ])('propagates a %s instead of a fallback, and reports it', async (_label, makeError) => {
    const original = makeError();
    await expect(
      apiCallRequired(async () => {
        throw original;
      }),
    ).rejects.toThrow('Network response was not OK');
    expect(mockReportError).toHaveBeenCalledWith(original, 'apiCallRequired');
  });

  it('propagates a network error with no response', async () => {
    await expect(
      apiCallRequired(async () => {
        throw makeAxiosNoResponse();
      }),
    ).rejects.toThrow('Network response was not OK');
  });

  it('keeps a schema mismatch message intact so the field path survives', async () => {
    const mismatch = new Error('schemaMismatch:DashboardInfo — CurRoundNum: expected number');
    await expect(
      apiCallRequired(async () => {
        throw mismatch;
      }),
    ).rejects.toThrow('schemaMismatch:DashboardInfo — CurRoundNum: expected number');
    expect(mockReportError).toHaveBeenCalledWith(mismatch, 'apiCallRequired');
  });

  it('normalizes a non-Error throwable', async () => {
    await expect(
      apiCallRequired(async () => {
        throw 'string error';
      }),
    ).rejects.toThrow('Network response was not OK');
  });
});

describe('apiCallEmptyOn404', () => {
  it('returns fn() result on success', async () => {
    expect(await apiCallEmptyOn404(async () => ['ok'], [])).toEqual(['ok']);
  });

  it('returns the fallback on 404, which means the route or record is absent', async () => {
    const result = await apiCallEmptyOn404(async () => {
      throw makeAxios404();
    }, [] as number[]);
    expect(result).toEqual([]);
    expect(mockReportError).not.toHaveBeenCalled();
  });

  it('returns a null fallback on 404', async () => {
    const result = await apiCallEmptyOn404(async (): Promise<string | null> => {
      throw makeAxios404();
    }, null);
    expect(result).toBeNull();
  });

  it.each([
    ['400', makeAxios400],
    ['403', makeAxios403],
    ['500', makeAxios500],
  ])('propagates a %s rather than treating it as empty', async (_label, makeError) => {
    const original = makeError();
    await expect(
      apiCallEmptyOn404(async () => {
        throw original;
      }, []),
    ).rejects.toThrow('Network response was not OK');
    expect(mockReportError).toHaveBeenCalledWith(original, 'apiCallEmptyOn404');
  });

  it('propagates a schema mismatch with its message', async () => {
    await expect(
      apiCallEmptyOn404(async () => {
        throw new Error(
          'schemaMismatch:RoundClaimSummary[byRound] — 0.EthAwarded: expected number',
        );
      }, []),
    ).rejects.toThrow(/schemaMismatch:RoundClaimSummary/);
  });
});

describe('apiGet', () => {
  const adapter = jest.fn();

  beforeEach(() => {
    adapter.mockReset();
    adapter.mockImplementation(async (config: unknown) => ({
      data: { ok: true },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    }));
  });

  it('attaches the caller abort signal to the request', async () => {
    const controller = new AbortController();

    const response = await apiGet(
      '/api/cosmicgame/test',
      { signal: controller.signal },
      {
        adapter,
      },
    );

    expect(response.data).toEqual({ ok: true });
    expect(adapter.mock.calls[0]?.[0]).toMatchObject({ signal: controller.signal });
  });

  it('merges the signal with an existing request config', async () => {
    const controller = new AbortController();

    await apiGet(
      '/api/cosmicgame/test',
      { signal: controller.signal },
      {
        adapter,
        params: { limit: 5 },
      },
    );

    expect(adapter.mock.calls[0]?.[0]).toMatchObject({
      signal: controller.signal,
      params: { limit: 5 },
    });
  });

  it('sends no signal when the caller passes no options', async () => {
    await apiGet('/api/cosmicgame/test', undefined, { adapter });

    expect(adapter.mock.calls[0]?.[0]?.signal).toBeUndefined();
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

describe('pagedPath', () => {
  it('defaults to the historical fetch-everything window', () => {
    expect(pagedPath()).toBe(`0/${DEFAULT_API_PAGE_LIMIT}`);
    expect(pagedPath({})).toBe(`0/${DEFAULT_API_PAGE_LIMIT}`);
  });

  it('builds an explicit offset/limit window', () => {
    expect(pagedPath({ offset: 200, limit: 50 })).toBe('200/50');
  });

  it('keeps the default limit when only an offset is provided', () => {
    expect(pagedPath({ offset: 25 })).toBe(`25/${DEFAULT_API_PAGE_LIMIT}`);
  });

  it('clamps negative and fractional windows to sane values', () => {
    expect(pagedPath({ offset: -5, limit: -10 })).toBe('0/1');
    expect(pagedPath({ offset: 1.9, limit: 10.7 })).toBe('1/10');
  });
});

describe('client helper functions', () => {
  describe('axios response interceptor', () => {
    it('throws backend envelope errors returned through axios', async () => {
      await expect(
        clientAxios.get('/api/cosmicgame/test', {
          adapter: async (config) => ({
            data: { status: 0, error: 'backend rejected payload' },
            status: 200,
            statusText: 'OK',
            headers: {},
            config,
          }),
        }),
      ).rejects.toThrow('backend rejected payload');
    });
  });

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

    it('keeps __proto__ payloads as data and does not pollute Object.prototype', () => {
      const input = JSON.parse(
        '{"EvtLogId":1,"__proto__":{"polluted":true},"Tx":{"TxHash":"0xabc","__proto__":{"txPolluted":true}}}',
      );

      const result = flattenTx(input) as Record<string, unknown>;

      expect(result).toHaveProperty('TxHash', '0xabc');
      expect(({} as Record<string, unknown>).polluted).toBeUndefined();
      expect(({} as Record<string, unknown>).txPolluted).toBeUndefined();
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

  describe('normalizeGestureRecord', () => {
    it('maps BidType to GestureType and aliases CST price and reward fields', () => {
      const result = normalizeGestureRecord({
        BidType: 2,
        CstPriceEth: 12.5,
        CSTRewardEth: 100,
        EthPriceEth: -1,
        Tx: {
          EvtLogId: 1,
          BlockNum: 1,
          TxId: 1,
          TxHash: '0xabc',
          TimeStamp: 1,
          DateTime: '',
        },
      }) as Record<string, unknown>;

      expect(result.GestureType).toBe(2);
      expect(result.CstCost).toBe(12.5);
      expect(result.NumCSTokensEth).toBe(12.5);
      expect(result.NumCSTTokensEth).toBe(12.5);
      expect(result.ParticipationCST).toBe(100);
      expect(result.ERC20RewardAmountEth).toBe(100);
      expect(result.GestureCostEth).toBeUndefined();
    });

    it('keeps legacy CST cost aliases compatible', () => {
      const fromCanonical = normalizeGestureRecord({
        GestureType: 2,
        NumCSTokensEth: 33,
      }) as Record<string, unknown>;
      const fromTypoAlias = normalizeGestureRecord({
        GestureType: 2,
        NumCSTTokensEth: 44,
      }) as Record<string, unknown>;

      expect(fromCanonical.CstCost).toBe(33);
      expect(fromCanonical.NumCSTTokensEth).toBe(33);
      expect(fromTypoAlias.CstCost).toBe(44);
      expect(fromTypoAlias.NumCSTokensEth).toBe(44);
    });

    it('continues to map ETH price fields for non-CST gestures', () => {
      const result = normalizeGestureRecord({
        BidType: 0,
        EthPriceEth: 0.125,
        CstPriceEth: -1,
      }) as Record<string, unknown>;

      expect(result.GestureType).toBe(0);
      expect(result.GestureCostEth).toBe(0.125);
      expect(result.CstCost).toBeUndefined();
    });

    it('preserves an explicit GestureType', () => {
      const result = normalizeGestureRecord({ GestureType: 0, BidType: 2 }) as Record<
        string,
        unknown
      >;

      expect(result.GestureType).toBe(0);
    });
  });

  describe('flattenGestureArray', () => {
    it('normalizes every bid in the array', () => {
      const result = flattenGestureArray<{ GestureType: number }>([
        { BidType: 1, EthPriceEth: 0.05 },
      ]);

      expect(result[0]?.GestureType).toBe(1);
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

    it('normalizes malicious JSON without prototype pollution', () => {
      const input = JSON.parse('{"TokenAddress":"0x123","__proto__":{"polluted":true}}');

      const result = normalizeFieldNames(input) as Record<string, unknown>;

      expect(result).toHaveProperty('TokenAddr', '0x123');
      expect(({} as Record<string, unknown>).polluted).toBeUndefined();
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
    it('returns direct URL with cosmicGame base + path', () => {
      const result = getAPIUrl('rounds/list/0/100');

      expect(result).toBe(cosmicGameBaseUrl + 'rounds/list/0/100');
    });

    it('passes path through without encoding', () => {
      const result = getAPIUrl('search?q=hello world&limit=10');

      expect(result).toBe(cosmicGameBaseUrl + 'search?q=hello world&limit=10');
    });

    it('handles empty path', () => {
      const result = getAPIUrl('');

      expect(result).toBe(cosmicGameBaseUrl);
    });

    it('joins base and leading-slash paths with exactly one slash', () => {
      const result = getAPIUrl('/rounds/list/0/100');
      const expectedBase = cosmicGameBaseUrl.replace(/\/+$/, '');

      expect(result).toBe(`${expectedBase}/rounds/list/0/100`);
    });
  });

  describe('getMainAPIUrl', () => {
    // The main API is served by the rotated servers; the base is the origin
    // of jest.setup.ts NEXT_PUBLIC_API_URL, not the legacy nftApiUrl host.
    const rotatedOrigin = 'http://test-api.example';

    it('returns direct URL against the rotated API origin', () => {
      const result = getMainAPIUrl('get_banned_bids');

      expect(result).toBe(`${rotatedOrigin}/get_banned_bids`);
    });

    it('passes path through without encoding', () => {
      const result = getMainAPIUrl('action?id=42&type=ban');

      expect(result).toBe(`${rotatedOrigin}/action?id=42&type=ban`);
    });

    it('handles empty path (historical contract: raw nftApiUrl base)', () => {
      const result = getMainAPIUrl('');

      expect(result).toBe(baseUrl);
    });

    it('joins base and leading-slash paths with exactly one slash', () => {
      const result = getMainAPIUrl('/get_banned_bids');

      expect(result).toBe(`${rotatedOrigin}/get_banned_bids`);
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

    it('flattens nested Tx fields in AllPrizes entries', () => {
      const result = flattenRoundInfo({
        RoundNum: 3,
        AllPrizes: [
          {
            RecordType: 0,
            WinnerAddr: '0xw1',
            AmountEth: 1.25,
            Tx: {
              TxHash: '0xprizehash',
              TimeStamp: 1700000000,
              EvtLogId: 99,
            },
          },
        ],
      }) as Record<string, unknown>;

      expect(result.AllPrizes).toEqual([
        expect.objectContaining({
          RecordType: 0,
          WinnerAddr: '0xw1',
          AmountEth: 1.25,
          TxHash: '0xprizehash',
          TimeStamp: 1700000000,
          EvtLogId: 99,
        }),
      ]);
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

    it('flattens nested Tx fields in RaffleNFTWinners entries', () => {
      const result = flattenRoundInfo({
        RoundNum: 0,
        RaffleNFTWinners: [
          {
            WinnerAddr: '0xw1',
            Tx: {
              TxHash: '0xnftwin',
              TimeStamp: 1700000001,
              EvtLogId: 55,
            },
          },
        ],
      }) as Record<string, unknown>;

      expect(result.RaffleNFTWinners).toEqual([
        {
          WinnerAddr: '0xw1',
          TxHash: '0xnftwin',
          TimeStamp: 1700000001,
          EvtLogId: 55,
        },
      ]);
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

// lexicon-allow-end
