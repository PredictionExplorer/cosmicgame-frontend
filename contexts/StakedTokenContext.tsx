import { createContext, useContext, useMemo, type ReactNode } from 'react';

import { useActiveWeb3React } from '@/hooks/web3';
import { useStakedCSTTokensByUser, useStakedRWLKTokensByUser } from '@/hooks/useApiQuery';
import type { StakedTokenInfo } from '@/services/api/types';

interface StakedTokenContextValue {
  cstokens: StakedTokenInfo[];
  rwlktokens: StakedTokenInfo[];
  fetchData: () => Promise<void>;
  error: string | null;
  isLoading: boolean;
}

const StakedTokenContext = createContext<StakedTokenContextValue | undefined>(undefined);

interface StakedTokenProviderProps {
  children: ReactNode;
}

export const StakedTokenProvider = ({ children }: StakedTokenProviderProps) => {
  const { account } = useActiveWeb3React();

  const {
    data: cstData,
    refetch: refetchCST,
    isLoading: cstLoading,
    error: cstError,
  } = useStakedCSTTokensByUser(account);
  const {
    data: rwlkData,
    refetch: refetchRWLK,
    isLoading: rwlkLoading,
    error: rwlkError,
  } = useStakedRWLKTokensByUser(account);

  const cstokens = cstData ?? [];
  const rwlktokens = rwlkData ?? [];
  const isLoading = cstLoading || rwlkLoading;
  const queryError = cstError || rwlkError;
  const error = queryError ? (queryError instanceof Error ? queryError.message : String(queryError)) : null;

  const fetchData = useMemo(
    () => async () => {
      await Promise.all([refetchCST(), refetchRWLK()]);
    },
    [refetchCST, refetchRWLK],
  );

  return (
    <StakedTokenContext.Provider value={{ cstokens, rwlktokens, fetchData, error, isLoading }}>
      {children}
    </StakedTokenContext.Provider>
  );
};

export const useStakedToken = (): StakedTokenContextValue => {
  const context = useContext(StakedTokenContext);
  if (!context) {
    throw new Error('useStakedToken must be used within a StakedTokenProvider');
  }
  return context;
};
