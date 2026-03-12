import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from 'react';

import useCosmicGameContract from '@/hooks/useCosmicGameContract';
import { reportError, isContractRevertError } from '@/utils/errors';

interface SystemModeContextValue {
  data: number;
  fetchData: () => Promise<void>;
}

const SystemModeContext = createContext<SystemModeContextValue | undefined>(undefined);

const POLL_INTERVAL_MS = 12_000;
export const MAX_CONSECUTIVE_FAILURES = 3;

export const SystemModeProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState(0);
  const cosmicGameContract = useCosmicGameContract();
  const failCountRef = useRef(0);

  const fetchData = useCallback(async () => {
    try {
      if (cosmicGameContract) {
        const systemMode = await cosmicGameContract.read.systemMode?.();
        if (systemMode !== undefined) {
          setData(Number(systemMode));
        }
        failCountRef.current = 0;
      }
    } catch (error) {
      failCountRef.current += 1;
      if (failCountRef.current <= MAX_CONSECUTIVE_FAILURES) {
        if (isContractRevertError(error)) {
          console.warn(
            '[SystemModeContext] systemMode() reverted — contract may not be available on this network',
          );
        } else {
          reportError(error, 'SystemModeContext.fetchData');
        }
      }
    }
  }, [cosmicGameContract]);

  useEffect(() => {
    failCountRef.current = 0;
    fetchData(); // eslint-disable-line react-hooks/set-state-in-effect
    const intervalId = setInterval(() => {
      if (failCountRef.current < MAX_CONSECUTIVE_FAILURES) {
        fetchData();
      }
    }, POLL_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [fetchData]);

  return (
    <SystemModeContext.Provider value={{ data, fetchData }}>{children}</SystemModeContext.Provider>
  );
};

export const useSystemMode = () => useContext(SystemModeContext);
