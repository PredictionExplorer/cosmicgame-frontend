import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  type Dispatch,
  type SetStateAction,
  type ReactNode,
} from 'react';

import { useActiveWeb3React } from '@/hooks/web3';
import api from '@/services/api';
import type { StakingCSTReward } from '@/services/api/types';
import { reportError } from '@/utils/errors';

import { useStakedToken } from './StakedTokenContext';

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
  setApiData: Dispatch<SetStateAction<ApiData>>;
  fetchData: () => Promise<void>;
  /** Raw unclaimed staking rewards — shared so consumers don't re-fetch */
  unclaimedRewards: StakingCSTReward[];
}

const ApiDataContext = createContext<ApiDataContextValue | undefined>(undefined);

export const useApiData = (): ApiDataContextValue => {
  const context = useContext(ApiDataContext);
  if (!context) {
    throw new Error('useApiData must be used within an ApiDataProvider');
  }
  return context;
};

export const ApiDataProvider = ({ children }: ApiDataProviderProps) => {
  const [apiData, setApiData] = useState<ApiData>(initialApiData);
  const [unclaimedRewards, setUnclaimedRewards] = useState<StakingCSTReward[]>([]);

  const { cstokens: stakedTokens } = useStakedToken();
  const { account } = useActiveWeb3React();

  // Use a ref so fetchActionIds/fetchData never need it as a useCallback dep.
  // The ref is always up-to-date without causing reference churn.
  const stakedActionIdsRef = useRef<(number | string)[]>([]);
  stakedActionIdsRef.current = stakedTokens.flatMap((x) =>
    x.TokenInfo?.StakeActionId != null ? [x.TokenInfo.StakeActionId] : [],
  );

  const fetchInfo = useCallback(
    async (depositId: number) => {
      const unstakeableActionIds: (number | string)[] = [];
      const claimableActionIds: { DepositId: number; StakeActionId: number }[] = [];

      const response = await api.get_cst_action_ids_by_deposit_id(account!, depositId);
      if (!response) return { unstakeableActionIds, claimableActionIds };

      const currentStakedActionIds = stakedActionIdsRef.current;
      for (const item of response) {
        try {
          if (!item.Claimed) {
            claimableActionIds.push({
              DepositId: item.DepositId,
              StakeActionId: item.StakeActionId,
            });
          }
          if (currentStakedActionIds.includes(item.StakeActionId)) {
            unstakeableActionIds.push(item.StakeActionId);
          }
        } catch (error) {
          reportError(error, 'process staking reward item');
        }
      }

      return { unstakeableActionIds, claimableActionIds };
    },
    // Only depends on account — stakedActionIds is read from ref
    [account],
  );

  const fetchActionIds = useCallback(
    async (list: StakingCSTReward[]) => {
      let cl_actionIds: { DepositId: number; StakeActionId: number }[] = [];
      let us_actionIds: (number | string)[] = [];

      await Promise.all(
        list
          .filter((item) => item.DepositId != null)
          .map(async (item) => {
            const depositId = item.DepositId!;
            const { claimableActionIds, unstakeableActionIds } = await fetchInfo(depositId);
            cl_actionIds = cl_actionIds.concat(claimableActionIds);
            us_actionIds = us_actionIds.concat(unstakeableActionIds);
          }),
      );

      us_actionIds = us_actionIds.filter(
        (item, index) => index === us_actionIds.findIndex((o) => o === item),
      );

      return { unstakeableActionIds: us_actionIds, claimableActionIds: cl_actionIds };
    },
    // Stable: fetchInfo only changes when account changes
    [fetchInfo],
  );

  const fetchData = useCallback(async (): Promise<void> => {
    if (!account) return;

    try {
      const [newData, rewards] = await Promise.all([
        api.notify_red_box(account),
        api.get_staking_cst_rewards_to_claim_by_user(account),
      ]);

      const rewardList = rewards ?? [];
      setUnclaimedRewards(rewardList);

      const hasUnclaimed = rewardList.length > 0 && (newData?.UnclaimedStakingReward ?? 0) > 0;

      if (hasUnclaimed) {
        const actionIds = await fetchActionIds(rewardList);
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
      reportError(error, 'ApiDataContext fetchData');
    }
    // Stable deps: only account and fetchActionIds (which only changes when account changes)
  }, [account, fetchActionIds]);

  const POLLING_INTERVAL_MS = 30_000;

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!cancelled) await fetchData();
    };
    run();
    const intervalId = setInterval(run, POLLING_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [fetchData]);

  return (
    <ApiDataContext.Provider value={{ apiData, setApiData, fetchData, unclaimedRewards }}>
      {children}
    </ApiDataContext.Provider>
  );
};
