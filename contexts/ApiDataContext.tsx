import { useState, useCallback, useMemo, useRef, useEffect, type ReactNode } from 'react';

import { useActiveWeb3React } from '@/hooks/web3';
import api from '@/services/api';
import type { CSTAnchorDistribution } from '@/services/api/types';
import { useNotifyRedBox, useCSTAnchorDistributionsToRetrieveByUser } from '@/hooks/useApiQuery';
import { reportError } from '@/utils/errors';
import { toFiniteNumber } from '@/utils/finiteNumber';

import { ApiDataContext, initialApiData, useApiData, type ApiData } from './accountDataContexts';
import { useAnchoredToken } from './AnchoredTokenContext';

export { useApiData };
export type { ApiData, ApiDataContextValue } from './accountDataContexts';

interface ApiDataProviderProps {
  children: ReactNode;
}

export const ApiDataProvider = ({ children }: ApiDataProviderProps) => {
  const [apiData, setApiData] = useState<ApiData>(initialApiData);
  const [error, setError] = useState<string | null>(null);

  const { cstokens: anchoredTokens } = useAnchoredToken();
  const { account } = useActiveWeb3React();

  const {
    data: redBoxData,
    refetch: refetchRedBox,
    isLoading: redBoxLoading,
    isError: redBoxFailed,
  } = useNotifyRedBox(account);
  const {
    data: rewardsData,
    refetch: refetchRewards,
    isLoading: rewardsLoading,
    isError: rewardsFailed,
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
  const anchorReadFailed =
    (redBoxFailed && redBoxData === undefined) ||
    (rewardsFailed && rewardsData === undefined) ||
    redBoxData === null;
  const unretrievedAnchorEth = anchorReadFailed
    ? null
    : isLoading || redBoxData === undefined
      ? undefined
      : toFiniteNumber(redBoxData.UnretrievedAnchorDistribution);
  const retryAnchorRead = useCallback(() => {
    void refetchRedBox();
    void refetchRewards();
  }, [refetchRedBox, refetchRewards]);

  return (
    <ApiDataContext.Provider
      value={{
        apiData,
        setApiData,
        fetchData,
        unclaimedRewards,
        error,
        isLoading,
        unretrievedAnchorEth,
        retryAnchorRead,
      }}
    >
      {children}
    </ApiDataContext.Provider>
  );
};
