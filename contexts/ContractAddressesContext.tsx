'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';

import {
  emptyContractAddresses,
  publishDashboardContractAddresses,
  getCachedDashboardContractAddresses,
  type AppContractAddresses,
} from '@/config/networks';
import type { ContractAddresses } from '@/services/api/types';
import { useDashboardInfo } from '@/hooks/useApiQuery';

function pickAddr(v: string | undefined): string {
  if (v && v.length >= 10) return v;
  return '';
}

/** Maps Go `ContractAddrs` into {@link AppContractAddresses}. Uses only API fields (no env fallbacks). */
export function mergeContractAddresses(api?: ContractAddresses): AppContractAddresses {
  if (!api) return emptyContractAddresses();
  return {
    randomWalkNft: pickAddr(api.RandomWalkAddr),
    cosmicGame: pickAddr(api.CosmicGameAddr),
    cosmicSignature: pickAddr(api.CosmicSignatureAddr),
    cosmicToken: pickAddr(api.CosmicTokenAddr),
    cosmicDao: pickAddr(api.CosmicDaoAddr),
    charity: pickAddr(api.CharityWalletAddr),
    prizesWallet: pickAddr(api.PrizesWalletAddr),
    stakingCst: pickAddr(api.StakingWalletCSTAddr),
    stakingRwalk: pickAddr(api.StakingWalletRWalkAddr),
    marketing: pickAddr(api.MarketingWalletAddr),
    implementation: pickAddr(api.ImplementationAddr),
  };
}

const ContractAddressesCtx = createContext<AppContractAddresses | null>(null);

/**
 * Supplies dashboard-backed contract addresses app-wide. Wrapped inside
 * `QueryClientProvider` so `useDashboardInfo` can run.
 */
export function ContractAddressesProvider({ children }: { children: ReactNode }) {
  const { data } = useDashboardInfo();
  const value = useMemo(
    () => mergeContractAddresses(data?.ContractAddrs),
    [data?.ContractAddrs],
  );

  useEffect(() => {
    publishDashboardContractAddresses(value);
  }, [value]);

  return <ContractAddressesCtx.Provider value={value}>{children}</ContractAddressesCtx.Provider>;
}

/**
 * Single source for on-chain addresses: prefers provider context when mounted;
 * otherwise the last merged snapshot from {@link publishDashboardContractAddresses}.
 */
export function useContractAddresses(): AppContractAddresses {
  const ctx = useContext(ContractAddressesCtx);
  return ctx ?? getCachedDashboardContractAddresses();
}
