'use client';

import { createContext, useContext, type Dispatch, type SetStateAction } from 'react';

import type { AnchoredTokenInfo, CSTAnchorDistribution } from '@/services/api/types';

/*
 * The connected wallet's data contexts, with no reader attached: the reads
 * (the API client, its schemas and queries) live in AnchoredTokenProvider
 * and ApiDataProvider, which the app shell loads only while a wallet is
 * connected (AccountDataProvider). Components read them through
 * `useAnchoredToken` and `useApiData`, from here or from the provider modules.
 */

export interface AnchoredTokenContextValue {
  cstokens: AnchoredTokenInfo[];
  rwlktokens: AnchoredTokenInfo[];
  fetchData: () => Promise<void>;
  error: string | null;
  isLoading: boolean;
  /**
   * A collection's list could not be read (and nothing was read before): its
   * empty array is then unknown, not "nothing anchored".
   */
  cstFailed: boolean;
  rwlkFailed: boolean;
}

export const AnchoredTokenContext = createContext<AnchoredTokenContextValue | undefined>(undefined);

export const useAnchoredToken = (): AnchoredTokenContextValue => {
  const context = useContext(AnchoredTokenContext);
  if (!context) {
    throw new Error('useAnchoredToken must be used within a AnchoredTokenProvider');
  }
  return context;
};

export interface ApiData {
  ETHRaffleToClaim: number;
  ETHRaffleToClaimWei: number;
  NumDonatedNFTToClaim: number;
  UnretrievedAnchorDistribution: number;
  releasableActionIds: (number | string)[];
  claimableActionIds?: { DepositId: number; StakeActionId: number }[];
}

export const initialApiData: ApiData = {
  ETHRaffleToClaim: 0,
  ETHRaffleToClaimWei: 0,
  NumDonatedNFTToClaim: 0,
  UnretrievedAnchorDistribution: 0,
  releasableActionIds: [],
};

export interface ApiDataContextValue {
  apiData: ApiData;
  setApiData: Dispatch<SetStateAction<ApiData>>;
  fetchData: () => Promise<void>;
  unclaimedRewards: CSTAnchorDistribution[];
  error: string | null;
  isLoading: boolean;
  /**
   * The wallet's unretrieved Anchor Distribution ETH, straight from its read
   * rather than from `apiData` (which holds 0 until processing finishes):
   * `undefined` while the notice or the reward list is loading, `null` when
   * either could not be read (a failed request, no notice in the payload, or a
   * notice without the figure), so a page never shows a confident 0 or says
   * "nothing waiting" on a guess. A wallet the indexer has not seen yet gets a
   * notice of zeros from `notify_red_box`, so it reads as 0, not as unknown.
   */
  unretrievedAnchorEth: number | null | undefined;
  /** Reads the notice and the reward list again. */
  retryAnchorRead: () => void;
}

export const ApiDataContext = createContext<ApiDataContextValue | undefined>(undefined);

export const useApiData = (): ApiDataContextValue => {
  const context = useContext(ApiDataContext);
  if (!context) {
    throw new Error('useApiData must be used within an ApiDataProvider');
  }
  return context;
};

const noop = async () => {};

/** No wallet connected: nothing anchored, nothing to retrieve. */
export const DISCONNECTED_ANCHORED_TOKENS: AnchoredTokenContextValue = {
  cstokens: [],
  rwlktokens: [],
  fetchData: noop,
  error: null,
  isLoading: false,
  cstFailed: false,
  rwlkFailed: false,
};

/** No wallet connected: the empty retrieval status. */
export const DISCONNECTED_API_DATA: ApiDataContextValue = {
  apiData: initialApiData,
  setApiData: () => {},
  fetchData: noop,
  unclaimedRewards: [],
  error: null,
  isLoading: false,
  unretrievedAnchorEth: 0,
  retryAnchorRead: () => {},
};
