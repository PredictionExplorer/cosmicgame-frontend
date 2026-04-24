/**
 * Jest mock for `viem`. Used for unit tests that touch viem indirectly via
 * hooks / utils without pulling in the real ESM build (which is slow and
 * has deep WalletConnect dependencies that don't work under jsdom).
 *
 * Imported via CommonJS (`module.exports =`) so `jest.requireActual(...)`
 * at call sites can spread this object into a partial viem mock.
 */
type Num = number | bigint | string;

module.exports = {
  formatEther: (val: Num) => String(Number(val) / 1e18),
  parseEther: (val: string) => BigInt(Math.round(Number(val) * 1e18)),
  formatUnits: (val: Num, decimals: number) => String(Number(val) / Math.pow(10, decimals)),
  parseUnits: (val: string, decimals: number) =>
    BigInt(Math.round(Number(val) * Math.pow(10, decimals))),
  isAddress: (addr: string) => /^0x[0-9a-fA-F]{40}$/.test(addr),
  getAddress: (addr: string) => addr,
  zeroAddress: '0x0000000000000000000000000000000000000000',
  maxUint256: BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'),
};
