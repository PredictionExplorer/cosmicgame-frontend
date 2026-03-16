import { createContext, useContext, useCallback, ReactNode } from 'react';

interface SystemModeContextValue {
  data: number;
  fetchData: () => Promise<void>;
}

const SystemModeContext = createContext<SystemModeContextValue | undefined>(undefined);

/**
 * systemMode() was removed from production contracts. Context always provides 0
 * (no maintenance mode). Kept for API compatibility with Header.
 */
export const SystemModeProvider = ({ children }: { children: ReactNode }) => {
  const fetchData = useCallback(async () => {
    /* no-op: systemMode() no longer exists on contract */
  }, []);

  return (
    <SystemModeContext.Provider value={{ data: 0, fetchData }}>
      {children}
    </SystemModeContext.Provider>
  );
};

export const useSystemMode = () => useContext(SystemModeContext);
