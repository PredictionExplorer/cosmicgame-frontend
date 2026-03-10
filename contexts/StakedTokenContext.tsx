import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';

import api from '../services/api';
import { useActiveWeb3React } from '../hooks/web3';
import type { StakedTokenInfo } from '../services/api/types';
import { reportError } from '../utils/errors';

/**
 * Describes the shape of the StakedTokenContext value.
 */
interface StakedTokenContextValue {
  cstokens: StakedTokenInfo[];
  rwlktokens: StakedTokenInfo[];
  fetchData: () => Promise<void>;
}

/**
 * Create the token context with a default value of `undefined`.
 * This allows TypeScript to catch usage outside of a proper provider.
 */
const StakedTokenContext = createContext<StakedTokenContextValue | undefined>(undefined);

/**
 * Describes the props for the StakedTokenProvider.
 */
interface StakedTokenProviderProps {
  children: ReactNode;
}

/**
 * Provider component responsible for fetching and storing
 * the user's staked tokens (CST and RWALK).
 */
export const StakedTokenProvider: React.FC<StakedTokenProviderProps> = ({ children }) => {
  const [cstokens, setCsTokens] = useState<StakedTokenInfo[]>([]);
  const [rwlktokens, setRwlkTokens] = useState<StakedTokenInfo[]>([]);
  const { account } = useActiveWeb3React();

  /**
   * Fetches staked tokens for the connected user.
   */
  const fetchData = useCallback(async () => {
    if (!account) return;
    try {
      const [cst, rwlk] = await Promise.all([
        api.get_staked_cst_tokens_by_user(account),
        api.get_staked_rwalk_tokens_by_user(account),
      ]);
      setCsTokens(cst ?? []);
      setRwlkTokens(rwlk ?? []);
    } catch (error) {
      reportError(error, 'fetch staked token data');
    }
  }, [account]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!cancelled) await fetchData();
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [fetchData]);

  return (
    <StakedTokenContext.Provider value={{ cstokens, rwlktokens, fetchData }}>
      {children}
    </StakedTokenContext.Provider>
  );
};

/**
 * Custom hook for accessing the staked token context.
 * Throws an error if used outside of the StakedTokenProvider.
 */
export const useStakedToken = (): StakedTokenContextValue => {
  const context = useContext(StakedTokenContext);
  if (!context) {
    throw new Error('useStakedToken must be used within a StakedTokenProvider');
  }
  return context;
};
