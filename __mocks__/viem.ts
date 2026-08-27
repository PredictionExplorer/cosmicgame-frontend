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
  // Real implementation (pure hashing, no heavy deps): tests that derive
  // event topics must produce the same selectors as production code.
  toEventSelector: (event: unknown) =>
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    (require('viem/utils') as { toEventSelector: (e: unknown) => string }).toEventSelector(event),
  getAddress: (addr: string) => addr,
  zeroAddress: '0x0000000000000000000000000000000000000000',
  maxUint256: BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'),
  // Real implementations (pure parsing/decoding, no heavy deps): the local
  // test-harness modules construct ABIs and decode receipt logs at import
  // time, so these must behave like production viem.
  parseAbi: (abi: unknown) =>
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    (require('viem/utils') as { parseAbi: (a: unknown) => unknown }).parseAbi(abi),
  decodeEventLog: (args: unknown) =>
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    (require('viem/utils') as { decodeEventLog: (a: unknown) => unknown }).decodeEventLog(args),
};
