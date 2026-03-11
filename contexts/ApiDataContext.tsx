import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
  type Dispatch,
  type SetStateAction,
  type ReactNode,
} from 'react';

import { useActiveWeb3React } from '@/hooks/web3';
import api from '@/services/api';
import type { StakingCSTReward } from '@/services/api/types';
import { useNotifyRedBox, useStakingCSTRewardsToClaimByUser } from '@/hooks/useApiQuery';
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

  const { cstokens: stakedTokens } = useStakedToken();
  const { account } = useActiveWeb3React();

  const { data: redBoxData, refetch: refetchRedBox } = useNotifyRedBox(account);
  const { data: rewardsData, refetch: refetchRewards } = useStakingCSTRewardsToClaimByUser(account);

  const unclaimedRewards = useMemo(() => rewardsData ?? [], [rewardsData]);

  const stakedActionIdsRef = useRef<(number | string)[]>([]);
  // eslint-disable-next-line react-hooks/refs
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
    [fetchInfo],
  );

  useEffect(() => {
    let cancelled = false;

    const processData = async () => {
      if (!account || !redBoxData) return;

      try {
        const rewardList = unclaimedRewards;
        const hasUnclaimed = rewardList.length > 0 && (redBoxData?.UnclaimedStakingReward ?? 0) > 0;

        if (hasUnclaimed) {
          const actionIds = await fetchActionIds(rewardList);
          if (!cancelled) {
            setApiData({ ...initialApiData, ...redBoxData, ...actionIds });
          }
        } else {
          if (!cancelled) {
            setApiData({
              ...initialApiData,
              ...redBoxData,
              unstakeableActionIds: [],
              claimableActionIds: [],
            });
          }
        }
      } catch (error) {
        reportError(error, 'ApiDataContext processData');
      }
    };

    processData();
    return () => {
      cancelled = true;
    };
  }, [account, redBoxData, unclaimedRewards, fetchActionIds]);

  const fetchData = useCallback(async () => {
    await Promise.all([refetchRedBox(), refetchRewards()]);
  }, [refetchRedBox, refetchRewards]);

  return (
    <ApiDataContext.Provider value={{ apiData, setApiData, fetchData, unclaimedRewards }}>
      {children}
    </ApiDataContext.Provider>
  );
};
