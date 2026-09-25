import { useMemo, type ReactNode } from 'react';

import { useActiveWeb3React } from '@/hooks/web3';
import { useAnchoredCSTokensByUser, useAnchoredRWLKTokensByUser } from '@/hooks/useApiQuery';
import type { AnchoredTokenInfo } from '@/services/api/types';

import { AnchoredTokenContext, useAnchoredToken } from './accountDataContexts';

export { useAnchoredToken };
export type { AnchoredTokenContextValue } from './accountDataContexts';

/**
 * The lists while a read has no data (disconnected, loading or failed): one
 * stable array, so effects that depend on a list do not re-run every render.
 */
const NO_TOKENS: AnchoredTokenInfo[] = [];

interface AnchoredTokenProviderProps {
  children: ReactNode;
}

export const AnchoredTokenProvider = ({ children }: AnchoredTokenProviderProps) => {
  const { account } = useActiveWeb3React();

  const {
    data: cstData,
    refetch: refetchCST,
    isLoading: cstLoading,
    error: cstError,
  } = useAnchoredCSTokensByUser(account);
  const {
    data: rwlkData,
    refetch: refetchRWLK,
    isLoading: rwlkLoading,
    error: rwlkError,
  } = useAnchoredRWLKTokensByUser(account);

  const cstokens = cstData ?? NO_TOKENS;
  const rwlktokens = rwlkData ?? NO_TOKENS;
  const isLoading = cstLoading || rwlkLoading;
  const queryError = cstError || rwlkError;
  const error = queryError
    ? queryError instanceof Error
      ? queryError.message
      : String(queryError)
    : null;

  const fetchData = useMemo(
    () => async () => {
      await Promise.all([refetchCST(), refetchRWLK()]);
    },
    [refetchCST, refetchRWLK],
  );

  return (
    <AnchoredTokenContext.Provider value={{ cstokens, rwlktokens, fetchData, error, isLoading }}>
      {children}
    </AnchoredTokenContext.Provider>
  );
};
