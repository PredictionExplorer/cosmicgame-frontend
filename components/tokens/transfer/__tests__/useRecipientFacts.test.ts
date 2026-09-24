import { readRecipientFacts, recipientWarning } from '../useRecipientFacts';

const ADDRESS = '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed';

describe('readRecipientFacts', () => {
  it('reads the nonce and the code from the public client', async () => {
    const client = {
      getTransactionCount: jest.fn().mockResolvedValue(3),
      getCode: jest.fn().mockResolvedValue(undefined),
    };
    await expect(readRecipientFacts(client, ADDRESS)).resolves.toEqual({
      transactionCount: 3,
      isContract: false,
    });
    expect(client.getTransactionCount).toHaveBeenCalledWith({ address: ADDRESS });
    expect(client.getCode).toHaveBeenCalledWith({ address: ADDRESS });
  });

  it('treats any deployed code as a contract, and "0x" as none', async () => {
    const contract = {
      getTransactionCount: jest.fn().mockResolvedValue(1),
      getCode: jest.fn().mockResolvedValue('0x6080'),
    };
    const empty = {
      getTransactionCount: jest.fn().mockResolvedValue(0),
      getCode: jest.fn().mockResolvedValue('0x'),
    };
    expect((await readRecipientFacts(contract, ADDRESS)).isContract).toBe(true);
    expect((await readRecipientFacts(empty, ADDRESS)).isContract).toBe(false);
  });
});

describe('recipientWarning', () => {
  it('ranks a protocol contract over a contract over a new address', () => {
    expect(recipientWarning({ transactionCount: 0, isContract: true }, 'cst')).toBe('protocol');
    expect(recipientWarning({ transactionCount: 0, isContract: true }, null)).toBe('contract');
    expect(recipientWarning({ transactionCount: 0, isContract: false }, null)).toBe('fresh');
    expect(recipientWarning({ transactionCount: 5, isContract: false }, null)).toBeNull();
  });
});
