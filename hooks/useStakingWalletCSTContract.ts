import { stakingWalletCstAbi } from '@/contracts/abis';

import { STAKING_WALLET_CST_ADDRESS } from '@/config/networks';

import useContract from './useContract';

export default function useStakingWalletCSTContract() {
  return useContract(STAKING_WALLET_CST_ADDRESS, stakingWalletCstAbi);
}
