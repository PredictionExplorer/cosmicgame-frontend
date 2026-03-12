import axios from 'axios';

import { get_current_time, get_system_modelist, get_system_events } from '@/services/api/system';

jest.mock('axios', () => {
  const actual = jest.requireActual<typeof import('axios')>('axios');
  return {
    __esModule: true,
    default: {
      get: jest.fn(),
      post: jest.fn(),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    },
    isAxiosError: actual.isAxiosError,
  };
});
const mockedAxios = axios as jest.Mocked<typeof axios>;

const make400 = () =>
  Object.assign(new Error('Bad Request'), {
    response: { status: 400 },
    isAxiosError: true,
  });

const TX = { EvtLogId: 1, BlockNum: 50, TxId: 1, TxHash: '0xm', TimeStamp: 200, DateTime: '' };

beforeEach(() => {
  jest.clearAllMocks();
});

describe('system API', () => {
  describe('get_current_time', () => {
    it('returns timestamp on success', async () => {
      mockedAxios.get.mockResolvedValue({ data: { CurrentTimeStamp: 1700000000 } });

      const result = await get_current_time();

      expect(result).toBe(1700000000);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/proxy\?url=.*time.*current/),
      );
    });

    it('returns 0 on 400 response', async () => {
      mockedAxios.get.mockRejectedValue(make400());

      const result = await get_current_time();

      expect(result).toBe(0);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network Error'));

      await expect(get_current_time()).rejects.toThrow('Network response was not OK');
    });
  });

  describe('get_system_modelist', () => {
    it('returns flattened mode changes on success', async () => {
      mockedAxios.get.mockResolvedValue({
        data: { SystemModeChanges: [{ EvtLogId: 1, Tx: TX }] },
      });

      const result = await get_system_modelist();

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('TxHash', '0xm');
      expect(result[0]).not.toHaveProperty('Tx');
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/proxy\?url=.*system.*modelist/),
      );
    });

    it('returns empty array on 400 response', async () => {
      mockedAxios.get.mockRejectedValue(make400());

      const result = await get_system_modelist();

      expect(result).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network Error'));

      await expect(get_system_modelist()).rejects.toThrow('Network response was not OK');
    });
  });

  describe('get_system_events', () => {
    it('returns flattened events on success', async () => {
      mockedAxios.get.mockResolvedValue({
        data: {
          AdminEvents: [{ EvtLogId: 3, Tx: { ...TX, EvtLogId: 3, TxHash: '0xe', TimeStamp: 300 } }],
        },
      });

      const result = await get_system_events(0, 100);

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('TxHash', '0xe');
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/proxy\?url=.*system.*admin_events.*0.*100/),
      );
    });

    it('returns empty array on 400 response', async () => {
      mockedAxios.get.mockRejectedValue(make400());

      const result = await get_system_events(0, 100);

      expect(result).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network Error'));

      await expect(get_system_events(0, 100)).rejects.toThrow('Network response was not OK');
    });
  });
});
