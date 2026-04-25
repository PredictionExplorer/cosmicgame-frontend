import { createContext, useContext, useMemo, type ReactNode } from 'react';

import { useActiveWeb3React } from '@/hooks/web3';
import { useAnchoredCSTokensByUser, useAnchoredRWLKTokensByUser } from '@/hooks/useApiQuery';
import type { AnchoredTokenInfo } from '@/services/api/types';

interface AnchoredTokenContextValue {
  cstokens: AnchoredTokenInfo[];
  rwlktokens: AnchoredTokenInfo[];
  fetchData: () => Promise<void>;
  error: string | null;
  isLoading: boolean;
}

const AnchoredTokenContext = createContext<AnchoredTokenContextValue | undefined>(undefined);

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

  const cstokens = cstData ?? [];
  const rwlktokens = rwlkData ?? [];
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

export const useAnchoredToken = (): AnchoredTokenContextValue => {
  const context = useContext(AnchoredTokenContext);
  if (!context) {
    throw new Error('useAnchoredToken must be used within a AnchoredTokenProvider');
  }
  return context;
};
