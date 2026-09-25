import type { PublicClient } from 'viem';

import { readAnchorableRandomWalkIds } from '../randomWalkAnchorable';

const ACCOUNT = '0x1111111111111111111111111111111111111111';
const NFT = '0x2222222222222222222222222222222222222222';
const ANCHORING = '0x3333333333333333333333333333333333333333';
const SOURCE = { account: ACCOUNT, nft: NFT, anchoring: ANCHORING } as const;

interface Call {
  address: string;
  functionName: string;
  args: readonly unknown[];
}

/** A public client whose contract reads answer from `owned` and `used` (token id → flag). */
function client(owned: bigint[], used: Record<string, bigint>, { multicall = true } = {}) {
  const readContract = jest.fn(async (call: Call) => {
    if (call.functionName === 'walletOfOwner') return owned;
    return used[String(call.args[0])] ?? 0n;
  });
  const multicallFn = jest.fn(async ({ contracts }: { contracts: Call[] }) =>
    Promise.all(contracts.map((call) => readContract(call))),
  );
  const value = {
    chain: multicall ? { contracts: { multicall3: { address: '0xca11' } } } : { contracts: {} },
    readContract,
    multicall: multicallFn,
  };
  return { client: value as unknown as PublicClient, readContract, multicall: multicallFn };
}

describe('readAnchorableRandomWalkIds', () => {
  it('leaves out every NFT the anchoring contract has ever taken, whoever anchored it', async () => {
    // 1900 was anchored and released by an earlier owner before this wallet bought it.
    const { client: c, multicall } = client([1900n, 12n, 1826n], { '1900': 1n, '1826': 7n });
    await expect(readAnchorableRandomWalkIds(c, SOURCE)).resolves.toEqual([12]);
    expect(multicall).toHaveBeenCalledTimes(1);
    const [{ contracts }] = multicall.mock.calls[0]!;
    expect(contracts.map((call) => [call.address, call.functionName, call.args[0]])).toEqual([
      [ANCHORING, 'usedNfts', 1900n],
      [ANCHORING, 'usedNfts', 12n],
      [ANCHORING, 'usedNfts', 1826n],
    ]);
  });

  it('sorts what is left and reads each flag on its own without a multicall contract', async () => {
    const { client: c, readContract } = client([30n, 4n, 18n], {}, { multicall: false });
    await expect(readAnchorableRandomWalkIds(c, SOURCE)).resolves.toEqual([4, 18, 30]);
    expect(readContract).toHaveBeenCalledTimes(4);
  });

  it('reads nothing more for a wallet without Random Walk NFTs', async () => {
    const { client: c, multicall } = client([], {});
    await expect(readAnchorableRandomWalkIds(c, SOURCE)).resolves.toEqual([]);
    expect(multicall).not.toHaveBeenCalled();
  });

  it('rejects when a read fails, so the page shows an error rather than an empty wallet', async () => {
    const { client: c, multicall } = client([1n], {});
    multicall.mockRejectedValueOnce(new Error('rpc down'));
    await expect(readAnchorableRandomWalkIds(c, SOURCE)).rejects.toThrow('rpc down');
  });
});
