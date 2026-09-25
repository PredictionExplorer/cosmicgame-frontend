'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import dynamic from 'next/dynamic';

import {
  emptyContractAddresses,
  getCachedDashboardContractAddresses,
  type AppContractAddresses,
} from '@/config/networks';
import type { ContractAddresses } from '@/services/api/types';

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

interface ContractAddressesState {
  readonly addresses: AppContractAddresses;
  /** Starts reading the addresses: a consumer mounted. */
  readonly request: () => void;
}

const ContractAddressesCtx = createContext<ContractAddressesState | null>(null);

/** The dashboard read, loaded the first time a component asks for an address. */
const ContractAddressesLoader = dynamic(() => import('./ContractAddressesLoader'), {
  ssr: false,
});

/**
 * Supplies the dashboard-backed contract addresses app-wide, read on demand:
 * the dashboard request (and the API client it needs) starts only once a
 * component calls `useContractAddresses`, so a page that never touches a
 * contract (the legal pages, the FAQ) makes no dashboard request and ships no
 * API client. Wrapped inside `QueryClientProvider` for the loader's query.
 */
export function ContractAddressesProvider({ children }: { children: ReactNode }) {
  const [requested, setRequested] = useState(false);
  const [addresses, setAddresses] = useState(getCachedDashboardContractAddresses);
  const request = useCallback(() => setRequested(true), []);
  const value = useMemo(() => ({ addresses, request }), [addresses, request]);

  return (
    <ContractAddressesCtx.Provider value={value}>
      {requested ? <ContractAddressesLoader onAddresses={setAddresses} /> : null}
      {children}
    </ContractAddressesCtx.Provider>
  );
}

/**
 * Single source for on-chain addresses: the provider's, read on first use;
 * outside the provider (isolated tests), the last merged snapshot from
 * {@link publishDashboardContractAddresses}.
 */
export function useContractAddresses(): AppContractAddresses {
  const ctx = useContext(ContractAddressesCtx);
  const request = ctx?.request;
  useEffect(() => {
    request?.();
  }, [request]);
  return ctx?.addresses ?? getCachedDashboardContractAddresses();
}
