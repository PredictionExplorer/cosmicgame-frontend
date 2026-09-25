'use client';

import { useEffect, useRef } from 'react';

import type { AccountData } from './AccountDataProvider';
import { AnchoredTokenProvider, useAnchoredToken } from './AnchoredTokenContext';
import { ApiDataProvider, useApiData } from './ApiDataContext';

/** Whether two plain objects hold the same values, field by field. */
function sameFields(a: object, b: object): boolean {
  const left = a as Record<string, unknown>;
  const right = b as Record<string, unknown>;
  const keys = Object.keys(left);
  return (
    keys.length === Object.keys(right).length &&
    keys.every((key) => Object.is(left[key], right[key]))
  );
}

/** Hands the providers' values to AccountDataProvider whenever one of them changes. */
function Relay({
  account,
  onSync,
}: {
  account: string;
  onSync: (account: string, data: AccountData) => void;
}) {
  const anchored = useAnchoredToken();
  const api = useApiData();
  const last = useRef<AccountData | null>(null);

  useEffect(() => {
    const previous = last.current;
    if (previous && sameFields(previous.anchored, anchored) && sameFields(previous.api, api))
      return;
    const data = { anchored, api };
    last.current = data;
    onSync(account, data);
  }, [account, anchored, api, onSync]);

  return null;
}

/**
 * The connected wallet's reads, run beside the page rather than around it:
 * AccountDataProvider loads this module only while a wallet is connected, so
 * the API client and the wallet's queries stay out of every page's first
 * download.
 */
export default function AccountDataSync({
  account,
  onSync,
}: {
  account: string;
  onSync: (account: string, data: AccountData) => void;
}) {
  return (
    <AnchoredTokenProvider>
      <ApiDataProvider>
        <Relay account={account} onSync={onSync} />
      </ApiDataProvider>
    </AnchoredTokenProvider>
  );
}
