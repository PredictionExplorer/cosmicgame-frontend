import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import api from "../services/api";
import { useActiveWeb3React } from "../hooks/web3";

/**
 * Represents a single staked CST token item.
 * Replace `any` with the proper type if available.
 */
interface CstToken {
  [key: string]: any;
}

/**
 * Represents a single staked RWALK token item.
 * Replace `any` with the proper type if available.
 */
interface RwlkToken {
  [key: string]: any;
}

/**
 * Describes the shape of the StakedTokenContext value.
 */
interface StakedTokenContextValue {
  cstokens: CstToken[];
  rwlktokens: RwlkToken[];
  fetchData: () => Promise<void>;
}

/**
 * Create the token context with a default value of `undefined`.
 * This allows TypeScript to catch usage outside of a proper provider.
 */
const StakedTokenContext = createContext<StakedTokenContextValue | undefined>(
  undefined
);

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
export const StakedTokenProvider: React.FC<StakedTokenProviderProps> = ({
  children,
}) => {
  const [cstokens, setCsTokens] = useState<CstToken[]>([]);
  const [rwlktokens, setRwlkTokens] = useState<RwlkToken[]>([]);
  const { account } = useActiveWeb3React();

  /**
   * Fetches staked tokens for the connected user.
   */
  const fetchData = async () => {
    try {
      if (account) {
        const cst = await api.get_staked_cst_tokens_by_user(account);
        setCsTokens(cst);
        const rwlk = await api.get_staked_rwalk_tokens_by_user(account);
        setRwlkTokens(rwlk);
      }
    } catch (error) {
      console.error("Error fetching staked token data:", error);
    }
  };

  /**
   * Refetch data anytime `account` changes (i.e., user changes wallet).
   */
  useEffect(() => {
    fetchData();
  }, [account]);

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
    throw new Error("useStakedToken must be used within a StakedTokenProvider");
  }
  return context;
};
