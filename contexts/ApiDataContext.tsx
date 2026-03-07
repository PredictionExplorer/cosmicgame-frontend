import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from "react";
import { useStakedToken } from "./StakedTokenContext";
import { useActiveWeb3React } from "../hooks/web3";
import api from "../services/api";

interface ApiData {
  ETHRaffleToClaim: number;
  ETHRaffleToClaimWei: number;
  NumDonatedNFTToClaim: number;
  UnclaimedStakingReward: number;
  unstakeableActionIds: (number | string)[];
  claimableActionIds?: { DepositId: number; StakeActionId: number }[];
}

const initialApiData: ApiData = {
  ETHRaffleToClaim: 0,
  ETHRaffleToClaimWei: 0,
  NumDonatedNFTToClaim: 0,
  UnclaimedStakingReward: 0,
  unstakeableActionIds: [],
};

interface ApiDataProviderProps {
  children: ReactNode;
}

interface ApiDataContextValue {
  apiData: ApiData;
  setApiData: React.Dispatch<React.SetStateAction<ApiData>>;
  fetchData: () => Promise<void>;
}

const ApiDataContext = createContext<ApiDataContextValue | undefined>(undefined);

export const useApiData = (): ApiDataContextValue => {
  const context = useContext(ApiDataContext);
  if (!context) {
    throw new Error("useApiData must be used within an ApiDataProvider");
  }
  return context;
};

export const ApiDataProvider: React.FC<ApiDataProviderProps> = ({ children }) => {
  const [apiData, setApiData] = useState<ApiData>(initialApiData);
  const { cstokens: stakedTokens } = useStakedToken();
  const stakedActionIds = stakedTokens.map((x) => x.TokenInfo.StakeActionId);
  const { account } = useActiveWeb3React();

  const fetchInfo = useCallback(
    async (depositId: number, stakedActionIds: (number | string)[]) => {
      const unstakeableActionIds: (number | string)[] = [];
      const claimableActionIds: { DepositId: number; StakeActionId: number }[] = [];

      const response = await api.get_cst_action_ids_by_deposit_id(account, depositId);

      // Guard: api returns null on 400
      if (!response) return { unstakeableActionIds, claimableActionIds };

      await Promise.all(
        response.map(async (item: any) => {
          try {
            if (!item.Claimed) {
              claimableActionIds.push({ DepositId: item.DepositId, StakeActionId: item.StakeActionId });
            }
            if (stakedActionIds.includes(item.StakeActionId)) {
              unstakeableActionIds.push(item.StakeActionId);
            }
          } catch (error) {
            console.error(error);
          }
        })
      );

      return { unstakeableActionIds, claimableActionIds };
    },
    [account]
  );

  const fetchActionIds = useCallback(
    async (list: any[]) => {
      let cl_actionIds: { DepositId: number; StakeActionId: number }[] = [];
      let us_actionIds: (number | string)[] = [];

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

      us_actionIds = us_actionIds.filter(
        (item, index) => index === us_actionIds.findIndex((o) => o === item)
      );

      return { unstakeableActionIds: us_actionIds, claimableActionIds: cl_actionIds };
    },
    [fetchInfo, stakedActionIds]
  );

  const fetchData = useCallback(async (): Promise<void> => {
    if (!account) return;

    try {
      const [newData, unclaimedStakingRewards] = await Promise.all([
        api.notify_red_box(account),
        api.get_staking_cst_rewards_to_claim_by_user(account),
      ]);

      const rewards = unclaimedStakingRewards ?? [];
      const hasUnclaimed =
        rewards.length > 0 && (newData?.UnclaimedStakingReward ?? 0) > 0;

      if (hasUnclaimed) {
        const actionIds = await fetchActionIds(rewards);
        setApiData({ ...initialApiData, ...newData, ...actionIds });
      } else {
        setApiData({
          ...initialApiData,
          ...newData,
          unstakeableActionIds: [],
          claimableActionIds: [],
        });
      }
    } catch (error) {
      console.error("ApiDataContext fetchData failed:", error);
    }
  }, [account, fetchActionIds]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!cancelled) await fetchData();
    };
    run();
    return () => { cancelled = true; };
  }, [fetchData]);

  return (
    <ApiDataContext.Provider value={{ apiData, setApiData, fetchData }}>
      {children}
    </ApiDataContext.Provider>
  );
};
