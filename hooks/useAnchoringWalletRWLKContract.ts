import { stakingWalletRwlkAbi } from '@/contracts/abis';

import { ANCHORING_WALLET_RWLK_ADDRESS } from '@/config/networks';

import useContract from './useContract';

export default function useAnchoringWalletRWLKContract() {
  return useContract(ANCHORING_WALLET_RWLK_ADDRESS, stakingWalletRwlkAbi);
}
