import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';

import useCosmicGameContract from '../hooks/useCosmicGameContract';
import { reportError } from '../utils/errors';

interface SystemModeContextValue {
  data: number;
  fetchData: () => Promise<void>;
}

const SystemModeContext = createContext<SystemModeContextValue | undefined>(undefined);

const POLL_INTERVAL_MS = 12_000;

export const SystemModeProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState(0);
  const cosmicGameContract = useCosmicGameContract();

  const fetchData = useCallback(async () => {
    try {
      if (cosmicGameContract) {
        const systemMode = await cosmicGameContract.read.systemMode?.();
        if (systemMode !== undefined) {
          setData(Number(systemMode));
        }
      }
    } catch (error) {
      reportError(error, 'SystemModeContext.fetchData');
    }
  }, [cosmicGameContract]);

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, POLL_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [fetchData]);

  return (
    <SystemModeContext.Provider value={{ data, fetchData }}>{children}</SystemModeContext.Provider>
  );
};

export const useSystemMode = () => useContext(SystemModeContext);
