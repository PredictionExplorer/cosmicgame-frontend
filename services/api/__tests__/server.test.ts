import { getCurrentSpecialRecipientsSeed, getLatestGestureSeed } from '../server';

const fetchMock = jest.fn();

function response(body: unknown, ok = true): Response {
  return {
    ok,
    json: jest.fn().mockResolvedValue(body),
  } as unknown as Response;
}

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = fetchMock;
});

describe('home intelligence server seeds', () => {
  it('fetches only the newest gesture and normalizes its transaction envelope', async () => {
    fetchMock.mockResolvedValue(
      response({
        BidsByRound: [
          {
            RoundNum: 7,
            BidderAddr: '0x1111111111111111111111111111111111111111',
            BidType: 0,
            EthPriceEth: 0.01,
            Message: 'seeded',
            Tx: {
              EvtLogId: 77,
              BlockNum: 123,
              TxId: 9,
              TxHash: '0xhash',
              TimeStamp: 1_700_000_000,
              DateTime: '2023-11-14T22:13:20Z',
            },
          },
        ],
      }),
    );

    const latest = await getLatestGestureSeed(7);

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('bid/list/by_round/7/1/0/1'), // lexicon-allow-backend-type
      expect.objectContaining({ next: { revalidate: 15 } }),
    );
    expect(latest).toEqual(
      expect.objectContaining({
        EvtLogId: 77,
        GestureType: 0,
        GestureCostEth: 0.01,
        Message: 'seeded',
      }),
    );
  });

  it('does not request a gesture for an invalid cycle', async () => {
    expect(await getLatestGestureSeed(-1)).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('fails soft when the latest-gesture payload is malformed', async () => {
    fetchMock.mockResolvedValue(response({ BidsByRound: [{ broken: true }] }));
    expect(await getLatestGestureSeed(8)).toBeNull();
  });

  it('validates and returns the current special-recipient snapshot', async () => {
    const snapshot = {
      EnduranceChampionAddress: '0x1111111111111111111111111111111111111111',
      EnduranceChampionDuration: 1200,
      ChronoWarriorAddress: '0x2222222222222222222222222222222222222222',
      ChronoWarriorDuration: 1800,
      LastBidderAddress: '0x3333333333333333333333333333333333333333',
      LastBidderLastBidTime: 1_700_000_000,
    };
    fetchMock.mockResolvedValue(response(snapshot));

    await expect(getCurrentSpecialRecipientsSeed()).resolves.toEqual(snapshot);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('bid/current_special_winners'), // lexicon-allow-backend-type
      expect.objectContaining({ next: { revalidate: 15 } }),
    );
  });

  it('fails soft when a seed endpoint is unavailable', async () => {
    fetchMock.mockResolvedValue(response({}, false));
    await expect(getCurrentSpecialRecipientsSeed()).resolves.toBeNull();
  });
});
