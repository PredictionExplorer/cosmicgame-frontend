import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";
import { useActiveWeb3React } from "../hooks/web3";

const StakedTokenContext = createContext(undefined);

export const StakedTokenProvider = ({ children }) => {
  const [data, setData] = useState([]);
  const { account } = useActiveWeb3React();

  const fetchData = async () => {
    try {
      const tokens = await api.get_staked_tokens_by_user(account);
      setData(tokens);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <StakedTokenContext.Provider value={{ data, fetchData }}>
      {children}
    </StakedTokenContext.Provider>
  );
};

export const useStakedToken = () => useContext(StakedTokenContext);
