import { anchoredNftDistributions } from '../anchorLedger';

describe('anchoredNftDistributions', () => {
  const deposit = (id: number, ts: number, actions: unknown[]) => ({
    DepositId: id,
    TimeStamp: ts,
    DepositRoundNum: id,
    NumStakedNFTs: 4,
    DepositAmountEth: 1,
    TxHash: `0x${id}`,
    Actions: actions,
  });

  it('gives each NFT its own deposits, newest first, and its latest anchor', () => {
    const rows = anchoredNftDistributions(
      [
        { TokenId: 3, RewardCollectedEth: 0.25, RewardToCollectEth: 0 },
        { TokenId: 7, RewardCollectedEth: 0, RewardToCollectEth: 0.5 },
      ],
      [
        deposit(1, 100, [
          { Stake: { TokenId: 3 }, RewardEth: 0.25, Claimed: true },
          { Stake: { TokenId: 7 }, RewardEth: 0.25, Claimed: false },
        ]),
        deposit(2, 200, [{ Stake: { TokenId: 7 }, RewardEth: 0.25, Claimed: false }]),
      ],
      [
        { ActionType: 0, TokenId: 3, TimeStamp: 10 },
        { ActionType: 1, TokenId: 3, TimeStamp: 150 },
        { ActionType: 0, TokenId: 7, TimeStamp: 20 },
        { ActionType: 0, TokenId: 7, TimeStamp: 5 },
      ],
    );
    expect(rows.map((row) => row.tokenId)).toEqual([7, 3]);
    expect(rows[0]).toMatchObject({ anchoredAt: 20, retrievedEth: 0, toRetrieveEth: 0.5 });
    expect(rows[0]?.deposits.map((d) => d.depositId)).toEqual([2, 1]);
    expect(rows[1]?.deposits).toEqual([
      expect.objectContaining({ depositId: 1, distributionEth: 0.25, retrieved: true, cycle: 1 }),
    ]);
  });

  it('keeps an NFT whose records are missing, without inventing an anchor date', () => {
    const rows = anchoredNftDistributions([{ TokenId: 1 }], [{ DepositId: 1 }], []);
    expect(rows).toEqual([
      { tokenId: 1, anchoredAt: null, retrievedEth: 0, toRetrieveEth: 0, deposits: [] },
    ]);
  });

  it('skips rows that name no token', () => {
    expect(anchoredNftDistributions([null, { TokenId: -1 }, {}], [], [])).toEqual([]);
  });
});
