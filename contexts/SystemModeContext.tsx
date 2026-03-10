import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

import useCosmicGameContract from '../hooks/useCosmicGameContract';

interface SystemModeContextValue {
  data: number;
  fetchData: () => Promise<void>;
}

const SystemModeContext = createContext<SystemModeContextValue | undefined>(undefined);

export const SystemModeProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState(0);
  const cosmicGameContract = useCosmicGameContract();

  const fetchData = async () => {
    try {
      if (cosmicGameContract) {
        // const systemMode = await cosmicGameContract.systemMode();
        // setData(Number(systemMode));
      }
    } catch (error) {}
  };
  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 12000);

    return () => clearInterval(intervalId);
  }, [cosmicGameContract]);

  return (
    <SystemModeContext.Provider value={{ data, fetchData }}>{children}</SystemModeContext.Provider>
  );
};

export const useSystemMode = () => useContext(SystemModeContext);
