import { createContext, useContext, useMemo, type ReactNode } from 'react';

import { useActiveWeb3React } from '@/hooks/web3';
import { useStakedCSTTokensByUser, useStakedRWLKTokensByUser } from '@/hooks/useApiQuery';
import type { StakedTokenInfo } from '@/services/api/types';

interface StakedTokenContextValue {
  cstokens: StakedTokenInfo[];
  rwlktokens: StakedTokenInfo[];
  fetchData: () => Promise<void>;
}

const StakedTokenContext = createContext<StakedTokenContextValue | undefined>(undefined);

interface StakedTokenProviderProps {
  children: ReactNode;
}

export const StakedTokenProvider = ({ children }: StakedTokenProviderProps) => {
  const { account } = useActiveWeb3React();

  const { data: cstData, refetch: refetchCST } = useStakedCSTTokensByUser(account);
  const { data: rwlkData, refetch: refetchRWLK } = useStakedRWLKTokensByUser(account);

  const cstokens = cstData ?? [];
  const rwlktokens = rwlkData ?? [];

  const fetchData = useMemo(
    () => async () => {
      await Promise.all([refetchCST(), refetchRWLK()]);
    },
    [refetchCST, refetchRWLK],
  );

  return (
    <StakedTokenContext.Provider value={{ cstokens, rwlktokens, fetchData }}>
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
