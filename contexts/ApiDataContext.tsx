import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { useStakedToken } from "./StakedTokenContext";
import { useActiveWeb3React } from "../hooks/web3";
import api from "../services/api";

/**
 * Represents the shape of the data returned from your API.
 * (Adjust fields/types as needed to match your API response.)
 */
interface ApiData {
  ETHRaffleToClaim: number;
  ETHRaffleToClaimWei: number;
  NumDonatedNFTToClaim: number;
  UnclaimedStakingReward: number;
  /**
   * If stakeActionIds are numeric or string, adjust this array type accordingly.
   */
  unstakeableActionIds: (number | string)[];
  claimableActionIds?: { DepositId: number; StakeActionId: number }[];
}

/**
 * Define the initial structure of apiData in state.
 * (Adjust default values as needed.)
 */
const initialApiData: ApiData = {
  ETHRaffleToClaim: 0,
  ETHRaffleToClaimWei: 0,
  NumDonatedNFTToClaim: 0,
  UnclaimedStakingReward: 0,
  unstakeableActionIds: [],
};

/**
 * Props for the ApiDataProvider.
 * children is the subtree that will consume our context.
 */
interface ApiDataProviderProps {
  children: ReactNode;
}

/**
 * Describes the shape of our context value, i.e., what
 * will be provided by ApiDataContext to its consumers.
 */
interface ApiDataContextValue {
  /** The main API response data stored in state. */
  apiData: ApiData;

  /** Setter for updating the API data in state. */
  setApiData: React.Dispatch<React.SetStateAction<ApiData>>;

  /** A function to retrieve data from the API and update state. */
  fetchData: () => Promise<void>;
}

/**
 * Create the context. We initialize it as `undefined`
 * so we can detect if it is used outside of a provider.
 */
const ApiDataContext = createContext<ApiDataContextValue | undefined>(
  undefined
);

/**
 * React hook to consume the ApiDataContext.
 * Throws an error if used outside of its provider.
 */
export const useApiData = (): ApiDataContextValue => {
  const context = useContext(ApiDataContext);
  if (!context) {
    throw new Error("useApiData must be used within an ApiDataProvider");
  }
  return context;
};

/**
 * Provides the ApiDataContext to child components.
 * Fetches and manages relevant API data within a React state.
 */
export const ApiDataProvider: React.FC<ApiDataProviderProps> = ({
  children,
}) => {
  // State to hold the API data
  const [apiData, setApiData] = useState<ApiData>(initialApiData);

  // Retrieve staked tokens from a custom context/hook
  const { cstokens: stakedTokens } = useStakedToken();
  // Extract staked action IDs from the staked tokens
  const stakedActionIds = stakedTokens.map((x) => x.TokenInfo.StakeActionId);

  // Get the current user's account from a custom Web3 hook
  const { account } = useActiveWeb3React();

  /**
   * Example function that calls your API to get notification data.
   * Adjust the response shape to match your actual API.
   */
  const fetchNotification = async (): Promise<any> => {
    return api.notify_red_box(account);
  };

  /**
   * Fetches info for a particular deposit ID, determining:
   * - Which action IDs are unstakeable
   * - Which are claimable
   */
  const fetchInfo = async (
    depositId: number,
    stakedActionIds: (number | string)[]
  ): Promise<{
    unstakeableActionIds: (number | string)[];
    claimableActionIds: { DepositId: number; StakeActionId: number }[];
  }> => {
    const unstakeableActionIds: (number | string)[] = [];
    const claimableActionIds: {
      DepositId: number;
      StakeActionId: number;
    }[] = [];

    // Example API call to retrieve actions for a specific deposit ID
    const response = await api.get_cst_action_ids_by_deposit_id(
      account,
      depositId
    );

    // We use Promise.all if there's any asynchronous handling per item
    await Promise.all(
      response.map(async (item: any) => {
        try {
          if (!item.Claimed) {
            claimableActionIds.push({
              DepositId: item.DepositId,
              StakeActionId: item.StakeActionId,
            });
          }
          if (stakedActionIds.includes(item.StakeActionId)) {
            unstakeableActionIds.push(item.StakeActionId);
          }
        } catch (error) {
          console.error(error);
        }
      })
    );

    return {
      unstakeableActionIds,
      claimableActionIds,
    };
  };

  /**
   * Fetches unstakeable/claimable action IDs for all items in a given list.
   * Returns aggregated lists of action IDs without duplicates.
   */
  const fetchActionIds = async (
    list: any[]
  ): Promise<{
    unstakeableActionIds: (number | string)[];
    claimableActionIds: { DepositId: number; StakeActionId: number }[];
  }> => {
    let cl_actionIds: { DepositId: number; StakeActionId: number }[] = [];
    let us_actionIds: (number | string)[] = [];

    // Process each item to gather all action IDs
    await Promise.all(
      list.map(async (item) => {
        const { claimableActionIds, unstakeableActionIds } = await fetchInfo(
          item.DepositId,
          stakedActionIds
        );
        cl_actionIds = cl_actionIds.concat(claimableActionIds);
        us_actionIds = us_actionIds.concat(unstakeableActionIds);
      })
    );

    // Filter out duplicate action IDs from us_actionIds
    us_actionIds = us_actionIds.filter(
      (item, index) => index === us_actionIds.findIndex((o) => o === item)
    );

    return {
      unstakeableActionIds: us_actionIds,
      claimableActionIds: cl_actionIds,
    };
  };

  /**
   * Main function to fetch all data from the API for the current user,
   * then update local state accordingly.
   */
  const fetchData = async (): Promise<void> => {
    if (!account) return;

    // Fetch red box notifications
    const newData = await fetchNotification();
    // Fetch unclaimed staking rewards
    const unclaimedStakingRewards = await api.get_staking_cst_rewards_to_claim_by_user(
      account
    );

    if (
      unclaimedStakingRewards.length > 0 &&
      newData.UnclaimedStakingReward > 0
    ) {
      const actionIds = await fetchActionIds(unclaimedStakingRewards);
      setApiData({ ...newData, ...actionIds });
    } else {
      setApiData({
        ...newData,
        unstakeableActionIds: [],
        claimableActionIds: [],
      });
    }
  };

  /**
   * Fetch data when the user account changes (e.g., on login or network switch).
   */
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  return (
    <ApiDataContext.Provider value={{ apiData, setApiData, fetchData }}>
      {children}
    </ApiDataContext.Provider>
  );
};
