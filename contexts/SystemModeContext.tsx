import { createContext, useContext, useEffect, useState } from "react";
import useCosmicGameContract from "../hooks/useCosmicGameContract";

const SystemModeContext = createContext(undefined);

export const SystemModeProvider = ({ children }) => {
  const [data, setData] = useState(0);
  const cosmicGameContract = useCosmicGameContract();

  const fetchData = async () => {
    try {
      if (cosmicGameContract) {
        const systemMode = await cosmicGameContract.systemMode();
        setData(Number(systemMode));
      }
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };
  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 12000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <SystemModeContext.Provider value={{ data, fetchData }}>
      {children}
    </SystemModeContext.Provider>
  );
};

export const useSystemMode = () => useContext(SystemModeContext);
