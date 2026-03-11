/**
 * Typed wrapper for viem contract write calls.
 *
 * ABIs are imported from JSON and widened to the generic `Abi` type
 * (see contracts/abis.ts), so viem cannot infer exact method signatures.
 * This utility centralises the single type assertion so that call sites
 * remain cast-free. Once ABIs are generated with @wagmi/cli (or an
 * equivalent codegen tool) this file can be removed.
 */

type ContractWriteFn = (...args: unknown[]) => Promise<`0x${string}`>;

export function asWriteFn(fn: unknown): ContractWriteFn {
  return fn as ContractWriteFn;
}
