import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";
import { useActiveWeb3React } from "../hooks/web3";

const StakedCSTokenContext = createContext(undefined);

export const StakedCSTokenProvider = ({ children }) => {
  const [data, setData] = useState([]);
  const { account } = useActiveWeb3React();

  const fetchData = async () => {
    try {
      if (account) {
        const tokens = await api.get_staked_cst_tokens_by_user(account);
        setData(tokens);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
    fetchData();
  }, [account]);

  return (
    <StakedCSTokenContext.Provider value={{ data, fetchData }}>
      {children}
    </StakedCSTokenContext.Provider>
  );
};

export const useStakedCSToken = () => useContext(StakedCSTokenContext);
