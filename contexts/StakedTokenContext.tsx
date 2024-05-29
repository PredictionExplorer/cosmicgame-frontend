import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";
import { useActiveWeb3React } from "../hooks/web3";

const StakedTokenContext = createContext(undefined);

export const StakedTokenProvider = ({ children }) => {
  const [cstokens, setCsTokens] = useState([]);
  const [rwlktokens, setRwlkTokens] = useState([]);
  const { account } = useActiveWeb3React();

  const fetchData = async () => {
    try {
      if (account) {
        const cst = await api.get_staked_cst_tokens_by_user(account);
        setCsTokens(cst);
        const rwlk = await api.get_staked_rwalk_tokens_by_user(account);
        setRwlkTokens(rwlk);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
    fetchData();
  }, [account]);

  return (
    <StakedTokenContext.Provider value={{ cstokens, rwlktokens, fetchData }}>
      {children}
    </StakedTokenContext.Provider>
  );
};

export const useStakedToken = () => useContext(StakedTokenContext);
