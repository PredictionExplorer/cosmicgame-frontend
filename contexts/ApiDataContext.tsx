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
import type { CSTAnchorDistribution } from '@/services/api/types';
import { useNotifyRedBox, useCSTAnchorDistributionsToRetrieveByUser } from '@/hooks/useApiQuery';
import { reportError } from '@/utils/errors';

import { useAnchoredToken } from './AnchoredTokenContext';

interface ApiData {
  ETHRaffleToClaim: number;
  ETHRaffleToClaimWei: number;
  NumDonatedNFTToClaim: number;
  UnretrievedAnchorDistribution: number;
  releasableActionIds: (number | string)[];
  claimableActionIds?: { DepositId: number; StakeActionId: number }[];
}

const initialApiData: ApiData = {
  ETHRaffleToClaim: 0,
  ETHRaffleToClaimWei: 0,
  NumDonatedNFTToClaim: 0,
  UnretrievedAnchorDistribution: 0,
  releasableActionIds: [],
};

interface ApiDataProviderProps {
  children: ReactNode;
}

interface ApiDataContextValue {
  apiData: ApiData;
  setApiData: Dispatch<SetStateAction<ApiData>>;
  fetchData: () => Promise<void>;
  unclaimedRewards: CSTAnchorDistribution[];
  error: string | null;
  isLoading: boolean;
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
  const [error, setError] = useState<string | null>(null);

  const { cstokens: anchoredTokens } = useAnchoredToken();
  const { account } = useActiveWeb3React();

  const {
    data: redBoxData,
    refetch: refetchRedBox,
    isLoading: redBoxLoading,
  } = useNotifyRedBox(account);
  const {
    data: rewardsData,
    refetch: refetchRewards,
    isLoading: rewardsLoading,
  } = useCSTAnchorDistributionsToRetrieveByUser(account);

  const unclaimedRewards = useMemo(() => rewardsData ?? [], [rewardsData]);

  const anchoredActionIdsRef = useRef<(number | string)[]>([]);
  // eslint-disable-next-line react-hooks/refs
  anchoredActionIdsRef.current = anchoredTokens.flatMap((x) =>
    x.TokenInfo?.StakeActionId != null ? [x.TokenInfo.StakeActionId] : [],
  );

  const fetchInfo = useCallback(
    async (depositId: number) => {
      const releasableActionIds: (number | string)[] = [];
      const claimableActionIds: { DepositId: number; StakeActionId: number }[] = [];

      const response = await api.get_cst_action_ids_by_deposit_id(account!, depositId);
      if (!response) return { releasableActionIds, claimableActionIds };

      const currentAnchoredActionIds = anchoredActionIdsRef.current;
      for (const item of response) {
        try {
          if (!item.Claimed) {
            claimableActionIds.push({
              DepositId: item.DepositId,
              StakeActionId: item.StakeActionId,
            });
          }
          if (currentAnchoredActionIds.includes(item.StakeActionId)) {
            releasableActionIds.push(item.StakeActionId);
          }
        } catch (error) {
          reportError(error, 'process anchor distribution item');
        }
      }

      return { releasableActionIds, claimableActionIds };
    },
    [account],
  );

  const fetchActionIds = useCallback(
    async (list: CSTAnchorDistribution[]) => {
      let cl_actionIds: { DepositId: number; StakeActionId: number }[] = [];
      let us_actionIds: (number | string)[] = [];

      await Promise.all(
        list
          .filter((item) => item.DepositId != null)
          .map(async (item) => {
            const depositId = item.DepositId!;
            const { claimableActionIds, releasableActionIds } = await fetchInfo(depositId);
            cl_actionIds = cl_actionIds.concat(claimableActionIds);
            us_actionIds = us_actionIds.concat(releasableActionIds);
          }),
      );

      us_actionIds = us_actionIds.filter(
        (item, index) => index === us_actionIds.findIndex((o) => o === item),
      );

      return { releasableActionIds: us_actionIds, claimableActionIds: cl_actionIds };
    },
    [fetchInfo],
  );

  useEffect(() => {
    let cancelled = false;

    const processData = async () => {
      if (!account || !redBoxData) return;

      try {
        const rewardList = unclaimedRewards;
        const hasUnclaimed =
          rewardList.length > 0 && (redBoxData?.UnretrievedAnchorDistribution ?? 0) > 0;

        if (hasUnclaimed) {
          const actionIds = await fetchActionIds(rewardList);
          if (!cancelled) {
            setApiData({ ...initialApiData, ...redBoxData, ...actionIds });
            setError(null);
          }
        } else {
          if (!cancelled) {
            setApiData({
              ...initialApiData,
              ...redBoxData,
              releasableActionIds: [],
              claimableActionIds: [],
            });
            setError(null);
          }
        }
      } catch (err) {
        reportError(err, 'ApiDataContext processData');
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load winnings data');
        }
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

  const isLoading = redBoxLoading || rewardsLoading;

  return (
    <ApiDataContext.Provider
      value={{ apiData, setApiData, fetchData, unclaimedRewards, error, isLoading }}
    >
      {children}
    </ApiDataContext.Provider>
  );
};
