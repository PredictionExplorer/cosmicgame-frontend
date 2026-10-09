import type { Log } from 'viem';
import { encodeAbiParameters, encodeEventTopics } from 'viem/utils';

import { randomWalkNftAbi } from '@/contracts/generated';

import { imprintedTokenId } from '../randomWalkImprint';

const CONTRACT = '0x895a6F444BE4ba9d124F61DF736605792B35D66b';
const ACCOUNT = '0x1111111111111111111111111111111111111111';
const OTHER = '0x2222222222222222222222222222222222222222';
const zeroAddress = '0x0000000000000000000000000000000000000000';

function log(
  eventName: 'MintEvent' | 'Transfer', // lexicon-allow-abi
  args: Record<string, unknown>,
  data: `0x${string}` = '0x',
  address: string = CONTRACT,
): Log {
  return {
    address: address as `0x${string}`,
    topics: encodeEventTopics({
      abi: randomWalkNftAbi,
      eventName,
      args,
    } as Parameters<typeof encodeEventTopics>[0]) as Log['topics'],
    data,
    blockHash: null,
    blockNumber: null,
    logIndex: null,
    transactionHash: null,
    transactionIndex: null,
    removed: false,
  };
}

const imprintLog = (tokenId: bigint, owner = ACCOUNT, address = CONTRACT) =>
  log(
    'MintEvent', // lexicon-allow-abi
    { param0: tokenId, param1: owner },
    encodeAbiParameters(
      [{ type: 'bytes32' }, { type: 'uint256' }],
      [`0x${'ab'.repeat(32)}`, 10n ** 16n],
    ),
    address,
  );

describe('imprintedTokenId', () => {
  it('reads the new token from the contract’s imprint event', () => {
    expect(imprintedTokenId({ logs: [imprintLog(4242n)] }, ACCOUNT, CONTRACT)).toBe(4242);
  });

  it('falls back to the transfer from the zero address to the account', () => {
    const transfer = log('Transfer', { param0: zeroAddress, param1: ACCOUNT, param2: 77n });
    expect(imprintedTokenId({ logs: [transfer] }, ACCOUNT, CONTRACT)).toBe(77);
  });

  it('ignores events from other contracts and tokens imprinted for someone else', () => {
    const foreign = imprintLog(1n, ACCOUNT, OTHER);
    const otherOwner = imprintLog(2n, OTHER);
    const resale = log('Transfer', { param0: OTHER, param1: ACCOUNT, param2: 3n });
    expect(imprintedTokenId({ logs: [foreign, otherOwner, resale] }, ACCOUNT, CONTRACT)).toBeNull();
  });

  it('returns null for a receipt without the events', () => {
    expect(imprintedTokenId({ logs: [] }, ACCOUNT, CONTRACT)).toBeNull();
  });
});
