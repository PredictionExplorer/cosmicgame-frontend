import { ERC20_TRANSFER_TOPIC, sumImprintedTo } from '../receiptTransfers';

const TOKEN = '0xCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCc';
const ME = '0x1Ec14a00000000000000000000000000000d7E99';
const ZERO_TOPIC = `0x${'0'.repeat(64)}`;
const topicOf = (address: string) => `0x${address.slice(2).toLowerCase().padStart(64, '0')}`;
const amount = (value: bigint) => `0x${value.toString(16).padStart(64, '0')}`;

describe('sumImprintedTo', () => {
  it('sums tokens created for the recipient, matching addresses case-insensitively', () => {
    const logs = [
      {
        address: TOKEN.toLowerCase(),
        topics: [ERC20_TRANSFER_TOPIC, ZERO_TOPIC, topicOf(ME)],
        data: amount(40n),
      },
      { address: TOKEN, topics: [ERC20_TRANSFER_TOPIC, ZERO_TOPIC, topicOf(ME)], data: amount(2n) },
    ];
    expect(sumImprintedTo(logs, TOKEN, ME)).toBe(42n);
  });

  it('ignores ordinary transfers, other tokens, other recipients and other events', () => {
    const logs = [
      {
        address: TOKEN,
        topics: [ERC20_TRANSFER_TOPIC, topicOf(ME), topicOf(ME)],
        data: amount(5n),
      },
      {
        address: '0xdead',
        topics: [ERC20_TRANSFER_TOPIC, ZERO_TOPIC, topicOf(ME)],
        data: amount(5n),
      },
      {
        address: TOKEN,
        topics: [ERC20_TRANSFER_TOPIC, ZERO_TOPIC, topicOf(TOKEN)],
        data: amount(5n),
      },
      {
        address: TOKEN,
        topics: [`0x${'1'.repeat(64)}`, ZERO_TOPIC, topicOf(ME)],
        data: amount(5n),
      },
      { address: TOKEN, topics: [ERC20_TRANSFER_TOPIC, ZERO_TOPIC, topicOf(ME)], data: '0xnothex' },
    ];
    expect(sumImprintedTo(logs, TOKEN, ME)).toBe(0n);
  });

  it('returns zero when anything needed is missing', () => {
    expect(sumImprintedTo(undefined, TOKEN, ME)).toBe(0n);
    expect(sumImprintedTo([], '', ME)).toBe(0n);
    expect(sumImprintedTo([], TOKEN, null)).toBe(0n);
  });
});
