import { protocolFacts } from '@/content/protocol-facts';

import {
  PINNED_GAME_PROXY,
  PROTOCOL_ADDRESS_GETTERS,
  TRUSTED_ADDRESSES_TTL_MS,
  assertTrustedWrite,
  clearTrustedAddressCache,
  gameRootFor,
  readTrustedAddresses,
  type ContractReader,
} from '../writeTargets';

const PROXY = protocolFacts.contractAddresses.proxy;
const API_GAME = '0x00000000000000000000000000000000000000a1';
const ALLOCATIONS_WALLET = '0x00000000000000000000000000000000000000B2';
const OUTSIDER = '0x00000000000000000000000000000000000000ee';

function client(named: Record<string, unknown> = { prizesWallet: ALLOCATIONS_WALLET }): {
  reader: ContractReader;
  readContract: jest.Mock;
} {
  const readContract = jest.fn(async ({ functionName }: { functionName: string }) =>
    functionName in named ? named[functionName] : '0x0000000000000000000000000000000000000000',
  );
  return { reader: { readContract } as unknown as ContractReader, readContract };
}

beforeEach(() => clearTrustedAddressCache());

describe('gameRootFor', () => {
  it('ignores the API on Arbitrum One: the proxy is pinned from protocolFacts', () => {
    expect(PINNED_GAME_PROXY[42161]).toBe(PROXY);
    expect(gameRootFor(42161, API_GAME)).toBe(PROXY.toLowerCase());
  });

  it("takes the API's game on a network without a pin", () => {
    expect(gameRootFor(421614, API_GAME)).toBe(API_GAME);
    expect(gameRootFor(421614, '')).toBeNull();
    expect(gameRootFor(421614, 'not an address')).toBeNull();
  });
});

describe('readTrustedAddresses', () => {
  it("trusts the game and every contract it names on-chain, and nothing it doesn't", async () => {
    const { reader, readContract } = client();
    const trusted = await readTrustedAddresses(reader, 421614, API_GAME);

    expect([...trusted].sort()).toEqual([API_GAME, ALLOCATIONS_WALLET.toLowerCase()].sort());
    expect(readContract).toHaveBeenCalledTimes(PROTOCOL_ADDRESS_GETTERS.length);
    for (const call of readContract.mock.calls) {
      expect(call[0]).toMatchObject({ address: API_GAME });
    }
  });

  it('reads the pinned proxy on Arbitrum One even when the API names another game', async () => {
    const { reader, readContract } = client();
    const trusted = await readTrustedAddresses(reader, 42161, API_GAME);

    expect(trusted.has(PROXY.toLowerCase())).toBe(true);
    expect(trusted.has(API_GAME)).toBe(false);
    expect(readContract.mock.calls[0]![0]).toMatchObject({ address: PROXY.toLowerCase() });
  });

  it('reuses one read for a while, then reads again', async () => {
    const { reader, readContract } = client();
    await readTrustedAddresses(reader, 421614, API_GAME, 1_000);
    await readTrustedAddresses(reader, 421614, API_GAME, 2_000);
    expect(readContract).toHaveBeenCalledTimes(PROTOCOL_ADDRESS_GETTERS.length);

    await readTrustedAddresses(reader, 421614, API_GAME, 1_000 + TRUSTED_ADDRESSES_TTL_MS);
    expect(readContract).toHaveBeenCalledTimes(PROTOCOL_ADDRESS_GETTERS.length * 2);
  });

  it('fails, uncached, when the RPC cannot answer, rather than widen the check', async () => {
    const readContract = jest.fn().mockRejectedValue(new Error('HTTP request failed.'));
    const reader = { readContract } as unknown as ContractReader;
    await expect(readTrustedAddresses(reader, 421614, API_GAME)).rejects.toThrow('HTTP request');

    const retry = client();
    await expect(readTrustedAddresses(retry.reader, 421614, API_GAME)).resolves.toBeInstanceOf(Set);
  });

  it('skips a getter an older game does not implement', async () => {
    const readContract = jest.fn(async ({ functionName }: { functionName: string }) => {
      if (functionName === 'charityAddress') {
        throw Object.assign(new Error('returned no data ("0x")'), {
          name: 'ContractFunctionZeroDataError',
        });
      }
      return functionName === 'prizesWallet'
        ? ALLOCATIONS_WALLET
        : '0x0000000000000000000000000000000000000000';
    });
    const trusted = await readTrustedAddresses(
      { readContract } as unknown as ContractReader,
      421614,
      API_GAME,
    );
    expect(trusted.has(ALLOCATIONS_WALLET.toLowerCase())).toBe(true);
  });

  it('refuses when no game is known yet', async () => {
    await expect(readTrustedAddresses(client().reader, 421614, '')).rejects.toMatchObject({
      name: 'ProtocolAddressesUnavailableError',
    });
  });
});

describe('assertTrustedWrite', () => {
  const trusted = new Set([API_GAME, ALLOCATIONS_WALLET.toLowerCase()]);

  it('passes a write to a protocol contract, in any letter case', () => {
    expect(() =>
      assertTrustedWrite(
        { address: API_GAME.toUpperCase().replace('0X', '0x'), functionName: 'bidWithEth' },
        trusted,
      ),
    ).not.toThrow();
  });

  it('refuses a write to any other contract', () => {
    expect(() =>
      assertTrustedWrite({ address: OUTSIDER, functionName: 'bidWithEth' }, trusted),
    ).toThrow(expect.objectContaining({ name: 'UntrustedContractError', role: 'target' }));
  });

  it("judges an approval by its spender, since the token is the participant's own", () => {
    expect(() =>
      assertTrustedWrite(
        { address: OUTSIDER, functionName: 'approve', args: [ALLOCATIONS_WALLET, 10n] },
        trusted,
      ),
    ).not.toThrow();
    for (const functionName of ['approve', 'setApprovalForAll', 'increaseAllowance']) {
      expect(() =>
        assertTrustedWrite({ address: API_GAME, functionName, args: [OUTSIDER, true] }, trusted),
      ).toThrow(expect.objectContaining({ name: 'UntrustedContractError', role: 'spender' }));
    }
  });
});
