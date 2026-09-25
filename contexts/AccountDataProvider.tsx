'use client';

import { useCallback, useMemo, useState, type ReactNode } from 'react';
import dynamic from 'next/dynamic';

import { useActiveWeb3React } from '@/hooks/web3';

import {
  AnchoredTokenContext,
  ApiDataContext,
  DISCONNECTED_ANCHORED_TOKENS,
  DISCONNECTED_API_DATA,
  type AnchoredTokenContextValue,
  type ApiDataContextValue,
} from './accountDataContexts';

export interface AccountData {
  anchored: AnchoredTokenContextValue;
  api: ApiDataContextValue;
}

const DISCONNECTED: AccountData = {
  anchored: DISCONNECTED_ANCHORED_TOKENS,
  api: DISCONNECTED_API_DATA,
};

/** The wallet's reads (anchored NFTs, retrieval status), loaded while a wallet is connected. */
const AccountDataSync = dynamic(() => import('./AccountDataSync'), { ssr: false });

/**
 * The connected wallet's data for every page: `useAnchoredToken` and
 * `useApiData` read it here. With no wallet connected both are empty, and the
 * API client, its schemas and the wallet's queries are not even downloaded;
 * once a wallet connects (or a session restores), AccountDataSync loads,
 * runs the real providers beside the page and hands their values up. The
 * page is never re-parented, so connecting a wallet keeps its state.
 */
export function AccountDataProvider({ children }: { children: ReactNode }) {
  const { account } = useActiveWeb3React();
  const [synced, setSynced] = useState<{ account: string; data: AccountData } | null>(null);
  const onSync = useCallback(
    (syncedAccount: string, data: AccountData) => setSynced({ account: syncedAccount, data }),
    [],
  );
  // Values from a previous wallet never outlive it.
  const data = account && synced?.account === account ? synced.data : DISCONNECTED;
  // One element per wallet: the provider's own updates never re-render the sync.
  const sync = useMemo(
    () => (account ? <AccountDataSync key={account} account={account} onSync={onSync} /> : null),
    [account, onSync],
  );

  return (
    <AnchoredTokenContext.Provider value={data.anchored}>
      <ApiDataContext.Provider value={data.api}>
        {sync}
        {children}
      </ApiDataContext.Provider>
    </AnchoredTokenContext.Provider>
  );
}
