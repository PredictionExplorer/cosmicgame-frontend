import { get_cst_transfers, get_ct_transfers } from '@/services/api/tokens';

import { ledgerRow, readTransferHistorySeed } from '../transferHistoryRoute';

jest.mock('@/services/api/tokens', () => ({
  get_ct_transfers: jest.fn(),
  get_cst_transfers: jest.fn(),
}));

const ADDRESS = '0xA169574D0d353E3010997A3E64846b7D1B2a63B6';

// The API row as the indexer sends it, flattened: the ledger reads 7 of 14 fields.
const CST_ROW = {
  RecordId: 6193,
  EvtLogId: 29443,
  BlockNum: 508158171,
  TxId: 9617,
  TxHash: '0x6507',
  TimeStamp: 1790175928,
  DateTime: '2026-09-23T15:05:28Z',
  FromAddr: '0x0000000000000000000000000000000000000000',
  ToAddr: ADDRESS,
  FromAid: 13,
  ToAid: 976,
  TransferType: 1,
  Value: '176768030409476485098',
  ValueFloat: 176.77,
};

describe('transfer history seed', () => {
  it('embeds only the fields the ledger reads (a 578-row history weighed 410 KB)', async () => {
    jest.mocked(get_ct_transfers).mockResolvedValue([CST_ROW] as never);
    const [seed] = await readTransferHistorySeed('cst', ADDRESS);
    expect(seed?.queryKey[0]).toBe('ctTransfers');
    expect(seed?.data).toEqual([
      {
        EvtLogId: 29443,
        TxHash: '0x6507',
        TimeStamp: 1790175928,
        FromAddr: CST_ROW.FromAddr,
        ToAddr: ADDRESS,
        Value: CST_ROW.Value,
        ValueFloat: 176.77,
      },
    ]);
  });

  it('keeps the token of an NFT row', async () => {
    jest
      .mocked(get_cst_transfers)
      .mockResolvedValue([{ ...CST_ROW, TokenId: 24, Value: undefined }] as never);
    const [seed] = await readTransferHistorySeed('nft', ADDRESS);
    expect(seed?.queryKey[0]).toBe('cstTransfers');
    expect(seed?.data).toEqual([expect.objectContaining({ TokenId: 24 })]);
    expect(Object.keys((seed?.data as object[])[0] ?? {})).not.toContain('BlockNum');
  });

  it('leaves out a field the row does not have', () => {
    expect(ledgerRow('nft', { EvtLogId: 1 })).toEqual({ EvtLogId: 1 });
  });

  it('seeds nothing for an invalid address or a failed read', async () => {
    expect(await readTransferHistorySeed('cst', 'not-an-address')).toEqual([]);
    jest.mocked(get_ct_transfers).mockRejectedValue(new Error('offline'));
    expect(await readTransferHistorySeed('cst', ADDRESS)).toEqual([]);
  });
});
