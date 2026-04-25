import { stakingWalletCstAbi } from '@/contracts/abis';

import { ANCHORING_WALLET_CST_ADDRESS } from '@/config/networks';

import useContract from './useContract';

export default function useAnchoringWalletCSTContract() {
  return useContract(ANCHORING_WALLET_CST_ADDRESS, stakingWalletCstAbi);
}
