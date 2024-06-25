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

interface ApiDataContextProps {
  children: ReactNode;
}

interface ApiDataContextValue {
  apiData: any; // Change this type based on your API response structure
  setApiData: React.Dispatch<React.SetStateAction<any>>;
  fetchData: any;
}

const ApiDataContext = createContext<ApiDataContextValue | undefined>(
  undefined
);

export const useApiData = (): ApiDataContextValue => {
  const context = useContext(ApiDataContext);
  if (!context) {
    throw new Error("useApiData must be used within an ApiDataProvider");
  }
  return context;
};

export const ApiDataProvider: React.FC<ApiDataContextProps> = ({
  children,
}) => {
  const [apiData, setApiData] = useState({
    ETHRaffleToClaim: 0,
    ETHRaffleToClaimWei: 0,
    NumDonatedNFTToClaim: 0,
    UnclaimedStakingReward: 0,
    unstakeableActionIds: [],
    waitingActionIds: [],
    claimableActionIds: [],
  });
  const { cstokens: stakedTokens } = useStakedToken();
  const stakedActionIds = stakedTokens.map((x) => x.TokenInfo.StakeActionId);
  const { account } = useActiveWeb3React();

  const fetchNotification = async () => {
    const notify = await api.notify_red_box(account);
    return notify;
  };

  const fetchInfo = async (depositId, stakedActionIds) => {
    let unstakeableActionIds = [],
      claimableActionIds = [],
      claimableAmounts = {},
      waitingActionIds = [];
    const response = await api.get_cst_action_ids_by_deposit_id(
      account,
      depositId
    );
    const current = await api.get_current_time();
    await Promise.all(
      response.map(async (x) => {
        try {
          if (x.UnstakeEligibleTimeStamp < current) {
            if (!x.Claimed) {
              claimableActionIds.push({
                DepositId: x.DepositId,
                StakeActionId: x.StakeActionId,
              });
            }
            if (stakedActionIds.includes(x.StakeActionId)) {
              unstakeableActionIds.push(x.StakeActionId);
            }
          } else {
            waitingActionIds.push({
              DepositId: x.DepositId,
              StakeActionId: x.StakeActionId,
            });
          }
          if (!x.Claimed) {
            if (x.TimeStampDiff > 0) {
              if (!claimableAmounts[x.TimeStampDiff]) {
                const filtered = Object.keys(claimableAmounts).filter(
                  (element) =>
                    Math.abs(parseInt(element) - x.TimeStampDiff) < 60
                );
                if (filtered.length > 0) {
                  claimableAmounts[filtered[0]] += x.AmountEth;
                } else {
                  claimableAmounts[x.TimeStampDiff] = x.AmountEth;
                }
              } else {
                claimableAmounts[x.TimeStampDiff] += x.AmountEth;
              }
            }
          }
        } catch (error) {
          console.log(error);
        }
      })
    );
    return {
      unstakeableActionIds,
      claimableActionIds,
      claimableAmounts,
      waitingActionIds,
      actionIds: response.filter(
        (x) => x.UnstakeEligibleTimeStamp < current && !x.Claimed
      ),
    };
  };

  const fetchActionIds = async (list) => {
    let cl_actionIds = [],
      us_actionIds = [],
      wa_actionIds = [];
    await Promise.all(
      list.map(async (item) => {
        const depositId = item.DepositId;
        const {
          claimableActionIds: cl,
          unstakeableActionIds: us,
          waitingActionIds: wa,
        } = await fetchInfo(depositId, stakedActionIds);
        cl_actionIds = cl_actionIds.concat(cl);
        us_actionIds = us_actionIds.concat(us);
        wa_actionIds = wa_actionIds.concat(wa);
      })
    );
    us_actionIds = us_actionIds.filter((item, index) => {
      return index === us_actionIds.findIndex((o) => o === item);
    });

    return {
      unstakeableActionIds: us_actionIds,
      waitingActionIds: wa_actionIds,
      claimableActionIds: cl_actionIds,
    };
  };
  const fetchData = async () => {
    if (account) {
      const newData = await fetchNotification();
      const unclaimedStakingRewards = await api.get_unclaimed_staking_rewards_by_user(
        account
      );
      if (
        unclaimedStakingRewards.length > 0 &&
        newData.UnclaimedStakingReward > 0
      ) {
        const res = await fetchActionIds(unclaimedStakingRewards);
        setApiData({ ...newData, ...res });
      } else {
        setApiData({
          ...newData,
          unstakeableActionIds: [],
          waitingActionIds: [],
          claimableActionIds: [],
        });
      }
    }
  };
  useEffect(() => {
    fetchData();
  }, [account]);

  return (
    <ApiDataContext.Provider value={{ apiData, setApiData, fetchData }}>
      {children}
    </ApiDataContext.Provider>
  );
};
